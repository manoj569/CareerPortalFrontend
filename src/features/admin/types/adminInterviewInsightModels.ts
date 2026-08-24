import type { PaginatedResponse } from '@/types';
import type {
  InsightReportReason,
  InsightReportStatus,
  InterviewInsightStatus,
  InterviewInsightResponse,
} from '@/features/interviewInsights/types/interviewInsightModels';

export interface AdminInterviewInsightQuery {
  status?: InterviewInsightStatus;
  pageNumber: number;
  pageSize: number;
}

export interface ModerateInterviewInsightRequest {
  status:
    | InterviewInsightStatus.Published
    | InterviewInsightStatus.Rejected
    | InterviewInsightStatus.Hidden;
  reason: string | null;
}

export type AdminInterviewInsightsPage = PaginatedResponse<InterviewInsightResponse>;

export interface AdminInsightReportQuery {
  status?: InsightReportStatus;
  pageNumber: number;
  pageSize: number;
}

export interface AdminInsightReportResponse {
  id: string;
  insightId: string;
  reason: InsightReportReason;
  details: string | null;
  status: InsightReportStatus;
  createdAtUtc: string;
}

export interface ModerateInsightReportRequest {
  status:
    | InsightReportStatus.Reviewed
    | InsightReportStatus.Actioned
    | InsightReportStatus.Dismissed;
}

export type AdminInsightReportsPage = PaginatedResponse<AdminInsightReportResponse>;
