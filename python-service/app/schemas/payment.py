from typing import Optional, Any
from pydantic import BaseModel

class CreateCheckoutRequest(BaseModel):
    plan: str = "PREMIUM_MONTHLY"

class CreateCheckoutResponse(BaseModel):
    success: bool
    orderCode: int
    checkoutUrl: str
    qrCode: Optional[str] = None
    message: Optional[str] = None

class WebhookResponse(BaseModel):
    success: bool
    message: Optional[str] = None
