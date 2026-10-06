import { ApiRequestError } from '@/api/apiError';
import { PhonePeReturnPage } from '@/pages/PhonePeReturnPage';
import { ResumeMakerPage } from '@/pages/ResumeMakerPage';
import { resumeWorkflowStorage } from './services/resumeWorkflow';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '@/test/renderWithProviders';
import { ResumeWorkflow } from './components/ResumeWorkflow';
import { ResumePreview } from './components/ResumePreview';
import { AnalysisScreen } from './components/AnalysisScreen';
import { ResumePaymentReturn } from './components/ResumePaymentReturn';
import { useGetProfileQuery, useGetResumeStatusQuery } from '@/features/dashboard/api/dashboardApi';
import type * as DashboardModule from '@/features/dashboard/api/dashboardApi';
import * as api from './api/aiResumeApi';
import type { ResumeContent, ResumeSession, TailoredResume } from './types/aiResumeModels';
import type { ResumeMetadata } from '@/features/dashboard/types/dashboardModels';
import { UserRole } from '@/types';
import { PaymentStatus } from '@/features/payments/types/paymentModels';
import { ROUTES } from '@/constants/routes';
import { candidateNavigationItems } from '@/layouts/candidateNavigation';
vi.mock('@/features/dashboard/api/dashboardApi', async (original) => ({
  ...(await original<typeof DashboardModule>()),
  useGetProfileQuery: vi.fn(),
  useGetResumeStatusQuery: vi.fn(),
}));
vi.mock('@/features/dashboard/components/CandidateResumeCard', () => ({
  CandidateResumeCard: ({
    resume,
    onResumeUpdated,
  }: {
    resume: ResumeMetadata | null;
    onResumeUpdated?: (resume: ResumeMetadata) => void;
  }) => (
    <div>
      {resume?.fileName ?? 'No resume uploaded'}
      <button
        onClick={() =>
          onResumeUpdated?.({
            resumeId: mockUploadedResumeId,
            fileName: 'new-resume.pdf',
            contentType: 'application/pdf',
            sizeBytes: 32,
            uploadedAtUtc: '2026-10-05T00:00:00Z',
          })
        }
      >
        Simulate resume upload response
      </button>
    </div>
  ),
}));
vi.mock('./api/aiResumeApi', async (original) => ({
  ...(await original<typeof api>()),
  useGetResumeCreditsQuery: vi.fn(),
  useGetResumePackagesQuery: vi.fn(),
  useGetResumeSessionQuery: vi.fn(),
  useGetTailoredResumeQuery: vi.fn(),
  useGetResumePurchaseQuery: vi.fn(),
  useCreateResumeSessionMutation: vi.fn(),
  useAnalyzeResumeMutation: vi.fn(),
  useCheckoutResumeMutation: vi.fn(),
  useGenerateResumeMutation: vi.fn(),
  useRegenerateResumeMutation: vi.fn(),
  useEditResumeMutation: vi.fn(),
  useReviewResumeReplacementMutation: vi.fn(),
  downloadTailoredResume: vi.fn(),
}));
const id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const candidateResumeId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const mockUploadedResumeId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const content: ResumeContent = {
  contact: {
    name: 'Real Candidate',
    email: 'candidate@example.com',
    phone: '',
    location: 'Pune',
    links: [],
  },
  professionalSummary: 'Persisted generated summary',
  skills: ['React'],
  experience: [],
  projects: [],
  education: [],
  certifications: [],
  additionalInfo: [],
  evidence: [],
};
const analysis = {
  overallMatchScore: 73,
  matchedSkills: ['React'],
  partialMatches: ['TypeScript'],
  missingSkills: ['SQL'],
  jobRequirements: ['Build web apps'],
  strengths: ['UI experience'],
  areasToImprove: ['SQL evidence'],
  suggestions: ['Highlight relevant projects'],
};
const session: ResumeSession = {
  id,
  sourceResumeId: id,
  jobId: null,
  sourceType: 'EXTERNAL_JD',
  jobTitle: 'Frontend Engineer',
  companyName: 'Backend Company',
  status: 3,
  analysis,
  tailoredResumeId: null,
  documentCapabilities: {
    preservationMode: 'rendered_fallback',
    originalFileType: 'pdf',
    layoutPreserved: false,
    defaultDownloadFormat: 'pdf',
    downloadFormats: ['pdf', 'docx', 'txt'],
    limitation: 'Original layout is unavailable.',
  },
};
const resume: TailoredResume = {
  id,
  sessionId: id,
  version: 1,
  editRevision: 2,
  generatedAtUtc: '2026-10-05T00:00:00Z',
  updatedAtUtc: null,
  templateCode: 'professional',
  content,
  documentCapabilities: session.documentCapabilities,
  tailoring: {
    emphasizedSkillEvidenceIds: [],
    replacements: [
      {
        proposal: {
          targetId: 'SRC-SUMMARY-001',
          originalText: 'Original supported summary',
          replacementText: content.professionalSummary,
          sourceEvidenceIds: ['SRC-SUMMARY-001'],
          matchedJdTerms: ['performance optimization'],
          reason: 'Emphasize supported performance optimization.',
        },
        status: 'accepted',
        rejectionCategory: null,
        rejectionReason: null,
        editedText: null,
      },
    ],
  },
};
const create = vi.fn();
const analyze = vi.fn();
const generate = vi.fn<(request: { sessionId: string; idempotencyKey: string }) => unknown>();
const edit = vi.fn();
const review = vi.fn();
const regenerate = vi.fn();
const checkout =
  vi.fn<
    (request: { packageCode: string; sessionId?: string; idempotencyKey: string }) => unknown
  >();
const refetchCredits = vi.fn();
const refetchResume = vi.fn();
const auth = {
  status: 'authenticated' as const,
  user: {
    id: 'candidate',
    firstName: 'Real',
    lastName: 'Candidate',
    email: 'candidate@example.com',
    role: UserRole.Candidate,
  },
  error: null,
  isSubmitting: false,
  accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
};
const render = (props: React.ComponentProps<typeof ResumeWorkflow> = {}) =>
  renderWithProviders(
    <MemoryRouter>
      <ResumeWorkflow {...props} />
    </MemoryRouter>,
    { auth },
  );
const showGenerated = (value: TailoredResume = resume) => {
  vi.mocked(api.useGetResumeSessionQuery).mockReturnValue({
    data: { ...session, tailoredResumeId: id },
  } as unknown as ReturnType<typeof api.useGetResumeSessionQuery>);
  vi.mocked(api.useGetTailoredResumeQuery).mockReturnValue({
    data: value,
    refetch: refetchResume,
  });
  return render({ sessionId: id });
};
beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  vi.mocked(useGetProfileQuery).mockReturnValue({
    data: { resume: { resumeId: candidateResumeId, fileName: 'my-resume.pdf' } },
  } as unknown as ReturnType<typeof useGetProfileQuery>);
  vi.mocked(useGetResumeStatusQuery).mockReturnValue({
    data: { hasResume: true, resumeId: candidateResumeId },
    refetch: vi.fn().mockReturnValue({
      unwrap: () => Promise.resolve({ hasResume: true, resumeId: candidateResumeId }),
    }),
  });
  refetchResume.mockReturnValue({ unwrap: () => Promise.resolve({ ...resume, editRevision: 8 }) });
  refetchCredits.mockReturnValue({ unwrap: () => Promise.resolve({ balance: 3 }) });
  vi.mocked(api.useGetResumeCreditsQuery).mockReturnValue({
    data: { balance: 3 },
    refetch: refetchCredits,
  });
  vi.mocked(api.useGetResumePackagesQuery).mockReturnValue({
    data: [
      {
        code: 'SERVER_PACK',
        name: 'Backend package',
        price: 42,
        credits: 2,
        isPopular: true,
        currencyCode: 'INR',
        pricePerResume: 21,
      },
    ],
  } as unknown as ReturnType<typeof api.useGetResumePackagesQuery>);
  vi.mocked(api.useGetResumeSessionQuery).mockReturnValue({
    data: undefined,
  } as unknown as ReturnType<typeof api.useGetResumeSessionQuery>);
  vi.mocked(api.useGetTailoredResumeQuery).mockReturnValue({
    data: undefined,
  } as unknown as ReturnType<typeof api.useGetTailoredResumeQuery>);
  vi.mocked(api.useCreateResumeSessionMutation).mockReturnValue([
    create,
    {},
  ] as unknown as ReturnType<typeof api.useCreateResumeSessionMutation>);
  vi.mocked(api.useAnalyzeResumeMutation).mockReturnValue([analyze, {}] as unknown as ReturnType<
    typeof api.useAnalyzeResumeMutation
  >);
  vi.mocked(api.useGenerateResumeMutation).mockReturnValue([generate, {}] as unknown as ReturnType<
    typeof api.useGenerateResumeMutation
  >);
  vi.mocked(api.useEditResumeMutation).mockReturnValue([edit, {}] as unknown as ReturnType<
    typeof api.useEditResumeMutation
  >);
  vi.mocked(api.useRegenerateResumeMutation).mockReturnValue([
    regenerate,
    {},
  ] as unknown as ReturnType<typeof api.useRegenerateResumeMutation>);
  vi.mocked(api.useCheckoutResumeMutation).mockReturnValue([checkout, {}] as unknown as ReturnType<
    typeof api.useCheckoutResumeMutation
  >);
  vi.mocked(api.useReviewResumeReplacementMutation).mockReturnValue([
    review,
    {},
  ] as unknown as ReturnType<typeof api.useReviewResumeReplacementMutation>);
  create.mockReturnValue({ unwrap: () => Promise.resolve(session) });
  analyze.mockReturnValue({ unwrap: () => Promise.resolve(session) });
  generate.mockReturnValue({ unwrap: () => Promise.resolve(resume) });
  edit.mockReturnValue({ unwrap: () => Promise.resolve(resume) });
  review.mockReturnValue({ unwrap: () => Promise.resolve({ ...resume, editRevision: 3 }) });
  regenerate.mockReturnValue({ unwrap: () => Promise.resolve(resume) });
});
describe('AI Resume shared workflow', () => {
  it('adds the Resume maker navigation destination with its approved badge', () => {
    expect(candidateNavigationItems).toContainEqual(
      expect.objectContaining({
        label: 'Resume maker',
        path: '/dashboard/resume-maker',
        badge: 'New',
      }),
    );
  });
  it('selects the existing resume and validates an empty external JD without AI calls', async () => {
    render();
    expect(screen.getByText('my-resume.pdf')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Analyze My Resume →' }));
    expect(screen.getByText(/between 50 and 20,000/)).toBeVisible();
    expect(create).not.toHaveBeenCalled();
  });
  it('refreshes profile and status once and safely handles a still-missing resume ID', async () => {
    const profileRefetch = vi.fn().mockReturnValue({
      unwrap: () => Promise.resolve({ resume: { fileName: 'legacy.pdf' } }),
    });
    const statusRefetch = vi.fn().mockReturnValue({
      unwrap: () => Promise.resolve({ hasResume: true }),
    });
    vi.mocked(useGetProfileQuery).mockReturnValue({
      data: { resume: { fileName: 'legacy.pdf' } },
      refetch: profileRefetch,
    });
    vi.mocked(useGetResumeStatusQuery).mockReturnValue({
      data: { hasResume: true },
      refetch: statusRefetch,
    });
    render();
    fireEvent.change(screen.getByLabelText('Job description'), {
      target: {
        value:
          'A complete job description with enough information about React and TypeScript applications.',
      },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Analyze My Resume →' }));
    expect(
      await screen.findByText(
        "We couldn't load your resume information. Please refresh and try again.",
      ),
    ).toBeVisible();
    expect(create).not.toHaveBeenCalled();
    expect(profileRefetch).toHaveBeenCalledTimes(1);
    expect(statusRefetch).toHaveBeenCalledTimes(1);
  });
  it('uses jobId and sourceResumeId without submitting a client JD', async () => {
    render({
      job: {
        id,
        slug: 'engineer',
        title: 'Backend job title',
        companyName: 'Backend company',
        location: 'Pune',
      },
    });
    await userEvent.click(screen.getByRole('button', { name: /Analyze My Resume for This Job/ }));
    expect(create).toHaveBeenCalledWith({ sourceResumeId: candidateResumeId, jobId: id });
    expect(await screen.findByText('73%')).toBeVisible();
  });
  it('Resume Maker submits pasted JD using the profile resumeId and actual session contract', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/dashboard/resume-maker']}>
        <ResumeMakerPage />
      </MemoryRouter>,
      { auth },
    );
    const jd =
      'Build accessible React and TypeScript applications with REST APIs, automated tests, and code reviews.';
    fireEvent.change(screen.getByLabelText('Job description'), { target: { value: jd } });
    await userEvent.click(screen.getByRole('button', { name: 'Analyze My Resume →' }));
    expect(create).toHaveBeenCalledWith({
      sourceResumeId: candidateResumeId,
      externalJobDescription: jd,
    });
    expect(analyze).toHaveBeenCalledWith(id);
  });
  it('uses the persistent resumeId returned by a new upload immediately', async () => {
    render();
    await userEvent.click(screen.getByRole('button', { name: 'Simulate resume upload response' }));
    fireEvent.change(screen.getByLabelText('Job description'), {
      target: {
        value:
          'A complete job description with enough information about React and TypeScript applications.',
      },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Analyze My Resume →' }));
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ sourceResumeId: mockUploadedResumeId }),
    );
    expect(create.mock.calls[0]?.[0]).not.toHaveProperty('fileName');
    expect(create.mock.calls[0]?.[0]).not.toHaveProperty('url');
    expect(create.mock.calls[0]?.[0]).not.toHaveProperty('userId');
  });
  it('renders real match data without exposing a complete paid resume', () => {
    renderWithProviders(
      <AnalysisScreen analysis={analysis} onBack={vi.fn()} onContinue={vi.fn()} />,
    );
    expect(screen.getByText('73%')).toBeVisible();
    expect(screen.getByText('React · In your resume')).toBeVisible();
    expect(screen.getByText('TypeScript · Partial match')).toBeVisible();
    expect(screen.getByText('SQL · Not found')).toBeVisible();
    expect(screen.queryByText(content.professionalSummary)).not.toBeInTheDocument();
  });
  it('uses available credits and renders backend generation without requiring purchase', async () => {
    vi.mocked(api.useGetResumeSessionQuery).mockReturnValue({
      data: session,
    } as unknown as ReturnType<typeof api.useGetResumeSessionQuery>);
    render({ sessionId: id });
    await userEvent.click(await screen.findByRole('button', { name: /Continue to Payment/ }));
    expect(screen.getByText('3 resume credits available')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Generate Resume — Uses 1 Credit' }));
    expect(await screen.findByRole('button', { name: 'Accept' })).toBeVisible();
    expect(screen.getAllByText(content.professionalSummary).length).toBeGreaterThan(0);
    const [generationCall] = generate.mock.calls;
    if (!generationCall) throw new Error('Expected generation request');
    expect(generationCall[0].sessionId).toBe(id);
    expect(generationCall[0].idempotencyKey).toMatch(/^[0-9a-f-]{36}$/i);
    expect(checkout).not.toHaveBeenCalled();
    expect(refetchCredits).toHaveBeenCalled();
  });
  it('renders backend package values with zero credits and sends only package, session and idempotency key', async () => {
    vi.mocked(api.useGetResumeCreditsQuery).mockReturnValue({
      data: { balance: 0 },
      refetch: refetchCredits,
    });
    vi.mocked(api.useGetResumeSessionQuery).mockReturnValue({
      data: session,
    } as unknown as ReturnType<typeof api.useGetResumeSessionQuery>);
    checkout.mockReturnValue({ unwrap: () => Promise.resolve({ status: PaymentStatus.Paid }) });
    render({ sessionId: id });
    await userEvent.click(await screen.findByRole('button', { name: /Continue to Payment/ }));
    expect(screen.getByText('₹42.00')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Select' }));
    const [checkoutCall] = checkout.mock.calls;
    if (!checkoutCall) throw new Error('Expected checkout request');
    expect(checkoutCall[0].packageCode).toBe('SERVER_PACK');
    expect(checkoutCall[0].sessionId).toBe(id);
    expect(checkoutCall[0].idempotencyKey).toMatch(/^[0-9a-f-]{36}$/i);
  });
  it('prevents duplicate generation and displays a safe failure', async () => {
    let reject: (error: unknown) => void = () => {
      throw new Error('Generation not started');
    };
    generate.mockReturnValue({
      unwrap: () =>
        new Promise((_, r) => {
          reject = r;
        }),
    });
    vi.mocked(api.useGetResumeSessionQuery).mockReturnValue({
      data: session,
    } as unknown as ReturnType<typeof api.useGetResumeSessionQuery>);
    render({ sessionId: id });
    await userEvent.click(await screen.findByRole('button', { name: /Continue to Payment/ }));
    await userEvent.dblClick(
      screen.getByRole('button', { name: 'Generate Resume — Uses 1 Credit' }),
    );
    expect(generate).toHaveBeenCalledTimes(1);
    await act(async () => {
      reject({ status: 503, message: 'secret-provider-stack' });
      await Promise.resolve();
    });
    expect(
      await screen.findByText(
        'Resume tailoring is temporarily unavailable. Please try again later.',
      ),
    ).toBeVisible();
    expect(screen.queryByText('secret-provider-stack')).not.toBeInTheDocument();
  });
  it('saves manual edits with expected revision and no generation or credit consumption', async () => {
    showGenerated();
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    const field = screen.getByLabelText('Replacement text');
    await userEvent.clear(field);
    await userEvent.type(field, 'Edited summary');
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(review).toHaveBeenCalledWith({
      resumeId: id,
      targetId: 'SRC-SUMMARY-001',
      expectedRevision: 2,
      action: 'edit',
      replacementText: 'Edited summary',
    });
    expect(edit).not.toHaveBeenCalled();
    expect(generate).not.toHaveBeenCalled();
    expect(regenerate).not.toHaveBeenCalled();
    expect(refetchCredits).not.toHaveBeenCalled();
  });
  it('reset calls the backend and regenerate requires explicit one-credit confirmation', async () => {
    showGenerated();
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    const field = screen.getByLabelText('Replacement text');
    await userEvent.clear(field);
    await userEvent.type(field, 'Temporary draft');
    await userEvent.click(screen.getByRole('button', { name: 'Reset to original' }));
    expect(review).toHaveBeenCalledWith({
      resumeId: id,
      targetId: 'SRC-SUMMARY-001',
      expectedRevision: 2,
      action: 'reset',
    });
    expect(screen.queryByLabelText('Replacement text')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Regenerate with AI' }));
    expect(screen.getByText('Regenerating uses 1 resume credit. Continue?')).toBeVisible();
    expect(regenerate).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Use 1 Credit' }));
    await waitFor(() => expect(regenerate).toHaveBeenCalledTimes(1));
  });
  it('routes regeneration with no credits to packages without consuming a credit', async () => {
    vi.mocked(api.useGetResumeCreditsQuery).mockReturnValue({
      data: { balance: 0 },
    } as unknown as ReturnType<typeof api.useGetResumeCreditsQuery>);
    showGenerated();
    await userEvent.click(await screen.findByRole('button', { name: 'Regenerate with AI' }));
    expect(screen.getByText('Backend package')).toBeVisible();
    expect(regenerate).not.toHaveBeenCalled();
  });
  it.each(['pdf', 'docx', 'txt'] as const)(
    'downloads and re-downloads backend %s without generation',
    async (format) => {
      vi.mocked(api.downloadTailoredResume).mockResolvedValue(new Blob(['resume']));
      const createURL = vi.fn(() => 'blob:resume');
      const revokeURL = vi.fn();
      Object.defineProperty(URL, 'createObjectURL', { value: createURL, configurable: true });
      Object.defineProperty(URL, 'revokeObjectURL', { value: revokeURL, configurable: true });
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
      showGenerated();
      await userEvent.click(await screen.findByRole('button', { name: /Continue to Download/ }));
      await userEvent.click(screen.getByRole('button', { name: format.toUpperCase() }));
      await userEvent.click(
        screen.getByRole('button', { name: `Download ${format.toUpperCase()}` }),
      );
      await userEvent.click(
        screen.getByRole('button', { name: `Download ${format.toUpperCase()}` }),
      );
      expect(api.downloadTailoredResume).toHaveBeenCalledTimes(2);
      expect(api.downloadTailoredResume).toHaveBeenCalledWith(id, format);
      expect(generate).not.toHaveBeenCalled();
      expect(revokeURL).toHaveBeenCalledTimes(2);
    },
  );
  it('renders only actual structured candidate information', () => {
    renderWithProviders(<ResumePreview content={content} />);
    expect(screen.getByText('Real Candidate')).toBeVisible();
    expect(screen.queryByText(/Microsoft|Google|5\.0/)).not.toBeInTheDocument();
  });
  it.each([PaymentStatus.Pending, PaymentStatus.Failed, PaymentStatus.Cancelled])(
    'does not grant credits for payment status %s',
    (status) => {
      vi.mocked(api.useGetResumePurchaseQuery).mockReturnValue({
        data: { merchantOrderId: 'air_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', status },
        isFetching: false,
        refetch: vi.fn(),
      });
      renderWithProviders(
        <MemoryRouter>
          <ResumePaymentReturn merchantOrderId="air_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" />
        </MemoryRouter>,
        { auth },
      );
      expect(refetchCredits).not.toHaveBeenCalled();
    },
  );
  it('refreshes credits only after server-verified payment and ignores browser success', async () => {
    vi.mocked(api.useGetResumePurchaseQuery).mockReturnValue({
      data: {
        merchantOrderId: 'air_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        status: PaymentStatus.Paid,
        returnTo: ROUTES.RESUME_MAKER,
      },
    } as unknown as ReturnType<typeof api.useGetResumePurchaseQuery>);
    renderWithProviders(
      <MemoryRouter>
        <ResumePaymentReturn merchantOrderId="air_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" />
      </MemoryRouter>,
      { auth },
    );
    await waitFor(() => expect(refetchCredits).toHaveBeenCalledTimes(1));
  });
});

it('renders the registered Resume Maker page with the existing candidate resume', () => {
  renderWithProviders(
    <MemoryRouter initialEntries={['/dashboard/resume-maker']}>
      <ResumeMakerPage />
    </MemoryRouter>,
    { auth },
  );
  expect(screen.getByRole('heading', { name: 'AI Resume Maker' })).toBeVisible();
  expect(screen.getByText('my-resume.pdf')).toBeVisible();
});
it('routes AI Resume orders to credit verification instead of membership activation', () => {
  const merchantOrderId = 'air_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  resumeWorkflowStorage.set('purchase', merchantOrderId);
  vi.mocked(api.useGetResumePurchaseQuery).mockReturnValue({
    data: { merchantOrderId, status: PaymentStatus.Pending },
    isFetching: false,
    refetch: vi.fn(),
  });
  renderWithProviders(
    <MemoryRouter
      initialEntries={[`/payment/phonepe/return?merchantOrderId=${merchantOrderId}&success=true`]}
    >
      <PhonePeReturnPage />
    </MemoryRouter>,
    { auth },
  );
  expect(screen.getByRole('heading', { name: 'Verifying your payment…' })).toBeVisible();
  expect(api.useGetResumePurchaseQuery).toHaveBeenCalledWith(merchantOrderId, {
    skip: false,
    refetchOnMountOrArgChange: true,
  });
  expect(refetchCredits).not.toHaveBeenCalled();
});

it('reconciles AI Resume returns even when the browser purchase marker is absent', () => {
  const merchantOrderId = 'air_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  vi.mocked(api.useGetResumePurchaseQuery).mockReturnValue({
    data: { merchantOrderId, status: PaymentStatus.Pending },
    isFetching: false,
    refetch: vi.fn(),
  });
  renderWithProviders(
    <MemoryRouter initialEntries={[`/payment/phonepe/return?merchantOrderId=${merchantOrderId}`]}>
      <PhonePeReturnPage />
    </MemoryRouter>,
    { auth },
  );
  expect(screen.getByRole('heading', { name: 'Verifying your payment…' })).toBeVisible();
  expect(api.useGetResumePurchaseQuery).toHaveBeenCalledWith(
    merchantOrderId,
    expect.objectContaining({ skip: false }),
  );
});
it('keeps a restored analysis in progress from dispatching a duplicate request and polls the owned session', async () => {
  vi.mocked(api.useGetResumeSessionQuery).mockReturnValue({
    data: { ...session, status: 2, analysis: null },
  } as unknown as ReturnType<typeof api.useGetResumeSessionQuery>);
  render({ sessionId: id });
  expect(await screen.findByText(/saved resume session is still processing/)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Analyze My Resume →' })).toBeDisabled();
  expect(api.useGetResumeSessionQuery).toHaveBeenLastCalledWith(
    id,
    expect.objectContaining({ pollingInterval: 5000 }),
  );
  expect(analyze).not.toHaveBeenCalled();
});
it('clears the paid checkout key so another package purchase receives a new idempotency key', async () => {
  vi.mocked(api.useGetResumeCreditsQuery).mockReturnValue({
    data: { balance: 0 },
    refetch: refetchCredits,
  });
  vi.mocked(api.useGetResumeSessionQuery).mockReturnValue({
    data: session,
  } as unknown as ReturnType<typeof api.useGetResumeSessionQuery>);
  checkout.mockReturnValue({ unwrap: () => Promise.resolve({ status: PaymentStatus.Paid }) });
  render({ sessionId: id });
  await userEvent.click(await screen.findByRole('button', { name: /Continue to Payment/ }));
  await userEvent.click(screen.getByRole('button', { name: 'Select' }));
  await waitFor(() =>
    expect(resumeWorkflowStorage.get(`checkoutKey.${id}.SERVER_PACK`)).toBeNull(),
  );
  await userEvent.click(screen.getByRole('button', { name: 'Select' }));
  expect(checkout).toHaveBeenCalledTimes(2);
  expect(checkout.mock.calls[0]?.[0].idempotencyKey).not.toBe(
    checkout.mock.calls[1]?.[0].idempotencyKey,
  );
});
it('clears the scoped checkout key after server-verified payment on return', async () => {
  resumeWorkflowStorage.set('session', id);
  resumeWorkflowStorage.set(`checkoutKey.${id}.SERVER_PACK`, 'fixture-key');
  vi.mocked(api.useGetResumePurchaseQuery).mockReturnValue({
    data: {
      merchantOrderId: 'air_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      packageCode: 'SERVER_PACK',
      status: PaymentStatus.Paid,
      returnTo: ROUTES.RESUME_MAKER,
    },
  } as unknown as ReturnType<typeof api.useGetResumePurchaseQuery>);
  renderWithProviders(
    <MemoryRouter>
      <ResumePaymentReturn merchantOrderId="air_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" />
    </MemoryRouter>,
    { auth },
  );
  await waitFor(() =>
    expect(resumeWorkflowStorage.get(`checkoutKey.${id}.SERVER_PACK`)).toBeNull(),
  );
});

it.each([
  ['Accept', 'accept', 'accepted'],
  ['Keep Original', 'original', 'original'],
] as const)('persists %s using the backend action and revision', async (label, action, status) => {
  review.mockReturnValue({
    unwrap: () =>
      Promise.resolve({
        ...resume,
        editRevision: 3,
        tailoring: {
          ...resume.tailoring,
          replacements: resume.tailoring?.replacements.map((decision) => ({ ...decision, status })),
        },
      }),
  });
  showGenerated();
  await userEvent.click(await screen.findByRole('button', { name: label }));
  expect(review).toHaveBeenCalledWith({
    resumeId: id,
    targetId: 'SRC-SUMMARY-001',
    expectedRevision: 2,
    action,
  });
  expect(generate).not.toHaveBeenCalled();
  expect(refetchCredits).not.toHaveBeenCalled();
  if (action === 'original') expect(await screen.findByText('Using original text')).toBeVisible();
});

it('preserves the edit and server preview when factual safety validation rejects wording', async () => {
  review.mockReturnValue({
    unwrap: () =>
      Promise.reject(
        new ApiRequestError({
          status: 400,
          code: 'unsupported_claims',
          message: 'private-guard-diagnostics',
        }),
      ),
  });
  showGenerated();
  await userEvent.click(await screen.findByRole('button', { name: 'Edit' }));
  fireEvent.change(screen.getByLabelText('Replacement text'), {
    target: { value: 'Unsupported CUDA claims' },
  });
  await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(await screen.findByText(/This wording is not supported/)).toBeVisible();
  expect(screen.getByLabelText('Replacement text')).toHaveValue('Unsupported CUDA claims');
  expect(screen.queryByText('private-guard-diagnostics')).not.toBeInTheDocument();
  expect(screen.getAllByText(content.professionalSummary).length).toBeGreaterThan(0);
});

it('refreshes a stale revision without retrying or overwriting it, then uses the latest revision', async () => {
  review.mockReturnValueOnce({
    unwrap: () =>
      Promise.reject(
        new ApiRequestError({ status: 409, code: 'resume_revision_conflict', message: 'Conflict' }),
      ),
  });
  showGenerated();
  await userEvent.click(await screen.findByRole('button', { name: 'Accept' }));
  expect(
    await screen.findByText('Your resume was updated. We refreshed the latest version.'),
  ).toBeVisible();
  expect(refetchResume).toHaveBeenCalledTimes(1);
  expect(review).toHaveBeenCalledTimes(1);
  await userEvent.click(screen.getByRole('button', { name: 'Keep Original' }));
  expect(review).toHaveBeenLastCalledWith({
    resumeId: id,
    targetId: 'SRC-SUMMARY-001',
    expectedRevision: 8,
    action: 'original',
  });
});

it('uses DOCX capabilities to default to DOCX, retain TXT, and hide unavailable PDF', async () => {
  const native = {
    ...resume,
    documentCapabilities: {
      preservationMode: 'original_docx',
      originalFileType: 'docx',
      layoutPreserved: true,
      defaultDownloadFormat: 'docx' as const,
      downloadFormats: ['docx', 'txt'] as ('docx' | 'txt')[],
      limitation: 'Text wrapping may change.',
    },
  };
  showGenerated(native);
  expect(await screen.findByText(/Original formatting preserved/)).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: /Continue to Download/ }));
  expect(screen.getByRole('button', { name: 'Download DOCX' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'TXT' })).toBeVisible();
  expect(screen.queryByRole('button', { name: 'PDF' })).not.toBeInTheDocument();
});

it('shows the PDF fallback limitation without claiming original formatting preservation', async () => {
  showGenerated();
  expect(await screen.findByText(/PDF tailoring uses CareerHarbor/)).toBeVisible();
  expect(screen.queryByText(/Original formatting preserved/)).not.toBeInTheDocument();
});

it('retains originals for unsafe suggestions while showing safe changes as successful', async () => {
  const rejected = {
    proposal: {
      targetId: 'SRC-EXP-001-BULLET-001',
      originalText: 'Built .NET APIs.',
      replacementText: 'Invented CUDA achievements',
      matchedJdTerms: ['CUDA'],
      sourceEvidenceIds: ['private-evidence-id'],
      reason: 'private-debug-reason',
    },
    status: 'rejected' as const,
    rejectionCategory: 'private-category',
    rejectionReason: 'private-path',
    editedText: null,
  };
  showGenerated({
    ...resume,
    tailoring: {
      emphasizedSkillEvidenceIds: [],
      replacements: [...(resume.tailoring?.replacements ?? []), rejected],
    },
  });
  expect(await screen.findByRole('button', { name: 'Accept' })).toBeVisible();
  expect(screen.getByText(/1 suggestion was skipped/)).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Experience' }));
  expect(screen.getByText('Built .NET APIs.')).toBeVisible();
  expect(screen.queryByText(/Invented CUDA|private-/)).not.toBeInTheDocument();
});

it('handles an old session with a restart action and preserves its existing resume for download', async () => {
  vi.mocked(api.useGetResumeSessionQuery).mockReturnValue({
    data: { ...session, documentCapabilities: null },
  } as unknown as ReturnType<typeof api.useGetResumeSessionQuery>);
  render({ sessionId: id });
  expect(
    await screen.findByText(/This resume session was created with an older version/),
  ).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Create a new tailoring session' }));
  expect(screen.getByLabelText('Job description')).toBeVisible();
  expect(generate).not.toHaveBeenCalled();
});

it('maps the backend zero-safe-changes failure to credit-restored information', async () => {
  generate.mockReturnValue({
    unwrap: () =>
      Promise.reject(
        new ApiRequestError({
          status: 503,
          code: 'no_safe_tailoring_changes',
          message: 'No safe changes',
        }),
      ),
  });
  vi.mocked(api.useGetResumeSessionQuery).mockReturnValue({
    data: session,
  } as unknown as ReturnType<typeof api.useGetResumeSessionQuery>);
  render({ sessionId: id });
  await userEvent.click(await screen.findByRole('button', { name: /Continue to Payment/ }));
  await userEvent.click(screen.getByRole('button', { name: 'Generate Resume — Uses 1 Credit' }));
  expect(
    await screen.findByText(/Your resume was not modified and your credit was restored/),
  ).toBeVisible();
  expect(refetchCredits).toHaveBeenCalledTimes(1);
});

it('compares a .NET source with a GPU JD and generates only supported wording through the credit flow', async () => {
  const gpuAnalysis = {
    ...analysis,
    matchedSkills: [
      'performance optimization',
      'problem solving',
      'cross-functional collaboration',
    ],
    partialMatches: [],
    missingSkills: ['CUDA', 'Triton', 'GPU programming', 'parallel computing'],
  };
  vi.mocked(api.useGetResumeSessionQuery).mockReturnValue({
    data: { ...session, analysis: gpuAnalysis },
  } as unknown as ReturnType<typeof api.useGetResumeSessionQuery>);
  generate.mockReturnValue({
    unwrap: () =>
      Promise.resolve({
        ...resume,
        content: {
          ...content,
          professionalSummary:
            '.NET developer with performance optimization and problem solving experience.',
        },
      }),
  });
  render({ sessionId: id });
  expect(await screen.findByText('performance optimization · In your resume')).toBeVisible();
  for (const skill of gpuAnalysis.missingSkills)
    expect(screen.getByText(`${skill} · Not found`)).toBeVisible();
  expect(screen.getByText(/Missing skills remain gaps and are not added/)).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: /Continue to Payment/ }));
  await userEvent.click(screen.getByRole('button', { name: 'Generate Resume — Uses 1 Credit' }));
  expect(await screen.findByText('Original supported summary')).toBeVisible();
  expect(screen.getByText('AI Suggestion')).toBeVisible();
  expect(screen.getByText('Matched JD terms')).toBeVisible();
  expect(screen.getByText('performance optimization')).toBeVisible();
  expect(screen.getByText('Emphasize supported performance optimization.')).toBeVisible();
  expect(checkout).not.toHaveBeenCalled();
});

it('prevents duplicate review submissions while a revision is being saved', async () => {
  let complete: (value: TailoredResume) => void = () => {
    throw new Error('Review not started');
  };
  review.mockReturnValue({
    unwrap: () =>
      new Promise<TailoredResume>((resolve) => {
        complete = resolve;
      }),
  });
  showGenerated();
  await userEvent.dblClick(await screen.findByRole('button', { name: 'Accept' }));
  expect(review).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: /Continue to Download/ })).toBeDisabled();
  await act(async () => {
    complete({ ...resume, editRevision: 3 });
    await Promise.resolve();
  });
  expect(screen.getByRole('button', { name: /Continue to Download/ })).toBeEnabled();
});

it('keeps unsaved replacement wording on screen until saved or cancelled', async () => {
  showGenerated();
  await userEvent.click(await screen.findByRole('button', { name: 'Edit' }));
  fireEvent.change(screen.getByLabelText('Replacement text'), {
    target: { value: 'Candidate draft' },
  });
  expect(screen.getByRole('button', { name: 'Experience' })).toBeDisabled();
  expect(screen.getByRole('button', { name: /Continue to Download/ })).toBeDisabled();
  await userEvent.click(screen.getByRole('button', { name: 'Cancel edit' }));
  expect(screen.getByRole('button', { name: /Continue to Download/ })).toBeEnabled();
  expect(review).not.toHaveBeenCalled();
});
