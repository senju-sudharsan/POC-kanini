from pathlib import Path
import psycopg2

DB_CONFIG = {
    "host": "de_poc_postgres",
    "port": 5432,
    "database": "de_poc",
    "user": "postgres",
    "password": "postgres"
}

SQL_FILES = [
    "/opt/airflow/sql/gold/01_sales_summary.sql",
    "/opt/airflow/sql/gold/02_product_performance.sql",
    "/opt/airflow/sql/gold/03_seller_performance.sql",
]

def execute_sql_file(cursor, file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        sql = f.read()

    cursor.execute(sql)


def main():
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = True

    cursor = conn.cursor()

    for file in SQL_FILES:
        print(f"Executing: {file}")
        execute_sql_file(cursor, file)

    cursor.close()
    conn.close()

    print("Gold Layer Completed")


if __name__ == "__main__":
    main()
