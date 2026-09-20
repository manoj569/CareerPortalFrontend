# Job aggregation admin frontend review

## Implementation

The new `/admin/job-sources` page uses the existing administrator route guard, navigation shell, Material UI theme, Redux Toolkit Query API slice, authenticated Axios client, notifications, loading/empty/error components, and confirmation dialog.

- Source table on desktop and source cards on smaller screens, with local-time dates, ATS/status badges, error detail dialogs, pagination, company/identifier search, and status/ATS filters.
- Total, active, inactive, error, and previously successful source counts; five most recently successful sources and highest-failure sources. Every backend collection page is loaded before showing totals. Failed collection requests never produce partial totals.
- Add/edit dialogs with existing company options, HTTP(S) URL validation without credentials, provider-specific identifiers, editable minute intervals plus presets, active state, and server validation messages.
- Edit reads current source details. Activation reads current editable values and preserves them in the PUT body. Delete and run require confirmation. Mutations prevent repeated clicks and refresh source data.
- Run results show received, created, matched, skipped, failed, succeeded, and the returned error. Zero-created deduplication runs remain successful. HTTP 409 messages come from the backend. Runs have a five-minute request timeout; a network/timeout error explicitly leaves the outcome unknown and recommends refreshing status.
- Direct draft-review entry points, a draft moderation heading/instructions, safe external application links in job details, and a return link to the draft queue. Existing search, filters, details, individual publishing, and soft deletion are reused. No recruiter, referral, or application state is rewritten.

## Backend inspection and endpoints

Inspected backend repository: `C:/Users/Ashish/Documents/Codex/2026-07-27/you-are-a-principal-net-9`, branch `chore/job-url-hash-backfill`, revision `3f5581a`.

Contracts were read from `AdminJobSourcesController`, `JobSourceManagementDtos`, validators and management service, `JobSourceRunResult`, `JobSourceRunner`, `JobSourceCategoryResolver`, `JobsController`, `JobDtos`, `AdminCompaniesController`, `AdminCategoriesController`, and shared response records.

Existing endpoints reused:

| Operation | Endpoint |
| --- | --- |
| Source collection/create | GET / POST `/api/admin/job-sources` |
| Source detail/update/delete | GET / PUT / DELETE `/api/admin/job-sources/{id}` |
| Manual aggregation | POST `/api/admin/job-sources/{id}/run` |
| Company selection | GET `/api/admin/companies/options` |
| Draft queue/search/filter | GET `/api/admin/jobs` with existing query fields including `status=1` |
| Job details | GET `/api/admin/jobs/{id}` |
| Publish draft | POST `/api/admin/jobs/{id}/publish` |
| Remove unsuitable draft | DELETE `/api/admin/jobs/{id}` |

The frontend base URL already includes `/api`; endpoint constants follow existing relative-path conventions. Source list envelopes use `data.items`, `pageNumber`, `pageSize`, `totalCount`, and `totalPages`. The backend permits at most 100 sources per page. Combined search/error filters and dashboard metrics are computed over the complete retrieved collection; no analytics endpoints were added.

## Backend limitations and category behavior

- Source category is **read-only**. The API returns a category resolved through `SourceCategories` configuration; `SaveJobSourceRequest` has no category field. Missing mappings show **Not configured**. No category editor or environment changes were introduced.
- Ingestion can resolve a raw job's explicit category, then configured external-category mappings, then the source fallback. This architecture is unchanged.
- Source `lastError` is sanitized by the management service to `External job source run failed.` The UI displays the complete message it actually receives, not an invented diagnostic.
- Custom source configurations can be persisted, but the inspected backend has no registered Custom aggregation provider. The form explains this and Run Now is disabled for Custom sources. Inactive sources also cannot run.
- No bulk-publish endpoint or general draft-rejection endpoint exists. Per-job publish and supported soft deletion are retained. Bulk publishing requires a separate backend capability/follow-up.
- Counts are a snapshot of a paginated collection, not a transactional analytics snapshot. Very large source collections will require multiple requests.
- No production API calls or ingestion runs were used for frontend testing.

## Exact files created

```text
docs/admin-job-sources-review.md
src/features/admin/api/jobSourcesApi.ts
src/features/admin/api/jobSourcesApi.test.ts
src/features/admin/components/JobSourceFormDialog.tsx
src/features/admin/types/jobSourceModels.ts
src/features/admin/utils/jobSourceFormatting.ts
src/features/admin/validation/jobSourceSchema.ts
src/features/admin/validation/jobSourceSchema.test.ts
src/pages/admin/AdminJobSourcesPage.tsx
src/pages/admin/AdminJobSourcesPage.test.tsx
```

## Exact existing files modified

```text
src/api/axiosBaseQuery.ts
src/constants/apiEndpoints.ts
src/constants/routes.ts
src/layouts/AdminDashboardLayout.tsx
src/pages/admin/AdminJobDetailsPage.tsx
src/pages/admin/AdminJobsPage.tsx
src/pages/admin/adminPages.test.tsx
src/routes/routeConfig.tsx
```

`axiosBaseQuery` only adds an optional per-request timeout; requests without an override retain their existing behavior.

## Verification

Dependencies were already installed; no lockfiles changed. Backend files were not changed, so backend tests were not run.

Commands executed:

```text
npm run typecheck
npm run lint
npm run build
npm test -- --reporter=dot
npm test -- src/pages/admin/AdminJobSourcesPage.test.tsx src/features/admin/api/jobSourcesApi.test.ts src/features/admin/validation/jobSourceSchema.test.ts src/pages/admin/adminPages.test.tsx src/features/admin/api/adminApi.test.ts src/routes/routeConfig.test.tsx src/routes/routeGuards.test.tsx src/layouts/AdminDashboardLayout.test.ts --maxWorkers=1
npm test -- src/pages/ProfilePage.test.tsx src/features/admin/components/AdminComposeJobForm.ui.test.tsx --maxWorkers=1 --testTimeout=30000
git diff --check
```

TypeScript, lint (zero warnings), and production build passed. The final focused run passed **72/72 tests across 8 files**. The existing compiler cache initially required running the check/build outside the restricted sandbox. SignalR dependency PURE-comment warnings were emitted by Rollup; the build succeeded.

The initial full test run reported **573 passed / 25 failed**, across **79 passing / 7 failing files**. Failures were in untouched candidate navigation, authentication, candidate browse/search URL state, profile, company CSV import, and compose-form tests. Several were timeouts; others were mismatched existing UI expectations. No unrelated feature edits were made to suppress them. Full output is retained locally in `artifacts/job-sources-tests.log`.

The serial timeout recheck passed **52/52 tests across both ProfilePage and AdminComposeJobForm.ui suites** with a 30-second test timeout. The complete default suite is still not green; remaining unrelated failing suites are `UserDashboardLayout.test.ts`, `authPages.test.tsx`, `CandidateBrowseJobsPage.test.tsx`, `candidateJobSearchParams.test.ts`, and `adminManagementPages.test.tsx`. These have not been rewritten as part of this task. Focused and recheck output is retained in `artifacts/job-sources-targeted-tests.log` and `artifacts/job-sources-timeout-recheck.log`.

The source-specific tests cover list/loading/empty/retry states, search/filtering, source errors, add validation and request shape, edit, activation/deactivation preservation, delete confirmation, running/disabled state, success with zero-created/matched jobs, logical failure, 409 messages, cache refresh, multi-page collection loading/failure, URL/interval validation, and UTC/null formatting. Existing admin tests cover confirmation-based publishing and deletion; the new draft-entry test checks the existing status query.

An isolated local fixture was inspected in the browser at desktop and 390px iframe widths, confirming table-to-card layout and readable mobile filters/actions. The fixture used synthetic data and no production authentication. Ignored QA files are under `.vite/job-sources-qa/`; logs are under `artifacts/job-sources-*.log`.

## Repository safety

Frontend started clean on `main` at `c6d63c2`. No commits, pushes, resets, stashes, migrations, secrets, generated SQL edits, or backend changes were made. The backend's pre-existing untracked `artifacts/AddJobAggregationDedupFoundation.idempotent.sql` remains unchanged. New frontend files remain untracked for review, so ordinary `git diff --stat` excludes them.

Final `git status --short` (`M` = modified; `??` = created/untracked):

```text
 M src/api/axiosBaseQuery.ts
 M src/constants/apiEndpoints.ts
 M src/constants/routes.ts
 M src/layouts/AdminDashboardLayout.tsx
 M src/pages/admin/AdminJobDetailsPage.tsx
 M src/pages/admin/AdminJobsPage.tsx
 M src/pages/admin/adminPages.test.tsx
 M src/routes/routeConfig.tsx
?? docs/admin-job-sources-review.md
?? src/features/admin/api/jobSourcesApi.test.ts
?? src/features/admin/api/jobSourcesApi.ts
?? src/features/admin/components/JobSourceFormDialog.tsx
?? src/features/admin/types/jobSourceModels.ts
?? src/features/admin/utils/jobSourceFormatting.ts
?? src/features/admin/validation/jobSourceSchema.test.ts
?? src/features/admin/validation/jobSourceSchema.ts
?? src/pages/admin/AdminJobSourcesPage.test.tsx
?? src/pages/admin/AdminJobSourcesPage.tsx
```

Final `git diff --stat` (tracked files only):

```text
 src/api/axiosBaseQuery.ts               |  3 +++
 src/constants/apiEndpoints.ts           |  5 +++++
 src/constants/routes.ts                 |  1 +
 src/layouts/AdminDashboardLayout.tsx    |  1 +
 src/pages/admin/AdminJobDetailsPage.tsx |  7 ++++++-
 src/pages/admin/AdminJobsPage.tsx       | 12 ++++++++----
 src/pages/admin/adminPages.test.tsx     |  7 +++++++
 src/routes/routeConfig.tsx              |  4 ++++
 8 files changed, 35 insertions(+), 5 deletions(-)
```

`git diff --check` passed. Git also emitted its configured LF-to-CRLF conversion notices. Review includes ten new files in addition to the eight modified files above. The ignored browser fixture and validation logs are local QA artifacts, not staged changes.
