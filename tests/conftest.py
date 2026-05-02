import os
from typing import AsyncGenerator

from httpx import ASGITransport, AsyncClient
import pytest

from auth import jwt_handler
from database.connection import get_settings, initialize_database
from main import app
from models.users import User

TEST_SECRET_KEY = "test_secret_key_for_tests_1234567890"

os.environ["MONGODB_URI"] = (
    "mongodb://localhost:27017"  # had to use MONGODB_URI instead of MONGO_DB url, that is how our connection file is set up  # our connection file splits it into uri and db, so we had to do that here
)
os.environ["MONGODB_DB"] = "test_db"
os.environ["SECRET_KEY"] = TEST_SECRET_KEY
get_settings.cache_clear()
jwt_handler.SECRET_KEY = TEST_SECRET_KEY


@pytest.fixture
async def default_client() -> AsyncGenerator[AsyncClient, None]:
    await initialize_database()
    await User.find_all().delete()

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://app"
    ) as client:
        yield client


@pytest.fixture
async def access_token() -> str:
    token, _ = jwt_handler.create_access_token(
        {"username": "python-web-dev@cs.uiowa.edu", "role": "BasicUser"}
    )
    return token
