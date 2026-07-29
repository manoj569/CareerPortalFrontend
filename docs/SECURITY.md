# Security review and operational boundary

## Client guarantees

- Access tokens are held in memory and are attached only by the centralized API client.
- Authentication redirects accept only safe same-origin application paths.
- Private RTK Query caches are cleared on logout, session expiry, account changes, and role loss.
- Employer application and company website links are restricted to HTTP(S) and open with
  `noopener noreferrer`.
- React renders backend text as text; the application does not use `dangerouslySetInnerHTML`.
- Razorpay pricing, order creation, signature verification, and membership activation remain on
  the backend. The checkout SDK is loaded only when a payment begins.
- Production route errors do not expose exception messages.
- The monitoring adapter accepts an error plus fixed boundary/status context. Do not attach form
  values, tokens, request bodies, URLs containing user identifiers, or backend response payloads.

## Known authentication blocker

The current API returns the refresh token in `AuthenticationResponse` and requires it in refresh and
logout request bodies. This prevents the frontend from using the preferred `HttpOnly`, `Secure`,
`SameSite` cookie design. The frontend currently stores that token in `sessionStorage` to support a
same-tab refresh. This limits persistence compared with local storage but remains readable by any
script executing in the origin and therefore is not an acceptable final production token boundary.

Required backend migration:

1. Set a rotated refresh token in an `HttpOnly; Secure; SameSite=Lax` cookie on login/register.
2. Rotate the cookie on refresh and revoke it on logout without returning the raw token to
   JavaScript.
3. Add CSRF protection appropriate to the cookie and permitted cross-site flows.
4. Allow credentials only for the exact frontend origin.
5. Change the frontend client to `withCredentials` and remove refresh-token web storage.

Do not encrypt a browser-stored refresh token as a substitute; an XSS payload can use the same
decryption path.

## Backend production boundary

The inspected tracked API `appsettings.json` uses placeholders for Razorpay credentials, a default
development JWT signing key, and a local database connection. Production must inject fresh values
from a secret manager. Do not copy backend configuration into frontend files, and scan repository
history independently before release in case older revisions contained credentials.

The API implements exact-origin CORS, JWT lifetime/signature validation, rate limiting, HTTPS
redirection, response compression, output caching, health endpoints, security headers,
signature-verified Razorpay webhooks, and pending-payment reconciliation. Production still
requires a configured trusted proxy, a non-default JWT key, a reachable migrated database, the
exact production frontend CORS origin, SMTP credentials, protected resume storage, and reviewed
Razorpay settings.

## Reporting integration

Initialize `configureFrontendErrorReporter` once when a monitoring provider is selected. Configure
the provider to:

- scrub authorization headers, cookies, tokens, query strings, form values, and request/response
  bodies;
- disable session replay on authentication, profile, settings, and payment pages unless a separate
  privacy review approves masked replay;
- sample high-volume network errors;
- retain only the minimum operational period;
- alert on new release regressions without sending user-entered content.

No monitoring vendor or external transmission is enabled by this repository.

## Dependency and secret operations

- Run `npm audit --omit=dev` and the full `npm audit` in CI with a trusted npm registry certificate.
- Review and remediate high/critical runtime findings before release; do not use `npm audit fix
--force` without testing the dependency changes.
- Run secret scanning over the complete repository history before publication.
- Keep `.env`, `.env.*`, logs, build output, and local caches out of source control. Only
  `.env.example` is intentionally tracked.

## CSP and third parties

The deployment guide contains a starting CSP. Enforce it only after report-only verification with
the final API and Razorpay domains. The Razorpay script has no client-side secret, is action-loaded,
and uses a strict referrer policy. Subresource Integrity is not pinned because the provider URL is
vendor-managed; the CSP host allowlist is the primary client control.

## Payment go-live blockers

The current backend correctly owns order amounts, signature verification, idempotent confirmation
of an already-paid payment, and membership activation. The frontend treats checkout success as
provisional until backend confirmation.

The inspected backend enforces the configured ₹99 INR, 30-day plan, verifies checkout signatures,
confirms provider capture, handles signed webhooks, and supports Candidate-triggered
reconciliation. Test and live keys must remain separate, and only the backend may hold a secret or
switch environments.

Production payments remain blocked until the product deliberately enables and reviews a live-mode
backend configuration, provisions the public HTTPS webhook, validates automatic capture, defines a
refund process, and passes database/readiness and end-to-end payment recovery checks. The current
module intentionally accepts Razorpay Test Mode only.

## PWA decision

This release does not register a service worker or offer offline mode. Authentication, entitlement,
job state, and payments are server-authoritative; caching them offline would create security and
staleness risk. A future PWA should cache only the static shell and explicitly exclude API,
authentication, profile, administrator, and payment responses.
