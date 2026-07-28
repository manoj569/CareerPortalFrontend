import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery, type AxiosBaseQueryError } from '@/api/axiosBaseQuery';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import type { ApiResponse } from '@/types';
import type {
  ConfirmPaymentArgs,
  CreatePaymentOrderRequest,
  Payment,
  PaymentHistoryPage,
  PaymentOrder,
  PaymentsPage,
  PaymentsQuery,
} from '../types/paymentModels';

export const paymentsApi = createApi({
  reducerPath: 'paymentsApi',
  baseQuery: axiosBaseQuery(),
  keepUnusedDataFor: 60,
  tagTypes: ['Payments', 'PaymentHistory'],
  endpoints: (builder) => ({
    createRazorpayOrder: builder.mutation<PaymentOrder, CreatePaymentOrderRequest>({
      query: (data) => ({
        data,
        method: 'POST',
        url: API_ENDPOINTS.PAYMENTS.CREATE_RAZORPAY_ORDER,
      }),
      transformResponse: (response: ApiResponse<PaymentOrder>) => response.data,
      invalidatesTags: ['Payments', 'PaymentHistory'],
    }),
    confirmRazorpayPayment: builder.mutation<Payment, ConfirmPaymentArgs>({
      query: ({ paymentId, request }) => ({
        data: request,
        method: 'POST',
        url: API_ENDPOINTS.PAYMENTS.CONFIRM_RAZORPAY(paymentId),
      }),
      transformResponse: (response: ApiResponse<Payment>) => response.data,
      invalidatesTags: ['Payments', 'PaymentHistory'],
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(dashboardApi.util.invalidateTags(['Memberships']));
        } catch {
          // Membership state remains unchanged when backend verification fails.
        }
      },
    }),
    getPayments: builder.query<PaymentsPage, PaymentsQuery>({
      query: (params) => ({ params, url: API_ENDPOINTS.PAYMENTS.LIST }),
      transformResponse: (response: ApiResponse<PaymentsPage>) => response.data,
      providesTags: ['Payments'],
    }),
    getPaymentHistory: builder.query<PaymentHistoryPage, PaymentsQuery>({
      query: (params) => ({ params, url: API_ENDPOINTS.PAYMENTS.HISTORY }),
      transformResponse: (response: ApiResponse<PaymentHistoryPage>) => response.data,
      providesTags: ['PaymentHistory'],
    }),
  }),
});

export const {
  useConfirmRazorpayPaymentMutation,
  useCreateRazorpayOrderMutation,
  useGetPaymentHistoryQuery,
  useGetPaymentsQuery,
} = paymentsApi;

export const isPaymentsApiError = (error: unknown): error is AxiosBaseQueryError =>
  Boolean(error && typeof error === 'object' && 'message' in error);
