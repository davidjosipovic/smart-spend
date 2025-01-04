from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import base, enable_banking_misc, users

app = FastAPI(
    title="Smart Spend",
    description="API documentation for a college project created in the scope of IPVO course (Big Data Infrastructure)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(base.router)
app.include_router(enable_banking_misc.router)
app.include_router(users.router)