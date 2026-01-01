from typing import Annotated, Dict
import logging
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from sqlalchemy import select
from sqlmodel.ext.asyncio.session import AsyncSession
from models.user import Role, RoleType, User, UserRole
from database.session import get_session



from models.user import User

logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=True)

def verify_id_token(credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]):
    token = credentials.credentials
    try:
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def decode_id_token(token: str):
    try:
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")

def verify_firebase_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing"
        )

    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme"
        )
    
    try:
        decoded_token = auth.verify_id_token(credentials.credentials)
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token expired")
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication failed")

    # Optional validation
    if "uid" not in decoded_token or "email" not in decoded_token:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    return decoded_token

async def get_current_user(
    decoded_token: Dict = Depends(verify_firebase_token),
    session: AsyncSession = Depends(get_session)
):
    result = await session.exec(
        select(User).where(User.firebase_uid == decoded_token["uid"])
    )
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="User not found"
        )
    
    return user

def required_roles(*roles: RoleType):
    async def role_checker(
        user: User = Depends(get_current_user),
        session: AsyncSession = Depends(get_session)
    ):
        result = await session.exec(
            select(Role).
            join(UserRole, Role.id == UserRole.role_id).
            where(UserRole.user_id == user.id)
        )
        user_roles = result.scalars().all()
        if not any(r.type in roles for r in user_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not allowed"
            )
        return user
    return role_checker
