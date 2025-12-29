import firebase_admin
from firebase_admin import credentials
import os

# Ensure Firebase is initialized ONLY once
def init_firebase():
    """Initialize Firebase Admin SDK. Safe to call multiple times."""
    if not firebase_admin._apps:
        # Get the path relative to the backend directory
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        cred_path = os.path.join(base_dir, "serviceAccountKey.json")
        
        if not os.path.exists(cred_path):
            raise FileNotFoundError(f"Firebase credentials not found at: {cred_path}")
        
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK initialized successfully")
    return firebase_admin.get_app()
