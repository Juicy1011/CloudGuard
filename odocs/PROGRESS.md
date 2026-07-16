# Progress Log - CloudGuard

## Project Overview
CloudGuard is a unified, SSH-based cloud monitoring and management system designed to provide agentless observability across diverse server environments.

- **Frontend**: Next.js (pnpm)
- **Backend & Worker**: FastAPI (Python)
- **Database**: PostgreSQL

---

## Status Checklists

### Phase 1: Scaffolding & Setup
- [x] Scaffold FastAPI backend (`backend/`)
- [x] Scaffold Next.js frontend (`frontend/`)
- [x] Set up local PostgreSQL via Docker Compose (mapped to port 5440)

### Phase 2: Core Engineering (Backend & Database)
- [x] Establish Database Models (Servers, Credentials, HealthLogs)
- [x] Implement secure credential encryption/decryption
- [x] Implement ICMP (Ping) probing module
- [x] Implement remote SSH executor (Docker status, CPU, memory, disk usage)
- [x] Expose FastAPI REST endpoints for server management, metrics retrieval, and logs

### Phase 3: Presentation Layer (Next.js Frontend)
- [x] Create basic routing, layout, and state management
- [x] Build "Single-Pane-of-Glass" dashboard displaying all monitored servers
- [x] Design interactive server detail views with charts and stats
- [x] Hide raw host IPs for security/presentation purposes
- [x] Build credential/server enrollment views

### Phase 4: Incident & Notification Module
- [x] Implement automatic service disruption checks (worker cron-like loop)
- [x] Set up transactional email client (SMTP / Resend / Mailgun)
- [x] Implement email generation & delivery for active incidents

### Phase 5: Verification & Production Ready
- [x] Conduct end-to-end local integration testing
- [x] Run linting, formating, and type checking across frontend and backend
- [x] Implement configurable \"Demo Mode\" for reliable school/presentation staging
- [x] Add externalized mock data for custom microservices visualization
- [x] Improve microservices health visualization with status-aware styling and icons

