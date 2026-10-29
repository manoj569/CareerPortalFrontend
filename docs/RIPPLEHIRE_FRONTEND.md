# RippleHire frontend integration

The existing Admin → Job Sources page and Add/Edit dialog support RippleHire. No backend code, dependencies, separate provider page, push or deployment was added.

## Contract inspected

Read the local backend at `C:/Users/Ashish/Documents/Codex/2026-07-27/you-are-a-principal-net-9`:

- `JobPortal.Domain/Enums/DomainEnums.cs`: `AtsType.RippleHire = 8`.
- `JobPortal.Application/Features/JobAggregation/RippleHireSourceConfiguration.cs` and `docs/RIPPLEHIRE_INTEGRATION.md`: supported public URL and token validation.
- `JobPortal.API/Controllers/AdminJobSourcesController.cs`: existing CRUD, connection-test and durable run routes.
- `JobPortal.Application/Abstractions/Jobs/IJobSourceConnectionTester.cs`: saved and unsaved test requests, response flags, reason, message, HTTP status and discovery.
- `JobPortal.Application/Abstractions/Jobs/IRippleHireSourceDiscovery.cs`: discovery statuses, resolved URL, manual configuration flag, errors and computed success flag.
- `JobPortal.Application/Features/JobAggregation/JobSourceManagementDtos.cs` and `JobSourceManagementValidators.cs`: unchanged save fields, transient discovery response, and public discovery input validation.
- `JobPortal.Application/Features/JobAggregation/JobSourceRunService.cs`: returned `updated` counter.

## Form and payload

RippleHire is appended to the existing provider dropdown and ATS table filter; all earlier options retain their order and numeric mapping. The standard company, career URL, optional ATS identifier, activation, Auto Publish and scan interval fields are reused. Edit mode preserves saved configuration. No new configuration properties are required.

Example create/update body (illustrative, not an executed request):

```json
{
  "companyId": "<existing-company-guid>",
  "careerPageUrl": "https://www.ltm.com/india-careers",
  "atsType": 8,
  "atsIdentifier": null,
  "isActive": true,
  "autoPublishEnabled": false,
  "scanIntervalMinutes": 720
}
```

Employer HTTPS careers pages, RippleHire tenant roots and `/candidate/` entries now support automatic discovery with a blank/null identifier. An employer page may include its own query parameters. A full manual public RippleHire token URL remains supported, with an optional matching identifier. Manual candidate queries retain safe-value, single-token, optional source and English-language checks. Public `#list` view fragments are accepted for backend normalization; job fragments, legacy tenant paths, credentials, literal IPs, local hostnames and non-default ports remain rejected. An explicit identifier requires the matching complete public candidate URL. The other ATS validation branches and shared schema remain unchanged.

The production UI contains no LTM-specific data. LTM's employer URL is used only in tests and this illustrative payload. Auto Publish remains an existing administrator setting; the LTM test explicitly switches it OFF and verifies interval 720.

## Connection and synchronization

The existing form exposes **Detect & Test Connection** for RippleHire. The shared RTK Query API calls `POST /api/admin/job-sources/test` (the API client's base includes `/api`) using exactly this unsaved request:

```json
{
  "atsType": 8,
  "careerPageUrl": "https://www.ltm.com/india-careers",
  "atsIdentifier": null
}
```

The action validates URL/provider/identifier without requiring an already selected company. It does not save or import. All three backend flags (`configurationValid`, `providerReachable`, `listingReachable`) must be explicitly true and the provider must match. RippleHire also requires discovery `succeeded=true`, `Resolved` or `ManualUrlVerified` status, `manualConfigurationRequired=false` and a returned URL. Missing, empty or contradictory results cannot show success.

The form and saved-source connection dialog show the actual message, reason code, optional HTTP status, discovery status, validation errors and read-only resolved URL. `Ambiguous`, `NotFound` and verification failures show manual fallback guidance without choosing or inventing a token. The same Career Page URL field accepts manual complete public URLs. HTTP failures retain the existing safe API message and field errors. Backend create/update discovery failures already join discovery validation errors into their top-level message, which the existing save error UI displays.

**Use Resolved Configuration** copies a verified URL into the form and clears the optional identifier for backend derivation. It does not save automatically. Saving the original employer URL also remains supported: create/update performs backend discovery and persists its normalized result. After a RippleHire save, a dialog displays the actual returned configuration. Existing edit loading preserves the stored URL/token without initiating discovery.

During discovery fields, saving and repeated test submissions are disabled. Results are keyed to the tested provider/URL/identifier and hidden after input changes. Pending form test requests are aborted on unmount. Discovery-capable calls allow 60 seconds for the backend's 45-second discovery budget; RippleHire create/update gets the same allowance. Existing authentication remains in the shared API layer. Saved-source `POST /api/admin/job-sources/{id}/test` remains available.

Run Now retains `POST /admin/job-sources/{id}/run` and authenticated GET polling at `/admin/job-sources/{id}/runs/{runId}`. Queue acceptance does not imply success. Existing status, last-run timestamps, total received, created, matched, skipped and errors remain available; `Updated` is displayed only when returned. Activation still uses the existing detail fetch and PUT update. Existing edit/detail loading and source management UI are reused.

Normal manual and scheduled synchronization continue using persisted source values; no frontend discovery call was added to Run Now or polling. The prior integration's optional `updated` counter remains unchanged. No new backend/frontend contract mismatch was identified in the inspected source; the deployed backend must expose the updated discovery contract before this UI can be used.

## Modified files

- `src/features/admin/types/jobSourceModels.ts`
- `src/features/admin/validation/jobSourceConfiguration.ts`
- `src/features/admin/components/JobSourceFormDialog.tsx`
- `src/features/admin/components/SourceConnectionResult.tsx` (new shared display)
- `src/features/admin/utils/sourceConnectionVerification.ts` (new shared verification predicate)
- `src/features/admin/api/jobSourcesApi.ts`
- `src/pages/admin/AdminJobSourcesPage.tsx`
- `src/features/admin/validation/jobSourceSchema.test.ts`
- `src/features/admin/components/JobSourceDiscovery.test.tsx` (new)
- `src/features/admin/api/jobSourcesApi.test.ts`
- `src/pages/admin/AdminJobSourcesPage.test.tsx`
- This report.

## Automated verification

- `npm run typecheck` passed.
- Six focused suites passed: **183 tests**, zero failures (schema, API, standard form, discovery form, admin page and durable run monitoring).
- Scoped ESLint passed after correcting Fast Refresh exports and test mock/assertion types.
- `git diff --check` passed.
- `npm run build` passed, including TypeScript and Vite. SignalR annotation and large-chunk warnings remain.
- After the shared helper/type cleanup, the final affected-test recheck passed **25 tests** (33 unrelated cases excluded by the name filter). A prior retry stalled and reported test/worker timeouts; the single-worker rerun completed successfully without changing timeouts or assertions.

The tests use mocked API responses. They cover employer/tenant/complete URL validation, optional and conflicting tokens, exact unsaved discovery payload, verified responses, NotFound/Ambiguous/VerificationFailed, empty and contradictory results, manual fallback, stale preview invalidation, duplicate-test prevention, API errors, LTM create settings, resolved save response display, existing source edit compatibility and other provider/run regressions.

## Remaining manual verification

Against a running backend containing this contract, sign in as an administrator and use an approved test company. Preview the LTM India employer URL with a blank identifier; inspect its actual resolved URL. Save with interval 720 and Auto Publish OFF, reload/edit, and confirm the stored resolved URL/token. Exercise an ambiguous employer page, a tenant without public token evidence, an invalid token and manual fallback. Run synchronization and inspect actual status/counters and jobs; verify activation and responsive layout. No authenticated live API connection, employer synchronization or live import is claimed by the frontend tests.

Discovery only works when the backend finds supported static public evidence; a tenant name alone does not guarantee a usable token. Dynamic-only career sites, authentication/anti-bot pages and ambiguous links can require manual configuration. Backend network security and listing verification remain authoritative. An administrator must choose the appropriate employer source; the UI never picks among ambiguous candidates.
