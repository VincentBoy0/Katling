from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from database.session import get_session
from core.security import decode_id_token
from schemas.user import UserCreate, UserInfo
from repositories.userRepository import UserRepository

router = APIRouter(prefix="/login", tags=["Login"])

@router.post("/")
async def login(
    token: str,
    session: AsyncSession = Depends(get_session)
):
    decoded = decode_id_token(token)
    email = decoded.get("email")
    firebase_uid = decoded.get("uid")

    if not email or not firebase_uid:
        raise HTTPException(status_code=400, detail="Missing email or uid from Firebase token")

    user_repo = UserRepository(session)

    user = await user_repo.get_user_by_firebase_uid(firebase_uid)

    if not user:
        user = await user_repo.create_user(
            UserCreate(
                email=email,
                firebase_uid=firebase_uid,
            )
        )

    return {
        "user": user,
        "firebase": decoded
    }
