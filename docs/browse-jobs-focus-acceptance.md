# Browse Jobs focus acceptance

The search input was not remounting. RouteAccessibility depended on pathname and search, so each debounced q update scheduled focusPageContent(), moving focus to main h1. A failing wrapper-based regression verified that the input DOM node was unchanged while the heading became document.activeElement.

The fix uses pathname as the accessibility focus destination for /dashboard/jobs. Query-only changes retain the user's focus. Other routes retain their previous pathname/search behavior, and navigation to a different page still focuses its heading. No search/debounce/API/loading code changed; no input focus restoration was added.

Manual production acceptance (not executed against a live backend):
1. Open Browse Jobs and let the initial page load finish.
2. Click the keyword textbox ONCE.
3. Type software engineer continuously without clicking the textbox again.
4. Wait through the 350 ms debounce and API responses.
5. Continue typing more characters. The cursor/focus must remain in the keyword textbox and the search bar must stay visible while results update.
6. Clear the input normally, wait for browse results, then type PWC. Only one initial click should be necessary.
7. Repeat using C#, .NET, Go, AI, React Developer and Barclays.
8. For the direct reproduction: type P, wait through debounce/results, then type W without clicking, wait again, then C without clicking. Verify PWC and uninterrupted focus.
9. In browser DevTools capture the keyword input element. Compare it after requests, returned cards, zero results, errors, sort/filter/category changes and pagination: the element must be the same DOM node.
10. Verify Back/Forward restores the keyword while keeping the input DOM node. Navigate to another page and verify normal heading focus still works.

Clicking another interactive control may intentionally move focus to that control. The fix prevents unexpected heading focus during same-page query updates and does not force focus back into the textbox.

Automated validation:
- Before the fix, the wrapper-based pwc regression failed: the same input DOM node remained mounted but main h1 became the focused element after debounce.
- After the fix, the focused Browse Jobs/API/URL/accessibility selection passed: 59 tests passed, 47 outside the selection skipped; 4 files passed and 1 file outside the selection skipped. Duration 139.86 seconds.
- Complete accessibility and facet-control suites passed: 19 tests across 2 files, no skips. Duration 30.10 seconds. One route-navigation check overlaps the focused selection.
- Changed-file ESLint passed.
- git diff --check passed.

Focus tests run through the production RouteAccessibility wrapper and verify document.activeElement and stable input DOM identity through P/W/C pauses, debounce, fetching, success, initial loading, empty/error results, immediate submission, short keywords, filter/sort/tab/pagination updates, and Back/Forward. Destination-page heading focus is also checked.
- Final npm run build passed, including TypeScript; Vite transformed 12,311 modules and bundled in 23.47 seconds. Existing SignalR annotation and 500 kB chunk warnings remain.

All changes remain unstaged. No commit, push or deployment performed.
