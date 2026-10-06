import { createApi } from '@reduxjs/toolkit/query/react';

import {
  axiosBaseQuery,
  type AxiosBaseQueryError,
} from '@/api/axiosBaseQuery';
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
  PhonePePlanCode,
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

  tagTypes: [
    'Payments',
    'PaymentHistory',
    'PaymentStatus',
    'PendingCheckout',
  ],

  endpoints: (builder) => ({
    /*
     * ---------------------------------------------------------
     * PHONEPE CHECKOUT
     * ---------------------------------------------------------
     *
     * Backend expects:
     *
     * POST /payments/phonepe/checkout?returnTo=...
     *
     * Body:
     * {
     *   planCode: "CareerHarborMembership"
     * }
     *
     * returnTo is deliberately sent as a query parameter rather
     * than as part of the request body.
     */
    createPhonePeCheckout: builder.mutation<
      PhonePeCheckoutResponse,
      CreatePhonePeCheckoutRequest
    >({
      query: ({ planCode, returnTo }) => ({
        data: {
          planCode,
        },

        params: returnTo
          ? {
              returnTo,
            }
          : undefined,

        method: 'POST',

        url: API_ENDPOINTS.PAYMENTS.CREATE_PHONEPE_CHECKOUT,
      }),

      transformResponse: (
        response: ApiResponse<PhonePeCheckoutResponse>,
      ) => response.data,

      // A newly created checkout must redirect before pending queries refresh.
      // Return verification and cancellation reconcile payment state separately.
    }),

    /*
     * ---------------------------------------------------------
     * PHONEPE RETURN / SERVER VERIFICATION
     * ---------------------------------------------------------
     *
     * The frontend never assumes that returning from PhonePe
     * means payment succeeded.
     *
     * The backend remains authoritative.
     */
    getPhonePeReturn: builder.query<
      PhonePeReturnStatusResponse,
      {
        merchantOrderId: string;
        returnTo?: string | null;
      }
    >({
      query: ({ merchantOrderId, returnTo }) => ({
        params: returnTo
          ? {
              returnTo,
            }
          : undefined,

        url: API_ENDPOINTS.PAYMENTS.PHONEPE_RETURN(
          merchantOrderId,
        ),
      }),

      transformResponse: (
        response: ApiResponse<PhonePeReturnStatusResponse>,
      ) => response.data,

      providesTags: ['PaymentStatus'],
    }),

    /*
     * ---------------------------------------------------------
     * PENDING MEMBERSHIP CHECKOUT
     * ---------------------------------------------------------
     *
     * planCode is optional for backwards compatibility.
     *
     * New Membership page will call this independently:
     *
     * CareerHarborMembership
     * ReferralContactAccess
     *
     * This prevents a pending ₹99 checkout from incorrectly
     * blocking the ₹299 referral plan, and vice versa.
     */
    getPendingMembershipCheckout: builder.query<
      PendingMembershipCheckoutResponse | null,
      PhonePePlanCode | void
    >({
      query: (planCode) => ({
        params: planCode
          ? {
              planCode,
            }
          : undefined,

        url:
          API_ENDPOINTS.PAYMENTS
            .PENDING_MEMBERSHIP_CHECKOUT,
      }),

      transformResponse: (
        response: ApiResponse<
          PendingMembershipCheckoutResponse | null
        >,
      ) => response.data,

      providesTags: (_result, _error, planCode) => [
        {
          type: 'PendingCheckout',
          id: planCode ?? 'ALL',
        },
      ],
    }),

    /*
     * ---------------------------------------------------------
     * CANCEL PENDING MEMBERSHIP CHECKOUT
     * ---------------------------------------------------------
     */
    cancelPendingMembershipCheckout: builder.mutation<
      PendingMembershipCheckoutResponse,
      string
    >({
      query: (publicReference) => ({
        method: 'POST',

        url:
          API_ENDPOINTS.PAYMENTS
            .CANCEL_PENDING_MEMBERSHIP_CHECKOUT(
              publicReference,
            ),
      }),

      transformResponse: (
        response: ApiResponse<PendingMembershipCheckoutResponse>,
      ) => response.data,

      invalidatesTags: [
        'PendingCheckout',
        'Payments',
        'PaymentHistory',
        'PaymentStatus',
      ],

      onQueryStarted: async (
        _,
        { dispatch, queryFulfilled },
      ) => {
        try {
          await queryFulfilled;

          dispatch(
            dashboardApi.util.invalidateTags([
              'Memberships',
            ]),
          );
        } catch {
          // Membership state remains authoritative on backend.
        }
      },
    }),

    /*
     * ---------------------------------------------------------
     * RAZORPAY
     * ---------------------------------------------------------
     *
     * Retained because other existing application functionality
     * may still depend on these endpoints.
     */
    createRazorpayOrder: builder.mutation<
      PaymentOrder,
      void
    >({
      query: () => ({
        data: {},
        method: 'POST',
        url:
          API_ENDPOINTS.PAYMENTS.CREATE_RAZORPAY_ORDER,
      }),

      transformResponse: (
        response: ApiResponse<PaymentOrder>,
      ) => response.data,

      invalidatesTags: [
        'Payments',
        'PaymentHistory',
        'PaymentStatus',
      ],
    }),

    confirmRazorpayPayment: builder.mutation<
      Payment,
      ConfirmPaymentArgs
    >({
      query: ({ paymentId, request }) => ({
        data: request,

        method: 'POST',

        url:
          API_ENDPOINTS.PAYMENTS.CONFIRM_RAZORPAY(
            paymentId,
          ),
      }),

      transformResponse: (
        response: ApiResponse<Payment>,
      ) => response.data,

      invalidatesTags: [
        'Payments',
        'PaymentHistory',
        'PaymentStatus',
      ],

      onQueryStarted: async (
        _,
        { dispatch, queryFulfilled },
      ) => {
        try {
          await queryFulfilled;

          dispatch(
            dashboardApi.util.invalidateTags([
              'Memberships',
            ]),
          );
        } catch {
          // Membership state remains unchanged when backend
          // verification fails.
        }
      },
    }),

    reconcileRazorpayPayment: builder.mutation<
      Payment,
      string
    >({
      query: (paymentId) => ({
        method: 'POST',

        url:
          API_ENDPOINTS.PAYMENTS.RECONCILE_RAZORPAY(
            paymentId,
          ),
      }),

      transformResponse: (
        response: ApiResponse<Payment>,
      ) => response.data,

      invalidatesTags: [
        'Payments',
        'PaymentHistory',
        'PaymentStatus',
      ],

      onQueryStarted: async (
        _,
        { dispatch, queryFulfilled },
      ) => {
        try {
          await queryFulfilled;

          dispatch(
            dashboardApi.util.invalidateTags([
              'Memberships',
            ]),
          );
        } catch {
          // Failed reconciliation never changes frontend
          // entitlement state.
        }
      },
    }),

    /*
     * ---------------------------------------------------------
     * PAYMENT STATUS
     * ---------------------------------------------------------
     */
    getPaymentStatus: builder.query<
      PaymentStatusResponse,
      void
    >({
      query: () => ({
        url: API_ENDPOINTS.PAYMENTS.STATUS,
      }),

      transformResponse: (
        response: ApiResponse<PaymentStatusResponse>,
      ) => response.data,

      providesTags: ['PaymentStatus'],
    }),

    /*
     * ---------------------------------------------------------
     * PAYMENTS
     * ---------------------------------------------------------
     */
    getPayments: builder.query<
      PaymentsPage,
      PaymentsQuery
    >({
      query: (params) => ({
        params,

        url: API_ENDPOINTS.PAYMENTS.LIST,
      }),

      transformResponse: (
        response: ApiResponse<PaymentsPage>,
      ) => response.data,

      providesTags: ['Payments'],
    }),

    /*
     * ---------------------------------------------------------
     * PAYMENT HISTORY
     * ---------------------------------------------------------
     */
    getPaymentHistory: builder.query<
      PaymentHistoryPage,
      PaymentsQuery
    >({
      query: (params) => ({
        params,

        url: API_ENDPOINTS.PAYMENTS.HISTORY,
      }),

      transformResponse: (
        response: ApiResponse<PaymentHistoryPage>,
      ) => response.data,

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

export const isPaymentsApiError = (
  error: unknown,
): error is AxiosBaseQueryError =>
  Boolean(
    error &&
      typeof error === 'object' &&
      'message' in error,
  );
