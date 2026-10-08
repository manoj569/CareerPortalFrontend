# Candidate referral integration audit

| Screen | Existing component | Endpoint / DTO | Permission / status | Gap |
|---|---|---|---|---|
| Referral Jobs | ReferralJobsSection, ReferralJobCard | GET /referrals/public → PagedResponse<PublicReferralJobResponse>; GET /jobs/{slug} → PublicJobDetails | Public approved published opportunities | Public referral endpoint has no filters/category/creation timestamp; use full pagination and existing job details for category |
| Request modal | ReferralJobsSection | GET candidate profile/resume-status; GET /referral-requests/mine → MyReferralRequestsResponse; POST /referrals/{id}/requests → ReferralRequestResponse | Active Candidate + Referral Access, available capacity and accepted quota; 2000-character optional message | No server consent field; explicit UI consent. Resume is not mandatory in backend |
| Request success | New reusable modal | Actual create response | Requested / backend time | No email-delivery receipt |
| My Requests | CandidateReferralRequestsPage | GET /referral-requests/mine | Own requests; six enum statuses | No Under Review/Withdrawn state; complete pages needed for exact filtered totals |
| Details / Submitted / Confirmed | CandidateReferralRequestPage | GET /referral-requests/{id}; POST /confirm, /not-received | Own request; submitted allows receipt actions | No separate review timestamp, employee message or withdrawal endpoint |
| Contact | AuthorizedContact | GET /referral-requests/{id}/contact | Accepted/submitted/confirmed + backend canViewContact + active access | Never payment alone |
| Save / View Job | Existing dashboard/jobs APIs | PUT/DELETE candidate saved-jobs/{jobId}; GET /jobs/{slug} | Candidate saves; public job details | No referral request-to-application conversion |
| Applied Jobs | ApplicationsPage | Existing candidate applications APIs | Independent JobApplication lifecycle | Referral service never creates JobApplication; keep records separate |
| Notifications | Existing dashboard notification cache | Existing notification endpoints/outbox | Recipient-scoped | Outbox points to generic /dashboard/referrals; no email dispatch evidence in referral service |

Backend audit: ReferralMarketplaceService, contracts/controllers, ReferralRequest entity, marketplace/referred-job repositories and application frontend were inspected. Ownership is enforced server-side. Active referrer ownership authorizes employee actions; there is no independently verified-employee flag. CompanyIsVerified means company verification only. Request creation rejects every previously requested opportunity, not just active duplicates. Quota is ten accepted connections per membership-relative 30-day window, not an IST daily application quota. Create checks membership, remaining slots and quota but does not increment; accept rechecks under repository write locks. Requested expires server-side after 48 hours. Confirm is candidate-reported receipt, not company verification. NotReceived retains Submitted status. No automatic JobApplication is created. Notifications enqueue durable in-app and email outbox events and audit entries, without proving delivery.

No backend additions are necessary for the authoritative lifecycle. Unsupported review/withdrawal/employee-message controls will be omitted and documented. Category filtering can use existing published job detail metadata without changing backend models.

## Delivery

Implemented candidate browse filters for title/company/skills, category, location, experience (including zero), company and employment type; newest ordering uses backend ordering. Catalogue and saved-job reads consume every page before reporting exact totals. Category metadata is enriched through existing published job details with at most four concurrent reads. Unknown categories remain explicitly unavailable, and filters exclude unknown matches. Company verification badges require CompanyIsVerified; no verified-employee label or applicant-avatar pile is fabricated.

Request cards merge the signed-in candidate's complete request collection and replace duplicate-request actions with View Request. Save/remove use existing dashboard mutations and reload saved records. No capacity decrement or quota decrement is optimistic.

The request modal displays actual profile/resume state, selected job, actual capacity and quota, optional 2000-character message, and explicit consent. Sending requires the server-provided active access/remaining-connection state; server enforcement remains authoritative. The synchronous submission guard prevents duplicate clicks. There is no new frontend price or plan policy. Resume is recommended, as the backend does not require it for request creation. A successful response closes the request modal and opens the success modal with backend ID/status/time. Its CTA opens that backend request ID; View Referral Jobs dismisses the modal. Backend errors retain the request form and refresh capacity/activity.

My Referral Requests has complete-record status totals, newest sorting, search, five-row pagination, real quota and loading/empty/error states. Detail, submitted and confirmed views are selected by fetched status at the existing `/dashboard/my-referral-requests/:requestId` route, including after reload. No new route or backend addition was needed. The timeline uses only RequestedAtUtc, AcceptedAtUtc/RejectedAtUtc/ExpiredAtUtc, ReferralSubmittedAtUtc and CandidateConfirmedAtUtc. Absent timestamps say Not recorded. Candidate message is displayed; unsupported employee response and withdrawal are omitted.

Accepted copy explicitly says submission is not yet confirmed. Submitted copy states that the employee marked the referral as submitted. Receipt actions require confirmation dialogs and call `/confirm` or `/not-received`; neither changes status optimistically. Not-received remains Submitted and allows positive acknowledgement later. The confirmation heading is **Confirmation received — acknowledged by you**, with an explicit explanation that this is not independent company verification. UI dates use Asia/Kolkata; the quota window still comes directly from the backend rather than a frontend daily reset.

Applied Jobs retains its own records/lifecycle, with an explanatory link to My Referral Requests. No request, acceptance, submission or acknowledgement is inserted as an employer application. Payment infrastructure, pricing, aggregation, deployment configuration and backend data models are unchanged.

Existing notification invalidation is reused after successful mutations; the candidate header polls every 60 seconds and Notifications every 30 seconds. No delivered-email badge is invented. **Backend gap:** the outbox permits only generic `/dashboard/referrals` for referral events, and the frontend notification DTO lacks reliable event-source metadata. Candidate-specific notification deep links require a compatible backend contract/template change; the frontend does not guess ownership from a generic title.

## Files changed for this follow-up

- `src/features/referrals/api/marketplaceApi.ts`: complete catalogue/activity/saved reads using the existing base query.
- `src/features/referrals/api/marketplaceApi.test.ts`: pagination, category enrichment and saved-record coverage.
- `src/features/referrals/components/CandidateReferralUI.tsx` (new): job summary, event timeline, quota and guidance.
- `src/features/referrals/components/ReferralJobsSection.tsx`: browse/filter/save, request/consent/success modals.
- `src/features/referrals/components/ReferralJobCard.tsx`: compact cards, work mode, actual request state and save actions.
- `src/features/referrals/components/candidateReferral.test.tsx` (new): candidate workflow tests.
- `src/features/referrals/types/marketplaceModels.ts`: explicit IST display.
- `src/pages/CandidateReferralRequestsPage.tsx`: dashboard, detail, submitted and acknowledged views.
- `src/pages/ApplicationsPage.tsx`, `src/pages/dashboardPages.test.tsx`: lifecycle separation explanation/test.
- `src/pages/referralMarketplace.test.tsx`: shared catalogue-hook mock for existing privacy tests.
- `src/pages/CandidateBrowseJobsPage.test.tsx`: notification-header assertion now verifies the requested polling options.
- `src/layouts/UserDashboardLayout.tsx`, `src/pages/NotificationsPage.tsx`: existing inbox refresh.
- This report and `artifacts/referral-candidate-*.png` / result JSON: validation evidence.

## Status mapping

| Backend | Candidate label | Completed evidence |
|---|---|---|
| Requested (1) | Pending | RequestedAtUtc |
| Accepted (2) | Accepted | AcceptedAtUtc |
| Rejected (3) | Rejected | RejectedAtUtc |
| Expired (4) | Expired | Backend effective status / ExpiredAtUtc |
| ReferralSubmitted (5) | Submitted | Employee-reported ReferralSubmittedAtUtc |
| CandidateConfirmed (6) | Confirmed; acknowledgement heading | CandidateConfirmedAtUtc |

There is no distinct Under Review or Withdrawn transition. NotReceivedAtUtc is an independent submitted-state flag. No interviews, offers, employer rejection or hiring outcome is inferred.

## Validation and limitations

Browser QA used temporary local-only fixtures with real application components and theme; the fixture adapter never reached the backend. Desktop browse, mobile request dialog/confirmation and tablet confirmation were inspected. Mobile modal/page width was 390 px without horizontal overflow; tablet client/scroll widths were both 753 px after scrollbar. Temporary fixtures were removed. Final test/build results are recorded below after execution.

- Focused referral/application/notification/navigation/privacy-cache suite: **93/93 passed**, serial execution; `artifacts/referral-candidate-results.json`.
- Scoped ESLint: passed for referral files, candidate pages, application/notification pages and affected tests/layout.
- Production `npm run build`: passed (TypeScript and Vite); existing SignalR annotation and >500 kB bundle warnings remain.
- Earlier concurrent runs experienced Vitest worker and UI timeouts under preview-server load. The final serial run passed without relaxing assertions or test timeouts.
- `git diff --check`: passed.
- Expanded regression selection: **148/178 passed** in `artifacts/referral-candidate-regressions.json`. It recorded 30 failures: five previously known navigation/search failures, 24 additional failures in the unchanged CandidateBrowseJobsPage screen/tests (facets, resume/mode expectations and some timeout failures), and one old header-notification assertion that omitted polling options. That header assertion was updated and its isolated rerun **passed (1/1)**. The browse/search production sources have no diff from HEAD; those unrelated assertions were not rewritten to hide failures. Payment, checkout, job-detail, Interview Insights and route tests in the expanded selection passed.

Complete pagination makes exact totals and duplicate matching reliable but costs O(total records), and category enrichment adds one existing job-detail read per slug. A backend filtered referral listing/facets and enriched detail DTO would scale better. Cross-page results are not an atomic snapshot; backend transitions and capacity checks remain authoritative. Removed/publicly unavailable opportunities still retain the request's basic title/company history, with a fallback to Referral Jobs rather than an invented job URL.

Withdrawal, a distinct Under Review status, employee response message, independent employee verification, proof of email delivery, and candidate-specific notification links are unsupported. No backend additions, migrations, production database access, deployment, commit or push were performed. Live multi-user authorization and quota concurrency remain an integration check for an approved disposable backend.

## Manual integration checklist

1. Browse/search/filter all supported fields, reset, newest paging, company badges and missing-category fallback.
2. Save/remove through existing APIs, including a previously saved job beyond the first backend page.
3. Request with actual profile/resume state; verify consent, empty/2000-character optional message, inactive access, exhausted quota and exhausted slots.
4. Double-click send and simulate two browser sessions; verify one backend request, conflict messages, refreshed quota/capacity, and no optimistic slot changes.
5. Verify success uses backend timestamp/ID, View Referral Jobs dismisses, and View My Referral Request opens the created request.
6. Verify pending/accepted/rejected/expired/submitted/confirmed lists and reload history. Missing event times stay unrecorded; no Under Review/Withdraw action is invented.
7. Verify protected contact never loads before acceptance and backend authorization; test inactive access, logout, 403/404 and another candidate's ID.
8. As the owning referrer, accept then report submission. As the candidate, cancel then confirm each receipt dialog. Not received remains Submitted; acknowledgement later succeeds.
9. Verify in-app notification refresh and independently inspect backend dispatch status for emails; test the documented generic-action-link gap.
10. Verify direct applications stay separate and preserve original payment/application quotas. Check keyboard focus, mobile modal scrolling, tablet wrapping and failures.

## Release-readiness follow-up

See [referral-release-readiness.md](referral-release-readiness.md) for the unchanged HEAD comparison, final test evidence, performance improvements, actual backend contract review, live integration BLOCKED status and NO-GO recommendation. The earlier failure classification is superseded by the baseline evidence in that report.
