# Private Gmail Outreach Engine

A private, single-operator outbound sales system for targeted B2B outreach through one connected Gmail account.

It supports deliberate, permission-conscious outreach workflows: contacts, campaigns, sequenced plain-text email, scheduled sends, Gmail reply detection, automatic sequence pausing, and operational visibility. It is not a bulk-email platform, lead database, CRM replacement, or multi-tenant SaaS.

## Project status

The repository was empty when the project began. The architecture package and foundation scaffold are now in place. Gmail sending is deliberately disabled and no Gmail integration or send handler has been implemented yet.

The first usable milestone remains intentionally narrow:

```text
Connect Gmail -> import one contact -> create one campaign and step
-> send to a controlled test address -> receive/simulate reply
-> pause all future sends -> show the timeline
```

## Architecture package

- [Architecture and roadmap](ARCHITECTURE.md)
- [Database design](DATABASE.md)
- [HTTP API contract](API.md)
- [Security model](SECURITY.md)
- [Development and test plan](DEVELOPMENT.md)
- [.env.example](.env.example)

## Chosen baseline

| Concern | Decision |
| --- | --- |
| UI | Next.js and TypeScript |
| API and worker | Python and FastAPI, deployed as separate processes |
| Persistence and job queue | PostgreSQL with Alembic migrations |
| Email provider | Gmail API, behind a small `EmailProvider` interface |
| Reply notification | Gmail `watch` -> Google Cloud Pub/Sub -> FastAPI endpoint -> Gmail History API |
| AI | Deferred until deterministic sending and reply handling work |
| Deployment | Docker Compose locally; one low-cost managed project with web, API, worker, and PostgreSQL in production |

## Safety posture

This software is designed for controlled, legitimate B2B outreach. It has global, campaign, and contact pauses; rate limits; working-hour controls; explicit opt-out handling; and no features for high-volume blasting, credential sharing, rotating identities, or scraping.

## Local development

Prerequisites are Python 3.13+ with [uv](https://docs.astral.sh/uv/) and Node.js 22+ for the frontend. Docker Desktop is optional, but required for the full Compose stack.

```powershell
Copy-Item .env.example .env
cd apps/api
uv sync --all-groups
uv run pytest
uv run ruff check .
uv run uvicorn app.main:app --reload
```

In another terminal, run the worker with `uv run python -m app.worker`. It has no send handlers in this foundation slice and cannot send email.

```powershell
cd apps/web
npm install
npm run typecheck
npm run dev
```

For the containerized development stack, run `docker compose up --build` from the repository root after Docker Desktop is running.
