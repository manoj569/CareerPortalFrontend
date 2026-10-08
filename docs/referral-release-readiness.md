# Candidate referral release readiness — 8 October 2026

## Recommendation: NO-GO

Focused frontend checks pass; no new production regression was confirmed among the recorded failures. Release certification remains blocked by unavailable live backend/database integration and unresolved baseline failures. Mocked frontend tests and synthetic browser fixtures are not live integration evidence.

## 1. Regression investigation

Read the integration document, current diff and recorded regression JSON before editing. Compared the same broader selection with unchanged HEAD `757a475bc4c9cd1995d3d3a1a23af1f99de21ead` in an isolated managed worktree, using identical installed dependencies/configuration, one worker and no file parallelism. The first baseline attempt lacked the required public API URL and could not load several suites; it was discarded. The retained baseline uses a localhost placeholder (`VITE_API_BASE_URL=http://localhost:5000/api`); relevant API calls are mocked.

| Run | Passed | Failed | Total |
| --- | ---: | ---: | ---: |
| Original recorded implementation | 148 | 30 | 178 |
| Unchanged HEAD baseline | 148 | 30 | 178 |
| Current reproduction | 149 | 29 | 178 |
| Final broader regression run | 149 | 29 | 178 |
| Final focused referral/privacy/application/navigation | 98 | 0 | 98 |

All 29 remaining current failures also fail HEAD: 24 CandidateBrowseJobsPage assertions, two candidateJobSearchParams assertions, two careerGuidanceNavigation assertions and one AdminDashboardLayout assertion. Exact names are in `artifacts/referral-release-pre-existing.txt`; the original 30 are classified individually in `artifacts/referral-release-classification.json`. Browse production and `src/features/jobs` have no diff from HEAD. No unrelated code or assertions were changed to hide these failures.

The original 30th failure was an outdated notification-header expectation omitting the new polling options. Its existing correction explicitly verifies 60-second polling and refetch-on-mount, and now passes. HEAD additionally fails its old Portfolio navigation-order test; the implementation already asserts its intended referral navigation. Those different names explain the equal original/baseline totals. No newly introduced production failure was confirmed in this selection. This is scoped regression evidence, not an all-repository test pass.

## 2. Backend contract verification

Inspected .NET 9 source at `C:/Users/Ashish/Documents/Codex/2026-07-27/you-are-a-principal-net-9`: ReferralsController, ReferralRequestsController, ReferrerRequestsController, JobReferralService, ReferralMarketplaceService, ReferralMarketplaceContracts, ReferralDtos, ReferralRequest, persistence repositories and NotificationOutbox. No backend source was changed.

| Actual route including API prefix | Verified contract |
| --- | --- |
| GET `/api/referrals/public` | Anonymous, approved eligible published jobs, real capacity, newest order, page size 1–100; no category field |
| POST `/api/referrals/{referralId:guid}/requests` | Candidate JWT, active account/access; optional trimmed candidateMessage ≤2,000 characters; 201; rejects self-request, any previous duplicate, full capacity or exhausted quota |
| GET `/api/referral-requests/mine` | Candidate JWT; own paged records plus authoritative quota; max 100 per page |
| GET `/api/referral-requests/{id:guid}` | Candidate JWT; repository lookup scoped to authenticated owner; another candidate's ID not found |
| POST `/api/referral-requests/{id:guid}/confirm` | Owner-scoped; Submitted → CandidateConfirmed; repeat confirmation idempotent |
| POST `/api/referral-requests/{id:guid}/not-received` | Owner-scoped; requires Submitted; sets NotReceivedAtUtc and retains Submitted; later confirmation allowed |

Axios supplies `/api` through its base URL. Owner actions use the existing `/api/referrer/referral-requests/{id}/accept`, `/reject` and `/mark-referred`; no unsupported endpoints were introduced.

Numeric mapping matches: 1 Requested/Pending, 2 Accepted, 3 Rejected, 4 Expired, 5 ReferralSubmitted/Submitted, 6 CandidateConfirmed/Confirmed. Pending expires after 48 hours through backend EffectiveStatus. Accepted records do not expire merely because the original pending deadline passes. Frontend displays returned effective status and actual timestamps; it does not calculate its own transition.

Creation consumes zero connections; acceptance consumes one. Limit: ten accepted connections per membership-relative consecutive 30-day window, not per day. Backend checks access/capacity/quota at creation and rechecks acceptance transactionally with candidate/opportunity locks. Permanent duplicate uniqueness includes historical requests. Contact requires ownership, successful status, active access and eligible opportunity. UI guards supplement server enforcement. Candidate acknowledgement is not independent company verification; employer applications remain separate.

## 3. Live integration: BLOCKED

**0 of 16 required live scenarios executed; none claimed passed.** SDK 9.0.302 exists. Docker's local Linux engine pipe is unavailable; psql is unavailable; `REFERRAL_TEST_POSTGRES` is unset. Existing PostgreSQL tests require localhost/127.0.0.1 and database `careerharbor_referral_test`, and otherwise skip. No approved running disposable backend/test DB was discovered. No application credentials, production data or real candidate accounts were used.

Attempted `dotnet test JobPortal.Application.Tests/JobPortal.Application.Tests.csproj --no-restore --filter FullyQualifiedName~Referral`. Production projects compiled, but the test project failed existing analyzers, including CA1707 and CA1859 in unrelated URL/provider/aggregation tests. No backend tests executed. Analyzer requirements were not disabled.

All requested live scenarios remain pending: browse; create; mine; owner acceptance; candidate Accepted; owner submission; candidate Submitted; not-received; retained Submitted; later receipt acknowledgement; CandidateConfirmed; refresh persistence; duplicate rejection; server quota/capacity; cross-candidate authorization; effective expiry. Run these only against guarded disposable local data and synthetic accounts. Frontend mocks/source review do not prove HTTP authorization or database concurrency.

## 4. Performance

Every page is still fetched at page size 100. No arbitrary cap or inaccurate total was introduced. Cold counts assume unique published job slugs and no existing detail cache:

| Jobs | Listing reads | Cold category reads | Cold total | Total with fresh cached metadata |
| ---: | ---: | ---: | ---: | ---: |
| 100 | 1 | 100 | 101 | 1 |
| 500 | 5 | 500 | 505 | 5 |
| 1,000 | 10 | 1,000 | 1,010 | 10 |

Tests assert all records/categories and exact cold/refetch counts at these sizes. They measure synthetic request counts, not live latency. General cold cost: `ceil(N/100) + U`, where U is the number of unique uncached or stale slugs.

Changed enrichment to reuse the existing per-store public jobsApi cache and in-flight requests, with its existing 120-second policy and four workers. Repeated slugs share one read. Warm totals require each entry to remain present/fresh; a long real load can outlast its freshness window. Capacity always comes from the fresh referral listing. Failed or mismatched details leave category unknown and jobs visible. Cancellation is checked again after enrichment.

Browse filters and request matching are memoized/indexed. My Requests sorting, status totals, filtering and catalogue lookup are memoized; counts use one pass rather than repeated scans. Typing modal messages no longer repeats full catalogue filtering. Existing five-row UI pagination bounds DOM rendering. Network/storage/filtering remain O(total records); cold enrichment is still a scaling limitation. Identical catalogue subscribers share one RTK Query entry. Header/page notification parameters differ, so those reads remain distinct. The new mutation test verifies one detail refresh and one notification refresh per successful acknowledgement; explicit UI recovery remains intact.

### Exact proposed backend changes, not implemented

1. Add categoryId/categoryName to PublicReferralJobResponse, projected from the listing query. This removes U enrichment reads; complete 100/500/1,000-job loads then cost 1/5/10 listing reads.
2. Extend existing public listing with search, categoryId, location, employmentType, companyId and experience-range filters, filtered TotalCount and stable newest ordering with ID tie-breaker. Supply authoritative facets/counts via an explicitly documented response or facet contract. Add a cursor/snapshot contract if consistent cross-page results under concurrent publication are required. Do not infer whole-catalogue counts from one page.
3. Add a nullable privacy-safe job summary to authorized candidate request DTOs: jobSlug, companyLogoUrl/companyIsVerified, location, employmentType, workplaceType, min/max experience and skills. Preserve basic historical title/company when unavailable. This avoids fetching/enriching the whole catalogue for one request detail. Do not include private referrer identity/contact.

## 5. Notifications

Successful referral mutations invalidate existing notification and request/capacity tags. The new real-store API test observes notification refetch and status 5→6. Header polls every 60 seconds; Notifications/detail every 30 seconds; candidate activity every 60 seconds. This is eventual refresh for another user's actions, not delivery confirmation. Backend outbox enlists InApp and Email delivery records; frontend does not claim email dispatch succeeded.

Backend Event currently always emits `/dashboard/referrals`; IsSafeActionUrl permits only it and `/dashboard/interview-insights`. Frontend DTO lacks reliable source ownership metadata, so no candidate deep links are guessed.

**Smallest compatible backend change:** add the existing fixed `/dashboard/my-referral-requests` route to NotificationOutbox.IsSafeActionUrl; select it in ReferralMarketplaceService.Event when recipient equals row.CandidateUserId. Retain `/dashboard/referrals` for owner recipients and legacy notifications. No DTO, migration or new frontend route is needed. Test recipient selection and whitelist rejection. Optional later per-request links require exact GUID-path validation; they are outside this minimal proposal.

## 6. Release checks and layout

TypeScript, full ESLint, production build and git diff --check pass; raw evidence is in `artifacts/referral-release-*`. Build retains existing SignalR annotation and >500 kB MUI chunk warnings. Focused: 98/98; final broader regression: 149/178, with 29 HEAD failures and zero new failure names. The selections overlap at the navigation test, so their totals should not be added as a unique-test count. The final test-only typing correction retains every assertion. Broader failures remain explicitly reported rather than changing assertions.

Synthetic browser QA used the actual store/theme/UserDashboardLayout/components and a local adapter that never reached a backend. Desktop 1672×941: document client/scroll widths both 1657. Mobile 390×844 dialog: both 390; acknowledged detail: both 375 with scrollbar. No horizontal overflow or browser errors observed; dialog content scrolls and actions remain reachable. Screenshots: `artifacts/referral-release-desktop.png`, `artifacts/referral-release-mobile.png`. Temporary harness/server/tab were removed/stopped/closed and viewport reset.

## 7. Files changed this pass

- `src/features/referrals/api/marketplaceApi.ts`: cache reuse, slug deduplication, final cancellation check.
- `src/features/referrals/api/marketplaceApi.test.ts`: five added pagination/cache/deduplication/notification tests; existing assertions retained.
- `src/features/referrals/components/ReferralJobsSection.tsx`: memoized filters/request lookup.
- `src/pages/CandidateReferralRequestsPage.tsx`: memoized sort/filter, single-pass counts and catalogue index.
- This report, a pointer appended to the existing integration document and `artifacts/referral-release-*` evidence.

Existing unstaged implementation remains intact. This pass changes no payment, deployment configuration, migrations or unrelated product modules. No commit, push or deployment.

## 8. Remaining blockers

Execute all 16 live scenarios against an approved disposable backend/database. Repair backend test-project analyzer failures. Resolve or explicitly disposition the 29 independently reproduced baseline frontend failures. Candidate notification links and cold enrichment overhead remain backend gaps. These facts support NO-GO despite focused frontend checks passing.
