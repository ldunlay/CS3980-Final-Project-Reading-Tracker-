from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from typing import Annotated
import shutil, uuid, os

from auth.authenticate import authenticate, get_admin_user
from auth.jwt_handler import TokenData
from models.models import UpNext, UpNextRequest

import logging

logger = logging.getLogger(__name__)


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

# Admin-only routes
@upnext_router.get("/admin/all", dependencies=[Depends(get_admin_user)])
async def admin_get_all_upnext_books():
    all_books = await UpNext.find_all().to_list()
    logger.info(f"Admin viewed all {len(all_books)} up next books.")
    return all_books


@upnext_router.delete("/admin/{book_id}", dependencies=[Depends(get_admin_user)])
async def admin_delete_upnext_book(book_id: PydanticObjectId):
    book = await UpNext.get(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    await book.delete()
    logger.info(f"Admin deleted up next book [{book_id}].")
    return {"message": "Book deleted successfully."}

@upnext_router.post("/{book_id}/cover", status_code=200)
async def upload_upnext_cover(
    book_id: PydanticObjectId,
    file: Annotated[UploadFile, File()],
    user: TokenData = Depends(authenticate),
) -> UpNext:
    book = await UpNext.get(book_id)
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
    logger.info(f"{user.username} uploaded cover for upnext book [{book_id}].")
    return book



@upnext_router.put("/{book_id}", status_code=200)
async def edit_upnext_book(
    book_id: PydanticObjectId,
    upnext_book: UpNextRequest,
    user: TokenData = Depends(authenticate),
) -> UpNext:
    book = await UpNext.get(book_id)

    if not book or book.owner_username != user.username:
        raise HTTPException(status_code=404, detail="Book not found")

    book.title = upnext_book.title
    book.author = upnext_book.author
    book.genre = upnext_book.genre
    book.num_pages = upnext_book.num_pages
    book.isbn = upnext_book.isbn
    book.publish_date = upnext_book.publish_date
    book.added_date = upnext_book.added_date
    logger.info(f"{user.username} is updating upnext book [{book_id}].")
    return await book.save()


@upnext_router.delete("/{book_id}", status_code=200)
async def delete_upnext_book(
    book_id: PydanticObjectId, user: TokenData = Depends(authenticate)
):
    book = await UpNext.get(book_id)

    if not book or book.owner_username != user.username:
        raise HTTPException(status_code=404, detail="Book not found")

    await book.delete()
    return {"message": "Book deleted successfully."}

