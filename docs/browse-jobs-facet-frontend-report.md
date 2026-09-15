# BROWSE JOBS FACET FRONTEND REPORT

Frontend-only continuation using the supplied backend contract. No backend files, authentication, payments, or deployment configuration changed. The working tree was clean at task start.

| # | Area | Result |
| --- | --- | --- |
| 1 | API integration | Existing RTK Query hook now calls `/api/jobs/facets` through the existing API base URL and `data` envelope. The legacy endpoint constant remains available. All selected filters are sent for backend contextual counting. |
| 2 | Role category | Replaces the single Category input with backend-labelled, counted, multi-select `roleCategories`. |
| 3 | Location | Backend `label` displayed; backend `value` submitted as repeated `locations`. |
| 4 | Department | Backend `label` displayed; backend `value` submitted as repeated `departments`. |
| 5 | Education | Heading remains Education; the API and canonical URL key are `educationRequirements`. |
| 6 | View more | Seven inline options; longer lists open a searchable dialog with draft selection, Clear, Cancel, and Apply. Zero counts remain visible. Duplicate identities do not have their counts summed. |
| 7 | Multi-select | Multiple values within and across facets are passed unchanged to backend search; OR/AND semantics and result counts remain server-owned. Filter changes reset page to 1. |
| 8 | Chips | Backend labels when available, keyboard-accessible removal, synchronized checkboxes and queries, and Clear all. Unknown values from shared URLs remain removable. |
| 9 | URL sync | Existing URL-derived state retained; repeated plural facet keys survive restoration and history navigation. Old singular location/department/education URLs remain readable and normalize to canonical keys. Legacy `categoryName` URLs retain their existing meaning rather than being reinterpreted as role categories. |
| 10 | Mobile drawer | Existing Filters (count) drawer retained with sticky Clear all / Show jobs. Large facet dialogs use the full-screen mobile variant. |
| 11 | Loading/error | Compact initial facet loader; existing options retained during refetch. “Unable to load filters” and Retry are confined to the filter panel. Results continue independently. Empty string facets are hidden. Existing date counts still use backend search totals and no longer block facets on failure. |
| 12 | Accessibility | Associated checkbox labels, visible counts, named dialogs, MUI focus trap, Escape dismissal, explicit View more focus restoration, wrapping labels, and keyboard-operable chips/actions. Mobile behavior is covered by component tests, not claimed as authenticated browser visual QA. |
| 13 | Focused tests | Pending final validation. |
| 14 | Full tests | Pending final validation. |
| 15 | Typecheck | Passed. |
| 16 | Lint | Pending final validation. |
| 17 | Build | Pending final validation. |
| 18 | git diff --check | Passed interim check; final check pending. |
| 19 | git status | Task-scoped frontend changes only; no commit, push, or deployment. |
| 20 | Exact files changed | Listed below. |

## Exact files changed

- `src/constants/apiEndpoints.ts`
- `src/features/jobs/api/jobsApi.ts`
- `src/features/jobs/api/jobsApi.test.ts`
- `src/features/jobs/types/jobModels.ts`
- `src/features/jobs/utils/candidateJobSearchParams.ts`
- `src/features/jobs/utils/candidateJobSearchParams.test.ts`
- `src/features/jobs/components/CandidateJobFilters.tsx`
- `src/features/jobs/components/candidateBrowse/ActiveFilterChips.tsx`
- `src/features/jobs/components/candidateBrowse/FacetSelectionFilter.tsx`
- `src/features/jobs/components/candidateBrowse/FacetSelectionFilter.test.tsx` (new)
- `src/pages/CandidateBrowseJobsPage.tsx`
- `src/pages/CandidateBrowseJobsPage.test.tsx`
- `docs/browse-jobs-facet-frontend-report.md` (new)

## Verdict

Validation in progress. No backend contract gap identified from the supplied contract.
