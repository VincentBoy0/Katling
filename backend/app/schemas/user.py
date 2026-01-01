from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

from models.user import Sex


# --- Request Schemas (for incoming API requests) ---

class TraditionalSignUp(BaseModel):
    email: EmailStr = Field(default=None, description="User email address")
    password: str = Field(default=None, description="Your password")
    recheck_password: str = Field(default=None, description="Your password again")

class UserSignUp(BaseModel):
    """Schema for user signup (Firebase handles auth, backend receives email)."""
    email: EmailStr = Field(default=None, description="User email address")
    firebase_uid: str = Field(default=None, description="Firebase UID")

class UserLogin(BaseModel):
    """Schema for user login (Firebase handles auth)."""
    # Firebase handles authentication on frontend, backend receives the token
    pass

class UserCreate(BaseModel):
    """Schema for creating a user with Firebase UID (backend use)."""
    firebase_uid: str = Field(..., description="Firebase unique ID")
    email: Optional[EmailStr] = Field(default=None, description="User email address")


# --- Response Schemas (for outgoing API responses) ---

class UserInfo(BaseModel):
    """Schema for returning user information."""
    id: int = Field(..., description="User ID in database")
    firebase_uid: str = Field(..., description="Firebase unique ID")
    email: Optional[EmailStr] = Field(default=None, description="User email address")
    created_at: datetime = Field(..., description="Account creation timestamp")
    is_banned: bool = Field(default=False, description="Whether user is banned")

    class Config:
        from_attributes = True  # Allow conversion from SQLModel instances


class AuthToken(BaseModel):
    """Schema for authentication token response."""
    access_token: str = Field(..., description="Firebase ID token")
    token_type: str = Field(default="bearer", description="Token type")
    user: UserInfo = Field(..., description="User information")


class SuccessMessage(BaseModel):
    """Schema for generic success responses."""
    message: str = Field(..., description="Success message")
    data: Optional[dict] = Field(default=None, description="Additional data")


# --- Update Schemas ---

class UserUpdate(BaseModel):
    """Schema for updating user information."""
    email: Optional[EmailStr] = Field(default=None, description="New email address")
    is_banned: Optional[bool] = Field(default=None, description="Ban status")

    class Config:
        extra = "forbid"  # Reject unknown fields

class UserRoleSchemas(BaseModel):
    user_id: int 
    role_id: int


# --- User Profile (UserInfo table) Schemas ---
class UserProfileCreate(BaseModel):
    user_id: int = Field(..., description="FK to users table")
    first_name: Optional[str] = Field(default=None, description="First name")
    last_name: Optional[str] = Field(default=None, description="Last name")
    full_name: Optional[str] = Field(default=None, description="Full name")
    date_of_birth: Optional[date] = Field(default=None, description="Date of birth")
    sex: Optional[Sex] = Field(default=None, description="Sex")
    phone: Optional[str] = Field(default=None, description="Phone number")
    email_alternate: Optional[EmailStr] = Field(default=None, description="Alternate email")
    country: Optional[str] = Field(default=None, description="Country")
    city: Optional[str] = Field(default=None, description="City")
    address: Optional[str] = Field(default=None, description="Address")
    avatar_url: Optional[str] = Field(default=None, description="Avatar URL")
    bio: Optional[str] = Field(default=None, description="Short biography")
    preferred_language: Optional[str] = Field(default=None, description="Preferred language code")


class UserProfileRead(BaseModel):
    id: int
    user_id: int
    first_name: Optional[str]
    last_name: Optional[str]
    full_name: Optional[str]
    date_of_birth: Optional[date]
    sex: Optional[Sex]
    phone: Optional[str]
    email_alternate: Optional[EmailStr]
    country: Optional[str]
    city: Optional[str]
    address: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    preferred_language: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    sex: Optional[Sex] = None
    phone: Optional[str] = None
    email_alternate: Optional[EmailStr] = None
    country: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None

    class Config:
        extra = "forbid"

class UserInfoUpdate(BaseModel):
    """Schema for updating user profile information (UserInfo table)."""
    first_name: Optional[str] = Field(default=None, max_length=100, description="First name")
    last_name: Optional[str] = Field(default=None, max_length=100, description="Last name")
    full_name: Optional[str] = Field(default=None, max_length=255, description="Full name")
    date_of_birth: Optional[date] = Field(default=None, description="Date of birth")
    sex: Optional[Sex] = Field(default=None, description="Sex")
    phone: Optional[str] = Field(default=None, max_length=32, description="Phone number")
    email_alternate: Optional[EmailStr] = Field(default=None, description="Alternate email")
    country: Optional[str] = Field(default=None, max_length=100, description="Country")
    city: Optional[str] = Field(default=None, max_length=100, description="City")
    address: Optional[str] = Field(default=None, max_length=255, description="Address")
    bio: Optional[str] = Field(default=None, description="Short biography")

    class Config:
        extra = "forbid"  # Reject unknown fields

class UserPointsUpdate(BaseModel):
    """Schema for updating user points (XP and streak)."""
    xp: Optional[int] = Field(default=None, ge=0, description="Experience points")
    streak: Optional[int] = Field(default=None, ge=0, description="Streak count")

    class Config:
        extra = "forbid"  # Reject unknown fields

