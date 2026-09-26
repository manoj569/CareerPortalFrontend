import { careerGuidanceApi, unwrap, CG, segment } from './careerGuidanceApi';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type { CareerCheckout, CareerEarningResponse, CareerEarningSummary, CareerPaymentResponse, CareerRefundResponse, CareerVerifyRequest, FinanceQuery } from '../types';

const api = careerGuidanceApi.injectEndpoints({ endpoints: (builder) => ({
  createCareerOrder: builder.mutation<CareerCheckout, string>({
    query: (arg) => ({ url: `${CG}/bookings/${segment(arg)}/payment/order`, method: 'POST' }),
    transformResponse: unwrap<CareerCheckout>,
    invalidatesTags: ['Career'],
  }),
  verifyCareerPayment: builder.mutation<CareerPaymentResponse, { bookingId: string; request: CareerVerifyRequest }>({
    query: (arg) => ({ url: `${CG}/bookings/${segment(arg.bookingId)}/payment/verify`, method: 'POST', data: arg.request }),
    transformResponse: unwrap<CareerPaymentResponse>,
    invalidatesTags: ['Career'],
  }),
  getCareerPayment: builder.query<CareerPaymentResponse | null, string>({
    async queryFn(arg, _api, _options, baseQuery) {
      const result = await baseQuery({ url: `${CG}/bookings/${segment(arg)}/payment` });
      if (result.error) {
        // No payment exists until checkout starts. Cache this as an empty result,
        // so another subscriber does not restart a legitimately missing read.
        return result.error.status === 404 ? { data: null } : { error: result.error };
      }
      return { data: unwrap(result.data as ApiResponse<CareerPaymentResponse>) };
    },
    providesTags: ['Career'],
  }),
  reconcileCareerPayment: builder.mutation<CareerPaymentResponse, string>({
    query: (arg) => ({ url: `${CG}/bookings/${segment(arg)}/payment/reconcile`, method: 'POST' }),
    transformResponse: unwrap<CareerPaymentResponse>,
    invalidatesTags: ['Career'],
  }),
  getCareerEarnings: builder.query<PaginatedResponse<CareerEarningResponse>, FinanceQuery>({
    query: (arg) => ({ url: `${CG}/me/earnings`, params: arg }),
    transformResponse: unwrap<PaginatedResponse<CareerEarningResponse>>,
    providesTags: ['Career'],
  }),
  getCareerEarningSummary: builder.query<CareerEarningSummary[], void>({
    query: () => ({ url: `${CG}/me/earnings/summary` }),
    transformResponse: unwrap<CareerEarningSummary[]>,
    providesTags: ['Career'],
  }),
  getCareerRefunds: builder.query<PaginatedResponse<CareerRefundResponse>, FinanceQuery>({
    query: (arg) => ({ url: `${CG}/refunds/mine`, params: arg }),
    transformResponse: unwrap<PaginatedResponse<CareerRefundResponse>>,
    providesTags: ['Career'],
  }),
}) });
export const { useCreateCareerOrderMutation, useVerifyCareerPaymentMutation, useGetCareerPaymentQuery, useLazyGetCareerPaymentQuery, useReconcileCareerPaymentMutation, useGetCareerEarningsQuery, useLazyGetCareerEarningsQuery, useGetCareerEarningSummaryQuery, useLazyGetCareerEarningSummaryQuery, useGetCareerRefundsQuery, useLazyGetCareerRefundsQuery } = api;
export { api as financeApi };
