-- SCD Type 2 Validation / Proof Query

SELECT
    customer_id,
    customer_city,
    version_number,
    is_current,
    effective_start_date,
    effective_end_date
FROM silver.customers_scd
WHERE customer_id IN (
    '00012a2ce6f8dcda20d059ce98491703',
    '000161a058600d5901f007fab4c27140',
    '0001fd6190edaaf884bcaf3d49edf079'
)
ORDER BY customer_id, version_number;