import type { EmploymentType, WorkplaceType } from '@/features/jobs/types/jobModels';

export enum AIApplyPlanTier {
  None = 0,
  Standard = 1,
  Pro = 2,
}
export enum AIApplyRuleType {
  MinimumSalary = 1,
  ExcludeNightShift,
  ExcludeRelocation,
  ExcludePreviouslyAppliedCompany,
  RequiredSkill,
  RequiredQualification,
  Custom,
}
export enum AIApplyRuleOperator {
  Equals = 1,
  NotEquals,
  GreaterThanOrEqual,
  LessThanOrEqual,
  Contains,
  NotContains,
}

export interface AIApplyAccess {
  subscriptionActive: boolean;
  subscriptionExpired: boolean;
  tier: AIApplyPlanTier;
  canUseAIApply: boolean;
  canUseAIApplyPro: boolean;
  planCode: string | null;
  subscriptionStatus: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  canUseStandardMembership: boolean;
  canUseAIGeneratedAnswers: boolean;
  canUseAdvancedMatching: boolean;
  canUseTailoredApplicationContent: boolean;
  processingPriority: number;
}
export interface AIApplyProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  currentLocation: string | null;
  preferredLocations: string[];
  linkedInUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  degree: string | null;
  university: string | null;
  graduationYear: number | null;
  totalExperience: number | null;
  skills: string[];
  certifications: string[];
  noticePeriod: string | null;
  currentSalary: number | null;
  expectedSalary: number | null;
  willingToRelocate: boolean | null;
  workAuthorization: string | null;
  visaSponsorshipPreference: string | null;
}
export interface UpdateAIApplyProfileRequest {
  githubUrl: string | null;
  willingToRelocate: boolean | null;
  workAuthorization: string | null;
  visaSponsorshipPreference: string | null;
}
export interface AIApplyPreferences {
  jobTitles: string[];
  skills: string[];
  minimumExperience: number | null;
  maximumExperience: number | null;
  preferredLocations: string[];
  workplaceTypes: WorkplaceType[];
  minimumSalary: number | null;
  maximumSalary: number | null;
  employmentTypes: EmploymentType[];
}
export type UpdateAIApplyPreferencesRequest = AIApplyPreferences;
export interface AIApplySettings {
  enabled: boolean;
  paused: boolean;
  preferredStartTime: string | null;
  timezone: string;
  preferredDays: number[];
  autoResumeApplications: boolean;
  allowAIGeneratedAnswers: boolean;
  requireConfirmationBeforeSubmit: boolean;
}
export type UpdateAIApplySettingsRequest = Omit<AIApplySettings, 'paused'>;
export interface AIApplyRule {
  id: string;
  ruleType: AIApplyRuleType;
  operator: AIApplyRuleOperator;
  value: string;
  isEnabled: boolean;
}
export type UpsertAIApplyRuleRequest = Omit<AIApplyRule, 'id'>;
export interface MembershipPlan {
  planCode: string;
  displayName: string;
  price: number;
  currency: string;
  durationDays: number;
  canUseStandardMembership: boolean;
  canUseAIApply: boolean;
  canUseAIApplyPro: boolean;
}
export interface AIApplyCheckoutOrder {
  paymentId: string;
  membershipId: string;
  providerOrderId: string;
  keyId: string;
  amountInMinorUnits: number;
  currencyCode: string;
  receipt: string;
  planName: string;
  durationDays: number;
  planCode: string;
}

export enum AIApplyRunStatus {
  Queued = 1,
  Processing,
  WaitingForUser,
  Submitted,
  Failed,
  Skipped,
  Expired,
  Cancelled,
  DeadLettered,
  NeedsReview,
}
export enum AIApplyFailureKind {
  None = 0,
  JobExpired,
  ApplicationUnavailable,
  LoginRequired,
  HumanVerificationRequired,
  WebsiteError,
  FieldMappingError,
  MissingUserInformation,
  Timeout,
  Duplicate,
  Unknown,
  RequiredUserDeclaration,
  SubmissionUnconfirmed,
  UnsupportedApplicationFlow,
  OperationalLimitExceeded,
}
export interface ExternalApplicationInfo {
  site: number;
  displayName: string;
  url: string;
  canOpen: boolean;
}
export interface AIApplyApplicationActions {
  canOpenExternalApplication: boolean;
  canContinue: boolean;
  canCancel: boolean;
  requiresCandidateAction: boolean;
}
export interface AIApplyApplication {
  id: string;
  jobId: string;
  status: AIApplyRunStatus;
  priority: number;
  scheduledAtUtc: string;
  startedAtUtc: string | null;
  completedAtUtc: string | null;
  retryCount: number;
  failureKind: AIApplyFailureKind;
  requiresUserInput: boolean;
  matchScore: number | null;
  createdAtUtc: string;
  externalApplication?: ExternalApplicationInfo | null;
  actions?: AIApplyApplicationActions | null;
  message?: string | null;
}
export interface AIApplyAnalytics {
  fromUtc: string;
  toUtc: string;
  totalApplications: number;
  submittedApplications: number;
  waitingApplications: number;
  failedApplications: number;
  skippedApplications: number;
  companiesReached: number;
  averageMatchScore: number;
  applicationsRequiringUserInput: number;
}
export interface AIApplyApplicationsQuery {
  fromUtc?: string;
  toUtc?: string;
}

export enum AIApplyQuestionStatus {
  Pending = 1,
  Answered,
  Skipped,
  Expired,
}
export enum AIApplyAnswerSource {
  UserVerified = 1,
  ProfileDerived,
  AIGenerated,
  Unknown,
}
export interface AIApplyQuestion {
  id: string;
  applicationId: string;
  question: string;
  questionType: string;
  suggestedAnswer: string | null;
  finalAnswer: string | null;
  status: AIApplyQuestionStatus;
  answeredAtUtc: string | null;
}
export interface AnswerAIApplyQuestionRequest {
  answer: string;
  saveToMemory: boolean;
}
export interface AIApplySavedAnswer {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  source: AIApplyAnswerSource;
  confidence: number;
  isVerified: boolean;
  isActive: boolean;
}
export interface UpdateAIApplyAnswerRequest {
  answer: string;
  isActive: boolean;
}

export enum ExternalJobSiteSessionStatus {
  Active = 1,
  Expired,
  Invalid,
  Revoked,
  RequiresReauthentication,
}
export enum ExternalSessionCaptureStatus {
  Starting = 1,
  AwaitingCandidate,
  Validating,
  Completed,
  Failed,
  Expired,
  Cancelled,
}
export enum ExternalSessionSite {
  Workday = 5,
  LinkedIn = 6,
  Naukri = 7,
  Indeed = 8,
  Foundit = 9,
  Wellfound = 10,
}
export interface ExternalSessionMetadata {
  id: string;
  site: ExternalSessionSite;
  status: ExternalJobSiteSessionStatus;
  expiresAtUtc: string;
  lastValidatedAtUtc: string | null;
  requiresReauthentication: boolean;
  canRevoke: boolean;
}
export interface ExternalSessionCapture {
  captureId: string;
  site: ExternalSessionSite;
  displayName: string;
  status: ExternalSessionCaptureStatus;
  expiresAtUtc: string;
  requiresCandidateAction: boolean;
  interactionAvailable: boolean;
  interactionMode: string;
  message: string;
}
export interface CompleteExternalSessionCaptureResponse {
  capture: ExternalSessionCapture;
  session: ExternalSessionMetadata | null;
}
