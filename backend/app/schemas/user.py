from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# --- Request Schemas (for incoming API requests) ---

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
