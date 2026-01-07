from typing import Optional, List

from pydantic import BaseModel, Field

from models.user import RoleType


class RoleAssign(BaseModel):
    """Schema for assigning a role to a user."""
    # user_id: int = Field(..., description="User ID to assign role to")
    role_type: RoleType = Field(..., description="Role type to assign (ADMIN, MODERATOR, LEARNER)")

    class Config:
        extra = "forbid"


class RoleRemove(BaseModel):
    """Schema for removing a role from a user."""
    user_id: int = Field(..., description="User ID to remove role from")
    role_type: RoleType = Field(..., description="Role type to remove (ADMIN, MODERATOR, LEARNER)")

    class Config:
        extra = "forbid"


class UserRoleResponse(BaseModel):
    """Schema for user role response."""
    id: int = Field(..., description="UserRole ID")
    user_id: int = Field(..., description="User ID")
    role_id: int = Field(..., description="Role ID")
    role_type: RoleType = Field(..., description="Role type")
    role_description: Optional[str] = Field(default=None, description="Role description")

    class Config:
        from_attributes = True


class UserRolesListResponse(BaseModel):
    """Schema for listing user roles."""
    user_id: int = Field(..., description="User ID")
    roles: list[RoleType] = Field(default_factory=list, description="List of role types assigned to user")


class UserRoleCreate(BaseModel):
    role: List[RoleType]
