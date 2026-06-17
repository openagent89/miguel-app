# Miguel Warenwirtschaftssystem

Vollständiges Warenwirtschafts- + Kundenportal-System.

## Tech Stack
- Frontend: Next.js 16 (Vercel)
- Backend: FastAPI + PostgreSQL (Render)
- Auth: JWT + Passwort-Hashing

## Struktur
```
miguel-system/
├── frontend/          → Next.js App
├── backend/           → FastAPI + Router + Datenbank
│   ├── routers/
│   ├── models.py
│   ├── database.py
│   └── render.yaml
```

## Deployment
Siehe `DEPLOY.md` für detaillierte Anleitung.