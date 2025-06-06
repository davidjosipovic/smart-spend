from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import base, users, enable_banking_authorization, enable_banking_accounts, budget_routes, tasks_routes, analytics, account_routes

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
app.include_router(enable_banking_authorization.router)
app.include_router(enable_banking_accounts.router)
app.include_router(users.router)
app.include_router(budget_routes.router)
app.include_router(tasks_routes.router)
app.include_router(analytics.router)
app.include_router(account_routes.router)
