# Mimora

Mimora is an action-first personal life memory assistant. It turns documents,
deadlines, people, and pending work into reviewable Memory Cards and reminders.

## What works in this first build

- Responsive dashboard with today, upcoming, pending, and done summaries
- Twelve life-document sections
- PDF/JPG/PNG upload and reviewed extraction preview
- Memory Card creation and status updates
- Manual memory capture
- Memory calendar and follow-up tracker
- FastAPI + SQLite persistence, with a frontend fallback for UI-only demos

## Run locally

Install frontend dependencies:

```powershell
npm install
```

Start the API:

```powershell
py -m pip install -r backend/requirements.txt
py -m uvicorn backend.main:app --reload
```

In another terminal, start the frontend:

```powershell
npm run dev
```

Open `http://localhost:5173`.

## Current extraction boundary

The upload pipeline, review contract, database, and UI are real. The extraction
adapter currently returns deterministic bill/insurance suggestions so the MVP
can be tested safely without an API key. OCR and an LLM can replace that adapter
without changing the review-first user flow.
