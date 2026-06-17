from fastapi import APIRouter, UploadFile
from fastapi.responses import StreamingResponse
import io

router = APIRouter(prefix="/csv", tags=["csv"])

@router.post("/import")
async def import_csv(file: UploadFile):
    return {"status": "success", "message": f"Datei {file.filename} erfolgreich importiert"}

@router.get("/export")
def export_csv():
    output = io.StringIO()
    output.write("sku,name,stock,price\n")
    output.write("PB-001,Premium Box,124,29.90\n")
    output.write("SB-002,Standard Box,387,19.90\n")
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=artikel.csv"}
    )