from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession

from database.session import get_session
from core.security import decode_id_token, verify_firebase_token

from repositories.userRepository import UserRepository

from schemas.user import TraditionalSignUp, UserCreate

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login")
async def login(
    token: str,
    session: AsyncSession = Depends(get_session)
):
    print("LOGIN CALLED")

    try:
        decoded = decode_id_token(token)
        print("DECODED:", decoded)

        email = decoded.get("email")
        firebase_uid = decoded.get("uid")

        print("EMAIL:", email)
        print("UID:", firebase_uid)

        user_repo = UserRepository(session)
        user = await user_repo.get_user_by_firebase_uid(firebase_uid)
        print("USER FROM DB:", user)

        if not user:
            print("CREATING USER...")
            user = await user_repo.create_user(
                UserCreate(
                    email=email,
                    firebase_uid=firebase_uid,
                )
            )
            print("USER CREATED:", user)

        return {
            "user": user,
            "firebase": decoded
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise

