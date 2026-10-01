from fastapi import APIRouter, Depends, HTTPException, Request, status
import logging
from typing import Dict, Any

from app.schemas.payment import CreateCheckoutRequest, CreateCheckoutResponse, WebhookResponse
from app.services.payos_service import payos_service
from app.api.v1.auth_deps import get_current_user_id

logger = logging.getLogger("payment_router")
router = APIRouter()

@router.post("/create-checkout", response_model=CreateCheckoutResponse)
def create_checkout(
    req: CreateCheckoutRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    POST /api/v1/payment/create-checkout
    Generates a PayOS checkout link with QR code for the authenticated user.
    """
    try:
        result = payos_service.create_payment_link(
            user_id=user_id, 
            plan=req.plan,
            return_url=req.returnUrl,
            cancel_url=req.cancelUrl
        )
        if not result.get("success"):
            return CreateCheckoutResponse(
                success=False,
                orderCode=result.get("orderCode", 0),
                checkoutUrl="",
                message=result.get("message", "Tạo liên kết thanh toán không thành công.")
            )
        return CreateCheckoutResponse(
            success=True,
            orderCode=result["orderCode"],
            checkoutUrl=result["checkoutUrl"],
            qrCode=result.get("qrCode")
        )
    except Exception as e:
        logger.error(f"Error in create_checkout endpoint: {e}", exc_info=True)
        return CreateCheckoutResponse(
            success=False,
            orderCode=0,
            checkoutUrl="",
            message="Lỗi hệ thống khi khởi tạo thanh toán. Vui lòng thử lại sau."
        )

@router.post("/payos-webhook")
async def payos_webhook(request: Request):
    """
    POST /api/v1/payment/payos-webhook
    PayOS Webhook receiver with signature verification and idempotent subscription upgrade.
    """
    try:
        payload = await request.json()
    except Exception as e:
        logger.error(f"Malformed JSON in webhook request: {e}")
        return {"success": False, "message": "Invalid JSON body"}

    try:
        res = payos_service.verify_and_process_webhook(payload)
        return res
    except Exception as e:
        logger.error(f"Unexpected error in payos_webhook: {e}", exc_info=True)
        # Never crash FastAPI
        return {"success": False, "message": "Webhook handler error"}

@router.get("/verify-order/{order_code}")
def verify_order(
    order_code: int,
    user_id: str = Depends(get_current_user_id)
):
    """
    GET /api/v1/payment/verify-order/{order_code}
    Direct check with PayOS API to confirm payment and upgrade subscription.
    """
    res = payos_service.verify_order_payment(order_code)
    return res

