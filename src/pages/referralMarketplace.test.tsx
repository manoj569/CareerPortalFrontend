import { ApiRequestError } from '@/api/apiError';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requestRecord, opportunity } from '@/features/referrals/api/marketplaceFixtures';
import {
  ReferrerRequestDetailPage,
  ReferralSubmissionSuccessPage,
} from './ReferralMarketplacePages';
import { ReferAJobPage } from './ReferAJobPage';
import { AllReferralsPage, ReferralRequestsPage } from './AllReferralsPage';
import { CandidateReferralRequestPage } from './CandidateReferralRequestsPage';
const mocks = vi.hoisted(() => ({
  detail: vi.fn(),
  owned: vi.fn(),
  inbox: vi.fn(),
  metrics: vi.fn(),
  accept: vi.fn(),
  reject: vi.fn(),
  mark: vi.fn(),
  submit: vi.fn(),
  candidate: vi.fn(),
  contact: vi.fn(),
  refetch: vi.fn(),
  extract: vi.fn(),
  resume: vi.fn(),
}));
vi.mock('@/api/apiClient', () => ({ apiClient: { get: mocks.resume } }));
const mutation = (fn: typeof mocks.accept) => [fn, { isLoading: false }];
vi.mock('@/features/referrals/api/marketplaceApi', () => ({
  useGetReferralCatalogueQuery: () => ({ currentData: [], refetch: mocks.refetch }),
  useGetReferrerRequestQuery: mocks.detail,
  useGetOwnedOpportunitiesQuery: mocks.owned,
  useGetReferrerInboxQuery: mocks.inbox,
  useGetReferralMetricsQuery: mocks.metrics,
  useAcceptReferralRequestMutation: () => mutation(mocks.accept),
  useRejectReferralRequestMutation: () => mutation(mocks.reject),
  useMarkReferralSubmittedMutation: () => mutation(mocks.mark),
  useGetCandidateRequestQuery: mocks.candidate,
  useGetAcceptedContactQuery: mocks.contact,
  useConfirmReferralReceiptMutation: () => mutation(vi.fn()),
  useReportReferralNotReceivedMutation: () => mutation(vi.fn()),
}));
vi.mock('@/features/referrals/api/referralsApi', () => ({
  useSubmitJobReferralMutation: () => mutation(mocks.submit),
  useExtractJobFromUrlMutation: () => mutation(mocks.extract),
  useGetReferralCategoryOptionsQuery: () => ({
    data: [{ id: 'cat-1', name: 'Software Development' }],
  }),
}));
const Location = () => {
  const l = useLocation();
  return <output aria-label="Route location">{l.pathname}</output>;
};
const show = (element: React.ReactNode, path = '/dashboard/referral-requests/req-1') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/dashboard/referral-requests/:requestId/*" element={element} />
        <Route path="/dashboard/my-referral-requests/:requestId" element={element} />
        <Route path="/dashboard/referrals/:referralId/*" element={element} />
        <Route path="*" element={element} />
      </Routes>
      <Location />
    </MemoryRouter>,
  );
const setStatus = (status: typeof requestRecord.request.status, extra = {}) =>
  mocks.detail.mockReturnValue({
    currentData: { ...requestRecord, request: { ...requestRecord.request, status, ...extra } },
    refetch: mocks.refetch,
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.detail.mockReturnValue({ currentData: requestRecord, refetch: mocks.refetch });
  mocks.owned.mockReturnValue({ currentData: [opportunity], refetch: mocks.refetch });
  mocks.inbox.mockReturnValue({ currentData: [requestRecord], refetch: mocks.refetch });
  mocks.metrics.mockReturnValue({
    data: {
      jobsPosted: 8,
      requestsReceived: 73,
      requestsAccepted: 24,
      referralsSubmitted: 19,
      candidateConfirmedReferrals: 16,
    },
    refetch: mocks.refetch,
  });
  for (const fn of [mocks.accept, mocks.reject, mocks.mark])
    fn.mockReturnValue({ unwrap: () => Promise.resolve(requestRecord) });
  mocks.submit.mockReturnValue({ unwrap: () => Promise.resolve(opportunity) });
  mocks.candidate.mockReturnValue({ currentData: requestRecord.request, refetch: mocks.refetch });
  mocks.contact.mockReturnValue({
    currentData: { referrerLabel: 'Employee Referrer', email: 'authorized@example.test' },
    refetch: mocks.refetch,
  });
});
describe('referrer screens', () => {
  it('renders pending candidate detail without fabricated employer state', () => {
    show(<ReferrerRequestDetailPage />);
    expect(screen.getAllByText('Pooja Sharma').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Accept request' })).toBeInTheDocument();
    expect(screen.getByText('Please review my experience.')).toBeInTheDocument();
    expect(screen.queryByText(/Employer review/)).not.toBeInTheDocument();
  });
  it('accepts through backend then shows accepted state', async () => {
    show(<ReferrerRequestDetailPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Accept request' }));
    expect(mocks.accept).toHaveBeenCalledWith('req-1');
  });
  it('rejects only after accessible confirmation and returns to scoped requests', async () => {
    show(<ReferrerRequestDetailPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Reject request' }));
    expect(mocks.reject).not.toHaveBeenCalled();
    expect(
      screen.getByRole('dialog', { name: 'Reject this referral request?' }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Yes, reject request' }));
    expect(mocks.reject).toHaveBeenCalledWith('req-1');
    await waitFor(() =>
      expect(screen.getByLabelText('Route location')).toHaveTextContent(
        '/dashboard/referrals/op-1/requests',
      ),
    );
  });
  it('shows capacity conflict and refreshes backend state without claiming success', async () => {
    mocks.accept.mockReturnValue({
      unwrap: () =>
        Promise.reject(new ApiRequestError({ status: 409, message: 'No referral slots remain.' })),
    });
    show(<ReferrerRequestDetailPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Accept request' }));
    expect(await screen.findByText('No referral slots remain.')).toBeInTheDocument();
    expect(mocks.refetch).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('Referral request accepted')).not.toBeInTheDocument();
  });
  it('requests an authorized resume only after an explicit download action', async () => {
    mocks.resume.mockRejectedValue(
      new ApiRequestError({ status: 403, message: 'Resume access is unavailable.' }),
    );
    show(<ReferrerRequestDetailPage />);
    expect(mocks.resume).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Download authorized resume' }));
    expect(mocks.resume).toHaveBeenCalledWith('/referrer/referral-requests/req-1/resume', {
      responseType: 'blob',
    });
    expect(await screen.findByText('Resume access is unavailable.')).toBeInTheDocument();
  });
  it('accepted state exposes company-process guidance', () => {
    setStatus('Accepted', { acceptedAtUtc: '2026-10-08T07:00:00Z' });
    show(<ReferrerRequestDetailPage />);
    expect(screen.getByText('Referral request accepted')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Continue to referral submission/ }),
    ).toBeInTheDocument();
  });
  it('mark as referred requires both attestations and modal confirmation', async () => {
    setStatus('Accepted');
    show(<ReferrerRequestDetailPage />, '/dashboard/referral-requests/req-1/complete');
    const btn = screen.getByRole('button', { name: 'I submitted the referral' });
    expect(btn).toBeDisabled();
    await userEvent.click(
      screen.getByLabelText('I submitted this candidate using my company’s referral process.'),
    );
    await userEvent.click(
      screen.getByLabelText(
        'I understand CareerHarbor does not control the employer’s hiring process.',
      ),
    );
    await userEvent.click(btn);
    expect(mocks.mark).not.toHaveBeenCalled();
    expect(
      screen.getByRole('dialog', { name: 'Confirm referral submission?' }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Yes, mark as referred' }));
    expect(mocks.mark).toHaveBeenCalledWith('req-1');
    await waitFor(() =>
      expect(screen.getByLabelText('Route location')).toHaveTextContent('/submitted'),
    );
    expect(screen.queryByLabelText(/upload/i)).not.toBeInTheDocument();
  });
  it.each([
    ['ReferralSubmitted', 'Referral marked as submitted'],
    ['CandidateConfirmed', 'Candidate confirmed receipt'],
    ['Expired', 'This referral request expired before it was accepted.'],
  ] as const)('renders %s', (status, label) => {
    setStatus(status);
    show(<ReferrerRequestDetailPage />, '/dashboard/referral-requests/req-1/submitted');
    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Accept request' })).not.toBeInTheDocument();
  });
  it('not received is a neutral independent flag', () => {
    setStatus('ReferralSubmitted', { notReceivedAtUtc: '2026-10-08T07:00:00Z' });
    show(<ReferrerRequestDetailPage />);
    expect(
      screen.getByText('Candidate reported that they haven’t received referral confirmation yet.'),
    ).toBeInTheDocument();
  });
  it('renders loading and meaningful authorization errors', () => {
    mocks.detail.mockReturnValue({ isLoading: true });
    const v = show(<ReferrerRequestDetailPage />);
    expect(screen.getByRole('status', { name: 'Loading referrals' })).toBeInTheDocument();
    mocks.detail.mockReturnValue({
      error: { status: 403, message: 'You do not have access to this referral.' },
      refetch: mocks.refetch,
    });
    v.rerender(
      <MemoryRouter>
        <ReferrerRequestDetailPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('You do not have access to this referral.')).toBeInTheDocument();
  });
  it('renders real metrics and navigates View requests to selected opportunity', async () => {
    show(<AllReferralsPage />, '/dashboard/referrals');
    expect(screen.getAllByText('73').length).toBeGreaterThan(0);
    expect(screen.getByText('4 / 5 Accepted')).toBeInTheDocument();
    expect(screen.queryByText(/this month/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'View requests →' }));
    await waitFor(() =>
      expect(screen.getByLabelText('Route location')).toHaveTextContent(
        '/dashboard/referrals/op-1/requests',
      ),
    );
  });
  it('renders pending approval with requests disabled', () => {
    mocks.owned.mockReturnValue({ currentData: [{ ...opportunity, approvalStatus: 'Pending' }] });
    show(<AllReferralsPage />, '/dashboard/referrals');
    expect(screen.getByRole('button', { name: 'View details →' })).toBeDisabled();
  });
  it('empty states use no sample candidates', () => {
    mocks.inbox.mockReturnValue({ currentData: [] });
    show(<ReferralRequestsPage />, '/dashboard/referral-requests');
    expect(screen.getByText('No requests yet.')).toBeInTheDocument();
    expect(screen.queryByText('Pooja Sharma')).not.toBeInTheDocument();
  });
  it('request row opens authorized candidate review', async () => {
    show(<ReferralRequestsPage />, '/dashboard/referral-requests');
    await userEvent.click(screen.getByRole('button', { name: 'View profile & resume →' }));
    await waitFor(() =>
      expect(screen.getByLabelText('Route location')).toHaveTextContent(
        '/dashboard/referral-requests/req-1',
      ),
    );
  });
});
describe('creation and protected contact', () => {
  it('validates capacity bounds in the form', () => {
    show(<ReferAJobPage />, '/dashboard/refer-a-job');
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Referral slots' }), {
      target: { value: '1001' },
    });
    expect(screen.getByRole('button', { name: 'Submit for approval' })).toBeDisabled();
    expect(screen.getByText('Enter 1–1000 whole slots')).toBeInTheDocument();
  });
  it('creates with supported fields and redirects to submission success', async () => {
    show(<ReferAJobPage />, '/dashboard/refer-a-job');
    for (const [label, value] of [
      ['Job title', 'Engineer'],
      ['Company name', 'Example'],
      ['Minimum experience', '0'],
      ['Maximum experience', '3'],
      ['Job description', 'Build software'],
    ])
      fireEvent.change(screen.getByLabelText(new RegExp(label!.replace(/[()]/g, '\\$&'))), {
        target: { value },
      });
    await userEvent.type(
      screen.getByRole('combobox', { name: /Skills/ }),
      'React{Enter}SQL{Enter}',
    );
    await userEvent.click(screen.getByRole('combobox', { name: /Category/ }));
    await userEvent.click(screen.getByRole('option', { name: 'Software Development' }));
    await userEvent.click(screen.getByRole('button', { name: 'Submit for approval' }));
    expect(mocks.submit).toHaveBeenCalledWith(
      expect.objectContaining({ referralSlots: 5, showLinkedIn: true }),
    );
    expect(mocks.submit.mock.calls[0]?.[0]).not.toHaveProperty('overrideEmail');
    await waitFor(() =>
      expect(screen.getByLabelText('Route location')).toHaveTextContent(
        '/dashboard/referrals/op-1/submitted',
      ),
    );
  });
  it('submission success shows admin review and clean share-another navigation', async () => {
    mocks.owned.mockReturnValue({ currentData: [{ ...opportunity, approvalStatus: 'Pending' }] });
    show(<ReferralSubmissionSuccessPage />, '/dashboard/referrals/op-1/submitted');
    expect(screen.getByText('Referral opportunity submitted successfully!')).toBeInTheDocument();
    expect(screen.getByText('Pending approval')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage requests →' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Share another job →' }));
    await waitFor(() =>
      expect(screen.getByLabelText('Route location')).toHaveTextContent('/dashboard/refer-a-job'),
    );
  });
  it('never fetches contact before acceptance even if membership is paid', () => {
    show(<CandidateReferralRequestPage />, '/dashboard/my-referral-requests/req-1');
    expect(mocks.contact).not.toHaveBeenCalled();
    expect(screen.queryByText(/authorized@example/)).not.toBeInTheDocument();
  });
  it('accepted alone cannot fetch contact without backend authorization', () => {
    mocks.candidate.mockReturnValue({
      currentData: { ...requestRecord.request, status: 'Accepted', canViewContact: false },
    });
    show(<CandidateReferralRequestPage />, '/dashboard/my-referral-requests/req-1');
    expect(mocks.contact).not.toHaveBeenCalled();
  });
  it('fetches authorized contact only after backend permits it', () => {
    mocks.candidate.mockReturnValue({
      currentData: { ...requestRecord.request, status: 'Accepted', canViewContact: true },
    });
    show(<CandidateReferralRequestPage />, '/dashboard/my-referral-requests/req-1');
    expect(mocks.contact).toHaveBeenCalledWith('req-1', expect.anything());
    expect(screen.getByText('Email: authorized@example.test')).toBeInTheDocument();
  });
});
