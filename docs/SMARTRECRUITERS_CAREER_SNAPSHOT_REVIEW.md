# SmartRecruiters and career snapshot review

Status: BACKEND_ONBOARDING_CONTRACT_REQUIRED

No commit, push, deployment, or backend edits were performed.

## Registration architecture

`RegisterPage.tsx` submits the four existing account fields through `authService.register`.
`RegistrationResponse` is a message with optional challenge metadata, not an authenticated
session. The page currently announces success and redirects to Login after two seconds.
Google signup uses the existing authorization-code exchange with Register/Login intent,
then dispatches `sessionRefreshed` and navigates to the candidate dashboard or return URL.
`AuthenticationResponse` contains tokens and an authenticated user; neither includes
an account-created flag or onboarding eligibility. Existing authentication WIP was preserved.

## Existing profile contracts

The actual clients are in `src/features/dashboard/api/dashboardApi.ts`, with DTOs in
`src/features/dashboard/types/dashboardModels.ts` and endpoint constants in
`src/constants/apiEndpoints.ts`:

| Endpoint | Existing capability |
| --- | --- |
| GET/PUT `/candidate/onboarding` | CareerStage (Student=1, Fresher=2, Experienced=3), desired opportunities, city, skills array, work preferences (Remote=1, Hybrid=2, OnSite=3), nullable yearsOfExperience, education fields; response includes completedAtUtc |
| GET/PUT `/candidate/profile` | Normal candidate profile, skills array, location and other profile details |
| GET/PUT `/candidate/profile/basic-details` | Current city, structured skills names, Fresher/Experienced work status (no Student value) |
| GET/PUT `/candidate/profile/career-preferences` | preferredJobRoles string array and preferred cities, alongside other preferences |
| GET/POST `/candidate/profile/skills` | Canonical skill records with id, name, optional proficiency and experience |
| PUT/DELETE `/candidate/profile/skills/{skillId}` | Update/delete canonical skills |
| GET `/candidate/profile/completion` | Section completion, percentage and recommended next incomplete section |

The existing Onboarding page is a separate three-step, manually accessible page. It
saves to the real onboarding endpoint. It currently requests opportunity types and
city, supports comma input converted to a skills array, conditional education and
experience, optional work modes, and skipping. It is not wired to account creation.
Profile uses its own basic-details, skills, and career-preferences clients.

## Supported fields and precise remaining contract

Career stage, skills, total years of experience, city, work preferences and completion
timestamp already have onboarding DTO fields. Preferred roles already persist in normal
career preferences; they must not be reinvented as a competing taxonomy. No standardized
candidate role/skill lookup API was found in these profile clients; Profile accepts names.
There is no explicit primary role designation in the onboarding DTO or preference array.

Before a correct automatic Step 2 can ship, the backend contract must establish:

1. Server-owned **new candidate requiring career snapshot** eligibility, distinguishable
   from legacy/existing accounts whose completedAtUtc is also null. Expose this in an
   authenticated account/onboarding response for email and Google accounts. A Google
   Register intent is not proof of creation. Do not gate all existing logins on a null
   completion timestamp.
2. A documented authenticated transition after message-only email registration (or
   eligibility returned after its existing login/verification). No protected onboarding
   write can be made using the current registration response alone.
3. A canonical primary-role representation, preferably reusing preferredJobRoles with
   documented primary semantics, and a safe save/completion sequence across preferences
   and onboarding. Do not mark the snapshot complete if a required profile save fails.
4. Confirm that onboarding reads/writes use the same canonical skills, city, career
   stage and experience as Profile; specifically how Student maps when basic-details
   only permits Fresher/Experienced. Frontend types and cache invalidation alone do
   not prove server-side synchronization. Define month precision if required; the current
   contract only exposes yearsOfExperience.

No new endpoint was invented. No automatic Step 2 redirect, browser-only onboarding
flag, duplicate profile fields, or unpersisted required input was added. Registration
and the existing onboarding page remain operational. The requested lightweight Step 2
is therefore **not implemented** pending these contract decisions. This is a partial
delivery, not FRONTEND_READY_FOR_REVIEW.

## SmartRecruiters

Added AtsType.SmartRecruiters=7 without filling or renumbering reserved value 6.
The Add/Edit selector and list filter include SmartRecruiters. Existing display formatting
uses the enum name. Identifier guidance uses only ExampleCompany and public postings;
no credentials are collected or sent. Identifier is required and rejects URLs, slash,
backslash, query, fragment and C0/C1 control characters. The ordinary career URL
validator is reused; no additional provider-host/security constraints are imposed.
Create/Edit, Active, Auto Publish and Run Now reuse the existing requests and rules.
No provider-specific Run Now code was added. There is no connection-test API/UI in
the existing source client, so no connection-test endpoint was invented.

Company website/logo are company-owned metadata, absent from SaveJobSourceRequest.
The SmartRecruiters source form reads these through the existing company-details API
and displays read-only Company Website and Logo URL fields. They remain editable in
company administration. They are not added to the source DTO or overwritten by source saves.

## Changed files

- src/features/admin/types/jobSourceModels.ts
- src/features/admin/validation/jobSourceConfiguration.ts
- src/features/admin/validation/jobSourceSchema.ts
- src/features/admin/components/JobSourceFormDialog.tsx
- src/pages/admin/AdminJobSourcesPage.tsx
- src/features/admin/validation/jobSourceSchema.test.ts
- src/features/admin/components/JobSourceFormDialog.test.tsx
- src/features/admin/api/jobSourcesApi.test.ts
- src/pages/admin/AdminJobSourcesPage.test.tsx
- docs/SMARTRECRUITERS_CAREER_SNAPSHOT_REVIEW.md

## Validation

- Strict TypeScript (`npm run typecheck`): passed.
- ESLint for all nine changed TypeScript/TSX source/test files: passed after removing
  a redundant numeric assertion and comparing numeric select values consistently.
- `git diff --check`: passed (Git prints only LF/CRLF conversion notices).
- Focused admin run, one worker: **122/122 passed in four files**. Covers exact create/
  update DTOs, SmartRecruiters create/edit, malformed identifiers, Run Now eligibility,
  existing Workday and Custom behavior. Final SmartRecruiters rerun after metadata/filter
  additions: **3 passed**, 52 unrelated tests skipped by the name filter, two files passed.
- Authentication/Profile/onboarding/dashboard API regression rerun, one worker:
  **78 passed, 12 failed**, three files failed and two passed. Google/password compatibility
  passed all six tests. Failures include the Student onboarding timeout, Profile UI test
  timeouts, and auth tests expecting mobile OTP UI amid existing authentication WIP.
  These areas were not changed. No passing claim is made for the full regression suite.
- Initial broad parallel run: 146 passed, 44 failed, five unhandled errors. This run
  had extensive timeouts, worker RPC failures and jsdom teardown errors. It is not
  counted as successful regression validation. Existing assertions/timeouts were not weakened.
- Initial production build: TypeScript completed; Vite transformed 12,100 modules,
  then esbuild terminated with `write EPIPE` while processing InterviewInsightsPage.tsx.
  The final `npm run build` retry **passed**, including strict TypeScript compilation
  and production asset generation. Vite emitted its chunk-size advisory.

Logs (ignored build artifacts) are available locally at:
`artifacts/smartrecruiters-tests.log`, `artifacts/smartrecruiters-final-tests.log`,
`artifacts/career-snapshot-regression-tests.log`, and `artifacts/smartrecruiters-build.log`.

## Working tree

The following status includes five pre-existing authentication WIP files and the
pre-existing untracked resume-matches-files.txt; these were not edited by this task.

```text
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
 M src/pages/LoginPage.tsx
 M src/pages/admin/AdminJobSourcesPage.test.tsx
 M src/pages/admin/AdminJobSourcesPage.tsx
?? docs/SMARTRECRUITERS_CAREER_SNAPSHOT_REVIEW.md
?? resume-matches-files.txt
```
