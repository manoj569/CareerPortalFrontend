import { createAppStore } from '@/store/store';
import type { AxiosRequestConfig } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { interviewInsightsApi } from './interviewInsightsApi';
import {
  InsightHelpfulness,
  InsightReportReason,
  InterviewDifficulty,
  InterviewMatch,
  InterviewRoundType,
} from '../types/interviewInsightModels';

const requestMock = vi.hoisted(() =>
  vi.fn<(config: AxiosRequestConfig) => Promise<{ data: { data: unknown } }>>(),
);
vi.mock('@/api/apiClient', () => ({ apiClient: { request: requestMock } }));

const respond = (data: unknown) => requestMock.mockResolvedValueOnce({ data: { data } });

describe('interviewInsightsApi', () => {
  afterEach(() => vi.clearAllMocks());

  it('uses the relative search and detail URLs with the supported query contract', async () => {
    const store = createAppStore();
    respond({ items: [], pageNumber: 1, pageSize: 20, totalCount: 0, totalPages: 0 });
    await store
      .dispatch(
        interviewInsightsApi.endpoints.getInterviewInsights.initiate({
          companyId: 'company-id',
          pageNumber: 1,
          pageSize: 20,
          role: 'Engineer',
          sort: 'newest',
        }),
      )
      .unwrap();

    expect(requestMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: 'GET',
        params: {
          companyId: 'company-id',
          pageNumber: 1,
          pageSize: 20,
          role: 'Engineer',
          sort: 'newest',
        },
        url: '/candidate/interview-insights',
      }),
    );

    respond({ id: 'insight-id' });
    await store
      .dispatch(interviewInsightsApi.endpoints.getInterviewInsight.initiate('insight-id'))
      .unwrap();
    expect(requestMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ method: 'GET', url: '/candidate/interview-insights/insight-id' }),
    );
  });

  it('sends the exact insight and schedule request bodies', async () => {
    const store = createAppStore();
    const insightBody = {
      companyId: 'company-id',
      contentGuidelinesAccepted: true,
      experienceLevel: null,
      interviewDateMonth: '2026-08-01',
      isAnonymous: true,
      jobId: null,
      outcome: null,
      overallDifficulty: InterviewDifficulty.Moderate,
      preparationTips: 'Prepare examples.',
      processSummary: 'Two structured rounds.',
      roleTitle: 'Engineer',
      rounds: [
        {
          candidateAdvice: null,
          durationMinutes: 45,
          questionsOrTopics: 'React rendering',
          roundTitle: null,
          roundType: InterviewRoundType.Technical,
        },
      ],
    };
    respond({ id: 'insight-id' });
    await store
      .dispatch(interviewInsightsApi.endpoints.createInterviewInsight.initiate(insightBody))
      .unwrap();
    expect(requestMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: insightBody,
        method: 'POST',
        url: '/candidate/interview-insights',
      }),
    );

    const scheduleBody = {
      companyId: 'company-id',
      interviewAtUtc: '2026-08-25T05:30:00.000Z',
      jobId: 'job-id',
      roleTitle: 'Engineer',
    };
    respond({ id: 'schedule-id' });
    await store
      .dispatch(interviewInsightsApi.endpoints.createInterviewSchedule.initiate(scheduleBody))
      .unwrap();
    expect(requestMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: scheduleBody,
        method: 'POST',
        url: '/candidate/interview-schedules',
      }),
    );
  });

  it('sends feedback and report only to their deployed endpoints', async () => {
    const store = createAppStore();
    const feedback = {
      candidateInterviewScheduleId: 'schedule-id',
      feedback: null,
      helpfulness: InsightHelpfulness.Helped,
      interviewMatch: InterviewMatch.Matched,
    };
    respond({ helpfulConfirmedCount: 4 });
    await store
      .dispatch(
        interviewInsightsApi.endpoints.addInsightFeedback.initiate({
          data: feedback,
          id: 'insight-id',
        }),
      )
      .unwrap();
    expect(requestMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: feedback,
        method: 'POST',
        url: '/candidate/interview-insights/insight-id/feedback',
      }),
    );

    const report = { details: 'Contains private data', reason: InsightReportReason.PersonalData };
    respond({ id: 'report-id' });
    await store
      .dispatch(
        interviewInsightsApi.endpoints.reportInterviewInsight.initiate({
          data: report,
          id: 'insight-id',
        }),
      )
      .unwrap();
    expect(requestMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: report,
        method: 'POST',
        url: '/candidate/interview-insights/insight-id/report',
      }),
    );
  });

  it('uses the deployed schedules, contributions, and company-summary URLs', async () => {
    const store = createAppStore();
    respond([]);
    await store.dispatch(interviewInsightsApi.endpoints.getInterviewSchedules.initiate()).unwrap();
    expect(requestMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ url: '/candidate/interview-schedules' }),
    );
    respond({ badges: [], candidatesHelped: 0, contributionScore: 0, insightsPublished: 0 });
    await store
      .dispatch(interviewInsightsApi.endpoints.getMyInterviewContributions.initiate())
      .unwrap();
    expect(requestMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ url: '/candidate/interview-insights/my-contributions' }),
    );
    respond({ companyId: 'company-id' });
    await store
      .dispatch(
        interviewInsightsApi.endpoints.getCompanyInterviewInsightSummary.initiate('company-id'),
      )
      .unwrap();
    expect(requestMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ url: '/candidate/interview-insights/company/company-id/summary' }),
    );
  });
});
