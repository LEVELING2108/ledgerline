import os
import pickle
from typing import Dict, List, Optional
from openai import OpenAI
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
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
    "Entertainment": ["bookmyshow", "netflix", "spotify", "pos terminal", "movie", "gaming"]
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


def train_user_model(user_id: str, transactions_data: List[Dict[str, str]]) -> bool:
    """
    Trains a personalized TF-IDF + LogisticRegression pipeline on the user's categorized transactions.
    """
    texts = []
    labels = []
    for tx in transactions_data:
        text = clean_merchant_string(tx['merchant'], tx.get('description', ''))
        if text and tx['category'] and tx['category'] not in ("Other", "All"):
            texts.append(text)
            labels.append(tx['category'])

    # Need at least 8 samples and 2 unique classes to train a text classifier
    if len(texts) < 8 or len(set(labels)) < 2:
        return False

    try:
        pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(ngram_range=(1, 2), min_df=1)),
            ('clf', LogisticRegression(C=1.0, max_iter=1000))
        ])
        pipeline.fit(texts, labels)

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
        {"merchant": t.merchant, "description": t.source, "category": t.category}
        for t in transactions
    ]
    return train_user_model(user_id, tx_data)


def categorize_transaction(merchant: str, description: str, user_id: Optional[str] = None) -> str:
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
                
                probs = pipeline.predict_proba([text_to_match.strip()])[0]
                max_idx = probs.argmax()
                confidence = probs[max_idx]
                
                # Confidence threshold of 70%
                if confidence >= 0.70:
                    return pipeline.classes_[max_idx]
            except Exception:
                pass  # Fall back to keywords on model loading/prediction error

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
                f"Categories: Groceries, Dining, Transport, Utilities, Rent, Entertainment, Shopping, Other.\n"
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
            for cat in ["Groceries", "Dining", "Transport", "Utilities", "Rent", "Entertainment", "Shopping"]:
                if cat.lower() in category_candidate.lower():
                    return cat
        except Exception:
            pass  # Fallback to general category on error
            
    return "Other"

