// Generated from inspected CareerGuidanceContracts.cs positional DTOs; dates are ISO strings.

import type {
  ConsultantEducationItem,
  ConsultantExperienceItem,
} from '../api/onboardingApi';
import type {
  CareerProfessionalType,
  ConsultantReviewAction,
  ConsultantVerificationStatus,
} from './enums';

export interface ConsultantProfileRequest {
  displayName: string;
  professionalHeadline: string;
  bio: string;
  companyId: string | null;
  companyName: string;
  currentRole: string;
  yearsOfExperience: number;
  professionalType: CareerProfessionalType;
  linkedInUrl: string;
  languages: string[];
  expertise: string[];
  acceptIndependentGuidancePolicy: boolean;
  revision?: string | null;
}

export interface ConsultantServiceRequest {
  serviceType: string;
  title: string;
  description: string;
  durationMinutes: number;
  price: number;
  currency: string;
  isActive: boolean;
  revision: string;
}

export interface ConsultantReviewRequest {
  action: ConsultantReviewAction;
  reason: string;
  revision: string;
}

export interface ConsultantSearchQuery {
  pageNumber?: number;
  pageSize?: number;
  companyId?: string | null;
  company?: string | null;
  role?: string | null;
  search?: string | null;
  professionalType?: CareerProfessionalType | null;
  language?: string | null;
  expertise?: string | null;
  serviceType?: string | null;
  currency?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  sort?: string;
}

export interface ConsultantAdminQuery {
  pageNumber?: number;
  pageSize?: number;
  status?: ConsultantVerificationStatus | null;
}

export interface ConsultantServiceResponse {
  id: string;
  serviceType: string;
  title: string;
  description: string;
  durationMinutes: number;
  price: number;
  currency: string;
  isActive: boolean;
}

export interface ConsultantPublicResponse {
  id: string;
  displayName: string;
  professionalHeadline: string;
  bio: string;

  companyId: string | null;
  companyName: string;
  currentRole: string;

  yearsOfExperience: number | null;
  professionalType: CareerProfessionalType | null;

  languages: string[];
  expertise: string[];

  isAcceptingBookings: boolean;
  guidanceDisclaimer: string;

  services: ConsultantServiceResponse[];

  averageRating: number | null;
  reviewCount: number;

  profileImageUrl: string | null;
  location: string | null;
  industry: string | null;
  functionalArea: string | null;

  education: ConsultantEducationItem[];
  workExperience: ConsultantExperienceItem[];

  approvalLabel: string | null;
}

export interface ConsultantPrivateResponse {
  profile: ConsultantPublicResponse;
  userId: string;
  linkedInUrl: string;
  verificationStatus: ConsultantVerificationStatus;
  verificationMethod: string | null;
  verificationReason: string | null;
  reviewedByUserId: string | null;
  reviewedAtUtc: string | null;
  verifiedAtUtc: string | null;
  termsAcceptedAtUtc: string;
  policyVersion: string;
  revision: string;
  services: ConsultantServiceResponse[];
}