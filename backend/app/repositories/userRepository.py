from fastapi import Depends, HTTPException
from sqlmodel import Session, select
from models.user import User
from schemas.user import UserCreate, UserUpdate
from database.session import get_session


class UserRepository:
    """Repository for User database operations."""
    
    def __init__(self, session: Session = Depends(get_session)):
        self.session = session
    
    # --- Create ---
    async def create_user(self, user_data: UserCreate) -> User:
        """Create a new user in the database.
        
        Args:
            user_data: UserCreate schema with firebase_uid and optional email
            
        Returns:
            Created User instance
            
        Raises:
            HTTPException: If firebase_uid already exists
        """
        # Check if user already exists
        existing_user = await self.get_user_by_firebase_uid(user_data.firebase_uid)
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Create new user
        user = User(**user_data.dict())
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user
    
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