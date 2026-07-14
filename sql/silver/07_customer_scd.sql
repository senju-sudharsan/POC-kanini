CREATE TABLE IF NOT EXISTS silver.customers_scd (
    customer_id VARCHAR(50) NOT NULL,
    customer_city VARCHAR(100),
    customer_state VARCHAR(10),
    effective_start_date TIMESTAMP NOT NULL,
    effective_end_date TIMESTAMP,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    version_number INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT customers_scd_version_positive CHECK (version_number > 0),
    CONSTRAINT customers_scd_effective_dates_valid CHECK (
        effective_end_date IS NULL OR effective_end_date >= effective_start_date
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS customers_scd_current_customer_id_idx
    ON silver.customers_scd (customer_id)
    WHERE is_current;

CREATE INDEX IF NOT EXISTS customers_scd_customer_version_idx
    ON silver.customers_scd (customer_id, version_number);
