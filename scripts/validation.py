from utils.db import get_connection

VALIDATIONS = [

    ("Silver Customers",
     "SELECT COUNT(*) FROM silver.customers"),

    ("Silver Orders",
     "SELECT COUNT(*) FROM silver.orders"),

    ("Silver Products",
     "SELECT COUNT(*) FROM silver.products"),

    ("Silver Sellers",
     "SELECT COUNT(*) FROM silver.sellers"),

    ("Silver Payments",
     "SELECT COUNT(*) FROM silver.payments"),

    ("Silver Order Fact",
     "SELECT COUNT(*) FROM silver.order_fact"),

    ("Gold Sales Summary",
     "SELECT COUNT(*) FROM gold.sales_summary"),

    ("Gold Product Performance",
     "SELECT COUNT(*) FROM gold.product_performance"),

    ("Gold Seller Performance",
     "SELECT COUNT(*) FROM gold.seller_performance")
]


def main():

    conn = get_connection()
    cur = conn.cursor()

    print("\n===== VALIDATION REPORT =====\n")

    for name, sql in VALIDATIONS:

        cur.execute(sql)

        count = cur.fetchone()[0]

        print(f"{name}: {count}")

    cur.close()
    conn.close()

    print("\nValidation Completed")


if __name__ == "__main__":
    main()
