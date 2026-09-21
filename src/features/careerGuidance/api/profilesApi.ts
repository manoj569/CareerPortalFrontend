import { careerGuidanceApi, unwrap, CG, ADMIN_CG, segment } from './careerGuidanceApi';
import type { PaginatedResponse } from '@/types';
import type { ConsultantAdminQuery, ConsultantPrivateResponse, ConsultantProfileRequest, ConsultantPublicResponse, ConsultantReviewRequest, ConsultantSearchQuery, ConsultantServiceRequest } from '../types';

const api = careerGuidanceApi.injectEndpoints({ endpoints: (builder) => ({
  getConsultants: builder.query<PaginatedResponse<ConsultantPublicResponse>, ConsultantSearchQuery>({
    query: (arg) => ({ url: `${CG}/consultants`, params: arg }),
    transformResponse: unwrap<PaginatedResponse<ConsultantPublicResponse>>,
    providesTags: ['Career'],
  }),
  getConsultant: builder.query<ConsultantPublicResponse, string>({
    query: (arg) => ({ url: `${CG}/consultants/${segment(arg)}` }),
    transformResponse: unwrap<ConsultantPublicResponse>,
    providesTags: ['Career'],
  }),
  getOwnProfile: builder.query<ConsultantPrivateResponse, void>({
    query: () => ({ url: `${CG}/me/profile` }),
    transformResponse: unwrap<ConsultantPrivateResponse>,
    providesTags: ['Career'],
  }),
  applyConsultant: builder.mutation<ConsultantPrivateResponse, ConsultantProfileRequest>({
    query: (arg) => ({ url: `${CG}/me/application`, method: 'POST', data: arg }),
    transformResponse: unwrap<ConsultantPrivateResponse>,
    invalidatesTags: ['Career'],
  }),
  updateOwnProfile: builder.mutation<ConsultantPrivateResponse, ConsultantProfileRequest>({
    query: (arg) => ({ url: `${CG}/me/profile`, method: 'PUT', data: arg }),
    transformResponse: unwrap<ConsultantPrivateResponse>,
    invalidatesTags: ['Career'],
  }),
  saveConsultantService: builder.mutation<ConsultantPrivateResponse, { id?: string; request: ConsultantServiceRequest }>({
    query: (arg) => ({ url: `${CG}/me/services${arg.id ? `/${segment(arg.id)}` : ''}`, method: arg.id ? 'PUT' : 'POST', data: arg.request }),
    transformResponse: unwrap<ConsultantPrivateResponse>,
    invalidatesTags: ['Career'],
  }),
  deleteConsultantService: builder.mutation<ConsultantPrivateResponse, { id: string; revision: string }>({
    query: (arg) => ({ url: `${CG}/me/services/${segment(arg.id)}`, method: 'DELETE', params: { revision: arg.revision } }),
    transformResponse: unwrap<ConsultantPrivateResponse>,
    invalidatesTags: ['Career'],
  }),
  getAdminConsultants: builder.query<PaginatedResponse<ConsultantPrivateResponse>, ConsultantAdminQuery>({
    query: (arg) => ({ url: `${ADMIN_CG}/consultants`, params: arg }),
    transformResponse: unwrap<PaginatedResponse<ConsultantPrivateResponse>>,
    providesTags: ['Career'],
  }),
  getAdminConsultant: builder.query<ConsultantPrivateResponse, string>({
    query: (arg) => ({ url: `${ADMIN_CG}/consultants/${segment(arg)}` }),
    transformResponse: unwrap<ConsultantPrivateResponse>,
    providesTags: ['Career'],
  }),
  verifyConsultant: builder.mutation<ConsultantPrivateResponse, { id: string; request: ConsultantReviewRequest }>({
    query: (arg) => ({ url: `${ADMIN_CG}/consultants/${segment(arg.id)}/verification`, method: 'POST', data: arg.request }),
    transformResponse: unwrap<ConsultantPrivateResponse>,
    invalidatesTags: ['Career'],
  }),
}) });
export const { useGetConsultantsQuery, useLazyGetConsultantsQuery, useGetConsultantQuery, useLazyGetConsultantQuery, useGetOwnProfileQuery, useLazyGetOwnProfileQuery, useApplyConsultantMutation, useUpdateOwnProfileMutation, useSaveConsultantServiceMutation, useDeleteConsultantServiceMutation, useGetAdminConsultantsQuery, useLazyGetAdminConsultantsQuery, useGetAdminConsultantQuery, useLazyGetAdminConsultantQuery, useVerifyConsultantMutation } = api;
export { api as profilesApi };
