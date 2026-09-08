import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery, type AxiosBaseQueryError } from '@/api/axiosBaseQuery';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import type { ApiResponse } from '@/types';
import type {
  ConfirmPaymentArgs,
  CreatePhonePeCheckoutRequest,
  Payment,
  PaymentHistoryPage,
  PaymentOrder,
  PhonePeCheckoutResponse,
  PhonePeReturnStatusResponse,
  PendingMembershipCheckoutResponse,
  PaymentStatusResponse,
  PaymentsPage,
  PaymentsQuery,
} from '../types/paymentModels';

export const paymentsApi = createApi({
  reducerPath: 'paymentsApi',
  baseQuery: axiosBaseQuery(),
  keepUnusedDataFor: 60,
  tagTypes: ['Payments', 'PaymentHistory', 'PaymentStatus', 'PendingCheckout'],
  endpoints: (builder) => ({
    createPhonePeCheckout: builder.mutation<PhonePeCheckoutResponse, CreatePhonePeCheckoutRequest>({
      query: (request) => ({
        data: request,
        method: 'POST',
        url: API_ENDPOINTS.PAYMENTS.CREATE_PHONEPE_CHECKOUT,
      }),
      transformResponse: (response: ApiResponse<PhonePeCheckoutResponse>) => response.data,
      invalidatesTags: ['Payments', 'PaymentHistory', 'PaymentStatus'],
    }),
    getPhonePeReturn: builder.query<PhonePeReturnStatusResponse, string>({
      query: (merchantOrderId) => ({
        url: API_ENDPOINTS.PAYMENTS.PHONEPE_RETURN(merchantOrderId),
      }),
      transformResponse: (response: ApiResponse<PhonePeReturnStatusResponse>) => response.data,
    }),
    getPendingMembershipCheckout: builder.query<PendingMembershipCheckoutResponse | null, void>({
      query: () => ({ url: API_ENDPOINTS.PAYMENTS.PENDING_MEMBERSHIP_CHECKOUT }),
      transformResponse: (response: ApiResponse<PendingMembershipCheckoutResponse | null>) =>
        response.data,
      providesTags: ['PendingCheckout'],
    }),
    cancelPendingMembershipCheckout: builder.mutation<PendingMembershipCheckoutResponse, string>({
      query: (publicReference) => ({
        method: 'POST',
        url: API_ENDPOINTS.PAYMENTS.CANCEL_PENDING_MEMBERSHIP_CHECKOUT(publicReference),
      }),
      transformResponse: (response: ApiResponse<PendingMembershipCheckoutResponse>) =>
        response.data,
      invalidatesTags: ['PendingCheckout', 'Payments', 'PaymentHistory', 'PaymentStatus'],
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(dashboardApi.util.invalidateTags(['Memberships']));
        } catch {
          // Authoritative membership state is unchanged when cancellation fails.
        }
      },
    }),
    createRazorpayOrder: builder.mutation<PaymentOrder, void>({
      query: () => ({
        data: {},
        method: 'POST',
        url: API_ENDPOINTS.PAYMENTS.CREATE_RAZORPAY_ORDER,
      }),
      transformResponse: (response: ApiResponse<PaymentOrder>) => response.data,
      invalidatesTags: ['Payments', 'PaymentHistory', 'PaymentStatus'],
    }),
    confirmRazorpayPayment: builder.mutation<Payment, ConfirmPaymentArgs>({
      query: ({ paymentId, request }) => ({
        data: request,
        method: 'POST',
        url: API_ENDPOINTS.PAYMENTS.CONFIRM_RAZORPAY(paymentId),
      }),
      transformResponse: (response: ApiResponse<Payment>) => response.data,
      invalidatesTags: ['Payments', 'PaymentHistory', 'PaymentStatus'],
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(dashboardApi.util.invalidateTags(['Memberships']));
        } catch {
          // Membership state remains unchanged when backend verification fails.
        }
      },
    }),
    reconcileRazorpayPayment: builder.mutation<Payment, string>({
      query: (paymentId) => ({
        method: 'POST',
        url: API_ENDPOINTS.PAYMENTS.RECONCILE_RAZORPAY(paymentId),
      }),
      transformResponse: (response: ApiResponse<Payment>) => response.data,
      invalidatesTags: ['Payments', 'PaymentHistory', 'PaymentStatus'],
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(dashboardApi.util.invalidateTags(['Memberships']));
        } catch {
          // Failed reconciliation never changes frontend entitlement state.
        }
      },
    }),
    getPaymentStatus: builder.query<PaymentStatusResponse, void>({
      query: () => ({ url: API_ENDPOINTS.PAYMENTS.STATUS }),
      transformResponse: (response: ApiResponse<PaymentStatusResponse>) => response.data,
      providesTags: ['PaymentStatus'],
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
  useCancelPendingMembershipCheckoutMutation,
  useCreatePhonePeCheckoutMutation,
  useConfirmRazorpayPaymentMutation,
  useCreateRazorpayOrderMutation,
  useGetPaymentHistoryQuery,
  useGetPaymentStatusQuery,
  useGetPendingMembershipCheckoutQuery,
  useGetPaymentsQuery,
  useLazyGetPhonePeReturnQuery,
  useReconcileRazorpayPaymentMutation,
} = paymentsApi;

export const isPaymentsApiError = (error: unknown): error is AxiosBaseQueryError =>
  Boolean(error && typeof error === 'object' && 'message' in error);
