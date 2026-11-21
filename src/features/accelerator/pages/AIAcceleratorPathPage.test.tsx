import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAcceleratorJourney, getAcceleratorPlan } from '../api/acceleratorApi';
import { getCareerPath, getSkillPath } from '../api/acceleratorMarketApi';
import {
  finalizeAssessment,
  generateRoadmap,
  getRoadmap,
  getSkillGaps,
  saveAssessmentAnswer,
  startBaselineAssessment,
  getAssessmentAttempt,
} from '../api/journeyWorkApi';
import { NextAction, type AcceleratorJourneyResponse } from '../types/journey';
import { AIAcceleratorPathPage } from './AIAcceleratorPathPage';

vi.mock('../api/acceleratorApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/acceleratorApi')>()),
  getAcceleratorJourney: vi.fn(),
  getAcceleratorPlan: vi.fn(),
}));
vi.mock('../api/acceleratorMarketApi', () => ({ getCareerPath: vi.fn(), getSkillPath: vi.fn() }));
vi.mock('../api/journeyWorkApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/journeyWorkApi')>()),
  finalizeAssessment: vi.fn(),
  generateRoadmap: vi.fn(),
  getRoadmap: vi.fn(),
  getSkillGaps: vi.fn(),
  saveAssessmentAnswer: vi.fn(),
  startBaselineAssessment: vi.fn(),
  getAssessmentAttempt: vi.fn(),
}));

const journey: AcceleratorJourneyResponse = {
  state: 'Ready',
  policyVersion: 'journey-checklist-v1',
  journeyContextId: 'context',
  goalId: null,
  learningPathId: 'learning-path',
  enrollmentId: 'enrollment',
  title: 'Data Engineer',
  entitlement: { status: 'Expired', startsAtUtc: null, endsAtUtc: null, usage: [] },
  summary: null,
  roadmapId: null,
  overallProgressPercent: 37,
  estimatedMinutesRemaining: 200,
  currentPhase: 'SkillBuild',
  nextAction: NextAction.GenerateRoadmap,
  nextResourceId: null,
  checklist: [
    { code: 'AssessmentCompleted', complete: true },
    { code: 'RoadmapCreated', complete: false },
  ],
  phases: [
    { code: 'Foundation', complete: true, unlocked: true },
    { code: 'SkillBuild', complete: false, unlocked: true, progressPercent: 42 },
    { code: 'BuildAndShowcase', complete: false, unlocked: false },
  ],
  roadmapStatus: null,
  assessmentStatus: 6,
};

function openJourney(screenName?: string, skill = false) {
  return render(
    <MemoryRouter
      initialEntries={[
        `/dashboard/ai-accelerator?selected=market-path${skill ? '&type=skill' : ''}${screenName ? `&screen=${screenName}` : ''}`,
      ]}
    >
      <AIAcceleratorPathPage />
    </MemoryRouter>,
  );
}

describe('Accelerator journey dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    vi.mocked(getCareerPath).mockRejectedValue(new Error('Market detail unavailable'));
    vi.mocked(getSkillPath).mockRejectedValue(new Error('Market detail unavailable'));
    vi.mocked(getAcceleratorPlan).mockResolvedValue({ checkoutAvailable: false });
  });

  it('uses the market path only for journey lookup and renders server progress and next action', async () => {
    vi.mocked(getAcceleratorJourney).mockResolvedValue(journey);
    openJourney();
    expect(await screen.findByText('37%')).toBeInTheDocument();
    expect(screen.getByText('3 hr 20 min remaining')).toBeInTheDocument();
    expect(await screen.findByText('Expired access')).toBeInTheDocument();
    expect(screen.getByText('Locked')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Skill Build progress' })).toHaveAttribute(
      'aria-valuenow',
      '42',
    );
    expect(screen.getAllByRole('link', { name: 'Generate roadmap' })[0]).toHaveAttribute(
      'href',
      '/dashboard/ai-accelerator?selected=market-path&screen=roadmap',
    );
    expect(getAcceleratorJourney).toHaveBeenCalledWith(
      { marketPathId: 'market-path' },
      expect.any(AbortSignal),
    );
  });

  it('resolves a selected skill through the distinct market skill parameter', async () => {
    vi.mocked(getAcceleratorJourney).mockResolvedValue({ ...journey, title: 'SQL' });
    openJourney(undefined, true);
    expect(await screen.findByText('SQL Path')).toBeInTheDocument();
    expect(getAcceleratorJourney).toHaveBeenCalledWith(
      { marketSkillPathId: 'market-path' },
      expect.any(AbortSignal),
    );
    expect(getSkillPath).toHaveBeenCalledWith('market-path');
    expect(getCareerPath).not.toHaveBeenCalled();
  });

  it('shows missing configuration without an actionable assessment link', async () => {
    vi.mocked(getAcceleratorJourney).mockResolvedValue({
      ...journey,
      state: 'MarketRoleNotMapped',
      nextAction: NextAction.Unavailable,
      phases: [],
      checklist: [],
      overallProgressPercent: null,
      estimatedMinutesRemaining: null,
    });
    openJourney();
    expect(
      await screen.findByText(
        'This career path is not yet configured for AI Accelerator learning.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Start assessment' })).not.toBeInTheDocument();
  });

  it('shows a rate-limit error and fetches again only after retry', async () => {
    vi.mocked(getAcceleratorJourney)
      .mockRejectedValueOnce({ isAxiosError: true, response: { status: 429 } })
      .mockResolvedValue(journey);
    openJourney();
    expect(
      await screen.findByText('Too many requests. Please try again shortly.'),
    ).toBeInTheDocument();
    expect(getAcceleratorJourney).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('37%')).toBeInTheDocument();
    expect(getAcceleratorJourney).toHaveBeenCalledTimes(2);
  });

  it('starts an enrollment assessment and finalizes against the revision returned by the answer API', async () => {
    const attempt = {
      id: 'attempt',
      goalId: null,
      status: 3,
      revision: 'first',
      score: null,
      expiresAtUtc: '2099-01-01T00:00:00Z',
      questions: [
        {
          id: 'question',
          sequence: 1,
          prompt: 'Which operation joins two datasets?',
          type: 1,
          difficulty: 1,
          optionsJson: '["Join","Filter"]',
        },
      ],
    };
    vi.mocked(getAcceleratorJourney).mockResolvedValue({
      ...journey,
      nextAction: NextAction.StartAssessment,
      assessmentStatus: null,
    });
    vi.mocked(startBaselineAssessment).mockResolvedValue(attempt);
    vi.mocked(saveAssessmentAnswer).mockResolvedValue({
      ...attempt,
      revision: 'latest',
      questions: attempt.questions.map((question) => ({
        ...question,
        isAnswered: true,
        answerIsImmutable: true,
      })),
    });
    vi.mocked(finalizeAssessment).mockResolvedValue({ ...attempt, status: 6, score: 100 });
    vi.mocked(getSkillGaps).mockResolvedValue([
      { competencyId: 'sql', skillName: 'SQL', current: 3, required: 4, gap: 1, confidence: 0.9 },
    ]);

    openJourney('assessment');
    fireEvent.click(await screen.findByRole('button', { name: 'Start assessment' }));
    expect(await screen.findByText(attempt.questions[0]!.prompt)).toBeInTheDocument();
    expect(startBaselineAssessment).toHaveBeenCalledWith('enrollment', expect.any(String));
    fireEvent.click(screen.getByRole('radio', { name: 'Join' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    expect(await screen.findByText('Answer saved')).toBeInTheDocument();
    expect(saveAssessmentAnswer).toHaveBeenCalledWith('attempt', 'question', '{"answer":"Join"}');
    fireEvent.click(screen.getByRole('button', { name: 'Finish assessment' }));
    expect(await screen.findByText('Assessment score 100%')).toBeInTheDocument();
    expect(screen.getByText(/SQL.*Gap 1.*Confidence 90%/)).toBeInTheDocument();
    expect(finalizeAssessment).toHaveBeenCalledWith('attempt', 'latest');
  });

  it('recovers an immutable answer on a fresh page from the server attempt', async () => {
    vi.mocked(getAcceleratorJourney).mockResolvedValue({
      ...journey,
      nextAction: NextAction.ResumeAssessment,
      nextResourceId: 'active',
    });
    vi.mocked(getAssessmentAttempt).mockResolvedValue({
      id: 'active',
      journeyContextId: journey.journeyContextId,
      goalId: null,
      status: 3,
      revision: 'latest',
      score: null,
      expiresAtUtc: '2099-01-01T00:00:00Z',
      canResume: true,
      questions: [
        {
          id: 'saved',
          sequence: 1,
          prompt: 'Saved question',
          type: 1,
          difficulty: 1,
          optionsJson: '["Join","Filter"]',
          isAnswered: true,
          answerIsImmutable: true,
          submittedAnswerJson: '{"answer":"Join"}',
        },
      ],
    });
    openJourney('assessment');
    expect(await screen.findByText('Answer saved')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Join' })).toBeChecked();
    expect(screen.getByRole('button', { name: 'Finish assessment' })).toBeEnabled();
    expect(getAssessmentAttempt).toHaveBeenCalledWith('active');
    expect(startBaselineAssessment).not.toHaveBeenCalled();
  });

  it('reloads the persisted assessment revision after a finalize conflict', async () => {
    const attempt = {
      id: 'active',
      journeyContextId: 'context',
      goalId: null,
      expiresAtUtc: '2099-01-01T00:00:00Z',
      status: 3,
      revision: 'original',
      score: null,
      canResume: true,
      questions: [
        {
          id: 'question',
          sequence: 1,
          prompt: 'Saved question',
          type: 1,
          difficulty: 1,
          optionsJson: '["Join"]',
          isAnswered: true,
          answerIsImmutable: true,
        },
      ],
    };
    vi.mocked(getAcceleratorJourney).mockResolvedValue({
      ...journey,
      nextAction: NextAction.ResumeAssessment,
      nextResourceId: 'active',
    });
    vi.mocked(getAssessmentAttempt)
      .mockResolvedValueOnce(attempt)
      .mockResolvedValue({ ...attempt, revision: 'reloaded' });
    vi.mocked(getSkillGaps).mockResolvedValue([]);
    vi.mocked(finalizeAssessment)
      .mockRejectedValueOnce({ isAxiosError: true, response: { status: 409 } })
      .mockResolvedValue({ ...attempt, status: 6, score: 80 });
    openJourney('assessment');
    fireEvent.click(await screen.findByRole('button', { name: 'Finish assessment' }));
    await waitFor(() => expect(getAssessmentAttempt).toHaveBeenCalledTimes(2));
    await screen.findByText(/The server state changed/);
    fireEvent.click(screen.getByRole('button', { name: 'Finish assessment' }));
    expect(await screen.findByText('Assessment score 80%')).toBeInTheDocument();
    expect(finalizeAssessment).toHaveBeenLastCalledWith('active', 'reloaded');
  });

  it('generates a roadmap with the server enrollment and opens its persisted schedule', async () => {
    const roadmap = {
      id: 'roadmap',
      goalId: null,
      version: 1,
      status: 1,
      targetAtUtc: '2099-01-01T00:00:00Z',
      estimatedMinutes: 40,
      explanation: 'Generated roadmap',
      timelineFeasible: true,
      nodes: [],
      schedule: [],
      edges: [],
    };
    vi.mocked(getAcceleratorJourney)
      .mockResolvedValueOnce(journey)
      .mockResolvedValue({
        ...journey,
        roadmapId: roadmap.id,
        nextAction: NextAction.ContinueLearning,
      });
    vi.mocked(generateRoadmap).mockResolvedValue(roadmap);
    vi.mocked(getRoadmap).mockResolvedValue(roadmap);
    openJourney('roadmap');
    fireEvent.click(await screen.findByRole('button', { name: 'Generate roadmap' }));
    expect(await screen.findByText('Generated roadmap')).toBeInTheDocument();
    expect(generateRoadmap).toHaveBeenCalledWith(
      expect.objectContaining({ enrollmentId: 'enrollment' }),
      expect.any(String),
    );
    await waitFor(() => expect(getRoadmap).toHaveBeenCalledWith('roadmap'));
  });
});
