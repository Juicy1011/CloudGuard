# CloudGuard

CloudGuard is a unified, SSH-based cloud monitoring and management system.

## Project Structure
- `backend/`: FastAPI application handling API requests, SSH execution, and database interactions.
- `frontend/`: Next.js dashboard for visualization and management.
- `odocs/`: Project documentation and progress tracking.

## Getting Started

### Quick Start (Recommended)
You can start the entire stack (PostgreSQL DB, FastAPI Backend, Polling Worker, and Next.js Frontend) using a single command:
```bash
docker compose up --build
```
Once built and started:
- **Frontend Dashboard**: `http://localhost:3000`
- **Backend API**: `http://localhost:8080`
- **PostgreSQL Database**: `localhost:5440`

### Manual Development Setup
1. **Database**: `docker compose up -d db`
2. **Backend**:
   - `cd backend`
   - Create `.env` and set variables
   - Run seed script: `PYTHONPATH=. uv run python seed_db.py`
   - Run API: `PYTHONPATH=. uv run uvicorn app.main:app --host 127.0.0.1 --port 8080 --reload`
   - Run Worker: `PYTHONPATH=. uv run python app/worker.py`
3. **Frontend**:
   - `cd frontend`
   - `pnpm dev` (Runs on `http://localhost:3000`)

