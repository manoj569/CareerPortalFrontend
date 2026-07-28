import type { PublicJobSummary } from '@/features/jobs/types/jobModels';
import type { PaginatedResponse } from '@/types';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  profileImageUrl: string | null;
  headline: string | null;
  bio: string | null;
  emailConfirmed: boolean;
  createdAtUtc: string;
  lastLoginAtUtc: string | null;
}

export interface UpdateUserProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  profileImageUrl: string | null;
  headline: string | null;
  bio: string | null;
}

export interface DashboardQuery {
  pageNumber: number;
  pageSize: number;
}

export interface SavedJob {
  savedJobId: string;
  savedAtUtc: string;
  job: PublicJobSummary;
}

export enum JobHistoryAction {
  Viewed = 1,
  Saved,
  Applied,
  Withdrawn,
  Rejected,
  Shortlisted,
  Hired,
}

export interface AppliedJobHistory {
  id: string;
  jobId: string;
  jobTitle: string;
  jobSlug: string;
  companyName: string;
  action: JobHistoryAction;
  occurredAtUtc: string;
  notes: string | null;
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
  companyId: string;
  companyName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export type SavedJobsPage = PaginatedResponse<SavedJob>;
export type ApplicationsPage = PaginatedResponse<AppliedJobHistory>;
