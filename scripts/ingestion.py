import subprocess
import sys

LOADERS = [
    "scripts/ingestion/load_customers.py",
    "scripts/ingestion/load_orders.py",
    "scripts/ingestion/load_order_items.py",
    "scripts/ingestion/load_payments.py",
    "scripts/ingestion/load_products.py",
    "scripts/ingestion/load_reviews.py",
    "scripts/ingestion/load_sellers.py",
    "scripts/ingestion/load_geolocation.py",
    "scripts/ingestion/load_category_translation.py"
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