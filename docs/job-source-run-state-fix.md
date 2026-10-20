# Job source manual-run state

The row's previous disabled expression was `Boolean(busy) || runs.active(source.id) || sources.isFetching || !source.isActive || (source.atsType === Custom && !isEmployerDirectSource(source))`.

`isEmployerDirectSource` accepted only `employer-direct`. The backend canonicalizes new generic employer sources to `employer-direct:auto-v1`. Therefore new active generic rows were treated as unsupported Custom sources, independently of dates, failure count, and Auto Publish. The AMD run was not the cause of Autodesk's eligibility failure.

Tracking was already indexed by source ID, and GET requests already used and validated both source ID and run ID. However, `Interrupted && retryPending` was considered active. The backend computes retryPending from remaining attempts and schedules interruption recovery after at least 60 minutes. Repeated successful GET responses reset the polling error counter, so this could poll every two seconds throughout the cooldown; saved references restarted it after refresh.

The frontend now recognizes both exact generic identifiers. Interrupted status ends automatic monitoring, removes the saved reference, and releases the row for an explicit manual action. Queued, Running, and Workday Paused continuation still poll. A new manual POST can reattach to the same backend retry-pending run; it does not bypass the durable queue, execution lock, cooldown, or duplicate protection. Exhausted runs can receive a new run ID through the existing backend behavior.

Run Now no longer depends on unrelated row busy state or collection background refetching. Poll tasks check that they are still the current task before requesting or applying status. Replacement tasks cancel timers and abort old requests.

Source creation still only saves a source; no automatic run was added. Crawler security, source/run binding, and reconciliation rules were not modified.

Backend inspected: `C:/Users/Ashish/Documents/Codex/2026-07-27/you-are-a-principal-net-9`. `JobSourceRunService.EnqueueAsync` permits active Custom sources and forwards the requested source ID to the durable store. Store enqueue, active checks, and GET status are source scoped. GenericEmployerContract recognizes both exact identifiers. No backend production-code change is necessary. Added `JobPortal.Application.Tests/GenericEmployerManualRunTests.cs` verifies manual queue eligibility for both identifiers; a review copy is in `artifacts/backend-tests/`.

Validation results are recorded in the final review report. The default backend test command is blocked by existing unrelated analyzer errors; a separate invocation treats those diagnostics as warnings without changing project settings.

## Files changed

- `src/features/admin/utils/jobSourceFormatting.ts`: accept both exact generic employer identifiers for eligibility, labeling, filtering, and edit-mode recognition.
- `src/features/admin/types/jobSourceModels.ts`: end automatic monitoring for Interrupted, including retry-pending interruptions.
- `src/features/admin/hooks/useJobSourceRuns.ts`: reject polling work from cancelled/replaced tasks before dispatch and before applying responses.
- `src/pages/admin/AdminJobSourcesPage.tsx`: scope Run Now busy eligibility to the current source and avoid blocking on unrelated background list refreshes.
- `src/features/admin/hooks/useJobSourceRuns.test.tsx`: interruption cleanup/retry, exact AMD restoration, and replacement-response regressions.
- `src/pages/admin/AdminJobSourcesPage.test.tsx`: both generic identifiers, Never dates, source isolation, and supported ATS eligibility regressions.
- Backend `JobPortal.Application.Tests/GenericEmployerManualRunTests.cs`: queue eligibility for both generic identifiers, without previous runs.
- This report. A backend test review copy and command logs are under ignored `artifacts/`.

The pre-existing auth/LoginPage edits and `resume-matches-files.txt` were left untouched. No push, deployment, reset, clean, or stash was performed.

## Verification

- Focused frontend suite: 74/74 passed across page, polling hook, form, and API tests (`--maxWorkers=1 --testTimeout=30000`). The first pass had three existing-test timeouts and loaded an intermediate implementation for the queued-snapshot case; the final-code rerun passed all tests.
- `npm run typecheck`: passed.
- `npm run build`: passed; existing SignalR annotation and bundle-size warnings remain.
- Focused backend suite: 48/48 passed, zero skipped, covering GenericEmployerManualRunTests, GenericEmployerContractTests, JobSourceDurableRunTests, and JobSourceReconciliationSafetyTests.
- The default backend command fails compilation on pre-existing CA1707/CA1711/CA1859/CA1861/CA1869 errors in unrelated tests. Passing runtime verification used `-p:TreatWarningsAsErrors=false` for that invocation only. These diagnostics remain visible and no project policy was edited.
- `git diff --check`: passed.
- No production requests or live database mutations were performed; production AMD status was reproduced through its exact saved source/run reference in a regression fixture.
