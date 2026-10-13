# Browse Jobs search audit and acceptance

## Root causes and old flow
- URL was already the applied state and RTK Query already keyed every PublicJobQuery argument. Search requests use GET /jobs, keyword (not q), repeated locations, pageNumber, pageSize, numeric sortBy and sortDirection.
- Only keyword used a 350 ms value debounce; location required explicit submit. Keyword debounce updated independently from location.
- Draft synchronization depended on array identities, so unrelated URL updates could discard location input.
- Explicit submission sent hidden minimum-experience state even when unchanged; this made Experienced/Fresher searches leave their tab.
- Automatic searches replaced browser history rather than recording applied searches.
- Clear retained sort and current tab constraints; the empty-state clear used a different path.
- RTK Query data can retain the previous argument's response during fetch; the header showed its old count under new chips.
- Locally hiding recently applied cards also subtracted only this page's removed cards from totalCount.
- Resume Matches was enabled despite Phase 2 requirements.

## New flow
Draft keyword/location -> one cancellable 350 ms timer -> normalized combined search -> URL applied state -> PublicJobQuery -> RTK Query -> backend response. Search/Enter cancel the timer and apply immediately, resetting page. Identical explicit searches refetch only when not already fetching. Debounced identical values do nothing. One-character keywords require explicit submission; C#, Go and .NET auto-search normally.

URL navigation cancels old typing and hydrates inputs. Applied changes create history entries; canonical cleanup uses replace. Existing repeated facet conventions remain shareable. Tabs preserve keyword/location, map internships and experience to server parameters, and reset page. Disabled recommended URLs normalize to All jobs. Referral retains its separate section/endpoint.

All visible filters already map through the URL parser and PublicJobQuery: workplace, employment type, role category/category, location, department, education, experience, salary and date posted. Changes apply immediately through applyChanges, reset page, update URL and query. Sort already maps to backend enum including Recommended; no local search or sort was added. All clear actions now clear search, filters, sort and category through one path.

Backend totalCount and totalPages drive heading and pagination. Recently applied cards may still be hidden as an existing action UX, without altering authoritative totals. Results stay laid out during refetch with progress and Finding jobs announcement; failures suppress count and offer retry; empty results identify applied keyword/location. Accessible form submission, labels and keyboard-removable chips remain.

RTK Query caches each complete argument independently; an older query's completion cannot replace the newer query's cache. Existing axiosBaseQuery forwards AbortSignal. No custom request concurrency layer or new dependencies.

Facet counts are separate requests: existing supplemental date counts issue six small /jobs requests in parallel. These are distinct facet queries, not duplicate result searches. Backend relevance and facet contract correctness still require live acceptance.

## Automated checks
Page tests cover combined debounce, immediate submission, one-character submission, Back navigation cancellation, chip clearing, backend totals, pagination preservation, loading/error/empty states and disabled Resume Matches. API test resolves rea after react and verifies the react cache stays correct and identical arguments are deduplicated. Existing filter/URL tests cover facet parameters and page reset. Obsolete active Resume Matches page tests removed; phase-two recommendation components themselves were not changed.

## Manual acceptance (requires running frontend and backend)
Open /dashboard/jobs?mode=all. Use Network tools and inspect GET /jobs requests (exclude pageSize=1 facet count requests).
1. Submit pwc: keyword=pwc, pageNumber=1; eligible PwC records if backend supports company search.
2. Type react: after 350 ms keyword=react; eligible role/skill/description matches.
3. Submit .NET: keyword=.NET; relevant eligible records.
4. Submit software engineer: keyword=software engineer; title/description matches.
5. Submit barclays: keyword=barclays; eligible company matches.
6. Type react and Pune: combined keyword=react and locations=Pune after typing settles; Enter/Search immediately applies both.
7. Navigate to page 2 then select Last 7 days: freshnessDays=7 and pageNumber=1; URL freshness=7.
8. Select Experienced: preserve keyword/location, minExperienceYears=2, pageNumber=1. Search again must retain mode=experienced.
9. Remove Search chip with mouse or keyboard: input empty, q removed, keyword absent from request, page 1.
10. Back and Forward: previous applied query, filters and inputs restored; a pending typing timer must not undo navigation. Refresh/copy URL reproduces state.
11. Change sort then paginate: server sort enum changes, first page resets; later page requests preserve filters/sort.
12. Reset all/Clear all/empty-state clear: mode=all, default sort, no keyword/location/filter params, page 1.
13. Type r/re/rea/react rapidly: one settled result query; old responses must not overwrite react. Explicit R and C# must work.
14. Simulate slow /jobs: progress and Finding jobs; retained cards remain visible. Simulate error: retryable error without 0 jobs count. Return zero: contextual empty state.
15. Resume matches is disabled and direct mode=recommended resolves to All jobs; Referral continues its independent architecture.

Manual live-backend tests were not executed. No recording was available in the supplied attachment (the attachment contained the request text).

## Reproducible validation commands
Focused acceptance command:
```powershell
npx vitest run src/pages/CandidateBrowseJobsPage.test.tsx src/features/jobs/api/jobsApi.test.ts src/features/jobs/utils/candidateJobSearchParams.test.ts --maxWorkers=1 --testTimeout=60000 -t 'debounces|submits keyword|restores search drafts|normalizes disabled|Enter submits|keeps server counts|shows searching|renders loading|does not announce|renders all five|restores Fresher|applies date and sort|applies the .* server filter|public jobs advanced|Candidate job search URL' --reporter=dot
```
Result: 3 files passed; 31 tests passed, 23 outside the selected scope skipped; exit 0. Duration 269.57 seconds. No unhandled errors in this final focused run.

Additional final draft-preservation regression command:
```powershell
npx vitest run src/pages/CandidateBrowseJobsPage.test.tsx --maxWorkers=1 --testTimeout=60000 -t 'pending drafts|debounces|submits keyword|restores search drafts|Enter submits' --reporter=dot
```

Broader initial page runs hit stale UI expectations for collapsed facets, removed sliders and active Resume Matches, along with worker/test timeouts under resource contention. The complete repository test suite is not certified by this change. The focused acceptance set is deliberately selected and its skipped tests are not reported as passed.

Production validation: npm run build (tsc -b && vite build). First completed build passed, 12,311 modules transformed, Vite bundling took 4m32s. Warnings: SignalR PURE comment annotations and a chunk larger than 500 kB. A final rebuild was started after the last draft-navigation fix; final outcome recorded below.

Git diff --check: passed. No staging, commits, pushes or deployment performed.

## Files changed
- src/pages/CandidateBrowseJobsPage.tsx: input timer, immediate search, navigation/draft synchronization, query freshness, reset, counts, accessible refetch, empty/error states.
- src/features/jobs/components/candidateBrowse/JobModeTabs.tsx: disabled Phase 2 Resume Matches.
- src/pages/CandidateBrowseJobsPage.test.tsx: focused behavior tests and obsolete expectations updated.
- src/features/jobs/api/jobsApi.test.ts: out-of-order response and deduplication test.
- src/features/jobs/utils/candidateJobSearchParams.test.ts: align removed company type and retained employment type expectations.
- docs/browse-jobs-search-audit.md: audit, manual acceptance, validation and risks.
Additional final regression result: 1 file passed; 6 selected tests passed, 36 skipped; exit 0; duration 109.89 seconds. This run includes the new pending-draft + immediate-date-filter regression plus debounce, submission, Enter and navigation checks. Across the two successful selections, 32 distinct tests passed.

Final changed-file ESLint: passed, exit 0.
The intermediate final rebuild caught a test-only selector type error (unsupported getByRole exact option); it was removed. The next build passed TypeScript and proceeded to Vite bundling.

Final production build: PASSED, exit 0. TypeScript succeeded; Vite transformed 12,311 modules and bundled in 41.92 seconds. Same SignalR annotation and 500 kB chunk warnings. Final git diff --check passed.

## Final git diff --stat
```text
 src/features/jobs/api/jobsApi.test.ts              |  79 ++-
 .../components/candidateBrowse/JobModeTabs.tsx     |  18 +-
 .../jobs/utils/candidateJobSearchParams.test.ts    |  19 +-
 src/pages/CandidateBrowseJobsPage.test.tsx         | 623 +++++++++++++--------
 src/pages/CandidateBrowseJobsPage.tsx              | 606 +++++++-------------
 5 files changed, 673 insertions(+), 672 deletions(-)
```
The new untracked audit document is not included in git diff --stat.

## Final git status --short
```text
 M src/features/jobs/api/jobsApi.test.ts
 M src/features/jobs/components/candidateBrowse/JobModeTabs.tsx
 M src/features/jobs/utils/candidateJobSearchParams.test.ts
 M src/pages/CandidateBrowseJobsPage.test.tsx
 M src/pages/CandidateBrowseJobsPage.tsx
?? docs/browse-jobs-search-audit.md
```
All changes are unstaged.
