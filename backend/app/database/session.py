# app/db/session.py

# from sqlmodel import SQLModel, Session, create_engine
# from pydantic import BaseSettings
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker
from typing import AsyncGenerator
from core.config import settings

# -----------------------------
# Create Engine
# -----------------------------
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,            
    pool_pre_ping=True,
)

# -----------------------------
# Session Dependency for FastAPI
# -----------------------------
# def get_session():
#     with Session(engine) as session:
#         yield session
async_session_maker = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# 4. The Dependency Function (MUST be 'async def')
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


# -----------------------------
# Utilities
# -----------------------------
async def create_db_and_tables():
    # SQLModel.metadata.create_all(engine)
    print("create db and tables")
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
