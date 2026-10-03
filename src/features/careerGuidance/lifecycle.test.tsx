import { act, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { UserRole } from '@/types';
import { ApiRequestError } from '@/api/apiError';
import { ConsultantVerificationStatus as Status } from './types/enums';
import { consultantLifecycle } from './utils/lifecycle';
import { ConsultantWorkspaceGate } from './components/ConsultantWorkspaceGate';
import { MarketplacePage } from './pages/MarketplacePage';

const { request } = vi.hoisted(() => ({ request: vi.fn<(config: { url: string }) => Promise<unknown>>() }));
vi.mock('@/api/apiClient', () => ({ apiClient: { request } }));
const auth = { status: 'authenticated' as const, user: { id: 'owner', firstName: 'Test', lastName: 'Owner', email: 'test@example.test', role: UserRole.Candidate }, isSubmitting: false, error: null, accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z' };
const cases = [
  { status: undefined, label: 'Become a Consultant', destination: '/career-guidance/become-consultant' },
  { status: Status.Draft, label: 'Continue consultant setup', destination: '/career-guidance/become-consultant' },
  { status: Status.Pending, label: 'View application status', destination: '/career-guidance/become-consultant/review' },
  { status: Status.Verified, label: 'Consultant Workspace', destination: '/career-guidance/consultant/profile' },
  { status: Status.Rejected, label: 'Update consultant profile', destination: '/career-guidance/become-consultant/review' },
  { status: Status.Suspended, label: 'View consultant status', destination: '/career-guidance/become-consultant/review' },
];
beforeEach(() => { request.mockReset(); });
function respond(status?: Status) {
  request.mockImplementation(({ url }) => url === '/career-guidance/me/onboarding'
    ? status === undefined ? Promise.reject(new ApiRequestError({ status: 404, message: 'Not found' })) : Promise.resolve({ data: { data: { status } } })
    : Promise.resolve({ data: { data: { items: [], totalPages: 0 } } }));
}
describe('consultant lifecycle navigation', () => {
  it('derives readiness without treating consent as completed or persisting another status', () => {
    expect(consultantLifecycle(Status.Draft, ['DisplayName']).canSubmit).toBe(false);
    expect(consultantLifecycle(Status.Draft, ['CurrentPolicyAcceptance', 'PublicProfileConsent']).displayStatus).toBe('Ready to submit');
    expect(consultantLifecycle(Status.Pending).canSubmit).toBe(false);
  });
  it.each(cases)('marketplace CTA for $label', async ({ status, label, destination }) => {
    respond(status);
    renderWithProviders(<MemoryRouter><MarketplacePage /></MemoryRouter>, { auth });
    await waitFor(() => expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', destination));
  });
  it.each(cases)('workspace routing for $label', async ({ status, destination }) => {
    respond(status);
    renderWithProviders(<MemoryRouter initialEntries={['/career-guidance/consultant/profile']}><Routes>
      <Route element={<ConsultantWorkspaceGate />}><Route path='/career-guidance/consultant/profile' element={<p>Operational workspace</p>} /></Route>
      <Route path='/career-guidance/become-consultant' element={<p>Onboarding destination</p>} />
      <Route path='/career-guidance/become-consultant/review' element={<p>Status destination</p>} />
    </Routes></MemoryRouter>, { auth });
    expect(await screen.findByText(status === Status.Verified ? 'Operational workspace' : destination.endsWith('/review') ? 'Status destination' : 'Onboarding destination')).toBeVisible();
  });
  it('does not treat server failures as a missing consultant or enter the workspace', async () => {
    request.mockRejectedValue(new ApiRequestError({ status: 500, message: 'Unavailable' }));
    renderWithProviders(<MemoryRouter><Routes><Route element={<ConsultantWorkspaceGate />}><Route path='*' element={<p>Operational workspace</p>} /></Route></Routes></MemoryRouter>, { auth });
    expect(await screen.findByRole('alert')).toBeVisible();
    expect(screen.queryByText('Operational workspace')).not.toBeInTheDocument();
  });
  it('does not fetch protected onboarding for a guest marketplace visitor', async () => {
    respond();
    renderWithProviders(<MemoryRouter><MarketplacePage /></MemoryRouter>);
    await act(async () => { await Promise.resolve(); });
    expect(request.mock.calls.some(([config]) => config.url === '/career-guidance/me/onboarding')).toBe(false);
    expect(screen.getByRole('link', { name: 'Become a Consultant' })).toBeVisible();
  });
});
