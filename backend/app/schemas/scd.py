from datetime import datetime

from pydantic import BaseModel


class SCDSummary(BaseModel):
    totalRecords: int
    activeRecords: int
    historicalRecords: int
    customersWithMultipleVersions: int
    latestUpdateTimestamp: datetime | None


class CustomerSCDVersion(BaseModel):
    customerId: str
    customerCity: str | None
    customerState: str | None
    effectiveStartDate: datetime
    effectiveEndDate: datetime | None
    isCurrent: bool
    versionNumber: int


class CustomerSCDHistory(BaseModel):
    customerId: str
    versions: list[CustomerSCDVersion]
