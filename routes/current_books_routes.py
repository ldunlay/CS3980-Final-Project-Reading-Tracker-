from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from pydantic import ValidationError
import os
from auth.authenticate import authenticate, get_admin_user
from auth.jwt_handler import TokenData
from models.models import CurrentBook, CurrentBookRequest
from fastapi.responses import FileResponse
import shutil
import uuid
from typing import Annotated
import json

import logging

logger = logging.getLogger(__name__)


current_books_router = APIRouter()


@current_books_router.get("")  # logger ok
async def get_current_books(user: TokenData = Depends(authenticate)):
    current_books_list = await CurrentBook.find(
        CurrentBook.owner_username == user.username
    ).to_list()
    logger.info(f"{user.username} is viewing {len(current_books_list)} current books.")
    return current_books_list


@current_books_router.post("", status_code=201)  # logger ok
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
        cover_image=currentBook.cover_image,

    )
    logger.info(f"User [{user.username}] is creating a new current book.")
    inserted_book = await new_current_book.insert()
    logger.info(
        f"{user.username} created new book '{inserted_book.title}' with id [{inserted_book.id}]"
    )
    return inserted_book


@current_books_router.post("/upload", status_code=201)  # logger ok
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

    logger.info(
        f"{user.username} imported {len(inserted_books)} current books from uploaded JSON."
    )
    return inserted_books


@current_books_router.put("/{book_id}", status_code=200)  # logger ok
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
    logger.info(f"{user.username} is updating '{book.title}' with id [{book.id}].")
    updated_book = await book.save()
    logger.info(f"{user.username} updated '{book.title}' with id [{book.id}].")
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
    logger.info(f"{user.username} is deleting book with id [{book_id}].")
    await book.delete()  # delete from mongo db
    logger.info(f"{user.username} deleted book with id [{book_id}].")
    return {"message": "Book deleted successfully."}


# sources for file download
# https://fastapi.tiangolo.com/advanced/custom-response/#orjson-or-response-model
# https://oneuptime.com/blog/post/2026-02-03-fastapi-file-downloads/view
# claude for debugging


@current_books_router.get("/download")
async def download_current_books(user: TokenData = Depends(authenticate)):
    books = await CurrentBook.find(
        CurrentBook.owner_username == user.username
    ).to_list()  # get all of our current books in a list

    os.makedirs(
        "downloads", exist_ok=True
    )  # use python built in module os to make a downloads folder if it doesn't exist

    file_path = (
        "downloads/current_books.json"  # save to the downloads folder on the server
    )

    with open(file_path, "w") as f:  # open the file and write the books to it
        json.dump([book.dict() for book in books], f, default=str)
    logger.info(f"{user.username} downloaded the current books list.")
    return FileResponse(
        path=file_path,
        filename="current_books.json",
        media_type="application/json",  # this sends it to the user browser and saves it to their downloads folder
    )

# upload a book cover image

@current_books_router.post("/{book_id}/cover", status_code=200)
async def upload_cover_image(
    book_id: PydanticObjectId,
    file: Annotated[UploadFile, File()],
    user: TokenData = Depends(authenticate),
) -> CurrentBook:
    book = await CurrentBook.get(book_id)

    if not book or book.owner_username != user.username:
        raise HTTPException(status_code=404, detail="Book not found")

    # Only allow image files
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Save to static/images folder

    os.makedirs("static/images", exist_ok=True)
    extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{extension}"
    file_path = f"static/images/{filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Save path to the book in MongoDB
    book.cover_image = f"/static/images/{filename}"
    await book.save()
    logger.info(f"{user.username} uploaded cover for book [{book_id}].")
    return book

# Admin-only routes
@current_books_router.get("/admin/all", dependencies=[Depends(get_admin_user)])
async def admin_get_all_current_books():
    all_books = await CurrentBook.find_all().to_list()
    logger.info(f"Admin viewed all {len(all_books)} current books.")
    return all_books

@current_books_router.delete("/admin/{book_id}", dependencies=[Depends(get_admin_user)])
async def admin_delete_current_book(book_id: PydanticObjectId):
    book = await CurrentBook.get(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    await book.delete()
    logger.info(f"Admin deleted current book [{book_id}].")
    return {"message": "Book deleted successfully."}
