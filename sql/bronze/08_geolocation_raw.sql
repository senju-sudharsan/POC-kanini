CREATE TABLE IF NOT EXISTS bronze.geolocation_raw
(
    geolocation_zip_code_prefix INTEGER,

    geolocation_lat NUMERIC(12,8),
    geolocation_lng NUMERIC(12,8),

    geolocation_city VARCHAR(100),
    geolocation_state VARCHAR(10),

    load_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_system VARCHAR(50),
    batch_id BIGINT
);