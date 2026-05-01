from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException

from auth.authenticate import authenticate
from auth.jwt_handler import TokenData
from models.models import FinishedBook, FinishedBookRequest

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
