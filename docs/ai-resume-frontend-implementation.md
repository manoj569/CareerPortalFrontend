# AI Resume Tailor / Resume Maker implementation report

## Status and contract blocker

The frontend workflow and inspected API integrations are implemented, but this feature is NOT ready for first-time production use.

`CreateAIResumeSessionRequest` requires `sourceResumeId`. `AIResumeService.CreateSessionAsync` compares it against `candidate.ResumeProfile.Id`. The inspected `CandidateProfileResponse.Resume`, resume upload response (`ResumeResponse`) and resume status response (`ResumeStatusResponse`) do not expose that ID. The frontend cannot use the account ID, filename, an invented GUID, or a client-modified JD instead.

The shared workflow accepts a known source ID and tests the exact creation contract. Neither current UI entry point can obtain that ID from the inspected candidate APIs. New-session Analyze therefore shows a safe error and does not issue an invalid request. Previously created sessions can be restored using their backend session ID and stored source ID. Backend files were not modified. The minimum future contract change is to expose the current candidate resume profile ID through an authenticated existing resume response, then wire that actual field into the two entry points.

## Architecture and route

- One `ResumeWorkflow` implements Input -> AI Analysis -> Credit/Payment -> Generate -> Review/Edit -> Download.
- Job Details opens it in an accessible, responsive MUI dialog using the real backend job ID/title/company/location.
- `/dashboard/resume-maker` is a candidate route using the existing dashboard layout. Sidebar `Resume maker` has the existing `New` badge pattern.
- `aiResumeApi` uses the existing Axios/RTK Query authentication, response-envelope and error architecture. Its private cache is cleared on logout, expired sessions and account/role changes.
- Existing resume display/upload is reused through `CandidateResumeCard` and candidate profile queries. Uploading does not invent a resume ID or require another duplicate upload.
- New session payloads use either `sourceResumeId` + `jobId`, or `sourceResumeId` + `externalJobDescription`. External JD validation follows the inspected 50–20,000-character backend limits. Focus chips are UI preferences only.

## Actual backend endpoints integrated

All paths are relative to the configured API base URL:

| Operation | Endpoint |
| --- | --- |
| Packages | GET /ai-resume/packages |
| Credits | GET /ai-resume/credits |
| Create session | POST /ai-resume/sessions |
| Restore session | GET /ai-resume/sessions/{sessionId} |
| Free analysis | POST /ai-resume/sessions/{sessionId}/analyze |
| Credit checkout | POST /ai-resume/checkout |
| Verify purchase | GET /ai-resume/purchases/{merchantOrderId} |
| Generate | POST /ai-resume/sessions/{sessionId}/generate |
| Regenerate | POST /ai-resume/resumes/{resumeId}/regenerate |
| Restore generated resume | GET /ai-resume/resumes/{resumeId} |
| Manual edit | PATCH /ai-resume/resumes/{resumeId} |
| Backend files | GET /ai-resume/resumes/{resumeId}/download?format=pdf|docx|txt |

## Analysis, credits and payment

- Actual match score, matched/partial/missing skills, requirements, strengths, areas to improve and suggestions are displayed. Free analysis never renders full generated content.
- Packages, prices, currency, credit quantities and popularity come from the backend. There is no local authoritative package pricing or credit decrement.
- Positive balance offers `Generate Resume — Uses 1 Credit`; zero balance shows packages. Credit fetch errors do not imply a zero balance.
- Only supported PhonePe presentation is used. AI Resume orders use the inspected `air_` + 32-hex format; existing `ch_` membership orders remain supported.
- Checkout/generation/regeneration use persisted idempotency keys. Duplicate in-flight submissions are prevented.
- AI Resume returns use their dedicated authenticated purchase verification endpoint, not membership activation. The existing membership/referral handler is preserved.
- Auth restoration and existing 401 refresh remain in place. No auth token enters redirect URLs.
- Only server `Paid` results trigger a credit refetch and navigation to the approved `/dashboard/resume-maker`, optionally with a validated session ID for restoration. URL `success` values grant nothing.
- Pending checking is bounded to 60 seconds. Failed/cancelled/refunded/expired purchases grant no local credits. Terminal failed/cancelled checkout keys can be retried as new attempts. Verification failures offer explicit retry.

## Generation, editing, regeneration and downloads

- Generation loading remains visible until the backend responds. Returned persisted structured candidate information is used in the preview.
- Seven editable sections cover Professional Summary, Skills, Experience, Projects, Education, Certifications and Additional Info.
- Save sends the full supported content and actual `expectedRevision`. Failed/conflicting saves retain the unsaved draft; there is no automatic overwrite or credit consumption from editing.
- Reset discards local unsaved edits to the last persisted content. It is not an invented backend reset operation.
- Regeneration requires an explicit one-credit confirmation. Zero credits return to packages. Successful generation/regeneration refreshes the backend credit balance.
- PDF/DOCX/TXT and repeated downloads use backend blobs. The browser does not generate resume documents or decrement credits.

## Restoration and errors

Only account-scoped IDs, job slug and idempotency keys are persisted in session storage; resume/JD contents and auth tokens are not placed there by this feature. Session and generated resume IDs are restored through owned backend endpoints. Paid returns reopen the credit/generation step; generated sessions reopen editing. Create Another Resume clears workflow references safely.

Errors cover absent resume, unavailable source reference, invalid JD, unauthorized/ownership failures, analysis/generation/edit/download failures, concurrency, rate limiting, unavailable credits/packages and payment states. Provider stack traces are not rendered. Existing snackbar/MUI feedback is reused.

## Visual implementation and limits

The supplied screenshots guide the blue/light surfaces, cards, progress indicators, analysis layout, package cards and editor/download composition. Desktop panels use grids and stack on small screens; the six-step indicator scrolls on narrow screens. Existing global header/sidebar styling remains intact.

This is not a browser-verified pixel-exact result. Specific differences:
- Existing CandidateResumeCard is reused rather than replacing its upload/status design.
- Unsupported analysis categories (Responsibilities/Preferred/Company Focus) are omitted rather than fabricated.
- There are no per-section AI change explanations or generated ATS-score tabs, because those fields are absent from the backend contracts.
- Structured preview is continuous, not a fabricated paginated PDF viewer; it does not promise the original uploaded file's exact layout.
- Unsupported payment-brand logos, testimonials and sample candidate data are not shown. The sample JD is clearly instructional.
- Job Details retains its current overall page design; only the CTA/dialog integration was added.

## Files added

- src/pages/ResumeMakerPage.tsx
- src/features/aiResume/api/aiResumeApi.ts
- src/features/aiResume/api/aiResumeApi.test.ts
- src/features/aiResume/types/aiResumeModels.ts
- src/features/aiResume/types/resumeSections.ts
- src/features/aiResume/services/resumeWorkflow.ts
- src/features/aiResume/components/ResumeWorkflow.tsx
- src/features/aiResume/components/AnalysisScreen.tsx
- src/features/aiResume/components/ResumePreview.tsx
- src/features/aiResume/components/ResumeSectionEditor.tsx
- src/features/aiResume/components/ResumePaymentReturn.tsx
- src/features/aiResume/aiResume.workflows.test.tsx
- This report

## Existing files modified in this task

- src/constants/routes.ts
- src/routes/routeConfig.tsx
- src/layouts/candidateNavigation.ts
- src/store/store.ts
- src/pages/JobDetailsPage.tsx
- src/pages/jobPages.test.tsx
- src/pages/PhonePeReturnPage.tsx
- src/features/interviewInsights/utils/membershipAccess.ts
- src/features/payments/services/phonePeCheckout.ts
- src/features/payments/services/phonePeCheckout.test.ts

Other pre-existing modified/untracked payment-return files were preserved.

## Validation

- AI Resume focused tests: 28 passed, 0 failed.
- Combined AI Resume/payment/Job Details/route/store regression run: 149 passed, 0 failed across 12 files.
- TypeScript build checks pass.
- Production build and final ESLint/diff results are reported in the final response.
- No full repository test-suite claim is made.

## Manual staging checks after resolving the source ID contract

1. Sign in as a candidate with an uploaded resume; open Job Details and Tailor Resume. Confirm title/company/location and candidate resume. Analyze and inspect Network: request has sourceResumeId + jobId only, no client JD.
2. Open Resume maker from the sidebar. Try empty/short JD, then a valid pasted JD. Confirm the backend source reference and free analysis. Confirm no complete tailored resume is displayed before generation.
3. With zero credits, check backend package prices and purchase with the staging PhonePe environment. Test Pending/Failed/Cancelled. Confirm returning to the same frontend origin restores auth, verifies the purchase and refreshes credits without membership activation.
4. With credits, generate once (including double-click). Refresh the page and confirm restoration. Confirm failures do not fake completion or locally decrement balance.
5. Edit each supported section, reset an unsaved draft, save, and trigger a stale revision using another tab. Confirm no automatic overwrite.
6. Confirm regeneration warns about one credit, handles zero balance, and refreshes persisted content/balance.
7. Download PDF, DOCX and TXT repeatedly. Inspect real generated files and confirm downloads consume no credits. Check Back to Job and Create Another Resume.
8. Compare desktop/laptop/mobile layouts with the six references and check keyboard/dialog accessibility.
9. Recheck existing membership/referral PhonePe returns, Insights access, application quota and account changes/logout.

## Safety

Backend/database/migrations were untouched. No real Claude calls, PhonePe payments, deployments, commits or pushes were performed. Existing local payment-return fixes remain unstaged and preserved. ReferAJobPage.backup.tsx and artifacts/src were not touched.
