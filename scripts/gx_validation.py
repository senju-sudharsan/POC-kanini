"""Reusable Great Expectations validation runner with PostgreSQL result persistence."""
import os
import time
import uuid
from pathlib import Path

import great_expectations as gx
from sqlalchemy import create_engine, text

ROOT = Path(__file__).resolve().parents[1]
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:postgres@de_poc_postgres:5432/de_poc")

DATASETS = {
    "customers": {"table": "customers", "schema": "silver", "unique": "customer_id", "numeric": None, "references": None},
    "orders": {"table": "orders", "schema": "silver", "unique": "order_id", "numeric": None, "references": ("customer_id", "customers", "customer_id")},
    "products": {"table": "products", "schema": "silver", "unique": "product_id", "numeric": "product_weight_g", "references": None},
    "payments": {"table": "payments", "schema": "silver", "unique": ("order_id", "payment_sequential"), "numeric": "payment_value", "references": ("order_id", "orders", "order_id")},
}


def _reference_values(engine, table: str, column: str) -> list[str]:
    with engine.connect() as connection:
        return [str(row[0]) for row in connection.execute(text(f"SELECT DISTINCT {column} FROM silver.{table} WHERE {column} IS NOT NULL"))]


def _ensure_history_schema(engine) -> None:
    """Make the runner safe for existing databases before formal migrations are applied."""
    with engine.begin() as connection:
        connection.execute(text("""
            CREATE TABLE IF NOT EXISTS metadata.gx_validation_runs (
              run_id UUID PRIMARY KEY, suite_name VARCHAR(200) NOT NULL, datasource VARCHAR(200) NOT NULL,
              expectation_count INTEGER NOT NULL DEFAULT 0, passed_count INTEGER NOT NULL DEFAULT 0,
              failed_count INTEGER NOT NULL DEFAULT 0, success_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
              execution_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, execution_duration_ms INTEGER,
              batch_id BIGINT REFERENCES metadata.batch_control(batch_id), status VARCHAR(20) NOT NULL DEFAULT 'running'
            )
        """))
        connection.execute(text("ALTER TABLE metadata.gx_validation_results ADD COLUMN IF NOT EXISTS run_id UUID"))
        connection.execute(text("ALTER TABLE metadata.gx_validation_results ADD COLUMN IF NOT EXISTS suite_name VARCHAR(200)"))


def _record_results(engine, run_id: str, suite_name: str, dataset: str, batch_id: int | None, validation_result) -> tuple[int, int]:
    rows = []
    for result in validation_result["results"]:
        details = result.get("result", {})
        unexpected = int(details.get("unexpected_count") or 0)
        percent = details.get("unexpected_percent")
        success_percent = 100 if result["success"] else max(0, round(100 - float(percent or 100), 2))
        rows.append({
            "dataset": dataset,
            "run_id": run_id,
            "suite_name": suite_name,
            "expectation": result["expectation_config"]["expectation_type"],
            "success": result["success"],
            "unexpected": unexpected,
            "success_percent": success_percent,
            "batch_id": batch_id,
        })
    with engine.begin() as connection:
        connection.execute(text("""
            INSERT INTO metadata.gx_validation_results
                (run_id, suite_name, dataset_name, expectation_name, success, unexpected_count, success_percent, batch_id)
            VALUES (:run_id, :suite_name, :dataset, :expectation, :success, :unexpected, :success_percent, :batch_id)
        """), rows)
    return len(rows), sum(1 for row in rows if row["success"])


def main() -> None:
    engine = create_engine(DATABASE_URL)
    _ensure_history_schema(engine)
    run_id = str(uuid.uuid4())
    started = time.perf_counter()
    with engine.connect() as connection:
        batch_id = connection.execute(text("SELECT MAX(batch_id) FROM metadata.batch_control")).scalar()
    datasource_name = "warehouse_postgres"
    suite_name = "warehouse_validation"
    with engine.begin() as connection:
        connection.execute(text("""INSERT INTO metadata.gx_validation_runs
            (run_id, suite_name, datasource, batch_id) VALUES (:run_id, :suite_name, :datasource, :batch_id)"""),
            {"run_id": run_id, "suite_name": suite_name, "datasource": datasource_name, "batch_id": batch_id})
    total = passed = 0
    try:
        context = gx.get_context(context_root_dir=str(ROOT / "great_expectations"))
        try:
            datasource = context.get_datasource(datasource_name)
        except Exception:
            datasource = context.sources.add_sql(name=datasource_name, connection_string=DATABASE_URL)

        for dataset, definition in DATASETS.items():
            asset_name = f"{dataset}_asset"
            try:
                asset = datasource.get_asset(asset_name)
            except Exception:
                asset = datasource.add_table_asset(name=asset_name, table_name=definition["table"], schema_name=definition["schema"])
            suite = context.add_or_update_expectation_suite(expectation_suite_name=f"{dataset}_suite")
            validator = context.get_validator(batch_request=asset.build_batch_request(), expectation_suite=suite)
            unique_columns = definition["unique"] if isinstance(definition["unique"], tuple) else (definition["unique"],)
            for column in unique_columns:
                validator.expect_column_values_to_not_be_null(column)
            if len(unique_columns) == 1:
                validator.expect_column_values_to_be_unique(unique_columns[0])
            else:
                validator.expect_compound_columns_to_be_unique(list(unique_columns))
            validator.expect_table_row_count_to_be_between(min_value=1)
            if definition["numeric"]:
                validator.expect_column_values_to_be_between(definition["numeric"], min_value=0, strict_min=True)
            if definition["references"]:
                column, parent_table, parent_column = definition["references"]
                validator.expect_column_values_to_be_in_set(column, _reference_values(engine, parent_table, parent_column))
            validator.save_expectation_suite(discard_failed_expectations=False)
            result = validator.validate()
            count, successful = _record_results(engine, run_id, f"{dataset}_suite", dataset, batch_id, result)
            total += count
            passed += successful
            print(f"{dataset}_checkpoint: {'PASSED' if result['success'] else 'FAILED'}")
    except Exception:
        with engine.begin() as connection:
            connection.execute(text("""UPDATE metadata.gx_validation_runs SET expectation_count=:total, passed_count=:passed,
                failed_count=:failed, success_percentage=:rate, execution_duration_ms=:duration, status='failed' WHERE run_id=:run_id"""),
                {"run_id": run_id, "total": total, "passed": passed, "failed": total - passed, "rate": round(100 * passed / total, 2) if total else 0, "duration": round((time.perf_counter() - started) * 1000), "run_id": run_id})
        raise
    else:
        with engine.begin() as connection:
            connection.execute(text("""UPDATE metadata.gx_validation_runs SET expectation_count=:total, passed_count=:passed,
                failed_count=:failed, success_percentage=:rate, execution_duration_ms=:duration, status='completed' WHERE run_id=:run_id"""),
                {"run_id": run_id, "total": total, "passed": passed, "failed": total - passed, "rate": round(100 * passed / total, 2) if total else 0, "duration": round((time.perf_counter() - started) * 1000), "run_id": run_id})


if __name__ == "__main__":
    main()
