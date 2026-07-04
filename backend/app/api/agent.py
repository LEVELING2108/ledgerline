from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User
from app.schemas.schemas import ChatAskRequest, ChatAskResponse
from app.services.agent import run_agent_query

router = APIRouter()


@router.post("/ask", response_model=ChatAskResponse)
async def ask_agent(
    req: ChatAskRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    if not req.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty"
        )
        
    try:
        # Run agent query with sandboxed user-scoped SQL execution
        answer, sql_trace = await run_agent_query(db, current_user.id, req.question)
        return ChatAskResponse(answer=answer, trace=sql_trace)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent error: {str(e)}"
        )
