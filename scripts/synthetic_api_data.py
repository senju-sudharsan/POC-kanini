"""Deterministic data contract shared by the mock REST service and its client."""
from datetime import datetime, timedelta, timezone


def build_payload(customer_count: int = 25, product_count: int = 12, order_count: int = 60) -> dict:
    now = datetime.now(timezone.utc).replace(microsecond=0)
    customers = [
        {
            "customer_id": f"api-customer-{index:04d}",
            "customer_name": f"API Customer {index:04d}",
            "email": f"customer{index:04d}@synthetic.example",
            "city": ["Sao Paulo", "Rio de Janeiro", "Curitiba"][index % 3],
            "state": ["SP", "RJ", "PR"][index % 3],
            "created_at": (now - timedelta(days=index)).isoformat(),
        }
        for index in range(1, customer_count + 1)
    ]
    products = [
        {
            "product_id": f"api-product-{index:04d}",
            "product_name": f"Synthetic Product {index:04d}",
            "category": ["electronics", "home", "fashion"][index % 3],
            "price": round(15 + index * 7.25, 2),
            "stock_quantity": 10 + index,
        }
        for index in range(1, product_count + 1)
    ]
    orders = [
        {
            "order_id": f"api-order-{index:05d}",
            "customer_id": customers[(index - 1) % len(customers)]["customer_id"],
            "product_id": products[(index - 1) % len(products)]["product_id"],
            "order_status": "delivered" if index % 5 else "processing",
            "quantity": (index % 3) + 1,
            "order_total": round(products[(index - 1) % len(products)]["price"] * ((index % 3) + 1), 2),
            "order_timestamp": (now - timedelta(hours=index * 3)).isoformat(),
        }
        for index in range(1, order_count + 1)
    ]
    return {"customers": customers, "products": products, "orders": orders}
