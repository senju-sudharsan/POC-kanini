from fastapi import APIRouter, Query

from app.database.db import get_connection
from app.routes.api_responses import success_response

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])


def _as_float(value):
    return float(value or 0)


def _table_counts(cursor) -> dict[str, int]:
    cursor.execute(
        """
        SELECT table_schema, COUNT(*)
        FROM information_schema.tables
        WHERE table_schema IN ('bronze', 'silver', 'gold')
          AND table_type = 'BASE TABLE'
        GROUP BY table_schema
        """
    )
    counts = {schema: int(count) for schema, count in cursor.fetchall()}
    return {layer: counts.get(layer, 0) for layer in ("bronze", "silver", "gold")}


@router.get("/revenue-trend")
def get_revenue_trend(
    granularity: str = Query(default="month", pattern="^(day|week|month)$"),
):
    date_expression = {
        "day": "sales_date",
        "week": "date_trunc('week', sales_date)::date",
        "month": "date_trunc('month', sales_date)::date",
    }[granularity]

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            f"""
            SELECT {date_expression} AS period, SUM(total_revenue) AS revenue
            FROM gold.sales_summary
            GROUP BY 1
            ORDER BY 1
            """
        )
        points = [
            {"period": period.isoformat(), "revenue": _as_float(revenue)}
            for period, revenue in cur.fetchall()
        ]

        cur.execute(
            """
            SELECT
                COALESCE(SUM(total_revenue), 0),
                COALESCE(SUM(total_orders), 0)
            FROM gold.sales_summary
            """
        )
        revenue, orders = cur.fetchone()
        cur.execute("SELECT COUNT(DISTINCT customer_unique_id) FROM silver.customers")
        customers = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM gold.seller_performance")
        sellers = cur.fetchone()[0]

        cur.execute(
            """
            SELECT
                COUNT(DISTINCT customer_id),
                COUNT(DISTINCT order_id),
                COUNT(*),
                (SELECT COUNT(*) FROM silver.payments)
            FROM silver.order_fact
            """
        )
        funnel_counts = cur.fetchone()

        cur.execute(
            """
            SELECT
                c.customer_state,
                SUM(f.price) AS revenue,
                COUNT(DISTINCT f.order_id) AS orders
            FROM silver.order_fact f
            JOIN silver.customers c ON c.customer_id = f.customer_id
            JOIN (
                SELECT DISTINCT UPPER(geolocation_state) AS state
                FROM bronze.geolocation_raw
                WHERE geolocation_state IS NOT NULL
            ) geo ON geo.state = c.customer_state
            GROUP BY c.customer_state
            ORDER BY revenue DESC
            LIMIT 12
            """
        )
        geography = [
            {"state": state, "revenue": _as_float(state_revenue), "orders": int(state_orders)}
            for state, state_revenue, state_orders in cur.fetchall()
        ]

        cur.execute(
            """
            SELECT status, records_rejected
            FROM metadata.batch_control
            ORDER BY COALESCE(batch_end_time, batch_start_time, created_at) DESC, batch_id DESC
            LIMIT 1
            """
        )
        batch = cur.fetchone()
        validation_status = "unknown"
        quality_score = 0
        if batch:
            status, rejected = batch
            validation_status = "passed" if str(status).lower() in {"success", "completed"} and (rejected or 0) == 0 else "warning"
            quality_score = 100 if validation_status == "passed" else max(0, 100 - int(rejected or 0))

        counts = _table_counts(cur)
        return success_response(
            {
                "granularity": granularity,
                "points": points,
                "kpis": {
                    "totalRevenue": _as_float(revenue),
                    "totalOrders": int(orders or 0),
                    "totalCustomers": int(customers or 0),
                    "totalSellers": int(sellers or 0),
                },
                "funnel": [
                    {"stage": "Customers", "count": int(funnel_counts[0] or 0)},
                    {"stage": "Orders", "count": int(funnel_counts[1] or 0)},
                    {"stage": "Order Items", "count": int(funnel_counts[2] or 0)},
                    {"stage": "Payments", "count": int(funnel_counts[3] or 0)},
                ],
                "geography": geography,
                "dataQuality": {
                    "score": quality_score,
                    "validationStatus": validation_status,
                    "tableCounts": counts,
                },
            }
        )
    finally:
        cur.close()
        conn.close()


@router.get("/top-categories")
def get_top_categories(limit: int = Query(default=10, ge=1, le=25)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            SELECT COALESCE(product_category_name, 'Uncategorized') AS category,
                   SUM(units_sold) AS units_sold,
                   SUM(total_revenue) AS revenue
            FROM gold.product_performance
            GROUP BY 1
            ORDER BY revenue DESC
            LIMIT %s
            """,
            (limit,),
        )
        return success_response(
            {"categories": [
                {"category": category, "unitsSold": int(units), "revenue": _as_float(revenue)}
                for category, units, revenue in cur.fetchall()
            ]}
        )
    finally:
        cur.close()
        conn.close()


@router.get("/seller-performance")
def get_seller_performance(limit: int = Query(default=10, ge=1, le=10)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            SELECT seller_id, total_orders, total_revenue
            FROM gold.seller_performance
            ORDER BY total_revenue DESC
            LIMIT %s
            """,
            (limit,),
        )
        return success_response(
            {"sellers": [
                {"sellerId": seller_id, "ordersFulfilled": int(orders), "revenue": _as_float(revenue)}
                for seller_id, orders, revenue in cur.fetchall()
            ]}
        )
    finally:
        cur.close()
        conn.close()


@router.get("/payment-distribution")
def get_payment_distribution():
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT COUNT(*) FROM silver.payments")
        total = cur.fetchone()[0]
        cur.execute(
            """
            SELECT payment_type, COUNT(*) AS count
            FROM silver.payments
            GROUP BY payment_type
            ORDER BY count DESC, payment_type
            """
        )
        return success_response(
            {"methods": [
                {
                    "type": payment_type,
                    "count": int(count),
                    "percentage": round((int(count) / total * 100) if total else 0, 1),
                }
                for payment_type, count in cur.fetchall()
            ]}
        )
    finally:
        cur.close()
        conn.close()
