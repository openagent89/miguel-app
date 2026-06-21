from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import bookings, csv, audit, telegram, security, articles, auth, state
from websocket_manager import manager
from sqlalchemy import text
from database import engine as db_engine
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Miguel Warenwirtschaft API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
        "https://mi-deals.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
        "https://miguel-backend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router
app.include_router(auth.router)
app.include_router(articles.router)
app.include_router(bookings.router)
app.include_router(csv.router)
app.include_router(audit.router)
app.include_router(telegram.router)
app.include_router(security.router)
app.include_router(state.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "Miguel Warenwirtschaft API"}


@app.get("/health")
def health():
    return {"status": "healthy"}


# ─── WebSocket-Endpunkt für Echtzeit-Synchronisation ───

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket für Echtzeit-Sync zwischen allen Clients.
    Query-Parameter: password=MI-Deals-2026!
    """
    # Auth via Query-Parameter
    password = websocket.query_params.get("password", "")
    if password != "MI-Deals-2026!":
        await websocket.close(code=4001, reason="Unauthorized")
        return

    await manager.connect(websocket)
    logger.info(f"✅ WebSocket verbunden. Aktive: {manager.count}")

    try:
        while True:
            data = await websocket.receive_json()

            msg_type = data.get("type", "")

            if msg_type == "ping":
                # Heartbeat-Antwort
                await websocket.send_json({"type": "pong"})

            elif msg_type == "state_update":
                # State von einem Client → an ALLE anderen broadcasten
                state_data = data.get("state")
                timestamp = data.get("timestamp")

                # Immer auch in der Datenbank persistieren
                if state_data:
                    state_json = json.dumps(state_data, default=str)
                    try:
                        with db_engine.connect() as conn:
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
                    except Exception as e:
                        logger.warning(f"State persist fehlgeschlagen: {e}")

                # An alle anderen Clients broadcasten
                await manager.broadcast_except(
                    {
                        "type": "state_update",
                        "state": state_data,
                        "timestamp": timestamp or "",
                    },
                    exclude=websocket,
                )

            elif msg_type == "stock_change":
                # Einzelne Bestandsänderung (leichter als full state)
                article = data.get("article", {})
                change = data.get("change", 0)
                reason = data.get("reason", "")

                await manager.broadcast_except(
                    {
                        "type": "stock_change",
                        "article": article,
                        "change": change,
                        "reason": reason,
                        "timestamp": data.get("timestamp", ""),
                    },
                    exclude=websocket,
                )

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info(f"❌ WebSocket getrennt. Aktive: {manager.count}")
        # Tritt ein Client aus, benachrichtigen wir die anderen
        await manager.broadcast({
            "type": "client_left",
            "active_clients": manager.count,
        })
    except Exception as e:
        logger.error(f"WebSocket Fehler: {e}")
        manager.disconnect(websocket)


# ─── REST-Endpunkte für Stock-State ───

def ensure_state_table():
    """Erstellt die app_state Tabelle falls nicht vorhanden."""
    with db_engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS app_state (
                id INTEGER PRIMARY KEY DEFAULT 1,
                data JSON NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.commit()


@app.get("/api/stock/state")
async def get_stock_state(request: Request):
    """Gibt den aktuellen vollständigen App-State zurück."""
    password = request.headers.get("x-mi-deals-password", "")
    if password != "MI-Deals-2026!":
        return {"success": False, "error": "Unauthorized"}

    ensure_state_table()
    try:
        with db_engine.connect() as conn:
            row = conn.execute(
                text("SELECT data, updated_at FROM app_state WHERE id = 1")
            ).fetchone()

            if row is None:
                return {
                    "success": True,
                    "state": None,
                    "active_clients": manager.count,
                    "storage": "empty"
                }

            raw = row[0]
            state_data = raw if isinstance(raw, dict) else json.loads(raw)
            return {
                "success": True,
                "state": state_data,
                "updated_at": str(row[1]) if row[1] else None,
                "active_clients": manager.count,
                "storage": "postgresql"
            }
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/api/stock/update")
async def update_stock_state(request: Request):
    """Aktualisiert den State und broadcastet an alle WebSocket-Clients."""
    password = request.headers.get("x-mi-deals-password", "")
    if password != "MI-Deals-2026!":
        return {"success": False, "error": "Unauthorized"}

    body = await request.json()
    state_data = body.get("state") or body.get("data") or body
    state_json = json.dumps(state_data, default=str)

    ensure_state_table()
    try:
        with db_engine.connect() as conn:
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

        # An ALLE WebSocket-Clients broadcasten
        await manager.broadcast({
            "type": "state_update",
            "state": state_data,
            "timestamp": body.get("timestamp", ""),
        })

        return {
            "success": True,
            "storage": "postgresql",
            "broadcast_to": manager.count,
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
