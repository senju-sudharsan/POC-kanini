DROP TABLE IF EXISTS silver.sellers;

CREATE TABLE IF NOT EXISTS silver.sellers
(
    seller_id VARCHAR(50) PRIMARY KEY,

    seller_zip_code_prefix VARCHAR(20),

    seller_city VARCHAR(100),

    seller_state VARCHAR(10),

    source_batch_id BIGINT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO silver.sellers
(
    seller_id,
    seller_zip_code_prefix,
    seller_city,
    seller_state,
    source_batch_id
)
SELECT
    seller_id,
    seller_zip_code_prefix,
    UPPER(seller_city),
    UPPER(seller_state),
    batch_id
FROM bronze.sellers_raw;

SELECT COUNT(*) AS seller_count
FROM silver.sellers;