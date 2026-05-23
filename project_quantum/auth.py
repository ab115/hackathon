import bcrypt
import jwt
import datetime
from config import SECRET_KEY

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # STAGE 3 BUG: Incorrect password verification logic
    # It tries to do a direct string comparison instead of bcrypt.checkpw
    return plain_password == hashed_password

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(user_id: int, role: str) -> str:
    # STAGE 4 BUG: Missing payload data
    # The JWT token is created without the 'sub' (user_id) or 'role' fields!
    payload = {
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")
