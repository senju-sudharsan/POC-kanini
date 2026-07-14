from datetime import datetime

from fastapi import APIRouter, HTTPException, Query

from app.database.db import get_connection
from app.routes.api_responses import success_response

router = APIRouter(prefix="/api/v1/pipeline", tags=["Pipeline"])

_STATUS_MAP = {
    "success": "success",
    "completed": "success",
    "running": "running",
    "failed": "failed",
    "error": "failed",
    "warning": "warning",
}

_BATCH_COLUMNS = """
    batch_id,
    status,
    batch_start_time,
    batch_end_time,
    records_processed,
    records_rejected
"""


def _pipeline_status(value: str | None) -> str:
    return _STATUS_MAP.get((value or "warning").lower(), "warning")


def _validation_status(pipeline_status: str, records_rejected: int | None) -> str:
    if pipeline_status == "failed":
        return "failed"
    if records_rejected is None:
        return "warning"
    return "passed" if records_rejected == 0 else "warning"


def _timestamp(value: datetime | None, field: str) -> str:
    if value is None:
        raise HTTPException(status_code=500, detail=f"Batch metadata is missing {field}.")
    return value.isoformat()


def _batch_payload(row: tuple) -> dict[str, str | int]:
    batch_id, status_value, started_at, finished_at, records_processed, records_rejected = row
    status = _pipeline_status(status_value)
    duration_seconds = 0

    if started_at is not None and finished_at is not None:
        duration_seconds = max(0, round((finished_at - started_at).total_seconds()))

    return {
        "batchId": str(batch_id),
        "status": status,
        "startedAt": _timestamp(started_at, "batch_start_time"),
        "finishedAt": _timestamp(finished_at or started_at, "batch_end_time"),
        "durationSeconds": duration_seconds,
        "rowsProcessed": int(records_processed or 0),
        "validationStatus": _validation_status(status, records_rejected),
    }


def _get_batch(cursor, batch_id: int | None = None) -> tuple | None:
    where_clause = ""
    params: tuple[int, ...] = ()

    if batch_id is not None:
        where_clause = "WHERE batch_id = %s"
        params = (batch_id,)

    cursor.execute(
        f"""
        SELECT {_BATCH_COLUMNS}
        FROM metadata.batch_control
        {where_clause}
        ORDER BY COALESCE(batch_end_time, batch_start_time, created_at) DESC, batch_id DESC
        LIMIT 1
        """,
        params,
    )
    return cursor.fetchone()


@router.get("/latest-batch")
def get_latest_batch():
    conn = get_connection()
    cur = conn.cursor()

    try:
        batch = _get_batch(cur)
        if batch is None:
            raise HTTPException(status_code=404, detail="No pipeline batches were found.")
        return success_response(_batch_payload(batch))
    finally:
        cur.close()
        conn.close()


@router.get("/batch-history")
def get_batch_history(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT COUNT(*) FROM metadata.batch_control")
        total = cur.fetchone()[0]
        cur.execute(
            f"""
            SELECT {_BATCH_COLUMNS}
            FROM metadata.batch_control
            ORDER BY COALESCE(batch_end_time, batch_start_time, created_at) DESC, batch_id DESC
            LIMIT %s OFFSET %s
            """,
            (limit, offset),
        )
        batches = [_batch_payload(row) for row in cur.fetchall()]
        return success_response(
            {
                "batches": [
                    {
                        key: value
                        for key, value in batch.items()
                        if key != "finishedAt"
                    }
                    for batch in batches
                ],
                "pagination": {
                    "limit": limit,
                    "offset": offset,
                    "total": total,
                },
            }
        )
    finally:
        cur.close()
        conn.close()


@router.get("/batches/{batch_id}")
def get_batch_detail(batch_id: int):
    conn = get_connection()
    cur = conn.cursor()

    try:
        batch = _get_batch(cur, batch_id)
        if batch is None:
            raise HTTPException(status_code=404, detail=f"Pipeline batch {batch_id} was not found.")
        return success_response(_batch_payload(batch))
    finally:
        cur.close()
        conn.close()
