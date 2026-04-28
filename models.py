from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, EmailStr
from beanie import Document
from enum import StrEnum, unique


class CurrentBook(Document):  # inherits from Document for mapping to MongoDB

    title: str
    author: str
    num_pages: int | None = None
    genre: str | None = None
    isbn: str | None = None
    publish_date: date | None = None
    current_page: int | None = None
    startDate: date
    user: str  # gets saved to mongo db so need to specifiy the user

    class Settings:
        name = "CurrentBook"  # making sure it maps to the correct mongo db collection


class CurrentBookRequest(BaseModel):  # inherits from BaseModel for input validation
    title: str
    author: str
    num_pages: int | None = None
    genre: str | None = None
    isbn: str | None = None
    publish_date: date | None = None
    current_page: int | None = None
    startDate: date


class UpNext(Document):  # inherits from Document for mapping to MongoDB

    title: str
    author: str
    num_pages: int | None = None
    genre: str | None = None
    isbn: str | None = None
    publish_date: date | None = None
    added_date: date | None = None

    class Settings:
        name = "UpNext"  # making sure it maps to the correct mongo db collection


class UpNextRequest(BaseModel):  # inherits from BaseModel for input validation
    title: str
    author: str
    num_pages: int | None = None
    genre: str | None = None
    isbn: str | None = None
    publish_date: date | None = None
    added_date: date | None = None


@unique
class UserRole(StrEnum):
    BasicUser = "BasicUser"
    Admin = "Admin"
    SuperAdmin = "SuperAdmin"


class User(Document):
    email: EmailStr = ""
    role: str = UserRole.BasicUser
    password: str = ""
    active: bool = True

    model_config = ConfigDict(
        json_schema_extra={
            "example": {"email": "python-web-dev@cs.uiowa.edu", "password": "strong!!!"}
        }
    )

    class Settings:
        name = "users"


class TokenResponse(BaseModel):
    username: str
    role: str
    access_token: str
    expiry: datetime
    token_type: str = "bearer"


class UserDto(BaseModel):
    id: str
    email: EmailStr = ""
    role: str = UserRole.BasicUser
    active: bool = True
