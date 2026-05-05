from datetime import date
from pydantic import BaseModel
from beanie import Document


class CurrentBook(Document):  # inherits from Document for mapping to MongoDB

    owner_username: str | None = None
    title: str
    author: str
    num_pages: int | None = None
    genre: str | None = None
    isbn: str | None = None
    publish_date: date | None = None
    current_page: int | None = None
    startDate: date
    cover_image: str | None = None

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
    cover_image: str | None = None


class UpNext(Document):  # inherits from Document for mapping to MongoDB

    owner_username: str | None = None
    title: str
    author: str
    num_pages: int | None = None
    genre: str | None = None
    isbn: str | None = None
    publish_date: date | None = None
    added_date: date | None = None
    cover_image: str | None = None

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
    cover_image: str | None = None

class FinishedBook(Document):  # inherits from Document for mapping to MongoDB
 
    owner_username: str | None = None
    title: str
    author: str
    num_pages: int | None = None
    genre: str | None = None
    isbn: str | None = None
    publish_date: date | None = None
    startDate: date | None = None
    finishDate: date | None = None
    rating: int | None = None        # 1–5 stars
    review: str | None = None
    cover_image: str | None = None
 
    class Settings:
        name = "FinishedBook"  # making sure it maps to the correct mongo db collection
 
 
class FinishedBookRequest(BaseModel):  # inherits from BaseModel for input validation
    title: str
    author: str
    num_pages: int | None = None
    genre: str | None = None
    isbn: str | None = None
    publish_date: date | None = None
    startDate: date | None = None
    finishDate: date | None = None
    rating: int | None = None
    review: str | None = None
    cover_image: str | None = None
