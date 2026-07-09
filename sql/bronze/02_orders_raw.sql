CREATE TABLE IF NOT EXISTS bronze.orders_raw
(
    order_id VARCHAR(50),
    customer_id VARCHAR(50),

    order_status VARCHAR(50),

    order_purchase_timestamp TIMESTAMP,
    order_approved_at TIMESTAMP,

    order_delivered_carrier_date TIMESTAMP,
    order_delivered_customer_date TIMESTAMP,

    order_estimated_delivery_date TIMESTAMP,

    load_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_system VARCHAR(50),
    batch_id BIGINT
);