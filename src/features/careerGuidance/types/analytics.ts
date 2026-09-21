// Generated from inspected CareerAnalyticsContracts.cs positional DTOs; dates are ISO strings.

export interface CareerAnalyticsQuery {
  fromUtc?: string | null;
  toUtc?: string | null;
}

export interface CareerGuidanceAdminAnalytics {
  fromUtc: string;
  toUtc: string;
  applications: number;
  pendingVerification: number;
  verifiedConsultants: number;
  rejectedConsultants: number;
  suspendedConsultants: number;
  activeVerifiedConsultants: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  candidateNoShows: number;
  consultantNoShows: number;
  grossPaymentVolume: number;
  capturedPaymentCount: number;
  failedPaymentCount: number;
  refundedAmount: number;
  refundCount: number;
  platformCommission: number;
  consultantNetEarnings: number;
  scheduledSessions: number;
  readySessions: number;
  inProgressSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  sessionNoShows: number;
  reviewCount: number;
  publishedReviewCount: number;
  averageRating: number | null;
  openDisputes: number;
  resolvedDisputes: number;
  refundApprovedDisputes: number;
}

export interface CareerGuidanceConsultantAnalytics {
  consultantId: string;
  fromUtc: string;
  toUtc: string;
  totalBookings: number;
  confirmedBookings: number;
  completedSessions: number;
  cancellations: number;
  candidateNoShows: number;
  consultantNoShows: number;
  averageRating: number | null;
  publishedReviewCount: number;
  grossBookedValue: number;
  consultantEarnings: number;
  pendingEarnings: number;
  heldEarnings: number;
  refundedBookings: number;
  openDisputes: number;
  nextUpcomingSession: string | null;
}

export interface CareerGuidanceCandidateSummary {
  candidateUserId: string;
  upcomingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingReviewCount: number;
  activeDisputeCount: number;
  nextUpcomingSession: string | null;
}
