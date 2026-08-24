import { createAppStore } from '@/store/store';
import type { AxiosRequestConfig } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { interviewInsightsApi } from './interviewInsightsApi';
import {
  InsightHelpfulness,
  InsightReportReason,
  InterviewDifficulty,
  InterviewFormat,
  InterviewInsightSort,
  InterviewMatch,
  InterviewOutcome,
  InterviewPreparationStatus,
  InterviewRoundType,
  InterviewTimeOfDay,
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
          company: 'Har',
          difficulty: InterviewDifficulty.Hard,
          experienceLevel: 'Senior',
          fromMonth: 4,
          fromYear: 2026,
          interviewFormat: InterviewFormat.Video,
          outcome: InterviewOutcome.Selected,
          pageNumber: 1,
          pageSize: 20,
          role: 'Engineer',
          roundType: InterviewRoundType.Technical,
          sort: InterviewInsightSort.Newest,
        }),
      )
      .unwrap();

    expect(requestMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: 'GET',
        params: {
          companyId: 'company-id',
          company: 'Har',
          difficulty: 'Hard',
          experienceLevel: 'Senior',
          fromMonth: 4,
          fromYear: 2026,
          interviewFormat: 'Video',
          outcome: 'Selected',
          pageNumber: 1,
          pageSize: 20,
          role: 'Engineer',
          roundType: 'Technical',
          sort: 'Newest',
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
      interviewFormat: InterviewFormat.Video,
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
      approximateTimeOfDay: InterviewTimeOfDay.Morning,
      companyId: 'company-id',
      expectedRoundTypes: [InterviewRoundType.HR, InterviewRoundType.Technical],
      interviewAtUtc: '2026-08-25T05:30:00.000Z',
      interviewFormat: InterviewFormat.Video,
      jobId: 'job-id',
      preparationStatus: InterviewPreparationStatus.Preparing,
      reminderRequested: true,
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

  it('uses the deployed company autocomplete endpoint and request parameters', async () => {
    const store = createAppStore();
    respond([{ companyName: 'HARMAN', id: 'company-id' }]);
    await store
      .dispatch(
        interviewInsightsApi.endpoints.getInterviewInsightCompanies.initiate({ query: 'HA' }),
      )
      .unwrap();
    expect(requestMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: 'GET',
        params: { limit: 10, query: 'HA' },
        url: '/candidate/companies/search',
      }),
    );

    respond({ companyName: 'New Company', id: 'new-company-id' });
    await store
      .dispatch(
        interviewInsightsApi.endpoints.createCandidateCompany.initiate({
          companyName: 'New Company',
        }),
      )
      .unwrap();
    expect(requestMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: { companyName: 'New Company' },
        method: 'POST',
        url: '/candidate/companies',
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
