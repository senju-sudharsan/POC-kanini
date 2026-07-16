CREATE TABLE IF NOT EXISTS bronze.api_customers_raw (
    customer_id VARCHAR(50) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    load_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source_system VARCHAR(50) NOT NULL DEFAULT 'SYNTHETIC_API',
    batch_id BIGINT
);

CREATE TABLE IF NOT EXISTS bronze.api_products_raw (
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    stock_quantity INTEGER NOT NULL,
    load_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source_system VARCHAR(50) NOT NULL DEFAULT 'SYNTHETIC_API',
    batch_id BIGINT
);

CREATE TABLE IF NOT EXISTS bronze.api_orders_raw (
    order_id VARCHAR(50) NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    order_status VARCHAR(30) NOT NULL,
    quantity INTEGER NOT NULL,
    order_total NUMERIC(12,2) NOT NULL,
    order_timestamp TIMESTAMPTZ NOT NULL,
    load_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source_system VARCHAR(50) NOT NULL DEFAULT 'SYNTHETIC_API',
    batch_id BIGINT
);
