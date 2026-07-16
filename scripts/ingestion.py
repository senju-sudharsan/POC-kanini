import subprocess
import sys

LOADERS = [
    "ingestion/load_customers.py",
    "ingestion/load_orders.py",
    "ingestion/load_order_items.py",
    "ingestion/load_payments.py",
    "ingestion/load_products.py",
    "ingestion/load_reviews.py",
    "ingestion/load_sellers.py",
    "ingestion/load_geolocation.py",
    "ingestion/load_category_translation.py"
    ,"ingestion/load_synthetic_api.py"
    ,"ingestion/audit_olist_source.py"
]

for loader in LOADERS:

    print(f"\nRunning {loader}")

    result = subprocess.run(
        [sys.executable, loader]
    )

    if result.returncode != 0:
        raise RuntimeError(
            f"Failed: {loader}"
        )

print("\nBronze Ingestion Completed")
