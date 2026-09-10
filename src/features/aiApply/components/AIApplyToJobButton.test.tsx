import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '@/types';
import { AIApplyToJobButton } from './AIApplyToJobButton';

const mocks = vi.hoisted(() => ({
  access: { data: { canUseAIApply: false }, isLoading: false, isFetching: false, isError: false, error: { status: 0 }, refetch: vi.fn() },
  checkAccess: vi.fn(),
  queue: vi.fn(),
}));

vi.mock('@/features/auth/store/authSlice', () => ({
  selectCurrentUser: 'current-user',
  selectIsAuthenticated: 'is-authenticated',
}));
vi.mock('@/hooks/reduxHooks', () => ({
  useAppSelector: (selector: string) => selector === 'is-authenticated' ? true : { role: UserRole.Candidate },
}));
vi.mock('@/features/dashboard/api/dashboardApi', () => ({
  useGetApplicationQuotaQuery: () => ({ data: undefined }),
  useSubmitApplicationMutation: () => [vi.fn(), { isLoading: false }],
  useGetProfileQuery: () => ({ data: { resume: { fileName: 'career.pdf' } } }),
}));
vi.mock('../api/aiApplyApi', () => ({
  useLazyGetAIApplyAccessQuery: () => [mocks.checkAccess, mocks.access],
  useQueueAIApplyApplicationMutation: () => [mocks.queue, { isLoading: false }],
}));

describe('AI Apply job action', () => {
  beforeEach(() => {
    mocks.access.data = { canUseAIApply: false };
    mocks.access.isLoading = false;
    mocks.access.isFetching = false;
    mocks.access.isError = false;
    mocks.access.error = { status: 0 };
    mocks.checkAccess.mockReset();
    mocks.queue.mockReset();
  });

  const renderButton = () => render(<MemoryRouter><AIApplyToJobButton companyName="Northstar" jobId="job-1" jobSlug="engineer" jobTitle="Engineer" /></MemoryRouter>);

  it('keeps manual application available when a plan is required', async () => {
    renderButton();
    await userEvent.click(screen.getByRole('button', { name: 'AI Apply' }));
    expect(await screen.findByText('AI Apply requires a plan')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Continue manually' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'View membership plans' })).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: 'Continue manually' }));
    expect(await screen.findByRole('dialog', { name: 'Apply on company website' })).toBeVisible();
    expect(mocks.queue).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'AI Apply' })).toHaveFocus());
  });

  it('queues only the selected job after entitled confirmation', async () => {
    mocks.access.data = { canUseAIApply: true };
    mocks.queue.mockReturnValue({ unwrap: () => new Promise(() => undefined) });
    renderButton();
    await userEvent.click(screen.getByRole('button', { name: 'AI Apply' }));
    expect(await screen.findByText('Career Harbor does not fabricate sensitive information.')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Start AI Apply' }));
    expect(mocks.queue).toHaveBeenCalledWith({ jobId: 'job-1' });
    await userEvent.click(screen.getByRole('button', { name: 'Start AI Apply' }));
    expect(mocks.queue).toHaveBeenCalledTimes(1);
  });

  it('navigates to membership only after the candidate chooses View membership plans', async () => {
    render(<MemoryRouter><Routes><Route path="/" element={<AIApplyToJobButton companyName="Northstar" jobId="job-1" jobSlug="engineer" jobTitle="Engineer" />} /><Route path="/dashboard/membership" element={<h1>Membership destination</h1>} /></Routes></MemoryRouter>);
    await userEvent.click(screen.getByRole('button', { name: 'AI Apply' }));
    expect(screen.queryByRole('heading', { name: 'Membership destination' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'View membership plans' }));
    expect(await screen.findByRole('heading', { name: 'Membership destination' })).toBeVisible();
  });

  it('shows a labelled busy dialog while access is loading', async () => {
    mocks.access.isLoading = true;
    renderButton();
    await userEvent.click(screen.getByRole('button', { name: 'AI Apply' }));
    expect(screen.getByRole('dialog', { name: 'Checking AI Apply access' })).toBeVisible();
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('ends loading and provides retry and manual actions after a 403 access error', async () => {
    mocks.access.isError = true;
    mocks.access.error = { status: 403 };
    renderButton();
    await userEvent.click(screen.getByRole('button', { name: 'AI Apply' }));
    expect(screen.getByRole('alert')).toHaveTextContent('AI Apply access could not be confirmed.');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue manually' })).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mocks.checkAccess).toHaveBeenCalledTimes(2);
    expect(mocks.queue).not.toHaveBeenCalled();
  });
});
