from functools import lru_cache
import json
from typing import Any

from beanie import init_beanie, PydanticObjectId
from pydantic_settings import BaseSettings, SettingsConfigDict
from models.models import CurrentBook, UpNext, FinishedBook
from models.users import User
from pymongo import AsyncMongoClient
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    MONGODB_URI: str
    MONGODB_DB: str
    SECRET_KEY: str
    model_config = SettingsConfigDict(env_file=".env")


@lru_cache
def get_settings():
    return Settings()


async def initialize_database():
    settings = get_settings()
    logger.info("Connecting to MongoDB...")
    client = AsyncMongoClient(settings.MONGODB_URI)
    await init_beanie(
        database=client[settings.MONGODB_DB], 
        document_models=[CurrentBook, UpNext, FinishedBook, User]
    )
    logger.info(f"Database '{settings.MONGODB_DB}' initialization complete.")


class Database:
    def __init__(self, model):
        self.model = model

    async def save(self, document) -> PydanticObjectId:
        m = await document.create()
        return m.id

    async def get(self, id: PydanticObjectId) -> Any:
        doc = await self.model.get(id)
        if doc:
            return doc
        return False

    async def get_all(self) -> list[Any]:
        docs = await self.model.find_all().to_list()
        return docs

    async def update(self, id: PydanticObjectId, body: BaseModel) -> Any:
        doc_id = id
        des_body = body.model_dump_json(exclude_defaults=True)
        des_body = json.loads(des_body)
        doc = await self.get(doc_id)
        if not doc:
            return False
        await doc.set(des_body)
        return doc

    async def delete(self, id: PydanticObjectId) -> bool:
        doc = await self.get(id)
        if not doc:
            return False
        await doc.delete()
        return True