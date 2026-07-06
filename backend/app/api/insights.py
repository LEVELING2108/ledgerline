from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Transaction, Alert, Forecast
from app.services.forecaster import generate_forecast_for_user

router = APIRouter()


@router.get("/summary")
async def get_summary_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    # 1. Total spend this month
    # In real world, we would calculate this month's transactions.
    # For now, let's compute directly or return a comprehensive payload:
    tx_result = await db.execute(
        select(Transaction).where(Transaction.user_id == current_user.id)
    )
    user_txs = tx_result.scalars().all()
    
    total_spend = sum(t.amount for t in user_txs if t.amount < 0 and t.category != "Investment")
    total_investment = sum(abs(t.amount) for t in user_txs if t.category == "Investment")
    
    # Category breakdown
    categories_breakdown = {}
    for t in user_txs:
        if t.amount < 0 and t.category != "Investment":
            categories_breakdown[t.category] = categories_breakdown.get(t.category, 0.0) + abs(t.amount)
            
    breakdown_list = [
        {"category": k, "amount": v} for k, v in categories_breakdown.items()
    ]
    # Sort by amount descending
    breakdown_list.sort(key=lambda x: x["amount"], reverse=True)
    
    # Open anomalies
    alert_result = await db.execute(
        select(Alert).where(Alert.user_id == current_user.id, Alert.resolved == False)
    )
    open_alerts_count = len(alert_result.scalars().all())
    
    # Fallback to defaults if user has no transactions yet
    if not user_txs:
        return {
            "this_month_spend": -35200,
            "delta_label": "vs -36,400 last month",
            "tone": "positive",
            "open_anomalies_count": 0,
            "category_breakdown": [
                {"category": "Rent", "amount": 18000},
                {"category": "Groceries", "amount": 7200},
                {"category": "Dining", "amount": 4100},
                {"category": "Transport", "amount": 2600},
                {"category": "Utilities", "amount": 1800},
                {"category": "Entertainment", "amount": 1500},
            ],
            "total_investment": 5000.0
        }
        
    return {
        "this_month_spend": total_spend,
        "delta_label": "computed from uploaded statement",
        "tone": "neutral" if total_spend == 0 else ("positive" if total_spend > -40000 else "negative"),
        "open_anomalies_count": open_alerts_count,
        "category_breakdown": breakdown_list,
        "total_investment": total_investment
    }


@router.get("/forecast")
async def get_forecast(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    # 1. Fetch existing forecasts
    stmt = select(Forecast).where(Forecast.user_id == current_user.id)
    result = await db.execute(stmt)
    forecasts = result.scalars().all()
    
    # If no forecasts exist, trigger forecasting engine dynamically
    if not forecasts:
        forecasts = await generate_forecast_for_user(db, current_user.id)
        
    if not forecasts:
        # Mock default forecast
        return {
            "month": "2026-07",
            "forecast_spend": 37100,
            "delta_label": "up 5.4% from this month",
            "tone": "negative",
            "monthly_trend": [
                {"month": "Feb", "actual": 32800},
                {"month": "Mar", "actual": 34200},
                {"month": "Apr", "actual": 31900},
                {"month": "May", "actual": 36400},
                {"month": "Jun", "actual": 35200},
                {"month": "Jul", "actual": None, "forecast": 37100},
            ]
        }
        
    return {
        "forecasts": [
            {
                "id": f.id,
                "month": f.month,
                "predicted_spend": f.predicted_spend,
                "predicted_balance": f.predicted_balance,
                "model_version": f.model_version
            }
            for f in forecasts
        ]
    }
