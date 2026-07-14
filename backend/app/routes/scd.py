from fastapi import APIRouter, HTTPException

from app.routes.api_responses import success_response
from app.services.scd_service import get_customer_scd_history, get_scd_summary

router = APIRouter(prefix="/api/v1/scd", tags=["SCD"])


@router.get("/summary")
def get_summary():
    return success_response(get_scd_summary().model_dump())


@router.get("/history/{customer_id}")
def get_history(customer_id: str):
    history = get_customer_scd_history(customer_id)
    if history is None:
        raise HTTPException(status_code=404, detail=f"SCD history for customer {customer_id} was not found.")
    return success_response(history.model_dump())
