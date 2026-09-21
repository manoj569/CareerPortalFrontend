// Generated from inspected TrustContracts.cs positional DTOs; dates are ISO strings.
import type { CareerDisputeCategory, CareerDisputeResolution, CareerDisputeStatus, CareerEvidenceType, CareerReviewStatus } from './enums';

export interface CareerReviewRequest {
  rating: number;
  title: string | null;
  comment: string | null;
  revision?: string | null;
}

export interface CareerReviewModerationRequest {
  revision: string;
  status: CareerReviewStatus;
  reason: string;
}

export interface CareerDisputeRequest {
  category: CareerDisputeCategory;
  description: string;
  requestedRefund?: boolean;
}

export interface CareerEvidenceRequest {
  revision: string;
  requestId: string;
  evidenceType: CareerEvidenceType;
  description: string;
  isPrivateToAdmin?: boolean;
}

export interface CareerDisputeStatusRequest {
  revision: string;
  status: CareerDisputeStatus;
  adminNotes: string;
}

export interface CareerDisputeResolveRequest {
  revision: string;
  resolution: CareerDisputeResolution;
  adminNotes: string;
}

export interface CareerTrustQuery {
  pageNumber?: number;
  pageSize?: number;
  status?: CareerDisputeStatus | null;
  moderationStatus?: CareerReviewStatus | null;
}

export interface CareerRatingSummary {
  consultantId: string;
  averageRating: number | null;
  reviewCount: number;
}

export interface CareerPublicReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  candidateDisplayName: string;
  createdAtUtc: string;
}

export interface CareerReviewResponse {
  id: string;
  bookingId: string;
  sessionId: string;
  consultantId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isPublished: boolean;
  moderationStatus: CareerReviewStatus;
  moderationReason: string | null;
  isDeleted: boolean;
  createdAtUtc: string;
  revision: string;
}

export interface CareerEvidenceResponse {
  id: string;
  evidenceType: CareerEvidenceType;
  description: string;
  isPrivateToAdmin: boolean;
  createdAtUtc: string;
}

export interface CareerDisputeResponse {
  id: string;
  bookingId: string;
  sessionId: string | null;
  category: CareerDisputeCategory;
  description: string;
  requestedRefund: boolean;
  status: CareerDisputeStatus;
  resolution: CareerDisputeResolution;
  adminNotes: string | null;
  submittedAtUtc: string;
  resolvedAtUtc: string | null;
  revision: string;
  evidence: CareerEvidenceResponse[];
}
