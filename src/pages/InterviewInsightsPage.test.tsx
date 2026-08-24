import { ROUTES } from '@/constants/routes';
import {
  InterviewDifficulty,
  InterviewFormat,
  InterviewInsightStatus,
  InterviewOutcome,
  InterviewPreparationStatus,
  InterviewRoundType,
  InterviewTimeOfDay,
  type InterviewInsightCardResponse,
  type InterviewInsightResponse,
} from '@/features/interviewInsights/types/interviewInsightModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AxiosRequestConfig } from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InterviewInsightsPage } from './InterviewInsightsPage';

const requestMock = vi.hoisted(() =>
  vi.fn<(config: AxiosRequestConfig) => Promise<{ data: { data: unknown } }>>(),
);
vi.mock('@/api/apiClient', () => ({ apiClient: { request: requestMock } }));
const company = { companyName: 'HARMAN', id: 'company-id' };
const card: InterviewInsightCardResponse = {
  authorLabel: null,
  canGiveFeedback: false,
  canReadFull: false,
  companyId: company.id,
  companyName: company.companyName,
  difficulty: InterviewDifficulty.Moderate,
  experienceLevel: 'Mid level',
  helpfulConfirmedCount: 3,
  id: 'insight-id',
  interviewFormat: InterviewFormat.Video,
  interviewMonth: 7,
  interviewYear: 2026,
  isAnonymous: true,
  outcome: InterviewOutcome.Awaiting,
  roleTitle: 'Frontend Engineer',
  roundCount: 2,
  roundTypes: [InterviewRoundType.HR, InterviewRoundType.Technical],
  shortSummary: 'A concise safe overview of the process.',
  topicTags: ['React', 'TypeScript'],
};
const detail: InterviewInsightResponse = {
  authorDisplayName: null,
  canGiveFeedback: false,
  canReadFull: false,
  companyId: company.id,
  companyLogoUrl: null,
  companyName: company.companyName,
  experienceLevel: 'Mid level',
  helpfulConfirmedCount: 3,
  id: card.id,
  interviewFormat: InterviewFormat.Video,
  interviewMonth: 7,
  interviewYear: 2026,
  isAnonymous: true,
  jobId: null,
  outcome: null,
  overallDifficulty: InterviewDifficulty.Moderate,
  preparationTips: null,
  processSummary: card.shortSummary,
  publishedAtUtc: '2026-08-01T00:00:00Z',
  qualityScore: 10,
  roleTitle: card.roleTitle,
  roundCount: 2,
  rounds: [],
  status: InterviewInsightStatus.Published,
};
const response = (data: unknown) => Promise.resolve({ data: { data } });
const page = (items = [card]) => ({
  items,
  pageNumber: 1,
  pageSize: 12,
  totalCount: items.length,
  totalPages: items.length ? 1 : 0,
});

const installHandlers = ({
  cards = [card],
  contributions,
  detailValue = detail,
  schedules = [],
}: {
  cards?: InterviewInsightCardResponse[];
  contributions?: unknown;
  detailValue?: InterviewInsightResponse;
  schedules?: unknown[];
} = {}) => {
  requestMock.mockImplementation((config) => {
    if (!config) return response([]);
    if (config.url === '/candidate/companies/search') return response([company]);
    if (config.url === '/candidate/interview-insights' && config.method === 'GET')
      return response(page(cards));
    if (config.url === '/candidate/interview-insights/insight-id') return response(detailValue);
    if (config.url === '/candidate/interview-schedules' && config.method === 'GET')
      return response(schedules);
    if (config.url === '/candidate/interview-schedules' && config.method === 'POST')
      return response({ id: 'schedule-id' });
    if (config.url === '/candidate/interview-schedules/schedule-id' && config.method === 'PATCH')
      return response({ id: 'schedule-id' });
    if (config.url === '/candidate/interview-insights' && config.method === 'POST')
      return response({ ...detail, id: 'new-id', status: InterviewInsightStatus.PendingReview });
    if (config.url === '/candidate/interview-insights/my-contributions')
      return response(
        contributions ?? {
          badges: [],
          candidatesHelped: 0,
          contributionScore: 0,
          insightsPublished: 0,
          items: [],
          needsChanges: 0,
          pendingReview: 0,
        },
      );
    if (config.url === '/candidate/interview-insights/insight-id/report')
      return response({ id: 'report-id' });
    return Promise.reject(new Error(`Unhandled request: ${config.method} ${config.url}`));
  });
};
const renderPage = (entry: string = ROUTES.INTERVIEW_INSIGHTS) =>
  renderWithProviders(
    <MemoryRouter initialEntries={[entry]}>
      <InterviewInsightsPage />
    </MemoryRouter>,
  );

describe('InterviewInsightsPage', () => {
  beforeEach(() => requestMock.mockReset());

  it('renders the approved header and only safe explore-card fields', async () => {
    installHandlers();
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Interview insights' })).toBeVisible();
    expect(
      screen.getByText(
        'Learn from candidate experiences, prepare with confidence, and help future candidates.',
      ),
    ).toBeVisible();
    expect(screen.getByText('A concise safe overview of the process.')).toBeVisible();
    expect(screen.getByText('HR')).toBeVisible();
    expect(screen.getByText('Technical')).toBeVisible();
    expect(screen.getByText('React')).toBeVisible();
    expect(screen.getByText('Anonymous contributor')).toBeVisible();
    expect(document.body).not.toHaveTextContent('private@example.com');
    expect(document.body).not.toHaveTextContent('PendingReview');
  });

  it('maps every explore URL filter to the deployed API query', async () => {
    installHandlers();
    renderPage(
      `${ROUTES.INTERVIEW_INSIGHTS}?companyId=company-id&company=HARMAN&role=Engineer&roundType=Technical&difficulty=Hard&experienceLevel=Senior&outcome=Selected&interviewFormat=Video&fromMonth=4&fromYear=2026&sort=MostRounds&pageNumber=2`,
    );
    await screen.findByText('A concise safe overview of the process.');
    const call = requestMock.mock.calls.find(
      ([config]) => config.url === '/candidate/interview-insights',
    )?.[0];
    expect(call?.params).toEqual({
      companyId: 'company-id',
      difficulty: 'Hard',
      experienceLevel: 'Senior',
      fromMonth: 4,
      fromYear: 2026,
      interviewFormat: 'Video',
      outcome: 'Selected',
      pageNumber: 2,
      pageSize: 12,
      role: 'Engineer',
      roundType: 'Technical',
      sort: 'MostRounds',
    });
  });

  it('searches companies only after two characters and applies the selected company id', async () => {
    installHandlers();
    renderPage();
    const user = userEvent.setup();
    const input = screen.getByRole('combobox', { name: 'Search companies, roles, insights…' });
    await user.type(input, 'H');
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    expect(
      requestMock.mock.calls.some(
        ([config]) => config.url === '/candidate/companies/search',
      ),
    ).toBe(false);
    await user.type(input, 'A');
    expect(await screen.findByRole('option', { name: 'HARMAN' }, { timeout: 3_000 })).toBeVisible();
    await user.click(screen.getByRole('option', { name: 'HARMAN' }));
    await user.click(screen.getByRole('button', { name: 'Apply filters' }));
    await waitFor(() =>
      expect(
        requestMock.mock.calls
          .filter(([config]) => config.url === '/candidate/interview-insights')
          .at(-1)?.[0].params,
      ).toEqual(expect.objectContaining({ companyId: 'company-id' })),
    );
  });

  it('opens the accessible mobile-friendly more filters dialog with canonical values', async () => {
    installHandlers();
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'More filters' }));
    const dialog = screen.getByRole('dialog', { name: 'More filters' });
    expect(within(dialog).getByRole('combobox', { name: 'Round type' })).toBeVisible();
    await userEvent.click(within(dialog).getByRole('combobox', { name: 'Round type' }));
    expect(screen.getByRole('option', { name: 'Group discussion' })).toBeVisible();
    expect(screen.queryByRole('option', { name: /Case study/i })).not.toBeInTheDocument();
  });

  it('uses backend access flags for locked and unlocked details', async () => {
    installHandlers();
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Read insight' }));
    expect(await screen.findByText('Full insight is locked')).toBeVisible();
    expect(
      screen.getByText(
        'Add an interview schedule or apply for a role at this company to unlock detailed rounds and preparation topics.',
      ),
    ).toBeVisible();
    expect(screen.queryByText('Interview rounds')).not.toBeInTheDocument();
  });

  it('renders an unlocked round timeline and feedback only when allowed', async () => {
    installHandlers({
      detailValue: {
        ...detail,
        canGiveFeedback: true,
        canReadFull: true,
        preparationTips: 'Review React trade-offs.',
        rounds: [
          {
            candidateAdvice: 'Explain decisions.',
            durationMinutes: 45,
            id: 'round-id',
            questionsOrTopics: 'React rendering',
            roundTitle: null,
            roundType: InterviewRoundType.Technical,
            sequence: 1,
          },
        ],
      },
    });
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Read insight' }));
    expect((await screen.findAllByText('React rendering')).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Helped me' })).toBeEnabled();
  });

  it('sends canonical schedule metadata while keeping the date private to schedules', async () => {
    installHandlers();
    renderPage(
      `${ROUTES.INTERVIEW_INSIGHTS}?action=schedule&companyId=company-id&companyName=HARMAN&roleTitle=Frontend%20Engineer`,
    );
    const user = userEvent.setup();
    const dialog = screen.getByRole('dialog', { name: 'Add interview schedule' });
    expect(within(dialog).getByRole('combobox', { name: 'Company' })).toHaveValue('HARMAN');
    fireEvent.change(within(dialog).getByLabelText(/Private interview date/), {
      target: { value: '2026-08-25T11:00' },
    });
    await user.click(within(dialog).getByRole('combobox', { name: 'Interview format' }));
    await user.click(screen.getByRole('option', { name: 'Video' }));
    await user.click(within(dialog).getByRole('combobox', { name: 'Approximate time' }));
    await user.click(screen.getByRole('option', { name: 'Morning' }));
    await user.click(within(dialog).getByRole('combobox', { name: 'Preparation status' }));
    await user.click(screen.getByRole('option', { name: 'Preparing' }));
    await user.click(
      within(dialog).getByRole('checkbox', { name: 'Send me an interview reminder' }),
    );
    await user.click(within(dialog).getByRole('button', { name: 'Save schedule' }));
    await waitFor(() =>
      expect(
        requestMock.mock.calls.some(
          ([config]) => config.method === 'POST' && config.url === '/candidate/interview-schedules',
        ),
      ).toBe(true),
    );
    const sent: unknown = requestMock.mock.calls.find(
      ([config]) => config.method === 'POST' && config.url === '/candidate/interview-schedules',
    )?.[0].data;
    expect(sent).toEqual(
      expect.objectContaining({
        approximateTimeOfDay: InterviewTimeOfDay.Morning,
        companyId: company.id,
        expectedRoundTypes: [],
        interviewFormat: InterviewFormat.Video,
        preparationStatus: InterviewPreparationStatus.Preparing,
        reminderRequested: true,
        roleTitle: 'Frontend Engineer',
      }),
    );
  }, 15_000);

  it('renders contribution statuses and safe reviewer requests without private data', async () => {
    installHandlers({
      contributions: {
        badges: [],
        candidatesHelped: 7,
        contributionScore: 18,
        insightsPublished: 1,
        needsChanges: 1,
        pendingReview: 1,
        items: [
          {
            companyName: 'HARMAN',
            contributionPoints: 4,
            helpfulConfirmedCount: 2,
            id: 'mine',
            interviewMonth: 7,
            interviewYear: 2026,
            moderationStatus: InterviewInsightStatus.Rejected,
            reviewerChangeRequest: 'Please remove confidential details.',
            roleTitle: 'Engineer',
            updatedAt: '2026-08-24T00:00:00Z',
            candidateEmail: 'private@example.com',
            exactInterviewAtUtc: '2026-07-01T10:00:00Z',
          },
        ],
      },
    });
    renderPage(`${ROUTES.INTERVIEW_INSIGHTS}?view=contributions`);
    expect((await screen.findAllByText('Needs changes')).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Reviewer request: Please remove confidential details.')).toBeVisible();
    expect(document.body).not.toHaveTextContent('private@example.com');
    expect(document.body).not.toHaveTextContent('2026-07-01T10:00:00Z');
  });

  it('requires report confirmation before calling the report endpoint', async () => {
    installHandlers();
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Report' }));
    expect(requestMock.mock.calls.some(([config]) => config.url?.endsWith('/report'))).toBe(false);
    await userEvent.click(screen.getByRole('button', { name: 'Confirm report' }));
    await waitFor(() =>
      expect(
        requestMock.mock.calls.some(
          ([config]) => config.url === '/candidate/interview-insights/insight-id/report',
        ),
      ).toBe(true),
    );
  });
});
