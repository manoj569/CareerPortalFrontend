export const resumeErrorCode = (error: unknown): string | null =>
  error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
    ? error.code
    : null;

export const resumeErrorMessage = (error: unknown, fallback: string): string => {
  const code = resumeErrorCode(error);
  if (code === 'master_snapshot_required' || code === 'legacy_resume_review')
    return 'This resume session was created with an older version. Create a new tailoring session to use original-format resume tailoring.';
  if (code === 'no_safe_tailoring_changes')
    return "We couldn't find enough safe changes for this job description. Your resume was not modified and your credit was restored.";
  if (code === 'insufficient_resume_credits')
    return 'You need a resume credit to tailor your resume. Choose a package to continue.';
  if (code === 'unsupported_claims')
    return 'This wording is not supported by your source resume. Please revise your edit and try again.';
  if (code === 'resume_revision_conflict')
    return 'Your resume was updated. We refreshed the latest version.';
  if (code === 'invalid_download_format')
    return 'This download format is unavailable. Choose an available format.';
  if (code === 'resume_artifact_unavailable' || code === 'document_service_unavailable')
    return 'Your resume document is temporarily unavailable. Please try again later.';
  if (code === 'analysis_required')
    return 'Complete the free analysis before tailoring your resume.';
  if (code === 'generation_in_progress' || code === 'analysis_in_progress')
    return 'This operation is already in progress. Please wait for it to finish.';
  if (error && typeof error === 'object' && 'status' in error) {
    if (error.status === 401) return 'Your session expired. Please sign in again.';
    if (error.status === 403 || error.status === 404)
      return 'This resume or session is unavailable for your account.';
    if (error.status === 400)
      return 'These changes could not be saved. Check the wording and try again.';
    if (error.status === 409)
      return 'This operation conflicts with the latest saved state. Refresh the session before trying again.';
    if (error.status === 429) return 'Too many requests. Please wait and try again.';
    if (error.status === 503)
      return 'Resume tailoring is temporarily unavailable. Please try again later.';
  }
  return fallback;
};
