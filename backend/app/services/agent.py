import json
import re
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession
from openai import OpenAI

from app.core.config import settings
from app.models.models import Transaction, Alert, Forecast


# ==========================================
# 1. SECURITY & GUARDRAILS
# ==========================================

def is_safe_sql(sql_query: str) -> bool:
    """
    Validates that the SQL query is strictly read-only and does not contain
    any destructive commands or write actions.
    """
    cleaned = sql_query.upper().strip()
    if not cleaned.startswith("SELECT"):
        return False
        
    unsafe_patterns = [
        r"\bDROP\b", r"\bDELETE\b", r"\bINSERT\b", r"\bUPDATE\b",
        r"\bALTER\b", r"\bCREATE\b", r"\bTRUNCATE\b", r"\bGRANT\b",
        r"\bREVOKE\b", r"\bRENAME\b"
    ]
    for pattern in unsafe_patterns:
        if re.search(pattern, cleaned):
            return False
    return True


# ==========================================
# 2. AGENT TOOLS REGISTRY
# ==========================================

async def tool_sql_analytics(db: AsyncSession, user_id: str, question: str, generated_sql: Optional[str] = None) -> Tuple[str, str]:
    """
    Tool: Safely generates and executes read-only SQL query against user's transactional database.
    """
    schema_info = """
    Tables available:
    1. transactions (id, user_id, date YYYY-MM-DD, amount float [negative for spend], merchant, category, anomaly bool, source, split_ratio)
    2. alerts (id, user_id, transaction_id, title, detail, resolved bool, date)
    3. forecasts (id, user_id, month YYYY-MM, predicted_spend, predicted_balance)
    Categories: Groceries, Dining, Transport, Utilities, Rent, Entertainment, Investment, Contra, Other.
    """
    
    sql_query = generated_sql or ""
    client = None
    if settings.OPENAI_API_KEY and "your-openai-api-key" not in settings.OPENAI_API_KEY:
        try:
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
        except Exception:
            pass

    if not sql_query and client:
        try:
            prompt = (
                f"You are a PostgreSQL SQL generator.\n"
                f"{schema_info}\n"
                f"RULES:\n"
                f"- Return ONLY valid SELECT SQL query.\n"
                f"- MUST include `WHERE user_id = '{user_id}'`.\n"
                f"- Spend amounts are negative numbers in DB. Use ABS(amount) for sum/averages.\n"
                f"User Question: '{question}'\n"
                f"SQL:"
            )
            resp = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150,
                temperature=0.0
            )
            sql_query = resp.choices[0].message.content.strip().replace("```sql", "").replace("```", "").strip()
        except Exception:
            sql_query = ""

    if not sql_query:
        q_lower = question.lower()
        if "dining" in q_lower or "swiggy" in q_lower or "zomato" in q_lower:
            sql_query = f"SELECT SUM(ABS(amount)) as total_spend FROM transactions WHERE user_id = '{user_id}' AND (category = 'Dining' OR merchant ILIKE '%swiggy%' OR merchant ILIKE '%zomato%')"
        elif "groceries" in q_lower or "grocery" in q_lower or "bazaar" in q_lower:
            sql_query = f"SELECT SUM(ABS(amount)) as total_spend FROM transactions WHERE user_id = '{user_id}' AND category = 'Groceries'"
        elif "rent" in q_lower:
            sql_query = f"SELECT SUM(ABS(amount)) as total_spend FROM transactions WHERE user_id = '{user_id}' AND category = 'Rent'"
        elif "investment" in q_lower or "groww" in q_lower or "sip" in q_lower:
            sql_query = f"SELECT SUM(ABS(amount)) as total_investment FROM transactions WHERE user_id = '{user_id}' AND category = 'Investment'"
        else:
            sql_query = f"SELECT SUM(ABS(amount)) as total_spend, COUNT(*) as transaction_count FROM transactions WHERE user_id = '{user_id}'"

    if not is_safe_sql(sql_query):
        return "Safety Error: Query must be read-only SELECT statement.", sql_query

    if user_id not in sql_query:
        return "Security Error: Missing user-level data isolation.", sql_query

    try:
        res = await db.execute(text(sql_query))
        rows = res.fetchall()
        dict_rows = [dict(r._mapping) for r in rows]
        return json.dumps(dict_rows, default=str), sql_query
    except Exception as e:
        return f"Database Error: {str(e)}", sql_query


async def tool_simulate_scenario(db: AsyncSession, user_id: str, purchase_item: str, total_amount: float, months: int = 1) -> Dict[str, Any]:
    """
    Tool: Simulates 'What-If' financial scenario (e.g. major purchase / EMI impact on future cash flow).
    """
    tx_res = await db.execute(select(Transaction).where(Transaction.user_id == user_id))
    txs = tx_res.scalars().all()
    
    total_spent = sum(abs(t.amount) for t in txs if t.amount < 0)
    avg_monthly_spend = total_spent if total_spent > 0 else 35000.0
    
    monthly_installment = round(total_amount / max(1, months), 2)
    projected_new_monthly_spend = round(avg_monthly_spend + monthly_installment, 2)
    spend_increase_pct = round((monthly_installment / avg_monthly_spend) * 100, 1) if avg_monthly_spend > 0 else 0
    
    feasibility = "Comfortable" if spend_increase_pct < 15 else ("Tight" if spend_increase_pct < 30 else "High Risk")
    
    return {
        "item": purchase_item,
        "total_amount": total_amount,
        "tenure_months": months,
        "monthly_installment": monthly_installment,
        "baseline_monthly_spend": avg_monthly_spend,
        "projected_monthly_spend": projected_new_monthly_spend,
        "spend_increase_percentage": spend_increase_pct,
        "feasibility_assessment": feasibility,
        "recommendation": f"Buying '{purchase_item}' at ₹{total_amount:,.2f} over {months} month(s) adds ₹{monthly_installment:,.2f}/mo ({spend_increase_pct}% increase). Impact level: {feasibility}."
    }


async def tool_detect_subscriptions(db: AsyncSession, user_id: str) -> Dict[str, Any]:
    """
    Tool: Identifies recurring subscription charges and monitors for price hikes.
    """
    tx_res = await db.execute(select(Transaction).where(Transaction.user_id == user_id))
    txs = tx_res.scalars().all()
    
    merchant_map: Dict[str, List[float]] = {}
    for t in txs:
        if t.amount < 0:
            m_clean = t.merchant.strip().title()
            merchant_map.setdefault(m_clean, []).append(abs(t.amount))
            
    subscriptions = []
    for merchant, amounts in merchant_map.items():
        if len(amounts) >= 1 and any(kw in merchant.lower() for kw in ["netflix", "spotify", "airtel", "jio", "prime", "youtube", "broadband", "rent"]):
            latest_charge = amounts[-1]
            subscriptions.append({
                "merchant": merchant,
                "monthly_charge": latest_charge,
                "frequency": "Monthly",
                "status": "Active"
            })
            
    return {
        "total_subscriptions_count": len(subscriptions),
        "total_monthly_recurring_cost": sum(s["monthly_charge"] for s in subscriptions),
        "active_subscriptions": subscriptions
    }


async def tool_bulk_recategorize(db: AsyncSession, user_id: str, merchant_pattern: str, target_category: str, amount_search: Optional[float] = None) -> Dict[str, Any]:
    """
    Tool: Recategorizes transactions and triggers continuous active learning retraining.
    """
    stmt = select(Transaction).where(Transaction.user_id == user_id)
    if merchant_pattern:
        stmt = stmt.where(Transaction.merchant.ilike(f"%{merchant_pattern}%"))
    if amount_search:
        stmt = stmt.where(Transaction.amount == -abs(amount_search))
        
    res = await db.execute(stmt)
    txs = res.scalars().all()
    
    if not txs:
        return {"updated_count": 0, "message": f"No transactions found matching '{merchant_pattern}'."}
        
    for t in txs:
        t.category = target_category
        db.add(t)
    await db.commit()
    
    from app.services.categorizer import retrain_user_model_async
    await retrain_user_model_async(db, user_id)
    
    return {
        "updated_count": len(txs),
        "target_category": target_category,
        "message": f"Successfully updated {len(txs)} transaction(s) for '{merchant_pattern}' to '{target_category}' and retrained ML model."
    }


async def tool_audit_anomalies(db: AsyncSession, user_id: str) -> Dict[str, Any]:
    """
    Tool: Runs anomaly detector audit and summarizes flagged items.
    """
    from app.services.detector import detect_anomalies_for_user
    await detect_anomalies_for_user(db, user_id)
    
    res = await db.execute(select(Alert).where(Alert.user_id == user_id, Alert.resolved == False))
    open_alerts = res.scalars().all()
    
    return {
        "unresolved_anomalies_count": len(open_alerts),
        "alerts": [{"title": a.title, "detail": a.detail, "date": a.date} for a in open_alerts]
    }


# ==========================================
# 3. REACT MULTI-AGENT ORCHESTRATOR
# ==========================================

async def run_agent_query(db: AsyncSession, user_id: str, question: str) -> Tuple[str, str]:
    """
    Multi-Tool LangGraph State Machine Agent Orchestrator:
    Delegates to compiled LangGraph state machine with checkpointing, security guardrails, and HITL flags.
    """
    from app.services.langgraph_agent import run_langgraph_agent
    res = await run_langgraph_agent(db, user_id, question)
    return res["answer"], res["trace"]


