import asyncio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.firebase import init_firebase
from database.session import create_db_and_tables

from api import (
    test, user, login, role, vocab
)
# from app.database import engine

app = FastAPI()
init_firebase()
origins = [
    'http://localhost:8000',  # URL of backend API
    "http://localhost:5173",  # URL of frontend (Vite dev server)
    "http://localhost:3000",  # Alternative frontend port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # List of allowed origins
    allow_credentials=True,      # Allow cookies to be sent with requests
    allow_methods=["*"],         # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],         # Allow all headers (e.g., Content-Type, Authorization)
)

#---------------------------------- Routers -------------------------------------------------------
app.include_router(test.router)
app.include_router(user.router)
app.include_router(role.router)
app.include_router(login.router)
app.include_router(vocab.router)
#--------------------------------------------------------------------------------------------------

# ------------------- Main -------------------
if __name__ == "__main__":
    asyncio.run(create_db_and_tables())
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)


# setting up database to connect with postgres
# @app.on_event("startup")
# async def on_startup():
#     SQLModel.metadata.create_all(engine)
