from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class SubscriptionResponse(BaseModel):
    success: bool = True
    plan: str
    dailyAiLimit: int
    dailyAiUsed: int
    remainingToday: int
    premiumExpiresAt: Optional[datetime] = None
    isPremium: bool
    lastActiveDate: str
