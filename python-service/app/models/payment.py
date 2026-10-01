from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field

PaymentStatus = Literal["PENDING", "PAID", "CANCELLED", "EXPIRED", "FAILED"]

class PaymentOrder(BaseModel):
    user_id: str
    order_code: int
    plan: str = "PREMIUM_MONTHLY"
    amount: int = 99000
    status: PaymentStatus = "PENDING"
    payment_provider: str = "PAYOS"
    checkout_url: Optional[str] = None
    qr_code: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    paid_at: Optional[datetime] = None
    expired_at: Optional[datetime] = None
