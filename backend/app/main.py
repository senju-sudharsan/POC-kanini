from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.overview import router as overview_router
from app.routes.pipeline import router as pipeline_router
from app.routes.medallion import router as medallion_router
from app.routes.quality import router as quality_router
from app.routes.analytics import router as analytics_router

app = FastAPI(
    title="Olist Data Warehouse API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(overview_router)
app.include_router(pipeline_router)
app.include_router(medallion_router)
app.include_router(quality_router)
app.include_router(analytics_router)

@app.get("/")
def root():
    return {"message": "API Running"}
