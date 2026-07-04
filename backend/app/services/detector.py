import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sklearn.ensemble import IsolationForest

from app.models.models import Transaction, Alert


async def detect_anomalies_for_user(db: AsyncSession, user_id: str):
    """
    Personalized anomaly detection pipeline:
    1. Fetch all user transactions.
    2. Fit an IsolationForest model on transaction absolute amounts if data is sufficient.
    3. Generate alert records for anomalous rows.
    """
    result = await db.execute(
        select(Transaction).where(Transaction.user_id == user_id)
    )
    transactions = result.scalars().all()
    
    if len(transactions) < 5:
        # Fallback to simple heuristic: check for transactions > 5x average
        amounts = [abs(t.amount) for t in transactions if t.amount < 0]
        if not amounts:
            return
            
        avg_amount = np.mean(amounts)
        for tx in transactions:
            if tx.amount < 0 and abs(tx.amount) > 5 * avg_amount:
                # Flag anomaly
                tx.anomaly = True
                db.add(tx)
                
                # Check if alert already exists to prevent duplicate alerts
                alert_check = await db.execute(
                    select(Alert).where(Alert.transaction_id == tx.id)
                )
                if not alert_check.scalars().first():
                    alert = Alert(
                        user_id=user_id,
                        transaction_id=tx.id,
                        title=f"Unusual charge at {tx.merchant}",
                        detail=f"₹{abs(tx.amount):,.2f} is significantly higher than your typical average spend.",
                        date=tx.date,
                        resolved=False,
                    )
                    db.add(alert)
        await db.commit()
        return
        
    # Fit Isolation Forest
    amounts_arr = np.array([abs(t.amount) for t in transactions]).reshape(-1, 1)
    
    # Train unsupervised IsolationForest
    # contamination = 0.1 means we expect roughly 10% anomalies
    model = IsolationForest(contamination=0.1, random_state=42)
    model.fit(amounts_arr)
    preds = model.predict(amounts_arr)  # 1 for normal, -1 for anomaly
    
    for i, tx in enumerate(transactions):
        if preds[i] == -1:
            tx.anomaly = True
            db.add(tx)
            
            # Check if alert exists
            alert_check = await db.execute(
                select(Alert).where(Alert.transaction_id == tx.id)
            )
            if not alert_check.scalars().first():
                alert = Alert(
                    user_id=user_id,
                    transaction_id=tx.id,
                    title=f"Anomaly detected at {tx.merchant}",
                    detail=f"₹{abs(tx.amount):,.2f} transaction flagged as anomalous by personalized model.",
                    date=tx.date,
                    resolved=False,
                )
                db.add(alert)
                
    await db.commit()
