import pandas as pd
from sqlalchemy import create_engine

# Read source file
df = pd.read_csv("/opt/airflow/data/raw/olist_customers_dataset.csv", dtype=str)

# Add metadata columns
df["source_system"] = "OLIST_CSV"
df["batch_id"] = 1

engine = create_engine(
    "postgresql+psycopg2://postgres:postgres@de_poc_postgres:5432/de_poc"
)

df.to_sql(
    name="customers_raw",
    schema="bronze",
    con=engine,
    if_exists="append",
    index=False
)

print(f"Loaded {len(df)} records into bronze.customers_raw")
