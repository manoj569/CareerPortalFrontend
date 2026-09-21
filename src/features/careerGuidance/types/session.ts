// Generated from inspected SessionContracts.cs positional DTOs; dates are ISO strings.
import type { CareerSessionStatus } from './enums';

export interface CareerSessionAction {
  revision: string;
}

export interface CareerManualMeetingRequest {
  revision: string;
  participantUrl: string;
  hostUrl: string | null;
}

export interface CareerSessionResponse {
  id: string;
  bookingId: string;
  candidateUserId: string;
  consultantId: string;
  meetingProvider: string;
  providerMeetingId: string | null;
  scheduledStartUtc: string;
  scheduledEndUtc: string;
  status: CareerSessionStatus;
  startedAtUtc: string | null;
  completedAtUtc: string | null;
  consultantNoShowReportedAtUtc: string | null;
  meetingCreatedAtUtc: string | null;
  meetingConfigured: boolean;
  revision: string;
  candidateJoinedAtUtc: string | null;
  consultantJoinedAtUtc: string | null;
  candidateNoShowMarkedAtUtc: string | null;
  consultantNoShowMarkedAtUtc: string | null;
  meetingProvisioningAttemptedAtUtc: string;
  earningReleaseDelayHours: number;
}

export interface CareerSessionJoinResponse {
  session: CareerSessionResponse;
  joinUrl: string | null;
  withheldReason: string | null;
}
