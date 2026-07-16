# Enterprise Extensions

## Database migration

Apply these additive scripts after the existing schemas and `metadata.batch_control` migration:

```powershell
psql -h localhost -p 5433 -U postgres -d de_poc -f sql/metadata/02_observability.sql
psql -h localhost -p 5433 -U postgres -d de_poc -f sql/bronze/10_api_raw.sql
```

`metadata.gx_validation_results` stores one Great Expectations result per expectation. `metadata.source_load_audit` is append-only source ingestion telemetry. The API Bronze tables are intentionally separate from Olist tables so the completed CSV transformations are unaffected.

## Synthetic REST source

Run the deterministic mock source from the `scripts` directory:

```powershell
uvicorn mock_api_source:app --host 0.0.0.0 --port 8090
```

It exposes `/health` and `/api/v1/{customers,products,orders}`. Set `SYNTHETIC_API_URL` when the service is not at `http://synthetic-api:8090/api/v1`. The loader has an intentional deterministic local fallback, allowing Airflow development runs to remain reproducible when the mock service is unavailable.

## Great Expectations

Install the root requirements, then run:

```powershell
python scripts/gx_validation.py
```

The runner maintains `customers_suite`, `orders_suite`, `products_suite`, and `payments_suite`, represented by the matching checkpoint files under `great_expectations/checkpoints`. Each suite applies not-null, uniqueness, row-count, positive numeric where applicable, and cross-table referential checks. Results are normalized into PostgreSQL for the dashboard.

The Airflow `warehouse_pipeline` DAG now runs the synthetic API ingestion in parallel with existing Bronze ingestion and executes Great Expectations after the existing validation task. `airflow/Dockerfile` installs the root requirements when the Airflow compose stack is rebuilt.

## API and dashboard

Existing routes remain compatible. New read endpoints are:

| Endpoint | Purpose |
| --- | --- |
| `GET /api/v1/quality/summary` | Quality totals, rate, and most recent run |
| `GET /api/v1/quality/history` | Success-rate trend |
| `GET /api/v1/quality/failures` | Failed expectation drilldown |
| `GET /api/v1/sources/summary` | Latest status for each source |
| `GET /api/v1/sources/history` | Source load history |
| `GET /api/v1/pipeline/operations/latest` | Latest `warehouse_pipeline` operation metadata |

The React navigation now exposes **Data Quality**, **Source Monitoring**, and **Pipeline Operations**. All use the existing card, badge, formatter, chart, responsive, and theme tokens.
