from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, File, UploadFile

from models.models import CurrentBook, CurrentBookRequest
from fastapi.responses import FileResponse
from pathlib import Path
import json

import logging

logger = logging.getLogger(__name__)

DOWNLOADS_DIR = Path("downloads")

current_books_router = APIRouter()


@current_books_router.get("")
async def get_current_books():
    current_books_list = await CurrentBook.find_all().to_list()
    logger.info(f"viewing {len(current_books_list)} current_books_list")
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
        current_page=currentBook.current_page,
    )
    inserted_book = await new_current_book.insert()
    logger.info(
        f"New book '{inserted_book.title}' created with id [{inserted_book.id}]"
    )
    return inserted_book


@current_books_router.put("/{book_id}", status_code=200)
async def edit_current_book(
    book_id: PydanticObjectId, editCurrentBook: CurrentBookRequest
) -> CurrentBook:

    book = await CurrentBook.get(book_id)  # finding the current book by its id

    if not book:
        logger.warning(f"\t The book #{book_id} NOT Found.")
        raise HTTPException(
            status_code=404, detail="Book not found"
        )  # if it is not found, raise error

    book.title = editCurrentBook.title
    book.author = editCurrentBook.author
    book.num_pages = editCurrentBook.num_pages
    book.genre = editCurrentBook.genre
    book.isbn = editCurrentBook.isbn
    book.publish_date = editCurrentBook.publish_date
    book.startDate = editCurrentBook.startDate
    book.current_page = editCurrentBook.current_page

    updated_book = await book.save()
    logger.info(f"'{book.title}' with id [{book.id}] was updated.")
    return updated_book


@current_books_router.delete("/{book_id}", status_code=200)
async def delete_current_book(book_id: PydanticObjectId):
    book = await CurrentBook.get(book_id)  # finding the current book by its id

    if not book:
        logger.warning(f"\t The book #{book_id} NOT Found.")
        raise HTTPException(
            status_code=404, detail="Book not found"
        )  # if it is not found, raise error

    await book.delete()  # delete from mongo db
    logger.info(f"\t Book #[{book_id}] is deleted.")
    return {"message": "Book deleted successfully."}


# sources for file download
# https://fastapi.tiangolo.com/advanced/custom-response/#orjson-or-response-model
# https://oneuptime.com/blog/post/2026-02-03-fastapi-file-downloads/view
# claude for debugging


@current_books_router.get("/download")
async def download_current_books():
    books = (
        await CurrentBook.find_all().to_list()
    )  # get all of our current books in a list
    file_path = (
        "downloads/current_books.json"
    )  # save to the downloads folder on the server

    with open(file_path, "w") as f:  # open the file path and write the books to it
        json.dump([book.dict() for book in books], f, default=str)

    return FileResponse(
        path=file_path,
        filename="current_books.json",
        media_type="application/json",  # this sends it to the user browser and saves it to their downloads folder
    )
