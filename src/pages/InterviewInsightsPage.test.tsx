import { ROUTES } from '@/constants/routes';
import {
  InterviewDifficulty,
  InterviewInsightStatus,
  InterviewRoundType,
  InterviewScheduleStatus,
  type InterviewInsightResponse,
} from '@/features/interviewInsights/types/interviewInsightModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AxiosRequestConfig } from 'axios';
import { InterviewInsightsPage } from './InterviewInsightsPage';

const requestMock = vi.hoisted(() =>
  vi.fn<(config: AxiosRequestConfig) => Promise<{ data: { data: unknown } }>>(),
);
vi.mock('@/api/apiClient', () => ({ apiClient: { request: requestMock } }));

const company = { count: 3, id: 'company-id', name: 'HARMAN' };
const baseInsight: InterviewInsightResponse = {
  authorDisplayName: null,
  canGiveFeedback: false,
  canReadFull: false,
  companyId: company.id,
  companyLogoUrl: null,
  companyName: company.name,
  experienceLevel: null,
  helpfulConfirmedCount: 3,
  id: 'insight-id',
  interviewMonth: 7,
  interviewYear: 2026,
  isAnonymous: true,
  jobId: null,
  outcome: null,
  overallDifficulty: InterviewDifficulty.Moderate,
  preparationTips: null,
  processSummary: 'A concise safe overview of the process.',
  publishedAtUtc: '2026-08-01T00:00:00Z',
  qualityScore: 10,
  roleTitle: 'Frontend Engineer',
  roundCount: 1,
  rounds: [],
  status: InterviewInsightStatus.Published,
};

const page = (items: InterviewInsightResponse[]) => ({
  items,
  pageNumber: 1,
  pageSize: 12,
  totalCount: items.length,
  totalPages: items.length ? 1 : 0,
});

const response = (data: unknown) => Promise.resolve({ data: { data } });

const installHandlers = ({
  detail = baseInsight,
  insights = [baseInsight],
  schedules = [],
}: {
  detail?: InterviewInsightResponse;
  insights?: InterviewInsightResponse[];
  schedules?: unknown[];
} = {}) => {
  requestMock.mockImplementation((config) => {
    if (config.url === '/jobs/filter-options') return response({ companies: [company] });
    if (config.url === '/candidate/interview-insights' && config.method === 'GET')
      return response(page(insights));
    if (config.url === '/candidate/interview-insights/insight-id') return response(detail);
    if (config.url === '/candidate/interview-schedules' && config.method === 'GET')
      return response(schedules);
    if (config.url === '/candidate/interview-schedules' && config.method === 'POST')
      return response({ id: 'new-schedule-id' });
    if (config.url === '/candidate/interview-insights' && config.method === 'POST')
      return response({
        ...baseInsight,
        id: 'new-insight-id',
        status: InterviewInsightStatus.PendingReview,
      });
    return Promise.reject(new Error(`Unhandled request: ${config.method} ${config.url}`));
  });
};

const renderPage = (entry = ROUTES.INTERVIEW_INSIGHTS) =>
  renderWithProviders(
    <MemoryRouter initialEntries={[entry]}>
      <InterviewInsightsPage />
    </MemoryRouter>,
  );

describe('InterviewInsightsPage', () => {
  beforeEach(() => {
    requestMock.mockReset();
  });

  it('renders anonymous locked content without private or full-detail data', async () => {
    installHandlers({
      detail: {
        ...baseInsight,
        rounds: [
          {
            candidateAdvice: 'Never render locked advice',
            durationMinutes: 60,
            id: 'round-id',
            questionsOrTopics: 'Never render locked questions',
            roundTitle: 'Private round',
            roundType: InterviewRoundType.Technical,
            sequence: 1,
          },
        ],
        ...({
          candidateEmail: 'private@example.com',
          exactInterviewAtUtc: '2026-07-10T10:00:00Z',
        } as object),
      },
    });
    renderPage();

    expect(await screen.findByText(/Shared by Anonymous candidate/)).toBeVisible();
    expect(screen.getByText('Locked')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'View insight' }));
    expect(await screen.findByText('Full interview details are locked')).toBeVisible();
    expect(screen.queryByText('Never render locked questions')).not.toBeInTheDocument();
    expect(screen.queryByText('private@example.com')).not.toBeInTheDocument();
    expect(screen.queryByText('2026-07-10T10:00:00Z')).not.toBeInTheDocument();
  });

  it('renders unlocked rounds and eligible feedback only from backend flags', async () => {
    const unlocked = {
      ...baseInsight,
      canGiveFeedback: true,
      canReadFull: true,
      isAnonymous: false,
      authorDisplayName: 'Avery Patel',
      preparationTips: 'Review React rendering and communicate trade-offs.',
      rounds: [
        {
          candidateAdvice: 'Explain decisions clearly.',
          durationMinutes: 45,
          id: 'round-id',
          questionsOrTopics: 'React rendering and TypeScript narrowing.',
          roundTitle: 'Technical discussion',
          roundType: InterviewRoundType.Technical,
          sequence: 1,
        },
      ],
    };
    installHandlers({
      detail: unlocked,
      insights: [unlocked],
      schedules: [
        {
          companyId: company.id,
          companyName: company.name,
          feedbackAvailable: true,
          id: 'schedule-id',
          interviewAtUtc: '2026-07-01T10:00:00Z',
          jobId: null,
          roleTitle: 'Frontend Engineer',
          status: InterviewScheduleStatus.InterviewCompleted,
        },
      ],
    });
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'View insight' }));
    expect(await screen.findByText('React rendering and TypeScript narrowing.')).toBeVisible();
    expect(screen.getByText('Review React rendering and communicate trade-offs.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Did this insight help you?' })).toBeEnabled();
  });

  it('creates a private interview schedule using a real company option', async () => {
    installHandlers();
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add interview schedule' }));
    const dialog = screen.getByRole('dialog', { name: 'Add interview schedule' });
    await user.click(within(dialog).getByRole('combobox', { name: /Company/ }));
    await user.click(await screen.findByRole('option', { name: 'HARMAN' }));
    await user.type(within(dialog).getByLabelText(/Role title/), 'Frontend Engineer');
    fireEvent.change(within(dialog).getByLabelText(/Interview date and time/), {
      target: { value: '2026-08-25T11:00' },
    });
    await user.click(within(dialog).getByRole('button', { name: 'Save schedule' }));

    await waitFor(() =>
      expect(
        requestMock.mock.calls.some(
          ([request]) =>
            request.method === 'POST' && request.url === '/candidate/interview-schedules',
        ),
      ).toBe(true),
    );
    const scheduleRequest = requestMock.mock.calls.find(
      ([request]) =>
        request.method === 'POST' && request.url === '/candidate/interview-schedules',
    )?.[0];
    expect(scheduleRequest?.data as unknown).toEqual(
      expect.objectContaining({
        companyId: company.id,
        jobId: null,
        roleTitle: 'Frontend Engineer',
      }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Add interview schedule' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('shows that shared insights are pending review and does not fake publication', async () => {
    installHandlers();
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Share an interview insight' }));
    const dialog = screen.getByRole('dialog', { name: 'Share an interview insight' });
    expect(
      within(dialog).getByText('Submitted insights are reviewed before publication.'),
    ).toBeVisible();

    await user.click(within(dialog).getByRole('combobox', { name: /Company/ }));
    await user.click(await screen.findByRole('option', { name: 'HARMAN' }));
    await user.type(within(dialog).getByLabelText(/Role title/), 'Frontend Engineer');
    fireEvent.change(within(dialog).getByLabelText(/Interview month/), {
      target: { value: '2026-07' },
    });
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }));
    await user.type(within(dialog).getByLabelText(/Questions or topics/), 'React rendering topics');
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }));
    await user.type(
      within(dialog).getByLabelText(/Process summary/),
      'Two structured interview rounds.',
    );
    await user.type(
      within(dialog).getByLabelText(/Preparation tips/),
      'Prepare examples from recent work.',
    );
    await user.click(
      within(dialog).getByRole('checkbox', { name: /I confirm this contains no confidential/i }),
    );
    await user.click(within(dialog).getByRole('button', { name: 'Continue' }));
    expect(within(dialog).getByText(/will start as Pending review/i)).toBeVisible();
    await user.click(within(dialog).getByRole('button', { name: 'Submit for review' }));
    expect(
      await screen.findByText('Submitted insight is pending administrator review.'),
    ).toBeVisible();
    expect(screen.queryByText(/published immediately/i)).not.toBeInTheDocument();
  }, 20_000);

  it('shows a safe retryable error without exposing backend private details', async () => {
    installHandlers();
    requestMock.mockImplementation((config) => {
      if (config.url === '/jobs/filter-options') return response({ companies: [company] });
      if (config.url === '/candidate/interview-schedules') return response([]);
      return Promise.reject(new Error('Interview Insights are temporarily unavailable.'));
    });
    renderPage();
    expect(await screen.findByText('Could not load interview insights')).toBeVisible();
    expect(screen.getByRole('button', { name: /try again/i })).toBeEnabled();
    expect(document.body).not.toHaveTextContent('private@example.com');
  });
});
