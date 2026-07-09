DROP TABLE IF EXISTS silver.payments;

CREATE TABLE IF NOT EXISTS silver.payments
(
    order_id VARCHAR(50),

    payment_sequential INTEGER,

    payment_type VARCHAR(50),

    payment_installments INTEGER,

    payment_value NUMERIC,

    source_batch_id BIGINT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO silver.payments
(
    order_id,
    payment_sequential,
    payment_type,
    payment_installments,
    payment_value,
    source_batch_id
)
SELECT
    order_id,
    payment_sequential,
    UPPER(payment_type),
    payment_installments,
    payment_value,
    batch_id
FROM bronze.payments_raw;

SELECT COUNT(*) AS payment_count
FROM silver.payments;