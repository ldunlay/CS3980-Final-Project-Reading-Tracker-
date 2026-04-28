import os
from pathlib import Path

from beanie import init_beanie
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

from models import CurrentBook, UpNext, User

BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "reading_tracker")

client = AsyncIOMotorClient(MONGODB_URI)
db = client[MONGODB_DB]
users_collection = db["users"]


async def init_database():
    await init_beanie(database=db, document_models=[CurrentBook, UpNext, User])


def close_database():
    client.close()
