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
- [x] Build \"Single-Pane-of-Glass\" dashboard displaying all monitored servers
- [x] Design interactive server detail views with charts and stats
- [x] Hide raw host IPs for security/presentation purposes
- [x] Build credential/server enrollment views (Infrastructure page)
- [x] Build multi-tab routing wrapper supporting Incidents, Access Control, and Settings
- [x] Build collapsible navigation sidebar with smooth width transitions


### Phase 4: Incident & Notification Module
- [x] Implement automatic service disruption checks (worker cron-like loop)
- [x] Set up transactional email client (SMTP / Resend / Mailgun)
- [x] Implement email generation & delivery for active incidents

### Phase 6: Multi-Tenant & Authentication Scoping
- [x] Implement `owner_id` foreign key isolation on `Server` model
- [x] Pass and parse `X-User-Id` header across backend API endpoints and frontend API client
- [x] Support clean, user-scoped server workspace for newly registered email users while retaining global seeded default servers


