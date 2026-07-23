from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


# --- TOKEN SCHEMAS ---
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# --- USER SCHEMAS ---
class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- TRANSACTION SCHEMAS ---
class TransactionBase(BaseModel):
    date: str  # YYYY-MM-DD
    amount: float
    merchant: str
    category: str
    anomaly: bool = False
    source: str = "upload"
    bank_name: str = "HDFC Bank"
    split_ratio: int = 1


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    category: Optional[str] = None
    anomaly: Optional[bool] = None
    bank_name: Optional[str] = None
    split_ratio: Optional[int] = None


class TransactionResponse(TransactionBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- ALERT SCHEMAS ---
class AlertBase(BaseModel):
    title: str
    detail: str
    date: str
    resolved: bool = False


class AlertCreate(AlertBase):
    transaction_id: str


class AlertUpdate(BaseModel):
    resolved: Optional[bool] = None


class AlertResponse(AlertBase):
    id: str
    user_id: str
    transaction_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- FORECAST SCHEMAS ---
class ForecastBase(BaseModel):
    month: str  # YYYY-MM
    predicted_spend: float
    predicted_balance: float
    model_version: str = "prophet-v1"


class ForecastCreate(ForecastBase):
    pass


class ForecastResponse(ForecastBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- CHAT / AGENT SCHEMAS ---
class ChatMessage(BaseModel):
    role: str  # user / assistant
    text: str
    trace: Optional[str] = None


class ChatAskRequest(BaseModel):
    question: str


class ChatAskResponse(BaseModel):
    answer: str
    trace: Optional[str] = None
