// Generated from inspected FinanceContracts.cs positional DTOs; dates are ISO strings.
import type { CareerEarningStatus, CareerPaymentStatus, CareerRefundReason, CareerRefundStatus } from './enums';

export interface CareerCheckout {
  paymentId: string;
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
}

export interface CareerVerifyRequest {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface CareerRefundRequest {
  reason: CareerRefundReason;
}

export interface FinanceQuery {
  pageNumber?: number;
  pageSize?: number;
}

export interface CareerPaymentResponse {
  id: string;
  bookingId: string;
  gross: number;
  currency: string;
  commissionPercent: number;
  commission: number;
  net: number;
  status: CareerPaymentStatus;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  paidAtUtc: string | null;
  requiresRefundReview: boolean;
  failureCode: string | null;
}

export interface CareerRefundResponse {
  id: string;
  paymentId: string;
  bookingId: string;
  amount: number;
  currency: string;
  reason: CareerRefundReason;
  status: CareerRefundStatus;
  requestedAtUtc: string;
  processedAtUtc: string | null;
}

export interface CareerEarningResponse {
  id: string;
  paymentId: string;
  bookingId: string;
  gross: number;
  commission: number;
  net: number;
  currency: string;
  status: CareerEarningStatus;
  reversedAtUtc: string | null;
}

export interface CareerEarningSummary {
  currency: string;
  status: CareerEarningStatus;
  gross: number;
  commission: number;
  net: number;
  count: number;
}
