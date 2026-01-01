from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from database.session import get_session
from core.security import required_roles, get_current_user

from repositories.userRepository import UserRepository

from schemas.user import TraditionalSignUp, UserCreate, UserProfileUpdate

from models.user import RoleType, User, UserInfo


router = APIRouter(
	prefix="/admin", 
	tags=["Admin"],
	dependencies=[Depends(required_roles(RoleType.ADMIN))]
)


@router.get("/users", response_model=list[User])
async def list_users(
	skip: int = 0,
	limit: int = 50,
	session: AsyncSession = Depends(get_session),
):
	repo = UserRepository(session)
	users = await repo.get_all_users(skip=skip, limit=limit)
	return users


@router.get(
    "/users/{user_id}", 
    response_model=User
)
async def get_user(
	user_id: int,
	session: AsyncSession = Depends(get_session)
):
	repo = UserRepository(session)
	user = await repo.get_user_by_id(user_id)
	if not user:
		raise HTTPException(status_code=404, detail="User not found")
	return user


@router.get("/users/{user_id}/profile", response_model=UserInfo)
async def get_user_profile(
	user_id: int,
	session: AsyncSession = Depends(get_session),
):
	repo = UserRepository(session)
	profile = await repo.get_user_info_by_user_id(user_id)
	if not profile:
		raise HTTPException(status_code=404, detail="User profile not found")
	return profile


@router.patch("/users/{user_id}", response_model=User)
async def admin_update_user(
	user_id: int,
	data: dict,
	session: AsyncSession = Depends(get_session),
):
	repo = UserRepository(session)
	user = await repo.get_user_by_id(user_id)
	if not user:
		raise HTTPException(status_code=404, detail="User not found")
	# apply only provided fields
	update_fields = {k: v for k, v in data.items() if v is not None}
	if update_fields:
		# reuse update_user which expects UserUpdate schema, so set attributes directly
		for field, value in update_fields.items():
			setattr(user, field, value)
		session.add(user)
		await session.commit()
		await session.refresh(user)
	return user


@router.patch("/users/{user_id}/profile", response_model=UserInfo)
async def admin_update_profile(
	user_id: int,
	form: UserProfileUpdate,
	session: AsyncSession = Depends(get_session),
):
	repo = UserRepository(session)
	profile = await repo.update_user_info(user_id, form)
	return profile


@router.post("/users/{user_id}/ban", status_code=204)
async def admin_ban_user(
	user_id: int,
	session: AsyncSession = Depends(get_session),
):
	repo = UserRepository(session)
	await repo.ban_user(user_id)
	return None


@router.post("/users/{user_id}/unban", status_code=204)
async def admin_unban_user(
	user_id: int,
	session: AsyncSession = Depends(get_session),
):
	repo = UserRepository(session)
	await repo.unban_user(user_id)
	return None


@router.delete("/users/{user_id}", status_code=204)
async def admin_delete_user(
	user_id: int,
	session: AsyncSession = Depends(get_session)
):
	repo = UserRepository(session)
	await repo.delete_user(user_id)
	return None

