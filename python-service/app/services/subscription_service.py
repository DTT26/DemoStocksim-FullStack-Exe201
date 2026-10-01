from datetime import datetime, date, timezone, timedelta
from typing import Dict, Any, Optional, Tuple
from pymongo import ReturnDocument
import logging
from app.core.database import get_subscriptions_collection
from app.core.config import (
    FREE_DAILY_LIMIT,
    PREMIUM_DAILY_LIMIT,
    PREMIUM_MONTHLY_DAYS
)

logger = logging.getLogger("subscription_service")

class SubscriptionService:
    def __init__(self):
        pass

    def get_or_create_subscription(self, user_id: str) -> Dict[str, Any]:
        """
        Retrieves user subscription or creates a default FREE subscription.
        Automatically checks and resets daily quota and premium expiration.
        """
        col = get_subscriptions_collection()
        sub = col.find_one({"user_id": str(user_id)})

        today_str = date.today().isoformat()
        now_utc = datetime.now(timezone.utc)

        if not sub:
            default_sub = {
                "user_id": str(user_id),
                "plan": "FREE",
                "daily_ai_limit": FREE_DAILY_LIMIT,
                "daily_ai_used": 0,
                "last_active_date": today_str,
                "premium_expires_at": None,
                "payos_order_id": None,
                "created_at": now_utc,
                "updated_at": now_utc
            }
            try:
                col.insert_one(default_sub)
                sub = default_sub
            except Exception as e:
                # Concurrent creation edge-case
                sub = col.find_one({"user_id": str(user_id)})
                if not sub:
                    raise e

        # Check and apply daily reset and premium expiration
        sub = self.check_and_reset_daily(sub)
        return sub

    def check_and_reset_daily(self, sub: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enforces daily quota reset when last_active_date < today.
        Downgrades expired Premium to FREE plan.
        """
        col = get_subscriptions_collection()
        user_id = sub["user_id"]
        today_str = date.today().isoformat()
        now_utc = datetime.now(timezone.utc)

        needs_update = False
        updates: Dict[str, Any] = {}

        # 1. Reset daily count if date has rolled over
        last_active = sub.get("last_active_date", "")
        if str(last_active) < today_str:
            updates["daily_ai_used"] = 0
            updates["last_active_date"] = today_str
            sub["daily_ai_used"] = 0
            sub["last_active_date"] = today_str
            needs_update = True

        # 2. Check Premium expiration
        plan = sub.get("plan", "FREE")
        prem_exp = sub.get("premium_expires_at")

        if plan == "PREMIUM" and prem_exp is not None:
            # Ensure prem_exp is timezone-aware
            if isinstance(prem_exp, datetime):
                if prem_exp.tzinfo is None:
                    prem_exp = prem_exp.replace(tzinfo=timezone.utc)
                if now_utc > prem_exp:
                    logger.info(f"Premium subscription for user {user_id} expired at {prem_exp}. Reverting to FREE.")
                    updates["plan"] = "FREE"
                    updates["daily_ai_limit"] = FREE_DAILY_LIMIT
                    updates["premium_expires_at"] = None
                    sub["plan"] = "FREE"
                    sub["daily_ai_limit"] = FREE_DAILY_LIMIT
                    sub["premium_expires_at"] = None
                    needs_update = True

        if needs_update:
            updates["updated_at"] = now_utc
            col.update_one({"user_id": user_id}, {"$set": updates})

        return sub

    def reserve_quota_slot(self, user_id: str) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """
        Concurrency-safe atomic reservation of 1 AI interaction slot.
        Uses MongoDB find_one_and_update with $expr $lt condition to prevent race conditions.
        Returns: (success, updated_subscription_or_current)
        """
        col = get_subscriptions_collection()
        # First ensure daily reset has been evaluated
        sub = self.get_or_create_subscription(user_id)
        limit = sub.get("daily_ai_limit", FREE_DAILY_LIMIT)
        used = sub.get("daily_ai_used", 0)

        if used >= limit:
            return False, sub

        # Atomically increment quota if used < limit
        updated_sub = col.find_one_and_update(
            {
                "user_id": str(user_id),
                "daily_ai_used": {"$lt": limit}
            },
            {
                "$inc": {"daily_ai_used": 1},
                "$set": {"updated_at": datetime.now(timezone.utc)}
            },
            return_document=ReturnDocument.AFTER
        )

        if updated_sub is None:
            # Quota was consumed in parallel by concurrent requests
            current_sub = col.find_one({"user_id": str(user_id)}) or sub
            return False, current_sub

        return True, updated_sub

    def rollback_quota_slot(self, user_id: str):
        """
        Rolls back 1 reserved quota slot if the LLM request failed.
        Ensures failed requests DO NOT consume the user's quota.
        """
        col = get_subscriptions_collection()
        try:
            col.update_one(
                {
                    "user_id": str(user_id),
                    "daily_ai_used": {"$gt": 0}
                },
                {
                    "$inc": {"daily_ai_used": -1},
                    "$set": {"updated_at": datetime.now(timezone.utc)}
                }
            )
            logger.info(f"Rolled back quota slot for user {user_id} after LLM failure.")
        except Exception as e:
            logger.error(f"Failed to rollback quota for user {user_id}: {e}")

    def upgrade_to_premium(self, user_id: str, order_code: int) -> Dict[str, Any]:
        """
        Upgrades or extends Premium subscription upon verified payment.
        If user already has Premium and it has not expired:
            new_expiry = premium_expires_at + 30 days
        Else:
            new_expiry = now + 30 days
        """
        col = get_subscriptions_collection()
        sub = self.get_or_create_subscription(user_id)
        now_utc = datetime.now(timezone.utc)

        current_exp = sub.get("premium_expires_at")
        if current_exp is not None and isinstance(current_exp, datetime):
            if current_exp.tzinfo is None:
                current_exp = current_exp.replace(tzinfo=timezone.utc)
            if current_exp > now_utc:
                new_expiry = current_exp + timedelta(days=PREMIUM_MONTHLY_DAYS)
            else:
                new_expiry = now_utc + timedelta(days=PREMIUM_MONTHLY_DAYS)
        else:
            new_expiry = now_utc + timedelta(days=PREMIUM_MONTHLY_DAYS)

        updates = {
            "plan": "PREMIUM",
            "daily_ai_limit": PREMIUM_DAILY_LIMIT,
            "daily_ai_used": 0,
            "premium_expires_at": new_expiry,
            "payos_order_id": order_code,
            "last_active_date": date.today().isoformat(),
            "updated_at": now_utc
        }

        col.update_one({"user_id": str(user_id)}, {"$set": updates})
        logger.info(f"User {user_id} upgraded to PREMIUM until {new_expiry}. Order code: {order_code}")
        sub.update(updates)
        return sub

subscription_service = SubscriptionService()
