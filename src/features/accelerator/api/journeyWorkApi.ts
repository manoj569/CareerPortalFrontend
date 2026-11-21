import { apiClient } from '@/api/apiClient';

import type { AcceleratorJourneyResponse } from '../types/journey';
import type { ApiResponse } from '../types/marketIntelligence';

const base = '/accelerator/v1';
export const emptyGuid = '00000000-0000-0000-0000-000000000000';
const id = encodeURIComponent;

async function read<T>(path: string, params?: object) {
  const { data } = await apiClient.get<ApiResponse<T>>(base + path, { params });
  return data.data;
}

async function post<T>(path: string, payload?: object) {
  const { data } = await apiClient.post<ApiResponse<T>>(base + path, payload);
  return data.data;
}

export interface AssessmentQuestion {
  isAnswered?: boolean;
  submittedAnswerJson?: string | null;
  answerIsImmutable?: boolean;
  id: string;
  sequence: number;
  prompt: string;
  optionsJson: string;
  type: number;
  difficulty: number;
}
export interface AssessmentAttempt {
  startedAtUtc?: string | null;
  journeyContextId?: string | null;
  canResume?: boolean;
  id: string;
  goalId: string | null;
  status: number;
  revision: string;
  expiresAtUtc: string;
  score: number | null;
  questions: AssessmentQuestion[];
}
export interface SkillGap {
  competencyId: string;
  skillName: string;
  current: number;
  required: number;
  gap: number;
  confidence: number;
}
export interface LearningActivity {
  id: string;
  roadmapNodeId: string;
  title: string;
  estimatedMinutes: number;
  scheduledAtUtc: string;
  status: number;
  revision: string;
}
export interface Roadmap {
  id: string;
  goalId: string | null;
  version: number;
  status: number;
  targetAtUtc: string;
  estimatedMinutes: number;
  explanation: string;
  timelineFeasible: boolean;
  nodes: {
    id: string;
    competencyId: string;
    stableKey: string;
    sequence: number;
    status: number;
    estimatedMinutes: number;
    progressPercent: number;
  }[];
  edges: { fromNodeId: string; toNodeId: string }[];
  schedule: LearningActivity[];
}
interface Enrollment {
  id: string;
  pathSlug: string;
  currentModuleId: string | null;
  currentLessonId: string | null;
  overallProgressPercent: number;
}
interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  progressStatus: number;
  estimatedMinutes: number;
}
interface Module {
  id: string;
  title: string;
  description: string;
  progressPercent: number;
  lessons: Lesson[];
}
type Scope = Pick<AcceleratorJourneyResponse, 'goalId' | 'enrollmentId'>;

export const startBaselineAssessment = (enrollmentId: string, requestKey: string) =>
  post<AssessmentAttempt>(`/enrollments/${id(enrollmentId)}/assessments/Baseline`, { requestKey });
export const startResolvedAssessment = (journeyContextId: string, requestKey: string) =>
  post<AssessmentAttempt>(`/journeys/${id(journeyContextId)}/assessments`, { requestKey });
export const getAssessmentAttempt = (attemptId: string) =>
  read<AssessmentAttempt>(`/assessments/${id(attemptId)}`);
export const getCurrentAssessment = (journeyContextId: string) =>
  read<AssessmentAttempt | null>(`/journeys/${id(journeyContextId)}/assessments/current`);
export async function saveAssessmentAnswer(
  attemptId: string,
  questionId: string,
  answerJson: string,
) {
  const { data } = await apiClient.put<ApiResponse<AssessmentAttempt>>(
    `${base}/assessments/${id(attemptId)}/answers`,
    { questionId, answerJson },
  );
  return data.data;
}
export const finalizeAssessment = (attemptId: string, expectedRevision: string) =>
  post<AssessmentAttempt>(`/assessments/${id(attemptId)}/finalize`, { expectedRevision });
export const getSkillGaps = ({ goalId, enrollmentId }: Scope) =>
  read<SkillGap[]>(
    enrollmentId
      ? `/enrollments/${id(enrollmentId)}/gaps`
      : `/career-goals/${id(goalId ?? emptyGuid)}/gaps`,
  );

export const generateRoadmap = ({ goalId, enrollmentId }: Scope, requestKey: string) =>
  enrollmentId
    ? post<Roadmap>(`/enrollments/${id(enrollmentId)}/roadmaps`, { requestKey })
    : post<Roadmap>('/roadmaps', { requestKey, goalId });
export const getRoadmap = (roadmapId: string) => read<Roadmap>(`/roadmaps/${id(roadmapId)}`);
export const recordActivityProgress = (
  activity: LearningActivity,
  kind: 1 | 2,
  requestKey: string,
) =>
  post<LearningActivity>(`/learning-activities/${id(activity.id)}/progress`, {
    requestKey,
    kind,
    evidenceJson: '{}',
    expectedRevision: activity.revision,
  });
export const getEnrollment = (enrollmentId: string) =>
  read<Enrollment>(`/enrollments/${id(enrollmentId)}`);
export const getLearningPath = (slug: string) =>
  read<{ modules: Module[] }>(`/learning-paths/${id(slug)}`);
const lessonPath = (enrollmentId: string, moduleId: string, lessonId: string) =>
  `/enrollments/${id(enrollmentId)}/modules/${id(moduleId)}/lessons/${id(lessonId)}`;
export const getLesson = (enrollmentId: string, moduleId: string, lessonId: string) =>
  read<Lesson>(lessonPath(enrollmentId, moduleId, lessonId));
export const updateLesson = (
  enrollmentId: string,
  moduleId: string,
  lessonId: string,
  action: 'start' | 'complete',
  requestKey: string,
) => post<Enrollment>(`${lessonPath(enrollmentId, moduleId, lessonId)}/${action}`, { requestKey });

const enrollmentRoute = (enrollmentId: string) => `/learning/enrollments/${id(enrollmentId)}`;
const scopeBody = ({ goalId, enrollmentId }: Scope) => ({
  goalId: goalId ?? emptyGuid,
  enrollmentId,
});

interface Project {
  id: string;
  projectVersionId: string;
  progressPercent: number;
  revision: string;
  journeyContextId: string | null;
}
interface Submission {
  id: string;
  assignmentId: string;
  attemptNumber: number;
}
interface Feedback {
  score: number;
  feedback: string;
}
interface ProjectDetail {
  title: string;
  shortDescription: string;
  businessContext: string;
  instructions: string;
  milestones: {
    id: string;
    title: string;
    description: string;
    assignments: { id: string; prompt: string; maximumAttempts: number }[];
  }[];
}
const projectRoute = (projectId: string) => `/projects/mine/${id(projectId)}`;
export const projectRecommendations = ({ enrollmentId, goalId }: Scope) =>
  read<{ projectVersionId: string; title: string; reason: string }[]>(
    enrollmentId
      ? `${enrollmentRoute(enrollmentId)}/projects/recommended`
      : '/projects/recommended',
    enrollmentId ? undefined : { goalId },
  );
export const projectHistory = (journeyContextId: string) =>
  read<Project[]>('/projects/mine', { journeyContextId });
export const projectDetail = (versionId: string) =>
  read<ProjectDetail>(`/projects/${id(versionId)}`);
export const startProject = (scope: Scope, projectVersionId: string, requestKey: string) =>
  post<Project>(`/projects/${id(projectVersionId)}/start`, {
    ...scopeBody(scope),
    projectVersionId,
    requestKey,
  });
export const projectWorkspace = async (projectId: string) => {
  const basePath = projectRoute(projectId);
  const [project, detail, progress, history] = await Promise.all([
    read<Project>(basePath),
    read<ProjectDetail>(`${basePath}/version`),
    read<{ progressPercent: number; revision: string; finalScore: number | null }>(
      `${basePath}/progress`,
    ),
    read<{ submission: Submission; evaluation: Feedback | null }[]>(`${basePath}/history`),
  ]);
  return { project, detail, progress, history };
};
export const submitProject = (
  projectId: string,
  assignmentId: string,
  content: string,
  expectedRevision: string,
  requestKey: string,
) =>
  post<Submission>(`${projectRoute(projectId)}/submissions`, {
    assignmentId,
    content,
    expectedRevision,
    requestKey,
  });
export const evaluateProject = (projectId: string, submissionId: string, ai: boolean) =>
  post<Feedback>(
    `${projectRoute(projectId)}/submissions/${id(submissionId)}/evaluate${ai ? '-ai' : ''}`,
  );

interface InterviewQuestion {
  answerId?: string | null;
  evaluationId?: string | null;
  submittedAtUtc?: string | null;
  answerStatus?: number;
  id: string;
  prompt: string;
  answered: boolean;
  evaluated: boolean;
  sectionId: string;
}
interface InterviewSession {
  id: string;
  versionId: string;
  status: number;
  revision: string;
  questions: InterviewQuestion[];
  journeyContextId: string | null;
}
const interviewRoute = (sessionId: string) => `/interviews/sessions/${id(sessionId)}`;
export const interviewRecommendations = ({ goalId, enrollmentId }: Scope) =>
  read<{ versionId: string; title: string; reason: string }[]>(
    enrollmentId
      ? `${enrollmentRoute(enrollmentId)}/interviews/recommended`
      : '/interviews/recommended',
    enrollmentId ? undefined : { goalId },
  );
export const interviewHistory = ({ goalId, enrollmentId }: Scope) =>
  read<InterviewSession[]>(
    enrollmentId ? `${enrollmentRoute(enrollmentId)}/interviews/sessions` : '/interviews/sessions',
    enrollmentId ? undefined : { goalId },
  );
export const interviewVersion = (versionId: string) =>
  read<{
    name: string;
    description: string;
    estimatedMinutes: number;
    sections: { id: string; title: string; aiQuestionAvailable: boolean }[];
  }>(`/interviews/versions/${id(versionId)}`);
export const startInterview = (
  scope: Scope,
  versionId: string,
  useAiQuestions: boolean,
  requestKey: string,
) =>
  post<InterviewSession>('/interviews/sessions', {
    ...scopeBody(scope),
    versionId,
    useAiQuestions,
    requestKey,
  });
export const getInterview = (sessionId: string) =>
  read<InterviewSession>(interviewRoute(sessionId));
export const nextInterviewQuestion = (sessionId: string) =>
  read<InterviewQuestion | null>(`${interviewRoute(sessionId)}/questions/next`);
export const generateInterviewQuestion = (
  sessionId: string,
  sectionId: string,
  expectedRevision: string,
  requestKey: string,
) =>
  post<InterviewQuestion>(
    `${interviewRoute(sessionId)}/sections/${id(sectionId)}/questions/generate`,
    { expectedRevision, requestKey },
  );
export const answerInterview = (
  sessionId: string,
  questionId: string,
  content: string,
  expectedRevision: string,
  requestKey: string,
) =>
  post<{ id: string; questionId: string }>(`${interviewRoute(sessionId)}/answers`, {
    questionId,
    content,
    expectedRevision,
    requestKey,
  });
export const evaluateInterview = (sessionId: string, answerId: string, ai: boolean) =>
  post<Feedback>(`${interviewRoute(sessionId)}/answers/${id(answerId)}/evaluate${ai ? '-ai' : ''}`);
export const completeInterview = (sessionId: string, expectedRevision: string) =>
  post<InterviewReport>(`${interviewRoute(sessionId)}/complete`, { expectedRevision });
interface InterviewReport {
  overallScore: number;
  strengths: string[];
  improvementAreas: string[];
  nextActions: string[];
}
export const interviewReport = (sessionId: string) =>
  read<InterviewReport>(`${interviewRoute(sessionId)}/report`);

export const goalInsights = async (goalId: string) => {
  const [passport, readiness, history] = await Promise.all([
    read<{
      skills: {
        competencyId: string;
        skillName: string;
        proficiency: number;
        evidenceCount: number;
      }[];
    }>('/passport', { goalId }),
    read<{ total: number; mainBlocker: string }>('/passport/readiness', { goalId }),
    read<{ id: string; calculatedAtUtc: string; total: number }[]>('/passport/readiness/history', {
      goalId,
    }),
  ]);
  return { passport, readiness, history };
};
export const enrollmentRecognition = (enrollmentId: string) =>
  read<{
    proficiency: {
      status: string;
      score: number | null;
      band: string | null;
      demonstratedCompetencies:
        { competencyId: string; name: string; proficiency: number }[] | null;
    };
    achievements: { id: string; title: string; description: string }[];
  }>(`/enrollments/${id(enrollmentId)}/recognition`);

interface PracticeSession {
  id: string;
  status: number;
  journeyContextId: string | null;
  questions: {
    id: string;
    sequence: number;
    prompt: string;
    publicOptionsJson: string;
    type: number;
  }[];
}
interface PracticeEvaluation {
  id: string;
  classification: string;
  explanation: string;
  suggestedImprovement: string;
}
export const practiceRecommendations = (journeyContextId: string) =>
  read<
    {
      competencyId: string;
      recommendedDifficulty: number;
      reason: string;
    }[]
  >('/practice/recommendations', { journeyContextId });
export const practiceHistory = (journeyContextId: string) =>
  read<PracticeSession[]>('/practice/sessions', { journeyContextId });
export const startPractice = (
  scope: Scope,
  request: {
    requestKey: string;
    competencyId: string;
    difficulty: number;
    questionType: number;
  },
) =>
  post<PracticeSession>(
    scope.enrollmentId
      ? `${enrollmentRoute(scope.enrollmentId)}/practice/sessions`
      : '/practice/sessions',
    { ...(!scope.enrollmentId && scopeBody(scope)), ...request, roadmapNodeId: null },
  );
const practiceRoute = (sessionId: string) => `/practice/sessions/${id(sessionId)}`;
export const getPractice = (sessionId: string) => read<PracticeSession>(practiceRoute(sessionId));
export const getPracticeResults = (sessionId: string) =>
  read<{
    answeredCount: number;
    questionCount: number;
    scorePercent: number;
    evaluations: PracticeEvaluation[];
  }>(`${practiceRoute(sessionId)}/results`);
export const answerPractice = (
  sessionId: string,
  questionId: string,
  answerJson: string,
  requestKey: string,
) =>
  post<PracticeEvaluation>(`${practiceRoute(sessionId)}/answers`, {
    questionId,
    answerJson,
    requestKey,
  });

interface Conversation {
  id: string;
  title: string;
  status: number;
  revision: string;
  journeyContextId: string | null;
}
const tutorRoute = (conversationId: string) => `/tutor/conversations/${id(conversationId)}`;
export const tutorHistory = (journeyContextId: string) =>
  read<Conversation[]>('/tutor/conversations', { journeyContextId });
export const startTutor = (
  scope: Scope,
  request: { requestKey: string; competencyId: string; topic: string; title: string },
) =>
  post<Conversation>(
    scope.enrollmentId
      ? `${enrollmentRoute(scope.enrollmentId)}/tutor/conversations`
      : '/tutor/conversations',
    { ...(!scope.enrollmentId && scopeBody(scope)), ...request, roadmapNodeId: null },
  );
export const tutorConversation = (conversationId: string) =>
  read<Conversation>(tutorRoute(conversationId));
export const tutorMessages = (conversationId: string) =>
  read<
    {
      id: string;
      role: number;
      status: number;
      content: string;
    }[]
  >(`${tutorRoute(conversationId)}/messages`);
export const sendTutorMessage = (conversationId: string, content: string, requestKey: string) =>
  post<{ id: string; status: number }>(`${tutorRoute(conversationId)}/messages`, {
    content,
    requestKey,
    mode: 1,
  });
export const archiveTutor = (conversationId: string, expectedRevision: string) =>
  post<Conversation>(
    `${tutorRoute(conversationId)}/archive?expectedRevision=${id(expectedRevision)}`,
  );
