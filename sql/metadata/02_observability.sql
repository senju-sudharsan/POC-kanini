CREATE TABLE IF NOT EXISTS metadata.gx_validation_results (
    validation_id BIGSERIAL PRIMARY KEY,
    run_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dataset_name VARCHAR(100) NOT NULL,
    expectation_name TEXT NOT NULL,
    success BOOLEAN NOT NULL,
    unexpected_count INTEGER NOT NULL DEFAULT 0,
    success_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    batch_id BIGINT REFERENCES metadata.batch_control(batch_id)
);

CREATE INDEX IF NOT EXISTS ix_gx_validation_results_dataset_run
    ON metadata.gx_validation_results (dataset_name, run_timestamp DESC);
CREATE INDEX IF NOT EXISTS ix_gx_validation_results_batch
    ON metadata.gx_validation_results (batch_id);

CREATE TABLE IF NOT EXISTS metadata.source_load_audit (
    source_load_id BIGSERIAL PRIMARY KEY,
    source_name VARCHAR(100) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    records_loaded INTEGER NOT NULL DEFAULT 0,
    last_load_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    batch_id BIGINT REFERENCES metadata.batch_control(batch_id),
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS ix_source_load_audit_source_time
    ON metadata.source_load_audit (source_name, last_load_time DESC);
