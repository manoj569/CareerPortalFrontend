import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES, buildDashboardJobDetailsPath } from '@/constants/routes';
import { useGetProfileQuery, useGetResumeStatusQuery } from '@/features/dashboard/api/dashboardApi';
import type { ResumeMetadata } from '@/features/dashboard/types/dashboardModels';
import {
  CandidateResumeCard,
  type CandidateResumeCardHandle,
} from '@/features/dashboard/components/CandidateResumeCard';
import { PaymentStatus } from '@/features/payments/types/paymentModels';
import { resumeWorkflowStorage, validResumeId } from '../services/resumeWorkflow';
import {
  isSafePhonePeRedirectUrl,
  storePhonePeMerchantOrderId,
  storePhonePeReturnTo,
} from '@/features/payments/services/phonePeCheckout';
import {
  downloadTailoredResume,
  useCreateResumeSessionMutation,
  useAnalyzeResumeMutation,
  useCheckoutResumeMutation,
  useGenerateResumeMutation,
  useGetResumeCreditsQuery,
  useGetResumePackagesQuery,
  useGetResumeSessionQuery,
  useGetTailoredResumeQuery,
  useRegenerateResumeMutation,
  useReviewResumeReplacementMutation,
} from '../api/aiResumeApi';
import type {
  DownloadFormat,
  ReplacementReviewActionRequest,
  ResumePackage,
  ResumeSession,
  TailoredResume,
} from '../types/aiResumeModels';
import { AnalysisScreen, WorkflowPanel } from './AnalysisScreen';
import { ResumePreview } from './ResumePreview';
import { ResumeSectionEditor } from './ResumeSectionEditor';
import { DocumentCapabilitiesNotice } from './DocumentCapabilitiesNotice';
import { resumeErrorCode, resumeErrorMessage } from '../utils/resumeErrors';
import { resumeSections, type ResumeSection } from '../types/resumeSections';
export interface ResumeJob {
  id: string;
  title: string;
  companyName: string;
  location: string | null;
  slug: string;
}
const focusOptions = [
  'Match job keywords',
  'Highlight relevant experience',
  'Improve summary',
  'Emphasize supported skills',
  'Optimize for ATS',
];
const sampleJD =
  'Example job description: Software Engineer\nBuild and maintain web applications using React, TypeScript and REST APIs. Collaborate with designers and engineers, write automated tests, review code, and improve performance. Required: experience with JavaScript, version control and accessible interfaces.';
export const ResumeWorkflow = ({
  job,
  sessionId: initialSessionId,
  onClose,
}: {
  job?: ResumeJob;
  sessionId?: string;
  onClose?: () => void;
}) => {
  const navigate = useNavigate();
  const profile = useGetProfileQuery();
  const resumeStatus = useGetResumeStatusQuery();
  const credits = useGetResumeCreditsQuery();
  const packages = useGetResumePackagesQuery();
  const [sessionId, setSessionId] = useState(initialSessionId ?? '');
  const [session, setSession] = useState<ResumeSession | null>(null);
  const loadedSession = useGetResumeSessionQuery(sessionId, {
    pollingInterval: session?.status === 2 || session?.status === 4 ? 5000 : 0,
    skip: !validResumeId(sessionId),
    refetchOnMountOrArgChange: true,
  });
  const currentSession =
    session ?? (loadedSession.data?.id === sessionId ? loadedSession.data : undefined);
  const resumeQuery = useGetTailoredResumeQuery(currentSession?.tailoredResumeId ?? '', {
    skip: !currentSession?.tailoredResumeId,
  });
  const [resume, setResume] = useState<TailoredResume | null>(null);
  const persistedResume =
    resume ??
    (resumeQuery.data?.id === currentSession?.tailoredResumeId ? resumeQuery.data : undefined);
  const [requiresNewSession, setRequiresNewSession] = useState(false);
  const [editingTarget, setEditingTarget] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [jd, setJD] = useState('');
  const [focus, setFocus] = useState<string[]>(['Match job keywords']);
  const [section, setSection] = useState<ResumeSection>('Professional Summary');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [format, setFormat] = useState<DownloadFormat>('pdf');
  const lock = useRef(false);
  const uploadRef = useRef<CandidateResumeCardHandle>(null);
  const [uploadedResume, setUploadedResume] = useState<ResumeMetadata | null>(null);
  const [analyze] = useAnalyzeResumeMutation();
  const [createSession] = useCreateResumeSessionMutation();
  const [checkout] = useCheckoutResumeMutation();
  const [generate] = useGenerateResumeMutation();
  const [regenerate] = useRegenerateResumeMutation();
  const [reviewReplacement] = useReviewResumeReplacementMutation();
  const restored = useRef(false);
  const serverInProgress = currentSession?.status === 2 || currentSession?.status === 4;
  useEffect(() => {
    if (loadedSession.data?.id === sessionId && !lock.current) setSession(loadedSession.data);
  }, [loadedSession.data, sessionId]);
  useEffect(() => {
    if (!loadedSession.data || loadedSession.data.id !== sessionId) return;
    if (restored.current && loadedSession.data.status !== 3 && loadedSession.data.status !== 5)
      return;
    restored.current = true;
    if (loadedSession.data.tailoredResumeId) setStep(4);
    else if (loadedSession.data.analysis)
      setStep(
        resumeWorkflowStorage.get('purchase') ||
          resumeWorkflowStorage.get('verifiedSession') === sessionId
          ? 2
          : 1,
      );
  }, [loadedSession.data, sessionId]);
  const run = async (label: string, action: () => Promise<void>) => {
    if (lock.current || serverInProgress) return;
    lock.current = true;
    setError(null);
    setBusy(label);
    try {
      await action();
    } catch (err: unknown) {
      if (resumeErrorCode(err) === 'master_snapshot_required') setRequiresNewSession(true);
      if (
        resumeErrorCode(err) === 'no_safe_tailoring_changes' ||
        resumeErrorCode(err) === 'master_snapshot_required'
      )
        void credits.refetch();
      setError(
        resumeErrorMessage(
          err,
          `${label.replace(/…$/, '')} could not be completed. Please try again.`,
        ),
      );
    } finally {
      lock.current = false;
      setBusy(null);
    }
  };
  const beginAnalysis = () => {
    const selectedResume = uploadedResume ?? profile.data?.resume ?? null;
    if (!selectedResume && !resumeStatus.data?.hasResume) {
      setError('Upload your resume before analyzing.');
      return;
    }
    if (!job && !currentSession && (jd.trim().length < 50 || jd.trim().length > 20000)) {
      setError('Job description must be between 50 and 20,000 characters.');
      return;
    }
    void run('Analyzing your resume against this job…', async () => {
      let sourceResumeId =
        [selectedResume?.resumeId, resumeStatus.data?.resumeId].find((value) =>
          validResumeId(value ?? null),
        ) ?? null;
      if (!currentSession && !validResumeId(sourceResumeId)) {
        const [profileResult, statusResult] = await Promise.all([
          profile.refetch().unwrap(),
          resumeStatus.refetch().unwrap(),
        ]);
        sourceResumeId =
          [uploadedResume?.resumeId, profileResult.resume?.resumeId, statusResult.resumeId].find(
            (value) => validResumeId(value ?? null),
          ) ?? null;
      }
      if (!currentSession && !validResumeId(sourceResumeId)) {
        setError("We couldn't load your resume information. Please refresh and try again.");
        return;
      }
      let active = currentSession;
      if (!active) {
        if (!validResumeId(sourceResumeId)) {
          setError("We couldn't load your resume information. Please refresh and try again.");
          return;
        }
        active = await createSession({
          sourceResumeId,
          ...(job ? { jobId: job.id } : { externalJobDescription: jd.trim() }),
        }).unwrap();
      }
      setSession(active);
      setSessionId(active.id);
      resumeWorkflowStorage.set('session', active.id);
      if (job) resumeWorkflowStorage.set('jobSlug', job.slug);
      else resumeWorkflowStorage.remove('jobSlug');
      const result = await analyze(active.id).unwrap();
      setSession(result);
      setStep(1);
    });
  };
  const startPurchase = (pack: ResumePackage) =>
    void run('Opening secure payment…', async () => {
      if (!currentSession) return;
      const checkoutKey = `checkoutKey.${currentSession.id}.${pack.code}`;
      const existingKey = resumeWorkflowStorage.get(checkoutKey);
      const idempotencyKey = existingKey ?? crypto.randomUUID();
      resumeWorkflowStorage.set(checkoutKey, idempotencyKey);
      const purchase = await checkout({
        packageCode: pack.code,
        idempotencyKey,
        sessionId: currentSession.id,
      }).unwrap();
      resumeWorkflowStorage.set('session', currentSession.id);
      if (job) resumeWorkflowStorage.set('jobSlug', job.slug);
      resumeWorkflowStorage.set('purchase', purchase.merchantOrderId);
      if (purchase.status === PaymentStatus.Paid) {
        resumeWorkflowStorage.remove(checkoutKey);
        await credits.refetch().unwrap();
        return;
      }
      if (
        !purchase.redirectUrl ||
        !isSafePhonePeRedirectUrl(purchase.redirectUrl) ||
        !storePhonePeMerchantOrderId(purchase.merchantOrderId)
      )
        throw new Error('Unsafe payment destination');
      storePhonePeReturnTo(ROUTES.RESUME_MAKER);
      window.location.assign(purchase.redirectUrl);
    });
  const makeResume = (again = false) =>
    void run('Tailoring your resume to this job…', async () => {
      if (!currentSession) return;
      const keyName = again
        ? `regenerateKey.${persistedResume?.id ?? ''}`
        : `generationKey.${currentSession.id}`;
      const idempotencyKey = resumeWorkflowStorage.get(keyName) ?? crypto.randomUUID();
      resumeWorkflowStorage.set(keyName, idempotencyKey);
      const result =
        again && persistedResume
          ? await regenerate({ resumeId: persistedResume.id, idempotencyKey }).unwrap()
          : await generate({ sessionId: currentSession.id, idempotencyKey }).unwrap();
      setResume(result);
      setFormat(result.documentCapabilities?.defaultDownloadFormat ?? 'pdf');
      setSession({ ...currentSession, status: 5, tailoredResumeId: result.id });
      setStep(4);
      resumeWorkflowStorage.remove(keyName);
      await credits.refetch().unwrap();
    });
  const review = async (
    targetId: string,
    request: ReplacementReviewActionRequest,
  ): Promise<string | null> => {
    if (lock.current || serverInProgress || !persistedResume)
      return 'Please wait for the current operation to finish.';
    lock.current = true;
    setBusy('Saving changes…');
    setError(null);
    try {
      const saved = await reviewReplacement({
        resumeId: persistedResume.id,
        targetId,
        expectedRevision: persistedResume.editRevision,
        ...request,
      }).unwrap();
      setResume(saved);
      setEditingTarget(null);
      enqueueSnackbar('Resume changes saved.', { variant: 'success' });
      return null;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'status' in err && err.status === 409) {
        try {
          setResume(await resumeQuery.refetch().unwrap());
          setEditingTarget(null);
          setError('Your resume was updated. We refreshed the latest version.');
          return 'Your resume was updated. We refreshed the latest version.';
        } catch {
          const message =
            'Your resume was updated elsewhere. The latest version could not be loaded. Please refresh and try again.';
          setError(message);
          return message;
        }
      }
      return resumeErrorMessage(err, 'These changes could not be saved. Please try again.');
    } finally {
      lock.current = false;
      setBusy(null);
    }
  };
  const download = () =>
    void run('Preparing your resume…', async () => {
      if (!persistedResume || !selectedFormat) return;
      const blob = await downloadTailoredResume(persistedResume.id, selectedFormat);
      const url = URL.createObjectURL(blob);
      try {
        const a = document.createElement('a');
        a.href = url;
        a.download = `tailored-resume.${selectedFormat}`;
        a.click();
      } finally {
        URL.revokeObjectURL(url);
      }
    });
  const newWorkflow = () => {
    resumeWorkflowStorage.remove('verifiedSession');
    resumeWorkflowStorage.remove('session');
    resumeWorkflowStorage.remove('purchase');
    resumeWorkflowStorage.remove('jobSlug');
    setSessionId('');
    setSession(null);
    setResume(null);
    setRequiresNewSession(false);
    setEditingTarget(null);
    setStep(0);
    setJD('');
    restored.current = false;
    void navigate(ROUTES.RESUME_MAKER, { replace: true });
  };
  const stepLabels = [
    job ? 'Job & Resume' : 'Input Details',
    'AI Analysis',
    'Payment',
    'Generate Resume',
    'Review & Edit',
    'Download',
  ];
  const content = persistedResume?.content;
  const capabilities =
    persistedResume?.documentCapabilities ?? currentSession?.documentCapabilities;
  const olderSession = requiresNewSession || currentSession?.documentCapabilities === null;
  const rejectedCount =
    persistedResume?.tailoring?.replacements.filter((decision) => decision.status === 'rejected')
      .length ?? 0;
  const availableFormats = persistedResume?.documentCapabilities
    ? persistedResume.documentCapabilities.downloadFormats.filter((value) =>
        ['pdf', 'docx', 'txt'].includes(value),
      )
    : (['pdf', 'docx', 'txt'] as DownloadFormat[]);
  const selectedFormat = availableFormats.includes(format)
    ? format
    : capabilities && availableFormats.includes(capabilities.defaultDownloadFormat)
      ? capabilities.defaultDownloadFormat
      : (availableFormats.at(0) ?? null);
  const balance = credits.data?.balance;
  const jobSlug =
    job?.slug ?? (currentSession?.jobId ? resumeWorkflowStorage.get('jobSlug') : null);
  return (
    <Stack spacing={3} sx={{ color: '#101832', p: { xs: 2, md: job ? 3.5 : 0 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h4" fontWeight={750}>
              {job ? 'AI Resume Tailor' : 'AI Resume Maker'}
            </Typography>
            {job && <Chip label="Beta" size="small" color="primary" />}
          </Stack>
          <Typography color="text.secondary" mt={1}>
            {job
              ? 'Create a job-specific resume that matches this position in minutes.'
              : 'Create job-specific, ATS-friendly resumes in minutes. Upload your resume, paste a job description, and get a tailored resume using AI.'}
          </Typography>
        </Box>
        {onClose && (
          <Button onClick={onClose} aria-label="Close AI Resume Tailor">
            ✕
          </Button>
        )}
      </Stack>
      {!job && (
        <Stack direction="row" spacing={3} flexWrap="wrap">
          {['ATS Optimized', 'Job Specific', 'Supported Resume Facts'].map((text) => (
            <Chip key={text} icon={<AutoAwesomeIcon />} label={text} variant="outlined" />
          ))}
        </Stack>
      )}
      <WorkflowPanel>
        <Box sx={{ overflowX: 'auto' }}>
          <Stepper activeStep={busy?.startsWith('Tailoring') ? 3 : step} sx={{ minWidth: 680 }}>
            {stepLabels.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </WorkflowPanel>
      {(profile.isError || loadedSession.isError || resumeQuery.isError || credits.isError) && (
        <Alert
          severity="error"
          action={
            <Button
              onClick={() => {
                void profile.refetch();
                void credits.refetch();
                if (sessionId) void loadedSession.refetch();
              }}
            >
              Retry
            </Button>
          }
        >
          Your resume or session could not be loaded. Please try again.
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {serverInProgress && !busy && (
        <Alert severity="info" role="status">
          Your saved resume session is still processing. It will refresh automatically.
        </Alert>
      )}
      {busy && (
        <Alert icon={<CircularProgress size={20} />} severity="info" role="status">
          {busy}
        </Alert>
      )}
      <DocumentCapabilitiesNotice capabilities={capabilities} />
      {olderSession && (
        <Alert
          severity="info"
          action={
            <Button disabled={Boolean(busy)} onClick={newWorkflow}>
              Create a new tailoring session
            </Button>
          }
        >
          This resume session was created with an older version. Create a new tailoring session to
          use original-format resume tailoring.
        </Alert>
      )}
      {step === 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.3fr 1fr' }, gap: 2 }}>
          <WorkflowPanel>
            <Stack spacing={2.5}>
              {job && (
                <>
                  <Typography variant="h6" fontWeight={700}>
                    1. Job Information
                  </Typography>
                  <Alert severity="success">
                    <Typography fontWeight={700}>Job description loaded</Typography>
                    {job.title}
                    <br />
                    {job.companyName}
                    {job.location && ` · ${job.location}`}
                  </Alert>
                </>
              )}
              <Typography variant="h6" fontWeight={700}>
                {job ? '2. Select Your Resume' : '1. Upload Your Resume'}
              </Typography>
              {profile.isLoading ? (
                <CircularProgress size={24} />
              ) : (
                <CandidateResumeCard
                  onResumeUpdated={setUploadedResume}
                  ref={uploadRef}
                  resume={uploadedResume ?? profile.data?.resume ?? null}
                />
              )}
              <Button
                variant="outlined"
                startIcon={<FileUploadOutlinedIcon />}
                onClick={() => uploadRef.current?.chooseFile()}
              >
                Upload a different resume
              </Button>
              {job ? (
                <>
                  <Typography fontWeight={700}>
                    3. What would you like to focus on? (Optional)
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {focusOptions.map((text) => (
                      <Chip
                        key={text}
                        label={text}
                        variant="outlined"
                        color={focus.includes(text) ? 'primary' : 'default'}
                        onClick={() =>
                          setFocus(
                            focus.includes(text)
                              ? focus.filter((x) => x !== text)
                              : [...focus, text],
                          )
                        }
                      />
                    ))}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Focus selections are preferences only; analysis uses the backend’s supported job
                    and resume contract.
                  </Typography>
                </>
              ) : (
                <>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={700}>
                      2. Paste Job Description
                    </Typography>
                    <Button variant="outlined" onClick={() => setJD(sampleJD)}>
                      Try a sample JD
                    </Button>
                  </Stack>
                  <Typography color="text.secondary">
                    Paste the complete job description of the role you are targeting.
                  </Typography>
                  <TextField
                    label="Job description"
                    placeholder="Paste the job description here…"
                    multiline
                    minRows={9}
                    fullWidth
                    value={jd}
                    onChange={(e) => setJD(e.target.value)}
                    slotProps={{ htmlInput: { maxLength: 20000 } }}
                    disabled={Boolean(currentSession)}
                    helperText={
                      currentSession
                        ? `Saved job description: ${currentSession.jobTitle}`
                        : `${jd.length}/20000`
                    }
                  />
                  <Alert severity="info">
                    Include the complete role, responsibilities, skills and qualifications for
                    better results.
                  </Alert>
                </>
              )}
              <Button
                variant="contained"
                size="large"
                disabled={Boolean(busy) || serverInProgress || profile.isLoading}
                onClick={beginAnalysis}
                startIcon={<AutoAwesomeIcon />}
              >
                {job ? 'Analyze My Resume for This Job' : 'Analyze My Resume'} →
              </Button>
              <Typography variant="caption" color="text.secondary">
                This analysis is free. You can preview AI suggestions before paying to generate the
                final resume.
              </Typography>
            </Stack>
          </WorkflowPanel>
          <Stack spacing={2}>
            <WorkflowPanel tint="#f8fbff">
              <Typography variant="h6" fontWeight={700}>
                What happens next?{' '}
                <Typography component="span" color="text.secondary">
                  (Free Analysis)
                </Typography>
              </Typography>
              <Stack spacing={3} mt={3}>
                {[
                  ['Match Score', 'See how well your resume matches this JD.'],
                  ['Skills Analysis', 'Matched, partial and missing skills.'],
                  ['Improvement Suggestions', 'Get AI insights to improve your resume.'],
                  [
                    'Resume Preview (Summary)',
                    'See suggestions; the complete resume requires a credit.',
                  ],
                ].map(([title, text]) => (
                  <Stack direction="row" gap={2} key={title}>
                    <AutoAwesomeIcon color="primary" />
                    <Box>
                      <Typography fontWeight={700}>{title}</Typography>
                      <Typography color="text.secondary">{text}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </WorkflowPanel>
            {!job && (
              <WorkflowPanel>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontWeight={700}>Example Job Description</Typography>
                  <Button onClick={() => setJD(sampleJD)}>Use this sample</Button>
                </Stack>
                <Typography
                  component="pre"
                  sx={{ whiteSpace: 'pre-wrap', fontSize: 12, mt: 2, p: 2, bgcolor: '#f8faff' }}
                >
                  {sampleJD}
                </Typography>
              </WorkflowPanel>
            )}
          </Stack>
        </Box>
      )}
      {step === 1 && currentSession?.analysis && (
        <AnalysisScreen
          analysis={currentSession.analysis}
          onContinue={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}
      {step === 2 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' }, gap: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h4" fontWeight={700}>
              Unlock Your Tailored Resume
            </Typography>
            <Typography color="text.secondary">
              Your job and resume are analyzed. Now apply validated wording changes to your original
              resume.
            </Typography>
            <Stack direction="row" spacing={2}>
              {['ATS optimized', 'Supported wording', 'Original resume as source'].map((text) => (
                <Chip key={text} label={text} icon={<AutoAwesomeIcon />} />
              ))}
            </Stack>
            {balance === undefined ? (
              <Alert severity="info">Checking your resume credits…</Alert>
            ) : balance > 0 ? (
              <WorkflowPanel tint="#f0fbf5">
                <Typography variant="h6">{balance} resume credits available</Typography>
                <Button
                  disabled={Boolean(busy) || serverInProgress || olderSession}
                  size="large"
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={() => makeResume()}
                >
                  Generate Resume — Uses 1 Credit
                </Button>
              </WorkflowPanel>
            ) : (
              <>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' },
                    gap: 1.5,
                  }}
                >
                  {packages.data?.map((pack) => (
                    <WorkflowPanel key={pack.code} tint={pack.isPopular ? '#f1f7ff' : 'white'}>
                      {pack.isPopular && (
                        <Chip label="👑 Most Popular" color="primary" size="small" />
                      )}
                      <Typography fontWeight={700} mt={2}>
                        {pack.name}
                      </Typography>
                      <Typography variant="h4" fontWeight={700} my={2}>
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: pack.currencyCode,
                          maximumFractionDigits: 2,
                        }).format(pack.price)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {pack.credits} {pack.credits === 1 ? 'resume credit' : 'resume credits'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {pack.pricePerResume} per resume
                      </Typography>
                      <Button
                        disabled={Boolean(busy) || serverInProgress}
                        variant={pack.isPopular ? 'contained' : 'outlined'}
                        fullWidth
                        sx={{ mt: 3 }}
                        onClick={() => startPurchase(pack)}
                      >
                        Select
                      </Button>
                    </WorkflowPanel>
                  ))}
                </Box>
                {packages.isError && (
                  <Alert
                    severity="error"
                    action={<Button onClick={() => void packages.refetch()}>Retry</Button>}
                  >
                    Resume packages could not be loaded.
                  </Alert>
                )}
                <Typography fontWeight={700}>Secure Payment</Typography>
                <Typography color="text.secondary">
                  Pay securely through PhonePe. Credits are added only after backend verification.
                </Typography>
              </>
            )}
            <Button variant="outlined" sx={{ alignSelf: 'flex-start' }} onClick={() => setStep(1)}>
              ← Back to Analysis
            </Button>
          </Stack>
          <Stack spacing={2}>
            <WorkflowPanel tint="#f3f9ff">
              <Typography variant="h6" fontWeight={700}>
                Analysis Summary (Free)
              </Typography>
              <Typography mt={2}>{currentSession?.jobTitle}</Typography>
              {currentSession?.analysis && (
                <Stack spacing={1} mt={2}>
                  <Chip
                    label={`${currentSession.analysis.overallMatchScore}% Match`}
                    color="success"
                  />
                  <Typography>
                    {currentSession.analysis.matchedSkills.length} skills match your resume
                  </Typography>
                  <Typography>
                    {currentSession.analysis.partialMatches.length} partial matches
                  </Typography>
                  <Typography>
                    {currentSession.analysis.missingSkills.length} important skills missing
                  </Typography>
                  <Typography>
                    {currentSession.analysis.suggestions.length} resume improvements suggested
                  </Typography>
                </Stack>
              )}
            </WorkflowPanel>
            <WorkflowPanel tint="#f4f1ff">
              <Typography variant="h6" fontWeight={700}>
                What you will get after payment
              </Typography>
              <Stack spacing={1.5} mt={2}>
                {[
                  'Validated wording changes to your resume (1 credit)',
                  'Improved professional summary',
                  'Skills and experience supported by your source resume',
                  'Preview and edit before downloading',
                  'Download in the formats supported by your document',
                ].map((text) => (
                  <Typography key={text}>✓ {text}</Typography>
                ))}
              </Stack>
            </WorkflowPanel>
            <Alert severity="info">
              Only CareerHarbor’s backend processes resume analysis, credits and payments.
            </Alert>
          </Stack>
        </Box>
      )}
      {step === 4 &&
        (content && persistedResume ? (
          <>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Review Your Tailored Resume
                </Typography>
                <Typography color="text.secondary">
                  Review targeted wording changes to your original resume.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                disabled={
                  Boolean(busy) ||
                  serverInProgress ||
                  balance === undefined ||
                  olderSession ||
                  Boolean(editingTarget)
                }
                onClick={() => {
                  if (!balance) setStep(2);
                  else setRegenerateOpen(true);
                }}
              >
                Regenerate with AI
              </Button>
            </Stack>
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' }, gap: 3 }}
            >
              <WorkflowPanel>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '180px 1fr' },
                    gap: 2,
                  }}
                >
                  <Stack spacing={1}>
                    {resumeSections.map((label) => (
                      <Button
                        key={label}
                        variant={section === label ? 'contained' : 'text'}
                        onClick={() => setSection(label)}
                        sx={{ justifyContent: 'flex-start' }}
                        disabled={Boolean(editingTarget) || Boolean(busy)}
                      >
                        {label}
                      </Button>
                    ))}
                  </Stack>
                  <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={700}>
                      {section}
                    </Typography>
                    {persistedResume.tailoring ? (
                      <ResumeSectionEditor
                        section={section}
                        content={content}
                        replacements={persistedResume.tailoring.replacements}
                        revision={persistedResume.editRevision}
                        busy={Boolean(busy) || serverInProgress}
                        onReview={review}
                        editingTarget={editingTarget}
                        onEditingChange={setEditingTarget}
                      />
                    ) : (
                      <Alert severity="info">
                        This older resume is available to download. Create a new tailoring session
                        to review original-document changes.
                      </Alert>
                    )}
                  </Stack>
                </Box>
                <Stack direction="row" justifyContent="space-between" mt={5}>
                  <Button
                    disabled={Boolean(editingTarget) || Boolean(busy)}
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    disabled={Boolean(busy) || serverInProgress || Boolean(editingTarget)}
                    onClick={() => setStep(5)}
                  >
                    Continue to Download →
                  </Button>
                </Stack>
                {rejectedCount > 0 && (
                  <Typography variant="caption">
                    {rejectedCount} {rejectedCount === 1 ? 'suggestion was' : 'suggestions were'}{' '}
                    skipped because they were not sufficiently supported by your resume. Original
                    text is retained.
                  </Typography>
                )}
              </WorkflowPanel>
              <Stack spacing={2}>
                <Typography fontWeight={700}>Resume Preview</Typography>
                <Typography variant="caption" color="text.secondary">
                  Content preview. The downloaded document uses the format indicated above.
                </Typography>
                <ResumePreview content={persistedResume.content} />
              </Stack>
            </Box>
          </>
        ) : (
          <Alert icon={<CircularProgress size={20} />}>Loading your generated resume…</Alert>
        ))}
      {step === 5 && persistedResume && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.7fr 1fr' }, gap: 3 }}>
          <WorkflowPanel tint="#f5faff">
            <Typography variant="h4" textAlign="center" fontWeight={700} mb={1}>
              Your tailored resume is ready!
            </Typography>
            <Typography textAlign="center" color="text.secondary" mb={3}>
              Download your resume in your preferred format.
            </Typography>
            <ResumePreview content={persistedResume.content} />
          </WorkflowPanel>
          <Stack spacing={2}>
            <WorkflowPanel>
              <Typography variant="h6" fontWeight={700}>
                Download Your Resume
              </Typography>
              <Typography color="text.secondary" mb={2}>
                Choose your preferred format.
              </Typography>
              <Stack spacing={1.5}>
                {availableFormats.map((value) => (
                  <Button
                    key={value}
                    variant={selectedFormat === value ? 'contained' : 'outlined'}
                    size="large"
                    fullWidth
                    onClick={() => setFormat(value)}
                    aria-pressed={selectedFormat === value}
                  >
                    {value.toUpperCase()}
                  </Button>
                ))}
                <Button
                  variant="contained"
                  size="large"
                  disabled={Boolean(busy) || serverInProgress || !selectedFormat}
                  onClick={download}
                >
                  Download {selectedFormat?.toUpperCase() ?? 'Resume'}
                </Button>
              </Stack>
            </WorkflowPanel>
            <WorkflowPanel tint="#f6f9ff">
              <Typography fontWeight={700}>What’s next?</Typography>
              <Typography my={2}>{balance ?? 'Checking'} resume credits remaining</Typography>
              {jobSlug && (
                <Button onClick={() => void navigate(buildDashboardJobDetailsPath(jobSlug))}>
                  Back to Job
                </Button>
              )}
              <Button variant="outlined" onClick={newWorkflow}>
                Create Another Resume
              </Button>
              <Button onClick={() => setStep(4)}>Back to Review & Edit</Button>
            </WorkflowPanel>
          </Stack>
        </Box>
      )}
      <Dialog open={regenerateOpen} onClose={() => setRegenerateOpen(false)}>
        <DialogTitle>Regenerate with AI</DialogTitle>
        <DialogContent>Regenerating uses 1 resume credit. Continue?</DialogContent>
        <DialogActions>
          <Button onClick={() => setRegenerateOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setRegenerateOpen(false);
              makeResume(true);
            }}
          >
            Use 1 Credit
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
