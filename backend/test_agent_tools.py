import sys
import asyncio
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.core.database import Base
from app.models.models import User, Transaction, Alert
from app.services.agent import (
    run_agent_query,
    tool_simulate_scenario,
    tool_detect_subscriptions,
    tool_audit_anomalies,
    tool_bulk_recategorize
)

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

async def run_tool_tests():
    print("=== TESTING AGENTIC AI TOOLKIT IN-MEMORY ===")
    engine = create_async_engine(TEST_DB_URL, echo=False)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        user = User(id="user_123", name="Sourav Suman", email="sourav@example.com", password_hash="hash")
        db.add(user)
        
        txs = [
            Transaction(user_id="user_123", date="2026-07-01", amount=-680.0, merchant="Swiggy", category="Dining"),
            Transaction(user_id="user_123", date="2026-07-02", amount=-2450.0, merchant="Big Bazaar", category="Groceries"),
            Transaction(user_id="user_123", date="2026-07-03", amount=-18000.0, merchant="Landlord Rent", category="Rent"),
            Transaction(user_id="user_123", date="2026-07-04", amount=-899.0, merchant="Airtel Broadband", category="Utilities"),
            Transaction(user_id="user_123", date="2026-07-05", amount=-499.0, merchant="Netflix", category="Entertainment"),
            Transaction(user_id="user_123", date="2026-07-06", amount=-45000.0, merchant="Luxury Watch", category="Shopping", anomaly=True),
        ]
        for t in txs: db.add(t)
        await db.commit()

        # 1. Test Scenario Simulator
        print("\n1. Testing 'What-If' Scenario Simulator Tool...")
        ans1, trace1 = await run_agent_query(db, "user_123", "Can I afford a 30000 laptop on 6 months EMI?")
        print(f"Agent Output:\n{ans1}")
        print(f"Trace: {trace1}")

        # 2. Test Subscriptions Audit Tool
        print("\n2. Testing Recurring Subscriptions Audit Tool...")
        ans2, trace2 = await run_agent_query(db, "user_123", "What active subscriptions do I have?")
        print(f"Agent Output:\n{ans2}")
        print(f"Trace: {trace2}")

        # 3. Test Anomaly Audit Tool
        print("\n3. Testing Anomaly Audit Tool...")
        ans3, trace3 = await run_agent_query(db, "user_123", "Show me my unusual spending anomalies")
        print(f"Agent Output:\n{ans3}")
        print(f"Trace: {trace3}")

        # 4. Test Recategorization Tool
        print("\n4. Testing Transaction Recategorization Tool...")
        ans4, trace4 = await run_agent_query(db, "user_123", "change swiggy to groceries")
        print(f"Agent Output:\n{ans4}")
        print(f"Trace: {trace4}")

        # 5. Test SQL Analytics Tool
        print("\n5. Testing SQL Analytics Tool...")
        ans5, trace5 = await run_agent_query(db, "user_123", "how much did I spend on groceries?")
        print(f"Agent Output:\n{ans5}")
        print(f"Trace: {trace5}")

    print("\n=== ALL AGENTIC TOOL TESTS COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    asyncio.run(run_tool_tests())
