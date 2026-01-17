from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import brands, matches

app = FastAPI(title="Teaelo API")

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(brands.router, prefix="/brands", tags=["Brands"])
app.include_router(matches.router, prefix="/matches", tags=["Matches"])

@app.get("/")
def root():
    return {"message": "Welcome to Teaelo!"}