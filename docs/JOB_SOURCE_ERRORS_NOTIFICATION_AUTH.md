# Job-source errors and notification authentication

## Confirmed findings

- The API error model and Axios-to-RTK conversion omitted `traceId` and per-field `reasonCodes`. The job-source page then flattened errors into a string, preventing the form from assigning backend errors to inputs or showing a trace ID.
- An unchanged verified discovery preview did not affect Save unless the administrator first pressed Use Resolved Configuration. Save could submit the original employer URL for another discovery. That input is supported by the updated backend; it is not proof of a current backend defect. Save now reuses the verified URL when the current provider/URL/identifier still match the preview.
- Both notification consumers subscribed without checking authentication. The bell polled every minute and the inbox every 30 seconds.
- Axios already attached the in-memory access token and shared concurrent refreshes through the existing `/auth/refresh` endpoint. A retried request that still returned 401 did not expire the session. Refresh transport failures also left protected polling active. A delayed original 401 could start another refresh after the first one completed.
- The dashboard API lacked the administrator API's terminal-401 session-expiry handling.

The production 400/401 incidents were not reproduced with an authenticated production account. The backend fix, production deployment revision, actual failing payload and refresh-token validity remain deployment/session facts to verify. Backend source was read locally; no backend files were modified. The backend commit's ancestry was not verified.

## Contract and save behavior

Inspected the local backend's `JobSourceRequestErrors.cs`, `GlobalExceptionMiddleware.cs`, job-source validators, discovery configuration, management DTOs and controller. The structured 400 shape is `code`, `message`, `errors`, `reasonCodes`, `traceId`, and optional `discovery`. No request fields or endpoints were invented.

The existing create/update payload remains:

```json
{
  "companyId": "<existing-company-guid>",
  "careerPageUrl": "https://example.ripplehire.com/candidate/?token=<public-career-token>",
  "atsType": 8,
  "atsIdentifier": null,
  "isActive": true,
  "autoPublishEnabled": false,
  "scanIntervalMinutes": 720
}
```

With a current verified preview, Save uses its resolved URL and a null identifier for backend derivation. If the inputs change, the preview cannot supply stale values. Without a matching verified preview, employer/tenant inputs and optional identifiers retain the existing validation and backend-discovery path. Existing stored manual URL/token pairs remain compatible. Other ATS validation is unchanged.

A synchronous submit guard blocks double submissions while validation or saving is pending. Entered values remain on failure. Detection never saves or changes Auto Publish. Successful create/update still uses the existing success snackbar and RTK tag invalidation to refresh the list; the saved configuration dialog shows the actual backend response.

## Error handling

Reusable extraction handles backend and ProblemDetails messages, numeric HTTP status, code/reason code, field errors, per-field reason codes and trace ID. It accepts malformed/missing structures without rendering arbitrary objects. Existing safe messages for unauthorized, forbidden, rate-limit and server errors remain.

Trace/reason metadata survives `ApiRequestError` and `axiosBaseQuery`. PascalCase, camelCase and `$.field` names map to form fields. Known fields display backend messages beneath the corresponding input; unmapped errors remain in the general alert. The alert shows HTTP/code details and a copy-trace-ID action. Discovery HTTP failures use the same display and field mapping.

Error text redacts bearer credentials, token-bearing query parameters and common credential assignments. Trace IDs are restricted to an identifier character set. No authentication credentials, raw HTTP response dumps or request payload logs were added. Resolved public career URLs remain visible as intended configuration data.

## Authentication behavior

- Keep the existing access-token attachment, refresh endpoint and authentication response contract.
- Share one refresh promise for concurrent 401s within a session. Late original 401s reuse the token already restored by that refresh; each original request retries at most once.
- If refresh fails, including network/5xx failure after a protected 401, or the retry remains unauthorized, clear tokens and emit the existing session-expired event. This intentionally requires signing in again when automatic recovery cannot restore authentication, rather than retaining a session that continues polling unsuccessfully.
- The existing AuthInitializer dispatches `sessionExpired`; existing store listeners reset private caches and protected routes navigate to login. Dashboard requests also dispatch expiry on a terminal 401 if their session is still current.
- A local session version changes when tokens are cleared. Late responses from before logout cannot replay under a subsequent login or invalidate its session. A refresh verifies its original token/session before persisting a response. This is local race protection, not a new authentication protocol.
- Bell/inbox queries skip idle, initializing and unauthenticated states and set polling to zero. Authenticated subscriptions resume with the same existing intervals. Notification actions cannot run through the hidden unauthenticated inbox. No new focus/reconnect refetch behavior was enabled; tests confirm those RTK events cannot restart skipped queries. No global browser `setupListeners` registration was found in this checkout.

## Changed files

- `src/types/api.ts`
- `src/api/apiError.ts`, `src/api/axiosBaseQuery.ts`, `src/api/formErrors.ts`
- `src/components/feedback/ApiErrorAlert.tsx` (new)
- `src/features/admin/components/JobSourceFormDialog.tsx`
- `src/pages/admin/AdminJobSourcesPage.tsx`
- `src/api/apiClient.ts`, `src/services/authTokenStore.ts`
- `src/features/dashboard/api/dashboardApi.ts`
- `src/features/dashboard/components/NotificationBell.tsx`
- `src/pages/NotificationsPage.tsx`
- Tests: `src/api/apiError.test.ts`, new `src/api/apiClient.test.ts`, `src/features/admin/components/JobSourceDiscovery.test.tsx`, `src/pages/admin/AdminJobSourcesPage.test.tsx`, `src/features/dashboard/components/NotificationBell.test.tsx`, new `src/features/dashboard/components/NotificationAuth.test.tsx`.
- This report.

## Verification before the session-race review

Final review subsequently found a missing session check between refresh completion and replay. The earlier 282-test result below did not cover that boundary. See `AUTH_SESSION_RACE_FIX.md` for the correction and expanded verification; it supersedes the earlier race-safety claim.

All final checks passed:

- Main regression run: **257 tests in 14 suites**, zero failures. Includes discovery/create/edit, optional identifier, duplicate saves, field/general errors, trace copying, list refresh, all existing ATS validation, durable synchronization, notification polling/authentication, route guards and private cache reset.
- Additional shared-API regression run: **25 tests in 4 suites**, zero failures (auth service, auth reducers, administrator API and payments API).
- Total: **282 tests in 18 suites**. Tests use mocked HTTP responses/adapters; no production API success is inferred.
- `npm run typecheck` passed. The final `npm run build` also passed TypeScript compilation and Vite production bundling.
- Scoped ESLint passed for all 18 changed/new TypeScript and test files.
- `git diff --check` passed.

The older notification test that retained private content after a terminal 401 was updated to reflect session invalidation; retention remains tested for 403/404/500. The final build retained existing SignalR annotation and large-chunk warnings.

## Remaining production verification

1. Confirm the backend containing the supplied fix is deployed and the configured frontend API origin points to it.
2. As an administrator, detect and save an approved RippleHire company with Auto Publish off; check the request, persisted URL/token, success notification and refreshed list.
3. Exercise a structured 400 and confirm field errors, reason codes and trace copying. Use that trace to correlate backend logs without sharing credentials.
4. With a test candidate account, verify successful refresh, rejected refresh, network failure during recovery, login redirection, absence of further notification requests while signed out, and resumed polling after login.

No live import or authenticated production request is claimed. Existing SignalR annotation/large-bundle warnings and the application's existing sessionStorage refresh-token design remain outside this frontend fix. At the original implementation handoff, no commit, push, merge or deployment had been performed. See the authorized delivery review in `AUTH_SESSION_RACE_FIX.md` for the subsequent Git delivery scope.
