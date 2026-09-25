import { careerGuidanceApi, CG, unwrap } from './careerGuidanceApi';
import type { ConsultantVerificationStatus } from '../types';

export interface ConsultantEducationItem {
  qualification: string;
  institution: string;
  fieldOfStudy: string | null;
  startYear: number | null;
  endYear: number | null;
  isCurrentlyStudying: boolean;
  displayOrder: number;
}

export interface ConsultantExperienceItem {
  jobTitle: string;
  companyName: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
  displayOrder: number;
}

export interface ConsultantServiceItem {
  id: string;
  serviceType: string;
  title: string;
  description: string;
  durationMinutes: number;
  price: number;
  currency: string;
  isActive: boolean;
}

export type ConsultantAvailability = ConsultantAvailabilityResponse;

export interface ConsultantOnboardingResponse {
  id: string;
  revision: string;
  status: ConsultantVerificationStatus | 5;

  displayName: string;
  professionalHeadline: string;
  bio: string;

  profileImageUrl: string | null;
  location: string | null;
  professionalEmail: string | null;
  accountEmail: string;

  companyId: string | null;
  companyName: string;
  currentRole: string;
  yearsOfExperience: number | null;
  professionalType: number | null;
  linkedInUrl: string;

  industry: string | null;
  functionalArea: string | null;

  languages: string[];
  expertise: string[];

  education: ConsultantEducationItem[];
  workExperience: ConsultantExperienceItem[];

  services: ConsultantServiceItem[];
  availability: ConsultantAvailability;

  submittedAtUtc: string | null;
  publicProfileConsentAtUtc: string | null;
  termsAcceptedAtUtc: string | null;

  policyVersion: string;
  rejectionFeedback: string | null;
  missingRequirements: string[];
}

export type OnboardingStartResponse = ConsultantOnboardingResponse;

export interface ConsultantPublicProfile {
  id: string;
  displayName: string;
  professionalHeadline: string;
  bio: string;

  companyId: string | null;
  companyName: string;
  currentRole: string;
  yearsOfExperience: number | null;
  professionalType: number | null;

  languages: string[];
  expertise: string[];

  isAcceptingBookings: boolean;
  guidanceDisclaimer: string;

  services: ConsultantServiceItem[];

  averageRating: number | null;
  reviewCount: number;

  profileImageUrl?: string | null;
  location?: string | null;
  industry?: string | null;
  functionalArea?: string | null;

  education?: ConsultantEducationItem[];
  workExperience?: ConsultantExperienceItem[];
}

export interface ConsultantPrivateResponse {
  profile: ConsultantPublicProfile;
  userId: string;
  linkedInUrl: string;

  verificationStatus: ConsultantVerificationStatus | 5;
  verificationMethod: string | null;
  verificationReason: string | null;

  reviewedByUserId: string | null;
  reviewedAtUtc: string | null;
  verifiedAtUtc: string | null;
  termsAcceptedAtUtc: string | null;

  policyVersion: string;
  revision: string;

  services: ConsultantServiceItem[];
}

export interface SaveOnboardingBasicRequest {
  revision: string;

  displayName?: string | null;
  professionalHeadline?: string | null;
  bio?: string | null;
  profileImageUrl?: string | null;
  location?: string | null;
  professionalEmail?: string | null;
}

export interface SaveOnboardingProfessionalRequest {
  revision: string;

  companyId?: string | null;
  companyName?: string | null;
  currentRole?: string | null;
  yearsOfExperience?: number | null;
  professionalType?: number | null;
  linkedInUrl?: string | null;
  industry?: string | null;
  functionalArea?: string | null;
}

export interface SaveOnboardingEducationRequest {
  revision: string;
  items: ConsultantEducationItem[];
}

export interface SaveOnboardingExperienceRequest {
  revision: string;
  items: ConsultantExperienceItem[];
}

export interface SaveOnboardingExpertiseRequest {
  revision: string;
  languages: string[];
  expertise: string[];
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

export interface UpdateConsultantServiceRequest extends ConsultantServiceRequest {
  serviceId: string;
}

export interface DeleteConsultantServiceRequest {
  serviceId: string;
  revision: string;
}

export interface WeeklyAvailabilityWindow {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface ConsultantAvailabilityResponse {
  timeZoneId: string | null;
  isAcceptingBookings: boolean;
  windows: WeeklyAvailabilityWindow[];
  revision: string;
}

export interface SaveConsultantAvailabilityRequest {
  timeZoneId: string;
  isAcceptingBookings: boolean;
  windows: WeeklyAvailabilityWindow[];
  revision: string;
}

// Matches CareerGuidanceService.PolicyVersion; onboarding.policyVersion is the previously accepted version.
export const CONSULTANT_POLICY_VERSION = 'career-guidance-v1';

export interface SubmitConsultantOnboardingRequest {
  revision: string;
  policyVersion: string;
  acceptIndependentGuidancePolicy: boolean;
  acceptPublicProfileConsent: boolean;
}

export const onboardingApi = careerGuidanceApi.injectEndpoints({
  endpoints: (builder) => ({
    submitConsultantOnboarding: builder.mutation<
      ConsultantOnboardingResponse,
      SubmitConsultantOnboardingRequest
    >({
      query: (data) => ({ url: `${CG}/me/onboarding/submit`, method: 'POST', data }),
      transformResponse: unwrap<ConsultantOnboardingResponse>,
      invalidatesTags: ['Career'],
    }),
    startConsultantOnboarding: builder.mutation<ConsultantOnboardingResponse, void>({
      query: () => ({
        url: `${CG}/me/onboarding`,
        method: 'POST',
      }),
      transformResponse: unwrap<ConsultantOnboardingResponse>,
      invalidatesTags: ['Career'],
    }),

    getConsultantOnboarding: builder.query<ConsultantOnboardingResponse, void>({
      query: () => ({
        url: `${CG}/me/onboarding`,
        method: 'GET',
      }),
      transformResponse: unwrap<ConsultantOnboardingResponse>,
      providesTags: ['Career'],
    }),

    saveConsultantOnboardingBasic: builder.mutation<
      ConsultantOnboardingResponse,
      SaveOnboardingBasicRequest
    >({
      query: (data) => ({
        url: `${CG}/me/onboarding/basic`,
        method: 'PATCH',
        data,
      }),
      transformResponse: unwrap<ConsultantOnboardingResponse>,
      invalidatesTags: ['Career'],
    }),

    saveConsultantOnboardingProfessional: builder.mutation<
      ConsultantOnboardingResponse,
      SaveOnboardingProfessionalRequest
    >({
      query: (data) => ({
        url: `${CG}/me/onboarding/professional`,
        method: 'PATCH',
        data,
      }),
      transformResponse: unwrap<ConsultantOnboardingResponse>,
      invalidatesTags: ['Career'],
    }),

    saveConsultantOnboardingEducation: builder.mutation<
      ConsultantOnboardingResponse,
      SaveOnboardingEducationRequest
    >({
      query: (data) => ({
        url: `${CG}/me/onboarding/education`,
        method: 'PUT',
        data,
      }),
      transformResponse: unwrap<ConsultantOnboardingResponse>,
      invalidatesTags: ['Career'],
    }),

    saveConsultantOnboardingExperience: builder.mutation<
      ConsultantOnboardingResponse,
      SaveOnboardingExperienceRequest
    >({
      query: (data) => ({
        url: `${CG}/me/onboarding/work-experience`,
        method: 'PUT',
        data,
      }),
      transformResponse: unwrap<ConsultantOnboardingResponse>,
      invalidatesTags: ['Career'],
    }),

    saveConsultantOnboardingExpertise: builder.mutation<
      ConsultantOnboardingResponse,
      SaveOnboardingExpertiseRequest
    >({
      query: (data) => ({
        url: `${CG}/me/onboarding/expertise`,
        method: 'PATCH',
        data,
      }),
      transformResponse: unwrap<ConsultantOnboardingResponse>,
      invalidatesTags: ['Career'],
    }),

    createConsultantService: builder.mutation<ConsultantPrivateResponse, ConsultantServiceRequest>({
      query: (data) => ({
        url: `${CG}/me/services`,
        method: 'POST',
        data,
      }),
      transformResponse: unwrap<ConsultantPrivateResponse>,
      invalidatesTags: ['Career'],
    }),

    updateConsultantService: builder.mutation<
      ConsultantPrivateResponse,
      UpdateConsultantServiceRequest
    >({
      query: ({ serviceId, ...data }) => ({
        url: `${CG}/me/services/${encodeURIComponent(serviceId)}`,
        method: 'PUT',
        data,
      }),
      transformResponse: unwrap<ConsultantPrivateResponse>,
      invalidatesTags: ['Career'],
    }),

    deleteConsultantService: builder.mutation<
      ConsultantPrivateResponse,
      DeleteConsultantServiceRequest
    >({
      query: ({ serviceId, revision }) => ({
        url: `${CG}/me/services/${encodeURIComponent(serviceId)}`,
        method: 'DELETE',
        data: { revision },
      }),
      transformResponse: unwrap<ConsultantPrivateResponse>,
      invalidatesTags: ['Career'],
    }),

    getConsultantAvailability: builder.query<ConsultantAvailabilityResponse, void>({
      query: () => ({
        url: `${CG}/me/availability`,
        method: 'GET',
      }),
      transformResponse: unwrap<ConsultantAvailabilityResponse>,
      providesTags: ['Career'],
    }),

    saveConsultantAvailability: builder.mutation<
      ConsultantAvailabilityResponse,
      SaveConsultantAvailabilityRequest
    >({
      query: (data) => ({
        url: `${CG}/me/availability`,
        method: 'PUT',
        data,
      }),
      transformResponse: unwrap<ConsultantAvailabilityResponse>,
      invalidatesTags: ['Career'],
    }),
  }),
});

export const {
  useSubmitConsultantOnboardingMutation,
  useStartConsultantOnboardingMutation,
  useGetConsultantOnboardingQuery,
  useSaveConsultantOnboardingBasicMutation,
  useSaveConsultantOnboardingProfessionalMutation,
  useSaveConsultantOnboardingEducationMutation,
  useSaveConsultantOnboardingExperienceMutation,
  useSaveConsultantOnboardingExpertiseMutation,
  useCreateConsultantServiceMutation,
  useUpdateConsultantServiceMutation,
  useDeleteConsultantServiceMutation,
  useGetConsultantAvailabilityQuery,
  useSaveConsultantAvailabilityMutation,
} = onboardingApi;
