# Security model

## Assets to protect

The highest-risk assets are Gmail refresh tokens, Google OAuth client credentials, the application session secret, encryption keys, contact PII, outbound/inbound message content, and administrator access. The system must never expose these through the frontend, logs, error pages, analytics, source control, or support exports.

## Authentication and authorization

V1 uses a single-operator application session. The operator authenticates with a verified Google identity restricted to the configured `APP_ADMIN_EMAIL`; the server creates an HttpOnly, Secure, SameSite cookie-backed session. Gmail authorization is a separate permission grant even when it occurs in the same Google browser session.

All browser mutations require CSRF protection and the authenticated session. The server performs authorization centrally before invoking application services. The future `user_id` boundary remains in every query rather than being inferred from client input.

## OAuth safeguards

- Use Google’s confidential web-server authorization-code flow with PKCE.
- Generate a cryptographically random, single-use OAuth `state`; bind it to the browser session, provider, requested scopes, and expiry.
- Use exact, pre-registered HTTPS redirect URIs in production; reject callback errors, mismatched state, and unexpected issuers.
- Request the smallest scope set necessary and record granted scopes.
- Exchange authorization codes and refresh tokens only on the backend.
- Handle revoked/invalid refresh tokens by marking the Gmail account `REAUTH_REQUIRED`, pausing affected campaigns, and informing the operator without exposing provider detail.
- Disconnect stops the Gmail watch, requests OAuth revocation when appropriate, securely deletes locally stored token ciphertext, and pauses campaigns.

## Token and secret protection

Refresh tokens are AES-256-GCM encrypted before database persistence. Each ciphertext has a nonce, authenticated data binding it to account/user ID, and a `token_key_version`. `ENCRYPTION_KEY` is supplied only from the runtime secret store; rotation is a controlled maintenance operation. Access tokens are transient and never returned to the browser.

Secrets are configured through environment variables, never hardcoded. `.env` files, credential downloads, runtime logs, database dumps, and test fixtures are excluded from Git. Production should use the host’s secret manager and encrypted backups.

## Gmail and Pub/Sub intake

The Gmail API is called over TLS with least-privilege OAuth credentials. Gmail message data is treated as untrusted external input. The Pub/Sub endpoint validates its expected subscription and authenticated push identity/audience before it decodes the base64url body. It has a strict body-size limit and persists each Pub/Sub message ID once, making retries safe.

The endpoint returns success only after its notification record and queued work are durable. Workers treat the History API response—not the notification—as the source for any state transition.

## Application attack surfaces

| Surface | Controls |
| --- | --- |
| Browser/API | HTTPS, secure session cookies, CSRF protection, input schemas, authorization, rate limiting, CSP, safe CORS policy |
| CSV import | File-size/row limits, UTF-8 handling, streaming parse, formula-injection-safe exports, email validation, raw row audit, no execution of cell values |
| Email templates | Plain text only, strict placeholder parser, missing-value preflight, output length limits, no raw HTML rendering |
| Stored content | Escape all email/contact content in UI; never render inbound HTML directly |
| Future website research | Disabled in V1; when introduced use outbound allowlists, DNS/IP checks, redirects limits, timeouts, and private-network/metadata blocking to prevent SSRF |
| Database | Parameterized queries/ORM, least-privilege application role, migrations, encrypted backups |
| Logging | Structured, redacted logs; no authorization headers, tokens, raw provider payloads, or full message content by default |
| Worker | Idempotency keys, locked jobs, bounded retries, dead-letter/needs-review states, heartbeat alert |

## Operational controls

`global_sending_enabled` defaults to false. Global pause, campaign pause, contact pause, reply pause, unsubscribe, and account-disconnected states are all checked immediately before submission. An operator may resume only explicitly; resume never overrides an opt-out.

Production requires TLS, routine dependency updates, backup restoration testing, retained audit events, and alerting for connection failures, stopped watches, worker heartbeat loss, and a rising send-failure rate.

## Privacy and compliance boundary

The product stores business contact information and correspondence. The operator remains responsible for lawful collection, retention, opt-out handling, and outreach compliance in target jurisdictions. The system will provide deletion/export workflows later; V1 must at minimum honor an explicit opt-out immediately and retain the minimal suppression record needed to prevent future automated outreach.
