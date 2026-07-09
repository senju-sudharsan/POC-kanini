DROP TABLE IF EXISTS gold.seller_performance;

CREATE TABLE IF NOT EXISTS gold.seller_performance
(
    seller_id VARCHAR(50) PRIMARY KEY,

    total_orders INTEGER,

    units_sold INTEGER,

    total_revenue NUMERIC(18,2),

    avg_order_value NUMERIC(18,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO gold.seller_performance
(
    seller_id,
    total_orders,
    units_sold,
    total_revenue,
    avg_order_value
)
SELECT
    seller_id,

    COUNT(DISTINCT order_id) AS total_orders,

    COUNT(*) AS units_sold,

    SUM(price) AS total_revenue,

    AVG(price) AS avg_order_value

FROM silver.order_fact

GROUP BY seller_id;

SELECT COUNT(*) AS seller_performance_rows
FROM gold.seller_performance;