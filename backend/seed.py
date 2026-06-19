from database import engine, SessionLocal, Base
from models import Article, User
from auth import get_password_hash

# Tabellen zuerst erstellen
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Seed Articles
articles = [
    Article(name="Premium Box", sku="PB-001", stock=124, min_stock=20, price=29.90),
    Article(name="Standard Box", sku="SB-002", stock=387, min_stock=50, price=19.90),
    Article(name="Mini Box", sku="MB-003", stock=215, min_stock=30, price=12.90),
]

for article in articles:
    existing = db.query(Article).filter(Article.sku == article.sku).first()
    if not existing:
        db.add(article)

# Seed Admin User
admin = db.query(User).filter(User.email == "admin@miguel.de").first()
if not admin:
    db.add(User(
        email="admin@miguel.de",
        password=get_password_hash("admin123"),
        role="admin"
    ))

db.commit()
print("Seed data created successfully")
db.close()