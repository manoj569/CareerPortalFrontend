import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/api/axiosBaseQuery';
import { sessionExpired } from '@/features/auth/store/authSlice';
import type { ApiResponse } from '@/types';

const baseQuery = axiosBaseQuery();
export const careerGuidanceApi = createApi({
  reducerPath: 'careerGuidanceApi',
  baseQuery: async (args, api) => {
    const result = await baseQuery(args, api);
    if (result.error?.status === 401) api.dispatch(sessionExpired());
    return result;
  },
  keepUnusedDataFor: 0,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: ['Career'],
  endpoints: () => ({}),
});
export const unwrap = <T>(response: ApiResponse<T>): T => response.data;
export const CG = '/career-guidance';
export const ADMIN_CG = '/admin/career-guidance';
export const segment = (id: string) => encodeURIComponent(id);
export type Audience = 'candidate' | 'consultant' | 'admin';
export const bookingPath = (audience: Audience, id = '') => `${audience === 'admin' ? ADMIN_CG : CG}/${audience === 'consultant' ? 'me/' : ''}bookings${id ? `/${segment(id)}` : ''}`;
export const sessionPath = (audience: Audience, id: string) => audience === 'candidate'
  ? `${CG}/bookings/${segment(id)}/session`
  : `${audience === 'admin' ? ADMIN_CG : `${CG}/me`}/sessions/${segment(id)}`;
export const disputePath = (audience: Audience, id: string) => `${audience === 'admin' ? ADMIN_CG : audience === 'consultant' ? `${CG}/me` : CG}/disputes/${segment(id)}`;
