from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException

from auth.authenticate import authenticate
from auth.jwt_handler import TokenData
from models.models import UpNext, UpNextRequest


upnext_router = APIRouter()


@upnext_router.get("")
async def get_upnext_books(user: TokenData = Depends(authenticate)):
    upnext_books_list = await UpNext.find(
        UpNext.owner_username == user.username
    ).to_list()
    return upnext_books_list


@upnext_router.post("", status_code=201)
async def create_new_upnext_book(
    upnext_book: UpNextRequest, user: TokenData = Depends(authenticate)
) -> UpNext:
    new_upnext_book = UpNext(
        owner_username=user.username,
        title=upnext_book.title,
        author=upnext_book.author,
        num_pages=upnext_book.num_pages,
        genre=upnext_book.genre,
        isbn=upnext_book.isbn,
        publish_date=upnext_book.publish_date,
        added_date=upnext_book.added_date,
    )

    return await new_upnext_book.insert()


@upnext_router.delete("/{book_id}", status_code=200)
async def delete_upnext_book(
    book_id: PydanticObjectId, user: TokenData = Depends(authenticate)
):
    book = await UpNext.get(book_id)

    if not book or book.owner_username != user.username:
        raise HTTPException(status_code=404, detail="Book not found")

    await book.delete()
    return {"message": "Book deleted successfully."}
