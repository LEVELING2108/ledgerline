from fastapi import APIRouter

from app.api import auth, transactions, alerts, insights, agent

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(insights.router, prefix="/insights", tags=["insights"])
api_router.include_router(agent.router, prefix="/agent", tags=["agent"])
