import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as api from '../api/journeyWorkApi';
import { NextAction, type AcceleratorJourneyResponse } from '../types/journey';
import { JourneyTutor } from './AITutorPage';
import { InterviewWorkspace } from './LiveMockInterviewPage';
import { JourneyInterviews } from './MockInterviewSetupPage';
import { JourneyPractice } from './ProjectPracticePage';
import { JourneyProjects } from './VirtualProjectWorkspacePage';

vi.mock('../api/journeyWorkApi', () => ({
  getSkillGaps: vi.fn(),
  projectRecommendations: vi.fn(),
  projectHistory: vi.fn(),
  projectDetail: vi.fn(),
  startProject: vi.fn(),
  projectWorkspace: vi.fn(),
  interviewRecommendations: vi.fn(),
  interviewHistory: vi.fn(),
  interviewVersion: vi.fn(),
  startInterview: vi.fn(),
  getInterview: vi.fn(),
  evaluateInterview: vi.fn(),
  nextInterviewQuestion: vi.fn(),
  interviewReport: vi.fn(),
  practiceRecommendations: vi.fn(),
  practiceHistory: vi.fn(),
  startPractice: vi.fn(),
  getPractice: vi.fn(),
  getPracticeResults: vi.fn(),
  tutorHistory: vi.fn(),
  tutorConversation: vi.fn(),
  tutorMessages: vi.fn(),
  sendTutorMessage: vi.fn(),
}));

const journey: AcceleratorJourneyResponse = {
  state: 'Ready',
  policyVersion: 'journey-checklist-v1',
  journeyContextId: 'context',
  goalId: null,
  learningPathId: 'path',
  enrollmentId: 'enrollment',
  title: 'Data Engineer',
  entitlement: { status: 'Active', startsAtUtc: null, endsAtUtc: null, usage: [] },
  summary: null,
  roadmapId: 'roadmap',
  overallProgressPercent: 25,
  estimatedMinutesRemaining: null,
  currentPhase: 'SkillBuild',
  nextAction: NextAction.ContinueLearning,
  nextResourceId: null,
  checklist: [],
  phases: [],
  roadmapStatus: 1,
  assessmentStatus: 6,
};

const refresh = vi.fn();

describe('Accelerator journey work screens', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getSkillGaps).mockResolvedValue([
      { competencyId: 'sql', skillName: 'SQL', current: 1, required: 3, gap: 2, confidence: 0.2 },
    ]);
  });

  it('evaluates the answer returned by a reopened interview without resubmitting it', async () => {
    const session = {
      id: 'session',
      versionId: 'version',
      status: 2,
      revision: 'revision',
      journeyContextId: 'context',
      questions: [
        {
          id: 'question',
          sectionId: 'section',
          prompt: 'Explain joins',
          answered: true,
          evaluated: false,
          answerId: 'saved-answer',
        },
      ],
    };
    vi.mocked(api.getInterview)
      .mockResolvedValueOnce(session)
      .mockResolvedValue({
        ...session,
        questions: session.questions.map((question) => ({ ...question, evaluated: true })),
      });
    vi.mocked(api.nextInterviewQuestion).mockResolvedValue(null);
    vi.mocked(api.interviewVersion).mockResolvedValue({
      name: 'Interview',
      description: '',
      estimatedMinutes: 20,
      sections: [],
    });
    vi.mocked(api.evaluateInterview).mockResolvedValue({
      score: 80,
      feedback: 'Clear explanation',
    });
    render(
      <InterviewWorkspace
        sessionId="session"
        contextId="context"
        showReport={false}
        back={vi.fn()}
        refresh={refresh}
        ai={false}
      />,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Evaluate answer' }));
    expect(await screen.findByText('Score 80 · Clear explanation')).toBeInTheDocument();
    expect(api.evaluateInterview).toHaveBeenCalledWith('session', 'saved-answer', false);
  });

  it('starts a recommended project and uses persisted progress in its workspace', async () => {
    const detail = {
      title: 'Build a data pipeline',
      shortDescription: 'Project',
      businessContext: 'A reporting team',
      instructions: 'Create an ingestion job',
      milestones: [],
    };
    const project = {
      id: 'project',
      projectVersionId: 'version',
      progressPercent: 0,
      revision: 'revision',
      journeyContextId: 'context',
    };
    vi.mocked(api.projectRecommendations).mockResolvedValue([
      { projectVersionId: 'version', title: detail.title, reason: 'Matches your path' },
    ]);
    vi.mocked(api.projectHistory).mockResolvedValue([]);
    vi.mocked(api.projectDetail).mockResolvedValue(detail);
    vi.mocked(api.startProject).mockResolvedValue(project);
    vi.mocked(api.projectWorkspace).mockResolvedValue({
      project,
      detail,
      progress: { progressPercent: 0, revision: 'revision', finalScore: null },
      history: [],
    });
    render(<JourneyProjects journey={journey} refresh={refresh} />);
    fireEvent.click(await screen.findByRole('button', { name: 'View project' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Start project' }));
    expect(await screen.findByText('Project progress 0%')).toBeInTheDocument();
    expect(api.startProject).toHaveBeenCalledWith(journey, 'version', expect.any(String));
    expect(api.projectWorkspace).toHaveBeenCalledWith('project');
    expect(refresh).toHaveBeenCalled();
  });

  it('opens an existing interview report using its session ID and journey scope', async () => {
    const session = {
      id: 'session',
      versionId: 'version',
      status: 5,
      revision: 'revision',
      questions: [],
      journeyContextId: 'context',
    };
    vi.mocked(api.interviewRecommendations).mockResolvedValue([]);
    vi.mocked(api.interviewHistory).mockResolvedValue([session]);
    vi.mocked(api.getInterview).mockResolvedValue(session);
    vi.mocked(api.interviewVersion).mockResolvedValue({
      name: 'Interview',
      description: '',
      estimatedMinutes: 20,
      sections: [],
    });
    vi.mocked(api.interviewReport).mockResolvedValue({
      overallScore: 82,
      strengths: ['Clear explanation'],
      improvementAreas: [],
      nextActions: [],
    });
    render(<JourneyInterviews journey={journey} refresh={refresh} />);
    fireEvent.click(await screen.findByRole('button', { name: 'View report 1' }));
    expect(await screen.findByText('Overall score 82')).toBeInTheDocument();
    expect(screen.getByText('Clear explanation')).toBeInTheDocument();
    expect(api.interviewReport).toHaveBeenCalledWith('session');
  });

  it('starts practice from a recommendation and loads its persisted results', async () => {
    const session = { id: 'practice', status: 1, journeyContextId: 'context', questions: [] };
    vi.mocked(api.practiceRecommendations).mockResolvedValue([
      { competencyId: 'sql', recommendedDifficulty: 1, reason: 'Build confidence' },
    ]);
    vi.mocked(api.practiceHistory).mockResolvedValue([]);
    vi.mocked(api.startPractice).mockResolvedValue(session);
    vi.mocked(api.getPractice).mockResolvedValue(session);
    vi.mocked(api.getPracticeResults).mockResolvedValue({
      answeredCount: 1,
      questionCount: 2,
      scorePercent: 50,
      evaluations: [],
    });
    render(<JourneyPractice journey={journey} refresh={refresh} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Start practice' }));
    expect(await screen.findByText('Score 50% · 1 of 2 answered')).toBeInTheDocument();
    expect(api.startPractice).toHaveBeenCalledWith(
      journey,
      expect.objectContaining({ competencyId: 'sql', requestKey: expect.any(String) }),
    );
    expect(api.getPracticeResults).toHaveBeenCalledWith('practice');
  });

  it('sends a tutor message and displays the response from conversation history', async () => {
    const conversation = {
      id: 'conversation',
      title: 'SQL discussion',
      status: 1,
      revision: 'revision',
      journeyContextId: 'context',
    };
    vi.mocked(api.tutorHistory).mockResolvedValue([conversation]);
    vi.mocked(api.tutorConversation).mockResolvedValue(conversation);
    vi.mocked(api.tutorMessages)
      .mockResolvedValueOnce([])
      .mockResolvedValue([
        { id: 'reply', role: 3, status: 2, content: 'Start with the tables and their keys.' },
      ]);
    vi.mocked(api.sendTutorMessage).mockResolvedValue({ id: 'reply', status: 2 });
    render(<JourneyTutor journey={journey} />);
    fireEvent.click(await screen.findByRole('button', { name: 'SQL discussion' }));
    fireEvent.change(await screen.findByRole('textbox', { name: 'Message' }), {
      target: { value: 'Explain joins' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByText('Start with the tables and their keys.')).toBeInTheDocument();
    expect(api.sendTutorMessage).toHaveBeenCalledWith(
      'conversation',
      'Explain joins',
      expect.any(String),
    );
  });
});
