from fastapi import FastAPI
from app.routers import brands, matches

app = FastAPI(title="Teaelo API")
app.include_router(brands.router, prefix="/brands", tags=["Brands"])
app.include_router(matches.router, prefix="/matches", tags=["Matches"])