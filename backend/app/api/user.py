from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel.ext.asyncio.session import AsyncSession

from database.session import get_session
from core.security import decode_id_token, verify_firebase_token, required_roles

from schemas.user import UserCreate, UserInfo
from models.user import User, RoleType

from repositories.userRepository import UserRepository

router = APIRouter(prefix="/user", tags=["User"])

@router.get("/me", response_model=dict)
async def get_me(user=Depends(verify_firebase_token)):
    """Get current authenticated user's Firebase info."""
    return {
        "firebase_uid": user["uid"],
        "email": user.get("email")
    }

@router.post("/create", response_model=UserInfo)
async def create_account(
    token: str, 
    session: AsyncSession = Depends(get_session)
) -> User:
    """Create a new user account from Firebase token."""
    user_repo = UserRepository(session)
    decoded = decode_id_token(token)
    user = await user_repo.create_user(
        UserCreate(email=decoded.get("email"), firebase_uid=decoded["uid"])
    )
    return user 
