import psycopg2

DB_CONFIG = {
    "host": "de_poc_postgres",
    "port": 5432,
    "database": "de_poc",
    "user": "postgres",
    "password": "postgres"
}

SQL_FILES = [
    "/opt/airflow/sql/silver/01_customers.sql",
    "/opt/airflow/sql/silver/02_orders.sql",
    "/opt/airflow/sql/silver/03_products.sql",
    "/opt/airflow/sql/silver/04_sellers.sql",
    "/opt/airflow/sql/silver/05_payments.sql",
    "/opt/airflow/sql/silver/06_order_fact.sql"
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
