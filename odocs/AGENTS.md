# Agent Rules & Constraints - CloudGuard

## Core Constraints
- **Agentless architecture**: Must retrieve server stats purely using remote SSH commands (e.g., `docker ps`, `free`, `df`, `top`) and local network ICMP ping.
- **Unified stack**: Python (FastAPI) for API and execution engine, Next.js (TypeScript) for frontend, PostgreSQL for storage.
- **Production Safety**: Ensure SSH keys/credentials are stored securely (encrypted in database using cryptography library).
- **Communication Style**: Professional, direct, ASCII-only, no emojis, hyphens/colons instead of em-dashes.
- **SCM**: GitHub PR workflow enabled per explicit user request. Create modular pull requests for milestones and include GitHub Actions CI/CD workflows.
