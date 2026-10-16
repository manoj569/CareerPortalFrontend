import type { PaginatedResponse } from '@/types';

export enum InterviewDifficulty {
  Easy = 'Easy',
  Moderate = 'Moderate',
  Hard = 'Hard',
}
export enum InterviewOutcome {
  Awaiting = 'Awaiting',
  Rejected = 'Rejected',
  Selected = 'Selected',
  Withdrawn = 'Withdrawn',
  PreferNotToSay = 'PreferNotToSay',
}
export enum InterviewInsightStatus {
  PendingReview = 'PendingReview',
  Published = 'Published',
  Rejected = 'Rejected',
  Hidden = 'Hidden',
}
export enum InterviewRoundType {
  HR = 'HR',
  Technical = 'Technical',
  Managerial = 'Managerial',
  Coding = 'Coding',
  Aptitude = 'Aptitude',
  GroupDiscussion = 'GroupDiscussion',
  Other = 'Other',
}
export enum InterviewFormat {
  Online = 'Online',
  InPerson = 'InPerson',
  Phone = 'Phone',
  Video = 'Video',
}
export enum InterviewTimeOfDay {
  Morning = 'Morning',
  Afternoon = 'Afternoon',
  Evening = 'Evening',
}
export enum InterviewPreparationStatus {
  NotStarted = 'NotStarted',
  Preparing = 'Preparing',
  Ready = 'Ready',
}
export enum InterviewInsightSort {
  MostHelpful = 'MostHelpful',
  Newest = 'Newest',
  MostRounds = 'MostRounds',
}
export enum InterviewScheduleStatus {
  Scheduled = 'Scheduled',
  InterviewCompleted = 'InterviewCompleted',
  Cancelled = 'Cancelled',
}
export enum InsightHelpfulness {
  Helped = 'Helped',
  PartlyHelped = 'PartlyHelped',
  DidNotHelp = 'DidNotHelp',
}
export enum InterviewMatch {
  Matched = 'Matched',
  PartlyMatched = 'PartlyMatched',
  DidNotMatch = 'DidNotMatch',
}
export enum InsightReportReason {
  ConfidentialContent = 'ConfidentialContent',
  Inaccurate = 'Inaccurate',
  Abuse = 'Abuse',
  Spam = 'Spam',
  PersonalData = 'PersonalData',
  Other = 'Other',
}
export enum InsightReportStatus {
  Open = 'Open',
  Reviewed = 'Reviewed',
  Actioned = 'Actioned',
  Dismissed = 'Dismissed',
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
  interviewFormat: InterviewFormat | null;
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
  interviewFormat: InterviewFormat | null;
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

export interface InterviewInsightCardResponse {
  id: string;
  companyId: string;
  companyName: string;
  roleTitle: string;
  interviewMonth: number;
  interviewYear: number;
  difficulty: InterviewDifficulty;
  outcome: InterviewOutcome | null;
  experienceLevel: string | null;
  interviewFormat: InterviewFormat | null;
  roundCount: number;
  roundTypes: InterviewRoundType[];
  topicTags: string[];
  shortSummary: string;
  helpfulConfirmedCount: number;
  canReadFull: boolean;
  canGiveFeedback: boolean;
  isAnonymous: boolean;
  authorLabel: string | null;
}

export interface InterviewInsightQuery {
  companyId?: string;
  company?: string;
  role?: string;
  roundType?: InterviewRoundType;
  difficulty?: InterviewDifficulty;
  experienceLevel?: string;
  outcome?: InterviewOutcome;
  interviewFormat?: InterviewFormat;
  fromMonth?: number;
  fromYear?: number;
  recencyMonths?: number;
  sort: InterviewInsightSort;
  pageNumber: number;
  pageSize: number;
}
export type InterviewInsightsPage = PaginatedResponse<InterviewInsightCardResponse>;
export interface InterviewInsightCompanyResponse {
  id: string;
  companyName: string;
}

export interface CreateInterviewScheduleRequest {
  companyId: string;
  jobId: string | null;
  roleTitle: string | null;
  interviewAtUtc: string;
  interviewFormat: InterviewFormat | null;
  approximateTimeOfDay: InterviewTimeOfDay | null;
  expectedRoundTypes: InterviewRoundType[];
  preparationStatus: InterviewPreparationStatus | null;
  reminderRequested: boolean;
  reminderOffsetMinutes: 15 | 30 | 60 | 1440;
  timeZoneId: string;
}
export interface UpdateInterviewScheduleRequest extends Omit<
  CreateInterviewScheduleRequest,
  'companyId' | 'jobId'
> {
  status: InterviewScheduleStatus;
}
export interface InterviewScheduleResponse extends CreateInterviewScheduleRequest {
  id: string;
  companyName: string;
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

export interface MyInterviewContributionCardResponse {
  id: string;
  companyName: string;
  roleTitle: string;
  interviewMonth: number;
  interviewYear: number;
  moderationStatus: InterviewInsightStatus;
  helpfulConfirmedCount: number;
  contributionPoints: number;
  updatedAt: string;
  reviewerChangeRequest: string | null;
}
export interface MyInterviewContributionsResponse {
  careerHarborPoints?: number;
  insightsPublished: number;
  candidatesHelped: number;
  contributionScore: number;
  badges: string[];
  pendingReview: number;
  needsChanges: number;
  items: MyInterviewContributionCardResponse[];
}
export interface CompanyInterviewInsightSummaryResponse {
  companyId: string;
  companyName: string;
  publishedCount: number;
  helpfulConfirmedCount: number;
  canReadFull: boolean;
}
