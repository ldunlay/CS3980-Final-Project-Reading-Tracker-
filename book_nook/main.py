import logging
from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from database.connection import close_database, init_database
from logging_setup import setup_logging
from routes.auth_routes import auth_router
from routes.current_books_routes import current_books_router
from routes.upnext_routes import upnext_router

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
ANGULAR_DIST_DIR = PROJECT_ROOT / "angular" / "dist" / "book-nook-angular" / "browser"


class AngularStaticFiles(StaticFiles):
    async def get_response(self, path, scope):
        try:
            return await super().get_response(path, scope)
        except StarletteHTTPException as exc:
            if exc.status_code == 404:
                return await super().get_response("index.html", scope)
            raise


setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.on_event("startup")
async def startup():
    logger.info("Application starts up...")
    await init_database()


@app.on_event("shutdown")
def shutdown_event():
    logger.info("Application shutting down...")
    close_database()


app.include_router(auth_router, tags=["Auth"], prefix="/api")
app.include_router(
    current_books_router, tags=["Current Books"], prefix="/api/current-books"
)
app.include_router(upnext_router, tags=["Up Next"], prefix="/api/up-next")

app.mount(
    "/",
    AngularStaticFiles(directory=ANGULAR_DIST_DIR, html=True, check_dir=False),
    name="angular-frontend",
)


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
