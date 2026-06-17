# Render Deployment Vorbereitung (Miguel Backend)

## Voraussetzungen
- GitHub Repository: https://github.com/openagent89/miguel-app.git
- Code ist gepusht

## Schritte auf Render

### 1. Neues Web Service erstellen
1. Gehe zu [Render Dashboard](https://dashboard.render.com)
2. Klicke **New +** → **Web Service**
3. Wähle **Connect a repository**
4. Wähle `openagent89/miguel-app`
5. Root Directory: `backend`
6. Render erkennt automatisch die `render.yaml`

### 2. Automatisch erstellte Ressourcen
Render erstellt automatisch:
- Web Service: `miguel-backend`
- PostgreSQL Datenbank: `miguel-db`

### 3. Environment Variables ergänzen
Nach dem ersten Deploy unter dem Web Service folgende Variablen hinzufügen:

| Variable              | Wert                          | Quelle          |
|-----------------------|-------------------------------|-----------------|
| TELEGRAM_BOT_TOKEN    | dein_bot_token                | Manuell         |
| TELEGRAM_CHAT_ID      | deine_chat_id                 | Manuell         |

### 4. Seed Daten ausführen
Nach erfolgreichem Deploy einmalig über die Render Shell ausführen:

```bash
cd backend
python seed.py
```

### 5. Frontend anpassen (Vercel)
Auf Vercel unter dem Frontend-Projekt folgende Environment Variable setzen:

```
NEXT_PUBLIC_API_URL = https://miguel-backend.onrender.com
```

Danach einmal redeployen.

## Fertig
Danach ist das System produktiv nutzbar.