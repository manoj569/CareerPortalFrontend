# RippleHire frontend integration

The existing Admin → Job Sources page and Add/Edit dialog support RippleHire. No backend code, dependencies, separate provider page, push or deployment was added.

## Contract inspected

Read the local backend at `C:/Users/Ashish/Documents/Codex/2026-07-27/you-are-a-principal-net-9`:

- `JobPortal.Domain/Enums/DomainEnums.cs`: `AtsType.RippleHire = 8`.
- `JobPortal.Application/Features/JobAggregation/RippleHireSourceConfiguration.cs` and `docs/RIPPLEHIRE_INTEGRATION.md`: supported public URL and token validation.
- `JobPortal.API/Controllers/AdminJobSourcesController.cs`: existing CRUD, connection-test and durable run routes.
- `JobPortal.Application/Abstractions/Jobs/IJobSourceConnectionTester.cs`: connection response flags, reason, message and HTTP status.
- `JobPortal.Application/Features/JobAggregation/JobSourceRunService.cs`: returned `updated` counter.

## Form and payload

RippleHire is appended to the existing provider dropdown and ATS table filter; all earlier options retain their order and numeric mapping. The standard company, career URL, optional ATS identifier, activation, Auto Publish and scan interval fields are reused. Edit mode preserves saved configuration. No new configuration properties are required.

Example create/update body (illustrative, not an executed request):

```json
{
  "companyId": "<existing-company-guid>",
  "careerPageUrl": "https://example.ripplehire.com/candidate/?token=public-career-token&lang=en",
  "atsType": 8,
  "atsIdentifier": null,
  "isActive": true,
  "autoPublishEnabled": false,
  "scanIntervalMinutes": 720
}
```

Only the public HTTPS tenant `/candidate/` root with exactly one safe public career token, optional `source`, and optional `lang=en` is supported. The identifier can be omitted or must match that token. Custom domains, legacy paths, job fragments, encoded characters, unknown/duplicate query keys, non-English languages and non-default ports are rejected. Help text cautions against private candidate links and unverified URL variants. Backend validation remains authoritative.

## Connection and synchronization

The shared RTK Query API now exposes the existing `POST /admin/job-sources/{id}/test` endpoint, using existing authentication and error handling. A Test Connection action operates on the saved source. Save additions/edits first. All three backend flags (`configurationValid`, `providerReachable`, `listingReachable`) must be explicitly true and the provider must match before success is shown. The dialog displays the actual backend message, reason code and optional status. Empty results are errors. The existing action lock prevents repeated submissions and the request is cancelled on unmount/account change.

Run Now retains `POST /admin/job-sources/{id}/run` and authenticated GET polling at `/admin/job-sources/{id}/runs/{runId}`. Queue acceptance does not imply success. Existing status, last-run timestamps, total received, created, matched, skipped and errors remain available; `Updated` is displayed only when returned. Activation still uses the existing detail fetch and PUT update. Existing edit/detail loading and source management UI are reused.

The frontend previously omitted `updated` from its run model; this is now optional for compatibility with existing responses. No other RippleHire contract mismatch was found. The backend documentation's example omits some fields present in the actual run DTO, so the actual DTO was used.

## Modified files

- `src/features/admin/types/jobSourceModels.ts`
- `src/features/admin/validation/jobSourceConfiguration.ts`
- `src/features/admin/validation/jobSourceSchema.ts`
- `src/features/admin/components/JobSourceFormDialog.tsx`
- `src/features/admin/api/jobSourcesApi.ts`
- `src/pages/admin/AdminJobSourcesPage.tsx`
- Corresponding schema, form, API and page test files.
- This report.

## Automated verification

- Five focused suites: 161 tests passed (schema, form, API, admin page and durable run monitoring).
- Additional existing-RippleHire edit/save test: 1 passed, giving 162 passing tests across the executed checks.
- Scoped ESLint on all ten changed TypeScript/test files passed.
- `git diff --check` passed.
- `npm run build` passed, including TypeScript compilation and the Vite production bundle. Vite reported SignalR dependency annotation and large-chunk warnings.

The tests use mocked API responses. They verify numeric create/update serialization, URL-derived creation, edit preservation, supported and unsupported URL forms, source table display, connection success/failure/empty responses, duplicate-test prevention, and existing provider/run regressions.

## Remaining manual verification

Against a running backend containing this contract, sign in as an administrator and use an approved test company and its public employer career token. Create and reload a RippleHire source; edit its settings; test a valid and invalid connection; run synchronization and observe status polling and actual counters; verify returned jobs; toggle activation; and check responsive layout. No authenticated live API connection, employer synchronization or live import is claimed by the frontend tests.
