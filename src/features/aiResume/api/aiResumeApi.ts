import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/api/axiosBaseQuery';
import { apiClient } from '@/api/apiClient';
import type { ApiResponse } from '@/types';
import type {
  CreateResumeSession,
  DownloadFormat,
  ResumeContent,
  ResumeCredits,
  ResumePackage,
  ResumePurchase,
  ResumeSession,
  TailoredResume,
  ReplacementReviewRequest,
} from '../types/aiResumeModels';
const root = '/ai-resume';
// Covers the backend's maximum 120-second Claude deadline plus lease/DB cleanup.
const providerOperationTimeoutMs = 180_000;
export const aiResumeApi = createApi({
  reducerPath: 'aiResumeApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Credits', 'Session', 'Resume'],
  endpoints: (b) => ({
    getResumePackages: b.query<ResumePackage[], void>({
      query: () => ({ url: `${root}/packages` }),
      transformResponse: (r: ApiResponse<ResumePackage[]>) => r.data,
    }),
    getResumeCredits: b.query<ResumeCredits, void>({
      query: () => ({ url: `${root}/credits` }),
      transformResponse: (r: ApiResponse<ResumeCredits>) => r.data,
      providesTags: ['Credits'],
    }),
    createResumeSession: b.mutation<ResumeSession, CreateResumeSession>({
      query: (data) => ({ url: `${root}/sessions`, method: 'POST', data }),
      transformResponse: (r: ApiResponse<ResumeSession>) => r.data,
    }),
    getResumeSession: b.query<ResumeSession, string>({
      query: (id) => ({ url: `${root}/sessions/${encodeURIComponent(id)}` }),
      transformResponse: (r: ApiResponse<ResumeSession>) => r.data,
      providesTags: ['Session'],
    }),
    analyzeResume: b.mutation<ResumeSession, string>({
      query: (id) => ({
        url: `${root}/sessions/${encodeURIComponent(id)}/analyze`,
        timeout: providerOperationTimeoutMs,
        method: 'POST',
      }),
      transformResponse: (r: ApiResponse<ResumeSession>) => r.data,
      invalidatesTags: ['Session'],
    }),
    checkoutResume: b.mutation<
      ResumePurchase,
      { packageCode: string; idempotencyKey: string; sessionId?: string }
    >({
      query: (data) => ({ url: `${root}/checkout`, method: 'POST', data }),
      transformResponse: (r: ApiResponse<ResumePurchase>) => r.data,
    }),
    getResumePurchase: b.query<ResumePurchase, string>({
      query: (id) => ({ url: `${root}/purchases/${encodeURIComponent(id)}` }),
      transformResponse: (r: ApiResponse<ResumePurchase>) => r.data,
    }),
    generateResume: b.mutation<TailoredResume, { sessionId: string; idempotencyKey: string }>({
      query: ({ sessionId, idempotencyKey }) => ({
        url: `${root}/sessions/${encodeURIComponent(sessionId)}/generate`,
        timeout: providerOperationTimeoutMs,
        method: 'POST',
        data: { idempotencyKey },
      }),
      transformResponse: (r: ApiResponse<TailoredResume>) => r.data,
      invalidatesTags: ['Credits', 'Session', 'Resume'],
    }),
    regenerateResume: b.mutation<TailoredResume, { resumeId: string; idempotencyKey: string }>({
      query: ({ resumeId, idempotencyKey }) => ({
        url: `${root}/resumes/${encodeURIComponent(resumeId)}/regenerate`,
        timeout: providerOperationTimeoutMs,
        method: 'POST',
        data: { idempotencyKey },
      }),
      transformResponse: (r: ApiResponse<TailoredResume>) => r.data,
      invalidatesTags: ['Credits', 'Session', 'Resume'],
    }),
    getTailoredResume: b.query<TailoredResume, string>({
      query: (id) => ({ url: `${root}/resumes/${encodeURIComponent(id)}` }),
      transformResponse: (r: ApiResponse<TailoredResume>) => r.data,
      providesTags: ['Resume'],
    }),
    editResume: b.mutation<
      TailoredResume,
      { resumeId: string; expectedRevision: number; content: ResumeContent }
    >({
      query: ({ resumeId, ...data }) => ({
        url: `${root}/resumes/${encodeURIComponent(resumeId)}`,
        method: 'PATCH',
        data,
      }),
      transformResponse: (r: ApiResponse<TailoredResume>) => r.data,
      invalidatesTags: ['Resume'],
    }),
    reviewResumeReplacement: b.mutation<
      TailoredResume,
      { resumeId: string; targetId: string } & ReplacementReviewRequest
    >({
      query: ({ resumeId, targetId, ...data }) => ({
        url: `${root}/resumes/${encodeURIComponent(resumeId)}/replacements/${encodeURIComponent(targetId)}`,
        method: 'PATCH',
        data,
      }),
      transformResponse: (r: ApiResponse<TailoredResume>) => r.data,
      invalidatesTags: ['Resume'],
    }),
  }),
});
export const {
  useGetResumePackagesQuery,
  useGetResumeCreditsQuery,
  useCreateResumeSessionMutation,
  useGetResumeSessionQuery,
  useAnalyzeResumeMutation,
  useCheckoutResumeMutation,
  useGetResumePurchaseQuery,
  useGenerateResumeMutation,
  useRegenerateResumeMutation,
  useGetTailoredResumeQuery,
  useEditResumeMutation,
  useReviewResumeReplacementMutation,
} = aiResumeApi;
export async function downloadTailoredResume(id: string, format: DownloadFormat): Promise<Blob> {
  const response = await apiClient.get<Blob>(`${root}/resumes/${encodeURIComponent(id)}/download`, {
    params: { format },
    responseType: 'blob',
  });
  return response.data;
}
