# Production deployment

## Target topology

The prepared hosting target is Azure Static Web Apps for the Vite output and a separately deployed
ASP.NET Core API behind HTTPS. This is a deployment-ready configuration, not a deployment: no cloud
resource, workflow, credential, DNS record, or environment was created in Step 10.

`public/staticwebapp.config.json` is copied to the root of `dist` by Vite. It provides the SPA
navigation fallback, immutable caching for hashed assets, no-cache HTML behavior, and baseline
security headers. If another static host is selected, reproduce those rules in that provider's
configuration.

## Required build configuration

Use:

```text
app_location: /
output_location: dist
app_build_command: npm ci && npm run build
```

The CI runtime must satisfy the versions in `package.json`:

- Node.js 20.19 or newer
- npm 10 or newer

Use `npm ci`, not `npm install`, in CI so the checked-in lockfile controls the dependency graph.

## Browser-visible environment

Set these values in the build job:

```dotenv
VITE_API_BASE_URL=https://api.example.com/api
```

Replace the example origin with the real API address. `VITE_API_BASE_URL` is compiled into the
browser bundle. Non-local production APIs must use HTTPS; HTTP loopback is accepted only for local
preview. Never put JWT keys, refresh tokens, database strings, SMTP credentials, Razorpay secrets,
or other secrets in a `VITE_*` variable.

The API must allow the exact frontend HTTPS origin in `Cors:AllowedOrigins`. Do not use wildcard
origins. If refresh tokens are migrated to secure cookies, update CORS and the client together to
use credentials only for the exact trusted origin.

## Content Security Policy

Add a CSP at the hosting edge after the final frontend and API origins are known. Do not copy a
placeholder origin into production. A starting policy is:

```text
default-src 'self';
base-uri 'self';
object-src 'none';
frame-ancestors 'none';
form-action 'self';
script-src 'self' https://checkout.razorpay.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self' https://API_ORIGIN https://api.razorpay.com;
frame-src https://api.razorpay.com https://*.razorpay.com;
font-src 'self' data:;
upgrade-insecure-requests
```

Material UI currently needs inline styles, so removing `style-src 'unsafe-inline'` requires a nonce
or hash strategy. Validate Razorpay checkout in report-only mode before enforcing CSP because the
provider may add documented domains. Do not add `'unsafe-eval'` or a wildcard script source.

## Deployment sequence

1. Rotate any secrets that have ever appeared in tracked configuration or logs.
2. Provision the production database and run the reviewed EF Core migrations.
3. Store the database connection, JWT signing key, SMTP credential, and Razorpay key secret in the
   API host's secret manager.
4. Configure the API's public URL, allowed frontend origin, trusted reverse proxy, password-reset
   URL, HTTPS certificate, readiness probe (`/health/ready`), and liveness probe (`/health/live`).
5. Deploy the API and verify HTTPS, CORS, authentication, database readiness, and Razorpay
   test-mode callbacks before enabling live keys.
6. Build the frontend with the final HTTPS API URL using `npm ci`, `npm run typecheck`,
   `npm run lint`, `npm run test`, and `npm run build`.
7. Run `npm run analyze`, inspect the output, and publish only `dist`.
8. Verify the SPA fallback on direct visits to `/jobs/{slug}`, `/dashboard`, `/admin`, and payment
   return routes.
9. Apply CSP in report-only mode, inspect violations, then enforce the reviewed policy.
10. Run the smoke checklist below and only then switch DNS or production traffic.

## Post-deployment smoke checklist

- Home and jobs load without mixed content or console errors.
- Direct and refreshed nested routes serve the SPA rather than a host 404.
- Login, refresh, logout, and expired-session redirects work across a tab refresh.
- Candidate and administrator route guards match API authorization.
- Job search, details, save/unsave, application history, and profile update use live data.
- Razorpay order creation uses backend pricing; success appears only after backend verification.
- Payment success, pending, failed, and return routes survive refresh and back/forward navigation.
- Unknown routes show the Not Found page.
- `robots.txt`, favicon, canonical links, metadata, cache headers, and security headers are present.
- `/health/live` and `/health/ready` are monitored separately.

## Rollback

Keep the previous immutable frontend artifact and API release. Roll back the frontend independently
when the API contract is backward compatible. For schema changes, use the migration-specific
rollback plan reviewed with the API release; do not automatically downgrade a production database.
