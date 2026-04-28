# Book Nook Reading Tracker

Book Nook is a FastAPI + Angular reading tracker for organizing current books, up-next books, account sign in, and placeholder shelves for finished and favorite books.

## Project Layout

```text
project-root/
  angular/      Angular frontend
  book_nook/    FastAPI backend
```

## Run The App

Build the Angular frontend:

```powershell
cd angular
npm install
npm run build
```

Run the FastAPI backend:

```powershell
cd ..\book_nook
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py
```

Open:

```text
http://127.0.0.1:8000
```

For Angular-only development, run this from `angular/`:

```powershell
npm start
```

Then keep the backend running at `http://localhost:8000`.

## MongoDB

The backend reads environment variables from `book_nook/.env`.

Required values:

```env
MONGODB_URI=...
MONGODB_DB=...
SECRET_KEY=...
```

## Sources

Dashboard styling source: https://www.youtube.com/watch?v=NnniXasJIpY and ClaudeAI

Photo on main page: Photo by <a href="https://unsplash.com/@borodinanadi?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">nadi borodina</a> on <a href="https://unsplash.com/photos/white-and-pink-flowers-on-white-printer-paper-xkx93Q2Pe8E?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
