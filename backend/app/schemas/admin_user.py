"""Schemas for admin user management with enriched data."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from models.user import RoleType


class AdminUserEnrichedResponse(BaseModel):
    """Enriched user data for admin panel - includes profile and roles in one object."""
    
    # User table fields
    id: int
    firebase_uid: str
    email: Optional[EmailStr]
    created_at: datetime
    is_banned: bool
    
    # UserInfo table fields
    full_name: Optional[str] = None
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    
    # Roles (joined from user_roles)
    roles: list[RoleType] = []
    
    class Config:
        from_attributes = True
