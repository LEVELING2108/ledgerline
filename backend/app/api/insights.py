from datetime import datetime
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
    
    # Calculate month-specific metrics
    current_month_str = datetime.now().strftime("%Y-%m")
    
    current_month_txs = [t for t in user_txs if t.date.startswith(current_month_str)]
    target_txs = current_month_txs if current_month_txs else user_txs
    
    total_spend = sum((t.amount / t.split_ratio) for t in target_txs if t.amount < 0 and t.category not in ("Investment", "Contra"))
    total_investment = sum(abs(t.amount / t.split_ratio) for t in target_txs if t.category == "Investment")
    
    # Category breakdown from target transactions
    categories_breakdown = {}
    bank_breakdown = {}
    
    for t in target_txs:
        if t.amount < 0 and t.category not in ("Investment", "Contra"):
            cat_name = t.category
            categories_breakdown[cat_name] = categories_breakdown.get(cat_name, 0.0) + abs(t.amount / t.split_ratio)
            b_name = getattr(t, "bank_name", "HDFC Bank") or "HDFC Bank"
            bank_breakdown[b_name] = bank_breakdown.get(b_name, 0.0) + abs(t.amount / t.split_ratio)
            
    breakdown_list = [
        {"category": k, "amount": round(v, 2)} for k, v in categories_breakdown.items()
    ]
    breakdown_list.sort(key=lambda x: x["amount"], reverse=True)
    
    bank_list = [
        {"bank_name": k, "amount": round(v, 2)} for k, v in bank_breakdown.items()
    ]
    bank_list.sort(key=lambda x: x["amount"], reverse=True)
    
    # Open anomalies
    alert_result = await db.execute(
        select(Alert).where(Alert.user_id == current_user.id, Alert.resolved == False)
    )
    open_alerts_count = len(alert_result.scalars().all())
    
    # Fallback to zero values if user has no transactions yet
    if not user_txs:
        return {
            "this_month_spend": 0.0,
            "delta_label": "No statement uploaded yet",
            "tone": "neutral",
            "open_anomalies_count": 0,
            "category_breakdown": [],
            "bank_breakdown": [],
            "total_investment": 0.0
        }
        
    abs_spend = abs(total_spend)
    return {
        "this_month_spend": total_spend,
        "delta_label": f"₹{abs_spend:,.2f} calculated across {len(target_txs)} transactions",
        "tone": "neutral" if total_spend == 0 else ("positive" if abs_spend < 40000 else "negative"),
        "open_anomalies_count": open_alerts_count,
        "category_breakdown": breakdown_list,
        "bank_breakdown": bank_list,
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
        return {
            "month": datetime.now().strftime("%Y-%m"),
            "forecast_spend": 0.0,
            "delta_label": "No forecast data available yet",
            "tone": "neutral",
            "monthly_trend": []
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
