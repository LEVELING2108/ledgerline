import re
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from openai import OpenAI

from app.core.config import settings


def is_safe_sql(sql_query: str) -> bool:
    """
    Validates that the SQL query is strictly read-only and does not contain
    any destructive commands or write actions.
    """
    cleaned = sql_query.upper().strip()
    
    # 1. Must start with SELECT
    if not cleaned.startswith("SELECT"):
        return False
        
    # 2. Reject key destructive words
    unsafe_patterns = [
        r"\bDROP\b",
        r"\bDELETE\b",
        r"\bINSERT\b",
        r"\bUPDATE\b",
        r"\bALTER\b",
        r"\bCREATE\b",
        r"\bTRUNCATE\b",
        r"\bGRANT\b",
        r"\bREVOKE\b",
        r"\bRENAME\b"
    ]
    for pattern in unsafe_patterns:
        if re.search(pattern, cleaned):
            return False
            
    return True


async def run_agent_query(db: AsyncSession, user_id: str, question: str) -> tuple[str, str]:
    """
    LangGraph/Agent text-to-SQL execution:
    1. Translate natural language to SQL query.
    2. Enforce safety checks (read-only SELECT only).
    3. Enforce user-scoping security (must filter by user_id = :user_id).
    4. Run query inside safe context.
    5. Format output into natural answer.
    """
    schema_info = """
    We have the following tables:
    1. transactions:
       - id: VARCHAR (primary key)
       - user_id: VARCHAR (foreign key to users.id)
       - date: VARCHAR (date in YYYY-MM-DD format)
       - amount: FLOAT (negative for spending, e.g. -2450.0)
       - merchant: VARCHAR
       - category: VARCHAR (Groceries, Dining, Transport, Utilities, Rent, Entertainment, Other)
       - anomaly: BOOLEAN
       - source: VARCHAR
    2. alerts:
       - id: VARCHAR (primary key)
       - user_id: VARCHAR
       - transaction_id: VARCHAR
       - title: VARCHAR
       - detail: VARCHAR
       - resolved: BOOLEAN
    """
    
    sql_query = ""
    # 1. Generate SQL query if OpenAI is configured
    if settings.OPENAI_API_KEY:
        try:
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            prompt = (
                f"You are a SQL generation assistant for PostgreSQL.\n"
                f"Schema description:\n{schema_info}\n"
                f"CRITICAL RULES:\n"
                f"- You MUST only return the SQL code inside a SELECT statement. Do not output anything else.\n"
                f"- You MUST filter all queries by user_id = '{user_id}' to ensure data separation.\n"
                f"- Spending values in the database are negative numbers. Sums/averages should reflect absolute values where appropriate.\n"
                f"Question: '{question}'\n"
                f"SQL Query:"
            )
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150,
                temperature=0.0
            )
            sql_query = response.choices[0].message.content.strip()
            
            # Clean up formatting (e.g. markdown code blocks)
            sql_query = sql_query.replace("```sql", "").replace("```", "").strip()
        except Exception as e:
            sql_query = ""
            
    # 2. Fallback SQL query mapping if no LLM or if generation failed
    if not sql_query:
        # Simple heuristics for demo questions
        q_lower = question.lower()
        if "dining" in q_lower or "restaurant" in q_lower:
            sql_query = f"SELECT SUM(amount) FROM transactions WHERE user_id = '{user_id}' AND category = 'Dining'"
        elif "groceries" in q_lower or "grocery" in q_lower:
            sql_query = f"SELECT SUM(amount) FROM transactions WHERE user_id = '{user_id}' AND category = 'Groceries'"
        elif "rent" in q_lower:
            sql_query = f"SELECT SUM(amount) FROM transactions WHERE user_id = '{user_id}' AND category = 'Rent'"
        else:
            sql_query = f"SELECT SUM(amount) FROM transactions WHERE user_id = '{user_id}'"
            
    # 3. Security validation
    if not is_safe_sql(sql_query):
        return "Sorry, I can only generate and execute read-only queries.", sql_query
        
    # Double-check that user_id constraint is explicitly present to prevent data leakage
    if user_id not in sql_query:
        return "Access denied: The generated query lacks user isolation parameters.", sql_query
        
    # 4. Execute the SQL query inside safe SQLAlchemy context
    try:
        result = await db.execute(text(sql_query))
        rows = result.fetchall()
        result_text = str([dict(row._mapping) for row in rows])
    except Exception as e:
        return f"Error executing query: {str(e)}", sql_query
        
    # 5. Format results back into natural language
    if settings.OPENAI_API_KEY:
        try:
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            prompt = (
                f"Format the database query result into a concise, polite financial response to the user's question.\n"
                f"Question: '{question}'\n"
                f"Database output: {result_text}\n"
                f"Note: values of amount are negative for spend.\n"
                f"Answer:"
            )
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=100,
                temperature=0.3
            )
            return response.choices[0].message.content.strip(), sql_query
        except Exception:
            pass
            
    # Heuristic format fallback
    return f"Based on your transactions, the matching sum of amount is {result_text}.", sql_query
