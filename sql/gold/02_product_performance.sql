DROP TABLE IF EXISTS gold.product_performance;

CREATE TABLE IF NOT EXISTS gold.product_performance
(
    product_id VARCHAR(50) PRIMARY KEY,

    product_category_name VARCHAR(100),

    units_sold INTEGER,

    total_revenue NUMERIC(18,2),

    avg_price NUMERIC(18,2),

    total_orders INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO gold.product_performance
(
    product_id,
    product_category_name,
    units_sold,
    total_revenue,
    avg_price,
    total_orders
)
SELECT
    f.product_id,

    p.product_category_name,

    COUNT(*) AS units_sold,

    SUM(f.price) AS total_revenue,

    AVG(f.price) AS avg_price,

    COUNT(DISTINCT f.order_id) AS total_orders

FROM silver.order_fact f

JOIN silver.products p
    ON f.product_id = p.product_id

GROUP BY
    f.product_id,
    p.product_category_name;

SELECT COUNT(*) AS product_performance_rows
FROM gold.product_performance;