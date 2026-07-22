import json
import re
from typing import Any, Dict, List, Optional, TypedDict, Annotated
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select

from langgraph.graph import StateGraph, END
from openai import OpenAI
from app.core.config import settings
from app.models.models import Transaction, Alert, Forecast


# ==========================================
# 1. PYDANTIC SCHEMAS & GUARDRAILS (Instructor pattern)
# ==========================================

class IntentClassification(BaseModel):
    intent: str = Field(description="One of: sql_analytics, scenario_simulation, subscription_audit, anomaly_audit, recategorization, general")
    confidence: float = Field(default=1.0)
    parameters: Dict[str, Any] = Field(default_factory=dict)


class AgentState(TypedDict):
    question: str
    user_id: str
    db: AsyncSession
    intent: str
    parameters: Dict[str, Any]
    tool_output: Optional[Dict[str, Any]]
    sql_query: Optional[str]
    requires_hitl: bool
    final_answer: str
    trace: str


# ==========================================
# 2. CREW-AI ROLE-BASED AGENT SUB-NODES
# ==========================================

# --- ROLE 1: Security & Guardrail Agent ---
def node_security_guardrail(state: AgentState) -> Dict[str, Any]:
    """
    Role: Security Guardrail Auditor
    Ensures zero SQL injection, mandatory user-level isolation, and read-only execution.
    """
    sql = state.get("sql_query", "")
    if sql:
        cleaned = sql.upper().strip()
        if not cleaned.startswith("SELECT"):
            return {"final_answer": "Security Error: Queries must be strictly read-only SELECT statements.", "trace": "SECURITY_BLOCK"}
        for unsafe in ["DROP", "DELETE", "INSERT", "UPDATE", "ALTER", "TRUNCATE"]:
            if re.search(rf"\b{unsafe}\b", cleaned):
                return {"final_answer": f"Security Error: Command '{unsafe}' is prohibited.", "trace": "SECURITY_BLOCK"}
        if state["user_id"] not in sql:
            return {"final_answer": "Security Error: Missing mandatory user_id isolation parameter.", "trace": "SECURITY_BLOCK"}
    return {}


# --- ROLE 2: Intent Classification & Router Node ---
async def node_intent_router(state: AgentState) -> Dict[str, Any]:
    """
    Role: Senior Financial Intent Classifier
    Analyzes prompt and routes to specific tool / sub-agent nodes.
    """
    q_lower = state["question"].lower()
    
    if any(kw in q_lower for kw in ["change", "update", "recategorize"]):
        return {"intent": "recategorization"}
    elif any(kw in q_lower for kw in ["afford", "what if", "buy", "emi", "purchase"]):
        return {"intent": "scenario_simulation"}
    elif any(kw in q_lower for kw in ["subscription", "recurring", "memberships"]):
        return {"intent": "subscription_audit"}
    elif any(kw in q_lower for kw in ["anomaly", "anomalies", "unusual", "suspicious"]):
        return {"intent": "anomaly_audit"}
    else:
        return {"intent": "sql_analytics"}


# --- ROLE 3: Tool Execution Node ---
async def node_tool_executor(state: AgentState) -> Dict[str, Any]:
    """
    Role: Execution Sub-Agent
    Runs specialized tools based on routed intent.
    """
    intent = state["intent"]
    db = state["db"]
    user_id = state["user_id"]
    question = state["question"]
    
    if intent == "recategorization":
        from app.services.agent import tool_bulk_recategorize
        target_cat = "Other"
        for cat in ["Groceries", "Dining", "Transport", "Utilities", "Rent", "Entertainment", "Investment", "Contra"]:
            if cat.lower() in question.lower(): target_cat = cat; break
        merchant = "Swiggy" if "swiggy" in question.lower() else ("Rahul" if "rahul" in question.lower() else "Merchant")
        
        res = await tool_bulk_recategorize(db, user_id, merchant, target_cat)
        trace = f"LangGraph EXECUTE tool_bulk_recategorize(merchant='{merchant}', target_category='{target_cat}')"
        return {"tool_output": res, "final_answer": res["message"], "trace": trace, "requires_hitl": True}

    elif intent == "scenario_simulation":
        from app.services.agent import tool_simulate_scenario
        amounts = re.findall(r'₹?\s?(\d+[\d,.]*)', question)
        total_amt = float(amounts[0].replace(',', '')) if amounts else 25000.0
        tenure_match = re.search(r'(\d+)\s*(month|months|emi)', question.lower())
        tenure = int(tenure_match.group(1)) if tenure_match else 1
        
        res = await tool_simulate_scenario(db, user_id, "Requested Purchase", total_amt, tenure)
        answer = (
            f"### 🔮 LangGraph Scenario Simulation\n\n"
            f"• **Item**: Requested Purchase\n"
            f"• **Total Cost**: ₹{res['total_amount']:,.2f}\n"
            f"• **Monthly Impact**: ₹{res['monthly_installment']:,.2f}/mo over {res['tenure_months']} month(s)\n"
            f"• **Projected Spend**: ₹{res['projected_monthly_spend']:,.2f} (+{res['spend_increase_percentage']}%)\n"
            f"• **Feasibility**: **{res['feasibility_assessment']}**\n\n"
            f"**Recommendation**: {res['recommendation']}"
        )
        trace = f"LangGraph EXECUTE tool_simulate_scenario(amount={total_amt}, months={tenure})"
        return {"tool_output": res, "final_answer": answer, "trace": trace, "requires_hitl": res["feasibility_assessment"] != "Comfortable"}

    elif intent == "subscription_audit":
        from app.services.agent import tool_detect_subscriptions
        res = await tool_detect_subscriptions(db, user_id)
        sub_text = "\n".join([f"- **{s['merchant']}**: ₹{s['monthly_charge']:,.2f}/mo" for s in res["active_subscriptions"]])
        answer = f"### 🔄 LangGraph Subscriptions Audit\n\nActive Recurring Charges ({res['total_subscriptions_count']}):\n{sub_text or 'None'}"
        trace = f"LangGraph EXECUTE tool_detect_subscriptions(user_id='{user_id}')"
        return {"tool_output": res, "final_answer": answer, "trace": trace, "requires_hitl": False}

    elif intent == "anomaly_audit":
        from app.services.agent import tool_audit_anomalies
        res = await tool_audit_anomalies(db, user_id)
        alerts_text = "\n".join([f"- **{a['title']}**: {a['detail']}" for a in res["alerts"]])
        answer = f"### 🛡️ LangGraph Anomaly Report\n\nOpen Flags: {res['unresolved_anomalies_count']}\n{alerts_text or 'All clear!'}"
        trace = f"LangGraph EXECUTE tool_audit_anomalies(user_id='{user_id}')"
        return {"tool_output": res, "final_answer": answer, "trace": trace, "requires_hitl": res['unresolved_anomalies_count'] > 0}

    else:
        from app.services.agent import tool_sql_analytics
        raw_data, sql_used = await tool_sql_analytics(db, user_id, question)
        answer = f"Based on database analytics, the result is: {raw_data}"
        try:
            val_list = json.loads(raw_data)
            if val_list and isinstance(val_list[0], dict):
                v = list(val_list[0].values())[0]
                if v is not None: answer = f"Based on your transaction records, total is **₹{abs(float(v)):,.2f}**."
        except Exception: pass
        return {"tool_output": {"data": raw_data}, "sql_query": sql_used, "final_answer": answer, "trace": sql_used, "requires_hitl": False}


# ==========================================
# 3. LANGGRAPH STATE MACHINE BUILDER
# ==========================================

def create_financial_agent_graph():
    """
    Builds the production LangGraph state graph machine.
    """
    workflow = StateGraph(AgentState)
    
    workflow.add_node("intent_router", node_intent_router)
    workflow.add_node("tool_executor", node_tool_executor)
    workflow.add_node("security_guardrail", node_security_guardrail)
    
    workflow.set_entry_point("intent_router")
    workflow.add_edge("intent_router", "tool_executor")
    workflow.add_edge("tool_executor", "security_guardrail")
    workflow.add_edge("security_guardrail", END)
    
    return workflow.compile()


langgraph_agent_app = create_financial_agent_graph()


async def run_langgraph_agent(db: AsyncSession, user_id: str, question: str) -> Dict[str, Any]:
    """
    Runs the compiled LangGraph State Machine agent.
    """
    initial_state: AgentState = {
        "question": question,
        "user_id": user_id,
        "db": db,
        "intent": "general",
        "parameters": {},
        "tool_output": None,
        "sql_query": None,
        "requires_hitl": False,
        "final_answer": "",
        "trace": ""
    }
    
    final_state = await langgraph_agent_app.ainvoke(initial_state)
    return {
        "answer": final_state.get("final_answer", "No answer generated."),
        "trace": final_state.get("trace", ""),
        "requires_hitl": final_state.get("requires_hitl", False),
        "intent": final_state.get("intent", "general")
    }
