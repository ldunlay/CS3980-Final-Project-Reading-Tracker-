# Book Nook Backend

This folder contains the FastAPI backend.

## Setup

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create or update `.env` in this folder with:

```env
MONGODB_URI=...
MONGODB_DB=...
SECRET_KEY=...
```

## Run

```powershell
python main.py
```

The backend runs at:

```text
http://127.0.0.1:8000
```

## Tests

```powershell
pytest
```
