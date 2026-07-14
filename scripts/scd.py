"""Apply customer Slowly Changing Dimension updates from silver.customers.

Run from the scripts directory, for example:
    python scd.py --type 1
    python scd.py --type 2
"""

from __future__ import annotations

import argparse

from utils.db import get_connection


TYPE_1_UPDATE_SQL = """
    UPDATE silver.customers_scd AS target
    SET
        customer_city = source.customer_city,
        customer_state = source.customer_state
    FROM silver.customers AS source
    WHERE target.customer_id = source.customer_id
      AND target.is_current = TRUE
      AND (
          target.customer_city IS DISTINCT FROM source.customer_city
          OR target.customer_state IS DISTINCT FROM source.customer_state
      );
"""

INSERT_NEW_CUSTOMERS_SQL = """
    INSERT INTO silver.customers_scd (
        customer_id,
        customer_city,
        customer_state,
        effective_start_date,
        effective_end_date,
        is_current,
        version_number
    )
    SELECT
        source.customer_id,
        source.customer_city,
        source.customer_state,
        CURRENT_TIMESTAMP,
        NULL,
        TRUE,
        1
    FROM silver.customers AS source
    WHERE NOT EXISTS (
        SELECT 1
        FROM silver.customers_scd AS target
        WHERE target.customer_id = source.customer_id
    );
"""

TYPE_2_EXPIRE_AND_INSERT_SQL = """
    WITH expired_rows AS (
        UPDATE silver.customers_scd AS target
        SET
            effective_end_date = CURRENT_TIMESTAMP,
            is_current = FALSE
        FROM silver.customers AS source
        WHERE target.customer_id = source.customer_id
          AND target.is_current = TRUE
          AND (
              target.customer_city IS DISTINCT FROM source.customer_city
              OR target.customer_state IS DISTINCT FROM source.customer_state
          )
        RETURNING target.customer_id, target.version_number
    )
    INSERT INTO silver.customers_scd (
        customer_id,
        customer_city,
        customer_state,
        effective_start_date,
        effective_end_date,
        is_current,
        version_number
    )
    SELECT
        source.customer_id,
        source.customer_city,
        source.customer_state,
        CURRENT_TIMESTAMP,
        NULL,
        TRUE,
        expired_rows.version_number + 1
    FROM expired_rows
    JOIN silver.customers AS source
      ON source.customer_id = expired_rows.customer_id;
"""


def _execute(cursor, statement: str) -> int:
    cursor.execute(statement)
    return cursor.rowcount


def run_scd_type_1() -> tuple[int, int]:
    """Overwrite current city and state values; do not create history versions."""
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            updated = _execute(cursor, TYPE_1_UPDATE_SQL)
            inserted = _execute(cursor, INSERT_NEW_CUSTOMERS_SQL)
        connection.commit()
        return updated, inserted
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def run_scd_type_2() -> tuple[int, int]:
    """Expire changed current rows and add a new current version for each."""
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            versioned = _execute(cursor, TYPE_2_EXPIRE_AND_INSERT_SQL)
            inserted = _execute(cursor, INSERT_NEW_CUSTOMERS_SQL)
        connection.commit()
        return versioned, inserted
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Apply customer SCD updates from silver.customers.")
    parser.add_argument("--type", choices=("1", "2"), required=True, help="SCD strategy to apply.")
    args = parser.parse_args()

    if args.type == "1":
        updated, inserted = run_scd_type_1()
        print(f"SCD Type 1 complete: {updated} current rows overwritten, {inserted} customers inserted.")
        return

    versioned, inserted = run_scd_type_2()
    print(f"SCD Type 2 complete: {versioned} customer versions created, {inserted} customers inserted.")


if __name__ == "__main__":
    main()
