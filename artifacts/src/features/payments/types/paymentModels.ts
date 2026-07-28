import type { PaginatedResponse } from '@/types';

export enum PaymentStatus {
  Pending = 1,
  Authorized,
  Paid,
  Failed,
  Refunded,
  Cancelled,
}

export enum PaymentProvider {
  Unknown = 0,
  Stripe,
  Razorpay,
  PayPal,
  BankTransfer,
}

export interface CreatePaymentOrderRequest {
  jobId: string;
}

export interface PaymentOrder {
  paymentId: string;
  membershipId: string;
  providerOrderId: string;
  keyId: string;
  amountInMinorUnits: number;
  currencyCode: string;
  receipt: string;
}

export interface ConfirmRazorpayPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface ConfirmPaymentArgs {
  paymentId: string;
  request: ConfirmRazorpayPaymentRequest;
}

export interface Payment {
  id: string;
  amount: number;
  currencyCode: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  paidAtUtc: string | null;
  membershipId: string | null;
  createdAtUtc: string;
}

export interface PaymentHistoryEvent {
  id: string;
  paymentId: string;
  previousStatus: PaymentStatus | null;
  currentStatus: PaymentStatus;
  occurredAtUtc: string;
  providerEventId: string | null;
  reason: string | null;
}

export interface PaymentsQuery {
  pageNumber: number;
  pageSize: number;
}

export type PaymentsPage = PaginatedResponse<Payment>;
export type PaymentHistoryPage = PaginatedResponse<PaymentHistoryEvent>;
