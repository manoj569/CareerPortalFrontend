import { careerGuidanceApi, unwrap, CG, ADMIN_CG, segment, disputePath } from './careerGuidanceApi';
import type { Audience } from './careerGuidanceApi';
import type { PaginatedResponse } from '@/types';
import type { CareerDisputeRequest, CareerDisputeResolveRequest, CareerDisputeResponse, CareerDisputeStatusRequest, CareerEvidenceRequest, CareerPublicReview, CareerReviewModerationRequest, CareerReviewRequest, CareerReviewResponse, CareerTrustQuery } from '../types';

const api = careerGuidanceApi.injectEndpoints({ endpoints: (builder) => ({
  getPublicCareerReviews: builder.query<PaginatedResponse<CareerPublicReview>, { consultantId: string; pageNumber: number; pageSize: number }>({
    query: (arg) => ({ url: `${CG}/consultants/${segment(arg.consultantId)}/reviews`, params: { pageNumber: arg.pageNumber, pageSize: arg.pageSize } }),
    transformResponse: unwrap<PaginatedResponse<CareerPublicReview>>,
    providesTags: ['Career'],
  }),
  getBookingReview: builder.query<CareerReviewResponse, string>({
    query: (arg) => ({ url: `${CG}/bookings/${segment(arg)}/review` }),
    transformResponse: unwrap<CareerReviewResponse>,
    providesTags: ['Career'],
  }),
  saveBookingReview: builder.mutation<CareerReviewResponse, { bookingId: string; edit: boolean; request: CareerReviewRequest }>({
    query: (arg) => ({ url: `${CG}/bookings/${segment(arg.bookingId)}/review`, method: arg.edit ? 'PUT' : 'POST', data: arg.request }),
    transformResponse: unwrap<CareerReviewResponse>,
    invalidatesTags: ['Career'],
  }),
  withdrawBookingReview: builder.mutation<CareerReviewResponse, { bookingId: string; revision: string }>({
    query: (arg) => ({ url: `${CG}/bookings/${segment(arg.bookingId)}/review`, method: 'DELETE', params: { revision: arg.revision } }),
    transformResponse: unwrap<CareerReviewResponse>,
    invalidatesTags: ['Career'],
  }),
  getBookingDispute: builder.query<CareerDisputeResponse, string>({
    query: (arg) => ({ url: `${CG}/bookings/${segment(arg)}/dispute` }),
    transformResponse: unwrap<CareerDisputeResponse>,
    providesTags: ['Career'],
  }),
  openBookingDispute: builder.mutation<CareerDisputeResponse, { bookingId: string; request: CareerDisputeRequest }>({
    query: (arg) => ({ url: `${CG}/bookings/${segment(arg.bookingId)}/dispute`, method: 'POST', data: arg.request }),
    transformResponse: unwrap<CareerDisputeResponse>,
    invalidatesTags: ['Career'],
  }),
  getCareerDisputes: builder.query<PaginatedResponse<CareerDisputeResponse>, { audience: 'consultant' | 'admin'; query: CareerTrustQuery }>({
    query: (arg) => ({ url: `${arg.audience === 'admin' ? ADMIN_CG : `${CG}/me`}/disputes`, params: arg.query }),
    transformResponse: unwrap<PaginatedResponse<CareerDisputeResponse>>,
    providesTags: ['Career'],
  }),
  getCareerDispute: builder.query<CareerDisputeResponse, { audience: 'consultant' | 'admin'; id: string }>({
    query: (arg) => ({ url: disputePath(arg.audience, arg.id) }),
    transformResponse: unwrap<CareerDisputeResponse>,
    providesTags: ['Career'],
  }),
  addCareerEvidence: builder.mutation<CareerDisputeResponse, { audience: Audience; id: string; request: CareerEvidenceRequest }>({
    query: (arg) => ({ url: `${disputePath(arg.audience, arg.id)}/evidence`, method: 'POST', data: arg.request }),
    transformResponse: unwrap<CareerDisputeResponse>,
    invalidatesTags: ['Career'],
  }),
  getAdminCareerReviews: builder.query<PaginatedResponse<CareerReviewResponse>, CareerTrustQuery>({
    query: (arg) => ({ url: `${ADMIN_CG}/reviews`, params: arg }),
    transformResponse: unwrap<PaginatedResponse<CareerReviewResponse>>,
    providesTags: ['Career'],
  }),
  getAdminCareerReview: builder.query<CareerReviewResponse, string>({
    query: (arg) => ({ url: `${ADMIN_CG}/reviews/${segment(arg)}` }),
    transformResponse: unwrap<CareerReviewResponse>,
    providesTags: ['Career'],
  }),
  moderateCareerReview: builder.mutation<CareerReviewResponse, { id: string; request: CareerReviewModerationRequest }>({
    query: (arg) => ({ url: `${ADMIN_CG}/reviews/${segment(arg.id)}/moderation`, method: 'POST', data: arg.request }),
    transformResponse: unwrap<CareerReviewResponse>,
    invalidatesTags: ['Career'],
  }),
  setCareerDisputeStatus: builder.mutation<CareerDisputeResponse, { id: string; request: CareerDisputeStatusRequest }>({
    query: (arg) => ({ url: `${ADMIN_CG}/disputes/${segment(arg.id)}/status`, method: 'POST', data: arg.request }),
    transformResponse: unwrap<CareerDisputeResponse>,
    invalidatesTags: ['Career'],
  }),
  resolveCareerDispute: builder.mutation<CareerDisputeResponse, { id: string; request: CareerDisputeResolveRequest }>({
    query: (arg) => ({ url: `${ADMIN_CG}/disputes/${segment(arg.id)}/resolve`, method: 'POST', data: arg.request }),
    transformResponse: unwrap<CareerDisputeResponse>,
    invalidatesTags: ['Career'],
  }),
}) });
export const { useGetPublicCareerReviewsQuery, useLazyGetPublicCareerReviewsQuery, useGetBookingReviewQuery, useLazyGetBookingReviewQuery, useSaveBookingReviewMutation, useWithdrawBookingReviewMutation, useGetBookingDisputeQuery, useLazyGetBookingDisputeQuery, useOpenBookingDisputeMutation, useGetCareerDisputesQuery, useLazyGetCareerDisputesQuery, useGetCareerDisputeQuery, useLazyGetCareerDisputeQuery, useAddCareerEvidenceMutation, useGetAdminCareerReviewsQuery, useLazyGetAdminCareerReviewsQuery, useGetAdminCareerReviewQuery, useLazyGetAdminCareerReviewQuery, useModerateCareerReviewMutation, useSetCareerDisputeStatusMutation, useResolveCareerDisputeMutation } = api;
export { api as trustApi };
