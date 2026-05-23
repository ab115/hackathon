import jwt
from fastapi import Request, HTTPException
from config import SECRET_KEY

def verify_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing auth header")
        
    parts = auth_header.split()
    
    # STAGE 5 BUG: Expects 'Token' instead of standard 'Bearer'
    if len(parts) != 2 or parts[0] != "Token":
        raise HTTPException(status_code=401, detail="Invalid token type. Expected Token")
        
    token = parts[1]
    try:
        # STAGE 5 BUG: Disabled expiration check
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"], options={"verify_exp": False})
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
