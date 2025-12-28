# Incident Bridge (FastAPI + PostgreSQL + React)

Real-time incident reporting and responder dashboard for hackathon delivery.

## Stack
- Backend: FastAPI, async SQLAlchemy (psycopg), WebSocket push, PostgreSQL
- Frontend: React + Vite + Tailwind, WebSocket live feed
- Deployment: Dockerfiles for backend/frontend, docker-compose for local stack

## Quick start (local docker-compose)
1. Copy env files: `cp backend/.env.example backend/.env` and adjust if needed.
2. Run: `docker compose up --build`
3. Open frontend: http://localhost:5173
4. API docs: http://localhost:8000/docs
5. Default credentials: admin/admin123 (role=admin), responder/responder123 (role=responder)

## API highlights
- `POST /incidents` create incident with dedupe check (same type within 200m in last 10 minutes → flagged as possible duplicate)
- `GET /incidents` filter by type, radius (origin_lat/origin_lng), since_minutes
- `PATCH /incidents/{id}` update status/severity/verification, add internal note (requires bearer token with role admin or responder)
- `POST /auth/login` form-data (username/password) returns JWT token with role claim
- `POST /media/upload` accept file, stores in uploads dir, returns URL served at `/media/<file>`
- `WS /ws/incidents` broadcasts `incident_created` and `incident_updated`

## Data model (PostgreSQL)
- incidents: id uuid pk, type, description, latitude, longitude, media_url, severity, status, is_verified, possible_duplicate_of, created_at, updated_at
- incident_notes: id uuid, incident_id fk, note, author, created_at
- incident_votes: id uuid, incident_id fk, user_id, created_at

## Frontend views
- Citizen form: type, description, GPS (auto), severity, optional media URL
- Live feed: sorted by severity/status/recency, shows verification and duplicate flag
- Admin panel: select incident, verify, change status/severity, add internal notes
- Map preview: lightweight pin scatter for visual awareness (no external map key required)

## Deployment notes
- Render/Railway: deploy backend with `backend/Dockerfile`, Postgres add-on, set `DATABASE_URL` (use psycopg async URL), `CORS_ORIGINS`, `JWT_SECRET`, credentials. Ensure persistent storage or S3 for media; for container FS use volume if supported.
- Vercel/Netlify: deploy `frontend`, set env `VITE_API_BASE` to backend URL.

## Tests
- Manual E2E via UI; add pytest + Playwright if time allows.
