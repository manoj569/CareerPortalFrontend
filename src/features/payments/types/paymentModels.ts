import type { Membership } from '@/features/dashboard/types/dashboardModels';
import type { PaginatedResponse } from '@/types';

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

export interface MembershipPricing {
  baseAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
}

export interface PhonePeCheckoutResponse {
  merchantOrderId: string;
  redirectUrl: string;
  expiresAtUtc: string | null;
  planName: string;
  amountInMinorUnits: number;
  currencyCode: string;
  durationDays: number;
  returnTo: string | null;
  planCode: string;
  pricing?: MembershipPricing | null;
}

export type PhonePePlanCode =
  | 'CareerHarborMembership'
  | 'ReferralContactAccess'
  | 'AIApply'
  | 'AIApplyPro';

export interface CreatePhonePeCheckoutRequest {
  planCode: PhonePePlanCode;
  returnTo?: string | null;
}

export enum PhonePePaymentStatus {
  Pending = 1,
  Completed,
  Failed,
  Cancelled,
}

export interface PhonePeReturnStatusResponse {
  merchantOrderId: string;
  status: PhonePePaymentStatus;
  returnTo: string | null;
  payment: Payment | null;
  membershipStatus: number | null;
  membershipStartUtc: string | null;
  membershipEndUtc: string | null;
}

export enum MembershipCheckoutStatus {
  Created = 'Created',
  Pending = 'Pending',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
  Completed = 'Completed',
}

export type MembershipCheckoutProvider =
  | 'Unknown'
  | 'Stripe'
  | 'Razorpay'
  | 'PayPal'
  | 'BankTransfer'
  | 'PhonePe';

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
  planCode?: string | null;
}

export interface PendingMembershipCheckoutRecovery {
  provider: MembershipCheckoutProvider;
  publicReference: string;
  status: MembershipCheckoutStatus;
  createdAtUtc: string;
  canResume: boolean;
  canCancel: boolean;
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
  planCode?: string;
  pricing?: MembershipPricing | null;
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
  planCode?: string | null;
  planName?: string | null;
  durationDays?: number | null;
  pricing?: MembershipPricing | null;
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
  memberships?: Membership[] | null;
}

export type PaymentsPage = PaginatedResponse<Payment>;
export type PaymentHistoryPage = PaginatedResponse<PaymentHistoryEvent>;