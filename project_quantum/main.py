from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
import hashlib
import jwt
import os

from models import Base, User, Profile
from config import DATABASE_URL, SECRET_KEY
from auth import verify_password, get_password_hash, create_access_token
from middleware import verify_token

app = FastAPI()

if not os.path.exists("static"):
    os.makedirs("static")
app.mount("/static", StaticFiles(directory="static"), name="static")

try:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    engine = None

def get_db():
    if not engine:
        raise HTTPException(status_code=500, detail="Database connection failed")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from encryption_utils import decrypt_and_get_key

# --- Encrypted Stage Flags ---
STAGE_1_CT = "cX1/7T+Mdl3cXs+whia6GgTqChOUSQvR2HBhZAJ8IPc="
STAGE_2_CT = "joELNvvCOZCK+sTCzXmK2K4WeXQkApBNv7P3CCtH2Hg="
STAGE_3_CT = "9fF+Ml3C5J0Ofow50moYCbkfpOGuL2RNhKPefsDdzJs="
STAGE_4_CT = "X1Kckf6qqDz3AEYpKp3AcjeHhdsQIfnFoABgLTy+f9Q="
STAGE_5_CT = "VDJ1tnjR3YMKFaiZeeIHuRJ66nwMX7NqzTd7s/H6Umc="
STAGE_8_CT = "2JL4sosJb9sKE+uKoYT3dGJasm37SkW5wNlgFJGYYFQ="
STAGE_9_CT = "fdxhwB+L/viE80svMM1Km0Jm+EN6/bq6hIXqwYz5etw="
STAGE_10_CT = "KHoB1vrneLW3vYbJ/wOEven7nGXFZ+DboRivLjkgRZ0="

@app.get("/", response_class=HTMLResponse)
def index():
    with open("static/index.html", "r") as f:
        return f.read()

@app.get("/api/health")
def health_check():
    # If the app boots, they fixed the models! State: "models_fixed"
    key1 = decrypt_and_get_key(STAGE_1_CT, "models_fixed")
    return {"status": "Quantum core is online.", "key_stage_1": key1}

@app.post("/api/init_db")
def init_db():
    if not engine:
        raise HTTPException(status_code=500, detail="DB Engine not initialized")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    if not db.query(User).filter_by(username="admin").first():
        admin = User(username="admin", password_hash=get_password_hash("admin123"), role="admin")
        db.add(admin)
        db.commit()
    db.close()
    key2 = decrypt_and_get_key(STAGE_2_CT, "db_init_success")
    return {"message": "Database initialized", "key_stage_2": key2}

@app.post("/api/login")
def login(request_data: dict, db: Session = Depends(get_db)):
    username = request_data.get("username")
    password = request_data.get("password")
    
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    key3 = decrypt_and_get_key(STAGE_3_CT, "auth_bcrypt_success")
    token = create_access_token(user.id, user.role)
    
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"], options={"verify_signature": False})
        if "sub" in decoded and "role" in decoded:
            key4 = decrypt_and_get_key(STAGE_4_CT, "jwt_payload_success")
            return {"token": token, "key_stage_3": key3, "key_stage_4": key4}
    except Exception:
        pass
        
    return {"token": token, "key_stage_3": key3}

@app.get("/api/protected")
def get_protected_data(payload: dict = Depends(verify_token)):
    key5 = decrypt_and_get_key(STAGE_5_CT, "middleware_success")
    return {"message": "Access granted to secure zone", "key_stage_5": key5}

@app.get("/api/users")
def get_users(payload: dict = Depends(verify_token), db: Session = Depends(get_db)):
    users = db.query(User).all()
    return {"users": [{"id": u.id, "username": u.username, "role": u.role} for u in users]}

@app.get("/api/metrics")
def get_metrics(payload: dict = Depends(verify_token), db: Session = Depends(get_db)):
    users = db.query(User).all()
    count = len(users)
    
    # STAGE 8 BUG: ZeroDivisionError if exactly 1 user exists
    avg_active = 100 / (count - 1)
    
    key8 = decrypt_and_get_key(STAGE_8_CT, str(avg_active))
    return {"avg_active": avg_active, "key_stage_8": key8}

@app.get("/api/users/search")
def search_users(q: str, payload: dict = Depends(verify_token), db: Session = Depends(get_db)):
    # STAGE 9 BUG: SQL Injection syntax error
    query = f"SELECT username FROM users WHERE username = '{q}"
    try:
        result = db.execute(text(query)).fetchall()
        key9 = decrypt_and_get_key(STAGE_9_CT, "sql_injection_fixed")
        return {"users": [r[0] for r in result], "key_stage_9": key9}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/vault")
def get_vault(payload: dict = Depends(verify_token)):
    # STAGE 10 BUG: Python Cryptography PKCS7 Padding Bug
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
    from cryptography.hazmat.backends import default_backend
    import base64
    
    # Decryption fails because padding isn't removed correctly
    key = b"quantum_16_bytes"
    iv = b"0000000000000000"
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    
    # Encrypted payload
    encrypted_base64 = "YtMv1oBItOq4R1D6HkXzNw=="
    ct = base64.b64decode(encrypted_base64)
    pt = decryptor.update(ct) + decryptor.finalize()
    
    # Bug: Assuming PKCS7 padding but not using the unpadder
    final_text = pt.decode('utf-8', errors='ignore')
    
    if "STAGE_10" in final_text:
        key10 = decrypt_and_get_key(STAGE_10_CT, "padding_fixed")
        return {"vault_data": final_text, "key_stage_10": key10}
    else:
        raise HTTPException(status_code=500, detail="Vault decryption failed")
