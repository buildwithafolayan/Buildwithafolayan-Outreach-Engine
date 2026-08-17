# API contract

## General rules

- Base path: `/api/v1`.
- JSON uses snake_case; timestamps are ISO-8601 UTC strings; resource IDs are UUIDs.
- Authenticated browser endpoints require the single-operator session and CSRF protection for mutations.
- List endpoints use cursor pagination: `?limit=50&cursor=...`.
- Mutations return the changed resource and emit activity events.
- Errors use RFC 9457-style problem responses: `type`, `title`, `status`, `detail`, `code`, and optional field errors. Secrets and provider responses are never returned.

## Session and Gmail connection

| Method and path | Responsibility |
| --- | --- |
| `GET /auth/session` | Current operator/session and Gmail connection summary |
| `POST /auth/logout` | Destroy the application session |
| `GET /gmail/connect` | Begin signed Google OAuth redirect |
| `GET /gmail/callback` | Validate state, exchange code, persist account, establish watch |
| `GET /gmail/account` | Gmail connection status and safe account metadata |
| `POST /gmail/reconnect` | Begin consent again when reauthorization is needed |
| `DELETE /gmail/account` | Stop Gmail watch, revoke/discard local token, pause affected campaigns |

OAuth callback is a browser route rather than a JSON API. It exposes no OAuth tokens in URL, HTML, or client state.

## Contacts and imports

| Method and path | Responsibility |
| --- | --- |
| `GET /contacts` | Filter/search contacts by state, tag, campaign, and text |
| `POST /contacts` | Create one validated contact |
| `GET /contacts/{contact_id}` | Contact detail, enrollment summaries, and timeline |
| `PATCH /contacts/{contact_id}` | Update fields, notes, tags, or manual lifecycle state where allowed |
| `POST /contacts/{contact_id}/pause` | Pause active automation for the contact |
| `POST /contacts/{contact_id}/resume` | Explicitly resume a selected paused enrollment |
| `POST /contacts/{contact_id}/unsubscribe` | Apply terminal opt-out and cancel automated work |
| `POST /imports/contacts` | Upload CSV, validate/stage rows, return import batch |
| `GET /imports/{batch_id}` | Counts plus row-level errors/outcomes |
| `POST /imports/{batch_id}/commit` | Commit reviewed valid rows; idempotent |

`POST /imports/contacts` consumes `multipart/form-data`. The API stores no file in browser memory after the request; it returns imported, skipped, invalid, and duplicate counts.

## Campaigns and sequence steps

| Method and path | Responsibility |
| --- | --- |
| `GET /campaigns` | List campaign metrics and state |
| `POST /campaigns` | Create draft campaign |
| `GET /campaigns/{campaign_id}` | Detail, sequence, progress, upcoming activity, metrics |
| `PATCH /campaigns/{campaign_id}` | Update a draft/paused campaign safely |
| `POST /campaigns/{campaign_id}/duplicate` | Create a new draft with copied step templates only |
| `POST /campaigns/{campaign_id}/activate` | Validate and activate eligible campaign |
| `POST /campaigns/{campaign_id}/pause` | Pause and cancel claimable future sends |
| `POST /campaigns/{campaign_id}/resume` | Resume without overriding contact opt-outs/replies |
| `POST /campaigns/{campaign_id}/archive` | Terminal archival after pausing |
| `PUT /campaigns/{campaign_id}/steps` | Replace ordered draft/paused steps after template validation |
| `POST /campaigns/{campaign_id}/preview` | Render a selected step for a selected contact; never sends |
| `POST /campaigns/{campaign_id}/enrollments` | Enroll selected contacts; creates next-action jobs |
| `DELETE /campaigns/{campaign_id}/enrollments/{enrollment_id}` | Manually stop one enrollment |

Example enrollment request:

```json
{ "contact_ids": ["4e6f..."], "start_at": "2026-08-18T09:15:00Z" }
```

The response returns accepted, rejected, and already-enrolled contacts with machine-readable reasons. A reply, opt-out, or another active enrollment can never be overridden by a bulk request.

## Activity, analytics, and settings

| Method and path | Responsibility |
| --- | --- |
| `GET /activity` | Filterable, paginated event feed |
| `GET /analytics/overview` | Dashboard totals, attention counts, and recent performance |
| `GET /analytics/campaigns/{campaign_id}` | Campaign sends, replies, outcomes, and completion metrics |
| `GET /settings` | Safe limits, working hours, and global-send status |
| `PATCH /settings` | Update limits/working hours/signature |
| `POST /settings/global-pause` | Immediately disable all automated sends |
| `POST /settings/global-resume` | Re-enable sending after explicit confirmation |

Global resume does not resume individual campaigns or enrollments that were separately paused.

## Internal integration endpoint

| Method and path | Responsibility |
| --- | --- |
| `POST /internal/gmail/pubsub` | Verify authenticated Google Pub/Sub push, persist de-duplicated notification, enqueue processing, then acknowledge |

This endpoint has no browser session authentication. It accepts only the expected Pub/Sub subscription and verified push identity, has a small body limit, and contains no business logic beyond durable intake.

## Initial UI routes

`/`, `/contacts`, `/contacts/[id]`, `/campaigns`, `/campaigns/[id]`, `/activity`, `/analytics`, and `/settings` correspond to the API resources. The dashboard’s first priority is attention: new replies, failed/unknown sends, paused campaigns, and next scheduled action.
