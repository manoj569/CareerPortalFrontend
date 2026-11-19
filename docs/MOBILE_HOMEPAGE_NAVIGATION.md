# Mobile homepage navigation delivery

## Cause and implementation

The public layout hid its entire desktop action group below the homepage lg breakpoint (1200px), leaving account actions accessible only inside the drawer.

Changed `src/layouts/PublicLayout.tsx` and added `src/layouts/PublicLayout.test.tsx`. This report is the only documentation addition.

The homepage now has a mobile-only account group: text Log in, primary Register, then the existing hamburger. Compact branding and narrower header gutters below 600px leave room for these controls; buttons remain at least 44px tall. The existing desktop action group is unchanged. Original logo dimensions and gutters resume at desktop sizes. Homepage hero, search, dashboard, authentication implementation, route definitions, membership/referral rules and backend contracts were not edited.

The homepage guest drawer reuses NavigationList and its icons, active blue/white styling and aria-current. It presents five feature links, a divider, YOUR ACCOUNT, outlined Log in and primary Register for free. The MUI drawer retains its modal, backdrop, scroll lock and close behavior. Its paper scrolls vertically; branding and account actions do not shrink. Explicit keyboard focus outlines are provided on the mobile header and drawer.

Authenticated visitors receive Dashboard access in the mobile header and retain the existing Dashboard drawer entry. Guest actions follow existing Redux authentication selectors, including restoration and invalidation. No candidate sidebar is duplicated.

## Existing routes reused

| Item | Destination |
| --- | --- |
| Branding / Home | `/` |
| Browse Jobs | `/jobs` |
| Employee Referrals | `/dashboard/jobs?mode=referral` |
| Interview Insights | `/dashboard/interview-insights` |
| Create Portfolio | `/dashboard/portfolio` |
| Log in | `/login` |
| Register / Register for free | `/register` |
| Candidate Dashboard | `/dashboard` |
| Administrator Dashboard | `/admin` |

Protected drawer links enter the existing CandidateRoute flow: guests are redirected to Login with the original location (including the referral query) in `state.from`. Existing role, onboarding and membership checks remain responsible for access. The homepage hero's existing portfolio registration flow is unchanged.

## Verification and limits

The new component tests cover ordered feature links, account button variants, active Home, all six non-Home destinations, protected return locations, opening, Close/Escape/backdrop closing, focus restoration, modal scroll lock, and session-restoration/logout updates. Existing homepage tests exercise search and feature links.

Browser automation failed to initialize (`failed to write kernel assets`, system path not found). Actual visual/layout checks at 320x568, 360x800, 375x812, 390x844, 393x852 and 430x932 remain pending, as does a desktop screenshot comparison. Component tests use jsdom and cannot establish actual text fit, overflow, visual contrast, scrolling geometry or pixel equivalence. Live authentication and paid membership/referral flows were not exercised against a backend.

A broader full-suite attempt was stopped after failures in untouched profile/admin tests (including timeouts). Its results are incomplete and there is no all-suite pass claim. An isolated authentication-page run reproduced 21 passes and 1 failure: the existing OTP login test accesses a mobile-number input without rendering a page. The missing setup is also present in HEAD. No unrelated test or application code was changed to hide these failures.

No commit, push, merge or deployment was performed.

## Executed check results

- Focused run: **73 passed, 0 failed, 5 suites** — PublicLayout 12, HomePage 13, NavigationList 16, routeConfig 9, apiClient 23.
- Command: `npx vitest run src/layouts/PublicLayout.test.tsx src/pages/HomePage.test.tsx src/components/navigation/NavigationList.test.tsx src/routes/routeConfig.test.tsx src/api/apiClient.test.ts --maxWorkers=2`.
- `npm run typecheck`: passed.
- `npx eslint src/layouts/PublicLayout.tsx src/layouts/PublicLayout.test.tsx`: passed after correcting an unsafe test assertion.
- `git diff --check`: passed.
- `npm run build`: passed. Existing SignalR PURE-annotation warnings and the MUI vendor chunk warning remain.
- Separate `src/pages/authPages.test.tsx`: 21 passed, 1 failed as described above; this is separate from the 73-test focused run.
- The full-suite attempt was interrupted, so no complete repository test total is available.

Visual viewport and desktop comparison checks remain required before declaring the complete UX validation finished. Changes remain uncommitted on the existing `codex/fix-auth-session-race` branch.

## Follow-up validation (2026-10-30)

### Browser recovery attempted

Reviewed the current PublicLayout diff and all 12 navigation tests. Reset the CUA JavaScript kernel, then retried `cua.getState()`. Initialization again failed before browser inventory or page access with:

```
failed to write kernel assets: The system cannot find the path specified. (os error 3)
```

Read the computer-use skill's setup and recovery instructions and attempted its documented `@oai/sky` initialization through the separate node_repl tool. That tool failed with the same kernel-assets error before executing initialization code. Shell TEMP and TMP directories both exist; this does not establish which internal automation path is missing. No application code, business logic, system settings or automation installation was modified to work around the failure. Recovery requires a working automation runtime (for example, restarting the desktop app/runtime and retrying in a fresh session).

### Actual visual verification status

| Viewport | Header alignment / fit | Guest drawer: all seven links | Authenticated layout | Overflow / clipping / shifts / console |
| --- | --- | --- | --- | --- |
| 320 x 568 | Not verified | Not verified | Not verified | Not verified |
| 360 x 800 | Not verified | Not verified | Not verified | Not verified |
| 375 x 812 | Not verified | Not verified | Not verified | Not verified |
| 390 x 844 | Not verified | Not verified | Not verified | Not verified |
| 393 x 852 | Not verified | Not verified | Not verified | Not verified |
| 430 x 932 | Not verified | Not verified | Not verified | Not verified |

Desktop visual comparison is also **not verified**. No screenshots or browser-console observations were obtained. No mobile layout defect was demonstrated, and no source or test edits were made during this follow-up.

### Static comparison evidence

- Extracted the desktop navigation Stack JSX from HEAD and the working file: exact match.
- Compared the main-content/footer JSX from HEAD and the working file: exact match.
- `git diff --exit-code HEAD -- src/pages/HomePage.tsx src/pages/home/landing.css src/components/navigation/AppBrand.tsx src/theme/theme.ts src/routes src/features/auth src/api`: exit 0, no differences.
- Existing desktop breakpoint remains 1200px. The new account Stack is hidden there; the branding wrapper becomes `display: contents`, original logo sizes resume, and header gutters match the original values. These are code observations, not rendered measurements.
- jsdom checks establish navigation/state behavior, not actual responsive visibility. In particular, the header test sees both desktop and mobile links because jsdom does not render media-query layouts.

### Manual verification checklist

1. Run `npm run dev` and open the local homepage. In browser responsive mode, test each size in the table at 100% zoom. Confirm logo, Log in, Register and hamburger remain on one aligned row without overlap; capture screenshots.
2. Open the drawer at each size. Confirm Home, Browse Jobs, Employee Referrals, Interview Insights, Create Portfolio, Log in and Register for free are all reachable. At 320 x 568, scroll to the last action and check that content does not overlap or clip.
3. Verify Close, Escape and backdrop closing, focus return to the hamburger, Tab/Shift+Tab containment while open, visible keyboard focus, active Home and background scroll lock.
4. Check guest Login/Register routes and protected feature links; verify Login preserves the referral query and intended feature destination. With an existing test candidate, verify Dashboard replaces guest actions, then reload and log out to verify restoration and invalidation. Do not create accounts or change entitlements for this check.
5. Compare hero/search and Browse Jobs/Create Portfolio with the original version. Submit a job/location/experience search and inspect its existing jobs URL contract.
6. Compare screenshots against the original HEAD at 1200px and 1440px (same browser, font, zoom and data); check logged-out and logged-in navigation. Use a separate baseline checkout so current work is preserved.
7. With the drawer closed and open, check document and drawer scroll widths, try horizontal scrolling, and watch font/image loading for shifts. Inspect the browser Console for errors and separate unavailable-backend/network errors from navigation errors. Record screenshots, actual viewport sizes and findings before marking visual checks passed.

Review readiness: source and tests can be reviewed now. Merge readiness remains **pending visual/mobile/desktop validation** and triage of the separately recorded unrelated baseline failures. No commit, push, merge or deployment was performed.

Follow-up test rerun: **73 passed, 0 failed, 5 suites**, including all 12 PublicLayout tests, 13 HomePage tests, 16 NavigationList tests, 9 routeConfig tests and 23 apiClient tests. This confirms the component/routing/authentication behavior under jsdom, including the seven guest drawer destinations, protected intent, state updates, close interactions and existing homepage search. It does not confirm rendered visibility at any viewport. Unrelated OTP/profile/admin failures were not rerun or folded into this result. Production build remains the successful prior-run result; it was not repeated because no application/test code changed in this follow-up.

Follow-up whitespace check: `git diff --check` passed. The additional combined TypeScript/scoped-ESLint rerun produced the TypeScript startup banner but did not complete during this validation window and was interrupted; it is **not** counted as a new pass. Prior TypeScript, scoped ESLint and production-build passes above remain historical results on the same unchanged source. This follow-up changed documentation only.

Final workspace observation: four additional files became modified during this follow-up: `docs/RIPPLEHIRE_FRONTEND.md`, `src/features/admin/components/JobSourceFormDialog.test.tsx`, `src/features/admin/validation/jobSourceSchema.test.ts`, and `src/features/admin/validation/jobSourceSchema.ts`. This validation task did not edit them. They were preserved and are excluded from this navigation review; prior whole-source check results must not be treated as validation of those new changes.
