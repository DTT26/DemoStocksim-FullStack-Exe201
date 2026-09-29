from fastapi import Request, HTTPException, status, Depends
import jwt
from typing import Optional, Dict, Any
from app.core.config import JWT_ACCESS_SECRET
from app.core.database import get_users_collection

def get_current_user_id(request: Request) -> str:
    """
    Extracts and verifies JWT token from Authorization header or cookie.
    Returns authenticated user ID.
    Raises HTTPException 401 if missing or invalid.
    """
    # 0. Check trusted internal header forwarded from Express protect middleware
    internal_uid = request.headers.get("x-user-id")
    if internal_uid:
        return str(internal_uid).strip()

    token = None
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1].strip()

    if not token:
        token = request.cookies.get("token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Yêu cầu đăng nhập: Không tìm thấy token xác thực."
        )

    try:
        decoded = jwt.decode(token, JWT_ACCESS_SECRET, algorithms=["HS256"])
        user_id = decoded.get("userId") or decoded.get("id") or decoded.get("_id") or decoded.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token không chứa thông tin người dùng hợp lệ."
            )
        return str(user_id)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token xác thực không hợp lệ: {str(e)}"
        )

def get_optional_user_id(request: Request) -> str:
    """
    Returns user_id if valid token is provided, or a fallback anonymous id for testing.
    """
    try:
        return get_current_user_id(request)
    except Exception:
        # Fallback anonymous / default student ID for backwards compatibility
        return "64f7b1e4a3b9c2d1e8f9a0b1"
