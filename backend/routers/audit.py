from fastapi import APIRouter

router = APIRouter(prefix="/audit", tags=["audit"])

@router.get("/")
def get_audit_log():
    return [
        {"id": 1, "action": "Einbuchung", "article": "PB-001", "quantity": 50, "user": "Miguel", "time": "2026-06-17 09:14"},
        {"id": 2, "action": "Ausbuchung", "article": "SB-002", "quantity": 12, "user": "Ingo", "time": "2026-06-17 08:55"},
        {"id": 3, "action": "Neue Bestellung", "article": "Kunde #47", "quantity": 3, "user": "System", "time": "2026-06-17 08:12"},
    ]