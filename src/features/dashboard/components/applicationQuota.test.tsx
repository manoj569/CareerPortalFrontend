import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { ApiRequestError } from '@/api/apiError';
import { UserRole } from '@/types';
import { ROUTES } from '@/constants/routes';
import { ApplicationQuotaIndicator } from './ApplicationQuotaIndicator';
import { ApplyToJobButton } from './ApplyToJobButton';
import { getApplicationFailure } from '../utils/applicationError';

const { request } = vi.hoisted(() => ({ request: vi.fn<(config: { url: string; method?: string }) => Promise<unknown>>() }));
vi.mock('@/api/apiClient', () => ({ apiClient: { request } }));
const auth = { status: 'authenticated' as const, user: { id: 'candidate', firstName: 'Test', lastName: 'User', email: 'test@example.test', role: UserRole.Candidate }, isSubmitting: false, error: null, accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z' };
let quota = { plan: 'Free', isPremium: false, limit: 10, usedApplications: 8, remainingApplications: 2, resetsAtUtc: '2026-11-01T00:00:00Z' };
let failure: ApiRequestError | null = null;
beforeEach(() => {
  quota = { plan: 'Free', isPremium: false, limit: 10, usedApplications: 8, remainingApplications: 2, resetsAtUtc: '2026-11-01T00:00:00Z' };
  failure = null;
  request.mockReset().mockImplementation(({ method }) => {
    if (method === 'POST') {
      if (failure) return Promise.reject(failure);
      quota = { ...quota, usedApplications: quota.usedApplications + 1, remainingApplications: quota.remainingApplications - 1 };
      return Promise.resolve({ data: { data: { id: 'application' } } });
    }
    return Promise.resolve({ data: { data: quota } });
  });
});
afterEach(async () => { await act(async () => { await new Promise(resolve => setTimeout(resolve, 50)); }); });
function page() {
  return renderWithProviders(<MemoryRouter><Routes><Route path='/' element={<><ApplicationQuotaIndicator />{['one', 'two'].map(id => <ApplyToJobButton key={id} applicationUrl={null} jobId={id} jobSlug='engineer' label={`Apply ${id}`} />)}</>} /><Route path={ROUTES.MEMBERSHIP} element={<p>Membership destination</p>} /></Routes></MemoryRouter>, { auth });
}
async function apply(id = 'one') {
  await screen.findByRole('status');
  fireEvent.click(screen.getByRole('button', { name: `Apply ${id}` }));
  fireEvent.click(screen.getByRole('button', { name: 'Continue to company website' }));
}
describe('backend-driven application quota', () => {
  it.each([
    [false, 0, '10 free applications left this month'], [false, 8, '2 applications left this month'], [false, 9, '1 application left this month'], [false, 10, 'Free application limit reached'],
    [true, 0, '35 applications left today'], [true, 12, '23 applications left today'], [true, 34, '1 application left today'], [true, 35, 'Daily application limit reached'],
  ] as const)('indicator premium=%s used=%s', async (premium, used, text) => {
    quota = { ...quota, isPremium: premium, limit: premium ? 35 : 10, usedApplications: used, remainingApplications: (premium ? 35 : 10) - used };
    page(); expect(await screen.findByText(text)).toBeVisible();
  });
  it.each([false, true])('allows the final application and refetches quota before blocking the next: premium=%s', async premium => {
    quota = { ...quota, isPremium: premium, limit: premium ? 35 : 10, usedApplications: premium ? 34 : 9, remainingApplications: 1 };
    page(); await apply();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Applied' })).toBeVisible());
    await waitFor(() => expect(within(screen.getByRole('status')).getByText(premium ? 'Daily application limit reached' : 'Free application limit reached')).toBeVisible());
    expect(request.mock.calls.filter(([config]) => config.method === 'POST')).toHaveLength(1);
    expect(request.mock.calls.filter(([config]) => config.url === '/candidate/application-quota').length).toBeGreaterThan(1);
    await apply('two');
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(premium ? 'Daily application limit reached' : 'Unlock more job applications')).toBeVisible();
    expect(request.mock.calls.filter(([config]) => config.method === 'POST')).toHaveLength(1);
    if (premium) expect(within(dialog).queryByRole('button', { name: 'Upgrade to Premium' })).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: premium ? 'Got it' : 'Maybe later' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
  it.each(['MONTHLY_JOB_LIMIT_REACHED', 'DAILY_JOB_LIMIT_REACHED'])('uses backend %s even with remaining client quota', async code => {
    failure = new ApiRequestError({ status: 429, code, message: 'Limit reached', redirectToMembership: code.startsWith('MONTHLY') });
    page(); await apply();
    const dialog = await screen.findByRole('dialog', { name: code.startsWith('MONTHLY') ? 'Unlock more job applications' : 'Daily application limit reached' });
    expect(dialog).toBeVisible();
  });
  it('only redirects after explicit Upgrade, preserving the existing membership path', async () => {
    quota.remainingApplications = 0; page(); await apply();
    expect(screen.queryByText('Membership destination')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Upgrade to Premium' }));
    expect(await screen.findByText('Membership destination')).toBeVisible();
    expect(request.mock.calls.filter(([config]) => config.method === 'POST')).toHaveLength(0);
  });
  it('shows server failures without a quota dialog', async () => {
    failure = new ApiRequestError({ status: 500, message: 'Service unavailable' });
    page(); await apply();
    expect(await screen.findByText('Service unavailable')).toBeVisible();
    expect(screen.queryByText('Unlock more job applications')).not.toBeInTheDocument();
  });
  it('hides unavailable quota without blocking an application', async () => {
    request.mockImplementation(({ method }) => method === 'POST' ? Promise.resolve({ data: { data: { id: 'application' } } }) : Promise.reject(new ApiRequestError({ status: 500, message: 'Quota unavailable' })));
    page();
    await waitFor(() => expect(request).toHaveBeenCalled());
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Apply one' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue to company website' }));
    expect(await screen.findByRole('button', { name: 'Applied' })).toBeVisible();
  });
  it.each([401, 400, 500, 429])('does not classify generic status %s as quota', status => {
    expect(getApplicationFailure({ status, message: 'Request failed' }).kind).toBe('message');
  });
  it.each([['MONTHLY_JOB_LIMIT_REACHED', 'monthly'], ['DAILY_JOB_LIMIT_REACHED', 'daily']] as const)('prioritizes %s over 429', (code, kind) => {
    expect(getApplicationFailure({ status: 429, code }).kind).toBe(kind);
  });
});
