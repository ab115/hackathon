from fastapi import FastAPI, BackgroundTasks, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn
import time
import hashlib
from contextlib import asynccontextmanager
from database import init_db, close_db

PAYU_MERCHANT_KEY = "gtKFFx"
PAYU_SALT = "eCwWELxi"

class RegistrationForm(BaseModel):
    name: str
    email: str
    phone: str = Field(..., pattern=r'^\+91[0-9]{10}$')
    college: str
    hackathon_id: str
    team_size: int

class PaymentData(BaseModel):
    amount: float
    productinfo: str
    firstname: str
    email: str
    phone: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()

app = FastAPI(lifespan=lifespan, title="HackFusion API - Indian Context")

# Add CORS so React frontend can call it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/payment/hash")
async def generate_payu_hash(data: PaymentData):
    txnid = "txnid" + str(int(time.time()))
    hash_string = f"{PAYU_MERCHANT_KEY}|{txnid}|{data.amount}|{data.productinfo}|{data.firstname}|{data.email}|||||||||||{PAYU_SALT}"
    payu_hash = hashlib.sha512(hash_string.encode('utf-8')).hexdigest().lower()
    return {
        "key": PAYU_MERCHANT_KEY,
        "txnid": txnid,
        "amount": data.amount,
        "productinfo": data.productinfo,
        "firstname": data.firstname,
        "email": data.email,
        "phone": data.phone,
        "hash": payu_hash
    }

@app.post("/api/register", status_code=status.HTTP_202_ACCEPTED)
async def register(form: RegistrationForm):
    from producer import producer
    producer.publish_registration(form.dict())
    return {"message": "Registration received. Processing asynchronously via Redpanda."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)

