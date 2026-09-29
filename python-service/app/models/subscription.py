from datetime import datetime, date
from typing import Optional, Literal
from pydantic import BaseModel, Field

PlanType = Literal["FREE", "PREMIUM"]

class UserSubscription(BaseModel):
    user_id: str
    plan: PlanType = "FREE"
    daily_ai_limit: int = 10
    daily_ai_used: int = 0
    last_active_date: str = Field(default_factory=lambda: date.today().isoformat())
    premium_expires_at: Optional[datetime] = None
    payos_order_id: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
