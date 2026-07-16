from fastapi import APIRouter, Query

from app.database.db import get_connection
from app.routes.api_responses import success_response

router = APIRouter(prefix="/api/v1/sources", tags=["Sources"])


def _source_payload(row: tuple) -> dict:
    name, source_type, status, records, loaded_at, batch_id, error = row
    return {
        "sourceName": name,
        "sourceType": source_type,
        "status": "healthy" if status.lower() in {"success", "completed"} else "unhealthy",
        "recordsLoaded": int(records or 0),
        "lastLoadTime": loaded_at.isoformat() if loaded_at else None,
        "batchId": str(batch_id) if batch_id is not None else None,
        "errorMessage": error,
    }


@router.get("/summary")
def get_source_summary():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT expected.source_name, expected.source_type, COALESCE(latest.status, 'PENDING'),
                    COALESCE(latest.records_loaded, 0), latest.last_load_time, latest.batch_id, latest.error_message
                FROM (VALUES ('Olist CSV Source'::varchar, 'CSV'::varchar),
                             ('Synthetic API Source'::varchar, 'REST API'::varchar)) AS expected(source_name, source_type)
                LEFT JOIN LATERAL (
                    SELECT status, records_loaded, last_load_time, batch_id, error_message
                    FROM metadata.source_load_audit audit WHERE audit.source_name = expected.source_name
                    ORDER BY last_load_time DESC, source_load_id DESC LIMIT 1
                ) latest ON TRUE
            """)
            return success_response({"sources": [_source_payload(row) for row in cur.fetchall()]})
    finally:
        conn.close()


@router.get("/history")
def get_source_history(limit: int = Query(default=50, ge=1, le=200)):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT source_name, source_type, status, records_loaded, last_load_time, batch_id, error_message
                FROM metadata.source_load_audit ORDER BY last_load_time DESC, source_load_id DESC LIMIT %s
            """, (limit,))
            return success_response({"loads": [_source_payload(row) for row in cur.fetchall()]})
    finally:
        conn.close()
