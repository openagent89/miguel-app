from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import bookings, csv, audit, telegram, security, articles, auth, state

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Miguel Warenwirtschaft API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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