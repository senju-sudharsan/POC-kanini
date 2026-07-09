CREATE TABLE IF NOT EXISTS bronze.products_raw
(
    product_id VARCHAR(50),

    product_category_name VARCHAR(255),

    product_name_length INTEGER,
    product_description_length INTEGER,

    product_photos_qty INTEGER,

    product_weight_g INTEGER,

    product_length_cm INTEGER,
    product_height_cm INTEGER,
    product_width_cm INTEGER,

    load_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_system VARCHAR(50),
    batch_id BIGINT
);