import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReferralJobsSection } from './ReferralJobsSection';
import {
  CandidateReferralRequestPage,
  CandidateReferralRequestsPage,
} from '@/pages/CandidateReferralRequestsPage';
import { requestRecord } from '../api/marketplaceFixtures';
import type { ReferralRequestRecord } from '../types/marketplaceModels';
import { ApiRequestError } from '@/api/apiError';
const mocks = vi.hoisted(() => ({
  catalogue: vi.fn(),
  activity: vi.fn(),
  candidate: vi.fn(),
  saved: vi.fn(),
  create: vi.fn(),
  confirm: vi.fn(),
  notReceived: vi.fn(),
  contact: vi.fn(),
  save: vi.fn(),
  remove: vi.fn(),
  refetch: vi.fn(),
  user: { current: true },
}));
const mutation = (fn: ReturnType<typeof vi.fn>) => [fn, { isLoading: false }];
vi.mock('@/hooks/reduxHooks', () => ({
  useAppSelector: () => (mocks.user.current ? { id: 'candidate' } : null),
}));
vi.mock('../api/marketplaceApi', () => ({
  useGetReferralCatalogueQuery: mocks.catalogue,
  useGetCandidateActivityQuery: mocks.activity,
  useGetCandidateRequestQuery: mocks.candidate,
  useGetReferralSavedJobsQuery: mocks.saved,
  useCreateReferralRequestMutation: () => mutation(mocks.create),
  useConfirmReferralReceiptMutation: () => mutation(mocks.confirm),
  useReportReferralNotReceivedMutation: () => mutation(mocks.notReceived),
  useGetAcceptedContactQuery: mocks.contact,
}));
vi.mock('@/features/dashboard/api/dashboardApi', () => ({
  useGetProfileQuery: () => ({
    data: {
      firstName: 'Test',
      lastName: 'Candidate',
      email: 'own@example.test',
      resume: { fileName: 'resume.pdf' },
    },
  }),
  useGetResumeStatusQuery: () => ({ data: { hasResume: true } }),
  useSaveJobMutation: () => mutation(mocks.save),
  useRemoveSavedJobMutation: () => mutation(mocks.remove),
}));
const quota = {
  limit: 10,
  acceptedConnections: 2,
  remainingConnections: 8,
  periodEndUtc: '2026-11-01T00:00:00Z',
  hasActiveAccess: true,
};
const job = {
  jobId: 'job-1',
  referralId: 'op-1',
  jobSlug: 'engineer',
  jobTitle: 'Engineer',
  companyName: 'Test company',
  location: 'Pune',
  employmentType: 1,
  workplaceType: 3,
  categoryName: 'Software',
  skills: ['React'],
  minimumExperienceYears: 0,
  maximumExperienceYears: 4,
  referrerLabel: 'Employee Referrer',
  referralAvailable: true,
  referralSlots: 5,
  remainingReferralSlots: 3,
};
const Location = () => <output aria-label="location">{useLocation().pathname}</output>;
const show = (node = <ReferralJobsSection />) =>
  render(
    <MemoryRouter initialEntries={['/dashboard/my-referral-requests/req-1']}>
      <Routes>
        <Route path="/dashboard/my-referral-requests/:requestId" element={node} />
        <Route path="*" element={node} />
      </Routes>
      <Location />
    </MemoryRouter>,
  );
const result = (currentData: unknown) => ({ currentData, refetch: mocks.refetch });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.user.current = true;
  mocks.catalogue.mockReturnValue(
    result([
      job,
      {
        ...job,
        jobId: 'job-2',
        referralId: 'op-2',
        jobTitle: 'Data Analyst',
        companyName: 'Other company',
        location: 'Delhi',
        skills: ['SQL'],
        categoryName: 'Data',
        employmentType: 2,
        minimumExperienceYears: 5,
        maximumExperienceYears: 8,
      },
    ]),
  );
  mocks.activity.mockReturnValue(result({ items: [], quota }));
  mocks.saved.mockReturnValue(result([]));
  mocks.candidate.mockReturnValue(result(requestRecord.request));
  mocks.contact.mockReturnValue(
    result({ referrerLabel: 'Employee Referrer', email: 'private@example.test' }),
  );
  for (const fn of [mocks.create, mocks.confirm, mocks.notReceived, mocks.save, mocks.remove])
    fn.mockReturnValue({ unwrap: () => Promise.resolve(requestRecord.request) });
});
const open = async () => {
  await userEvent.click(screen.getAllByRole('button', { name: 'Request Referral' })[0]!);
  return screen.getByRole('dialog', { name: 'Request Referral' });
};
describe('candidate referral browsing and request', () => {
  it('shows loading without fake companies', () => {
    mocks.catalogue.mockReturnValue({ isFetching: true });
    show();
    expect(screen.getByRole('status', { name: 'Loading referrals' })).toBeInTheDocument();
    expect(screen.queryByText('Test company')).not.toBeInTheDocument();
  });
  it('searches skills and resets', async () => {
    show();
    fireEvent.change(screen.getByLabelText('Search job title, company or skills'), {
      target: { value: 'SQL' },
    });
    expect(screen.queryByText('Engineer')).not.toBeInTheDocument();
    expect(screen.getByText('Data Analyst')).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole('button', { name: 'Clear Filters' })[0]!);
    expect(screen.getByText('Engineer')).toBeInTheDocument();
  });
  it.each([
    ['Category', 'Data'],
    ['Location', 'Delhi'],
    ['Company', 'Other company'],
    ['Job type', 'Part time'],
  ])('filters %s from authoritative metadata', async (label, option) => {
    show();
    await userEvent.click(screen.getByLabelText(label));
    await userEvent.click(screen.getByRole('option', { name: option }));
    expect(screen.queryByText('Engineer')).not.toBeInTheDocument();
    expect(screen.getByText('Data Analyst')).toBeInTheDocument();
  });
  it('filters experience including zero years', () => {
    show();
    fireEvent.change(screen.getByLabelText('Experience (years)'), { target: { value: '0' } });
    expect(screen.getByText('Engineer')).toBeInTheDocument();
    expect(screen.queryByText('Data Analyst')).not.toBeInTheDocument();
  });
  it('requires explicit consent and displays own profile and resume', async () => {
    show();
    const dialog = await open();
    expect(within(dialog).getByText('Test Candidate')).toBeInTheDocument();
    expect(within(dialog).getByText(/Resume: resume.pdf/)).toBeInTheDocument();
    const send = within(dialog).getByRole('button', { name: /Send referral request/ });
    expect(send).toBeDisabled();
    await userEvent.click(within(dialog).getByRole('checkbox'));
    expect(send).toBeEnabled();
  });
  it('uses backend ID/time in success modal and preserves capacity', async () => {
    show();
    const dialog = await open();
    await userEvent.click(within(dialog).getByRole('checkbox'));
    await userEvent.click(within(dialog).getByRole('button', { name: /Send referral request/ }));
    expect(mocks.create).toHaveBeenCalledWith({ referralId: 'op-1', candidateMessage: '' });
    const success = await screen.findByRole('dialog', { name: /Referral Request Sent/ });
    expect(within(success).getByText(/has not yet accepted/)).toBeInTheDocument();
    await userEvent.click(within(success).getByRole('button', { name: /View My Request/ }));
    expect(screen.getByLabelText('location')).toHaveTextContent('/dashboard/my-referral-requests');
  });
  it('prevents double submissions while a response is pending', async () => {
    mocks.create.mockReturnValue({ unwrap: () => new Promise(() => {}) });
    show();
    const dialog = await open();
    await userEvent.click(within(dialog).getByRole('checkbox'));
    fireEvent.click(within(dialog).getByRole('button', { name: /Send referral request/ }));
    fireEvent.click(within(dialog).getByRole('button', { name: /Send referral request/ }));
    expect(mocks.create).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('location')).toHaveTextContent(
      '/dashboard/my-referral-requests/req-1',
    );
  });
  it('shows existing requests instead of allowing another request', () => {
    mocks.activity.mockReturnValue(result({ items: [requestRecord.request], quota }));
    show();
    expect(screen.getByRole('button', { name: 'View referral request' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Request Referral' })).toHaveLength(1);
  });
  it('disables exhausted opportunities', () => {
    mocks.catalogue.mockReturnValue(result([{ ...job, remainingReferralSlots: 0 }]));
    show();
    expect(screen.getByRole('button', { name: 'Request Referral' })).toBeDisabled();
  });
  it.each([
    ['inactive access', false, 0],
    ['active access quota exceeded', true, 0],
  ])('honors server quota: %s', async (_, active, remaining) => {
    mocks.activity.mockReturnValue(
      result({
        items: [],
        quota: { ...quota, hasActiveAccess: active, remainingConnections: remaining },
      }),
    );
    show();
    const d = await open();
    await userEvent.click(within(d).getByRole('checkbox'));
    expect(within(d).getByRole('button', { name: /Send referral request/ })).toBeDisabled();
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it.each([
    'REFERRAL_ALREADY_REQUESTED',
    'REFERRAL_CONNECTION_LIMIT_REACHED',
    'REFERRAL_SLOTS_FULL',
  ])('shows %s conflict without success', async (code) => {
    mocks.create.mockReturnValue({
      unwrap: () =>
        Promise.reject(
          new ApiRequestError({ status: 409, code, message: 'Server rejected this request.' }),
        ),
    });
    show();
    const d = await open();
    await userEvent.click(within(d).getByRole('checkbox'));
    await userEvent.click(within(d).getByRole('button', { name: /Send referral request/ }));
    expect(await within(d).findByText('Server rejected this request.')).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: /Referral Request Sent/ })).not.toBeInTheDocument();
    expect(mocks.refetch).toHaveBeenCalled();
    expect(screen.getByLabelText('location')).toHaveTextContent(
      '/dashboard/my-referral-requests/req-1',
    );
  });
  it('saves through existing API and refreshes saved records', async () => {
    show();
    await userEvent.click(screen.getAllByRole('button', { name: 'Save job' })[0]!);
    expect(mocks.save).toHaveBeenCalledWith('job-1');
    expect(mocks.refetch).toHaveBeenCalled();
  });
  it('removes authoritative saved record', async () => {
    mocks.saved.mockReturnValue(result([{ jobId: 'job-1' }]));
    show();
    await userEvent.click(screen.getByRole('button', { name: 'Saved · Remove' }));
    expect(mocks.remove).toHaveBeenCalledWith('job-1');
  });
  it('anonymous request navigates to login', async () => {
    mocks.user.current = false;
    show();
    await userEvent.click(screen.getAllByRole('button', { name: 'Request Referral' })[0]!);
    expect(screen.getByLabelText('location')).toHaveTextContent('/login');
  });
});
describe('candidate history and acknowledgement', () => {
  it('lists exact activity, pending mapping and no unsupported review/withdrawal', () => {
    mocks.activity.mockReturnValue(result({ items: [requestRecord.request], quota }));
    show(<CandidateReferralRequestsPage />);
    expect(screen.getByRole('tab', { name: 'Pending (1)' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Under Review|Withdrawn/ })).not.toBeInTheDocument();
  });
  it.each([
    'Requested',
    'Accepted',
    'Rejected',
    'Expired',
    'ReferralSubmitted',
    'CandidateConfirmed',
  ] as const)('reload renders authoritative %s', (status) => {
    mocks.candidate.mockReturnValue(result({ ...requestRecord.request, status }));
    show(<CandidateReferralRequestPage />);
    expect(screen.getAllByText(statusLabel(status)).length).toBeGreaterThan(0);
    expect(
      screen.queryByRole('button', { name: /Withdraw|Accept request|Mark as referred/ }),
    ).not.toBeInTheDocument();
  });
  it('accepted explicitly does not confirm submission', () => {
    mocks.candidate.mockReturnValue(result({ ...requestRecord.request, status: 'Accepted' }));
    show(<CandidateReferralRequestPage />);
    expect(screen.getByText(/Referral submission has not yet been confirmed/)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'I received confirmation' }),
    ).not.toBeInTheDocument();
    expect(mocks.contact).not.toHaveBeenCalled();
  });
  it('acknowledges only after confirmation dialog', async () => {
    mocks.candidate.mockReturnValue(
      result({ ...requestRecord.request, status: 'ReferralSubmitted' }),
    );
    show(<CandidateReferralRequestPage />);
    await userEvent.click(screen.getByRole('button', { name: 'I received confirmation' }));
    expect(mocks.confirm).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(mocks.confirm).toHaveBeenCalledWith('req-1');
    expect(mocks.refetch).toHaveBeenCalled();
  });
  it('not received calls only its endpoint and remains submitted', async () => {
    mocks.candidate.mockReturnValue(
      result({ ...requestRecord.request, status: 'ReferralSubmitted' }),
    );
    show(<CandidateReferralRequestPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Not received yet' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(mocks.notReceived).toHaveBeenCalled();
    expect(mocks.confirm).not.toHaveBeenCalled();
    expect(screen.getByText('Submitted')).toBeInTheDocument();
  });
  it('records only actual history timestamps', () => {
    mocks.candidate.mockReturnValue(
      result({ ...requestRecord.request, status: 'Accepted', acceptedAtUtc: null }),
    );
    show(<CandidateReferralRequestPage />);
    const history = screen.getByRole('list', { name: 'Referral history' });
    expect(within(history).getAllByText('Not recorded')).toHaveLength(3);
    expect(screen.queryByText(/Under Review/)).not.toBeInTheDocument();
  });
  it('confirmation is clearly candidate reported', () => {
    mocks.candidate.mockReturnValue(
      result({ ...requestRecord.request, status: 'CandidateConfirmed' }),
    );
    show(<CandidateReferralRequestPage />);
    expect(
      screen.getByRole('heading', { name: 'Confirmation received — acknowledged by you' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/not independent company verification/)).toBeInTheDocument();
  });
  it('authorization failure shows no candidate details or contact', () => {
    mocks.candidate.mockReturnValue({
      error: { status: 403, message: 'Forbidden request.' },
      refetch: mocks.refetch,
    });
    show(<CandidateReferralRequestPage />);
    expect(screen.getByText('Forbidden request.')).toBeInTheDocument();
    expect(mocks.contact).not.toHaveBeenCalled();
    expect(screen.queryByText('Please review my experience.')).not.toBeInTheDocument();
  });
});
function statusLabel(value: ReferralRequestRecord['status']) {
  return (
    {
      Requested: 'Pending',
      Accepted: 'Accepted',
      Rejected: 'Rejected',
      Expired: 'Expired',
      ReferralSubmitted: 'Submitted',
      CandidateConfirmed: 'Confirmed',
    } as Record<string, string>
  )[value]!;
}

describe('referral navigation empty states', () => {
  it('links empty My Requests to Find Referral Jobs', async () => {
    show(<CandidateReferralRequestsPage />);
    expect(screen.getByText("You haven't requested any referrals yet.")).toBeVisible();
    expect(screen.getByRole('link', { name: 'View referral notifications' })).toHaveAttribute('href', '/dashboard/notifications');
    await userEvent.click(screen.getAllByRole('button', { name: 'Find Referral Jobs' })[0]!);
    expect(screen.getByLabelText('location')).toHaveTextContent('/dashboard/jobs');
  });
  it('clears referral catalogue filters from the empty state', async () => {
    show();
    fireEvent.change(screen.getByLabelText('Search job title, company or skills'), {
      target: { value: 'no matching job' },
    });
    expect(screen.getByText('No matching referral jobs found.')).toBeVisible();
    await userEvent.click(screen.getAllByRole('button', { name: 'Clear Filters' }).at(-1)!);
    expect(screen.getByLabelText('Search job title, company or skills')).toHaveValue('');
    expect(screen.queryByText('No matching referral jobs found.')).not.toBeInTheDocument();
  });
});

describe('Phase 2 membership and request presentation', () => {
  it('uses explicit inactive entitlement despite a nonzero quota limit', () => {
    mocks.activity.mockReturnValue(
      result({ items: [], quota: { ...quota, hasActiveAccess: false, remainingConnections: 0 } }),
    );
    show(<CandidateReferralRequestsPage />);
    expect(screen.getByText('Referral Access Required')).toBeVisible();
    expect(
      screen.getByText('Activate an eligible plan to request and manage referral connections.'),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'View Membership' })).toHaveAttribute(
      'href',
      '/dashboard/membership',
    );
    expect(screen.queryByText(/accepted connections ·/)).not.toBeInTheDocument();
  });
  it('shows exact active backend counts', () => {
    show(<CandidateReferralRequestsPage />);
    expect(screen.getByText(/2 \/ 10 accepted connections · 8 remaining/)).toBeVisible();
  });
  it.each([
    [
      'Accepted',
      'The employee accepted your request. The referral has not yet been reported as submitted.',
      'View Referral Details',
    ],
    [
      'ReferralSubmitted',
      'The employee reports submitting the referral. This does not confirm employer receipt. Acknowledge only when you receive instructions.',
      'Acknowledge Receipt',
    ],
    [
      'CandidateConfirmed',
      'You acknowledged receiving instructions. This is not independent employer verification.',
      'View Details',
    ],
  ])('explains %s without fabricating employer outcomes', (status, explanation, action) => {
    mocks.activity.mockReturnValue(
      result({
        items: [
          {
            ...requestRecord.request,
            status,
            acceptedAtUtc: '2026-10-08T07:00:00Z',
            referralSubmittedAtUtc: '2026-10-09T07:00:00Z',
            candidateConfirmedAtUtc: '2026-10-10T07:00:00Z',
          },
        ],
        quota,
      }),
    );
    show(<CandidateReferralRequestsPage />);
    expect(screen.getByText(explanation)).toBeVisible();
    expect(screen.getByText(/Last status update:/)).toBeVisible();
    expect(screen.getByRole('button', { name: new RegExp(action) })).toBeVisible();
  });
});
