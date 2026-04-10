from pydantic import BaseModel  # for validation
from datetime import date


class Book(BaseModel):
    id: int
    title: str
    author: str
    genre: str | None = None
    isbn: str | None = None
    publish_date: str | None = None

    list_type: str  # currentBooks, upNext, finished
    startDate: date | None = None  # only used for current and finished books
    finishDate: date | None = None  # only used for finished books


class BookRequest(BaseModel):
    title: str
    author: str
    genre: str | None = None
    isbn: str | None = None
    publish_date: str | None = None

    list_type: str  # currentBooks, upNext, finished
    startDate: date | None = None  # only used for current and finished books
    finishDate: date | None = None  # only used for finished books
