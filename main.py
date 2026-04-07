from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.mount("/", StaticFiles(directory="Frontend", html=True), name="frontend")


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
