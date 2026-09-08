import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AIApplyDashboardPage } from './AIApplyDashboardPage';

const mocks = vi.hoisted(() => ({
  access: { data: { canUseAIApply: false, canUseAIApplyPro: false }, error: undefined as { status: number } | undefined, isError: false, isLoading: false, refetch: vi.fn() },
}));

vi.mock('@/features/aiApply/api/aiApplyApi', () => ({
  useGetAIApplyAccessQuery: () => mocks.access,
  useGetAIApplySettingsQuery: () => ({ data: { enabled: true, paused: false }, isLoading: false }),
  useGetAIApplyDashboardQuery: () => ({ data: { totalApplications: 8, submittedApplications: 4, failedApplications: 1, waitingApplications: 2, applicationsRequiringUserInput: 2 }, isError: false, isLoading: false, refetch: vi.fn() }),
  useGetAIApplyApplicationsQuery: () => ({ data: [], isError: false, isLoading: false }),
  useGetAIApplyQuestionsQuery: () => ({ data: [], isError: false, isLoading: false }),
}));

describe('simplified AI Apply dashboard', () => {
  beforeEach(() => {
    mocks.access.data = { canUseAIApply: false, canUseAIApplyPro: false };
    mocks.access.error = undefined;
    mocks.access.isError = false;
  });

  it('maps forbidden access to a plan-required state instead of a loader', () => {
    mocks.access.isError = true;
    mocks.access.error = { status: 403 };
    render(<MemoryRouter><AIApplyDashboardPage /></MemoryRouter>);
    expect(screen.getByText('AI Apply requires an active AI Apply plan')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Continue manually' })).toBeVisible();
  });

  it('shows one dashboard without the former top-level tab bar', () => {
    mocks.access.data = { canUseAIApply: true, canUseAIApplyPro: true };
    render(<MemoryRouter><AIApplyDashboardPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'AI Apply' })).toBeVisible();
    expect(screen.getByText('Submitted')).toBeVisible();
    expect(screen.getByText('Needs your attention')).toBeVisible();
    expect(screen.queryByRole('navigation', { name: 'AI Apply sections' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Find matching jobs' })).toHaveAttribute('href', '/dashboard/jobs?mode=recommended');
  });
});
