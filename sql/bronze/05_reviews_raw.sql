CREATE TABLE IF NOT EXISTS bronze.reviews_raw
(
    review_id VARCHAR(50),
    order_id VARCHAR(50),

    review_score INTEGER,

    review_comment_title TEXT,
    review_comment_message TEXT,

    review_creation_date TIMESTAMP,
    review_answer_timestamp TIMESTAMP,

    load_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_system VARCHAR(50),
    batch_id BIGINT
);