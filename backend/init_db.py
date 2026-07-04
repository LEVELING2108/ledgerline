import asyncio
import sys
from sqlalchemy import text
from app.core.config import settings
from app.core.database import Base, engine


async def init_database():
    print(f"Connecting to database server at: {settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}")
    try:
        # Create connection and test it
        async with engine.begin() as conn:
            print("Successfully connected to the database!")
            
            print("Initializing database tables...")
            # Drop all tables first if needed, or just create them
            # For safe bootstrap, just run create_all
            await conn.run_sync(Base.metadata.create_all)
            print("Database tables initialized successfully!")
            
    except Exception as e:
        print("\n[ERROR] Failed to connect or initialize the database.")
        print(f"Details: {str(e)}")
        print("\nPlease verify that:")
        print("1. Your PostgreSQL server is running locally.")
        print(f"2. A database named '{settings.POSTGRES_DB}' exists on the server.")
        print(f"3. User credentials '{settings.POSTGRES_USER}' and passwords in your .env match.")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(init_database())
