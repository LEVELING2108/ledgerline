import os
import pickle
import pandas as pd
from datetime import datetime
from typing import Dict, List, Optional, Any
from openai import OpenAI
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.models import Transaction

# Directory to save user-specific ML models
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

# Lightweight baseline categorizer keyword mapping
CATEGORIES_KEYWORDS = {
    "Groceries": ["bazaar", "mart", "supermarket", "groceries", "reliance fresh"],
    "Dining": ["zomato", "swiggy", "restaurant", "cafe", "pizza", "burger", "starbucks"],
    "Transport": ["ola", "uber", "cab", "metro", "auto", "petrol", "fuel"],
    "Utilities": ["airtel", "jio", "electricity", "water", "gas", "recharge", "broadband"],
    "Rent": ["rent", "landlord", "flat", "pg"],
    "Entertainment": ["bookmyshow", "netflix", "spotify", "pos terminal", "movie", "gaming"],
    "Investment": ["groww", "zerodha", "mutual fund", "cams", "karvy", "sip", "ppf", "nps", "mutualfund", "indmoney", "etmoney", "axis mutual", "sbi mutual"]
}


import re

def clean_merchant_string(merchant: str, description: str = "") -> str:
    """
    Cleans raw bank narration and merchant descriptions by removing transaction IDs,
    UPI IDs, location noise, and formatting tags to extract the core merchant name.
    """
    combined = f"{merchant} {description}".lower().strip()
    
    # 1. Remove UPI handles (e.g. upi/swiggy@okaxis or @ybl, etc.)
    combined = re.sub(r'@[a-zA-Z0-9]+', '', combined)
    
    # 2. Remove standard long transaction/ref/terminal IDs (6+ digits)
    combined = re.sub(r'\b\d{6,}\b', '', combined)
    
    # 3. Remove common transaction prefixes/suffixes
    combined = re.sub(r'\b(upi|pos|debit|credit|card|txn|ref|chq|transfer|payment|netbanking|to|from|prv|pay|wallet)\b', ' ', combined)
    
    # 4. Clean extra spaces and special characters
    combined = re.sub(r'[^a-zA-Z0-9\s]', ' ', combined)
    combined = re.sub(r'\s+', ' ', combined).strip()
    
    return combined


def get_user_model_path(user_id: str) -> str:
    return os.path.join(MODELS_DIR, f"{user_id}_categorizer.pkl")


def build_features_df(transactions_data: List[Dict[str, Any]]) -> pd.DataFrame:
    df_rows = []
    for tx in transactions_data:
        text = clean_merchant_string(tx['merchant'], tx.get('description', ''))
        
        # Parse date to extract day of month and day of week
        try:
            # Handle possible datetime objects or raw string
            dt_str = tx.get('date') or ""
            if isinstance(dt_str, datetime):
                dt = dt_str
            else:
                dt = datetime.strptime(dt_str.split("T")[0], "%Y-%m-%d")
            day_of_month = dt.day
            day_of_week = dt.weekday()
        except Exception:
            day_of_month = 15
            day_of_week = 3
            
        # Amount: standard spending is negative, take absolute value for ML
        amount = abs(float(tx.get('amount') or 0.0))
        
        df_rows.append({
            "text": text,
            "amount": amount,
            "day_of_month": day_of_month,
            "day_of_week": day_of_week
        })
    return pd.DataFrame(df_rows)


def get_user_model_path(user_id: str) -> str:
    return os.path.join(MODELS_DIR, f"{user_id}_categorizer.pkl")


def train_user_model(user_id: str, transactions_data: List[Dict[str, Any]]) -> bool:
    """
    Trains a personalized Multi-Feature classifier on the user's categorized transactions.
    """
    if len(transactions_data) < 8:
        return False
        
    # Filter valid training rows (must be categorized and not "Other" or "All")
    valid_txs = [
        tx for tx in transactions_data 
        if tx.get('category') and tx['category'] not in ("Other", "All")
    ]
    
    if len(valid_txs) < 8:
        return False
        
    labels = [tx['category'] for tx in valid_txs]
    if len(set(labels)) < 2:
        return False

    try:
        df = build_features_df(valid_txs)
        
        preprocessor = ColumnTransformer(
            transformers=[
                ('text', TfidfVectorizer(ngram_range=(1, 2), min_df=1), 'text'),
                ('num', StandardScaler(), ['amount', 'day_of_month']),
                ('cat', OneHotEncoder(handle_unknown='ignore'), ['day_of_week'])
            ]
        )
        
        pipeline = Pipeline([
            ('preprocessor', preprocessor),
            ('clf', LogisticRegression(C=1.0, max_iter=1000, class_weight='balanced'))
        ])
        
        pipeline.fit(df, labels)

        # Save the model
        model_path = get_user_model_path(user_id)
        with open(model_path, "wb") as f:
            pickle.dump(pipeline, f)
        return True
    except Exception as e:
        print(f"Error training model for user {user_id}: {str(e)}")
        return False


async def retrain_user_model_async(db: AsyncSession, user_id: str) -> bool:
    """
    Fetches all historical transactions for a user from database and triggers retraining.
    """
    result = await db.execute(
        select(Transaction).where(Transaction.user_id == user_id)
    )
    transactions = result.scalars().all()
    tx_data = [
        {
            "merchant": t.merchant,
            "description": t.source,
            "category": t.category,
            "amount": t.amount,
            "date": t.date
        }
        for t in transactions
    ]
    return train_user_model(user_id, tx_data)


def categorize_transaction(
    merchant: str, 
    description: str, 
    amount: float = 0.0, 
    date: str = "", 
    user_id: Optional[str] = None
) -> str:
    """
    Categorization pipeline:
    Tier 1: Personalized machine learning classifier (if trained & confidence is high).
    Tier 2: Fast baseline classification using keyword matching & rules.
    Tier 3: Fallback to OpenAI LLM categorization if key is configured.
    """
    text_to_match = clean_merchant_string(merchant, description)

    # Tier 1: Machine Learning Classifier (User Specific)
    if user_id:
        model_path = get_user_model_path(user_id)
        if os.path.exists(model_path):
            try:
                with open(model_path, "rb") as f:
                    pipeline = pickle.load(f)
                
                # Build single-row DataFrame matching the columns used in training
                try:
                    dt = datetime.strptime(date.split("T")[0], "%Y-%m-%d")
                    day_of_month = dt.day
                    day_of_week = dt.weekday()
                except Exception:
                    day_of_month = 15
                    day_of_week = 3
                
                single_df = pd.DataFrame([{
                    "text": text_to_match,
                    "amount": abs(float(amount)),
                    "day_of_month": day_of_month,
                    "day_of_week": day_of_week
                }])
                
                probs = pipeline.predict_proba(single_df)[0]
                max_idx = probs.argmax()
                confidence = probs[max_idx]
                
                # Confidence threshold of 70%
                if confidence >= 0.70:
                    return pipeline.classes_[max_idx]
            except Exception as e:
                print(f"Prediction model error: {str(e)}")
                pass  # Fall back to keywords

    # Tier 2: Keyword matches
    matched_category = None
    for category, keywords in CATEGORIES_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_to_match:
                matched_category = category
                break
        if matched_category:
            break
            
    if matched_category:
        return matched_category
        
    # Tier 3: LLM Fallback if OpenAI key is configured
    if settings.OPENAI_API_KEY and "your-openai-api-key" not in settings.OPENAI_API_KEY:
        try:
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            prompt = (
                f"Categorize the following bank transaction merchant/description into one of the categories:\n"
                f"Categories: Groceries, Dining, Transport, Utilities, Rent, Entertainment, Shopping, Investment, Other.\n"
                f"Transaction: '{merchant} - {description}'\n"
                f"Return only the category name as a single word."
            )
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=10,
                temperature=0.0
            )
            category_candidate = response.choices[0].message.content.strip()
            # Clean response
            for cat in ["Groceries", "Dining", "Transport", "Utilities", "Rent", "Entertainment", "Shopping", "Investment"]:
                if cat.lower() in category_candidate.lower():
                    return cat
        except Exception:
            pass  # Fallback to general category on error
            
    return "Other"

