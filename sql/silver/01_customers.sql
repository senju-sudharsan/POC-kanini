DROP TABLE IF EXISTS silver.customers;

CREATE TABLE IF NOT EXISTS silver.customers
(
    customer_id VARCHAR(50) PRIMARY KEY,

    customer_unique_id VARCHAR(50),

    customer_zip_code_prefix VARCHAR(20),

    customer_city VARCHAR(100),

    customer_state VARCHAR(10),

    source_batch_id BIGINT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO silver.customers
(
    customer_id,
    customer_unique_id,
    customer_zip_code_prefix,
    customer_city,
    customer_state,
    source_batch_id
)
SELECT
    customer_id,
    customer_unique_id,
    customer_zip_code_prefix,
    UPPER(customer_city),
    UPPER(customer_state),
    batch_id
FROM bronze.customers_raw;

SELECT COUNT(*) AS customer_count
FROM silver.customers;