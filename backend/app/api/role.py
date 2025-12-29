from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from firebase_admin import auth

from database.session import get_session
from core.security import verify_id_token, decode_id_token

from schemas.user import UserCreate
from models.user import User, Role

from repositories.userRepository import UserRepository
# from app.database import get_session

router = APIRouter(prefix="/role", tags=["Role"])

@router.get("/")
async def get_all_roles():
    """Get all available roles."""
    # TODO: Implement role retrieval from database
    return {"message": "Not implemented yet"}
