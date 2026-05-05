from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile

from auth.authenticate import authenticate, get_admin_user
from auth.jwt_handler import TokenData
from models.models import FinishedBook, FinishedBookRequest
from typing import Annotated
import shutil, uuid
import os

import logging

logger = logging.getLogger(__name__)

finished_books_router = APIRouter()


@finished_books_router.get("")
async def get_finished_books(user: TokenData = Depends(authenticate)):
    finished_books_list = await FinishedBook.find(
        FinishedBook.owner_username == user.username
    ).to_list()
    logger.info(f"viewing {len(finished_books_list)} finished books")
    return finished_books_list


@finished_books_router.post("", status_code=201)
async def create_finished_book(
    finishedBook: FinishedBookRequest, user: TokenData = Depends(authenticate)
) -> FinishedBook:
    new_finished_book = FinishedBook(
        owner_username=user.username,
        title=finishedBook.title,
        author=finishedBook.author,
        num_pages=finishedBook.num_pages,
        genre=finishedBook.genre,
        isbn=finishedBook.isbn,
        publish_date=finishedBook.publish_date,
        startDate=finishedBook.startDate,
        finishDate=finishedBook.finishDate,
        rating=finishedBook.rating,
        review=finishedBook.review,
    )
    inserted_book = await new_finished_book.insert()
    logger.info(
        f"Finished book '{inserted_book.title}' created with id [{inserted_book.id}]"
    )
    return inserted_book

# Admin-only routes
@finished_books_router.get("/admin/all", dependencies=[Depends(get_admin_user)])
async def admin_get_all_finished_books():
    all_books = await FinishedBook.find_all().to_list()
    logger.info(f"Admin viewed all {len(all_books)} finished books.")
    return all_books


@finished_books_router.delete("/admin/{book_id}", dependencies=[Depends(get_admin_user)])
async def admin_delete_finished_book(book_id: PydanticObjectId):
    book = await FinishedBook.get(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Finished book not found")
    await book.delete()
    logger.info(f"Admin deleted finished book [{book_id}].")
    return {"message": "Finished book deleted successfully."}

@finished_books_router.post("/{book_id}/cover", status_code=200)
async def upload_finished_book_cover(
    book_id: PydanticObjectId,
    file: Annotated[UploadFile, File()],
    user: TokenData = Depends(authenticate),
) -> FinishedBook:
    book = await FinishedBook.get(book_id)
    if not book or book.owner_username != user.username:
        raise HTTPException(status_code=404, detail="Book not found")
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    os.makedirs("static/images", exist_ok=True)
    extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{extension}"
    file_path = f"static/images/{filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    book.cover_image = f"/static/images/{filename}"
    await book.save()
    logger.info(f"{user.username} uploaded cover for finished book [{book_id}].")
    return book



@finished_books_router.put("/{book_id}", status_code=200)
async def edit_finished_book(
    book_id: PydanticObjectId,
    editFinishedBook: FinishedBookRequest,
    user: TokenData = Depends(authenticate),
) -> FinishedBook:

    book = await FinishedBook.get(book_id)

    if not book or book.owner_username != user.username:
        logger.warning(f"\t The finished book #{book_id} NOT Found.")
        raise HTTPException(status_code=404, detail="Finished book not found")

    book.title = editFinishedBook.title
    book.author = editFinishedBook.author
    book.num_pages = editFinishedBook.num_pages
    book.genre = editFinishedBook.genre
    book.isbn = editFinishedBook.isbn
    book.publish_date = editFinishedBook.publish_date
    book.startDate = editFinishedBook.startDate
    book.finishDate = editFinishedBook.finishDate
    book.rating = editFinishedBook.rating
    book.review = editFinishedBook.review

    updated_book = await book.save()
    logger.info(f"Finished book '{book.title}' with id [{book.id}] was updated.")
    return updated_book


@finished_books_router.delete("/{book_id}", status_code=200)
async def delete_finished_book(
    book_id: PydanticObjectId, user: TokenData = Depends(authenticate)
):
    book = await FinishedBook.get(book_id)

    if not book or book.owner_username != user.username:
        logger.warning(f"\t The finished book #{book_id} NOT Found.")
        raise HTTPException(status_code=404, detail="Finished book not found")

    await book.delete()
    logger.info(f"\t Finished book #[{book_id}] is deleted.")
    return {"message": "Finished book deleted successfully."}

