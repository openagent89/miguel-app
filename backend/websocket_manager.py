from fastapi import WebSocket
from typing import List
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Verwaltet alle aktiven WebSocket-Verbindungen."""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket verbunden. Aktive Verbindungen: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket getrennt. Aktive Verbindungen: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """Sendet eine Nachricht an ALLE verbundenen Clients.
        Entfernt tote Verbindungen automatisch."""
        dead = []
        for conn in self.active_connections:
            try:
                await conn.send_json(message)
            except Exception as e:
                logger.warning(f"WebSocket send fehlgeschlagen: {e}")
                dead.append(conn)
        for d in dead:
            self.active_connections.remove(d)

    async def broadcast_except(self, message: dict, exclude: WebSocket):
        """Sendet an alle Clients AUSSER dem angegebenen."""
        dead = []
        for conn in self.active_connections:
            if conn == exclude:
                continue
            try:
                await conn.send_json(message)
            except Exception as e:
                logger.warning(f"WebSocket send fehlgeschlagen: {e}")
                dead.append(conn)
        for d in dead:
            self.active_connections.remove(d)

    @property
    def count(self) -> int:
        return len(self.active_connections)


manager = ConnectionManager()
