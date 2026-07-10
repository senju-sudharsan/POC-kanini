from datetime import datetime

from utils.db import get_connection


def initial_load():
    """
    Loads customers into SCD table for first time.
    """

    conn = get_connection()

    try:
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO silver.customer_scd
            (
                customer_id,
                customer_unique_id,
                customer_zip_code_prefix,
                customer_city,
                customer_state,
                effective_start_date,
                current_flag,
                version_number,
                source_batch_id
            )
            SELECT
                customer_id,
                customer_unique_id,
                customer_zip_code_prefix,
                customer_city,
                customer_state,
                CURRENT_TIMESTAMP,
                'Y',
                1,
                source_batch_id
            FROM silver.customers
            WHERE customer_id NOT IN
            (
                SELECT customer_id
                FROM silver.customer_scd
            );
        """)

        conn.commit()

        print("Initial SCD load completed.")

    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")

    finally:
        cur.close()
        conn.close()


def scd_type1():
    """
    Overwrite customer attributes.
    No history maintained.
    """

    conn = get_connection()

    try:
        cur = conn.cursor()

        cur.execute("""
            UPDATE silver.customer_scd scd
            SET
                customer_city = src.customer_city,
                customer_state = src.customer_state,
                customer_zip_code_prefix = src.customer_zip_code_prefix
            FROM silver.customers src
            WHERE scd.customer_id = src.customer_id
            AND scd.current_flag = 'Y';
        """)

        conn.commit()

        print("SCD Type 1 completed.")

    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")

    finally:
        cur.close()
        conn.close()


def scd_type2():
    """
    Detect changes and preserve history.
    """

    conn = get_connection()

    try:
        cur = conn.cursor()

        cur.execute("""
            SELECT
                src.customer_id,
                src.customer_unique_id,
                src.customer_zip_code_prefix,
                src.customer_city,
                src.customer_state,
                src.source_batch_id,
                scd.version_number
            FROM silver.customers src
            JOIN silver.customer_scd scd
                ON src.customer_id = scd.customer_id
            WHERE scd.current_flag = 'Y'
            AND (
                COALESCE(src.customer_city,'') <> COALESCE(scd.customer_city,'')
                OR
                COALESCE(src.customer_state,'') <> COALESCE(scd.customer_state,'')
                OR
                COALESCE(src.customer_zip_code_prefix,'') <> COALESCE(scd.customer_zip_code_prefix,'')
            );
        """)

        changed_rows = cur.fetchall()

        for row in changed_rows:

            customer_id = row[0]

            cur.execute("""
                UPDATE silver.customer_scd
                SET
                    current_flag = 'N',
                    effective_end_date = CURRENT_TIMESTAMP
                WHERE customer_id = %s
                AND current_flag = 'Y';
            """, (customer_id,))

            cur.execute("""
                INSERT INTO silver.customer_scd
                (
                    customer_id,
                    customer_unique_id,
                    customer_zip_code_prefix,
                    customer_city,
                    customer_state,
                    effective_start_date,
                    current_flag,
                    version_number,
                    source_batch_id
                )
                VALUES
                (
                    %s,%s,%s,%s,%s,
                    CURRENT_TIMESTAMP,
                    'Y',
                    %s,
                    %s
                );
            """,
            (
                row[0],
                row[1],
                row[2],
                row[3],
                row[4],
                row[6] + 1,
                row[5]
            ))

        conn.commit()

        print(f"SCD Type 2 completed. {len(changed_rows)} changes processed.")

    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")

    finally:
        cur.close()
        conn.close()


def main():

    print("\n=== CUSTOMER SCD PROCESS ===")
    print("1 - Initial Load")
    print("2 - SCD Type 1")
    print("3 - SCD Type 2")

    choice = input("\nSelect option: ")

    if choice == "1":
        initial_load()

    elif choice == "2":
        scd_type1()

    elif choice == "3":
        scd_type2()

    else:
        print("Invalid option")


if __name__ == "__main__":
    main()
