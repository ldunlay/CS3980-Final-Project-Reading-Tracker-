import beanie
from typing import Annotated
from beanie import init_beanie
from fastapi import APIRouter, HTTPException, Path, status
from fastapi.responses import FileResponse

from models import CurrentBook, CurrentBookRequest
from pathlib import Path

current_books_router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent


@current_books_router.get("")
async def get_current_books():
    current_books_list = await CurrentBook.find_all().to_list()
    return current_books_list


@current_books_router.post("", status_code=201)
async def create_new_current_book(currentBook: CurrentBookRequest) -> CurrentBook:
    new_current_book = CurrentBook(
        title=currentBook.title,
        author=currentBook.author,
        num_pages=currentBook.num_pages,
        genre=currentBook.genre,
        isbn=currentBook.isbn,
        publish_date=currentBook.publish_date,
        startDate=currentBook.startDate,
    )

    return await new_current_book.insert()
