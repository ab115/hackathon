from pydantic import BaseModel, EmailStr
from typing import Literal, Optional


class PaymentInitiateRequest(BaseModel):
    hackathon_id: Optional[int] = None
    mentor_id: Optional[int] = None
    amount: float
    email: EmailStr
    phone: str


class PaymentVerifyRequest(BaseModel):
    txnid: str
    status: str
    amount: Optional[float] = 0.0


class PaymentSimulateRequest(BaseModel):
    registration_id: Optional[int] = None
    booking_id: Optional[int] = None
    status: Literal["success", "failure"] = "success"


class PaymentHashRequest(BaseModel):
    amount: float
    productinfo: str = "Hackathon Registration"
    firstname: str
    email: EmailStr


class PaymentCallbackRequest(BaseModel):
    """
    PayU server-to-server IPN callback fields.
    PayU sends these as form fields on payment completion.
    """
    txnid: str
    amount: str
    productinfo: str
    firstname: str
    email: str
    status: str
    hash: str
    mihpayid: Optional[str] = None
    error: Optional[str] = None
    error_Message: Optional[str] = None
