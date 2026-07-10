from sqlalchemy import create_engine

engine = create_engine(
    "postgresql+psycopg2://postgres:postgres@de_poc_postgres:5432/de_poc"
)

with engine.connect() as conn:
    print("CONNECTED")
