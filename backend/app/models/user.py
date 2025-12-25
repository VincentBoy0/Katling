from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from enum import Enum
from pydantic import EmailStr


class User(SQLModel, table=True):        
    id: Optional[int] = Field(default=None, primary_key=True)
    firebase_uid: str = Field(index=True, unique=True)
    email: Optional[EmailStr] = Field(default=None, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_banned: bool = Field(default=False)

class RoleType(str, Enum):
    ADMIN = "ADMIN"
    MODERATOR = "MODERATOR"
    LEARNER = "LEARNER"

class Role(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    type: RoleType = Field(index=True)
    description: Optional[str]

class UserRole(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    role_id: int = Field(foreign_key="role.id")
    user_id: int = Field(foreign_key="user.id")