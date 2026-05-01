from datetime import datetime
from enum import StrEnum, unique

from beanie import Document
from pydantic import EmailStr, BaseModel


@unique
class UserRole(StrEnum):
    BasicUser = "BasicUser"
    Admin = "Admin"
    SuperAdmin = "SuperAdmin"


# This is for the Database (MongoDB)
class User(Document):
    name: str
    username: str
    password: str  # This will store the hashed password
    active: bool = True

    class Settings:
        name = "users"  # The collection name in Mongo


# These are for API Input Validation (Request Models)
class SignupData(BaseModel):
    name: str
    username: str
    password: str


class SigninData(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    username: str
    role: str
    access_token: str
    expiry: datetime
    token_type: str = "bearer"


class UserDto(BaseModel):
    id: str
    username: str = ""
    role: str = UserRole.BasicUser
    active: bool = True
