# Career Snapshot frontend review

**FRONTEND_CAREER_SNAPSHOT_READY_FOR_REVIEW**

This continues the existing SmartRecruiters work. No commit, push, deployment, or backend
modification was performed. The older SmartRecruiters report records the earlier blocker;
this report supersedes its onboarding conclusions.

## Backend contract verified

Read-only source: `C:\Users\Ashish\Documents\Codex\2026-07-27\career-snapshot-backend-review`.
`git rev-parse HEAD` returned `4b0e53b94c77e4ac41191702f6359d958ece56f6`.

Inspected AuthenticationDtos.cs, AuthService.cs, GoogleAuthenticationService.cs,
AuthController.cs, CareerSnapshotContract.cs, CandidateDtos.cs, CandidateService.cs,
the domain enums, CandidateController.cs, Program.cs, CareerSnapshotTests.cs,
CareerSnapshotPostgresTests.cs, AuthenticationTests.cs, and GoogleAuthenticationTests.cs.

- `POST /api/auth/register`: unwrapped `{ message, authentication }`.
  Authentication is nullable; when present it contains access/refresh tokens, their expiry
  timestamps, and `user`. No second password login is performed.
- Login/refresh authentication is unwrapped. Google authorization-code authentication
  remains the existing `{ data: authentication, message }` envelope.
- `user` has `id`, `email`, `firstName`, `lastName`, `role`, and boolean
  `careerSnapshotRequired`. JSON uses ASP.NET Web camelCase. Existing Google linking/login
  does not enable the flag. Authentication types tolerate absent legacy flag data;
  only an explicit server `true` requires setup.
- `CareerStage`: numeric Student=1, Fresher=2, Experienced=3.
- `WorkPreference`: numeric Remote=1, Hybrid=2, OnSite=3.
- `PUT /api/candidate/profile/career-snapshot`: returns
  `ApiResponse<CandidateProfileResponse>` (`data` contains the canonical profile).
- Request accepts only `careerStage`, `primaryRole`, `skills`, `workPreferences`,
  `yearsOfExperience`, and `city`; user identity comes from JWT.
- Primary role: required string, max 100, no controls/comma, not literal Other.
  Skills: required array of 1–20 nonempty names, each max 100 with no controls.
  Work preferences: required array, possibly empty, at most three distinct numeric values.
  Experience: nullable decimal, required for Experienced, 0–50, max one decimal place.
  City: nullable; when supplied, nonempty, max 150 and no controls. Null preserves the city.

Example exact request (API client base URL already includes `/api`):

```json
{
  "careerStage": 3,
  "primaryRole": ".NET Developer",
  "skills": ["C#", "ASP.NET Core"],
  "workPreferences": [1, 2],
  "yearsOfExperience": 4.2,
  "city": "Pune"
}
```

`CandidateProfileResponse` retains its existing identity/profile/basic-details/
career-preference fields and adds `careerSnapshotRequired`, nullable `primaryRole`,
nullable `careerStage`, nullable `yearsOfExperience`, and nullable `workPreferences`.

## Account transitions and routing

1. Email Step 1 keeps full name, email, password, mobile and existing legal/navigation
   controls. `authService.register` installs the returned credentials. RegisterPage applies
   that session and goes directly to `/career-snapshot` for a required Candidate, otherwise
   its existing safe return/default destination. Nullable message-only responses keep the
   existing delayed Login fallback; they do not trigger a second login.
2. Google signup/login uses its existing code exchange and conflict handling. Both Register
   and Login inspect the returned user flag, never provider intent or profile completeness.
3. Password login uses the same destination helper. Existing initializeAuth/refresh and
   session-refreshed events retain the server user DTO, including eligibility.
4. `CareerSnapshotGuard` is the single redirect implementation shared by CandidateRoute
   and ProtectedRoute, after their authentication checks. It gates only a Candidate with
   flag `true`, exempts the snapshot pathname, and preserves a safe requested destination.
   Admin/Employer/public routes are unaffected. GuestRoute also uses the shared destination
   helper when an authenticated candidate visits Login/Register.
5. A completed candidate visiting `/career-snapshot` returns to the normal destination.
   A fresh canonical profile read confirming false can reconcile a stale true auth session.

## Step 2 screen

`/career-snapshot` uses the public layout with a desktop benefits panel and a compact form;
the benefits panel hides on mobile and the form uses responsive spacing/full-width inputs.

- Required career-stage radios use the verified enum.
- Required Primary role is a free-text searchable MUI Autocomplete using existing preferred
  roles as suggestions. A custom specific role is accepted; literal Other is rejected with
  guidance. There is no new role taxonomy.
- Required Skills uses MUI multiple/freeSolo Autocomplete chips and the canonical profile
  skill names as suggestions. Names are sent as an array, never a comma-separated string.
- Experience appears only for Experienced, using the existing decimal years representation.
  Switching to Student/Fresher sends null even if an experienced value remains in form state.
  No month-to-decimal rounding is introduced.
- Optional Current city uses the shared `indianCities` reference data and permits custom cities.
- Optional Remote/Hybrid/On-site checkboxes send the existing numeric work preferences.
- No salary, identity documents, education history, resume or other lengthy fields are added.

The form hydrates once, so cache refetches do not erase pending/failed edits. While saving,
controls disable and a synchronous in-flight ref prevents duplicate PUTs. API field errors
use the existing validation mapper. Failure keeps the form/eligibility and permits retry.

## Canonical synchronization

Exactly one PUT performs the save. The server transaction writes career stage/work status,
the first preferred role, structured CandidateSkills (preserving existing metadata),
experience, city/location, work preferences, completion timestamp, and the false flag.
The backend tests explicitly cover fresh-context reads, rollback, skill edits and refreshed
authentication. This frontend does not maintain another candidate data store.

After a matching profile response explicitly confirms `careerSnapshotRequired === false`,
the frontend seeds getProfile with that response, invalidates Profile/BasicDetails/Skills/
CareerPreferences/Completion/Onboarding query tags, updates the current auth user flag, and
returns to the normal candidate destination. It never completes optimistically.

Normal Profile retains its existing skill/role editors and gains a read-only canonical
career summary for stage, primary role, experience, city and work mode. Existing profile
skills and career preferences continue to be the editable canonical values. Editing career
preferences also invalidates Profile so the first preferred role immediately refreshes the
summary instead of leaving a cached primary-role label.

## SmartRecruiters

All prior enum=7, identifier/help, create/edit, filtering, Run Now, read-only website/logo
fields and tests are preserved. No credentials or special Run Now behavior were introduced.

## Validation and failure classification

The pre-change broader baseline was **82 passed / 8 failed** across five files, captured
in `artifacts/career-snapshot-baseline.log`. A copy of the pre-edit src tree is retained under
ignored `artifacts/career-snapshot-baseline/src` for isolated reproduction. The earlier turn's
78/12 result was not assumed to be the exact baseline for this run.

Initial snapshot/schema focused run after fixture corrections: **40/40 passed**.
Final checks after central guard consolidation are recorded below when complete.

Tests use the actual frontend API clients against mocked HTTP responses matching the verified
backend contract. These are deterministic integration tests, not live production account creation.

## Files and working tree

This continuation changes these 22 source/test files:

```text
src/constants/apiEndpoints.ts
src/constants/routes.ts
src/features/auth/services/authService.ts
src/features/auth/store/authSlice.ts
src/features/auth/types/authModels.ts
src/features/auth/utils/careerSnapshotRouting.ts
src/features/dashboard/api/dashboardApi.ts
src/features/dashboard/components/CandidateCareerSnapshotSummary.tsx
src/features/dashboard/types/dashboardModels.ts
src/features/dashboard/validation/careerSnapshotSchema.ts
src/features/dashboard/validation/careerSnapshotSchema.test.ts
src/pages/CareerSnapshotPage.tsx
src/pages/careerSnapshot.flow.test.tsx
src/pages/LoginPage.tsx
src/pages/ProfilePage.tsx
src/pages/RegisterPage.tsx
src/routes/CandidateRoute.tsx
src/routes/CareerSnapshotGuard.tsx
src/routes/GuestRoute.tsx
src/routes/ProtectedRoute.tsx
src/routes/routeConfig.tsx
src/types/auth.ts
```

It also adds this report. The nine SmartRecruiters source/test modifications from the
previous turn are preserved. Pre-existing `authErrorMapper.ts`, `authService.test.ts`,
and `resume-matches-files.txt` are untouched; existing login cancellation/single-flight
WIP in authService/authSlice/LoginPage is preserved while adding the snapshot behavior.
Hash comparison confirmed all nine SmartRecruiters files plus authErrorMapper.ts and
authService.test.ts exactly match the pre-edit copy (11/11 preserved files).

## Final check results

| Check | Result |
| --- | --- |
| Final snapshot + schema + all source-form tests | **54 passed / 54**, three files |
| Snapshot subset of that run | **40 passed / 40**, two files |
| Existing routing tests | **26 passed** (17 route guards + 9 route configuration) |
| SmartRecruiters/source regression checks | Admin page 41 passed; source schema 60 passed; source API 8 passed in broader run; all 14 form tests passed in final focused rerun |
| TypeScript strict typecheck | Final `npm run typecheck` passed, exit 0, after all code/test changes |
| ESLint on all 33 changed TS/TSX files, including existing WIP | Passed, exit 0 |
| `npm run build` | Passed, exit 0; Vite completed with its existing chunk-size/SignalR annotation advisories |
| `git diff --check` | Passed; only Git LF/CRLF notices |
| Broad requested regression run, 14 files | **225 passed / 22 failed**, one worker RPC error; not a passing full-suite result |
| Lower-load full Profile rerun, 45 tests | **39 passed / 6 failed**: five reproduced baseline failures plus one About test timeout |

The broad run also passed Google/password compatibility (6), Google button (2), existing
onboarding (5), dashboard API (12), auth state (2), and auth service tests. Source-form
and snapshot tests that timed out during concurrent compiler/build verification passed
in the final lower-load 54-test run. Assertions and timeouts were not weakened.

## Regression classification

**BASELINE_EXISTING — six persistent failures**, reproduced using the copied pre-change
source and again using current source with the same six test names:

1. Auth: creates a Candidate session after mobile OTP login (existing Login has no such input).
2. Profile: saves the exact Career Preferences payload, refetches, and displays the persisted response.
3. Profile: enforces Career Preferences chip limits, prevents duplicates, and supports removal.
4. Profile: adds education using the exact canonical API payload.
5. Profile: blocks invalid education client data before saving.
6. Profile: keeps the education dialog open and shows a safe backend save error.

Baseline reproduction: five Profile failures/40 tests skipped, plus one OTP failure/21
tests skipped in a separate baseline run. Current reproduction: the identical six failures,
61 unrelated tests skipped. These existing tests were not edited to make them pass.

**BASELINE_EXISTING — resource-sensitive test/infrastructure failures:** the other 16 broad
failures were existing Profile/source-form UI waits and timeouts during concurrent checking,
with an accompanying worker RPC timeout. All three affected source-form cases passed in the
14-test rerun. All 13 affected Profile cases passed in the full lower-load Profile rerun;
that rerun instead had a timeout in a different unchanged About test, separately checked below.

The About test (`prepopulates and submits the exact trimmed about request`) subsequently
passed unchanged in isolation on **both** the copied baseline and current source: one
passed/44 skipped in each run. Logs: `career-snapshot-baseline-about.log` and
`career-snapshot-current-about.log`. Thus all 45 Profile tests have been accounted for:
40 passed across the lower-load checks and the same five persistent baseline failures.

**CAREER_SNAPSHOT_REGRESSION:** none detected in the final 40 snapshot/schema tests or
26 routing tests. The full existing suite remains red due to the failures above; readiness
is not a claim that all repository tests are green.

Logs are retained in ignored `artifacts/`: `career-snapshot-final-verification.log`,
`career-snapshot-regressions-final.log`, `career-snapshot-baseline.log`,
`career-snapshot-baseline-reproduction.log`, `career-snapshot-baseline-otp-reproduction.log`,
`career-snapshot-current-reproduction.log`, `career-snapshot-profile-isolated.log`,
`career-snapshot-all-changed-eslint.log`, `career-snapshot-typecheck.log`, and
`career-snapshot-build-final.log`. The first baseline reproduction had a harness alias
error for the OTP file; that harness was fixed and OTP was then independently reproduced.
The final explicit typecheck log is `career-snapshot-typecheck-final.log`.

## Final git status --short

```text
 M src/constants/apiEndpoints.ts
 M src/constants/routes.ts
 M src/features/admin/api/jobSourcesApi.test.ts
 M src/features/admin/components/JobSourceFormDialog.test.tsx
 M src/features/admin/components/JobSourceFormDialog.tsx
 M src/features/admin/types/jobSourceModels.ts
 M src/features/admin/validation/jobSourceConfiguration.ts
 M src/features/admin/validation/jobSourceSchema.test.ts
 M src/features/admin/validation/jobSourceSchema.ts
 M src/features/auth/services/authErrorMapper.ts
 M src/features/auth/services/authService.test.ts
 M src/features/auth/services/authService.ts
 M src/features/auth/store/authSlice.ts
 M src/features/auth/types/authModels.ts
 M src/features/dashboard/api/dashboardApi.ts
 M src/features/dashboard/types/dashboardModels.ts
 M src/pages/LoginPage.tsx
 M src/pages/ProfilePage.tsx
 M src/pages/RegisterPage.tsx
 M src/pages/admin/AdminJobSourcesPage.test.tsx
 M src/pages/admin/AdminJobSourcesPage.tsx
 M src/routes/CandidateRoute.tsx
 M src/routes/GuestRoute.tsx
 M src/routes/ProtectedRoute.tsx
 M src/routes/routeConfig.tsx
 M src/types/auth.ts
?? docs/CAREER_SNAPSHOT_FRONTEND_REVIEW.md
?? docs/SMARTRECRUITERS_CAREER_SNAPSHOT_REVIEW.md
?? resume-matches-files.txt
?? src/features/auth/utils/careerSnapshotRouting.ts
?? src/features/dashboard/components/CandidateCareerSnapshotSummary.tsx
?? src/features/dashboard/validation/careerSnapshotSchema.test.ts
?? src/features/dashboard/validation/careerSnapshotSchema.ts
?? src/pages/CareerSnapshotPage.tsx
?? src/pages/careerSnapshot.flow.test.tsx
?? src/routes/CareerSnapshotGuard.tsx
```
