from fastapi import APIRouter, UploadFile, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
import csv
from database import get_db
from models import Article

router = APIRouter(prefix="/csv", tags=["csv"])

@router.post("/import")
async def import_csv(file: UploadFile, db: Session = Depends(get_db)):
    content = await file.read()
    decoded = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))
    
    imported = 0
    for row in reader:
        existing = db.query(Article).filter(Article.sku == row.get("sku")).first()
        if existing:
            existing.stock = int(row.get("stock", existing.stock))
            existing.price = float(row.get("price", existing.price))
        else:
            article = Article(
                sku=row.get("sku"),
                name=row.get("name"),
                stock=int(row.get("stock", 0)),
                price=float(row.get("price", 0))
            )
            db.add(article)
        imported += 1
    
    db.commit()
    return {"status": "success", "imported": imported}

@router.get("/export")
def export_csv(db: Session = Depends(get_db)):
    articles = db.query(Article).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["sku", "name", "stock", "min_stock", "price"])
    for a in articles:
        writer.writerow([a.sku, a.name, a.stock, a.min_stock, a.price])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=artikel.csv"}
    )