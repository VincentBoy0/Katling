from fastapi import APIRouter, Depends
from sqlmodel import Session

from core.security import required_roles
from models.user import RoleType
# from app.database import get_session

router = APIRouter(prefix="/test", tags=["Test"])

@router.get("/", dependencies=[Depends(required_roles(RoleType.LEARNER))])
def main():
    return {"message": "Welcome to FastAPI Base Project"}