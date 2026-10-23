# Hiring Drives frontend integration

**Backend API contract: VERIFIED** against `docs/HIRING_DRIVES_API_CONTRACT.md`.

The frontend shares the configured Axios client (base URL includes `/api`) and RTK Query. `ApiResponse<T>` endpoints extract exactly one `data` envelope. Public list returns a JSON array in `data`; admin list returns `data.items` with pagination. Public impressions are sent as `{ driveIds }` and return HTTP 204 with no JSON body; the mutation does not transform or parse a response body.

Public DTO fields match the contract: UUID string `id`, title, nullable subtitle/badgeText/badgeType, nullable nested company `{id,name,logoUrl}`, nullable imageUrl/locationText/experienceText, isSponsored, and nested destination `{type,jobId}` or `{type,url}`. Public campaigns omit admin-only fields.

Apply calls POST click and trusts the flat envelope data fields. Internal destinations include backend `jobId` and authoritative persisted `jobSlug`; frontend navigates directly to the existing public job-detail route with `jobSlug`. No JobId-to-search-to-slug resolution is used. Missing `jobSlug` shows a generic retry message and does not navigate. External destinations must be HTTPS and open with `noopener noreferrer`. Backend contract integration and internal job navigation are verified against the current contract.

The homepage and candidate dashboard use the anonymous `GET /api/public/hiring-drives/home` endpoint through the shared `/api` base URL. It returns only active eligible campaigns with `showOnHome: true`. Admin list/detail use the paginated/list and single-record response envelopes. Editable fields are nested under `campaign`; POST creates and PUT replaces the complete editable DTO. DELETE soft-deactivates. Analytics render the server's `impressionCount`, `clickCount`, and `ctr`. Badge strings are `hiring`, `walkIn`, `openings`, and `featured`. Validation follows documented field limits, HTTPS URL rules, nullable end date, UTC start/end ordering, nonnegative display order, and the requirement for a jobId or applyUrl. Admin `showOnHome` and `isSponsored` are separate booleans.

The homepage and dashboard ad cards allow anonymous users to apply. They first call the backend click endpoint, then navigate to the backend-authoritative external URL or internal job slug. View Details opens the fields available in the public DTO without issuing a click; apply actions inside the details view use the same click flow as the card's Apply button.

Backend validation failures use HTTP 400 ApiError or framework ValidationProblemDetails; authorization can return 401/403, missing/ineligible records 404, rate limits 429, and unhandled service faults 500. Existing shared API error handling keeps UI messages generic. The endpoint-specific CORS policy requires the deployed frontend origin in backend `Cors:AllowedOrigins`; this repository does not establish whether that setting is deployed.

No campaigns are seeded. Manual browser/device verification remains separate.
