from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from firebase_admin import auth

from database.session import get_session
from core.security import verify_id_token, decode_id_token

from schemas.user import UserCreate
from models.user import User

from repositories.userRepository import UserRepository
# from app.database import get_session

router = APIRouter(prefix="/role", tags=["Role"])

@router.get("/")
def get_all_roles():
    pass
