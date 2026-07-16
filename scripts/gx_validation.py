"""Reusable Great Expectations validation runner with PostgreSQL result persistence."""
import os
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


def _record_results(engine, dataset: str, batch_id: int | None, validation_result) -> None:
    rows = []
    for result in validation_result["results"]:
        details = result.get("result", {})
        unexpected = int(details.get("unexpected_count") or 0)
        percent = details.get("unexpected_percent")
        success_percent = 100 if result["success"] else max(0, round(100 - float(percent or 100), 2))
        rows.append({
            "dataset": dataset,
            "expectation": result["expectation_config"]["expectation_type"],
            "success": result["success"],
            "unexpected": unexpected,
            "success_percent": success_percent,
            "batch_id": batch_id,
        })
    with engine.begin() as connection:
        connection.execute(text("""
            INSERT INTO metadata.gx_validation_results
                (dataset_name, expectation_name, success, unexpected_count, success_percent, batch_id)
            VALUES (:dataset, :expectation, :success, :unexpected, :success_percent, :batch_id)
        """), rows)


def main() -> None:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        batch_id = connection.execute(text("SELECT MAX(batch_id) FROM metadata.batch_control")).scalar()
    context = gx.get_context(context_root_dir=str(ROOT / "great_expectations"))
    datasource_name = "warehouse_postgres"
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
        _record_results(engine, dataset, batch_id, result)
        print(f"{dataset}_checkpoint: {'PASSED' if result['success'] else 'FAILED'}")


if __name__ == "__main__":
    main()
