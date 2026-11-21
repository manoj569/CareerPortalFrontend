import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/api/apiClient';

import {
  answerInterview,
  emptyGuid,
  interviewHistory,
  interviewRecommendations,
  practiceHistory,
  projectHistory,
  projectRecommendations,
  recordActivityProgress,
  startPractice,
  startProject,
  startTutor,
  tutorHistory,
} from './journeyWorkApi';

vi.mock('@/api/apiClient', () => ({ apiClient: { get: vi.fn(), post: vi.fn() } }));

const enrollment = { enrollmentId: 'enrollment', goalId: null };
const goal = { enrollmentId: null, goalId: 'goal' };

describe('Accelerator journey work API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [] } });
    vi.mocked(apiClient.post).mockResolvedValue({ data: { data: { id: 'resource' } } });
  });

  it('writes learning progress with the last activity revision and request key', async () => {
    await recordActivityProgress(
      {
        id: 'activity',
        roadmapNodeId: 'node',
        title: 'Learning activity',
        estimatedMinutes: 30,
        scheduledAtUtc: '2099-01-01T00:00:00Z',
        status: 3,
        revision: 'latest',
      },
      2,
      'request',
    );
    expect(apiClient.post).toHaveBeenCalledWith(
      '/accelerator/v1/learning-activities/activity/progress',
      {
        requestKey: 'request',
        kind: 2,
        evidenceJson: '{}',
        expectedRevision: 'latest',
      },
    );
  });

  it('routes recommendations and history to the selected journey scope', async () => {
    await projectRecommendations(enrollment);
    await projectHistory('project-context');
    await interviewRecommendations(goal);
    await interviewHistory(enrollment);
    await practiceHistory('practice-context');
    await tutorHistory('tutor-context');
    expect(apiClient.get).toHaveBeenCalledWith(
      '/accelerator/v1/learning/enrollments/enrollment/projects/recommended',
      { params: undefined },
    );
    expect(apiClient.get).toHaveBeenCalledWith('/accelerator/v1/projects/mine', {
      params: { journeyContextId: 'project-context' },
    });
    expect(apiClient.get).toHaveBeenCalledWith('/accelerator/v1/interviews/recommended', {
      params: { goalId: 'goal' },
    });
    expect(apiClient.get).toHaveBeenCalledWith(
      '/accelerator/v1/learning/enrollments/enrollment/interviews/sessions',
      { params: undefined },
    );
    expect(apiClient.get).toHaveBeenCalledWith('/accelerator/v1/practice/sessions', {
      params: { journeyContextId: 'practice-context' },
    });
    expect(apiClient.get).toHaveBeenCalledWith('/accelerator/v1/tutor/conversations', {
      params: { journeyContextId: 'tutor-context' },
    });
  });

  it('starts enrollment work with an enrollment ID and writes interview answers against their session revision', async () => {
    await startProject(enrollment, 'version', 'start');
    await startPractice(enrollment, {
      requestKey: 'practice',
      competencyId: 'skill',
      difficulty: 1,
      questionType: 1,
    });
    await startTutor(enrollment, {
      requestKey: 'tutor',
      competencyId: 'skill',
      topic: 'SQL',
      title: 'SQL',
    });
    await answerInterview('session', 'question', 'My answer', 'revision', 'answer');
    expect(apiClient.post).toHaveBeenCalledWith('/accelerator/v1/projects/version/start', {
      projectVersionId: 'version',
      requestKey: 'start',
      goalId: emptyGuid,
      enrollmentId: 'enrollment',
    });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/accelerator/v1/learning/enrollments/enrollment/practice/sessions',
      {
        requestKey: 'practice',
        competencyId: 'skill',
        difficulty: 1,
        questionType: 1,
        roadmapNodeId: null,
      },
    );
    expect(apiClient.post).toHaveBeenCalledWith(
      '/accelerator/v1/learning/enrollments/enrollment/tutor/conversations',
      {
        requestKey: 'tutor',
        competencyId: 'skill',
        topic: 'SQL',
        title: 'SQL',
        roadmapNodeId: null,
      },
    );
    expect(apiClient.post).toHaveBeenCalledWith(
      '/accelerator/v1/interviews/sessions/session/answers',
      {
        questionId: 'question',
        content: 'My answer',
        expectedRevision: 'revision',
        requestKey: 'answer',
      },
    );
  });
});
