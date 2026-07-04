import os
from typing import Dict
from openai import OpenAI
from app.core.config import settings

# Lightweight baseline categorizer keyword mapping
CATEGORIES_KEYWORDS = {
    "Groceries": ["bazaar", "mart", "supermarket", "groceries", "reliance fresh"],
    "Dining": ["zomato", "swiggy", "restaurant", "cafe", "pizza", "burger", "starbucks"],
    "Transport": ["ola", "uber", "cab", "metro", "auto", "petrol", "fuel"],
    "Utilities": ["airtel", "jio", "electricity", "water", "gas", "recharge", "broadband"],
    "Rent": ["rent", "landlord", "flat", "pg"],
    "Entertainment": ["bookmyshow", "netflix", "spotify", "pos terminal", "movie", "gaming"]
}


def categorize_transaction(merchant: str, description: str) -> str:
    """
    Categorization pipeline:
    Tier 1: Fast baseline classification using keyword matching & rules.
    Tier 2: If keyword match confidence is low, fall back to OpenAI LLM categorization.
    """
    text_to_match = f"{merchant} {description}".lower()
    
    # Tier 1: Search for matches
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
        
    # Tier 2: LLM Fallback if OpenAI key is configured
    if settings.OPENAI_API_KEY:
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
