-- SCD Summary Metrics

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
    ) AS multi_version_customers
FROM silver.customers_scd;