import psycopg2

conn = psycopg2.connect(
    host="localhost",
    port=5433,
    dbname="de_poc",
    user="postgres",
    password="postgres"
)

print("CONNECTED")
conn.close()
