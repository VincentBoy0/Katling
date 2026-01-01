from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from database.session import get_session
from core.security import decode_id_token, verify_firebase_token, required_roles, get_current_user

from repositories.userRepository import UserRepository

from schemas.user import TraditionalSignUp, UserCreate, UserPointsUpdate, UserProfileUpdate, UserInfoUpdate

from models.user import RoleType, User, UserInfo


router = APIRouter(prefix="/user", tags=["User"])

@router.get("/")
def get_me(
    user: User = Depends(get_current_user)
):
    return user


@router.get("/info")
async def get_user_info(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    user_repo = UserRepository(session)
    user_info = await user_repo.get_user_info_by_user_id(user_id=user.id)
    return user_info
    

@router.patch("/info")
async def update_user_info(
    form: UserInfoUpdate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
):
    # fetch existing profile for the current user
    user_repo = UserRepository(session)
    user_info = await user_repo.update_user_info(user.id, form.dict(exclude_unset=True))
    return user_info


@router.get("/point")
async def get_user_xp_and_streak(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    user_repo = UserRepository(session)
    return await user_repo.get_user_point(user.id)

@router.patch("/point")
async def update_user_point(
    form: UserPointsUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    user_repo = UserRepository(session)
    return await user_repo.update_user_point(user.id, form.dict(exclude_unset=True))