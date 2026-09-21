# Career Guidance Phase 7 frontend

This feature integrates the existing Career Guidance Phases 1–6 backend without changing backend code. The feature uses RTK Query with the existing Axios/JWT client, typed DTOs matching the inspected contracts, lazy route loading, and server revisions on all mutable records.

## Routes and access

Public routes are `/career-guidance` and `/career-guidance/consultants/:consultantId`. Candidate routes are `/career-guidance/consultants/:consultantId/book/:serviceId`, `/career-guidance/my-bookings`, `/career-guidance/bookings/:id`, and `/career-guidance/sessions/:id`. The consultant workspace is under `/career-guidance/consultant/*`; its capability, verification, ownership, and edit permissions remain backend decisions. Administrator operations are under `/admin/career-guidance/*` behind the existing administrator guard.

## Marketplace and booking

Marketplace cards and public profiles render only public DTO fields, verified status, published reviews, services, and trust copy. Slot dates and times come from the backend slot endpoint and are rendered from UTC in the browser timezone; no local slot generation or fixed horizon is used. Booking questionnaires use the backend fields and are submitted once with the server snapshot.

## Payment and sessions

The candidate payment panel creates a backend order, passes the server key/order/minor-unit amount to the Razorpay checkout boundary, verifies the provider callback through the backend, and only then displays captured/confirmed state. Reconciliation remains available for pending provider results. No secret key, client-calculated amount, or provider callback alone can mark a booking paid. Session provisioning and join access are fetched from the backend. Meeting URLs are ephemeral component state, HTTPS-validated, opened with `noopener noreferrer`, and never persisted. Host URLs are only rendered in the administrator/consultant-authorized session surface.

## Reviews and disputes

Review UI checks the returned booking, captured payment, session, and current review state, while the backend remains authoritative for deadlines and moderation. Reviews explain pending moderation and permanent withdrawal. Disputes use the exact category/status/resolution/evidence contracts, preserve a request ID when retrying evidence, cap visible evidence at the contract maximum, and hide private administrator notes/evidence from candidates and consultants. Refund recommendations do not move money.

## Analytics, privacy, and resilience

Typed analytics APIs expose backend-defined metrics only. Currency and date-range semantics are not recomputed in the browser. Query caches are cleared with the existing auth/session reset flow. User content is plain text only; no HTML rendering or sensitive console logging is used. Forms lock duplicate submissions, show loading/empty/error states, and map 400/401/403/404/409/429 failures to safe messages. Revision conflicts reload current server state before retry.

## Environment and validation

The existing `VITE_API_BASE_URL` is the only API base configuration. The checkout public key is supplied by the backend order response; no secret is added to Vite environment files. A real payment provider and meeting provider are not exercised by automated tests.

Validation performed for this change: `npx tsc -p tsconfig.app.json --noEmit --incremental false` passed. Run the repository `npm run build`, `npm run lint`, and `npm test` commands in an environment with the existing dependency/cache permissions before deployment. Browser/E2E coverage requires a staged backend with the Career Guidance migrations, provider test mode, persistent keys, and meeting configuration; no production backend or database was modified here.

Consultant onboarding/profile, service management, availability and exception editing, consultant analytics, administrator verification, review moderation, dispute listing, and admin analytics are implemented against the typed endpoints. Session operations remain server-authorized and manual meeting configuration is rendered only in the admin session surface. Provider-backed acceptance still requires staged backend fixtures; no real payment was executed.

The repository baseline currently reports 5 failing files, 15 tests failed and 584 passed (599 total). The failures are in existing dashboard/auth and job-search tests (`DashboardPage.test.tsx`, `CandidateBrowseJobsPage.test.tsx`, `candidateJobSearchParams.test.ts`, `adminManagementPages.test.tsx`, and one additional pre-existing suite); none imports the Career Guidance feature. The baseline log is retained at `artifacts/career-guidance-phase7-baseline.log` for comparison.
