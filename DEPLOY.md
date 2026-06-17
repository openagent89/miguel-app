# Miguel Deployment Guide

## Frontend (Vercel)
- Bereits deployed
- Repository: https://github.com/openagent89/miguel-app
- Ordner: `frontend`

## Backend + Datenbank (Render)

### Schritte:
1. Auf Render.com → New → Web Service
2. GitHub Repository verbinden: `openagent89/miguel-app`
3. Root Directory: `backend`
4. Render erkennt `render.yaml` automatisch
5. PostgreSQL Datenbank wird automatisch erstellt

### Environment Variables (nach Deployment setzen):
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

### Seed Daten:
Nach dem ersten Deploy einmal über die Render Shell ausführen:
```bash
python seed.py
```

## Wichtige URLs (nach Deployment)
- Backend: https://miguel-backend.onrender.com
- Frontend: https://frontend-xi-murex-74.vercel.app (aktuell)