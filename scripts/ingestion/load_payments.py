import pandas as pd
from sqlalchemy import create_engine, text

engine = create_engine(
    "postgresql+psycopg2://postgres:postgres@localhost:5433/de_poc"
)

# STEP 1: CREATE BATCH RECORD
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
                'payments_ingestion',
                'RUNNING'
            )
            RETURNING batch_id
        """)
    )

    batch_id = result.scalar()

print(f"Batch Created: {batch_id}")

# STEP 2: READ CSV
df = pd.read_csv(
    "data/raw/olist_order_payments_dataset.csv",
    dtype=str
)

# STEP 3: ADD METADATA
df["source_system"] = "OLIST_CSV"
df["batch_id"] = batch_id

# STEP 4: LOAD TO BRONZE
df.to_sql(
    name="payments_raw",
    schema="bronze",
    con=engine,
    if_exists="append",
    index=False
)

# STEP 5: MARK SUCCESS
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