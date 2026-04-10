from pydantic import BaseModel  # for validation
from datetime import date


class CurrentBook(BaseModel):
    id: int
    title: str
    author: str
    num_pages: int | None = None
    genre: str | None = None
    isbn: str | None = None
    publish_date: str | None = None
    startDate: date | None = None


class CurrentBookRequest(BaseModel):
    title: str
    author: str
    num_pages: int | None = None
    genre: str | None = None
    isbn: str | None = None
    publish_date: str | None = None
    startDate: date | None = None
