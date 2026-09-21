import { careerGuidanceApi, unwrap, CG, segment, bookingPath } from './careerGuidanceApi';
import type { Audience } from './careerGuidanceApi';
import type { PaginatedResponse } from '@/types';
import type { AvailabilityExceptionRequest, AvailabilityExceptionResponse, AvailabilityResponse, BookingActionRequest, BookingStatusRequest, CareerBookingResponse, CreateCareerBookingRequest, ExceptionChangeResponse, SaveAvailabilityRequest, SlotQuery, SlotResponse } from '../types';

const api = careerGuidanceApi.injectEndpoints({ endpoints: (builder) => ({
  getAvailability: builder.query<AvailabilityResponse, void>({
    query: () => ({ url: `${CG}/me/availability` }),
    transformResponse: unwrap<AvailabilityResponse>,
    providesTags: ['Career'],
  }),
  saveAvailability: builder.mutation<AvailabilityResponse, SaveAvailabilityRequest>({
    query: (arg) => ({ url: `${CG}/me/availability`, method: 'PUT', data: arg }),
    transformResponse: unwrap<AvailabilityResponse>,
    invalidatesTags: ['Career'],
  }),
  getAvailabilityExceptions: builder.query<AvailabilityExceptionResponse[], SlotQuery>({
    query: (arg) => ({ url: `${CG}/me/availability/exceptions`, params: arg }),
    transformResponse: unwrap<AvailabilityExceptionResponse[]>,
    providesTags: ['Career'],
  }),
  addAvailabilityException: builder.mutation<ExceptionChangeResponse, AvailabilityExceptionRequest>({
    query: (arg) => ({ url: `${CG}/me/availability/exceptions`, method: 'POST', data: arg }),
    transformResponse: unwrap<ExceptionChangeResponse>,
    invalidatesTags: ['Career'],
  }),
  deleteAvailabilityException: builder.mutation<ExceptionChangeResponse, { id: string; revision: string }>({
    query: (arg) => ({ url: `${CG}/me/availability/exceptions/${segment(arg.id)}`, method: 'DELETE', params: { revision: arg.revision } }),
    transformResponse: unwrap<ExceptionChangeResponse>,
    invalidatesTags: ['Career'],
  }),
  getSlots: builder.query<SlotResponse, { consultantId: string; serviceId: string; from: string; to: string }>({
    query: (arg) => ({ url: `${CG}/consultants/${segment(arg.consultantId)}/services/${segment(arg.serviceId)}/slots`, params: { from: arg.from, to: arg.to } }),
    transformResponse: unwrap<SlotResponse>,
    providesTags: ['Career'],
  }),
  createCareerBooking: builder.mutation<CareerBookingResponse, CreateCareerBookingRequest>({
    query: (arg) => ({ url: `${CG}/bookings`, method: 'POST', data: arg }),
    transformResponse: unwrap<CareerBookingResponse>,
    invalidatesTags: ['Career'],
  }),
  getCareerBookings: builder.query<PaginatedResponse<CareerBookingResponse>, { audience: Audience; pageNumber: number; pageSize: number }>({
    query: (arg) => ({ url: `${bookingPath(arg.audience)}${arg.audience === 'candidate' ? '/mine' : ''}`, params: { pageNumber: arg.pageNumber, pageSize: arg.pageSize } }),
    transformResponse: unwrap<PaginatedResponse<CareerBookingResponse>>,
    providesTags: ['Career'],
  }),
  getCareerBooking: builder.query<CareerBookingResponse, { audience: Audience; id: string }>({
    query: (arg) => ({ url: bookingPath(arg.audience, arg.id) }),
    transformResponse: unwrap<CareerBookingResponse>,
    providesTags: ['Career'],
  }),
  cancelCareerBooking: builder.mutation<CareerBookingResponse, { audience: 'candidate' | 'consultant'; id: string; request: BookingActionRequest }>({
    query: (arg) => ({ url: `${bookingPath(arg.audience, arg.id)}/cancel`, method: 'POST', data: arg.request }),
    transformResponse: unwrap<CareerBookingResponse>,
    invalidatesTags: ['Career'],
  }),
  setLegacyBookingStatus: builder.mutation<CareerBookingResponse, { id: string; request: BookingStatusRequest }>({
    query: (arg) => ({ url: `${CG}/me/bookings/${segment(arg.id)}/status`, method: 'POST', data: arg.request }),
    transformResponse: unwrap<CareerBookingResponse>,
    invalidatesTags: ['Career'],
  }),
}) });
export const { useGetAvailabilityQuery, useLazyGetAvailabilityQuery, useSaveAvailabilityMutation, useGetAvailabilityExceptionsQuery, useLazyGetAvailabilityExceptionsQuery, useAddAvailabilityExceptionMutation, useDeleteAvailabilityExceptionMutation, useGetSlotsQuery, useLazyGetSlotsQuery, useCreateCareerBookingMutation, useGetCareerBookingsQuery, useLazyGetCareerBookingsQuery, useGetCareerBookingQuery, useLazyGetCareerBookingQuery, useCancelCareerBookingMutation, useSetLegacyBookingStatusMutation } = api;
export { api as schedulingApi };
