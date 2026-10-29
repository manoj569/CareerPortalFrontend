# Authentication session replay isolation

## Root cause

The original epoch changed only when credentials were cleared. New login credentials could be installed without advancing it. The interceptor checked the epoch when receiving a 401, but did not recheck after awaiting refresh or at replay dispatch. The request interceptor then replaced the original Authorization header with whatever token was currently installed. An old mutation could consequently run under a later login.

Final review added a failing regression reproducing that replay. This update fixes it without changing backend code, endpoints or DTOs.

## Isolation mechanism

- `authTokenStore.set` installs a new login/account and always advances the epoch, even if token strings are identical. Explicit clear/logout also advances it.
- `rotate(tokens, expectedVersion)` updates credentials only in the matching existing epoch, without advancing it. Refresh validity lookup is read-only; expiry flows explicitly clear the appropriate session.
- The synchronous request interceptor captures the epoch at request admission, removes any supplied/stale Authorization header, validates that epoch, and attaches only its current session token.
- Every 401 and refresh waiter validates the request/session epoch. Replay validates again immediately before entering Axios, and the credential interceptor validates again before transport. A changed session rejects with local `session_changed`; the old request is never replayed. Stale request headers are removed on rejection.
- Refresh validates its captured epoch before persisting tokens. It cannot overwrite a later login. Waiting callers recheck after the refresh promise, including after session-refreshed event listeners run.
- A shared refresh flight is scoped to its epoch. Startup restoration and interceptor recovery use the same helper. Old-flight cleanup cannot clear a newer flight, and old failures cannot expire a newer session. Same-session concurrent requests retain single-flight refresh and the one-retry limit.
- AuthService logout only revokes/clears its original session. Redux tracks pending logout identity/epoch, and ignores its completion after a newer login. Same-session token refresh during logout does not suppress ordinary logout completion. Stale startup refresh rejection cannot clear newer credentials or authenticated Redux state.

The existing Bearer authentication and POST `/auth/refresh` body `{ "refreshToken": "..." }` remain unchanged. Epochs are internal Axios/store metadata, not new HTTP fields. Password/OTP/Google login endpoints are excluded from automatic protected-request refresh. No authentication tokens are logged or included in error messages.

## Files updated for this correction

- `src/services/authTokenStore.ts`, new `src/services/authTokenStore.test.ts`
- `src/api/apiClient.ts`, `src/api/apiClient.test.ts`, `src/api/index.ts`
- `src/features/auth/services/authService.ts`, `authService.test.ts`
- `src/features/auth/store/authSlice.ts`, `authSlice.test.ts`
- `src/features/dashboard/components/NotificationAuth.test.tsx`
- `src/pages/careerSnapshot.flow.test.tsx` (refresh fixture uses the shared helper contract)
- This report and the follow-up notice in `docs/JOB_SOURCE_ERRORS_NOTIFICATION_AUTH.md`.

All previous uncommitted job-source, error-display and notification changes are preserved. This correction adds no dependencies or backend modifications.

## Verification

Final verification passed:

- **332 tests passed, 0 failed, across 21 relevant suites.** This includes all 23 interceptor authentication cases and the original previously failing race, expanded across POST/PUT/PATCH/DELETE.
- `npm run typecheck` passed.
- Scoped ESLint passed for all 25 changed/new TypeScript and test files.
- `npm run build` passed, including TypeScript compilation and Vite production bundling.
- Existing SignalR annotation and large-chunk warnings remain; no additional build warning category appeared.
- `git diff --check` passed. Test adapters/fixtures were used; no live production API success is claimed.

Coverage includes logout/login/account switches before refresh resolution, a switch after refresh resolution but before replay, a switch at credential injection, reused token text, rejection of old refresh writes/failures, overlapping refreshes for different sessions, startup/recovery sharing, normal payment refresh, explicit logout stopping notification polling, new login restarting it, stale Redux completion handling, job-source saves and prior ATS regressions.

## Git recommendation at implementation handoff

The checkout remains on `main` at `b853cc7`. Local `feature/admin-job-sources` is an ancestor of main and is **88 commits behind**, with no feature-only commits. No checkout, reset, stash or history operation was performed.

Create a new branch such as **`codex/fix-auth-session-race` from current main**, carrying the existing working-tree changes, rather than checking out the old feature branch. This is a recommendation only; no branch, commit, push, merge or deployment was created.

## Remaining security limits

The checks prevent cross-session replay and stale refresh writes in this browser session. They cannot undo a request already accepted by the backend before logout; server authorization and refresh-token revocation remain necessary. Live account-switch testing against a deployed backend has not been performed. Existing sessionStorage refresh-token storage retains its existing exposure to same-origin script compromise; this fix does not change that storage protocol.

## Authorized delivery review

The later delivery request authorized creating `codex/fix-auth-session-race` from current main (`b853cc7327282111283443cb57c94ed90c0c0ce8`), committing the intended work and pushing that new branch normally to origin. The older feature branch was not used. All existing uncommitted source, tests and both reports were preserved. No reset, stash, force-push, merge or deployment is part of this delivery.

The complete 27-file diff was reviewed for the intended job-source, structured-error, session-recovery and notification fixes. No unrelated configuration, dependency, backend or generated build changes are included. Manual credential review and a high-signal scan of all 27 files found no exposed private keys, provider API keys, GitHub tokens, AWS keys or JWTs; credential-like literals in tests are explicit synthetic fixtures. This review is not a claim that a pattern scan can detect every possible secret.

The delivery rerun passed **332 tests in 21 suites**, including all **23 authentication interceptor tests**. The standalone TypeScript check, scoped lint of all 25 TypeScript files, production build and whitespace checks also passed before staging. Only the existing SignalR annotation and large-chunk build warnings remained. The approved commit message is `fix: secure auth session replay and improve job source errors`. Merge readiness remains subject to remote review/CI and the live integration limits above.

### Intended commit manifest

- `docs/AUTH_SESSION_RACE_FIX.md`
- `docs/JOB_SOURCE_ERRORS_NOTIFICATION_AUTH.md`
- `src/api/apiClient.ts`
- `src/api/apiClient.test.ts`
- `src/api/apiError.ts`
- `src/api/apiError.test.ts`
- `src/api/axiosBaseQuery.ts`
- `src/api/formErrors.ts`
- `src/api/index.ts`
- `src/components/feedback/ApiErrorAlert.tsx`
- `src/features/admin/components/JobSourceDiscovery.test.tsx`
- `src/features/admin/components/JobSourceFormDialog.tsx`
- `src/features/auth/services/authService.ts`
- `src/features/auth/services/authService.test.ts`
- `src/features/auth/store/authSlice.ts`
- `src/features/auth/store/authSlice.test.ts`
- `src/features/dashboard/api/dashboardApi.ts`
- `src/features/dashboard/components/NotificationAuth.test.tsx`
- `src/features/dashboard/components/NotificationBell.tsx`
- `src/features/dashboard/components/NotificationBell.test.tsx`
- `src/pages/NotificationsPage.tsx`
- `src/pages/admin/AdminJobSourcesPage.tsx`
- `src/pages/admin/AdminJobSourcesPage.test.tsx`
- `src/pages/careerSnapshot.flow.test.tsx`
- `src/services/authTokenStore.ts`
- `src/services/authTokenStore.test.ts`
- `src/types/api.ts`
