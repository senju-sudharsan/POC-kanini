CREATE TABLE IF NOT EXISTS metadata.batch_control (
    batch_id BIGSERIAL PRIMARY KEY,
    pipeline_name VARCHAR(100) NOT NULL,
    batch_start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    batch_end_time TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    records_processed INTEGER DEFAULT 0,
    records_inserted INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_rejected INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);