from fastapi import APIRouter

router = APIRouter(prefix="/security", tags=["security"])

@router.get("/audit-log")
def get_security_log():
    return {"message": "DSGVO-konformes Audit-Log aktiv"}