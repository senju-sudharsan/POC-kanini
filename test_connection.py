from sqlalchemy import create_engine

engine = create_engine(
    "postgresql+psycopg2://postgres:postgres@localhost:5433/de_poc"
)

with engine.connect() as conn:
    print("CONNECTED")