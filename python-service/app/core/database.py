from pymongo import MongoClient, ASCENDING
from pymongo.database import Database
from pymongo.collection import Collection
import logging
from app.core.config import MONGO_URI, DB_NAME

logger = logging.getLogger("database")

_client: MongoClient = None
_db: Database = None

def get_mongo_client() -> MongoClient:
    global _client
    if _client is None:
        try:
            _client = MongoClient(
                MONGO_URI, 
                serverSelectionTimeoutMS=20000,
                connectTimeoutMS=20000,
                socketTimeoutMS=30000
            )
            logger.info("Connected to MongoDB successfully.")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    return _client

def get_db() -> Database:
    global _db
    if _db is None:
        client = get_mongo_client()
        _db = client[DB_NAME]
        init_db_indexes(_db)
    return _db

def init_db_indexes(db: Database):
    try:
        # Subscriptions collection indexes
        db.subscriptions.create_index([("user_id", ASCENDING)], unique=True)
        # Payments collection indexes
        db.payments.create_index([("order_code", ASCENDING)], unique=True)
        db.payments.create_index([("user_id", ASCENDING)])
    except Exception as e:
        logger.warning(f"Failed to create indexes: {e}")

def get_subscriptions_collection() -> Collection:
    return get_db()["subscriptions"]

def get_payments_collection() -> Collection:
    return get_db()["payments"]

def get_users_collection() -> Collection:
    return get_db()["users"]
