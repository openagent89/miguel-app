from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Article

router = APIRouter(prefix="/articles", tags=["articles"])

@router.get("/")
def get_articles(db: Session = Depends(get_db)):
    return db.query(Article).all()

@router.post("/")
def create_article(name: str, sku: str, stock: int = 0, price: float = 0, db: Session = Depends(get_db)):
    article = Article(name=name, sku=sku, stock=stock, price=price)
    db.add(article)
    db.commit()
    return {"status": "success"}