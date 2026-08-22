import type { PaginatedResponse } from '@/types';

export enum InterviewDifficulty {
  Easy = 1,
  Moderate,
  Hard,
}

export enum InterviewOutcome {
  Awaiting = 1,
  Rejected,
  Selected,
  Withdrawn,
  PreferNotToSay,
}

export enum InterviewInsightStatus {
  PendingReview = 1,
  Published,
  Rejected,
  Hidden,
}

export enum InterviewRoundType {
  HR = 1,
  Technical,
  Managerial,
  Coding,
  Aptitude,
  GroupDiscussion,
  Other,
}

export enum InterviewScheduleStatus {
  Scheduled = 1,
  InterviewCompleted,
  Cancelled,
}

export enum InsightHelpfulness {
  Helped = 1,
  PartlyHelped,
  DidNotHelp,
}

export enum InterviewMatch {
  Matched = 1,
  PartlyMatched,
  DidNotMatch,
}

export enum InsightReportReason {
  ConfidentialContent = 1,
  Inaccurate,
  Abuse,
  Spam,
  PersonalData,
  Other,
}

export enum InsightReportStatus {
  Open = 1,
  Reviewed,
  Actioned,
  Dismissed,
}

export interface InterviewRoundRequest {
  roundType: InterviewRoundType;
  roundTitle: string | null;
  durationMinutes: number | null;
  questionsOrTopics: string;
  candidateAdvice: string | null;
}

export interface CreateInterviewInsightRequest {
  companyId: string;
  jobId: string | null;
  roleTitle: string;
  experienceLevel: string | null;
  interviewDateMonth: string;
  overallDifficulty: InterviewDifficulty;
  processSummary: string;
  preparationTips: string;
  outcome: InterviewOutcome | null;
  isAnonymous: boolean;
  contentGuidelinesAccepted: boolean;
  rounds: InterviewRoundRequest[];
}

export type UpdateInterviewInsightRequest = Omit<
  CreateInterviewInsightRequest,
  'companyId' | 'jobId'
>;

export interface InterviewRoundResponse extends InterviewRoundRequest {
  id: string;
  sequence: number;
}

export interface InterviewInsightResponse {
  id: string;
  companyId: string;
  companyName: string;
  companyLogoUrl: string | null;
  jobId: string | null;
  roleTitle: string;
  experienceLevel: string | null;
  interviewMonth: number;
  interviewYear: number;
  overallDifficulty: InterviewDifficulty;
  processSummary: string;
  preparationTips: string | null;
  outcome: InterviewOutcome | null;
  isAnonymous: boolean;
  authorDisplayName: string | null;
  status: InterviewInsightStatus;
  publishedAtUtc: string | null;
  roundCount: number;
  helpfulConfirmedCount: number;
  qualityScore: number;
  canReadFull: boolean;
  canGiveFeedback: boolean;
  rounds: InterviewRoundResponse[];
}

export interface InterviewInsightQuery {
  companyId?: string;
  role?: string;
  roundType?: InterviewRoundType;
  difficulty?: InterviewDifficulty;
  sort?: 'mostHelpful' | 'newest';
  pageNumber: number;
  pageSize: number;
}

export type InterviewInsightsPage = PaginatedResponse<InterviewInsightResponse>;

export interface CreateInterviewScheduleRequest {
  companyId: string;
  jobId: string | null;
  roleTitle: string | null;
  interviewAtUtc: string;
}

export interface UpdateInterviewScheduleRequest {
  roleTitle: string | null;
  interviewAtUtc: string;
  status: InterviewScheduleStatus;
}

export interface InterviewScheduleResponse {
  id: string;
  companyId: string;
  companyName: string;
  jobId: string | null;
  roleTitle: string | null;
  interviewAtUtc: string;
  status: InterviewScheduleStatus;
  confirmFeedbackAvailableAtUtc: string;
  feedbackAvailable: boolean;
}

export interface CreateInsightFeedbackRequest {
  candidateInterviewScheduleId: string;
  helpfulness: InsightHelpfulness;
  interviewMatch: InterviewMatch;
  feedback: string | null;
}

export interface InsightFeedbackResponse {
  id: string;
  helpfulness: InsightHelpfulness;
  interviewMatch: InterviewMatch;
  createdAtUtc: string;
  helpfulConfirmedCount: number;
  qualityScore: number;
}

export interface CreateInsightReportRequest {
  reason: InsightReportReason;
  details: string | null;
}

export interface InsightReportResponse {
  id: string;
  status: InsightReportStatus;
  createdAtUtc: string;
}

export interface MyInterviewContributionsResponse {
  insightsPublished: number;
  candidatesHelped: number;
  contributionScore: number;
  badges: string[];
}

export interface CompanyInterviewInsightSummaryResponse {
  companyId: string;
  companyName: string;
  publishedCount: number;
  helpfulConfirmedCount: number;
  canReadFull: boolean;
}
