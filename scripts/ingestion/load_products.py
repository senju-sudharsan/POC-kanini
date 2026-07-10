import pandas as pd
from sqlalchemy import create_engine, text

engine = create_engine(
    "postgresql+psycopg2://postgres:postgres@de_poc_postgres:5432/de_poc"
)

with engine.begin() as conn:
    result = conn.execute(
        text("""
            INSERT INTO metadata.batch_control
            (
                pipeline_name,
                status
            )
            VALUES
            (
                'products_ingestion',
                'RUNNING'
            )
            RETURNING batch_id
        """)
    )

    batch_id = result.scalar()

print(f"Batch Created: {batch_id}")

df = pd.read_csv(
    "/opt/airflow/data/raw/olist_products_dataset.csv",
    dtype=str
)

df["source_system"] = "OLIST_CSV"
df["batch_id"] = batch_id

df.to_sql(
    name="products_raw",
    schema="bronze",
    con=engine,
    if_exists="append",
    index=False
)

with engine.begin() as conn:
    conn.execute(
        text("""
            UPDATE metadata.batch_control
            SET
                status = 'SUCCESS',
                batch_end_time = CURRENT_TIMESTAMP,
                records_processed = :records
            WHERE batch_id = :batch_id
        """),
        {
            "records": len(df),
            "batch_id": batch_id
        }
    )

print(f"Loaded {len(df)} rows")
print(f"Batch {batch_id} completed successfully")
