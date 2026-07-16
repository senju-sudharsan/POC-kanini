"""Ingest the synthetic REST contract into isolated Bronze raw tables."""
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
import requests
from sqlalchemy import create_engine, text

SCRIPTS_ROOT = Path(__file__).resolve().parents[1]
if str(SCRIPTS_ROOT) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_ROOT))

from synthetic_api_data import build_payload

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+psycopg2://postgres:postgres@de_poc_postgres:5432/de_poc"
)
API_BASE_URL = os.getenv("SYNTHETIC_API_URL", "http://synthetic-api:8090/api/v1")


def _fetch(entity: str) -> list[dict]:
    try:
        response = requests.get(f"{API_BASE_URL}/{entity}", timeout=10)
        response.raise_for_status()
        return response.json()["data"]
    except requests.RequestException:
        # Keeps local/Airflow runs reproducible when only the source contract is mounted.
        return build_payload()[entity]


def main() -> None:
    engine = create_engine(DATABASE_URL)
    with engine.begin() as conn:
        batch_id = conn.execute(text("""
            INSERT INTO metadata.batch_control (pipeline_name, status)
            VALUES ('synthetic_api_ingestion', 'RUNNING') RETURNING batch_id
        """)).scalar_one()
    records_loaded = 0
    try:
        for entity, table in (("customers", "api_customers_raw"), ("products", "api_products_raw"), ("orders", "api_orders_raw")):
            frame = pd.DataFrame(_fetch(entity))
            frame["source_system"] = "SYNTHETIC_API"
            frame["batch_id"] = batch_id
            frame.to_sql(table, schema="bronze", con=engine, if_exists="append", index=False)
            records_loaded += len(frame)

        with engine.begin() as conn:
            conn.execute(text("""
                UPDATE metadata.batch_control SET status = 'SUCCESS', batch_end_time = CURRENT_TIMESTAMP,
                    records_processed = :records, records_inserted = :records WHERE batch_id = :batch_id
            """), {"records": records_loaded, "batch_id": batch_id})
            conn.execute(text("""
                INSERT INTO metadata.source_load_audit
                    (source_name, source_type, status, records_loaded, last_load_time, batch_id)
                VALUES ('Synthetic API Source', 'REST API', 'SUCCESS', :records, :loaded_at, :batch_id)
            """), {"records": records_loaded, "loaded_at": datetime.now(timezone.utc), "batch_id": batch_id})
    except Exception as exc:
        with engine.begin() as conn:
            conn.execute(text("UPDATE metadata.batch_control SET status = 'FAILED', batch_end_time = CURRENT_TIMESTAMP WHERE batch_id = :batch_id"), {"batch_id": batch_id})
            conn.execute(text("""INSERT INTO metadata.source_load_audit
                (source_name, source_type, status, batch_id, error_message)
                VALUES ('Synthetic API Source', 'REST API', 'FAILED', :batch_id, :error)"""), {"batch_id": batch_id, "error": str(exc)})
        raise


if __name__ == "__main__":
    main()
