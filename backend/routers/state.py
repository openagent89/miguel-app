from fastapi import APIRouter, Request
from database import engine
from sqlalchemy import text
import json

router = APIRouter(prefix="/api", tags=["state"])

def ensure_table():
    """Erstellt die app_state Tabelle falls nicht vorhanden."""
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS app_state (
                id INTEGER PRIMARY KEY DEFAULT 1,
                data JSON NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.commit()

@router.get("/state")
def get_state(request: Request):
    """Gibt den gespeicherten App-State zurück."""
    password = request.headers.get("x-mi-deals-password", "")
    if password != "MI-Deals-2026!":
        return {"success": False, "error": "Unauthorized"}

    ensure_table()
    with engine.connect() as conn:
        row = conn.execute(
            text("SELECT data FROM app_state WHERE id = 1")
        ).fetchone()

        if row is None:
            return {"success": True, "state": None, "storage": "empty"}

        return {
            "success": True,
            "state": json.loads(row[0]),
            "storage": "postgresql"
        }

@router.post("/state")
async def set_state(request: Request):
    """Speichert den App-State."""
    password = request.headers.get("x-mi-deals-password", "")
    if password != "MI-Deals-2026!":
        return {"success": False, "error": "Unauthorized"}

    body = await request.json()
    state_data = body.get("state") or body.get("data") or body
    state_json = json.dumps(state_data, default=str)

    ensure_table()
    with engine.connect() as conn:
        conn.execute(
            text("""
                INSERT INTO app_state (id, data, updated_at)
                VALUES (1, :data, CURRENT_TIMESTAMP)
                ON CONFLICT (id) DO UPDATE SET
                    data = :data,
                    updated_at = CURRENT_TIMESTAMP
            """),
            {"data": state_json}
        )
        conn.commit()

    return {"success": True, "storage": "postgresql"}
