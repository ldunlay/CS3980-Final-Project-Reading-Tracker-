from datetime import datetime

from beanie import Document
from pydantic import BaseModel, EmailStr


class User(Document):
    name: str
    username: str
    email: EmailStr
    password: str
    role: str = "reader"

    class Settings:
        name = "users"


class SignupData(BaseModel):
    name: str
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    username: str
    role: str
    expiry: datetime

