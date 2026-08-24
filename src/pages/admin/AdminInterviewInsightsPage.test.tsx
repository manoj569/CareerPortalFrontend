import { renderWithProviders } from '@/test/renderWithProviders';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AxiosRequestConfig } from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  InsightReportStatus,
  InterviewDifficulty,
  InterviewFormat,
  InterviewInsightStatus,
  InterviewRoundType,
  type InterviewInsightResponse,
} from '@/features/interviewInsights/types/interviewInsightModels';
import { AdminInterviewInsightsPage } from './AdminInterviewInsightsPage';

const requestMock = vi.hoisted(() => vi.fn<(config: AxiosRequestConfig) => Promise<{ data: { data: unknown } }>>());
vi.mock('@/api/apiClient', () => ({ apiClient: { request: requestMock } }));
const response = (data: unknown) => Promise.resolve({ data: { data } });
const insight: InterviewInsightResponse = {
  authorDisplayName: null,
  canGiveFeedback: false,
  canReadFull: true,
  companyId: 'company-id',
  companyLogoUrl: null,
  companyName: 'Northstar Labs',
  experienceLevel: 'Senior',
  helpfulConfirmedCount: 2,
  id: 'insight-id',
  interviewFormat: InterviewFormat.Video,
  interviewMonth: 7,
  interviewYear: 2026,
  isAnonymous: true,
  jobId: null,
  outcome: null,
  overallDifficulty: InterviewDifficulty.Hard,
  preparationTips: 'Review system design trade-offs.',
  processSummary: 'A structured two-stage process.',
  publishedAtUtc: null,
  qualityScore: 0,
  roleTitle: 'Platform Engineer',
  roundCount: 1,
  rounds: [{ candidateAdvice: 'Explain decisions.', durationMinutes: 45, id: 'round-id', questionsOrTopics: 'Distributed systems', roundTitle: null, roundType: InterviewRoundType.Technical, sequence: 1 }],
  status: InterviewInsightStatus.PendingReview,
};
const page = (items: unknown[]) => ({ items, pageNumber: 1, pageSize: 20, totalCount: items.length, totalPages: items.length ? 1 : 0 });
const renderPage = () => renderWithProviders(<MemoryRouter><AdminInterviewInsightsPage /></MemoryRouter>);

describe('AdminInterviewInsightsPage', () => {
  beforeEach(() => requestMock.mockReset());

  it('loads the pending queue by default and never renders candidate private data', async () => {
    requestMock.mockResolvedValue({ data: { data: page([{ ...insight, candidateEmail: 'private@example.com', phone: '+919999999999', resumeUrl: 'secret-resume.pdf', exactInterviewAtUtc: '2026-07-10T10:00:00Z' }]) } });
    renderPage();
    expect((await screen.findAllByText('Northstar Labs')).length).toBeGreaterThan(0);
    expect(requestMock).toHaveBeenCalledWith(expect.objectContaining({ params: { pageNumber: 1, pageSize: 20, status: 'PendingReview' }, url: '/admin/interview-insights' }));
    expect(document.body).not.toHaveTextContent('private@example.com');
    expect(document.body).not.toHaveTextContent('+919999999999');
    expect(document.body).not.toHaveTextContent('secret-resume.pdf');
    expect(document.body).not.toHaveTextContent('2026-07-10T10:00:00Z');
  });

  it('publishes a pending insight with the exact moderation payload', async () => {
    requestMock.mockImplementation((config) => config?.method === 'PATCH' ? response({ ...insight, status: InterviewInsightStatus.Published }) : response(page([insight])));
    renderPage();
    const user = userEvent.setup();
    await user.click((await screen.findAllByRole('button', { name: 'Review' }))[0]!);
    await user.click(screen.getByRole('button', { name: 'Publish' }));
    await user.click(within(screen.getByRole('dialog', { name: 'Confirm moderation action' })).getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(requestMock).toHaveBeenCalledWith(expect.objectContaining({ data: { reason: null, status: 'Published' }, method: 'PATCH', url: '/admin/interview-insights/insight-id/moderation' })));
  });

  it('requires and submits a reviewer reason for rejection', async () => {
    requestMock.mockImplementation((config) => config?.method === 'PATCH' ? response({ ...insight, status: InterviewInsightStatus.Rejected }) : response(page([insight])));
    renderPage();
    const user = userEvent.setup();
    await user.click((await screen.findAllByRole('button', { name: 'Review' }))[0]!);
    await user.click(screen.getByRole('button', { name: 'Reject / request changes' }));
    const dialog = screen.getByRole('dialog', { name: 'Confirm moderation action' });
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    expect(await within(dialog).findByText('A reviewer reason is required.')).toBeVisible();
    await user.type(within(dialog).getByRole('textbox', { name: 'Reviewer reason' }), 'Remove confidential assessment details.');
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(requestMock).toHaveBeenCalledWith(expect.objectContaining({ data: { reason: 'Remove confidential assessment details.', status: 'Rejected' } })));
  });

  it('actions an open report using only its supported status payload', async () => {
    requestMock.mockImplementation((config) => {
      if (config?.url === '/admin/interview-insight-reports' && config.method === 'GET') return response(page([{ createdAtUtc: '2026-08-24T00:00:00Z', details: 'Contains private data', id: 'report-id', insightId: 'insight-id', reason: 'PersonalData', status: InsightReportStatus.Open }]));
      if (config?.url === '/admin/interview-insight-reports/report-id') return response({ id: 'report-id', insightId: 'insight-id', reason: 'PersonalData', status: InsightReportStatus.Actioned });
      return response(page([]));
    });
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('tab', { name: 'Reported' }));
    await user.click(await screen.findByRole('button', { name: 'Actioned' }));
    await user.click(within(screen.getByRole('dialog', { name: 'Confirm report action' })).getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(requestMock).toHaveBeenCalledWith(expect.objectContaining({ data: { status: 'Actioned' }, method: 'PATCH', url: '/admin/interview-insight-reports/report-id' })));
  });

  it('shows loading and retryable error states', async () => {
    let reject!: (reason: Error) => void;
    requestMock.mockImplementation((config) => !config ? response([]) : new Promise((_, rejectRequest) => { reject = rejectRequest; }));
    renderPage();
    expect(screen.getByRole('status', { name: 'Loading interview insight moderation queue' })).toBeVisible();
    reject(new Error('Moderation service unavailable.'));
    expect(await screen.findByText('Moderation queue unavailable')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeEnabled();
  });
});
