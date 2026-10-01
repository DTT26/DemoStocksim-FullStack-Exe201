from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class UserSummary(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    role: str = "student"
    status: str = "ACTIVE"
