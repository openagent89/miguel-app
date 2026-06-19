from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Booking, Article

router = APIRouter(prefix="/bookings", tags=["bookings"])

class BookingRequest(BaseModel):
    article_id: int
    quantity: int
    type: str
    user_id: int | None = None

@router.post("/")
def create_booking(booking: BookingRequest, db: Session = Depends(get_db)):
    new_booking = Booking(
        article_id=booking.article_id,
        user_id=booking.user_id,
        quantity=booking.quantity,
        type=booking.type
    )
    db.add(new_booking)

    article = db.query(Article).filter(Article.id == booking.article_id).first()
    if article:
        if booking.type == "in":
            article.stock += booking.quantity
        else:
            article.stock -= booking.quantity

    db.commit()
    return {"status": "success", "message": "Buchung gespeichert"}