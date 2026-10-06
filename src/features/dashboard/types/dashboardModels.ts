import type { EmploymentType, ExperienceLevel, WorkplaceType } from '@/features/jobs/types/jobModels';
import type { PaginatedResponse } from '@/types';

export interface ResumeMetadata {
  /** Persistent CandidateResumeProfile.Id used by AI Resume sessions. */
  resumeId?: string | null;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAtUtc: string;
}

export enum ResumeExtractionStatus {
  NotStarted = 0,
  Processing,
  Ready,
  Failed,
}

export interface ResumeStatusResponse {
  extractedAtUtc: string | null;
  extractionStatus: ResumeExtractionStatus;
  hasResume: boolean;
  message: string;
  /** Persistent CandidateResumeProfile.Id when a resume is available. */
  resumeId?: string | null;
}

export interface RecommendedJob {
  categoryId: string;
  categoryName: string;
  companyId: string;
  companyLogoUrl: string | null;
  companyName: string;
  companySlug: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  expiresAtUtc: string | null;
  id: string;
  isFeatured: boolean;
  location: string | null;
  matchReasons: string[];
  matchScore: number;
  publishedAtUtc: string;
  referenceNumber: string;
  slug: string;
  title: string;
  workplaceType: WorkplaceType;
}

export interface RecommendedJobsResponse {
  extractionStatus: ResumeExtractionStatus;
  items: RecommendedJob[];
  message: string;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CandidateProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  skills: string[];
  education: string[];
  experience: string[];
  linkedInUrl: string | null;
  portfolioUrl: string | null;
  preferredJobTypes: EmploymentType[];
  resume: ResumeMetadata | null;
  phoneNumber?: string | null;
  hasProfilePhoto?: boolean;
  profilePhotoVersion?: string | null;
  basicDetails?: CandidateBasicDetails | null;
  careerPreferences?: CandidateCareerPreferences | null;
  totalExperienceYears?: number;
  mobileNumber?: string | null;
  mobileVerified?: boolean;
}

export type CandidateWorkStatus = 'Fresher' | 'Experienced';
export type CandidateNoticePeriod = 'ImmediateJoiner' | 'FifteenDaysOrLess' | 'OneMonth' | 'ThreeMonths' | 'Other';
export enum CandidateAvailability {
  FifteenDaysOrLess = 1,
  OneMonth,
  TwoMonths,
  ThreeMonths,
  MoreThanThreeMonths,
  ServingNoticePeriod,
}
export type CandidateJobType = 'Permanent' | 'Contractual';
export type CandidateEmploymentPreference = 'FullTime' | 'PartTime';
export type CandidateShiftPreference = 'Day' | 'Night' | 'Flexible';
export interface CandidateBasicDetails { email: string; mobileNumber: string | null; mobileVerified: boolean; resumeHeadline?: string | null; skills?: string[]; workStatus: CandidateWorkStatus | null; isOutsideIndia: boolean | null; currentCountry: string | null; currentCity: string | null; currentArea: string | null; noticePeriod?: CandidateNoticePeriod | null; availabilityToJoin: CandidateAvailability | null; currentAnnualSalary: number | null; currentFixedAnnualSalary: number | null; currentVariableAnnualSalary: number | null; salaryUnit: string; }
export interface UpdateCandidateBasicDetailsRequest { resumeHeadline?: string | null; skills?: string[]; workStatus?: CandidateWorkStatus; isOutsideIndia?: boolean; currentCountry?: string; currentCity?: string; currentArea?: string | null; noticePeriod?: CandidateNoticePeriod | null; availabilityToJoin?: CandidateAvailability | null; currentAnnualSalary?: number | null; currentFixedAnnualSalary?: number | null; currentVariableAnnualSalary?: number | null; mobileNumber?: string | null; }
export interface CandidateCareerPreferences { preferredJobRoles: string[]; preferredCities: string[]; expectedAnnualSalary: number | null; jobTypes: CandidateJobType[]; employmentTypes: CandidateEmploymentPreference[]; preferredShifts: CandidateShiftPreference[]; salaryUnit: string; }
export interface UpdateCandidateCareerPreferencesRequest { preferredJobRoles: string[]; preferredCities: string[]; expectedAnnualSalary: number | null; jobTypes: CandidateJobType[]; employmentTypes: CandidateEmploymentPreference[]; preferredShifts: CandidateShiftPreference[]; }
export interface ProfilePhotoMetadata { hasProfilePhoto: boolean; version: string | null; }

export interface UpdateCandidateProfileRequest {
  headline: string | null;
  bio: string | null;
  location: string | null;
  skills: string[];
  education: string[];
  experience: string[];
  linkedInUrl: string | null;
  portfolioUrl: string | null;
  preferredJobTypes: EmploymentType[];
}

export interface CandidateAboutResponse {
  profileSummary: string | null;
  resumeHeadline: string | null;
}

export interface UpdateCandidateAboutRequest {
  profileSummary: string | null;
  resumeHeadline: string | null;
}

export type CandidateSkillProficiency = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface CandidateSkill {
  createdAtUtc: string;
  id: string;
  name: string;
  proficiency: CandidateSkillProficiency | null;
  updatedAtUtc: string | null;
  yearsOfExperience: number | null;
}

export interface UpsertCandidateSkillRequest {
  name: string;
  proficiency: CandidateSkillProficiency | null;
  yearsOfExperience: number | null;
}

export interface ProfileSectionCompletion {
  isCompleted: boolean;
  section: string;
  weight: number;
}
export type ProfileCompletionStep = 'BasicDetails' | 'Skills' | 'CareerPreferences' | 'Education' | 'Employment' | 'Resume' | 'ProfileSummary';

export interface CandidateProfileCompletion {
  completedSections: string[];
  completionPercentage: number;
  missingSections: string[];
  sections: ProfileSectionCompletion[];
  nextRecommendedIncompleteStep?: ProfileCompletionStep | null;
}

export enum CareerStage {
  Student = 1,
  Fresher,
  Experienced,
}

export enum DesiredOpportunity {
  Internship = 1,
  FresherJob,
  ExperiencedJob,
}

export enum WorkPreference {
  Remote = 1,
  Hybrid,
  OnSite,
}

export interface CandidateOnboarding {
  careerStage: CareerStage | null;
  desiredOpportunities: DesiredOpportunity[];
  city: string | null;
  skills: string[];
  workPreferences: WorkPreference[];
  college: string | null;
  degree: string | null;
  graduationYear: number | null;
  yearsOfExperience: number | null;
  completedAtUtc: string | null;
}

export interface UpdateCandidateOnboardingRequest {
  careerStage: CareerStage;
  desiredOpportunities: DesiredOpportunity[];
  city: string;
  skills: string[];
  workPreferences: WorkPreference[];
  college: string | null;
  degree: string | null;
  graduationYear: number | null;
  yearsOfExperience: number | null;
}

export interface DashboardQuery {
  pageNumber: number;
  pageSize: number;
}

export interface SavedJob {
  savedJobId: string;
  savedAtUtc: string;
  jobId: string;
  title: string;
  slug: string;
  companyName: string;
}

export enum JobApplicationStatus {
  Submitted = 1,
  Reviewed,
  Shortlisted,
  Rejected,
  Withdrawn,
  ExternalApplicationStarted,
}

export type ApplicationMethod = 'Portal' | 'External';

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  jobSlug: string;
  companyName: string;
  status: JobApplicationStatus;
  coverLetter: string | null;
  resumeFileName: string | null;
  submittedAtUtc: string;
  withdrawnAtUtc: string | null;
  applicationMethod: ApplicationMethod;
  categoryName: string | null;
  location: string | null;
  employmentType: EmploymentType | null;
  workMode: WorkplaceType | null;
  experienceLevel: ExperienceLevel | null;
  applicationUrl: string | null;
  closingDate: string | null;
}

export interface ApplicationsQuery extends DashboardQuery {
  status?: JobApplicationStatus;
}

export interface CreateJobApplicationRequest {
  jobId: string;
  applicationMethod: ApplicationMethod;
}

export interface ApplyJobResponse {
  applicationId: string;
  jobId: string;
  applicationStatus: JobApplicationStatus;
  applicationMethod: ApplicationMethod;
  appliedAtUtc: string;
}

export enum NotificationType {
  General = 1,
  Job,
  Application,
  Payment,
  Membership,
  Security,
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  actionUrl: string | null;
  isRead: boolean;
  readAtUtc: string | null;
  createdAtUtc: string;
}

export interface NotificationPage {
  page: PaginatedResponse<DashboardNotification>;
  unreadCount: number;
}

export enum MembershipStatus {
  Pending = 1,
  Active,
  Suspended,
  Cancelled,
  Expired,
}

export interface Membership {
  id: string;
  planName: string;
  status: MembershipStatus;
  startsAtUtc: string;
  endsAtUtc: string | null;
  autoRenew: boolean;
  planCode?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ApplicationQuota {
  plan: string;
  isPremium: boolean;
  limit: number;
  usedApplications: number;
  remainingApplications: number;
  resetsAtUtc: string;
}

export type SavedJobsPage = PaginatedResponse<SavedJob>;
export type UserProfile = CandidateProfile;
export type ApplicationsPage = PaginatedResponse<JobApplication>;
