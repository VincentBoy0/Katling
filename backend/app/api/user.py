from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from firebase_admin import auth

from database.session import get_session
from core.security import verify_id_token, decode_id_token

from schemas.user import UserCreate
from models.user import User

from repositories.userRepository import UserRepository
# from app.database import get_session

router = APIRouter(prefix="/user", tags=["User"])

@router.get("/me")
async def get_me(user=Depends(verify_id_token)):
    return {"firebase_uid": user["user_id"], "email": user.get("email")}

@router.post("/create")
async def create_account(token: str, session: Session = Depends(get_session)) -> User:
    user_repo = UserRepository(session)
    decoded = decode_id_token(token)
    user = await user_repo.create_user(UserCreate(email=decoded["email"], firebase_uid=decoded["uid"]))
    return user 
