# Career Snapshot final pre-commit audit

Audit date: 2026-10-21. Backend read only at `4b0e53b94c77e4ac41191702f6359d958ece56f6`. No commit, staging, push, deployment, reset, clean or backend modification was performed.

## Contract and authentication

The backend AuthenticationDtos, AuthService, GoogleAuthenticationService, AuthController, CareerSnapshotContract, CandidateDtos, CandidateService, CandidateContracts, CandidateController, User, serialization setup and authentication/snapshot tests were inspected directly. Default ASP.NET Web JSON uses camelCase and numeric enums here; only the separate Google intent has an explicit string converter.

Email registration returns the unwrapped `{ message, authentication }` envelope. Authentication is nullable for legacy/non-authenticated outcomes. A successful new registration establishes auth directly from the returned authentication; no second login. Google returns its authentication through the normal data envelope. Login and refresh use the authenticated User DTO's `careerSnapshotRequired`. No separately persisted eligibility flag exists. Password stays in form/request memory and is not written to browser storage or navigation state. Token storage contains refresh credentials/expiry; phone challenge storage contains challenge metadata, not password.

Candidate guards apply only when role is Candidate and server flag is exactly true. They await auth initialization, exempt the onboarding path, preserve intended location and protect both candidate-only and shared protected routes. Public routes and admin/employer access remain unaffected. Existing candidates with false/missing flags are not judged from apparent profile completeness. Completed users leave onboarding. Safe destination handling prevents loops through login/register/onboarding.

## Exact PUT contract

PUT `/api/candidate/profile/career-snapshot`, with the authenticated identity determined by the backend, no UserId:

```json
{"careerStage":3,"primaryRole":".NET Developer","skills":["C#","ASP.NET Core"],"yearsOfExperience":4.2,"city":"Pune","workPreferences":[1,2]}
```

All six properties are sent. CareerStage: Student=1, Fresher=2, Experienced=3. WorkPreference: Remote=1, Hybrid=2, OnSite=3. PrimaryRole is a required string, not an object or enum; trimmed, maximum 100 characters, no commas/control characters or literal Other. Skills is a required string array with 1–20 entries, maximum 100 characters each, trimmed/deduplicated. WorkPreferences is a nonnull array, maximum three distinct numeric values (checkbox UI ensures uniqueness). Experienced requires decimal experience from 0 through 50 with at most one decimal place; Student/Fresher send null regardless of stale input. City is nullable, maximum 150 characters and control-free; blank sends null, preserving an existing backend city. Omitted values are not used as an alternate contract.

PUT returns ApiResponse<CandidateProfileResponse>. Save checks matching user id and explicit server `careerSnapshotRequired=false`, updates canonical getProfile cache and auth state from that response, then continues to the safe intended destination. A fresh canonical profile with explicit false also reconciles stale auth. Failure preserves form values, displays errors, stays on onboarding and allows retry. A synchronous submission ref and disabled controls prevent duplicate requests. Added audit coverage checks query/hash destination preservation and late-save account/unmount isolation; no production changes were needed.

Profile reuses the same canonical skills/career preferences/basic details. Its snapshot summary displays career stage, primary role, experience, city and work modes; existing skills display remains canonical. No parallel persistent profile store was introduced.

## Full suite and failure evidence

The actual full suite ran all 132 files: 1450 passed, 31 failed, zero skipped (1481 tests). This supersedes the historical 225/22 result, which covered only 14 selected files. Raw output: `artifacts/career-snapshot-final-audit-full.json`.

Classification: A=29, B=0, C=0, D=2, E=0; no collection failures. Six historical persistent failures were reproduced against the preserved pre-Snapshot source copy. The other 23 baseline failures were freshly reproduced against Git HEAD, excluding Snapshot, SmartRecruiters and unrelated auth WIP; all 23 have the same first failure message as the current full run. Assertions/timeouts were not weakened.

Two referral tests failed in the full run and passed unchanged in the HEAD baseline and three independent current replays. Evidence supports timing/order/environment sensitivity; the exact scheduling cause has not been established. It is not claimed that one passing replay proves flakiness. The support route timeout remains classified A because it reproduces consistently in baseline; the production heading exists.

All prior 22 failures are individually accounted for in `artifacts/career-snapshot-final-audit/previous-22-ledger.md`: six baseline reproductions and 16 tests each passing three independent current replays (48 passes), also passing in the new full run. Their earlier failures are distinct from the two current flaky failures.

### Every current full-suite failure

| Class | File | Test | Evidence |
|---|---|---|---|
| A | src/layouts/AdminDashboardLayout.test.ts | adminNavigationItems uses the expected admin navigation order | Reproduced against Git HEAD without Snapshot, SmartRecruiters or auth WIP; same first failure message. |
| A | src/layouts/UserDashboardLayout.test.ts | candidate navigation integrates referral navigation with the candidate workspace | Reproduced against Git HEAD without Snapshot, SmartRecruiters or auth WIP; same first failure message. |
| A | src/pages/authPages.test.tsx | mobile authentication pages creates a Candidate session after mobile OTP login | Fresh pre-Career-Snapshot baseline reproduction |
| A | src/pages/CandidateBrowseJobsPage.test.tsx | Candidate Browse jobs restores cross-facet selections from shared URLs and synchronizes chips, back and forward | Reproduced against Git HEAD without Snapshot, SmartRecruiters or auth WIP; same first failure message. |
| A | src/pages/CandidateBrowseJobsPage.test.tsx | Candidate Browse jobs preserves existing facets while refetching and does not depend on supplemental counts | Reproduced against Git HEAD without Snapshot, SmartRecruiters or auth WIP; same first failure message. |
| A | src/pages/CandidateBrowseJobsPage.test.tsx | Candidate Browse jobs hides empty string facets without hiding job results | Reproduced against Git HEAD without Snapshot, SmartRecruiters or auth WIP; same first failure message. |
| A | src/pages/CandidateBrowseJobsPage.test.tsx | Candidate Browse jobs keeps selected facets in the URL and renders exact backend counts | Reproduced against Git HEAD without Snapshot, SmartRecruiters or auth WIP; same first failure message. |
| A | src/pages/CandidateBrowseJobsPage.test.tsx | Candidate Browse jobs uses backend role values for multi-select and removes stale company-name state | Reproduced against Git HEAD without Snapshot, SmartRecruiters or auth WIP; same first failure message. |
| A | src/pages/CandidateBrowseJobsPage.test.tsx | Candidate Browse jobs opens and closes the responsive filter drawer | Reproduced against Git HEAD without Snapshot, SmartRecruiters or auth WIP; same first failure message. |
| A | src/pages/CandidateBrowseJobsPage.test.tsx | Candidate Browse jobs renders the redesigned filter groups and supports individual removal and Clear all | Reproduced against Git HEAD without Snapshot, SmartRecruiters or auth WIP; same first failure message. |
| A | src/pages/CandidateBrowseJobsPage.test.tsx | Candidate Browse jobs commits accessible experience and annual-salary sliders using backend units | Reproduced against Git HEAD without Snapshot, SmartRecruiters or auth WIP; same first failure message. |
| A | src/pages/CandidateBrowseJobsPage.test.tsx | Candidate Browse jobs uses temporary View more selections and applies them once | Reproduced against Git HEAD without Snapshot, SmartRecruiters or auth WIP; same first failure message. |
| A | src/pages/CandidateBrowseJobsPage.test.tsx | Candidate Browse jobs renders backend location and education labels without changing query values or summing counts | Reproduced against Git HEAD without Snapshot, SmartRecruiters or auth WIP; same first failure message. |
| A | src/pages/CandidateBrowseJobsPage.test.tsx | Candidate Browse jobs collapses and restores the desktop filters without clearing selected values | Reproduced against Git HEAD without Snapshot, SmartRecruiters or auth WIP; same first failure message. |
| A | src/pages/jobPages.test.tsx | job details page opens AI Resume Tailor for the real backend job without changing existing actions | Reproduced against Git HEAD without Snapshot, SmartRecruiters or auth WIP; same first failure message. |
| A | src/pages/PortfolioPage.test.tsx | Portfolio workspace renders the candidate workspace header and dedicated URL-backed tabs | Reproduced against Git HEAD without Snapshot, SmartRecruiters or auth WIP; same first failure message. |
| A | src/pages/PortfolioPage.test.tsx | Portfolio workspace opens the unified profile editor on Basic details | Reproduced against Git HEAD without Snapshot, SmartRecruiters or auth WIP; same first failure message. |
| A | src/pages/PortfolioPage.test.tsx | Portfolio workspace keeps Draft when the backend rejects publication requirements and names them | Reproduced against Git HEAD without Snapshot, SmartRecruiters or auth WIP; same first failure message. |
| A | src/pages/PortfolioPage.test.tsx | Portfolio workspace surfaces a safe publication failure without reporting success | Reproduced against Git HEAD without Snapshot, SmartRecruiters or auth WIP; same first failure message. |
| A | src/pages/PortfolioPage.test.tsx | Portfolio workspace shows published URL actions and requires confirmation before unpublishing | Reproduced against Git HEAD without Snapshot, SmartRecruiters or auth WIP; same first failure message. |
| A | src/pages/ProfilePage.test.tsx | Candidate profile workspace saves the exact Career Preferences payload, refetches, and displays the persisted response | Fresh pre-Career-Snapshot baseline reproduction |
| A | src/pages/ProfilePage.test.tsx | Candidate profile workspace enforces Career Preferences chip limits, prevents duplicates, and supports removal | Fresh pre-Career-Snapshot baseline reproduction |
| A | src/pages/ProfilePage.test.tsx | Candidate profile workspace adds education using the exact canonical API payload | Fresh pre-Career-Snapshot baseline reproduction |
| A | src/pages/ProfilePage.test.tsx | Candidate profile workspace blocks invalid education client data before saving | Fresh pre-Career-Snapshot baseline reproduction |
| A | src/pages/ProfilePage.test.tsx | Candidate profile workspace keeps the education dialog open and shows a safe backend save error | Fresh pre-Career-Snapshot baseline reproduction |
| D | src/pages/referralMarketplace.test.tsx | Phase 2 referral regressions prevents duplicate wizard submissions and allows retry after failure | Full run failed; HEAD baseline and three independent current targeted replays passed unchanged. Timing/order sensitivity; exact scheduling cause not established. |
| D | src/pages/referralMarketplace.test.tsx | referral hotfix request contract sends backend numeric employment type for Contract | Full run failed; HEAD baseline and three independent current targeted replays passed unchanged. Timing/order sensitivity; exact scheduling cause not established. |
| A | src/pages/admin/adminManagementPages.test.tsx | Administrator company and category management opens the companies CSV import dialog beside the add action | Reproduced against Git HEAD without Snapshot, SmartRecruiters or auth WIP; same first failure message. |
| A | src/pages/admin/adminPages.test.tsx | admin job forms renders edit loading and submits the required private application URL | Reproduced against Git HEAD without Snapshot, SmartRecruiters or auth WIP; same first failure message. |
| A | src/pages/admin/adminPages.test.tsx | admin job forms prevents simultaneous form submissions | Reproduced against Git HEAD without Snapshot, SmartRecruiters or auth WIP; same first failure message. |
| A | src/features/support/admin/adminSupport.test.tsx | admin support integration real Administrator route and sidebar expose support between Payments and Audit logs | Reproduced against Git HEAD without Snapshot, SmartRecruiters or auth WIP; same first failure message. |

## Commit separation and artifact hygiene

A review-only Snapshot patch was built from HEAD plus the pre-Snapshot-to-current delta across exactly 22 files, with zero merge conflicts. It excludes all SmartRecruiters and unrelated auth hunks. A read-only git apply check against the HEAD artifact succeeded; no staging occurred. The isolated tree passed 68 Snapshot/routing tests. The later strengthening of the race test adds an event-loop turn before assertions and also passes in the working tree. Patch: artifacts/career-snapshot-final-audit/career-snapshot-only.patch.

Only Snapshot hunks in the shared authService.ts, authSlice.ts and LoginPage.tsx belong to Snapshot; do not stage those whole files indiscriminately. Eleven SmartRecruiters/unrelated auth files hash-match their preserved pre-Snapshot copies.

Career Snapshot eventual source/test scope:

- src/constants/apiEndpoints.ts
- src/constants/routes.ts
- src/features/auth/services/authService.ts
- src/features/auth/store/authSlice.ts
- src/features/auth/types/authModels.ts
- src/features/auth/utils/careerSnapshotRouting.ts
- src/features/dashboard/api/dashboardApi.ts
- src/features/dashboard/components/CandidateCareerSnapshotSummary.tsx
- src/features/dashboard/types/dashboardModels.ts
- src/features/dashboard/validation/careerSnapshotSchema.ts
- src/features/dashboard/validation/careerSnapshotSchema.test.ts
- src/pages/CareerSnapshotPage.tsx
- src/pages/careerSnapshot.flow.test.tsx
- src/pages/LoginPage.tsx
- src/pages/ProfilePage.tsx
- src/pages/RegisterPage.tsx
- src/routes/CandidateRoute.tsx
- src/routes/CareerSnapshotGuard.tsx
- src/routes/GuestRoute.tsx
- src/routes/ProtectedRoute.tsx
- src/routes/routeConfig.tsx
- src/types/auth.ts

SmartRecruiters separate scope:

- src/features/admin/api/jobSourcesApi.test.ts
- src/features/admin/components/JobSourceFormDialog.test.tsx
- src/features/admin/components/JobSourceFormDialog.tsx
- src/features/admin/types/jobSourceModels.ts
- src/features/admin/validation/jobSourceConfiguration.ts
- src/features/admin/validation/jobSourceSchema.test.ts
- src/features/admin/validation/jobSourceSchema.ts
- src/pages/admin/AdminJobSourcesPage.test.tsx
- src/pages/admin/AdminJobSourcesPage.tsx

Unrelated WIP: authErrorMapper.ts, authService.test.ts, and cancellation/single-flight hunks in authService.ts, authSlice.ts and LoginPage.tsx; resume-matches-files.txt. Preserved.

Review-only: docs/CAREER_SNAPSHOT_FRONTEND_REVIEW.md, docs/SMARTRECRUITERS_CAREER_SNAPSHOT_REVIEW.md, this audit report, and artifacts/career-snapshot-* (baseline/HEAD/isolated source copies, temporary vite.baseline.config.ts, ZIP, scripts, patch, logs and JSON). The artifacts directory is ignored by .gitignore line 21, has no tracked entries and contains verification inputs rather than runtime dependencies. Do not include those artifacts in a production commit. No unrelated file was deleted.

## Validation commands and evidence

Full: node node_modules/vitest/vitest.mjs run --maxWorkers=1 --no-file-parallelism --reporter=json (full 132-file discovery). Focused rerun uses the same flags and the Snapshot/schema/routing/auth/Google/authService/authSlice/Google-button/SmartRecruiters files. No retries, weakened assertions or extended test timeouts. Exact per-case results are preserved in JSON.

Final focused output: artifacts/career-snapshot-final-audit/final-focused.json. Final static checks: npm run typecheck; changed-file ESLint across all modified/untracked nonignored TS/TSX; npm run build; git diff --check; git status --short. Results appended below after completion.

Fresh focused rerun: Snapshot 42 passed; routing 26 passed; auth 35 passed / 1 baseline mobile OTP failure; SmartRecruiters 123 passed. Combined 226 passed / 1 failed / 0 skipped.
Final static checks: strict typecheck PASS; changed-file ESLint PASS (33 files); production build PASS; git diff --check PASS. The first build attempt inherited the tests' localhost VITE_API_BASE_URL and was correctly rejected by production configuration validation; removing that process override and using the repository production environment produced a successful build (Vite 1m42s). No source or config workaround was made.

Final decision: safe to commit the Career Snapshot scope separately, using only its hunks in the three shared auth files. Full suite is not green: 29 proved baseline failures and two repeatedly demonstrated timing/order-sensitive referral failures remain. Zero Snapshot regressions, zero SmartRecruiters regressions, zero unknown failures. This audit added two focused regression cases and the report only. Do not include temporary artifacts or unrelated WIP. Index empty; no commit/push/deploy.
