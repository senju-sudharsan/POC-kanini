from fastapi import APIRouter
from app.database.db import get_connection
from datetime import datetime, timezone

router = APIRouter(prefix="/api/v1/overview", tags=["Overview"])


@router.get("/summary")
def get_summary():

    conn = get_connection()
    cur = conn.cursor()

    queries = {
        "totalCustomers": "SELECT COUNT(*) FROM silver.customers",
        "totalOrders": "SELECT COUNT(*) FROM silver.orders",
        "totalProducts": "SELECT COUNT(*) FROM silver.products",
        "totalSellers": "SELECT COUNT(*) FROM silver.sellers",
        "totalPayments": "SELECT COUNT(*) FROM silver.payments",
        "totalOrderFacts": "SELECT COUNT(*) FROM silver.order_fact"
    }

    result = {}

    for key, sql in queries.items():
        cur.execute(sql)
        result[key] = cur.fetchone()[0]

    cur.close()
    conn.close()

    return {
    "data": result,
    "meta": {
        "generatedAt": datetime.now(timezone.utc).isoformat()
    }
}
@router.get("/architecture")
def get_architecture():

    return {
        "data": {
            "layers": [
                {
                    "id": "bronze",
                    "name": "Bronze Layer",
                    "description": "Raw ingested Olist data",
                    "tableCount": 9
                },
                {
                    "id": "silver",
                    "name": "Silver Layer",
                    "description": "Cleaned and transformed data",
                    "tableCount": 6
                },
                {
                    "id": "gold",
                    "name": "Gold Layer",
                    "description": "Business-ready analytics",
                    "tableCount": 3
                }
            ]
        },
        "meta": {"generatedAt": datetime.now(timezone.utc).isoformat()}
    } 

@router.get("/pipeline-status")
def get_pipeline_status():

    return {
        "data": {
            "status": "success",
            "lastRunAt": "2026-07-14T12:00:00",
            "batchId": "LATEST_BATCH"
        },
        "meta": {"generatedAt": datetime.now(timezone.utc).isoformat()}
    }