from typing import List
import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from prophet import Prophet

from app.models.models import Transaction, Forecast


async def generate_forecast_for_user(db: AsyncSession, user_id: str) -> List[Forecast]:
    """
    Time-series forecasting pipeline:
    1. Retrieve historical transaction history.
    2. Format transaction dates and amounts into time-series.
    3. Run Prophet to forecast next month's spending.
    4. Save forecast records to database.
    """
    result = await db.execute(
        select(Transaction).where(Transaction.user_id == user_id)
    )
    transactions = result.scalars().all()
    
    if len(transactions) < 5:
        # Standard fallback forecasts if data is not enough to train Prophet
        forecast_spend = 37100.0
        forecast_balance = 82000.0
        
        forecast = Forecast(
            user_id=user_id,
            month="2026-07",
            predicted_spend=forecast_spend,
            predicted_balance=forecast_balance,
            model_version="heuristic-v1",
        )
        db.add(forecast)
        await db.commit()
        await db.refresh(forecast)
        return [forecast]
        
    # Build historical daily/weekly timeline for Prophet
    df = pd.DataFrame([{
        "ds": pd.to_datetime(t.date, errors="coerce"),
        "y": abs(t.amount) if t.amount < 0 else 0
    } for t in transactions])
    df = df.dropna(subset=["ds"])
    
    # Resample daily
    df_daily = df.groupby("ds").sum().reset_index()
    
    # Run Prophet
    try:
        model = Prophet(yearly_seasonality=False, weekly_seasonality=True, daily_seasonality=False)
        model.fit(df_daily)
        
        future = model.make_future_dataframe(periods=30)
        forecast_df = model.predict(future)
        
        # Calculate next month's projected spend
        next_month_df = forecast_df.iloc[-30:]
        predicted_spend_sum = float(next_month_df["yhat"].sum())
        
        # Save forecast
        forecast = Forecast(
            user_id=user_id,
            month="2026-07",
            predicted_spend=round(predicted_spend_sum, 2),
            predicted_balance=85000.0,  # placeholder balance calculation
            model_version="prophet-v1",
        )
        db.add(forecast)
        await db.commit()
        await db.refresh(forecast)
        return [forecast]
    except Exception:
        # Fallback if Prophet throws error (e.g. data matrix singular)
        avg_spend = sum(abs(t.amount) for t in transactions if t.amount < 0) / max(1, len(transactions))
        forecast = Forecast(
            user_id=user_id,
            month="2026-07",
            predicted_spend=round(avg_spend * 30, 2),
            predicted_balance=75000.0,
            model_version="fallback-v1",
        )
        db.add(forecast)
        await db.commit()
        await db.refresh(forecast)
        return [forecast]
