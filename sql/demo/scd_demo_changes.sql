-- SCD Type 2 Demonstration Data
-- Execute before running:
-- python scripts\scd.py --type 2

UPDATE silver.customers
SET customer_city = 'DEMO_CITY_A'
WHERE customer_id = '00012a2ce6f8dcda20d059ce98491703';

UPDATE silver.customers
SET customer_city = 'DEMO_CITY_B'
WHERE customer_id = '000161a058600d5901f007fab4c27140';

UPDATE silver.customers
SET customer_city = 'DEMO_CITY_C'
WHERE customer_id = '0001fd6190edaaf884bcaf3d49edf079';