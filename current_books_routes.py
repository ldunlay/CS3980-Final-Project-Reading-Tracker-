from typing import Annotated

from fastapi import APIRouter, HTTPException, Path, status

from models import Book, BookRequest

current_books_router = APIRouter()
current_book_list = []  # list that stores books
global_id = 0  # give books an id


@current_books_router.get("")  # gets the current books in the list
async def get_all_current_books() -> list[Book]:
    return current_book_list
