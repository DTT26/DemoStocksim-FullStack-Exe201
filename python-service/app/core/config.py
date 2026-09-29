import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB
MONGO_URI = os.getenv(
    "MONGO_URI", 
    "mongodb+srv://de180115tranvandong_db_user:WM96L8H6biEenBJa@cluster0.yappw0s.mongodb.net/stocksim?retryWrites=true&w=majority&appName=Cluster0"
)
DB_NAME = os.getenv("DB_NAME", "stocksim")

# JWT
JWT_ACCESS_SECRET = os.getenv("JWT_ACCESS_SECRET", "your_jwt_access_secret")

# PayOS Configuration
PAYOS_CLIENT_ID = os.getenv("PAYOS_CLIENT_ID", "")
PAYOS_API_KEY = os.getenv("PAYOS_API_KEY", "")
PAYOS_CHECKSUM_KEY = os.getenv("PAYOS_CHECKSUM_KEY", "")
PAYOS_RETURN_URL = os.getenv("PAYOS_RETURN_URL", "http://localhost:5173/payment/success")
PAYOS_CANCEL_URL = os.getenv("PAYOS_CANCEL_URL", "http://localhost:5173/payment/cancel")

# Centralized Subscription Constants
PREMIUM_MONTHLY_PRICE = 99000
PREMIUM_MONTHLY_DAYS = 30
PREMIUM_DAILY_LIMIT = 500
FREE_DAILY_LIMIT = 10
