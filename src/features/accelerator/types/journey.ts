import type { AcceleratorEntitlementResponse } from '../api/acceleratorApi';

export enum NextAction {
  Unavailable,
  EnrollLearningPath,
  StartAssessment,
  ResumeAssessment,
  GenerateRoadmap,
  ContinueLearning,
  StartPractice,
  StartProject,
  ContinueProject,
  StartInterview,
  ContinueInterview,
  ViewInterviewReport,
  ViewJobs,
  ViewApplications,
}

export interface JourneySummary {
  title: string;
  learningPathId: string | null;
  enrollmentId: string | null;
  assessmentConfigured: boolean;
  questionsAvailable: boolean;
  activeAssessmentId: string | null;
  completedAssessments: number;
  completedLessons: number;
  totalLessons: number;
  completedActivities: number;
  totalActivities: number;
  practiceSessions: number;
  practiceEvaluations: number;
  projects: number;
  completedProjects: number;
  activeProjectId: string | null;
  eligibleProjects: number;
  interviews: number;
  completedInterviews: number;
  activeInterviewId: string | null;
  latestReportId: string | null;
  eligibleInterviews: number;
  readiness: number;
  estimatedMinutesRemaining: number | null;
  relevantJobCount: number | null;
  applicationCount: number;
  savedJobCount: number;
  hasResume: boolean;
  practiceAvailable: boolean;
  roadmapId: string | null;
  roadmapStatus: number | null;
  assessmentStatus: number | null;
}

export interface AcceleratorJourneyResponse {
  state: string;
  policyVersion: string;
  journeyContextId: string | null;
  goalId: string | null;
  learningPathId: string | null;
  enrollmentId: string | null;
  title: string | null;
  entitlement: AcceleratorEntitlementResponse;
  summary: JourneySummary | null;
  roadmapId: string | null;
  overallProgressPercent: number | null;
  estimatedMinutesRemaining: number | null;
  currentPhase: string | null;
  nextAction: NextAction;
  nextResourceId: string | null;
  checklist: { code: string; complete: boolean }[];
  phases: {
    code: string;
    unlocked: boolean;
    complete: boolean;
    progressPercent?: number | null;
    progressBasis?: string;
  }[];
  phaseProgressPolicyVersion?: string;
  assessment?: {
    attemptId: string | null;
    status: number | null;
    revision: string | null;
    startedAtUtc: string | null;
    expiresAtUtc: string | null;
    questionCount: number;
    answeredQuestionCount: number;
    canResume: boolean;
    canStart: boolean;
  } | null;
  roadmapStatus: number | null;
  assessmentStatus: number | null;
}
