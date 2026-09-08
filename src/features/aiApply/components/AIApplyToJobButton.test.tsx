import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '@/types';
import { AIApplyToJobButton } from './AIApplyToJobButton';

const mocks = vi.hoisted(() => ({
  access: { data: { canUseAIApply: false }, isLoading: false, refetch: vi.fn() },
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
  useGetProfileQuery: () => ({ data: { resume: { fileName: 'career.pdf' } } }),
}));
vi.mock('../api/aiApplyApi', () => ({
  useLazyGetAIApplyAccessQuery: () => [mocks.checkAccess, mocks.access],
  useQueueAIApplyApplicationMutation: () => [mocks.queue, { isLoading: false }],
}));

describe('AI Apply job action', () => {
  beforeEach(() => {
    mocks.access.data = { canUseAIApply: false };
    mocks.checkAccess.mockReset();
    mocks.queue.mockReset();
  });

  const renderButton = () => render(<MemoryRouter><AIApplyToJobButton companyName="Northstar" jobId="job-1" jobTitle="Engineer" /></MemoryRouter>);

  it('keeps manual application available when a plan is required', async () => {
    renderButton();
    await userEvent.click(screen.getByRole('button', { name: 'AI Apply' }));
    expect(await screen.findByText('AI Apply requires an active AI Apply plan')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Continue manually' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'View membership plans' })).toBeEnabled();
  });

  it('queues only the selected job after entitled confirmation', async () => {
    mocks.access.data = { canUseAIApply: true };
    mocks.queue.mockReturnValue({ unwrap: () => new Promise(() => undefined) });
    renderButton();
    await userEvent.click(screen.getByRole('button', { name: 'AI Apply' }));
    expect(await screen.findByText('Career Harbor does not fabricate sensitive information.')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Start AI Apply' }));
    expect(mocks.queue).toHaveBeenCalledWith({ jobId: 'job-1' });
  });
});
