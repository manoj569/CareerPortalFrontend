export interface PublicReferralJob {
  jobId: string;
  jobTitle: string;
  companyName: string;
  location: string | null;
  referrerName: string;
  referralId?: string | null;
  referralApprovedAtUtc?: string | null;
  matchScore?: number | null;
  matchReasons?: string[];
  isResumeMatch?: boolean | null;
}
export interface ReferralCategoryOption { id: string; name: string; slug?: string; }

export type JobReferralApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface JobReferralSubmission {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  location: string | null;
  referrerUserId: string;
  referrerName: string;
  sourceUrl: string | null;
  showLinkedIn: boolean;
  showEmail: boolean;
  showPhone: boolean;
  approvalStatus: JobReferralApprovalStatus;
  rejectionReason: string | null;
  createdAtUtc: string;
  reviewedAtUtc: string | null;
  approvedAtUtc: string | null;
}

export interface ExtractedJobDetails {
  title: string | null;
  companyName: string | null;
  location: string | null;
  description: string | null;
  minimumSalary: number | null;
  maximumSalary: number | null;
  minimumExperienceYears: number | null;
  maximumExperienceYears: number | null;
  succeeded: boolean;
  failureReason: string | null;
}

export type ReferralUnlockStatus = 'Granted' | 'LoginRequired' | 'MembershipRequired';

export interface ReferrerContactDetails {
  referrerName: string;
  linkedInUrl: string | null;
  email: string | null;
  phoneNumber: string | null;
}

export interface ReferralUnlockResult {
  status: ReferralUnlockStatus;
  message: string;
  contact: ReferrerContactDetails | null;
}

/** Mirrors the backend's ComposeRelationRequest<T> shape. */
export interface ComposeRelation<TNew> {
  existingId?: string | null;
  new?: TNew | null;
}

export interface InlineCompany {
  name: string;
  slug?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  industry?: string | null;
  location?: string | null;
  employeeCount?: number | null;
  isVerified?: boolean;
}

export interface InlineCategory {
  name: string;
  slug?: string | null;
  description?: string | null;
  displayOrder?: number;
  parentCategoryId?: string | null;
}

/** Mirrors the backend's ComposeJobDraftRequest shape exactly. */
export interface ComposeJobDraft {
  title: string;
  description?: string | null;
  applicationUrl?: string | null;
  employmentType?: string | null;
  workplaceType?: string | null;
  experienceLevel?: string | null;
  location?: string | null;
  minimumSalary?: number | null;
  maximumSalary?: number | null;
  currencyCode?: string | null;
  expiresAtUtc?: string | null;
  responsibilities?: string | null;
  requirements?: string | null;
  benefits?: string | null;
}

export interface SubmitJobReferralRequest {
  jobDetails: {
    job: ComposeJobDraft;
    company: ComposeRelation<InlineCompany>;
    category: ComposeRelation<InlineCategory>;
    recruiterContact?: {
      showLinkedIn: boolean;
      showEmail: boolean;
      showPhone: boolean;
      overrideLinkedInUrl?: string | null;
      overrideEmail?: string | null;
      overridePhoneNumber?: string | null;
      referrerRole?: string | null;
      personalNote?: string | null;
    };
  };
  sourceUrl?: string | null;
  showLinkedIn: boolean;
  showEmail: boolean;
  showPhone: boolean;
  overrideLinkedInUrl?: string | null;
  overrideEmail?: string | null;
  overridePhoneNumber?: string | null;
  referrerRole?: string | null;
  personalNote?: string | null;
}
