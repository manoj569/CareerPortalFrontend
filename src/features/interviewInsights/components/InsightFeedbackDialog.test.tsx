import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InsightFeedbackDialog } from './InterviewInsightDialogs';
import { InsightHelpfulness, InterviewMatch, InterviewScheduleStatus, type InterviewScheduleResponse } from '../types/interviewInsightModels';

const submit = vi.hoisted(() => vi.fn());
vi.mock('../api/interviewInsightsApi', async (importOriginal) => ({
  ...await importOriginal<typeof import('../api/interviewInsightsApi')>(),
  useAddInsightFeedbackMutation: () => [submit, { isLoading: false }],
}));
const schedule: InterviewScheduleResponse = {
  id: 'schedule', companyId: 'company', companyName: 'Example', jobId: null,
  roleTitle: 'Engineer', interviewAtUtc: '2026-07-01T12:00:00Z', interviewFormat: null,
  approximateTimeOfDay: null, expectedRoundTypes: [], preparationStatus: null,
  reminderOffsetMinutes: 30, timeZoneId: 'UTC',
  reminderRequested: false, status: InterviewScheduleStatus.InterviewCompleted,
  confirmFeedbackAvailableAtUtc: '2026-07-01T12:00:00Z', feedbackAvailable: true,
};
async function fill() {
  const user = userEvent.setup();
  render(<InsightFeedbackDialog insightId="insight" onClose={vi.fn()} open schedules={[schedule]} />);
  await user.click(screen.getByRole('combobox', { name: 'Helpfulness' }));
  await user.click(screen.getByRole('option', { name: 'Helped' }));
  await user.click(screen.getByRole('combobox', { name: 'Interview match' }));
  await user.click(screen.getByRole('option', { name: 'Matched' }));
  return user;
}
describe('Helpful feedback submission', () => {
  beforeEach(() => submit.mockReset());
  it('submits once during a pending request and confirms without claiming voter points', async () => {
    let complete!: (value: unknown) => void;
    const pending = new Promise((resolve) => { complete = resolve; });
    submit.mockReturnValue({ unwrap: () => pending });
    const user = await fill();
    await user.dblClick(screen.getByRole('button', { name: 'Submit feedback' }));
    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit).toHaveBeenCalledWith({ id: 'insight', data: {
      candidateInterviewScheduleId: 'schedule', feedback: null,
      helpfulness: InsightHelpfulness.Helped, interviewMatch: InterviewMatch.Matched,
    } });
    complete({ helpfulConfirmedCount: 4 });
    expect(await screen.findByText('Thanks. Your feedback helps keep insights useful.')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Submit feedback' })).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent('earned 10');
  });
  it('retains form state after failure and allows a successful retry', async () => {
    submit.mockReturnValueOnce({ unwrap: () => Promise.reject(new Error('failure')) })
      .mockReturnValueOnce({ unwrap: () => Promise.resolve({ helpfulConfirmedCount: 4 }) });
    const user = await fill();
    await user.click(screen.getByRole('button', { name: 'Submit feedback' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveAttribute('class', expect.stringContaining('MuiAlert')));
    expect(screen.getByRole('combobox', { name: 'Helpfulness' })).toHaveTextContent('Helped');
    await user.click(screen.getByRole('button', { name: 'Submit feedback' }));
    expect(await screen.findByText('Thanks. Your feedback helps keep insights useful.')).toBeVisible();
    expect(submit).toHaveBeenCalledTimes(2);
  });
});
