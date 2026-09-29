from fastapi import APIRouter, Depends
import logging
from app.schemas.subscription import SubscriptionResponse
from app.services.subscription_service import subscription_service
from app.api.v1.auth_deps import get_current_user_id

logger = logging.getLogger("subscription_router")
router = APIRouter()

@router.get("/me", response_model=SubscriptionResponse)
def get_my_subscription(user_id: str = Depends(get_current_user_id)):
    """
    GET /api/v1/subscription/me
    Retrieves current user's subscription and remaining daily quota.
    """
    sub = subscription_service.get_or_create_subscription(user_id)
    plan = sub.get("plan", "FREE")
    limit = sub.get("daily_ai_limit", 10)
    used = sub.get("daily_ai_used", 0)
    remaining = max(0, limit - used)
    expires_at = sub.get("premium_expires_at")
    is_premium = plan == "PREMIUM"

    return SubscriptionResponse(
        success=True,
        plan=plan,
        dailyAiLimit=limit,
        dailyAiUsed=used,
        remainingToday=remaining,
        premiumExpiresAt=expires_at,
        isPremium=is_premium,
        lastActiveDate=sub.get("last_active_date", "")
    )
