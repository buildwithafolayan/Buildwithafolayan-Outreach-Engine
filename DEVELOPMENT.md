# Development and testing

## Development principles

Build vertical slices, not isolated screens. Each slice includes migration, domain rules, API, UI, tests, logs, and a safe failure path. No feature is considered done because it renders; it must have a tested state transition and observable result.

The first live Gmail test uses a controlled recipient and global sending remains disabled by default. No campaign can activate until its templates, steps, sender account, limits, and working-hours rules validate.

## Local setup target

The scaffold phase will provide Docker Compose for PostgreSQL, a FastAPI API process, a worker process, and the Next.js app. It will also provide format/lint/type/test commands and CI-friendly environment defaults. No local Gmail credential is needed until Phase 2.

Copy `.env.example` to `.env` locally and generate local-only secrets. Never commit `.env`.

## Test strategy

### Unit tests

- contact/enrollment/campaign state transitions and terminal-state guards
- sequence delay calculation, working-hours adjustment, and jitter bounds
- placeholder parsing, fallbacks, preview, and missing-value rejection
- CSV normalization, validation, duplicate handling, and error reporting
- rate-limit decisions and global/campaign/contact pause precedence
- job idempotency, lease recovery, retry classification, and ambiguous-send behavior
- deterministic reply rules and opt-out detection

### Integration tests

- Alembic migration upgrade against disposable PostgreSQL
- concurrent worker claims using real `FOR UPDATE SKIP LOCKED`
- campaign activation/enrollment and persisted job creation
- transaction that records a reply and cancels future jobs
- Gmail provider adapter against a fake HTTP transport/recorded fixtures
- OAuth callback state validation and encrypted refresh-token persistence
- Pub/Sub notification de-duplication and Gmail History cursor advancement

### End-to-end tests

At least one browser/API path exercises:

```text
Sign in -> connect fake Gmail -> import lead -> create campaign/step
-> enroll -> worker sends through fake provider -> simulated Gmail reply
-> enrollment pauses -> next send is cancelled -> timeline displays both messages
```

Failure paths include Gmail token revocation, 429 retry, a transient pre-send failure, an ambiguous submission routed to `NEEDS_REVIEW`, malformed CSV, duplicate Pub/Sub notification, history cursor reset, and attempted resume after unsubscribe.

## Quality gates

Every meaningful change runs formatter, linter, type checker, unit tests, and the relevant integration suite. Pull requests or commits will not hide failing tests. Database migrations must be applied in a clean database during CI. A change to a state transition requires a regression test and activity-event assertion.

## Delivery phases and acceptance criteria

### Phase 1 — foundation

Acceptance: web/API/worker start locally, PostgreSQL migrations run, authenticated health endpoint works, and test suite is wired.

### Phase 2 — Gmail connection

Acceptance: operator completes OAuth, Gmail profile persists, token is encrypted, connection state is visible, reconnect/disconnect work, and a watch can be registered in a test project.

### Phase 3 — contacts

Acceptance: a CSV reports every imported/skipped/invalid/duplicate row; contacts have tags/custom fields/notes and a timeline-ready detail endpoint.

### Phase 4 — campaign and sequence

Acceptance: campaign steps validate placeholders, a preview is safe, one eligible contact can enroll, and all state transitions are tested.

### Phase 5 — controlled send

Acceptance: with a test recipient allowlist enabled, one job is safely claimed, Gmail IDs are recorded, limits apply, and ambiguous submissions never auto-send twice.

### Phase 6 — reply stop

Acceptance: a Gmail history event for an enrolled thread records the inbound reply, pauses the enrollment, cancels the next send, and appears in the UI timeline.

### Phase 7 — operations

Acceptance: dashboard attention queue, activity filtering, basic campaign metrics, pause/resume, and global emergency stop work locally and in staging.

### Phase 8 — optional AI

Acceptance: AI suggestions are stored with model/time metadata, reviewed by a human, never auto-overwrite approved content, and do not authorize sends.

## Operational runbook outline

- Before live sending: verify OAuth connection, watch expiry, global pause status, per-account/campaign limits, sender signature, and controlled test result.
- On a failed send: inspect activity correlation ID, provider error category, retry count, and whether the message is `SUBMISSION_UNKNOWN`.
- On a missed-notification alert: run account sync recovery, confirm cursor advancement, and audit affected campaign threads.
- On suspected credential exposure: immediately globally pause, disconnect/revoke Gmail access, rotate application/encryption secrets, and review audit logs.
