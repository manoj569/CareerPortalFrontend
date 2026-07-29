import type { EmploymentType } from '@/features/jobs/types/jobModels';
import type { PaginatedResponse } from '@/types';

export interface ResumeMetadata {
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAtUtc: string;
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
}

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
}

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
}

export interface ApplicationsQuery extends DashboardQuery {
  status?: JobApplicationStatus;
}

export interface CreateJobApplicationRequest {
  jobId: string;
  coverLetter: string | null;
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
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export type SavedJobsPage = PaginatedResponse<SavedJob>;
export type UserProfile = CandidateProfile;
export type ApplicationsPage = PaginatedResponse<JobApplication>;
