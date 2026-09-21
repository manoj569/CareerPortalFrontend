import { careerGuidanceApi, unwrap, CG, ADMIN_CG, segment, sessionPath } from './careerGuidanceApi';
import type { Audience } from './careerGuidanceApi';
import type { PaginatedResponse } from '@/types';
import type { CareerManualMeetingRequest, CareerSessionAction, CareerSessionResponse } from '../types';

const api = careerGuidanceApi.injectEndpoints({ endpoints: (builder) => ({
  getCareerSession: builder.query<CareerSessionResponse, { audience: Audience; id: string }>({
    query: (arg) => ({ url: sessionPath(arg.audience, arg.id) }),
    transformResponse: unwrap<CareerSessionResponse>,
    providesTags: ['Career'],
  }),
  getCareerSessions: builder.query<PaginatedResponse<CareerSessionResponse>, { audience: 'consultant' | 'admin'; pageNumber: number; pageSize: number }>({
    query: (arg) => ({ url: `${arg.audience === 'admin' ? ADMIN_CG : `${CG}/me`}/sessions`, params: { pageNumber: arg.pageNumber, pageSize: arg.pageSize } }),
    transformResponse: unwrap<PaginatedResponse<CareerSessionResponse>>,
    providesTags: ['Career'],
  }),
  provisionCareerSession: builder.mutation<CareerSessionResponse, { audience: Audience; bookingId: string }>({
    query: (arg) => ({ url: arg.audience === 'candidate' ? `${CG}/bookings/${segment(arg.bookingId)}/session/provision` : `${arg.audience === 'admin' ? ADMIN_CG : `${CG}/me`}/sessions/bookings/${segment(arg.bookingId)}/provision`, method: 'POST' }),
    transformResponse: unwrap<CareerSessionResponse>,
    invalidatesTags: ['Career'],
  }),
  actOnCareerSession: builder.mutation<CareerSessionResponse, { audience: Audience; id: string; action: 'start' | 'complete' | 'candidate-no-show' | 'consultant-no-show-report' | 'consultant-no-show' | 'reconcile'; request: CareerSessionAction }>({
    query: (arg) => ({ url: `${sessionPath(arg.audience, arg.id)}/${arg.action}`, method: 'POST', data: arg.request }),
    transformResponse: unwrap<CareerSessionResponse>,
    invalidatesTags: ['Career'],
  }),
  configureCareerMeeting: builder.mutation<CareerSessionResponse, { id: string; request: CareerManualMeetingRequest }>({
    query: (arg) => ({ url: `${ADMIN_CG}/sessions/${segment(arg.id)}/manual-meeting`, method: 'POST', data: arg.request }),
    transformResponse: unwrap<CareerSessionResponse>,
    invalidatesTags: ['Career'],
  }),
}) });
export const { useGetCareerSessionQuery, useLazyGetCareerSessionQuery, useGetCareerSessionsQuery, useLazyGetCareerSessionsQuery, useProvisionCareerSessionMutation, useActOnCareerSessionMutation, useConfigureCareerMeetingMutation } = api;
export { api as sessionsApi };
