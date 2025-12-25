from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer
from firebase_admin import auth

security = HTTPBearer()

def verify_id_token(credentials=Depends(security)):
    token = credentials.credentials
    try:
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def decode_id_token(token: str):
    try:
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")
