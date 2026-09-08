import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/api/axiosBaseQuery';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import type { ApiResponse } from '@/types';
import type {
  AIApplyAccess,
  AIApplyAnalytics,
  AIApplyApplication,
  AIApplyApplicationsQuery,
  AIApplyCheckoutOrder,
  AIApplyPreferences,
  AIApplyProfile,
  AIApplyQuestion,
  AIApplyQuestionStatus,
  AIApplyRule,
  AIApplySavedAnswer,
  AIApplySettings,
  AnswerAIApplyQuestionRequest,
  CompleteExternalSessionCaptureResponse,
  ExternalSessionCapture,
  ExternalSessionMetadata,
  ExternalSessionSite,
  MembershipPlan,
  UpdateAIApplyAnswerRequest,
  UpdateAIApplyPreferencesRequest,
  UpdateAIApplyProfileRequest,
  UpdateAIApplySettingsRequest,
  UpsertAIApplyRuleRequest,
} from '../types/aiApplyModels';

export const aiApplyApi = createApi({
  reducerPath: 'aiApplyApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    'Access',
    'Profile',
    'Preferences',
    'Rules',
    'Settings',
    'Applications',
    'Analytics',
    'Questions',
    'Answers',
    'ExternalSessions',
  ],
  endpoints: (builder) => ({
    getAIApplyAccess: builder.query<AIApplyAccess, void>({
      query: () => ({ url: API_ENDPOINTS.AI_APPLY.ACCESS }),
      transformResponse: (r: ApiResponse<AIApplyAccess>) => r.data,
      providesTags: ['Access'],
    }),
    getAIApplyProfile: builder.query<AIApplyProfile, void>({
      query: () => ({ url: API_ENDPOINTS.AI_APPLY.PROFILE }),
      transformResponse: (r: ApiResponse<AIApplyProfile>) => r.data,
      providesTags: ['Profile'],
    }),
    updateAIApplyProfile: builder.mutation<AIApplyProfile, UpdateAIApplyProfileRequest>({
      query: (data) => ({ url: API_ENDPOINTS.AI_APPLY.PROFILE, method: 'PUT', data }),
      transformResponse: (r: ApiResponse<AIApplyProfile>) => r.data,
      invalidatesTags: ['Profile'],
    }),
    getAIApplyPreferences: builder.query<AIApplyPreferences, void>({
      query: () => ({ url: API_ENDPOINTS.AI_APPLY.PREFERENCES }),
      transformResponse: (r: ApiResponse<AIApplyPreferences>) => r.data,
      providesTags: ['Preferences'],
    }),
    updateAIApplyPreferences: builder.mutation<AIApplyPreferences, UpdateAIApplyPreferencesRequest>(
      {
        query: (data) => ({ url: API_ENDPOINTS.AI_APPLY.PREFERENCES, method: 'PUT', data }),
        transformResponse: (r: ApiResponse<AIApplyPreferences>) => r.data,
        invalidatesTags: ['Preferences'],
      },
    ),
    getAIApplySettings: builder.query<AIApplySettings, void>({
      query: () => ({ url: API_ENDPOINTS.AI_APPLY.SETTINGS }),
      transformResponse: (r: ApiResponse<AIApplySettings>) => r.data,
      providesTags: ['Settings'],
    }),
    updateAIApplySettings: builder.mutation<AIApplySettings, UpdateAIApplySettingsRequest>({
      query: (data) => ({ url: API_ENDPOINTS.AI_APPLY.SETTINGS, method: 'PUT', data }),
      transformResponse: (r: ApiResponse<AIApplySettings>) => r.data,
      invalidatesTags: ['Settings'],
    }),
    getAIApplyRules: builder.query<AIApplyRule[], void>({
      query: () => ({ url: API_ENDPOINTS.AI_APPLY.RULES }),
      transformResponse: (r: ApiResponse<AIApplyRule[]>) => r.data,
      providesTags: ['Rules'],
    }),
    createAIApplyRule: builder.mutation<AIApplyRule, UpsertAIApplyRuleRequest>({
      query: (data) => ({ url: API_ENDPOINTS.AI_APPLY.RULES, method: 'POST', data }),
      transformResponse: (r: ApiResponse<AIApplyRule>) => r.data,
      invalidatesTags: ['Rules'],
    }),
    updateAIApplyRule: builder.mutation<
      AIApplyRule,
      { id: string; request: UpsertAIApplyRuleRequest }
    >({
      query: ({ id, request }) => ({
        url: API_ENDPOINTS.AI_APPLY.RULE(id),
        method: 'PUT',
        data: request,
      }),
      transformResponse: (r: ApiResponse<AIApplyRule>) => r.data,
      invalidatesTags: ['Rules'],
    }),
    deleteAIApplyRule: builder.mutation<void, string>({
      query: (id) => ({ url: API_ENDPOINTS.AI_APPLY.RULE(id), method: 'DELETE' }),
      invalidatesTags: ['Rules'],
    }),
    setAIApplyMode: builder.mutation<AIApplySettings, 'enable' | 'disable' | 'pause' | 'resume'>({
      query: (action) => ({
        url: API_ENDPOINTS.AI_APPLY[
          action.toUpperCase() as 'ENABLE' | 'DISABLE' | 'PAUSE' | 'RESUME'
        ],
        method: 'POST',
      }),
      transformResponse: (r: ApiResponse<AIApplySettings>) => r.data,
      invalidatesTags: ['Settings', 'Access'],
    }),
    getAIApplyPlans: builder.query<MembershipPlan[], void>({
      query: () => ({ url: API_ENDPOINTS.PAYMENTS.PLANS }),
      transformResponse: (r: ApiResponse<MembershipPlan[]>) => r.data,
    }),
    createAIApplyCheckout: builder.mutation<AIApplyCheckoutOrder, string>({
      query: (planCode) => ({
        url: API_ENDPOINTS.PAYMENTS.CHECKOUT,
        method: 'POST',
        data: { planCode },
      }),
      transformResponse: (r: ApiResponse<AIApplyCheckoutOrder>) => r.data,
    }),
    getAIApplyDashboard: builder.query<AIApplyAnalytics, void>({
      query: () => ({ url: API_ENDPOINTS.AI_APPLY.DASHBOARD }),
      transformResponse: (r: ApiResponse<AIApplyAnalytics>) => r.data,
      providesTags: ['Analytics'],
    }),
    getAIApplyApplications: builder.query<AIApplyApplication[], AIApplyApplicationsQuery>({
      query: (params) => ({ url: API_ENDPOINTS.AI_APPLY.APPLICATIONS, params }),
      transformResponse: (r: ApiResponse<AIApplyApplication[]>) => r.data,
      providesTags: ['Applications'],
    }),
    getAIApplyApplication: builder.query<AIApplyApplication, string>({
      query: (id) => ({ url: API_ENDPOINTS.AI_APPLY.APPLICATION(id) }),
      transformResponse: (r: ApiResponse<AIApplyApplication>) => r.data,
      providesTags: ['Applications'],
    }),
    cancelAIApplyApplication: builder.mutation<AIApplyApplication, string>({
      query: (id) => ({ url: API_ENDPOINTS.AI_APPLY.CANCEL_APPLICATION(id), method: 'POST' }),
      transformResponse: (r: ApiResponse<AIApplyApplication>) => r.data,
      invalidatesTags: ['Applications', 'Analytics'],
    }),
    continueAIApplyApplication: builder.mutation<AIApplyApplication, string>({
      query: (id) => ({ url: API_ENDPOINTS.AI_APPLY.CONTINUE_APPLICATION(id), method: 'POST' }),
      transformResponse: (r: ApiResponse<AIApplyApplication>) => r.data,
      invalidatesTags: ['Applications', 'Analytics', 'Questions'],
    }),
    getAIApplyAnalytics: builder.query<AIApplyAnalytics, { fromUtc: string; toUtc: string }>({
      query: (params) => ({ url: API_ENDPOINTS.AI_APPLY.ANALYTICS, params }),
      transformResponse: (r: ApiResponse<AIApplyAnalytics>) => r.data,
      providesTags: ['Analytics'],
    }),
    getAIApplyQuestions: builder.query<AIApplyQuestion[], AIApplyQuestionStatus | void>({
      query: (status) => ({
        url: API_ENDPOINTS.AI_APPLY.QUESTIONS,
        params: status ? { status } : undefined,
      }),
      transformResponse: (r: ApiResponse<AIApplyQuestion[]>) => r.data,
      providesTags: ['Questions'],
    }),
    getAIApplyQuestion: builder.query<AIApplyQuestion, string>({
      query: (id) => ({ url: API_ENDPOINTS.AI_APPLY.QUESTION(id) }),
      transformResponse: (r: ApiResponse<AIApplyQuestion>) => r.data,
      providesTags: ['Questions'],
    }),
    answerAIApplyQuestion: builder.mutation<
      AIApplyQuestion,
      { id: string; request: AnswerAIApplyQuestionRequest }
    >({
      query: ({ id, request }) => ({
        url: API_ENDPOINTS.AI_APPLY.ANSWER_QUESTION(id),
        method: 'POST',
        data: request,
      }),
      transformResponse: (r: ApiResponse<AIApplyQuestion>) => r.data,
      invalidatesTags: ['Questions', 'Answers', 'Applications', 'Analytics'],
    }),
    skipAIApplyQuestion: builder.mutation<AIApplyQuestion, string>({
      query: (id) => ({ url: API_ENDPOINTS.AI_APPLY.SKIP_QUESTION(id), method: 'POST' }),
      transformResponse: (r: ApiResponse<AIApplyQuestion>) => r.data,
      invalidatesTags: ['Questions', 'Applications', 'Analytics'],
    }),
    getAIApplyAnswers: builder.query<AIApplySavedAnswer[], void>({
      query: () => ({ url: API_ENDPOINTS.AI_APPLY.ANSWERS }),
      transformResponse: (r: ApiResponse<AIApplySavedAnswer[]>) => r.data,
      providesTags: ['Answers'],
    }),
    updateAIApplyAnswer: builder.mutation<
      AIApplySavedAnswer,
      { id: string; request: UpdateAIApplyAnswerRequest }
    >({
      query: ({ id, request }) => ({
        url: API_ENDPOINTS.AI_APPLY.ANSWER(id),
        method: 'PUT',
        data: request,
      }),
      transformResponse: (r: ApiResponse<AIApplySavedAnswer>) => r.data,
      invalidatesTags: ['Answers'],
    }),
    deleteAIApplyAnswer: builder.mutation<void, string>({
      query: (id) => ({ url: API_ENDPOINTS.AI_APPLY.ANSWER(id), method: 'DELETE' }),
      invalidatesTags: ['Answers'],
    }),
    getExternalSession: builder.query<ExternalSessionMetadata, ExternalSessionSite>({
      query: (site) => ({ url: API_ENDPOINTS.AI_APPLY.EXTERNAL_SESSION(site) }),
      transformResponse: (r: ApiResponse<ExternalSessionMetadata>) => r.data,
      providesTags: (_result, _error, site) => [{ type: 'ExternalSessions', id: site }],
    }),
    startExternalSessionCapture: builder.mutation<
      ExternalSessionCapture,
      { site: ExternalSessionSite; reconnect: boolean }
    >({
      query: ({ site, reconnect }) => ({
        url: API_ENDPOINTS.AI_APPLY.START_EXTERNAL_SESSION_CAPTURE(site),
        method: 'POST',
        data: { reconnect },
      }),
      transformResponse: (r: ApiResponse<ExternalSessionCapture>) => r.data,
      invalidatesTags: (_result, _error, { site }) => [{ type: 'ExternalSessions', id: site }],
    }),
    getExternalSessionCapture: builder.query<ExternalSessionCapture, string>({
      query: (captureId) => ({
        url: API_ENDPOINTS.AI_APPLY.EXTERNAL_SESSION_CAPTURE(captureId),
      }),
      transformResponse: (r: ApiResponse<ExternalSessionCapture>) => r.data,
    }),
    completeExternalSessionCapture: builder.mutation<
      CompleteExternalSessionCaptureResponse,
      { captureId: string; site: ExternalSessionSite }
    >({
      query: ({ captureId }) => ({
        url: API_ENDPOINTS.AI_APPLY.COMPLETE_EXTERNAL_SESSION_CAPTURE(captureId),
        method: 'POST',
      }),
      transformResponse: (r: ApiResponse<CompleteExternalSessionCaptureResponse>) => r.data,
      invalidatesTags: (_result, _error, { site }) => [{ type: 'ExternalSessions', id: site }],
    }),
    cancelExternalSessionCapture: builder.mutation<
      void,
      { captureId: string; site: ExternalSessionSite }
    >({
      query: ({ captureId }) => ({
        url: API_ENDPOINTS.AI_APPLY.EXTERNAL_SESSION_CAPTURE(captureId),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { site }) => [{ type: 'ExternalSessions', id: site }],
    }),
    revokeExternalSession: builder.mutation<void, { sessionId: string; site: ExternalSessionSite }>(
      {
        query: ({ sessionId }) => ({
          url: API_ENDPOINTS.AI_APPLY.REVOKE_EXTERNAL_SESSION(sessionId),
          method: 'DELETE',
        }),
        invalidatesTags: (_result, _error, { site }) => [{ type: 'ExternalSessions', id: site }],
      },
    ),
  }),
});
export const {
  useGetAIApplyAccessQuery,
  useGetAIApplyProfileQuery,
  useUpdateAIApplyProfileMutation,
  useGetAIApplyPreferencesQuery,
  useUpdateAIApplyPreferencesMutation,
  useGetAIApplySettingsQuery,
  useUpdateAIApplySettingsMutation,
  useGetAIApplyRulesQuery,
  useCreateAIApplyRuleMutation,
  useUpdateAIApplyRuleMutation,
  useDeleteAIApplyRuleMutation,
  useSetAIApplyModeMutation,
  useGetAIApplyPlansQuery,
  useCreateAIApplyCheckoutMutation,
  useGetAIApplyDashboardQuery,
  useGetAIApplyApplicationsQuery,
  useGetAIApplyApplicationQuery,
  useCancelAIApplyApplicationMutation,
  useContinueAIApplyApplicationMutation,
  useGetAIApplyAnalyticsQuery,
  useGetAIApplyQuestionsQuery,
  useGetAIApplyQuestionQuery,
  useAnswerAIApplyQuestionMutation,
  useSkipAIApplyQuestionMutation,
  useGetAIApplyAnswersQuery,
  useUpdateAIApplyAnswerMutation,
  useDeleteAIApplyAnswerMutation,
  useGetExternalSessionQuery,
  useStartExternalSessionCaptureMutation,
  useGetExternalSessionCaptureQuery,
  useCompleteExternalSessionCaptureMutation,
  useCancelExternalSessionCaptureMutation,
  useRevokeExternalSessionMutation,
} = aiApplyApi;
