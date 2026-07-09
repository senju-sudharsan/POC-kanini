CREATE TABLE IF NOT EXISTS bronze.payments_raw
(
    order_id VARCHAR(50),

    payment_sequential INTEGER,
    payment_type VARCHAR(50),

    payment_installments INTEGER,
    payment_value NUMERIC(10,2),

    load_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_system VARCHAR(50),
    batch_id BIGINT
);