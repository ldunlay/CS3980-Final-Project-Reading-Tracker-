from beanie import Document
from datetime import datetime
from pydantic import EmailStr, BaseModel
from enum import StrEnum

class UserRole(StrEnum):
    BasicUser = "BasicUser"
    Admin = "Admin"

# This is for the Database (MongoDB)
class User(Document):
    name: str
    email: EmailStr
    username: str
    password: str  # This will store the hashed password
    role: str = UserRole.BasicUser

    class Settings:
        name = "users"  # The collection name in Mongo

# These are for API Input Validation (Request Models)
class SignupData(BaseModel):
    name: str
    email: EmailStr
    password: str

class SigninData(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    username: str
    role: str
    access_token: str
    expiry: datetime
    token_type: str = "bearer"
