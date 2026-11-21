import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getAcceleratorJourney,
  getAcceleratorPlan,
  provisionAcceleratorJourney,
} from '../api/acceleratorApi';
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
import {
  NextAction,
  type AcceleratorJourneyResponse,
  type ProvisionAcceleratorJourneyResponse,
} from '../types/journey';
import { AIAcceleratorPathPage } from './AIAcceleratorPathPage';

vi.mock('../api/acceleratorApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/acceleratorApi')>()),
  getAcceleratorJourney: vi.fn(),
  getAcceleratorPlan: vi.fn(),
  provisionAcceleratorJourney: vi.fn(),
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
    expect(generateRoadmap).toHaveBeenCalledWith(
      expect.objectContaining({ enrollmentId: 'enrollment' }),
      expect.any(String),
    );
    await waitFor(() => expect(getRoadmap).toHaveBeenCalledWith('roadmap'));
    expect(await screen.findByText('Generated roadmap')).toBeInTheDocument();
  });
});

const provisionable: AcceleratorJourneyResponse = {
  ...journey,
  title: 'Full Stack Developer',
  state: 'ProvisioningRequired',
  nextAction: NextAction.ProvisionJourney,
  entitlement: { ...journey.entitlement, status: 'Active' },
  journeyContextId: null,
  phases: [],
};
const prepared: ProvisionAcceleratorJourneyResponse = {
  state: 'Ready',
  diagnosticReason: null,
  journeyContextId: 'prepared-context',
  learningPathId: 'path',
  enrollmentId: 'enrollment',
  nextAction: NextAction.StartAssessment,
  requiredCompetencies: 2,
  coveredCompetencies: 2,
  uncoveredCompetencyIds: [],
  policyVersion: 'journey-provision-v1',
  isPartialBaseline: false,
  competencyCoveragePercent: 100,
};
const configured = {
  ...journey,
  entitlement: provisionable.entitlement,
  journeyContextId: prepared.journeyContextId,
  nextAction: NextAction.StartAssessment,
};
const fullStackId = '523641a2-0532-40ad-96dd-a8f8f64870e2';

function SwitchableJourney() {
  const [params, setParams] = useSearchParams();
  return (
    <>
      <button onClick={() => setParams({ selected: 'replacement' })}>Switch path</button>
      <AIAcceleratorPathPage key={params.get('selected')} />
    </>
  );
}

describe('Accelerator self-service provisioning', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getCareerPath).mockRejectedValue(new Error('Market detail unavailable'));
    vi.mocked(getSkillPath).mockRejectedValue(new Error('Market detail unavailable'));
    vi.mocked(getAcceleratorPlan).mockResolvedValue({ checkoutAvailable: false });
  });

  it.each(['career', 'skill'])(
    'provisions an active %s selection once and reloads its context',
    async (type) => {
      vi.mocked(getAcceleratorJourney).mockImplementation(async (query) =>
        query.journeyContextId ? configured : provisionable,
      );
      let resolve!: (value: ProvisionAcceleratorJourneyResponse) => void;
      vi.mocked(provisionAcceleratorJourney).mockReturnValue(
        new Promise((done) => {
          resolve = done;
        }),
      );
      const renderPage = () => (
        <StrictMode>
          <MemoryRouter initialEntries={[`?selected=${fullStackId}&type=${type}`]}>
            <AIAcceleratorPathPage />
          </MemoryRouter>
        </StrictMode>
      );
      const view = render(renderPage());
      expect(
        await screen.findByText('Preparing your personalized Full Stack Developer journey…'),
      ).toBeInTheDocument();
      expect(await screen.findByText('Active access')).toBeInTheDocument();
      view.rerender(renderPage());
      expect(provisionAcceleratorJourney).toHaveBeenCalledTimes(1);
      expect(provisionAcceleratorJourney).toHaveBeenCalledWith({
        [type === 'skill' ? 'marketSkillPathId' : 'marketPathId']: fullStackId,
        requestKey: expect.stringMatching(/^[\da-f-]{36}$/i),
      });
      await act(async () => resolve(prepared));
      expect(
        (await screen.findAllByRole('link', { name: 'Start assessment' })).length,
      ).toBeGreaterThan(0);
      expect(getAcceleratorJourney).toHaveBeenLastCalledWith(
        { journeyContextId: 'prepared-context' },
        expect.any(AbortSignal),
      );
      expect(provisionAcceleratorJourney).toHaveBeenCalledTimes(1);
      expect(startBaselineAssessment).not.toHaveBeenCalled();
    },
  );

  it.each([
    configured,
    { ...provisionable, entitlement: { ...provisionable.entitlement, status: 'Expired' } },
  ])(
    'skips provisioning for an already configured journey or inactive entitlement',
    async (result) => {
      vi.mocked(getAcceleratorJourney).mockResolvedValue(result);
      openJourney();
      expect(
        await screen.findByText(
          result.entitlement.status === 'Active' ? 'Active access' : 'Expired access',
        ),
      ).toBeInTheDocument();
      expect(provisionAcceleratorJourney).not.toHaveBeenCalled();
    },
  );

  it('shows a controlled unavailable result without exposing diagnostics', async () => {
    vi.mocked(getAcceleratorJourney).mockResolvedValue(provisionable);
    vi.mocked(provisionAcceleratorJourney).mockResolvedValue({
      ...prepared,
      state: 'ProvisioningUnavailable',
      journeyContextId: null,
      diagnosticReason: 'InternalDiagnostic',
    });
    openJourney();
    expect(
      await screen.findByText(/This path cannot be prepared automatically/),
    ).toBeInTheDocument();
    expect(screen.queryByText('InternalDiagnostic')).not.toBeInTheDocument();
    expect(provisionAcceleratorJourney).toHaveBeenCalledTimes(1);
  });

  it('checks the selected journey after conflict without repeating the write', async () => {
    vi.mocked(getAcceleratorJourney)
      .mockResolvedValueOnce(provisionable)
      .mockResolvedValue(configured);
    vi.mocked(provisionAcceleratorJourney).mockRejectedValue({
      isAxiosError: true,
      response: { status: 409 },
    });
    openJourney();
    expect(
      (await screen.findAllByRole('link', { name: 'Start assessment' })).length,
    ).toBeGreaterThan(0);
    expect(getAcceleratorJourney).toHaveBeenCalledTimes(2);
    expect(provisionAcceleratorJourney).toHaveBeenCalledTimes(1);
  });

  it('reuses its request key after an explicit retry', async () => {
    vi.mocked(getAcceleratorJourney).mockImplementation(async (query) =>
      query.journeyContextId ? configured : provisionable,
    );
    vi.mocked(provisionAcceleratorJourney)
      .mockRejectedValueOnce(new Error('Offline'))
      .mockResolvedValue(prepared);
    openJourney();
    fireEvent.click(await screen.findByRole('button', { name: 'Retry' }));
    expect(
      (await screen.findAllByRole('link', { name: 'Start assessment' })).length,
    ).toBeGreaterThan(0);
    expect(provisionAcceleratorJourney).toHaveBeenCalledTimes(2);
    expect(vi.mocked(provisionAcceleratorJourney).mock.calls[0]).toEqual(
      vi.mocked(provisionAcceleratorJourney).mock.calls[1],
    );
  });

  it('ignores a pending provision response after switching paths', async () => {
    vi.mocked(getAcceleratorJourney).mockImplementation(async (query) =>
      query.marketPathId === 'replacement'
        ? { ...configured, title: 'Replacement' }
        : provisionable,
    );
    let resolve!: (value: ProvisionAcceleratorJourneyResponse) => void;
    vi.mocked(provisionAcceleratorJourney).mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    render(
      <MemoryRouter initialEntries={[`?selected=${fullStackId}`]}>
        <SwitchableJourney />
      </MemoryRouter>,
    );
    await screen.findByText(/Preparing your personalized/);
    fireEvent.click(screen.getByRole('button', { name: 'Switch path' }));
    expect(await screen.findByText('Replacement Path')).toBeInTheDocument();
    await act(async () => resolve(prepared));
    expect(screen.queryByText(/Preparing your personalized/)).not.toBeInTheDocument();
    expect(getAcceleratorJourney).not.toHaveBeenCalledWith(
      { journeyContextId: 'prepared-context' },
      expect.any(AbortSignal),
    );
  });
});
