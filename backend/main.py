from __future__ import annotations

import json
import sqlite3
import uuid
from datetime import date, datetime
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "database"
UPLOAD_DIR = ROOT / "uploads"
DB_PATH = DATA_DIR / "mimora.db"
DATA_DIR.mkdir(exist_ok=True)
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI(title="Mimora API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECTIONS = [
    ("Results & Education", "education", "blue"),
    ("Government Docs", "government", "violet"),
    ("Health Docs", "health", "rose"),
    ("Insurance Docs", "insurance", "cyan"),
    ("Service Docs", "service", "orange"),
    ("Work Docs", "work", "indigo"),
    ("Resume", "resume", "pink"),
    ("Finance & Bills", "finance", "emerald"),
    ("Purchase & Warranty", "warranty", "amber"),
    ("Travel Docs", "travel", "sky"),
    ("Legal & Rental", "legal", "slate"),
    ("People & Events", "people", "fuchsia"),
]


class MemoryCardCreate(BaseModel):
    title: str
    section: str
    type: str = "Document"
    date: str | None = None
    action_needed: str = ""
    status: str = "pending"
    source: str = "Manual"
    amount: str | None = None
    reminder_suggestion: str | None = None
    confidence: str | None = None


class MemoryCardPatch(BaseModel):
    title: str | None = None
    section: str | None = None
    type: str | None = None
    date: str | None = None
    action_needed: str | None = None
    status: str | None = None


def connection() -> sqlite3.Connection:
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    return db


def init_db() -> None:
    with connection() as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS sections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                slug TEXT NOT NULL,
                color TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_name TEXT NOT NULL,
                file_type TEXT,
                file_path TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS memory_cards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                section TEXT NOT NULL,
                type TEXT NOT NULL,
                date TEXT,
                action_needed TEXT,
                status TEXT NOT NULL,
                source TEXT NOT NULL,
                amount TEXT,
                reminder_suggestion TEXT,
                confidence TEXT,
                created_at TEXT NOT NULL
            );
            """
        )
        db.executemany(
            "INSERT OR IGNORE INTO sections (name, slug, color) VALUES (?, ?, ?)",
            SECTIONS,
        )
        count = db.execute("SELECT COUNT(*) FROM memory_cards").fetchone()[0]
        if count == 0:
            rows = [
                ("Electricity Bill — July", "Finance & Bills", "Bill", "2026-07-31", "Pay ₹1,870 before the due date", "pending", "Uploaded PDF", "₹1,870"),
                ("Bike Insurance Renewal", "Insurance Docs", "Insurance", "2026-09-12", "Compare plans and renew the policy", "upcoming", "Uploaded PDF", None),
                ("Airtel Complaint", "Follow-ups", "Follow-up", "2026-07-29", "Follow up on complaint AT12345", "pending", "Manual", None),
                ("Kevin's Birthday", "People & Events", "Birthday", "2026-08-22", "Choose a gift and send wishes", "upcoming", "Manual", None),
            ]
            db.executemany(
                """
                INSERT INTO memory_cards
                (title, section, type, date, action_needed, status, source, amount, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                [(*row, datetime.now().isoformat()) for row in rows],
            )


init_db()


def rows_to_dicts(rows: list[sqlite3.Row]) -> list[dict[str, Any]]:
    return [dict(row) for row in rows]


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "mimora-api"}


@app.get("/api/sections")
def list_sections() -> list[dict[str, Any]]:
    with connection() as db:
        rows = db.execute(
            """
            SELECT s.id, s.name, s.slug, s.color, COUNT(m.id) AS count
            FROM sections s
            LEFT JOIN memory_cards m ON m.section = s.name
            GROUP BY s.id
            ORDER BY s.id
            """
        ).fetchall()
    return rows_to_dicts(rows)


@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...)) -> dict[str, Any]:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".pdf", ".jpg", ".jpeg", ".png"}:
        raise HTTPException(400, "Only PDF, JPG and PNG files are supported.")
    safe_name = f"{uuid.uuid4().hex}{suffix}"
    target = UPLOAD_DIR / safe_name
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(400, "The file is larger than 10 MB.")
    target.write_bytes(content)
    with connection() as db:
        cursor = db.execute(
            "INSERT INTO documents (file_name, file_type, file_path, created_at) VALUES (?, ?, ?, ?)",
            (file.filename, file.content_type, str(target), datetime.now().isoformat()),
        )
        document_id = cursor.lastrowid
    return {"id": document_id, "file_name": file.filename, "file_type": file.content_type}


@app.post("/api/documents/{document_id}/extract")
def extract_document(document_id: int) -> dict[str, Any]:
    with connection() as db:
        document = db.execute("SELECT * FROM documents WHERE id = ?", (document_id,)).fetchone()
    if document is None:
        raise HTTPException(404, "Document not found.")

    # MVP extraction contract. Replace this deterministic adapter with OCR + an LLM
    # while keeping the same reviewed suggestion response.
    name = document["file_name"].lower()
    if "insurance" in name or "policy" in name:
        return {
            "title": "Bike Insurance Renewal",
            "section": "Insurance Docs",
            "type": "Insurance",
            "date": "2026-09-12",
            "amount": "",
            "action_needed": "Review coverage and renew before expiry",
            "reminder_suggestion": "30 days before",
            "confidence": "Medium",
        }
    return {
        "title": "Electricity Bill — July 2026",
        "section": "Finance & Bills",
        "type": "Bill",
        "date": "2026-07-31",
        "amount": "₹1,870",
        "action_needed": "Pay the electricity bill before the due date",
        "reminder_suggestion": "2 days before due date",
        "confidence": "High",
    }


@app.get("/api/memory-cards")
def list_memory_cards(q: str | None = None, section: str | None = None) -> list[dict[str, Any]]:
    sql = "SELECT * FROM memory_cards WHERE 1 = 1"
    params: list[Any] = []
    if q:
        sql += " AND (title LIKE ? OR action_needed LIKE ? OR section LIKE ?)"
        term = f"%{q}%"
        params.extend([term, term, term])
    if section:
        sql += " AND section = ?"
        params.append(section)
    sql += " ORDER BY created_at DESC"
    with connection() as db:
        rows = db.execute(sql, params).fetchall()
    return rows_to_dicts(rows)


@app.post("/api/memory-cards")
def create_memory_card(card: MemoryCardCreate) -> dict[str, Any]:
    values = card.model_dump()
    with connection() as db:
        cursor = db.execute(
            """
            INSERT INTO memory_cards
            (title, section, type, date, action_needed, status, source, amount,
             reminder_suggestion, confidence, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                values["title"], values["section"], values["type"], values["date"],
                values["action_needed"], values["status"], values["source"], values["amount"],
                values["reminder_suggestion"], values["confidence"], datetime.now().isoformat(),
            ),
        )
        row = db.execute("SELECT * FROM memory_cards WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return dict(row)


@app.patch("/api/memory-cards/{card_id}")
def patch_memory_card(card_id: int, patch: MemoryCardPatch) -> dict[str, Any]:
    values = patch.model_dump(exclude_none=True)
    if not values:
        raise HTTPException(400, "No changes supplied.")
    assignments = ", ".join(f"{key} = ?" for key in values)
    with connection() as db:
        cursor = db.execute(
            f"UPDATE memory_cards SET {assignments} WHERE id = ?",
            [*values.values(), card_id],
        )
        if cursor.rowcount == 0:
            raise HTTPException(404, "Memory card not found.")
        row = db.execute("SELECT * FROM memory_cards WHERE id = ?", (card_id,)).fetchone()
    return dict(row)


@app.get("/api/dashboard/summary")
def dashboard_summary() -> dict[str, int]:
    today = date.today().isoformat()
    with connection() as db:
        total_today = db.execute("SELECT COUNT(*) FROM memory_cards WHERE date = ? AND status != 'done'", (today,)).fetchone()[0]
        upcoming = db.execute("SELECT COUNT(*) FROM memory_cards WHERE date > ? AND status != 'done'", (today,)).fetchone()[0]
        pending = db.execute("SELECT COUNT(*) FROM memory_cards WHERE status = 'pending'").fetchone()[0]
        done = db.execute("SELECT COUNT(*) FROM memory_cards WHERE status = 'done'").fetchone()[0]
    return {"today": total_today, "upcoming": upcoming, "pending": pending, "done": done}


@app.get("/api/calendar")
def calendar() -> dict[str, list[dict[str, Any]]]:
    with connection() as db:
        rows = db.execute("SELECT * FROM memory_cards WHERE date IS NOT NULL ORDER BY date").fetchall()
    grouped: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        grouped.setdefault(row["date"], []).append(dict(row))
    return grouped


# In production the React build is served by the same FastAPI process. Keeping
# the frontend and API on one origin makes the free deployment simple and avoids
# cross-origin configuration. API routes above take precedence over this SPA
# fallback.
DIST_DIR = ROOT / "dist"
if DIST_DIR.exists():
    app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")

    @app.get("/{path:path}", include_in_schema=False)
    def frontend(path: str) -> FileResponse:
        requested = DIST_DIR / path
        if path and requested.is_file():
            return FileResponse(requested)
        return FileResponse(DIST_DIR / "index.html")
