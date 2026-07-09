import psycopg2

DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "database": "de_poc",
    "user": "postgres",
    "password": "postgres"
}

SQL_FILES = [
    "sql/silver/01_customers.sql",
    "sql/silver/02_orders.sql",
    "sql/silver/03_products.sql",
    "sql/silver/04_sellers.sql",
    "sql/silver/05_payments.sql",
    "sql/silver/06_order_fact.sql"
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

    print("Silver Layer Completed")


if __name__ == "__main__":
    main()