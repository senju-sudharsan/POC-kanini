print("SCRIPT STARTED") 
from utils.db import get_connection


def run_incremental_load():

    conn = get_connection()

    try:
        cur = conn.cursor()

        cur.execute("""
            SELECT last_batch_id
            FROM metadata.load_tracker
            WHERE table_name = 'customers';
        """)

        last_batch = cur.fetchone()[0]

        print(f"Last Processed Batch: {last_batch}")

        cur.execute("""
            SELECT COUNT(*)
            FROM bronze.customers_raw
            WHERE batch_id > %s;
        """, (last_batch,))

        new_rows = cur.fetchone()[0]

        print(f"New Records Found: {new_rows}")

        if new_rows == 0:
            print("No new data available.")
            return

        cur.execute("""
            INSERT INTO silver.customers
            (
                customer_id,
                customer_unique_id,
                customer_zip_code_prefix,
                customer_city,
                customer_state,
                source_batch_id
            )
            SELECT
                customer_id,
                customer_unique_id,
                customer_zip_code_prefix,
                UPPER(customer_city),
                UPPER(customer_state),
                batch_id
            FROM bronze.customers_raw
            WHERE batch_id > %s;
        """, (last_batch,))

        cur.execute("""
            SELECT MAX(batch_id)
            FROM bronze.customers_raw;
        """)

        latest_batch = cur.fetchone()[0]

        cur.execute("""
            UPDATE metadata.load_tracker
            SET
                last_batch_id = %s,
                last_run_time = CURRENT_TIMESTAMP
            WHERE table_name = 'customers';
        """, (latest_batch,))

        conn.commit()

        print(f"Inserted {new_rows} records.")
        print(f"Tracker Updated to Batch {latest_batch}")

    except Exception as e:

        conn.rollback()
        print(e)

    finally:

        cur.close()
        conn.close()


if __name__ == "__main__":
    run_incremental_load()
