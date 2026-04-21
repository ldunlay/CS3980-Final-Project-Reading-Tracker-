from datetime import date
from pydantic import BaseModel
from beanie import Document


class CurrentBook(Document):  # inherits from Document for mapping to MongoDB

    title: str
    author: str
    num_pages: int | None = None
    genre: str | None = None
    isbn: str | None = None
    publish_date: date | None = None
    startDate: date


class CurrentBookRequest(BaseModel):  # inherits from BaseModel for input validation
    title: str
    author: str
    num_pages: int | None = None
    genre: str | None = None
    isbn: str | None = None
    publish_date: date | None = None
    startDate: date | None = None


class UpNext(Document):  # inherits from Document for mapping to MongoDB

    title: str
    author: str
    num_pages: int | None = None
    genre: str | None = None
    isbn: str | None = None
    publish_date: date | None = None
    added_date: date | None = None


class UpNextRequest(BaseModel):  # inherits from BaseModel for input validation
    title: str
    author: str
    num_pages: int | None = None
    genre: str | None = None
    isbn: str | None = None
    publish_date: date | None = None
    added_date: date | None = None
