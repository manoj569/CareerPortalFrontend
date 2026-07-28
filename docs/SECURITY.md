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

## Backend production blockers observed during Step 10

The inspected tracked API `appsettings.json` contains non-placeholder Razorpay-looking credentials.
Treat them as exposed: rotate/revoke them and remove secret values from tracked history. The same
file uses a default JWT signing key and local database configuration. Production must inject fresh
values from a secret manager. Do not copy any inspected values into frontend configuration.

The API already implements exact-origin CORS, JWT lifetime/signature validation, rate limiting,
HTTPS redirection, response compression, output caching, health endpoints, and security headers.
Production still requires a configured trusted proxy, a non-default JWT key, a reachable migrated
database, a production frontend CORS origin, SMTP credentials, and reviewed live Razorpay settings.

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

Real payments are not ready because:

- the inspected plan is 499 INR for 30 days, which does not match a ₹99 lifetime product;
- no Razorpay webhook endpoint/signature verification was found;
- no pending-payment reconciliation job was found;
- no refund workflow was found;
- tracked Razorpay-looking credentials must be revoked and moved to a secret manager;
- the database readiness check must pass before payment or entitlement traffic is accepted.

Test and live keys must remain separate. Only the backend may hold the secret or switch environments.
Complete provider-webhook verification and reconciliation before relying on redirects or browser
callbacks for recovery.

## PWA decision

This release does not register a service worker or offer offline mode. Authentication, entitlement,
job state, and payments are server-authoritative; caching them offline would create security and
staleness risk. A future PWA should cache only the static shell and explicitly exclude API,
authentication, profile, administrator, and payment responses.
