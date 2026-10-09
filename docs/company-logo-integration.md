# Company logos across job listings

## Implementation and contract

The existing `CompanyLogoFallback` component is reused by Discover Jobs, public listings, the job detail header, About the company and related jobs. Referral cards and candidate request summaries now reuse it too. Saved Jobs replaces its existing 24px bookmark graphic with the same-size company graphic. Existing card layout, image slots, colors, navigation and actions are retained.

Only `companyName` and the optional nullable `companyLogoUrl` supplied with a job are consumed. No logos are guessed from provider names, domains or a third-party lookup. Missing fields, null/blank URLs and failed image loads use company initials. A changed company/URL resets the failure state. Unknown names retain the existing contextual fallback.

Native images inside the existing Avatar containers have descriptive alt text, `loading="lazy"`, asynchronous decoding, `object-fit: contain` and explicit dimensions. This avoids MUI Avatar's eager `new Image()` preload and keeps the container geometry unchanged when loading fails. Existing slot sizes are retained: 52px job cards, 42px related jobs, 76px detail header, 52px company information, 62px referral cards, 64px candidate summaries and 24px saved-job graphics.

The separate backend repository was read only. Verified definitions:

- `PublicJobDtos.cs`: `PublicJobSummary` and `PublicJobDetails` expose `CompanyName` and nullable `CompanyLogoUrl`. `PublicJobProjections.cs` projects `job.Company.LogoUrl`.
- `CandidateDtos.cs`: candidate browse/recommended jobs expose `CompanyLogoUrl`.
- `ReferralDtos.cs` / `JobReferralService.cs`: public referral jobs expose `CompanyLogoUrl`, projected from `job.Company.LogoUrl`.
- `CandidateSavedJobResponse` currently exposes only saved ID/time, job ID/title/slug and company name. It **does not expose a logo**. Saved Jobs therefore shows initials with this contract; it will display a supplied `companyLogoUrl` if the backend adds the field. No per-job requests were added.

Deloitte and future imports display their linked company's logo when the listing DTO supplies it. A missing `Company.LogoUrl` requires company data to be populated through the existing backend/admin process; the frontend cannot identify a verified logo from a company name alone. Company verification badges retain their existing rules independently of logo display.

## Pagination and backend limitations

Discover Jobs keeps its existing server query/filter parameters and paginated result. A 10,000-job total at page size 20 is 500 pages; a requested page does not fetch the other 499 pages. Existing facet/supplemental-count requests are unchanged. Saved Jobs keeps page size 12 and backend totals (834 pages for 10,000 records). Only rendered images are mounted and image failures trigger no API queries.

**The existing candidate referral catalogue is not scalable to 10,000 jobs yet.** `getReferralCatalogue` reads every `/referrals/public` page at size 100, then enriches categories through existing cached job-detail reads (four concurrent workers, deduplicated by job slug). For 10,000 distinct jobs this can require 100 listing calls plus up to 10,000 cold-cache detail calls before client filtering and five-row pagination. This predates this change; no logo lookup or extra enrichment was introduced. It was preserved because truncating pages or applying filters only to one page would hide matching jobs and falsify counts.

The verified public referral controller accepts only `pageNumber` and `pageSize`; there are no server filters or facets. Proposed compatible backend changes, **not implemented or called by this frontend**:

1. Extend `GET /api/referrals/public` with search across title/company/skills, category, location, company, employment type and experience-year filters using the existing UI semantics, plus newest ordering. Apply filters before counting/paging and return accurate filtered `totalCount` / `totalPages`.
2. Include `categoryName` in each referral listing item and complete filter options/counts alongside the paged response (or a separately documented facets contract). This removes per-job category enrichment and permits server pagination without removing existing filter controls.
3. Add nullable `companyLogoUrl` to `CandidateSavedJobResponse`, projected from `Job.Company.LogoUrl` alongside the saved-job query. This permits real Saved Jobs logos with no client enrichment.

Admin job-source APIs, polling, auth, queued/running/interrupted states, duplicate-run prevention and refresh recovery were not changed.

## Files changed

- `src/features/jobs/components/CompanyLogoFallback.tsx`: shared lazy image / failure handling, initials, optional fields and existing contextual styles.
- `src/features/jobs/components/CompanyLogoFallback.test.tsx`: logo/fallback/old-response/company and card/summary coverage.
- `src/features/jobs/types/jobModels.ts`: optional logo field for older responses.
- `src/features/dashboard/types/dashboardModels.ts`: optional saved-job logo field.
- `src/features/referrals/components/ReferralJobCard.tsx`: reuse shared logo handling with existing styles.
- `src/features/referrals/components/CandidateReferralUI.tsx`: reuse shared company graphic in request summaries.
- `src/pages/SavedJobsPage.tsx`: company graphic in existing icon slot.
- `src/features/jobs/api/jobsApi.test.ts`: large server-paged response and no logo lookup.
- `src/features/referrals/api/referralsApi.test.ts`: supplied/missing/null listing logo passthrough without additional calls.
- `src/pages/dashboardPages.test.tsx`: legacy saved-job initials, supplied logo and server page change.
- `src/pages/jobPages.test.tsx`: detail/company logo slots and broken-image fallback.
- This report and `artifacts/company-logo-*`: verification results.

## Manual review steps

These are review steps, not a claim of live backend/browser validation:

1. Open Discover Jobs at desktop and mobile widths with a previously imported Deloitte job and jobs from two other companies. Inspect the listing response for `companyName` and `companyLogoUrl`; confirm contained logos in the existing slots and unchanged card actions/layout.
2. Open job details and a referral request modal. Check company graphics, descriptive image alt text and their existing sizes. Use browser network blocking for a logo URL and confirm initials replace the failed image without changing card geometry.
3. Review jobs with null or omitted logo fields. Check one-word and multiword company initials and that no broken image remains. No provider-name-based logo substitution should occur.
4. Visit Saved Jobs. With the current backend DTO expect initials. With a fixture/additive DTO containing `companyLogoUrl`, expect the logo in the existing 24px graphic slot. Verify View job and save/remove actions.
5. In Network, page/filter Discover Jobs and Saved Jobs against a large test catalogue. Confirm backend pagination parameters, accurate totals, only current-page listing records and no logo-specific API lookup. The image URLs themselves are normal browser image requests.
6. Review the referral-catalogue limitation above separately; a fully server-paged, filtered 10,000-referral catalogue requires the proposed backend additions.
7. In a disposable local admin session, review existing Run Now monitoring and refresh recovery. Its focused tests are rerun as regression protection; no backend run or production data was changed for this task.

## Automated verification

Across the selected suites, **175 of 176 distinct tests passed**, including all 19 added cases. Counts are deduplicated across reruns in `artifacts/company-logo-summary.json`.

- Logo / jobs / saved-job checks: 68/68 passed after the job-page rerun. The first concurrent run reported job-page failures/timeouts; unchanged HEAD passed 29/29 and the current suite passed 30/30 with one worker. The original assertions and 10-second timeout were retained.
- Referral / durable-run regression run: 116/117 passed. All 28 Run Now hook/page cases and two job-source API cases passed; their production files have no diff.
- The unchanged `marketplaceApi.test.ts` case “loads all 1000 jobs without truncation and reuses category reads on refresh” exceeded the existing 10-second timeout twice. Its API implementation and test have no diff from HEAD. The rerun also reported `cancelAnimationFrame is not defined` after the timed-out test's environment was torn down. This remains an existing catalogue/test issue; no timeout, assertion or implementation was altered to hide it. The shared-logo suite passed 13/13 on that rerun.
- ESLint on all 11 changed TypeScript files: passed, zero errors/warnings. Full-repository lint was attempted but interrupted after prolonged runtime; this is not a full-repository lint pass.
- `git diff --check`: passed.

- Production build (`npm run build`, including `tsc -b`): passed. Vite completed with the existing SignalR pure-comment / large MUI vendor chunk warnings; no build configuration was changed.

Manual browser/live backend validation was not performed; use the review steps above.

No backend files, deployment configuration, commits or pushes are part of this change. The 10,000-referral-catalogue goal remains blocked by the existing full-catalogue/filter contract described above; this report does not claim that view is server-paged or release-ready at that scale.
