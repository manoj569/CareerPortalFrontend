import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AIApplyFailureKind, AIApplyRunStatus } from '@/features/aiApply/types/aiApplyModels';
import { AIApplyApplicationDetailPage } from './AIApplyApplicationDetailPage';

const mocks = vi.hoisted(() => ({
  cancel: vi.fn(),
  continueApplication: vi.fn(),
  detailRefetch: vi.fn(),
  questionsRefetch: vi.fn(),
}));

const application = {
  actions: {
    canCancel: true,
    canContinue: true,
    canOpenExternalApplication: true,
    requiresCandidateAction: true,
  },
  completedAtUtc: null,
  createdAtUtc: '2026-09-04T10:00:00Z',
  externalApplication: {
    canOpen: true,
    displayName: 'Workday',
    site: 5,
    url: 'https://safe.example/apply',
  },
  failureKind: AIApplyFailureKind.LoginRequired,
  id: 'application-id',
  jobId: 'job-id',
  matchScore: 80,
  message: 'Complete the requested action.',
  priority: 1,
  requiresUserInput: true,
  retryCount: 0,
  scheduledAtUtc: '2026-09-04T10:00:00Z',
  startedAtUtc: '2026-09-04T10:01:00Z',
  status: AIApplyRunStatus.WaitingForUser,
};

vi.mock('@/features/aiApply/api/aiApplyApi', () => ({
  useCancelAIApplyApplicationMutation: () => [mocks.cancel, { isLoading: false }],
  useContinueAIApplyApplicationMutation: () => [mocks.continueApplication, { isLoading: false }],
  useGetAIApplyApplicationQuery: () => ({
    data: application,
    isError: false,
    isLoading: false,
    refetch: mocks.detailRefetch,
  }),
  useGetAIApplyQuestionsQuery: () => ({ data: [], refetch: mocks.questionsRefetch }),
}));

vi.mock('@/features/aiApply/components/AIApplyHandoffCard', () => ({
  AIApplyHandoffCard: ({ onContinue }: { onContinue?: () => void }) => (
    <button onClick={onContinue}>Continue application</button>
  ),
}));

describe('AI Apply application continuation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.detailRefetch.mockResolvedValue({ data: application });
    mocks.questionsRefetch.mockResolvedValue({ data: [] });
    mocks.continueApplication.mockReturnValue({
      unwrap: () => Promise.resolve({ ...application, status: AIApplyRunStatus.Queued }),
    });
  });

  it('continues the selected application and refetches detail and attention state', async () => {
    render(
      <MemoryRouter initialEntries={['/ai-apply/applications/application-id']}>
        <Routes>
          <Route path="/ai-apply/applications/:id" element={<AIApplyApplicationDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continue application' }));
    expect(mocks.continueApplication).toHaveBeenCalledWith('application-id');
    await waitFor(() => {
      expect(mocks.detailRefetch).toHaveBeenCalled();
      expect(mocks.questionsRefetch).toHaveBeenCalled();
    });
    expect(screen.queryByText(/^Submitted$/i)).not.toBeInTheDocument();
  });
});
