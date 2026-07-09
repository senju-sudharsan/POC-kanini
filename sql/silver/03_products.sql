DROP TABLE IF EXISTS silver.products;

CREATE TABLE IF NOT EXISTS silver.products
(
    product_id VARCHAR(50) PRIMARY KEY,

    product_category_name VARCHAR(100),

    product_name_length INTEGER,

    product_description_length INTEGER,

    product_photos_qty INTEGER,

    product_weight_g NUMERIC,

    product_length_cm NUMERIC,

    product_height_cm NUMERIC,

    product_width_cm NUMERIC,

    source_batch_id BIGINT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO silver.products
(
    product_id,
    product_category_name,
    product_name_length,
    product_description_length,
    product_photos_qty,
    product_weight_g,
    product_length_cm,
    product_height_cm,
    product_width_cm,
    source_batch_id
)
SELECT
    product_id,
    UPPER(product_category_name),
    product_name_lenght,
    product_description_lenght,
    product_photos_qty,
    product_weight_g,
    product_length_cm,
    product_height_cm,
    product_width_cm,
    batch_id
FROM bronze.products_raw;

SELECT COUNT(*) AS product_count
FROM silver.products;