CREATE TABLE IF NOT EXISTS bronze.category_translation_raw
(
    product_category_name VARCHAR(255),
    product_category_name_english VARCHAR(255),

    load_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_system VARCHAR(50),
    batch_id BIGINT
);