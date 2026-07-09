DROP TABLE IF EXISTS silver.orders;

CREATE TABLE IF NOT EXISTS silver.orders
(
    order_id VARCHAR(50) PRIMARY KEY,

    customer_id VARCHAR(50),

    order_status VARCHAR(50),

    order_purchase_timestamp TIMESTAMP,

    order_approved_at TIMESTAMP,

    order_delivered_carrier_date TIMESTAMP,

    order_delivered_customer_date TIMESTAMP,

    order_estimated_delivery_date TIMESTAMP,

    source_batch_id BIGINT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO silver.orders
(
    order_id,
    customer_id,
    order_status,
    order_purchase_timestamp,
    order_approved_at,
    order_delivered_carrier_date,
    order_delivered_customer_date,
    order_estimated_delivery_date,
    source_batch_id
)
SELECT
    order_id,
    customer_id,
    UPPER(order_status),
    order_purchase_timestamp,
    order_approved_at,
    order_delivered_carrier_date,
    order_delivered_customer_date,
    order_estimated_delivery_date,
    batch_id
FROM bronze.orders_raw;

SELECT COUNT(*) AS order_count
FROM silver.orders;