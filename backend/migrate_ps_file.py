import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@db:5432/hackathon")

async def migrate():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE hackathons ADD COLUMN problem_statement_file VARCHAR;"))
            print("Successfully added problem_statement_file column to hackathons table.")
        except Exception as e:
            print(f"Migration failed (it might already exist): {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
