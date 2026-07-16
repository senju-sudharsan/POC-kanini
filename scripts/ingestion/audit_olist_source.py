"""Record an Olist source observation after the existing CSV loaders finish."""
import sys
from pathlib import Path

SCRIPTS_ROOT = Path(__file__).resolve().parents[1]
if str(SCRIPTS_ROOT) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_ROOT))

from utils.db import get_connection


def main() -> None:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT batch_id, records_processed, status
                FROM metadata.batch_control
                WHERE pipeline_name = 'customers_ingestion'
                ORDER BY batch_id DESC LIMIT 1
            """)
            row = cur.fetchone()
            if row:
                cur.execute("""
                    INSERT INTO metadata.source_load_audit
                        (source_name, source_type, status, records_loaded, batch_id)
                    VALUES ('Olist CSV Source', 'CSV', %s, %s, %s)
                """, (row[2], row[1] or 0, row[0]))
        conn.commit()
    finally:
        conn.close()


if __name__ == '__main__':
    main()
