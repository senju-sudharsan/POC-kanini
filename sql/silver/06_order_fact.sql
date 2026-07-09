DROP TABLE IF EXISTS silver.order_fact;

CREATE TABLE IF NOT EXISTS silver.order_fact
(
    order_id VARCHAR(50),

    order_item_id INTEGER,

    customer_id VARCHAR(50),

    product_id VARCHAR(50),

    seller_id VARCHAR(50),

    order_status VARCHAR(50),

    purchase_timestamp TIMESTAMP,

    shipping_limit_date TIMESTAMP,

    price NUMERIC(18,2),

    freight_value NUMERIC(18,2),

    source_batch_id BIGINT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO silver.order_fact
(
    order_id,
    order_item_id,
    customer_id,
    product_id,
    seller_id,
    order_status,
    purchase_timestamp,
    shipping_limit_date,
    price,
    freight_value,
    source_batch_id
)
SELECT
    oi.order_id,
    oi.order_item_id,
    o.customer_id,
    oi.product_id,
    oi.seller_id,
    o.order_status,
    o.order_purchase_timestamp,
    oi.shipping_limit_date,
    oi.price,
    oi.freight_value,
    oi.batch_id
FROM bronze.order_items_raw oi
JOIN silver.orders o
    ON oi.order_id = o.order_id;

SELECT COUNT(*) AS fact_row_count
FROM silver.order_fact;