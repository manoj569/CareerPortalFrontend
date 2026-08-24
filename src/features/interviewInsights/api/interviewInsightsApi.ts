import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery, type AxiosBaseQueryError } from '@/api/axiosBaseQuery';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import type { ApiResponse } from '@/types';
import type {
  CompanyInterviewInsightSummaryResponse,
  CreateInsightFeedbackRequest,
  CreateInsightReportRequest,
  CreateInterviewInsightRequest,
  CreateInterviewScheduleRequest,
  InsightFeedbackResponse,
  InsightReportResponse,
  InterviewInsightQuery,
  InterviewInsightCompanyResponse,
  InterviewInsightResponse,
  InterviewInsightsPage,
  InterviewScheduleResponse,
  MyInterviewContributionsResponse,
  UpdateInterviewInsightRequest,
  UpdateInterviewScheduleRequest,
} from '../types/interviewInsightModels';

export const interviewInsightsApi = createApi({
  reducerPath: 'interviewInsightsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Insights', 'Schedules', 'Contributions', 'CompanySummary'],
  endpoints: (builder) => ({
    getInterviewInsights: builder.query<InterviewInsightsPage, InterviewInsightQuery>({
      query: (params) => ({ params, url: API_ENDPOINTS.CANDIDATE.INTERVIEW_INSIGHTS }),
      transformResponse: (response: ApiResponse<InterviewInsightsPage>) => response.data,
      providesTags: ['Insights'],
    }),
    getInterviewInsight: builder.query<InterviewInsightResponse, string>({
      query: (id) => ({ url: API_ENDPOINTS.CANDIDATE.INTERVIEW_INSIGHT(id) }),
      transformResponse: (response: ApiResponse<InterviewInsightResponse>) => response.data,
      providesTags: (_, __, id) => [{ id, type: 'Insights' }],
    }),
    getInterviewInsightCompanies: builder.query<
      InterviewInsightCompanyResponse[],
      { query: string; limit?: number }
    >({
      query: ({ query, limit = 10 }) => ({
        params: { limit, query },
        url: API_ENDPOINTS.CANDIDATE.INTERVIEW_INSIGHT_COMPANIES,
      }),
      transformResponse: (response: ApiResponse<InterviewInsightCompanyResponse[]>) =>
        response.data,
    }),
    createInterviewInsight: builder.mutation<
      InterviewInsightResponse,
      CreateInterviewInsightRequest
    >({
      query: (data) => ({ data, method: 'POST', url: API_ENDPOINTS.CANDIDATE.INTERVIEW_INSIGHTS }),
      transformResponse: (response: ApiResponse<InterviewInsightResponse>) => response.data,
      invalidatesTags: ['Insights', 'Contributions'],
    }),
    updateInterviewInsight: builder.mutation<
      InterviewInsightResponse,
      { id: string; data: UpdateInterviewInsightRequest }
    >({
      query: ({ data, id }) => ({
        data,
        method: 'PATCH',
        url: API_ENDPOINTS.CANDIDATE.INTERVIEW_INSIGHT(id),
      }),
      transformResponse: (response: ApiResponse<InterviewInsightResponse>) => response.data,
      invalidatesTags: (_, __, { id }) => ['Insights', 'Contributions', { id, type: 'Insights' }],
    }),
    deleteInterviewInsight: builder.mutation<void, string>({
      query: (id) => ({ method: 'DELETE', url: API_ENDPOINTS.CANDIDATE.INTERVIEW_INSIGHT(id) }),
      invalidatesTags: ['Insights', 'Contributions'],
    }),
    getInterviewSchedules: builder.query<InterviewScheduleResponse[], void>({
      query: () => ({ url: API_ENDPOINTS.CANDIDATE.INTERVIEW_SCHEDULES }),
      transformResponse: (response: ApiResponse<InterviewScheduleResponse[]>) => response.data,
      providesTags: ['Schedules'],
    }),
    createInterviewSchedule: builder.mutation<
      InterviewScheduleResponse,
      CreateInterviewScheduleRequest
    >({
      query: (data) => ({ data, method: 'POST', url: API_ENDPOINTS.CANDIDATE.INTERVIEW_SCHEDULES }),
      transformResponse: (response: ApiResponse<InterviewScheduleResponse>) => response.data,
      invalidatesTags: ['Schedules', 'Insights', 'CompanySummary'],
    }),
    updateInterviewSchedule: builder.mutation<
      InterviewScheduleResponse,
      { id: string; data: UpdateInterviewScheduleRequest }
    >({
      query: ({ data, id }) => ({
        data,
        method: 'PATCH',
        url: API_ENDPOINTS.CANDIDATE.INTERVIEW_SCHEDULE(id),
      }),
      transformResponse: (response: ApiResponse<InterviewScheduleResponse>) => response.data,
      invalidatesTags: ['Schedules', 'Insights', 'CompanySummary'],
    }),
    addInsightFeedback: builder.mutation<
      InsightFeedbackResponse,
      { id: string; data: CreateInsightFeedbackRequest }
    >({
      query: ({ data, id }) => ({
        data,
        method: 'POST',
        url: API_ENDPOINTS.CANDIDATE.INTERVIEW_INSIGHT_FEEDBACK(id),
      }),
      transformResponse: (response: ApiResponse<InsightFeedbackResponse>) => response.data,
      invalidatesTags: ['Insights', 'Contributions', 'CompanySummary'],
    }),
    reportInterviewInsight: builder.mutation<
      InsightReportResponse,
      { id: string; data: CreateInsightReportRequest }
    >({
      query: ({ data, id }) => ({
        data,
        method: 'POST',
        url: API_ENDPOINTS.CANDIDATE.INTERVIEW_INSIGHT_REPORT(id),
      }),
      transformResponse: (response: ApiResponse<InsightReportResponse>) => response.data,
    }),
    getMyInterviewContributions: builder.query<MyInterviewContributionsResponse, void>({
      query: () => ({ url: API_ENDPOINTS.CANDIDATE.INTERVIEW_INSIGHT_CONTRIBUTIONS }),
      transformResponse: (response: ApiResponse<MyInterviewContributionsResponse>) => response.data,
      providesTags: ['Contributions'],
    }),
    getCompanyInterviewInsightSummary: builder.query<
      CompanyInterviewInsightSummaryResponse,
      string
    >({
      query: (companyId) => ({
        url: API_ENDPOINTS.CANDIDATE.COMPANY_INTERVIEW_INSIGHT_SUMMARY(companyId),
      }),
      transformResponse: (response: ApiResponse<CompanyInterviewInsightSummaryResponse>) =>
        response.data,
      providesTags: (_, __, companyId) => [{ id: companyId, type: 'CompanySummary' }],
    }),
  }),
});

export const {
  useAddInsightFeedbackMutation,
  useCreateInterviewInsightMutation,
  useCreateInterviewScheduleMutation,
  useDeleteInterviewInsightMutation,
  useGetCompanyInterviewInsightSummaryQuery,
  useGetInterviewInsightCompaniesQuery,
  useGetInterviewInsightQuery,
  useGetInterviewInsightsQuery,
  useGetInterviewSchedulesQuery,
  useGetMyInterviewContributionsQuery,
  useReportInterviewInsightMutation,
  useUpdateInterviewInsightMutation,
  useUpdateInterviewScheduleMutation,
} = interviewInsightsApi;

export const isInterviewInsightsApiError = (error: unknown): error is AxiosBaseQueryError =>
  Boolean(error && typeof error === 'object' && 'message' in error);
