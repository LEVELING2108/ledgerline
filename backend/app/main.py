from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api.api import api_router

from sqlalchemy import text

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Set CORS middleware
# In production, specify list of allowed origins (e.g. NextJS URL)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    # Automatically bootstrap and create tables on app start
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Dynamically append split_ratio and bank_name columns if they do not exist
        await conn.execute(text("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS split_ratio INTEGER DEFAULT 1"))
        await conn.execute(text("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS bank_name VARCHAR DEFAULT 'HDFC Bank'"))


# Include APIs
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def health_check():
    return {"status": "healthy", "project": settings.PROJECT_NAME}
