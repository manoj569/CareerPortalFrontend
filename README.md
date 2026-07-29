# Career Portal Frontend

React frontend for a commercial career portal backed by an ASP.NET Core Web API. The current
implementation includes the application foundation, routing and layouts, authentication, public
jobs, candidate and payment flows, and the role-protected administrator dashboard.

## Technology stack

- React 19 and TypeScript 5.9
- Vite 7
- React Router 7
- Material UI 7 and Emotion
- Redux Toolkit, RTK Query, Axios, React Redux
- React Hook Form and Yup
- Vitest, Testing Library, ESLint, and Prettier

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm 10+
- The Career Portal API for live application data

## Installation

```bash
npm ci
```

## Local startup order

Start the backend before Vite so authentication initialization and live page requests have a
reachable API:

1. From the .NET solution directory, configure the backend development secrets and CORS origin.
2. Apply the current Entity Framework migrations:

   ```powershell
   dotnet ef database update --project JobPortal.Infrastructure --startup-project JobPortal.API
   ```

3. Start the API and wait for `http://localhost:5259`:

   ```powershell
   dotnet run --project JobPortal.API --launch-profile http
   ```

4. From this frontend directory, install the locked dependencies and start Vite:

   ```powershell
   npm ci
   npm run dev
   ```

5. Open the exact local URL printed by Vite, normally `http://localhost:5173`.

The API's `Cors:AllowedOrigins` must contain that exact Vite origin. Email verification, database
data, administrator bootstrap credentials, resume storage, and Razorpay Test Mode credentials are
backend concerns; do not add them to frontend environment files.

## Environment setup

Copy `.env.example` to the environment file you use and set:

```dotenv
VITE_API_BASE_URL=http://localhost:5259/api
```

Only the API base URL belongs in frontend environment files. Variables prefixed with `VITE_` are
exposed to the browser, so JWTs, payment keys, SMTP credentials, database credentials, and other
secrets must never be placed in these files. Production deployments must inject an HTTPS,
non-local API URL at build time; HTTP is accepted only for a loopback URL used in local preview.
`.env` and environment-specific variants are ignored; only `.env.example` is intended for source
control.

## Commands

```bash
npm run dev
npm run typecheck
npm run build
npm run analyze
npm run build:analyze
npm run lint
npm run test
npm run format:check
npm run preview
```

`npm run analyze` reports raw and gzip sizes from an existing production bundle without adding a
bundle-analysis dependency.

## Folder structure

```text
src/
├── api/          Central HTTP client and API error transformation
├── app/          Root application and providers
├── assets/       Static application assets
├── components/   Common, feedback, form, and navigation components
├── config/       Typed environment and application configuration
├── constants/    Route and API endpoint constants
├── features/     Feature-owned modules
├── hooks/        Reusable and typed Redux hooks
├── layouts/      Public, auth, user, and admin layout shells
├── models/       Domain models added with future features
├── pages/        Route-level pages
├── routes/       Router and route guards
├── services/     Cross-feature services
├── store/        Redux store and reducer architecture
├── styles/       Global styles
├── theme/        Material UI theme
├── types/        Shared TypeScript types
└── utils/        Framework-independent utilities
```

## Architecture notes

- Components and services consume the configured API client instead of importing Axios directly.
- The token refresh pipeline serializes concurrent refresh attempts and publishes a
  `auth:session-expired` browser event when session recovery fails.
- Authentication state is managed by Redux Toolkit and restored once at startup through the
  backend refresh endpoint before guarded routes resolve.
- Access tokens are held in memory. The backend currently returns refresh tokens to JavaScript, so
  the frontend keeps the refresh token in session storage for same-tab session restoration and
  never writes it to local storage. This remains a production security blocker until the backend
  moves refresh tokens to an HttpOnly, Secure cookie; see `docs/SECURITY.md`.
- Authentication uses the backend's exact `Candidate` and `Administrator` role names.
- Every page-level route is lazy loaded behind a reusable route loading fallback.
- Public, authentication, candidate dashboard, and administration areas use separate responsive
  layout shells.
- Public jobs use RTK Query for request deduplication, cancellation, and a two-minute unused-data
  cache.
- Candidate profile, saved jobs, application history, notifications, memberships, and account
  security use a separate RTK Query API slice while sharing the same authenticated HTTP client.
- Job search state is URL-driven so searches, filters, sorting, page number, and page size are
  bookmarkable and work with browser history.
- RTK Query owns server state. Private candidate, payment, and administrator caches are cleared
  after logout, session expiration, account switching, or role removal.
- The Material UI theme includes light and dark color schemes; light mode is the current default.

## Application routes

Public routes:

- `/`, `/jobs`, `/jobs/:slug`
- `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`
- `/unauthorized` and the catch-all Not Found route

Authenticated candidate routes:

- `/onboarding`
- `/dashboard`, `/dashboard/profile`, `/dashboard/resume`, `/dashboard/saved-jobs`
- `/dashboard/applications`, `/dashboard/applications/:applicationId`
- `/dashboard/notifications`, `/dashboard/settings`, `/dashboard/membership`
- `/dashboard/payments`
- `/payment`, `/payment/success`, `/payment/pending`, `/payment/failed`

Administrator routes:

- `/admin`, `/admin/jobs`, `/admin/jobs/create`, `/admin/jobs/:jobId`, `/admin/jobs/:jobId/edit`
- `/admin/companies`, `/admin/companies/create`, `/admin/companies/:companyId`
- `/admin/companies/:companyId/edit`
- `/admin/categories`, `/admin/categories/create`, `/admin/categories/:categoryId`
- `/admin/categories/:categoryId/edit`
- `/admin/users`, `/admin/users/:userId`
- `/admin/applications`, `/admin/applications/:applicationId`
- `/admin/payments`, `/admin/payments/:paymentId`
- `/admin/audit-logs`

Candidate and administrator routes require both a restored authenticated session and the matching
backend role. Browser route guards improve navigation but do not replace API authorization.

## Authentication API contract

The frontend is aligned with the current `JobPortal.API` contract:

| Operation                 | Method and path                  |
| ------------------------- | -------------------------------- |
| Register                  | `POST /auth/register`            |
| Verify email              | `POST /auth/verify-email`        |
| Resend verification email | `POST /auth/resend-verification` |
| Login                     | `POST /auth/login`               |
| Refresh session           | `POST /auth/refresh`             |
| Forgot password           | `POST /auth/forgot-password`     |
| Reset password            | `POST /auth/reset-password`      |
| Logout                    | `POST /auth/logout`              |

Registration returns a message-only `RegistrationResponse`; it does not create an authenticated
session. The registration request includes the required Indian mobile number and explicit Terms
and Privacy consent expected by the backend. Candidates must verify their email before login.
Verification tokens are accepted only by the API request and are never rendered or logged by the
frontend. Resend and duplicate-registration responses use generic privacy-safe messaging.

## Public jobs API contract

The public job experience uses the backend's current routes and response models:

| Operation            | Method and path                       |
| -------------------- | ------------------------------------- |
| Search jobs          | `GET /jobs`                           |
| Latest jobs          | `GET /jobs/latest`                    |
| Newest jobs          | `GET /jobs/newest`                    |
| Featured jobs        | `GET /jobs/featured`                  |
| Popular companies    | `GET /jobs/companies/popular`         |
| Job details          | `GET /jobs/{slug}`                    |
| Related jobs         | `GET /jobs/{slug}/related`            |
| Request Apply access | `POST /memberships/jobs/{slug}/apply` |

Search supports keyword, location, company ID, category ID, employment type, workplace type,
experience level, salary range, featured-only results, sorting, and pagination. The UI serializes
these values as readable query parameters and translates enum values to the numeric representation
expected by the API.

The Apply action remains backend-driven. Visitors are sent to login, authenticated candidates call
the membership access endpoint, payment-required responses are sent through backend-created
Razorpay orders, and granted responses expose only a validated HTTP(S) employer application URL.

The backend has no public category or complete company-catalog endpoint. Company choices therefore
come from the popular-company endpoint and current public results, while category choices come from
current public results; the frontend does not invent catalog data. Public job details also do not
expose separate skills, qualifications, openings, application instructions, or status fields. The
backend itself excludes hidden, unpublished, archived, and expired jobs.

## Candidate dashboard API contract

Authenticated candidate pages use:

| Operation                   | Method and path                               |
| --------------------------- | --------------------------------------------- |
| Read/update onboarding      | `GET/PUT /candidate/onboarding`               |
| Read/update profile         | `GET/PUT /candidate/profile`                  |
| Upload/download/delete CV   | `PUT/GET/DELETE /candidate/resume`            |
| Membership access           | `GET /dashboard/memberships`                  |
| Saved jobs                  | `GET /candidate/saved-jobs`                   |
| Save/unsave a job           | `PUT/DELETE /candidate/saved-jobs/{jobId}`    |
| Submit an application       | `POST /candidate/jobs/{jobId}/applications`   |
| Application history         | `GET /candidate/applications`                 |
| Application detail          | `GET /candidate/applications/{applicationId}` |
| Withdraw application        | `POST /candidate/applications/{id}/withdraw`  |
| Notifications               | `GET /dashboard/notifications`                |
| Mark one notification read  | `PUT /dashboard/notifications/{id}/read`      |
| Mark all notifications read | `PUT /dashboard/notifications/read-all`       |
| Change password             | `POST /dashboard/change-password`             |

The three-step onboarding route captures the backend's career-stage, opportunity, location, skill,
work-setting, education, and experience fields. Resume setup remains optional and links to the
existing Candidate resume page. The backend has no separate skip or partial-save operation, so
Skip leaves the form unsaved and takes the Candidate to the dashboard without gating existing
accounts. The overview composes backend resources and does not manufacture career activity.
Profile updates also synchronize the authenticated user's displayed name in Redux.

The current API has no email-change operation, account export, communication-preference
management, or account deletion operation. Those settings areas show explicit unavailable states
instead of fake controls.

The backend development profile currently launches on `http://localhost:5259`. Its development
CORS allowlist must include the Vite origin (normally `http://localhost:5173`) before browser-based
API requests will succeed.

Changing a password revokes all backend refresh tokens. The frontend therefore clears the current
session after a successful password change and requires a new login.

## Payments and access contract

Payments use backend-owned pricing and verification:

| Operation                 | Method and path                                 |
| ------------------------- | ----------------------------------------------- |
| Create Razorpay order     | `POST /payments/razorpay/orders`                |
| Confirm Razorpay result   | `POST /payments/{paymentId}/razorpay/confirm`   |
| Reconcile pending payment | `POST /payments/{paymentId}/razorpay/reconcile` |
| Current access status     | `GET /payments/status`                          |
| Payment list              | `GET /payments`                                 |
| Payment status history    | `GET /payments/history`                         |

The backend returns a company-specific membership with a configured duration; it is not a
frontend-controlled lifetime entitlement. The frontend never contains a gateway secret, generates
a payment signature, controls the price, or displays success before the backend reports both a paid
payment and active membership.

### Payment sandbox setup

Configure Razorpay test credentials only in the backend secret store. The frontend receives the
public key identifier from the backend-created order and has no payment-key environment variable.
Use backend test data and the Razorpay sandbox; never enter live card/payment data during local or
automated verification.

The inspected backend currently enforces a ₹99 INR, 30-day membership in Razorpay Test Mode. It
implements backend confirmation, signature-verified webhooks, and Candidate-triggered
reconciliation. Refunds and automatic scheduled reconciliation are not implemented.

## Administrator contract limitations

The backend supports company and category CRUD/options, job CRUD and lifecycle actions,
application review with private internal notes and secure resume download, and read-only audit
logs. The frontend uses those real contracts.

Dedicated administrator user-account mutation and payment-detail controllers are not available.
Those existing routes remain read-only reports or explicit unavailable states rather than
simulated actions.

## Production readiness

- Deployment configuration and the exact release sequence are in `docs/DEPLOYMENT.md`.
- Security guarantees, blockers, monitoring integration, CSP guidance, and the PWA decision are in
  `docs/SECURITY.md`.
- `public/staticwebapp.config.json` prepares Azure Static Web Apps as the likely static host with a
  browser-route fallback, immutable hashed assets, no-cache HTML, and baseline security headers.
- `public/robots.txt` blocks crawling of authentication, candidate, administrator, and payment
  areas. Runtime metadata also marks non-public routes `noindex`.
- Public pages publish title, description, canonical, Open Graph, and Twitter metadata at runtime.
  Because this remains a client-rendered SPA, production sitemap generation should fetch published
  job slugs from the backend during CI or from a backend-owned sitemap endpoint. Do not publish a
  guessed static list.

Step 10 prepares deployment but does not deploy, commit, push, or open a pull request.

## Troubleshooting

- Startup says `VITE_API_BASE_URL` is missing: create a local `.env` from `.env.example`.
- Production rejects the API URL: provide an HTTPS, non-local `VITE_API_BASE_URL` in the build job.
- Browser requests fail before reaching the API: add the exact Vite/frontend origin to the API
  `Cors:AllowedOrigins`; do not use a wildcard.
- Public pages show an unavailable state: check `/health/live`, then `/health/ready`. Liveness can
  succeed while the database readiness check fails.
- A nested route returns a host 404 after refresh: enable the SPA rewrite to `/index.html`.
- Authenticated pages return to login: confirm the API, refresh-token lifetime, CORS configuration,
  role claim, and browser session are all valid.
- Razorpay does not open: confirm the backend created a test order and that CSP/network policy
  allows `checkout.razorpay.com`.

## Known limitations

- Refresh tokens remain in `sessionStorage` until the backend adopts an HttpOnly secure-cookie
  contract.
- The SPA updates dynamic job metadata in the browser; crawlers that do not execute JavaScript need
  future prerendering/SSR and a backend- or CI-generated job sitemap.
- Dedicated administrator user mutation/payment-detail APIs and Candidate account export,
  preference, email-change, and deletion APIs are not currently available.
- Live end-to-end regression requires a migrated, reachable database, configured email delivery,
  matching CORS origin, seeded role-specific accounts, and Razorpay Test Mode credentials.
- PWA/offline mode is intentionally not enabled.
