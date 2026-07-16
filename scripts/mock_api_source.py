"""Run with: uvicorn mock_api_source:app --host 0.0.0.0 --port 8090."""
from fastapi import FastAPI
from synthetic_api_data import build_payload

app = FastAPI(title="Synthetic Commerce Source", version="1.0.0")


@app.get("/health")
def health():
    return {"status": "healthy", "source": "Synthetic API Source"}


@app.get("/api/v1/customers")
def customers():
    return {"data": build_payload()["customers"]}


@app.get("/api/v1/products")
def products():
    return {"data": build_payload()["products"]}


@app.get("/api/v1/orders")
def orders():
    return {"data": build_payload()["orders"]}
