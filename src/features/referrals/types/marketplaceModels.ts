export type ReferralRequestStatus =
  'Requested' | 'Accepted' | 'Rejected' | 'Expired' | 'ReferralSubmitted' | 'CandidateConfirmed';
export interface ReferralRequestRecord {
  id: string;
  referralId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  referrerLabel: string;
  status: ReferralRequestStatus | number;
  requestedAtUtc: string;
  expiresAtUtc: string;
  acceptedAtUtc: string | null;
  rejectedAtUtc: string | null;
  expiredAtUtc: string | null;
  referralSubmittedAtUtc: string | null;
  candidateConfirmedAtUtc: string | null;
  notReceivedAtUtc: string | null;
  candidateMessage: string | null;
  canViewContact: boolean;
}
export interface ReferrerRequestRecord {
  request: ReferralRequestRecord;
  candidate: {
    displayName: string;
    yearsOfExperience: number | null;
    skills: string[];
    currentCompany: string | null;
    location: string | null;
    availability: string | null;
    resumeAvailable: boolean;
  };
  rejectionReason: string | null;
  referralSubmissionReference: string | null;
}
export interface ReferralMetrics {
  jobsPosted: number;
  requestsReceived: number;
  requestsAccepted: number;
  referralsSubmitted: number;
  candidateConfirmedReferrals: number;
  completionRate: number;
}
export interface ReferralQuota {
  limit: number;
  acceptedConnections: number;
  remainingConnections: number;
  periodStartUtc: string | null;
  periodEndUtc: string | null;
  hasActiveAccess: boolean;
}
export const requestStatus = (value: ReferralRequestStatus | number): ReferralRequestStatus =>
  typeof value === 'number'
    ? (
        {
          1: 'Requested',
          2: 'Accepted',
          3: 'Rejected',
          4: 'Expired',
          5: 'ReferralSubmitted',
          6: 'CandidateConfirmed',
        } as Record<number, ReferralRequestStatus>
      )[value]!
    : value;
export const statusLabel = (value: ReferralRequestStatus | number) =>
  ({
    Requested: 'Pending',
    Accepted: 'Accepted',
    Rejected: 'Rejected',
    Expired: 'Expired',
    ReferralSubmitted: 'Submitted',
    CandidateConfirmed: 'Confirmed',
  })[requestStatus(value)] ?? 'Status unavailable';
export const approvalStatus = (value: string | number) =>
  (({ 1: 'Pending', 2: 'Approved', 3: 'Rejected' }) as Record<string, string>)[String(value)] ??
  String(value);
export const referralError = (error: unknown) => {
  const value = error as { message?: string; status?: number; code?: string };
  return (
    value?.message ||
    (
      {
        401: 'Please sign in again.',
        403: 'You do not have access to this referral.',
        404: 'This referral is unavailable.',
        409: 'The referral changed. Review the refreshed status before trying again.',
      } as Record<number, string>
    )[value?.status ?? 0] ||
    'Unable to load the referral. Check your connection and retry.'
  );
};
export const validSlots = (value: number) => Number.isInteger(value) && value >= 1 && value <= 1000;
export const requestPath = (id: string) => `/dashboard/referral-requests/${encodeURIComponent(id)}`;
export const opportunityPath = (id: string) =>
  `/dashboard/referrals/${encodeURIComponent(id)}/requests`;

export const dateLabel = (value: string) =>
  new Date(value).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
