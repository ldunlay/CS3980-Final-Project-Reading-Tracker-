from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database.connection import initialize_database
from logging_setup import setup_logging
from routes.current_books_routes import current_books_router
from routes.upnext_routes import upnext_router
from routes.finished_books_routes import finished_books_router
from routes.users import router as users_router
import os



# for logging
setup_logging()
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application starts up...")
    await initialize_database()
    yield
    ...


app = FastAPI(title="Book Nook", version="1.0.0", lifespan=lifespan)

# register CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# register routes

app.include_router(current_books_router, prefix="/api/current-books", tags=["Current Books"])  # routing for current books api
app.include_router(upnext_router, prefix="/api/up-next", tags=["Up Next"],)  # routing for up next api
app.include_router(finished_books_router, prefix="/api/finished-books", tags=["Finished Books"])  # routing for finished books api
app.include_router(users_router, prefix="/api/users", tags=["Users"])  # routing for users api

@app.get("/")
async def root():
    return FileResponse("./Frontend/signin.html")

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

app.mount("/", StaticFiles(directory="Frontend", html=True), name="frontend")






