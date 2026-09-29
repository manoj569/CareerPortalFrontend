import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, Routes, Route } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MembershipStatus } from '@/features/dashboard/types/dashboardModels';
import type { PublicReferralJob, ReferralUnlockResult } from '../types/referralModels';
import { ReferralJobsSection } from './ReferralJobsSection';
import { ReferralJobCard } from './ReferralJobCard';
import { ReferralContactDetailsPage } from '@/pages/ReferralContactDetailsPage';

const mocks = vi.hoisted(() => {
  const unlockState: { data?: ReferralUnlockResult; isFetching?: boolean } = {};
  return {
    list: vi.fn(),
    memberships: vi.fn(),
    plans: vi.fn(),
    user: vi.fn(),
    unlock: vi.fn(),
    unlockState,
    refetch: vi.fn(),
  };
});
vi.mock('../api/referralsApi', () => ({
  useGetPublicReferralJobsQuery: mocks.list,
  useLazyUnlockReferralContactQuery: () => [mocks.unlock, mocks.unlockState],
}));
vi.mock('@/features/dashboard/api/dashboardApi', () => ({
  useGetMembershipsQuery: mocks.memberships,
}));
vi.mock('@/features/aiApply/api/aiApplyApi', () => ({ useGetAIApplyPlansQuery: mocks.plans }));
vi.mock('@/hooks/reduxHooks', () => ({ useAppSelector: mocks.user }));
const job: PublicReferralJob = {
  jobId: 'job-1',
  jobTitle: 'Platform engineer',
  companyName: 'Example company',
  location: 'Remote',
  referrerName: 'Alex Sample',
  skills: ['TypeScript', 'Accessibility'],
  minimumExperienceYears: 2,
  maximumExperienceYears: 5,
  employmentType: 1,
  referralAvailable: true,
  referrerCurrentRole: 'Engineer',
  referrerCompanyName: 'Example company',
  referrerCompletedYearsAtCompany: 3,
  isContactLocked: true,
};
const result = (value: ReferralUnlockResult) => {
  mocks.unlockState = { data: value, isFetching: false };
  mocks.unlock.mockReturnValue({ unwrap: () => Promise.resolve(value) });
};
const Location = () => {
  const location = useLocation();
  return (
    <output aria-label="Location">
      {location.pathname}
      {location.search}
      {JSON.stringify(location.state)}
    </output>
  );
};
const section = () =>
  render(
    <MemoryRouter initialEntries={['/dashboard/jobs?mode=referral']}>
      <Routes>
        <Route path="/dashboard/jobs" element={<ReferralJobsSection />} />
        <Route
          path="/dashboard/jobs/referral/:jobId/contact"
          element={<ReferralContactDetailsPage />}
        />
        <Route path="/dashboard/membership" element={<div>Membership</div>} />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
      <Location />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  mocks.user.mockReturnValue({ id: 'candidate' });
  mocks.list.mockReturnValue({
    currentData: { items: [job], totalCount: 25, totalPages: 3, pageNumber: 1, pageSize: 12 },
    isFetching: false,
    isError: false,
    refetch: mocks.refetch,
  });
  mocks.memberships.mockReturnValue({ data: [] });
  mocks.plans.mockReturnValue({
    data: [{ planCode: 'ReferralContactAccess', displayName: 'Referral contact plan' }],
  });
  result({
    status: 'Granted',
    message: '',
    contact: {
      referrerName: 'Alex Sample',
      email: 'authorized@example.test',
      linkedInUrl: null,
      phoneNumber: null,
    },
  });
});

describe('Referral marketplace', () => {
  it('renders backend cards, total count and pagination without claiming employment verification', async () => {
    section();
    expect(screen.getByText('25 referral jobs')).toBeVisible();
    expect(screen.getByText('Platform engineer')).toBeVisible();
    expect(screen.getByText('TypeScript')).toBeVisible();
    expect(screen.getByText('2–5 years')).toBeVisible();
    expect(screen.getByText(/Self-reported/)).toBeVisible();
    expect(screen.queryByText(/verified employee/i)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Go to page 2' }));
    expect(mocks.list).toHaveBeenLastCalledWith({ pageNumber: 2, pageSize: 12 });
  });
  it('only displays protected contacts after an authorized unlock response', async () => {
    section();
    expect(screen.queryByText(/authorized@example.test/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /View referrer details/ }));
    expect(mocks.unlock).toHaveBeenCalledWith('job-1', false);
    expect(await screen.findByText('authorized@example.test')).toBeVisible();
    expect(screen.queryByText(/^Phone:/)).not.toBeInTheDocument();
  });
  it('rejects contacts in a membership-required response and preserves referral return URL', async () => {
    result({
      status: 'MembershipRequired',
      message: '',
      contact: {
        referrerName: 'No access',
        email: 'private@example.test',
        linkedInUrl: null,
        phoneNumber: null,
      },
    });
    section();
    await userEvent.click(screen.getByRole('button', { name: /View referrer details/ }));
    await waitFor(
      () =>
        expect(screen.getByLabelText('Location')).toHaveTextContent(
          'plan=ReferralContactAccess&returnTo=%2Fdashboard%2Fjobs%2Freferral%2Fjob-1%2Fcontact',
        ),
      { timeout: 5000 },
    );
    expect(screen.queryByText(/private@example.test/)).not.toBeInTheDocument();
  });
  it('routes unauthenticated visitors to login without fetching private contacts', async () => {
    mocks.user.mockReturnValue(null);
    section();
    await userEvent.click(screen.getByRole('button', { name: /View referrer details/ }));
    expect(mocks.unlock).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Location')).toHaveTextContent('/login');
    expect(screen.getByLabelText('Location')).toHaveTextContent(
      '/dashboard/jobs/referral/job-1/contact',
    );
  });
  it('shows active referral access instead of a purchase CTA but still checks the protected endpoint', async () => {
    mocks.memberships.mockReturnValue({
      data: [
        {
          planName: 'Referral contact plan',
          status: MembershipStatus.Active,
          endsAtUtc: '2099-01-01T00:00:00Z',
        },
      ],
    });
    mocks.list.mockReturnValue({
      currentData: {
        items: [{ ...job, canViewReferrerContact: true }],
        totalCount: 1,
        totalPages: 1,
        pageNumber: 1,
      },
    });
    section();
    expect(screen.getByText('Referral Contact Access active')).toBeVisible();
    expect(screen.queryByRole('button', { name: /Get Referral/ })).not.toBeInTheDocument();
    expect(screen.getByText('Contact access available')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: /View referrer details/ }));
    expect(mocks.unlock).toHaveBeenCalledWith('job-1', false);
  });
  it('does not treat the standard membership as referral access', () => {
    mocks.memberships.mockReturnValue({
      data: [
        { planName: 'CareerHarborMembership', status: MembershipStatus.Active, endsAtUtc: null },
      ],
    });
    section();
    expect(screen.getByRole('button', { name: /Get Referral Contact Access/ })).toBeVisible();
    expect(screen.getByText('Unlock with Referral Contact Access')).toBeVisible();
  });
  it('renders nullable data without inventing a referrer, skills or an availability badge', () => {
    render(
      <ReferralJobCard
        job={{
          jobId: 'empty',
          jobTitle: 'Open role',
          companyName: null,
          location: null,
          referrerName: null,
          skills: null,
        }}
        onSeeDetails={vi.fn()}
      />,
    );
    expect(screen.getByText('Open role')).toBeVisible();
    expect(screen.queryByText(/Referred by/)).not.toBeInTheDocument();
    expect(screen.queryByText('Employee referral available')).not.toBeInTheDocument();
    expect(screen.queryByText(/Self-reported/)).not.toBeInTheDocument();
  });
  it.each([
    [0, 0, 'Fresher'],
    [4, null, '4+ years'],
  ] as const)('formats numeric experience %s to %s', (min, max, label) => {
    render(
      <ReferralJobCard
        job={{ ...job, minimumExperienceYears: min, maximumExperienceYears: max }}
        onSeeDetails={vi.fn()}
      />,
    );
    expect(screen.getByText(label)).toBeVisible();
  });
  it('keeps the banner around loading and empty states', () => {
    mocks.list.mockReturnValue({ isFetching: true });
    const view = section();
    expect(screen.getByRole('status', { name: 'Loading referral jobs' })).toBeVisible();
    expect(screen.getByText('₹299 for 30 days')).toBeVisible();
    view.unmount();
    mocks.list.mockReturnValue({
      currentData: { items: [], totalCount: 0, totalPages: 0, pageNumber: 1 },
    });
    section();
    expect(screen.getByText('No referral jobs yet')).toBeVisible();
    expect(screen.getByText('0 referral jobs')).toBeVisible();
  });
});
