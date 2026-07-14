from pydantic import BaseModel

class OverviewSummary(BaseModel):
    totalCustomers: int
    totalOrders: int
    totalProducts: int
    totalSellers: int
    totalPayments: int
    totalOrderFacts: int