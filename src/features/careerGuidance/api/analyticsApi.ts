import { careerGuidanceApi, unwrap, CG, ADMIN_CG } from './careerGuidanceApi';
import type { CareerAnalyticsQuery, CareerGuidanceAdminAnalytics, CareerGuidanceCandidateSummary, CareerGuidanceConsultantAnalytics } from '../types';

const api = careerGuidanceApi.injectEndpoints({ endpoints: (builder) => ({
  getCareerCandidateSummary: builder.query<CareerGuidanceCandidateSummary, void>({
    query: () => ({ url: `${CG}/me/summary` }),
    transformResponse: unwrap<CareerGuidanceCandidateSummary>,
    providesTags: ['Career'],
  }),
  getCareerConsultantAnalytics: builder.query<CareerGuidanceConsultantAnalytics, CareerAnalyticsQuery>({
    query: (arg) => ({ url: `${CG}/me/analytics`, params: arg }),
    transformResponse: unwrap<CareerGuidanceConsultantAnalytics>,
    providesTags: ['Career'],
  }),
  getCareerAdminAnalytics: builder.query<CareerGuidanceAdminAnalytics, CareerAnalyticsQuery>({
    query: (arg) => ({ url: `${ADMIN_CG}/analytics/overview`, params: arg }),
    transformResponse: unwrap<CareerGuidanceAdminAnalytics>,
    providesTags: ['Career'],
  }),
}) });
export const { useGetCareerCandidateSummaryQuery, useLazyGetCareerCandidateSummaryQuery, useGetCareerConsultantAnalyticsQuery, useLazyGetCareerConsultantAnalyticsQuery, useGetCareerAdminAnalyticsQuery, useLazyGetCareerAdminAnalyticsQuery } = api;
export { api as analyticsApi };
