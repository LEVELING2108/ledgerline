from typing import Any, List, Optional
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Transaction
from app.schemas.schemas import TransactionResponse, TransactionUpdate
from app.services.parser import parse_statement_file
from app.services.categorizer import categorize_transaction
from app.services.detector import detect_anomalies_for_user

router = APIRouter()


@router.get("/", response_model=List[TransactionResponse])
async def read_transactions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    min_amount: Optional[float] = None,
    query: Optional[str] = None,
) -> Any:
    stmt = select(Transaction).where(Transaction.user_id == current_user.id)
    
    if category and category != "All":
        stmt = stmt.where(Transaction.category == category)
    if min_amount:
        # Spending is negative, so minimum absolute amount threshold
        stmt = stmt.where(func.abs(Transaction.amount) >= min_amount)
    if query:
        stmt = stmt.where(Transaction.merchant.ilike(f"%{query}%"))
        
    stmt = stmt.order_by(desc(Transaction.date)).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_transactions(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    # 1. Parse statement
    try:
        contents = await file.read()
        raw_transactions = parse_statement_file(file.filename, contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse statement: {str(e)}"
        )
    
    if not raw_transactions:
        return {"message": "No transactions found in file", "count": 0}
        
    # 2. Map and run auto-categorization
    db_transactions = []
    for raw in raw_transactions:
        # Run ML categorizer
        category = categorize_transaction(
            raw["merchant"],
            raw.get("description", ""),
            user_id=current_user.id
        )
        
        db_tx = Transaction(
            user_id=current_user.id,
            date=raw["date"],
            amount=raw["amount"],
            merchant=raw["merchant"],
            category=category,
            anomaly=False,
            source="upload",
        )
        db_transactions.append(db_tx)
        
    db.add_all(db_transactions)
    await db.commit()
    
    # 3. Run anomaly detection logic on new transactions
    await detect_anomalies_for_user(db, current_user.id)

    # 4. Retrain the personalized categorizer model (Active Learning)
    from app.services.categorizer import retrain_user_model_async
    await retrain_user_model_async(db, current_user.id)
    
    return {
        "message": "Import complete",
        "count": len(db_transactions),
        "date_range": f"{min(t.date for t in db_transactions)} - {max(t.date for t in db_transactions)}" if db_transactions else "N/A"
    }


@router.patch("/{id}/category", response_model=TransactionResponse)
async def update_transaction_category(
    id: str,
    tx_in: TransactionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await db.execute(
        select(Transaction).where(Transaction.id == id, Transaction.user_id == current_user.id)
    )
    transaction = result.scalars().first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    if tx_in.category is not None:
        transaction.category = tx_in.category
        
    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)

    # Retrain model after manual correction (Active Learning Loop)
    from app.services.categorizer import retrain_user_model_async
    await retrain_user_model_async(db, current_user.id)

    return transaction
