import asyncio
import uuid
from datetime import datetime, timedelta
from sqlalchemy import select, delete
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.models import User, Transaction, Alert, Forecast

async def seed_data():
    print("Seeding database with demo user and financial data...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        # Check if test user exists
        res = await db.execute(select(User).where(User.email == "test@ledgerline.com"))
        user = res.scalars().first()

        if user:
            print("Existing test user found, updating user record...")
            user.password_hash = get_password_hash("Password123")
            user.name = "Demo User"
            db.add(user)
        else:
            print("Creating new demo user: test@ledgerline.com...")
            user = User(
                id=str(uuid.uuid4()),
                email="test@ledgerline.com",
                name="Demo User",
                password_hash=get_password_hash("Password123")
            )
            db.add(user)
            await db.flush()

        user_id = user.id

        # Clean existing transactions/alerts for clean demo state
        await db.execute(delete(Alert).where(Alert.user_id == user_id))
        await db.execute(delete(Transaction).where(Transaction.user_id == user_id))
        await db.execute(delete(Forecast).where(Forecast.user_id == user_id))
        await db.commit()

        # Seed realistic transactions
        sample_txs = [
            # Date, Merchant, Amount (negative for spend), Category, Anomaly, Source
            ("2026-07-01", "Landlord Rent", -18000.00, "Rent", False, "upload"),
            ("2026-07-02", "Big Bazaar", -3450.00, "Groceries", False, "upload"),
            ("2026-07-03", "Swiggy", -680.00, "Dining", False, "upload"),
            ("2026-07-04", "Airtel Broadband", -899.00, "Utilities", False, "upload"),
            ("2026-07-05", "Zomato", -450.00, "Dining", False, "upload"),
            ("2026-07-06", "Ola Cabs", -320.00, "Transport", False, "upload"),
            ("2026-07-08", "Groww Mutual Fund SIP", -5000.00, "Investment", False, "upload"),
            ("2026-07-10", "Netflix", -649.00, "Entertainment", False, "upload"),
            ("2026-07-12", "Spotify India", -119.00, "Entertainment", False, "upload"),
            ("2026-07-14", "Reliance Fresh", -1850.00, "Groceries", False, "upload"),
            ("2026-07-15", "Uber Rides", -410.00, "Transport", False, "upload"),
            ("2026-07-18", "Luxury Electronics Store", -45000.00, "Other", True, "upload"),
            ("2026-07-20", "Chai Point", -95.00, "Dining", False, "upload"),
            ("2026-07-22", "Electricity Department", -2100.00, "Utilities", False, "upload")
        ]

        tx_objects = []
        for d, m, a, c, is_anom, src in sample_txs:
            t = Transaction(
                id=str(uuid.uuid4()),
                user_id=user_id,
                date=d,
                merchant=m,
                amount=a,
                category=c,
                anomaly=is_anom,
                source=src
            )
            tx_objects.append(t)
            db.add(t)

        await db.flush()

        # Seed Anomaly Alert for the high luxury spend
        luxury_tx = next(t for t in tx_objects if t.merchant == "Luxury Electronics Store")
        alert = Alert(
            id=str(uuid.uuid4()),
            user_id=user_id,
            transaction_id=luxury_tx.id,
            title="Unusual High Spend Alert",
            detail="Transaction of ₹45,000.00 at Luxury Electronics Store is 12x higher than your average spend.",
            date="2026-07-18",
            resolved=False
        )
        db.add(alert)

        # Seed Cash Flow Forecast
        forecast = Forecast(
            id=str(uuid.uuid4()),
            user_id=user_id,
            month="2026-08",
            predicted_spend=32500.00,
            predicted_balance=85000.00,
            model_version="prophet-v1"
        )
        db.add(forecast)

        await db.commit()
        print("\nSeed completed successfully!")
        print("---------------------------------------")
        print("Demo User Credentials:")
        print("  Email:    test@ledgerline.com")
        print("  Password: Password123")
        print("---------------------------------------")

if __name__ == "__main__":
    asyncio.run(seed_data())
