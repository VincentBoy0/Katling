from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple

from fastapi import Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from models.user import ActivityType, User, UserPoints, UserRole, Role, RoleType, UserInfo, UserXPLog
from schemas.user import UserProfileUpdate, UserSignUp, UserUpdate, UserPointsUpdate, UserInfoUpdate
from database.session import get_session
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class UserRepository:
    """Repository for User database operations."""

    MAX_ENERGY: int = 30
    ENERGY_REGEN_INTERVAL: timedelta = timedelta(minutes=10)

    @staticmethod
    def _normalize_energy_last_update(last_update: datetime, *, now_utc: datetime) -> datetime:
        if last_update.tzinfo is None:
            return last_update.replace(tzinfo=timezone.utc)
        return last_update.astimezone(timezone.utc)

    def _apply_energy_regen(
        self,
        *,
        energy: int,
        last_update_utc: datetime,
        now_utc: datetime,
    ) -> tuple[int, datetime, bool]:
        """Return (new_energy, new_last_update, did_regen)."""

        if energy < 0:
            energy = 0
        if energy >= self.MAX_ENERGY:
            # Full energy does not advance last_update.
            return self.MAX_ENERGY, last_update_utc, False

        elapsed_seconds = (now_utc - last_update_utc).total_seconds()
        if elapsed_seconds <= 0:
            return energy, last_update_utc, False

        interval_seconds = self.ENERGY_REGEN_INTERVAL.total_seconds()
        regen_units = int(elapsed_seconds // interval_seconds)
        if regen_units <= 0:
            return energy, last_update_utc, False

        applied_units = min(regen_units, self.MAX_ENERGY - energy)
        if applied_units <= 0:
            return energy, last_update_utc, False

        return (
            energy + applied_units,
            last_update_utc + applied_units * self.ENERGY_REGEN_INTERVAL,
            True,
        )

    async def regen_energy_if_needed(self, user_id: int) -> UserPoints:
        """Lazily regenerate energy for a user.

        - Does not consume energy
        - Persists changes only when regen actually occurs (or row is created)
        """

        user_point = await self.get_user_point(user_id)
        if not user_point:
            user_point = UserPoints(user_id=user_id)
            self.session.add(user_point)
            await self.session.commit()
            await self.session.refresh(user_point)
            return user_point

        now_utc = datetime.now(timezone.utc)

        current_energy = int(getattr(user_point, "energy", 0) or 0)
        last_update = getattr(user_point, "last_energy_update", None) or now_utc
        last_update_utc = self._normalize_energy_last_update(last_update, now_utc=now_utc)

        new_energy, new_last_update, did_regen = self._apply_energy_regen(
            energy=current_energy,
            last_update_utc=last_update_utc,
            now_utc=now_utc,
        )

        if not did_regen:
            return user_point

        user_point.energy = new_energy
        user_point.last_energy_update = new_last_update
        self.session.add(user_point)
        await self.session.commit()
        await self.session.refresh(user_point)
        return user_point
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    # --- Create ---
    async def create_user(self, user_data: UserSignUp) -> User:
        """Create a new user in the database.
        
        Args:
            user_data: UserCreate schema with firebase_uid and optional email
            
        Returns:
            Created User instance
            
        Raises:
            HTTPException: If firebase_uid already exists
        """
        
        # find default "learner" role by type
        stmt = select(Role).where(Role.type == RoleType.LEARNER)
        result = await self.session.exec(stmt)
        role = result.first()
        
        # Validate that learner role exists
        if not role:
            raise HTTPException(status_code=500, detail="Default learner role not found")

        # Check if user already exists
        existing_user = await self.get_user_by_firebase_uid(user_data.firebase_uid)
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Create new user
        user = User(**user_data.dict())
        try:
            # Avoid starting a new transaction if one is already active
            if getattr(self.session, "in_transaction", None) and self.session.in_transaction():
                self.session.add(user)
                await self.session.flush()  # ensure user.id is available
                user_role = UserRole(user_id=user.id, role_id=role.id)
                self.session.add(user_role)
                # create an empty user profile row linked to the user
                user_info = UserInfo(user_id=user.id)
                self.session.add(user_info)
                user_point = UserPoints(user_id=user.id)
                self.session.add(user_point)
            else:
                async with self.session.begin():
                    self.session.add(user)
                    await self.session.flush()  # ensure user.id is available
                    user_role = UserRole(user_id=user.id, role_id=role.id)
                    self.session.add(user_role)
                    # create an empty user profile row linked to the user
                    user_info = UserInfo(user_id=user.id)
                    self.session.add(user_info)
                    user_point = UserPoints(user_id=user.id)
                    self.session.add(user_point)

            # refresh user instance after commit/flush
            await self.session.commit()
            await self.session.refresh(user)
            return user
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=500, detail="Failed to create user")
            # await self.session.rollback()
    
    # --- Read ---
    async def get_user_by_id(self, user_id: int) -> User:
        """Get user by ID.
        
        Args:
            user_id: User ID
            
        Returns:
            User instance or None if not found
        """
        statement = select(User).where(User.id == user_id)
        result = await self.session.exec(statement)
        return result.first() 
    
    async def get_user_by_firebase_uid(self, firebase_uid: str) -> User:
        """Get user by Firebase UID.
        
        Args:
            firebase_uid: Firebase unique identifier
            
        Returns:
            User instance or None if not found
        """
        statement = select(User).where(User.firebase_uid == firebase_uid)
        result = await self.session.exec(statement)
        return result.first()
    
    async def get_user_by_email(self, email: str) -> User:
        """Get user by email.
        
        Args:
            email: User email address
            
        Returns:
            User instance or None if not found
        """
        statement = select(User).where(User.email == email)
        result = await self.session.exec(statement)
        return result.first()

    async def get_user_info_by_user_id(self, user_id: int) -> UserInfo:
        """Get UserInfo row by the related user's ID.

        Args:
            user_id: ID of the user

        Returns:
            `UserInfo` instance or None if not found
        """
        statement = select(UserInfo).where(UserInfo.user_id == user_id)
        result = await self.session.exec(statement)
        return result.first()
    
    async def get_all_users(self, skip: int = 0, limit: int = 10) -> list[User]:
        """Get all users with pagination.
        
        Args:
            skip: Number of users to skip
            limit: Maximum number of users to return
            
        Returns:
            List of User instances
        """
        statement = select(User).offset(skip).limit(limit)
        result = await self.session.exec(statement)
        return result.all()
    
    # --- Update ---
    async def update_user(self, user_id: int, user_data: UserUpdate) -> User:
        """Update user information.
        
        Args:
            user_id: User ID
            user_data: UserUpdate schema with optional fields
            
        Returns:
            Updated User instance
            
        Raises:
            HTTPException: If user not found
        """
        user = await self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update only provided fields
        update_data = user_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user
    
    
    async def update_user_info(self, user_id: int, data: UserInfoUpdate) -> UserInfo:
        """Update a UserInfo row for the given user_id.

        Args:
            user_id: ID of the user whose profile to update
            data: UserInfoUpdate schema with partial update data (only provided fields will be applied)

        Returns:
            The updated UserInfo instance

        Raises:
            HTTPException: If user not found or operation fails
        """
        # fetch existing profile
        stmt = select(UserInfo).where(UserInfo.user_id == user_id)
        result = await self.session.exec(stmt)
        profile = result.first()

        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")

        # update_fields = {k: v for k, v in data.dict(exclude_unset=True).items() if v is not None}

        try:
            # update only provided fields
            for field, value in data.items():
                if (field == "full_name"):
                    setattr(profile, "username", value)
                setattr(profile, field, value)

            self.session.add(profile)
            await self.session.commit()
            await self.session.refresh(profile)
            return profile
        except Exception as e:
            logger.exception("Failed to update user_info: %s", e)
            raise HTTPException(status_code=500, detail="Failed to update user info")
    
    async def get_user_point(self, user_id: int) -> UserPoints:
        """Get user points (XP and streak) by user ID.
        
        Args:
            user_id: ID of the user
            
        Returns:
            UserPoints instance or None if not found
            
        Raises:
            HTTPException: If query fails
        """
        try:
            stmt = select(UserPoints).where(UserPoints.user_id == user_id)
            result = await self.session.exec(stmt)
            return result.first()
        except Exception as e:
            logger.exception("Failed to get user points: %s", e)
            raise HTTPException(status_code=500, detail="Failed to get user points")

    async def add_xp(self, user_id: int, *, amount: int, commit: bool = True) -> UserPoints:
        """Increment user's XP by `amount`.

        When `commit=False`, this will only flush so callers can wrap multiple
        updates in a single outer transaction.
        """

        if amount <= 0:
            raise HTTPException(status_code=400, detail="XP amount must be positive")

        user_point = await self.get_user_point(user_id)
        if not user_point:
            user_point = UserPoints(user_id=user_id, xp=0, streak=0)
            self.session.add(user_point)
            await self.session.flush()

        current_xp = int(getattr(user_point, "xp", 0) or 0)
        user_point.xp = current_xp + amount
        self.session.add(user_point)

        if commit:
            await self.session.commit()
            await self.session.refresh(user_point)
        else:
            await self.session.flush()

        return user_point

    async def log_xp_activity(
        self,
        user_id: int,
        *,
        activity_type: ActivityType,
        xp_amount: int,
        commit: bool = True,
    ) -> UserXPLog:
        """Insert a XP log entry.

        When `commit=False`, this will only flush so callers can wrap multiple
        updates in a single outer transaction.
        """

        if xp_amount == 0:
            raise HTTPException(status_code=400, detail="XP amount must be non-zero")

        log_row = UserXPLog(
            user_id=user_id,
            activity_type=activity_type,
            xp_amount=xp_amount,
        )
        self.session.add(log_row)

        if commit:
            await self.session.commit()
            await self.session.refresh(log_row)
        else:
            await self.session.flush()

        return log_row

    async def update_user_point(self, user_id: int, form: dict) -> UserPoints:
        """Update user points (XP and streak).
        
        Args:
            user_id: ID of the user
            form: Dictionary containing fields to update (xp, streak)
            
        Returns:
            Updated UserPoints instance
            
        Raises:
            HTTPException: If user not found or update fails
        """
        try:
            user_point = await self.get_user_point(user_id)
            if not user_point:
                raise HTTPException(status_code=404, detail="User points not found")
            
            # Update only provided fields
            update_data = {k: v for k, v in form.items() if v is not None}
            for field, value in update_data.items():
                setattr(user_point, field, value)
            
            self.session.add(user_point)
            await self.session.commit()
            await self.session.refresh(user_point)
            return user_point
        except HTTPException:
            raise
        except Exception as e:
            logger.exception("Failed to update user points: %s", e)
            raise HTTPException(status_code=500, detail="Failed to update user points")

    async def update_streak_on_activity(self, user_id: int) -> tuple[int, bool]:
        """Update user's streak based on last_active_date.

        Returns:
            (current_streak, is_streak_increased_today)
        """

        user = await self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user_point = await self.get_user_point(user_id)
        if not user_point:
            # Be defensive: create if missing
            user_point = UserPoints(user_id=user_id, xp=0, streak=0)
            self.session.add(user_point)
            await self.session.flush()

        now_utc = datetime.now(timezone.utc)
        today = now_utc.date()

        last_active = user.last_active_date
        current_streak = int(user_point.streak or 0)

        if last_active is None:
            # Case 1: First time learning
            current_streak = 1
            user_point.streak = current_streak
            user.last_active_date = now_utc
            self.session.add(user)
            self.session.add(user_point)
            return current_streak, True

        # Normalize last_active to UTC date for comparison
        if isinstance(last_active, datetime):
            if last_active.tzinfo is not None:
                last_active_date = last_active.astimezone(timezone.utc).date()
            else:
                last_active_date = last_active.date()
        else:
            last_active_date = last_active  # type: ignore[assignment]

        if last_active_date == today:
            # Case 2: already active today
            return current_streak, False

        if last_active_date == today - timedelta(days=1):
            # Case 3: consecutive day
            current_streak = current_streak + 1
        else:
            # Case 4: broken streak
            current_streak = 1

        user_point.streak = current_streak
        user.last_active_date = now_utc
        self.session.add(user)
        self.session.add(user_point)
        return current_streak, True

    async def consume_learning_energy(self, user_id: int, *, cost: int = 1) -> int:
        """Regenerate energy (incremental) and consume energy for a learning action.

        Rules:
        - Max energy = 30
        - Regen: +1 per 10 minutes (floor)
        - If energy <= 0 after regen, raise 403
        - Consume `cost` energy

        Returns:
            Remaining energy after consuming.
        """

        if cost <= 0:
            raise HTTPException(status_code=400, detail="Energy cost must be positive")

        user_point = await self.get_user_point(user_id)
        if not user_point:
            # Create row if missing; keep a single commit at the end.
            user_point = UserPoints(user_id=user_id)
            self.session.add(user_point)
            await self.session.flush()

        now_utc = datetime.now(timezone.utc)

        current_energy = int(getattr(user_point, "energy", 0) or 0)
        last_update = getattr(user_point, "last_energy_update", None) or now_utc
        last_update_utc = self._normalize_energy_last_update(last_update, now_utc=now_utc)

        # Regen (no commits here)
        current_energy, last_update_utc, _ = self._apply_energy_regen(
            energy=current_energy,
            last_update_utc=last_update_utc,
            now_utc=now_utc,
        )

        # Single validation
        if current_energy < cost:
            raise HTTPException(
                status_code=403,
                detail="Not enough energy to answer. Please wait for energy to regenerate.",
            )

        # Consume updates last_energy_update
        current_energy -= cost
        user_point.energy = current_energy
        user_point.last_energy_update = now_utc

        self.session.add(user_point)
        await self.session.commit()
        await self.session.refresh(user_point)
        return int(user_point.energy)

    async def reconcile_streak_on_read(
        self,
        *,
        user_id: int,
        last_active_date: Optional[datetime],
    ) -> Tuple[int, bool]:
        """Reconcile streak when user opens the app (read-time).

        This keeps the database in sync even if the user hasn't completed a section
        for multiple days.

        Returns:
            (effective_streak, is_streak_active_today)
        """

        today = datetime.now(timezone.utc).date()

        if last_active_date is None:
            last_active_utc_date = None
        else:
            if last_active_date.tzinfo is not None:
                last_active_utc_date = last_active_date.astimezone(timezone.utc).date()
            else:
                last_active_utc_date = last_active_date.date()

        is_active_today = last_active_utc_date == today
        is_broken = last_active_utc_date is None or last_active_utc_date < (today - timedelta(days=1))

        user_point = await self.get_user_point(user_id)
        effective_streak = 0 if is_broken else (int(user_point.streak or 0) if user_point else 0)

        if is_broken and user_point and int(user_point.streak or 0) != 0:
            user_point.streak = 0
            self.session.add(user_point)
            try:
                await self.session.commit()
                await self.session.refresh(user_point)
            except Exception:
                await self.session.rollback()

        return effective_streak, is_active_today

    async def ban_user(self, user_id: int) -> User:
        """Ban a user.

        Args:
            user_id: User ID
            
        Returns:
            Updated User instance
            
        Raises:
            HTTPException: If user not found
        """
        user = await self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user.is_banned = True
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user
    
    async def unban_user(self, user_id: int) -> User:
        """Unban a user.
        
        Args:
            user_id: User ID
            
        Returns:
            Updated User instance
            
        Raises:
            HTTPException: If user not found
        """
        user = await self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user.is_banned = False
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user
    
    # --- Delete ---
    async def delete_user(self, user_id: int) -> bool:
        """Delete a user by ID.
        
        Args:
            user_id: User ID
            
        Returns:
            True if deleted, False if not found
        """
        user = await self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        await self.session.delete(user)
        await self.session.commit()
        return True

    # --- Role Management ---
    async def assign_role_to_user(self, user_id: int, role_type: RoleType) -> UserRole:
        """Assign a role to a user.
        
        Args:
            user_id: User ID to assign role to
            role_type: RoleType to assign (ADMIN, MODERATOR, LEARNER)
            
        Returns:
            Created UserRole object
            
        Raises:
            HTTPException: If user or role not found, or role already assigned
        """
        # Verify user exists
        user = await self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get or create role
        role = await self._get_or_create_role(role_type)
        
        # Check if role already assigned
        stmt = select(UserRole).where(
            (UserRole.user_id == user_id) & (UserRole.role_id == role.id)
        )
        result = await self.session.exec(stmt)
        existing = result.first()
        
        if existing:
            raise HTTPException(
                status_code=409, 
                detail=f"User {user_id} already has role {role_type.value}"
            )
        
        # Create new user role
        user_role = UserRole(user_id=user_id, role_id=role.id)
        self.session.add(user_role)
        await self.session.commit()
        await self.session.refresh(user_role)
        return user_role

    async def remove_role_from_user(self, user_id: int, role_type: RoleType) -> None:
        """Remove a role from a user.
        
        Args:
            user_id: User ID to remove role from
            role_type: RoleType to remove (ADMIN, MODERATOR, LEARNER)
            
        Raises:
            HTTPException: If user or role not found, or role not assigned
        """
        # Verify user exists
        user = await self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get role
        role = await self._get_role_by_type(role_type)
        if not role:
            raise HTTPException(status_code=404, detail=f"Role {role_type.value} not found")
        
        # Find user role
        stmt = select(UserRole).where(
            (UserRole.user_id == user_id) & (UserRole.role_id == role.id)
        )
        result = await self.session.exec(stmt)
        user_role = result.first()
        
        if not user_role:
            raise HTTPException(
                status_code=404,
                detail=f"User {user_id} does not have role {role_type.value}"
            )
        
        # Delete user role
        await self.session.delete(user_role)
        await self.session.commit()

    async def get_user_roles(self, user_id: int) -> list[dict]:
        """Get all roles assigned to a user.
        
        Args:
            user_id: User ID
            
        Returns:
            List of role info dicts with id, role_id, role_type, description
            
        Raises:
            HTTPException: If user not found
        """
        # Verify user exists
        user = await self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get user roles
        stmt = select(UserRole, Role).join(
            Role, UserRole.role_id == Role.id
        ).where(UserRole.user_id == user_id)
        result = await self.session.exec(stmt)
        rows = result.all()
        
        roles = []
        for user_role, role in rows:
            roles.append({
                "id": user_role.id,
                "user_id": user_role.user_id,
                "role_id": user_role.role_id,
                "role_type": role.type,
                "role_description": role.description,
            })
        
        return roles

    async def has_role(self, user_id: int, role_type: RoleType) -> bool:
        """Check if user has a specific role.
        
        Args:
            user_id: User ID
            role_type: RoleType to check
            
        Returns:
            True if user has role, False otherwise
        """
        role = await self._get_role_by_type(role_type)
        if not role:
            return False
        
        stmt = select(UserRole).where(
            (UserRole.user_id == user_id) & (UserRole.role_id == role.id)
        )
        result = await self.session.exec(stmt)
        return result.first() is not None

    # --- Helper methods ---
    async def _get_or_create_role(self, role_type: RoleType) -> Role:
        """Get or create a role by type.
        
        Args:
            role_type: RoleType to get or create
            
        Returns:
            Role object
        """
        stmt = select(Role).where(Role.type == role_type)
        result = await self.session.exec(stmt)
        role = result.first()
        
        if role:
            return role
        
        # Create role if not exists
        role = Role(type=role_type, description=f"{role_type.value} role")
        self.session.add(role)
        await self.session.commit()
        await self.session.refresh(role)
        return role

    async def _get_role_by_type(self, role_type: RoleType) -> Optional[Role]:
        """Get role by type.
        
        Args:
            role_type: RoleType to retrieve
            
        Returns:
            Role object or None if not found
        """
        stmt = select(Role).where(Role.type == role_type)
        result = await self.session.exec(stmt)
        return result.first()