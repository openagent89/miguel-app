from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    password = Column(String)
    role = Column(String)  # admin, mitarbeiter, kunde
    created_at = Column(DateTime, default=datetime.utcnow)

class Article(Base):
    __tablename__ = "articles"
    id = Column(Integer, primary_key=True)
    sku = Column(String, unique=True)
    name = Column(String)
    stock = Column(Integer, default=0)
    price = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True)
    article_id = Column(Integer, ForeignKey("articles.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    quantity = Column(Integer)
    type = Column(String)  # in, out
    created_at = Column(DateTime, default=datetime.utcnow)