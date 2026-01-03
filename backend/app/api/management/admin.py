from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from database.session import get_session
from core.security import required_roles, get_current_user

from repositories.userRepository import UserRepository

from schemas.user import TraditionalSignUp, UserCreate, UserProfileUpdate
from schemas.role import RoleAssign, RoleRemove, UserRolesListResponse

from models.user import RoleType, User, UserInfo


router = APIRouter(
	prefix="/admin", 
	tags=["Admin"],
	dependencies=[Depends(required_roles(RoleType.ADMIN))]
)

# ============ User Management ============

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
    "/users/{user_id:int}", 
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


@router.get("/users/{user_id:int}/profile", response_model=UserInfo)
async def get_user_profile(
	user_id: int,
	session: AsyncSession = Depends(get_session),
):
	repo = UserRepository(session)
	profile = await repo.get_user_info_by_user_id(user_id)
	if not profile:
		raise HTTPException(status_code=404, detail="User profile not found")
	return profile


@router.patch("/users/{user_id:int}", response_model=User)
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


@router.patch("/users/{user_id:int}/profile", response_model=UserInfo)
async def admin_update_profile(
	user_id: int,
	form: UserProfileUpdate,
	session: AsyncSession = Depends(get_session),
):
	repo = UserRepository(session)
	profile = await repo.update_user_info(user_id, form)
	return profile


@router.post("/users/{user_id:int}/ban", status_code=204)
async def admin_ban_user(
	user_id: int,
	session: AsyncSession = Depends(get_session),
):
	repo = UserRepository(session)
	await repo.ban_user(user_id)
	return None


@router.post("/users/{user_id:int}/unban", status_code=204)
async def admin_unban_user(
	user_id: int,
	session: AsyncSession = Depends(get_session),
):
	repo = UserRepository(session)
	await repo.unban_user(user_id)
	return None


@router.delete("/users/{user_id:int}", status_code=204)
async def admin_delete_user(
	user_id: int,
	session: AsyncSession = Depends(get_session)
):
	repo = UserRepository(session)
	await repo.delete_user(user_id)
	return None

# ============ Role Management ============

@router.post("/users/{user_id:int}/roles", status_code=status.HTTP_201_CREATED)
async def assign_role_to_user(
	user_id: int,
	form: RoleAssign,
	session: AsyncSession = Depends(get_session),
	current_user: User = Depends(get_current_user),
):
	"""
	Assign a role to a user.
	
	**Role:** ADMIN only
	
	Args:
		user_id: User ID to assign role to
		form: RoleAssign schema with role_type
		session: Database session
		current_user: Currently authenticated admin user
		
		Returns:
		Created UserRole object
		
	Raises:
		HTTPException: If user not found or role already assigned
	"""
	repo = UserRepository(session)
	user_role = await repo.assign_role_to_user(user_id, form.role_type)
	return user_role


@router.delete("/users/{user_id:int}/roles/{role_type}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_role_from_user(
	user_id: int,
	role_type: RoleType,
	session: AsyncSession = Depends(get_session),
	current_user: User = Depends(get_current_user),
):
	"""
	Remove a role from a user.
	
	**Role:** ADMIN only
	
	Args:
		user_id: User ID to remove role from
		role_type: RoleType to remove (ADMIN, MODERATOR, LEARNER)
		session: Database session
		current_user: Currently authenticated admin user
		
	Returns:
		No content (204)
		
	Raises:
		HTTPException: If user or role not found
	"""
	repo = UserRepository(session)
	await repo.remove_role_from_user(user_id, role_type)
	return None


@router.get("/users/{user_id:int}/roles", response_model=UserRolesListResponse)
async def get_user_roles(
	user_id: int,
	session: AsyncSession = Depends(get_session),
):
	"""
	Get all roles assigned to a user.
	
	**Role:** ADMIN only
	
	Args:
		user_id: User ID
		session: Database session
		
	Returns:
		UserRolesListResponse with list of role types
		
	Raises:
		HTTPException: If user not found
	"""
	repo = UserRepository(session)
	roles_data = await repo.get_user_roles(user_id)
	role_types = [role["role_type"] for role in roles_data]
	return UserRolesListResponse(user_id=user_id, roles=role_types)


@router.get("/users/{user_id:int}/roles/{role_type}", response_model=dict)
async def check_user_role(
	user_id: int,
	role_type: RoleType,
	session: AsyncSession = Depends(get_session),
):
	"""
	Check if a user has a specific role.
	
	**Role:** ADMIN only
	
	Args:
		user_id: User ID
		role_type: RoleType to check (ADMIN, MODERATOR, LEARNER)
		session: Database session
		
	Returns:
		Dict with user_id, role_type, and has_role boolean
	"""
	repo = UserRepository(session)
	has_role = await repo.has_role(user_id, role_type)
	return {
		"user_id": user_id,
		"role_type": role_type,
		"has_role": has_role,
	}