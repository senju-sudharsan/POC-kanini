CREATE TABLE IF NOT EXISTS bronze.order_items_raw
(
    order_id VARCHAR(50),
    order_item_id INTEGER,

    product_id VARCHAR(50),
    seller_id VARCHAR(50),

    shipping_limit_date TIMESTAMP,

    price NUMERIC(10,2),
    freight_value NUMERIC(10,2),

    load_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_system VARCHAR(50),
    batch_id BIGINT
);