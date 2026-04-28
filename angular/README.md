# Book Nook Angular Frontend

This folder contains the standalone Angular frontend.

## Run

```powershell
npm install
npm start
```

The dev server runs at:

```text
http://127.0.0.1:4200
```

Keep the FastAPI backend running at `http://localhost:8000`.

## Build For FastAPI

```powershell
npm run build
```

FastAPI serves the compiled app from `angular/dist/book-nook-angular/browser`.
