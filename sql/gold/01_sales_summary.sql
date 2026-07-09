DROP TABLE IF EXISTS gold.sales_summary;

CREATE TABLE IF NOT EXISTS gold.sales_summary
(
    sales_date DATE PRIMARY KEY,

    total_orders INTEGER,

    total_revenue NUMERIC(18,2),

    total_freight NUMERIC(18,2),

    avg_order_value NUMERIC(18,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO gold.sales_summary
(
    sales_date,
    total_orders,
    total_revenue,
    total_freight,
    avg_order_value
)
SELECT
    DATE(purchase_timestamp),

    COUNT(DISTINCT order_id),

    SUM(price),

    SUM(freight_value),

    SUM(price) / COUNT(DISTINCT order_id)

FROM silver.order_fact

GROUP BY DATE(purchase_timestamp);

SELECT COUNT(*) AS sales_summary_rows
FROM gold.sales_summary;