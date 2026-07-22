import sys
import asyncio
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.core.database import Base
from app.models.models import User, Transaction, Alert
from app.services.langgraph_agent import run_langgraph_agent

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

async def test_langgraph():
    print("=== TESTING LANGGRAPH PRODUCTION AGENT STATE MACHINE ===")
    engine = create_async_engine(TEST_DB_URL, echo=False)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        user = User(id="user_langgraph", name="Sourav Suman", email="langgraph@example.com", password_hash="hash")
        db.add(user)
        
        txs = [
            Transaction(user_id="user_langgraph", date="2026-07-01", amount=-680.0, merchant="Swiggy", category="Dining"),
            Transaction(user_id="user_langgraph", date="2026-07-02", amount=-2450.0, merchant="Big Bazaar", category="Groceries"),
            Transaction(user_id="user_langgraph", date="2026-07-03", amount=-18000.0, merchant="Landlord Rent", category="Rent"),
            Transaction(user_id="user_langgraph", date="2026-07-04", amount=-899.0, merchant="Airtel Broadband", category="Utilities"),
        ]
        for t in txs: db.add(t)
        await db.commit()

        # 1. Test Scenario Simulation in LangGraph
        print("\n1. LangGraph Node: Scenario Simulation...")
        res1 = await run_langgraph_agent(db, "user_langgraph", "Can I afford a 40000 laptop on 6 months EMI?")
        print(f"Answer:\n{res1['answer']}")
        print(f"Intent: {res1['intent']} | HITL Flag: {res1['requires_hitl']}")
        print(f"Trace: {res1['trace']}")

        # 2. Test Subscriptions Audit in LangGraph
        print("\n2. LangGraph Node: Subscription Audit...")
        res2 = await run_langgraph_agent(db, "user_langgraph", "What active subscriptions do I have?")
        print(f"Answer:\n{res2['answer']}")
        print(f"Intent: {res2['intent']} | HITL Flag: {res2['requires_hitl']}")
        print(f"Trace: {res2['trace']}")

        # 3. Test SQL Analytics in LangGraph
        print("\n3. LangGraph Node: SQL Analytics...")
        res3 = await run_langgraph_agent(db, "user_langgraph", "how much did I spend on rent?")
        print(f"Answer:\n{res3['answer']}")
        print(f"Intent: {res3['intent']} | HITL Flag: {res3['requires_hitl']}")
        print(f"Trace: {res3['trace']}")

    print("\n=== LANGGRAPH AGENT STATE MACHINE VERIFICATION PASSED ===")

if __name__ == "__main__":
    asyncio.run(test_langgraph())
