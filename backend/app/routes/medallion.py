from fastapi import APIRouter, HTTPException

from app.database.db import get_connection
from app.routes.api_responses import success_response

router = APIRouter(prefix="/api/v1/medallion", tags=["Medallion"])

_LAYER_DETAILS = {
    "bronze": {
        "name": "Bronze Layer",
        "purpose": "Raw ingested Olist source records with batch and source metadata.",
    },
    "silver": {
        "name": "Silver Layer",
        "purpose": "Cleaned, standardized, and conformed warehouse records.",
    },
    "gold": {
        "name": "Gold Layer",
        "purpose": "Business-ready aggregations for operational and analytical reporting.",
    },
}

_LINEAGE = {
    ("silver", "customers"): (
        ["bronze.customers_raw"],
        [("Standardize and deduplicate", "Keeps the latest batch per customer and normalizes city and state values.")],
    ),
    ("silver", "orders"): (
        ["bronze.orders_raw"],
        [("Standardize order status", "Conforms order-status values while retaining source timestamps and batch lineage.")],
    ),
    ("silver", "products"): (
        ["bronze.products_raw"],
        [("Type normalization", "Normalizes product attributes and category values for warehouse use.")],
    ),
    ("silver", "sellers"): (
        ["bronze.sellers_raw"],
        [("Location standardization", "Normalizes seller city and state values and retains source batch lineage.")],
    ),
    ("silver", "payments"): (
        ["bronze.payments_raw"],
        [("Payment conformance", "Standardizes payment types and carries the originating batch identifier.")],
    ),
    ("silver", "order_fact"): (
        ["bronze.order_items_raw", "silver.orders"],
        [("Build order fact", "Joins order items to conformed orders to create the transaction fact table.")],
    ),
    ("gold", "sales_summary"): (
        ["silver.order_fact"],
        [("Aggregate daily sales", "Aggregates order facts by purchase date for revenue and order metrics.")],
    ),
    ("gold", "product_performance"): (
        ["silver.order_fact", "silver.products"],
        [("Aggregate product performance", "Combines product attributes with order facts for units, revenue, and order metrics.")],
    ),
    ("gold", "seller_performance"): (
        ["silver.order_fact"],
        [("Aggregate seller performance", "Aggregates fulfilled orders, units, revenue, and average order value by seller.")],
    ),
}


def _context(
    purpose: str,
    business_value: str,
    consumers: list[str],
    business_questions: list[str],
    raw_state: str,
    transformation_steps: list[str],
    resulting_state: str,
    lineage_journey: list[str],
) -> dict[str, object]:
    return {
        "purpose": purpose,
        "businessValue": business_value,
        "consumers": consumers,
        "businessQuestions": business_questions,
        "transformationStory": {
            "rawState": raw_state,
            "steps": transformation_steps,
            "resultingState": resulting_state,
        },
        "lineageJourney": lineage_journey,
    }


_TABLE_CONTEXT = {
    ("bronze", "category_translation_raw"): _context(
        "Preserves raw category translation records from Olist.",
        "Keeps source category labels available for product enrichment and reporting interpretation.",
        ["Product data engineering", "Category analytics"],
        ["How are source product categories named?", "Which categories require translation?"],
        "Unmodified category names from the source extract.",
        ["Ingest source rows", "Attach source and batch metadata", "Preserve source text"],
        "Traceable raw category translation records.",
        ["category_translation_raw"],
    ),
    ("bronze", "customers_raw"): _context(
        "Preserves raw customer records from Olist.",
        "Provides an auditable customer source before standardization and deduplication.",
        ["Customer data engineering", "Customer analytics"],
        ["What customer records arrived in a batch?", "How does the cleaned customer set trace to source?"],
        "Raw customer identifiers and location attributes from Olist.",
        ["Ingest source rows", "Attach source and batch metadata", "Preserve original values"],
        "Auditable raw customer records ready for conformance.",
        ["customers_raw", "customers"],
    ),
    ("bronze", "geolocation_raw"): _context(
        "Preserves raw geolocation reference records from Olist.",
        "Retains source geography for future location enrichment and audit needs.",
        ["Geographic analysis", "Data engineering"],
        ["Which geolocation records were supplied?", "What source geography is available for enrichment?"],
        "Raw latitude, longitude, city, state, and postal-prefix records.",
        ["Ingest source rows", "Attach source and batch metadata", "Preserve coordinate precision"],
        "Traceable raw geolocation reference data.",
        ["geolocation_raw"],
    ),
    ("bronze", "order_items_raw"): _context(
        "Preserves raw order-item transactions from Olist.",
        "Supplies the item-level commercial activity used to build the central order fact.",
        ["Sales data engineering", "Revenue analytics"],
        ["Which products and sellers appear in an order?", "What price and freight values arrived from source?"],
        "Raw order-item, product, seller, price, and freight records.",
        ["Ingest source rows", "Attach source and batch metadata", "Retain item-level grain"],
        "Auditable item transactions ready for fact construction.",
        ["order_items_raw", "order_fact", "sales_summary"],
    ),
    ("bronze", "orders_raw"): _context(
        "Preserves raw order lifecycle records from Olist.",
        "Provides the source of truth for order status, customer linkage, and lifecycle timestamps.",
        ["Order operations", "Revenue analytics", "Data engineering"],
        ["When were orders purchased and delivered?", "Which customer placed each order?"],
        "Raw order identifiers, statuses, customers, and lifecycle timestamps.",
        ["Ingest source rows", "Attach source and batch metadata", "Preserve lifecycle timestamps"],
        "Traceable raw order lifecycle records.",
        ["orders_raw", "orders", "order_fact", "sales_summary"],
    ),
    ("bronze", "payments_raw"): _context(
        "Preserves raw payment records from Olist.",
        "Retains payment-method and installment details before conforming them for analysis.",
        ["Finance analytics", "Payment operations"],
        ["Which payment methods are used?", "How are payments distributed across orders?"],
        "Raw payment type, sequence, installment, and value records.",
        ["Ingest source rows", "Attach source and batch metadata", "Preserve payment sequence"],
        "Auditable raw payment activity.",
        ["payments_raw", "payments"],
    ),
    ("bronze", "products_raw"): _context(
        "Preserves raw product catalog records from Olist.",
        "Provides catalog attributes and categories for product performance analysis.",
        ["Product analytics", "Catalog operations"],
        ["Which products and categories are available?", "What product attributes arrived from source?"],
        "Raw product dimensions, catalog text, and category values.",
        ["Ingest source rows", "Attach source and batch metadata", "Preserve source attributes"],
        "Traceable raw product catalog records.",
        ["products_raw", "products", "product_performance"],
    ),
    ("bronze", "reviews_raw"): _context(
        "Preserves raw customer review records from Olist.",
        "Retains customer feedback for future service-quality and seller experience analysis.",
        ["Customer experience analytics", "Seller analytics"],
        ["How do customers rate fulfilled orders?", "Which orders have review feedback?"],
        "Raw review scores, comments, and response timestamps.",
        ["Ingest source rows", "Attach source and batch metadata", "Preserve review text and timestamps"],
        "Auditable raw customer feedback.",
        ["reviews_raw"],
    ),
    ("bronze", "sellers_raw"): _context(
        "Preserves raw seller master records from Olist.",
        "Supplies seller identifiers and locations for conformance and seller benchmarking.",
        ["Seller operations", "Marketplace analytics"],
        ["Which sellers participate in the marketplace?", "Where are sellers located?"],
        "Raw seller identifiers and location attributes.",
        ["Ingest source rows", "Attach source and batch metadata", "Preserve original location values"],
        "Traceable raw seller master records.",
        ["sellers_raw", "sellers", "seller_performance"],
    ),
    ("silver", "customers"): _context(
        "Stores validated and standardized customer information.",
        "Provides trusted customer data for analytics, segmentation, and executive reporting.",
        ["Customer analytics", "Revenue analysis", "Executive reporting"],
        ["How many customers are in the warehouse?", "Which customer locations generate demand?"],
        "Raw customer records may contain inconsistent city and state values or repeated batch versions.",
        ["Select latest record per customer", "Standardize city and state", "Preserve source batch lineage"],
        "Conformed customer records ready to join with orders.",
        ["customers_raw", "customers"],
    ),
    ("silver", "orders"): _context(
        "Stores validated and standardized order lifecycle records.",
        "Creates a trusted operational view of orders and their customer relationships.",
        ["Order operations", "Revenue analysis", "Executive reporting"],
        ["How many orders progressed through each status?", "When were orders purchased and delivered?"],
        "Raw orders contain source status values and lifecycle timestamps.",
        ["Standardize order status", "Preserve timestamps", "Retain source batch lineage"],
        "Conformed orders ready to join with item-level transactions.",
        ["orders_raw", "orders", "order_fact", "sales_summary"],
    ),
    ("silver", "products"): _context(
        "Stores conformed product catalog attributes.",
        "Provides consistent product and category data for revenue and assortment analysis.",
        ["Product analytics", "Merchandising", "Revenue analysis"],
        ["Which categories drive units and revenue?", "Which product attributes are available for analysis?"],
        "Raw product attributes arrive with source category labels and mixed value representations.",
        ["Normalize category values", "Cast product attributes", "Retain source batch lineage"],
        "Trusted product records ready to enrich transactional facts.",
        ["products_raw", "products", "product_performance"],
    ),
    ("silver", "sellers"): _context(
        "Stores conformed seller master information.",
        "Provides trusted seller reference data for benchmarking and operational analysis.",
        ["Seller operations", "Marketplace analytics", "Executive reporting"],
        ["Which sellers are active?", "How does performance vary by seller location?"],
        "Raw seller records may contain inconsistent city and state values.",
        ["Standardize city and state", "Conform postal prefix", "Retain source batch lineage"],
        "Trusted seller records ready to link to order facts.",
        ["sellers_raw", "sellers", "seller_performance"],
    ),
    ("silver", "payments"): _context(
        "Stores conformed payment events for orders.",
        "Enables trusted analysis of payment methods, values, and installment behavior.",
        ["Finance analytics", "Payment operations", "Business intelligence"],
        ["Which payment methods are most common?", "How are payment values distributed?"],
        "Raw payments contain source payment-type labels and transaction sequencing.",
        ["Standardize payment types", "Retain payment sequence", "Preserve source batch lineage"],
        "Conformed payment records ready for financial analysis.",
        ["payments_raw", "payments"],
    ),
    ("silver", "order_fact"): _context(
        "Central transactional fact table linking orders, customers, products, and sellers.",
        "Provides a consistent item-level foundation for revenue, product, and seller analytics.",
        ["Revenue analytics", "Product analytics", "Seller analytics", "Executive reporting"],
        ["What revenue was generated by product or seller?", "How do order items connect to customers and order status?"],
        "Order items and order headers are stored separately in the source layer.",
        ["Join item records to conformed orders", "Preserve transactional grain", "Carry customer, product, seller, and status keys"],
        "Analytics-ready transactional fact records.",
        ["orders_raw", "orders", "order_fact", "sales_summary"],
    ),
    ("gold", "sales_summary"): _context(
        "Provides executive-level sales KPIs and trend reporting.",
        "Supplies a fast, governed daily view of orders, revenue, freight, and order value.",
        ["Executive reporting", "Revenue analytics", "Business intelligence"],
        ["How is revenue trending over time?", "What are daily order and freight totals?"],
        "Item-level order facts contain detailed transactions at a lower analytical grain.",
        ["Group facts by purchase date", "Aggregate orders, revenue, and freight", "Calculate average order value"],
        "Business-ready daily sales KPIs.",
        ["orders_raw", "orders", "order_fact", "sales_summary"],
    ),
    ("gold", "product_performance"): _context(
        "Provides product-level revenue and performance analytics.",
        "Enables category, product, and assortment decisions from governed revenue metrics.",
        ["Product analytics", "Merchandising", "Revenue analysis"],
        ["Which products and categories drive revenue?", "Which products sell the most units?"],
        "Transactional facts and product attributes are stored separately at detailed grain.",
        ["Join facts to products", "Aggregate units, revenue, and orders", "Retain product category context"],
        "Business-ready product performance metrics.",
        ["products_raw", "products", "product_performance"],
    ),
    ("gold", "seller_performance"): _context(
        "Provides seller benchmarking and operational reporting.",
        "Enables marketplace teams to compare seller orders, units, revenue, and average order value.",
        ["Seller operations", "Marketplace analytics", "Executive reporting"],
        ["Which sellers generate the most revenue?", "How do seller order volumes and values compare?"],
        "Item-level transaction facts contain seller activity at order-item grain.",
        ["Group facts by seller", "Aggregate orders, units, and revenue", "Calculate average order value"],
        "Business-ready seller performance metrics.",
        ["sellers_raw", "sellers", "seller_performance"],
    ),
}


def _table_count(cursor, layer_id: str, table_name: str) -> int:
    cursor.execute(f"SELECT COUNT(*) FROM {layer_id}.{table_name}")
    return cursor.fetchone()[0]


def _lineage(layer_id: str, table_name: str) -> tuple[list[str], list[tuple[str, str]]]:
    if layer_id == "bronze":
        return (
            [],
            [("Raw ingestion", "Loads source records with source-system, batch, and load-timestamp metadata.")],
        )

    return _LINEAGE.get(
        (layer_id, table_name),
        ([], [("Warehouse transformation", "Creates the table as part of the configured warehouse transformation flow.")]),
    )


def _table_context(layer_id: str, table_name: str) -> dict[str, object]:
    return _TABLE_CONTEXT.get(
        (layer_id, table_name),
        _context(
            "Warehouse dataset managed by the Medallion pipeline.",
            "Provides governed warehouse data for downstream analysis.",
            ["Data engineering"],
            ["What data is available in this warehouse dataset?"],
            "The dataset is produced by the configured warehouse pipeline.",
            ["Apply configured warehouse transformation", "Validate resulting records"],
            "A governed warehouse dataset ready for approved consumers.",
            [table_name],
        ),
    )


@router.get("/layers")
def get_medallion_layers():
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT table_schema, table_name
            FROM information_schema.tables
            WHERE table_schema IN ('bronze', 'silver', 'gold')
              AND table_type = 'BASE TABLE'
            ORDER BY table_schema, table_name
            """
        )
        table_rows = cur.fetchall()
        tables_by_layer = {layer_id: [] for layer_id in _LAYER_DETAILS}

        for layer_id, table_name in table_rows:
            tables_by_layer[layer_id].append(
                {
                    "name": table_name,
                    "rowCount": _table_count(cur, layer_id, table_name),
                }
            )

        return success_response(
            {
                "layers": [
                    {
                        "id": layer_id,
                        "name": layer["name"],
                        "purpose": layer["purpose"],
                        "tables": tables_by_layer[layer_id],
                    }
                    for layer_id, layer in _LAYER_DETAILS.items()
                ]
            }
        )
    finally:
        cur.close()
        conn.close()


@router.get("/layers/{layer_id}/tables/{table_name}")
def get_medallion_table_detail(layer_id: str, table_name: str):
    if layer_id not in _LAYER_DETAILS:
        raise HTTPException(status_code=404, detail=f"Medallion layer {layer_id} was not found.")

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = %s
                  AND table_name = %s
                  AND table_type = 'BASE TABLE'
            )
            """,
            (layer_id, table_name),
        )
        if not cur.fetchone()[0]:
            raise HTTPException(status_code=404, detail=f"Table {layer_id}.{table_name} was not found.")

        row_count = _table_count(cur, layer_id, table_name)
        source_tables, transformations = _lineage(layer_id, table_name)
        context = _table_context(layer_id, table_name)
        validation_status = "passed" if row_count > 0 else "warning"

        return success_response(
            {
                "layerId": layer_id,
                "tableName": table_name,
                "rowCount": row_count,
                "sourceTables": source_tables,
                "transformations": [
                    {"step": step, "description": description}
                    for step, description in transformations
                ],
                "validation": {
                    "status": validation_status,
                    "checksRun": 1,
                    "checksPassed": 1 if row_count > 0 else 0,
                },
                **context,
            }
        )
    finally:
        cur.close()
        conn.close()
