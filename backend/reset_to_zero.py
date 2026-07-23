import asyncio
from sqlalchemy import delete
from app.core.database import SessionLocal
from app.models.models import Transaction, Alert, Forecast

async def reset_db():
    print("Wiping artificial demo data from database...")
    async with SessionLocal() as db:
        await db.execute(delete(Alert))
        await db.execute(delete(Transaction))
        await db.execute(delete(Forecast))
        await db.commit()
    print("Clean reset complete! All transactions, alerts, and forecasts reset to ZERO.")

if __name__ == "__main__":
    asyncio.run(reset_db())
