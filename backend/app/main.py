from fastapi import FastAPI
from app.routers import brands

app = FastAPI(title="Teaelo API")

app.include_router(brands.router, prefix="/brands", tags=["Brands"])