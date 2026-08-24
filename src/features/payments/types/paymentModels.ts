import type { PaginatedResponse } from '@/types';
import type { Membership } from '@/features/dashboard/types/dashboardModels';

export enum PaymentStatus {
  Pending = 1,
  Authorized,
  Paid,
  Failed,
  Refunded,
  Cancelled,
  Created,
  Expired,
}

export enum PaymentProvider {
  Unknown = 0,
  Stripe,
  Razorpay,
  PayPal,
  BankTransfer,
  PhonePe,
}

export interface PhonePeCheckoutResponse {
  merchantOrderId: string;
  redirectUrl: string;
  expiresAtUtc: string | null;
  planName: string;
  amountInMinorUnits: number;
  currencyCode: string;
  durationDays: number;
}

export enum PhonePePaymentStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
}

export interface PhonePeReturnStatusResponse {
  merchantOrderId: string;
  status: PhonePePaymentStatus;
}

export enum MembershipCheckoutStatus {
  Created = 'Created',
  Pending = 'Pending',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
  Completed = 'Completed',
}

export type MembershipCheckoutProvider =
  'Unknown' | 'Stripe' | 'Razorpay' | 'PayPal' | 'BankTransfer' | 'PhonePe';

export interface PendingMembershipCheckoutResponse {
  publicReference: string;
  provider: MembershipCheckoutProvider;
  status: MembershipCheckoutStatus;
  amount: number;
  currency: string;
  createdAtUtc: string;
  canResume: boolean;
  canCancel: boolean;
  redirectUrl: string | null;
}

export interface PaymentOrder {
  paymentId: string;
  membershipId: string;
  providerOrderId: string;
  keyId: string;
  amountInMinorUnits: number;
  currencyCode: string;
  receipt: string;
  planName: string;
  durationDays: number;
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
  providerOrderCreatedAtUtc: string | null;
  lastReconciledAtUtc: string | null;
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

export interface PaymentStatusResponse {
  membership: Membership | null;
  latestPayment: Payment | null;
}

export type PaymentsPage = PaginatedResponse<Payment>;
export type PaymentHistoryPage = PaginatedResponse<PaymentHistoryEvent>;
