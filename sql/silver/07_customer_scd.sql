CREATE TABLE IF NOT EXISTS silver.customer_scd (
    customer_sk BIGSERIAL PRIMARY KEY,

    customer_id VARCHAR(50) NOT NULL,
    customer_unique_id VARCHAR(50),

    customer_zip_code_prefix VARCHAR(20),
    customer_city VARCHAR(100),
    customer_state VARCHAR(10),

    effective_start_date TIMESTAMP NOT NULL,
    effective_end_date TIMESTAMP,

    current_flag CHAR(1) DEFAULT 'Y',
    version_number INTEGER DEFAULT 1,

    source_batch_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);