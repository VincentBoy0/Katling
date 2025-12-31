from fastapi import Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from models.user import User, UserRole, Role, RoleType, UserInfo
from schemas.user import UserProfileUpdate, UserSignUp, UserUpdate, UserRoleSchemas
from database.session import get_session
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class UserRepository:
    """Repository for User database operations."""
    
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
            else:
                async with self.session.begin():
                    self.session.add(user)
                    await self.session.flush()  # ensure user.id is available
                    user_role = UserRole(user_id=user.id, role_id=role.id)
                    self.session.add(user_role)
                    # create an empty user profile row linked to the user
                    user_info = UserInfo(user_id=user.id)
                    self.session.add(user_info)

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
    
    

    async def update_user_info(self, user_id: int, user_info: UserProfileUpdate) -> UserInfo:
        """Create or update a UserInfo row for the given user_id.

        Args:
            user_id: ID of the user whose profile to update
            user_info: Partial update data (only provided fields will be applied)

        Returns:
            The created or updated UserInfo instance

        Raises:
            HTTPException: If the operation fails
        """
        # fetch existing profile
        stmt = select(UserInfo).where(UserInfo.user_id == user_id)
        result = await self.session.exec(stmt)
        profile = result.first()

        data = user_info.dict(exclude_unset=True)

        try:
            if not profile:
                # create new profile linked to user
                profile = UserInfo(user_id=user_id, **data)
                self.session.add(profile)
                await self.session.commit()
                await self.session.refresh(profile)
                return profile

            # update only provided fields
            for field, value in data.items():
                setattr(profile, field, value)

            self.session.add(profile)
            await self.session.commit()
            await self.session.refresh(profile)
            return profile
        except Exception as e:
            logger.exception("Failed to update user_info: %s", e)
            raise HTTPException(status_code=500, detail="Failed to update user info")
    
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
        
        self.session.delete(user)
        await self.session.commit()
        return True