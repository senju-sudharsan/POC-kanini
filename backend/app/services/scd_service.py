from app.database.db import get_connection
from app.schemas.scd import CustomerSCDHistory, CustomerSCDVersion, SCDSummary


def get_scd_summary() -> SCDSummary:
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            """
            SELECT
                COUNT(*) AS total_records,
                COUNT(*) FILTER (WHERE is_current) AS active_records,
                COUNT(*) FILTER (WHERE NOT is_current) AS historical_records,
                COUNT(DISTINCT customer_id) FILTER (
                    WHERE customer_id IN (
                        SELECT customer_id
                        FROM silver.customers_scd
                        GROUP BY customer_id
                        HAVING COUNT(*) > 1
                    )
                ) AS customers_with_multiple_versions,
                MAX(effective_start_date) AS latest_update_timestamp
            FROM silver.customers_scd
            """
        )
        (
            total_records,
            active_records,
            historical_records,
            customers_with_multiple_versions,
            latest_update_timestamp,
        ) = cursor.fetchone()
        return SCDSummary(
            totalRecords=int(total_records or 0),
            activeRecords=int(active_records or 0),
            historicalRecords=int(historical_records or 0),
            customersWithMultipleVersions=int(customers_with_multiple_versions or 0),
            latestUpdateTimestamp=latest_update_timestamp,
        )
    finally:
        cursor.close()
        connection.close()


def get_customer_scd_history(customer_id: str) -> CustomerSCDHistory | None:
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            """
            SELECT
                customer_id,
                customer_city,
                customer_state,
                effective_start_date,
                effective_end_date,
                is_current,
                version_number
            FROM silver.customers_scd
            WHERE customer_id = %s
            ORDER BY version_number
            """,
            (customer_id,),
        )
        rows = cursor.fetchall()
        if not rows:
            return None

        return CustomerSCDHistory(
            customerId=customer_id,
            versions=[
                CustomerSCDVersion(
                    customerId=row_customer_id,
                    customerCity=customer_city,
                    customerState=customer_state,
                    effectiveStartDate=effective_start_date,
                    effectiveEndDate=effective_end_date,
                    isCurrent=is_current,
                    versionNumber=version_number,
                )
                for (
                    row_customer_id,
                    customer_city,
                    customer_state,
                    effective_start_date,
                    effective_end_date,
                    is_current,
                    version_number,
                ) in rows
            ],
        )
    finally:
        cursor.close()
        connection.close()
