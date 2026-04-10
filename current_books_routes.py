from typing import Annotated

from fastapi import APIRouter, HTTPException, Path, status

from models import CurrentBook, CurrentBookRequest

current_books_router = APIRouter()
current_book_list = []  # list that stores books
global_id = 0  # give current books an id


@current_books_router.get("")  # gets the current books in the list
async def get_all_current_books() -> list[CurrentBook]:
    return current_book_list
