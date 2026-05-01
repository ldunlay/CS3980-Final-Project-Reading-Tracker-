from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError

from auth.authenticate import authenticate
from auth.jwt_handler import TokenData
from models.models import CurrentBook, CurrentBookRequest
from fastapi.responses import FileResponse

import json

import logging

logger = logging.getLogger(__name__)


current_books_router = APIRouter()


@current_books_router.get("")
async def get_current_books(user: TokenData = Depends(authenticate)):
    current_books_list = await CurrentBook.find(
        CurrentBook.owner_username == user.username
    ).to_list()
    logger.info(f"viewing {len(current_books_list)} current_books_list")
    return current_books_list


@current_books_router.post("", status_code=201)
async def create_new_current_book(
    currentBook: CurrentBookRequest, user: TokenData = Depends(authenticate)
) -> CurrentBook:
    new_current_book = CurrentBook(
        owner_username=user.username,
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


@current_books_router.post("/upload", status_code=201)
async def upload_current_books(
    uploaded_books: list[dict], user: TokenData = Depends(authenticate)
) -> list[CurrentBook]:
    imported_books = []

    for book_data in uploaded_books:
        if not isinstance(book_data, dict):
            raise HTTPException(
                status_code=400,
                detail="Uploaded file must contain a list of book objects.",
            )

        book_data = book_data.copy()
        book_data.pop("_id", None)
        book_data.pop("id", None)

        try:
            current_book = CurrentBookRequest(**book_data)
        except ValidationError as exc:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file contains a book with missing or invalid fields.",
            ) from exc

        imported_books.append(
            CurrentBook(
                owner_username=user.username,
                title=current_book.title,
                author=current_book.author,
                num_pages=current_book.num_pages,
                genre=current_book.genre,
                isbn=current_book.isbn,
                publish_date=current_book.publish_date,
                startDate=current_book.startDate,
                current_page=current_book.current_page,
            )
        )

    inserted_books = []
    for book in imported_books:
        inserted_books.append(await book.insert())

    logger.info(f"Imported {len(inserted_books)} current books from uploaded JSON.")
    return inserted_books


@current_books_router.put("/{book_id}", status_code=200)
async def edit_current_book(
    book_id: PydanticObjectId,
    editCurrentBook: CurrentBookRequest,
    user: TokenData = Depends(authenticate),
) -> CurrentBook:

    book = await CurrentBook.get(book_id)  # finding the current book by its id

    if not book or book.owner_username != user.username:
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
async def delete_current_book(
    book_id: PydanticObjectId, user: TokenData = Depends(authenticate)
):
    book = await CurrentBook.get(book_id)  # finding the current book by its id

    if not book or book.owner_username != user.username:
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
async def download_current_books(user: TokenData = Depends(authenticate)):
    books = (
        await CurrentBook.find(CurrentBook.owner_username == user.username).to_list()
    )  # get all of our current books in a list
    file_path = (
        "downloads/current_books.json"  # save to the downloads folder on the server
    )

    with open(file_path, "w") as f:  # open the file path and write the books to it
        json.dump([book.dict() for book in books], f, default=str)

    return FileResponse(
        path=file_path,
        filename="current_books.json",
        media_type="application/json",  # this sends it to the user browser and saves it to their downloads folder
    )
