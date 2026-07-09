from pathlib import Path
import psycopg2

DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "database": "olist_dw",
    "user": "postgres",
    "password": "postgres"
}

SQL_FILES = [
    "sql/gold/01_sales_summary.sql",
    "sql/gold/02_product_performance.sql",
    "sql/gold/03_seller_performance.sql"
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