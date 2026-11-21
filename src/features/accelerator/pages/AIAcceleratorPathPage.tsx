import { useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';

import { Link, useSearchParams } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { JourneyAssessment } from './SkillAssessmentPage';
import { JourneyAssessmentResults } from './AssessmentResultsPage';
import { JourneyEnrollment } from './CareerGoalSetupPage';
import { JourneyLessons } from './ActiveLearningPage';
import { JourneyRoadmap } from './LearningRoadmapPage';
import { JourneyProjects } from './VirtualProjectWorkspacePage';
import { JourneyInterviews } from './MockInterviewSetupPage';
import { JourneyPractice } from './ProjectPracticePage';
import { JourneyTutor } from './AITutorPage';
import { JourneyInsights } from './ProgressInsightsPage';
import { journeyError } from '../hooks/useJourneyWork';
import { getAcceleratorJourney, provisionAcceleratorJourney } from '../api/acceleratorApi';
import { journeyAction, journeyMessages, needsJourneyProvisioning, remainingTime } from '../journeyPresentation';
import { NextAction, type AcceleratorJourneyResponse, type ProvisionAcceleratorJourneyResponse } from '../types/journey';
import { getCareerPath, getSkillPath } from '../api/acceleratorMarketApi';
import { AcceleratorSubscriptionStatus } from '../components/AcceleratorSubscriptionStatus';
import { marketPathJobsUrl } from '../marketPathJobs';
import type { MarketPathDetail } from '../types/marketIntelligence';

const acceleratorTabs = [
  'My Accelerator',
  'Roadmap',
  'Skills & Learning',
  'Jobs & Opportunities',
  'Interview Prep',
  'Progress & Insights',
];

type JourneyStatus =
  | 'completed'
  | 'active'
  | 'upcoming';

const checklistLabels: Record<string, string> = {
  AssessmentCompleted: 'AI Skill Assessment',
  RoadmapCreated: 'Create Roadmap',
  LearningEvidence: 'Follow Roadmap',
  PracticeEvaluated: 'Complete Practice',
  ProjectCompleted: 'Build Projects',
  InterviewCompleted: 'Interview Preparation',
  ApplicationSubmitted: 'Apply to Jobs',
};

const phaseDescriptions: Record<string, { title: string; description: string }> = {
  Foundation: { title: 'Foundation', description: 'Understand your skills and identify gaps.' },
  SkillBuild: { title: 'Skill Build', description: 'Learn and practice skills for your target role.' },
  BuildAndShowcase: { title: 'Build & Showcase', description: 'Build evidence through real projects.' },
  InterviewReadiness: { title: 'Interview Readiness', description: 'Practice interviews and improve with feedback.' },
  JobApplicationAndTracking: { title: 'Job Application & Tracking', description: 'Find opportunities and track your applications.' },
};

const getStepStyles = (status: JourneyStatus) => {
  if (status === 'completed') {
    return {
      border: '#22a447',
      background: '#22a447',
      color: '#ffffff',
    };
  }

  if (status === 'active') {
    return {
      border: '#1677ff',
      background: '#ffffff',
      color: '#1677ff',
    };
  }

  return {
    border: '#b8c2d1',
    background: '#ffffff',
    color: '#8b97a8',
  };
};

export const AIAcceleratorPathPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const selectedPathId =
    searchParams.get('selected');
  const isSkill = searchParams.get('type') === 'skill';
  const journeyContextId = selectedPathId ? null : searchParams.get('journeyContextId');

  const [pathDetail, setPathDetail] =
    useState<MarketPathDetail | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);


  const [journey, setJourney] = useState<AcceleratorJourneyResponse | null>(null);
  const [retry, setRetry] = useState(0);
  const [provisioning, setProvisioning] = useState<'idle' | 'pending' | 'unavailable'>('idle');
  const provisionAttempt = useRef<{
    selection: string;
    requestKey: string;
    pending?: Promise<ProvisionAcceleratorJourneyResponse>;
    contextId?: string;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const selection = `${isSkill ? 'skill' : 'career'}/${selectedPathId ?? ''}`;
    if (provisionAttempt.current?.selection !== selection) provisionAttempt.current = null;

    const loadPath = async () => {
      const market = selectedPathId ? (isSkill ? { marketSkillPathId: selectedPathId } : { marketPathId: selectedPathId }) : null;
      const contextId = provisionAttempt.current?.contextId ?? journeyContextId;
      const query = contextId ? { journeyContextId: contextId } : market;
      if (!query) {
        setError(
          'No career path was selected.',
        );

        setLoading(false);
        return;
      }

      setError(null);

      try {
        const result = await getAcceleratorJourney(query, controller.signal);
        if (controller.signal.aborted) return;
        setJourney(result);
        setLoading(false);
        if (!market || result.entitlement.status !== 'Active' || !needsJourneyProvisioning(result)) {
          setProvisioning('idle');
          return;
        }

        setProvisioning('pending');
        const attempt = provisionAttempt.current ?? { selection, requestKey: crypto.randomUUID() };
        provisionAttempt.current = attempt;
        if (!attempt.contextId) {
          try {
            // Keep the in-flight write across effect cleanup. Abort only the reads.
            attempt.pending ??= provisionAcceleratorJourney({ ...market, requestKey: attempt.requestKey });
            const prepared = await attempt.pending;
            if (prepared.journeyContextId) attempt.contextId = prepared.journeyContextId;
            if (controller.signal.aborted) return;
            if (prepared.state === 'ProvisioningUnavailable' || !attempt.contextId) {
              setProvisioning('unavailable');
              return;
            }
          } catch (failure) {
            attempt.pending = undefined;
            if (controller.signal.aborted) return;
            const status = isAxiosError(failure) ? failure.response?.status : undefined;
            if (status !== 409 && status !== 403) throw failure;
            const latest = await getAcceleratorJourney(market, controller.signal);
            if (controller.signal.aborted) return;
            setJourney(latest);
            if (needsJourneyProvisioning(latest) && latest.entitlement.status === 'Active') throw failure;
            setProvisioning('idle');
            return;
          }
        }
        const latest = await getAcceleratorJourney({ journeyContextId: attempt.contextId }, controller.signal);
        if (controller.signal.aborted) return;
        setJourney(latest);
        setProvisioning(needsJourneyProvisioning(latest) ? 'unavailable' : 'idle');
      } catch (failure) {
        if (!controller.signal.aborted) {
          setProvisioning('idle');
          setError(
            journeyError(failure),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadPath();

    return () => {
      controller.abort();
    };
  }, [selectedPathId, isSkill, journeyContextId, retry]);

  useEffect(() => {
    if (!selectedPathId) return;
    let current = true;
    void (isSkill ? getSkillPath : getCareerPath)(selectedPathId).then((detail) => {
      if (current) setPathDetail(detail);
    }).catch(() => undefined);
    return () => { current = false; };
  }, [selectedPathId, isSkill]);

  const handleBack = () => {
    const params =
      new URLSearchParams(
        searchParams,
      );

    for (const key of ['selected', 'screen', 'journeyContextId', 'goalId', 'enrollmentId', 'attemptId', 'roadmapId', 'projectId', 'sessionId']) {
      params.delete(key);
    }
    params.set('type', isSkill ? 'skill' : 'career');

    setSearchParams(params);
  };

  const screenUrl = (screen: string) => {
    const params = new URLSearchParams(searchParams);
    if (screen) params.set('screen', screen); else params.delete('screen');
    return '?' + params.toString();
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 500,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Stack
          alignItems="center"
          spacing={1.5}
        >
          <CircularProgress />

          <Typography
            sx={{
              color: '#667085',
              fontSize: '0.88rem',
            }}
          >
            Loading your career path...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!journey) {
    return (
      <Box
        sx={{
          p: {
            xs: 2,
            md: 3,
          },
        }}
      >
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              onClick={() => setRetry((count) => count + 1)}
            >
              Retry
            </Button>
          }
        >
          {error ??
            'Career path was not found.'}
        </Alert>
      </Box>
    );
  }

  const path = pathDetail?.path;
  const title = path?.name ?? journey.title ?? 'Career path';
  const jobsUrl = path ? marketPathJobsUrl(path) : null;
  const matchingJobs = journey.summary?.relevantJobCount ?? path?.demand.activeJobCount;
  const action = journeyAction(journey);
  const provisioningBlocked = provisioning !== 'idle'
    || needsJourneyProvisioning(journey) || journey.state === 'ProvisioningUnavailable';
  const activeJourneyIndex = journey.checklist.findIndex((item) => !item.complete);
  const journeySteps = journey.checklist.map((item, index) => ({
    id: item.code,
    label: checklistLabels[item.code] ?? item.code,
    status: (item.complete ? 'completed' : index === activeJourneyIndex ? 'active' : 'upcoming') as JourneyStatus,
  }));
  const planPhases = journey.phases.map((phase, index) => ({
    id: index + 1,
    ...phase,
    ...phaseDescriptions[phase.code],
    status: phase.complete ? 'completed' : phase.unlocked && phase.code === journey.currentPhase ? 'active' : 'upcoming',
  }));
  const progress = journey.overallProgressPercent;
  const displayedProgress = progress === null ? null : Math.min(100, Math.max(0, progress));
  const actionUrl = action?.screen === 'jobs' ? jobsUrl
    : action?.screen === 'applications' ? ROUTES.APPLICATIONS : action ? screenUrl(action.screen) : null;
  const refresh = () => setRetry((count) => count + 1);
  const requestedScreen = searchParams.get('screen') ?? '';
  const skillScreens: Record<string, string> = {
    'skill-goal': 'enroll', 'skill-assessment': 'assessment', 'skill-assessment-questions': 'assessment-questions',
    'skill-assessment-results': 'assessment-results', 'skill-roadmap': 'roadmap', 'skill-learning': 'learning',
    'skill-learning-module': 'learning-module', 'skill-practice': 'practice', 'skill-practice-session': 'practice-session',
    'skill-practice-results': 'practice-results', 'skill-assignment': 'project', 'skill-assignment-feedback': 'project',
    'skill-proficiency': 'progress-insights',
  };
  const screen = isSkill ? skillScreens[requestedScreen] ?? requestedScreen : requestedScreen;
  const dashboard = !screen;
  const selectedTab = dashboard ? 0 : screen === 'roadmap' ? 1
    : ['learning', 'learning-module', 'practice', 'practice-session', 'practice-results', 'ai-tutor'].includes(screen) ? 2
    : screen === 'jobs' ? 3 : screen.startsWith('mock-interview') ? 4
    : ['progress-insights', 'career-readiness', 'skill-passport'].includes(screen) ? 5 : false;
  const unlocked = (code: string) => journey.phases.some((phase) => phase.code === code && phase.unlocked);
  const quickActions: Record<string, { screen: string; available: boolean; label: string }> = {
    'Skill Assessment': { screen: 'assessment', available: !!journey.summary?.assessmentConfigured,
      label: journey.nextAction === NextAction.ResumeAssessment ? 'Resume assessment'
        : journey.summary?.completedAssessments ? 'View results' : 'Open assessment' },
    'Learning Roadmap': { screen: 'roadmap', available: unlocked('SkillBuild'), label: journey.roadmapId ? 'View roadmap' : 'Open roadmap' },
    'Build Projects': { screen: 'project', available: unlocked('BuildAndShowcase'), label: 'Open projects' },
    'Interview Prep': { screen: 'mock-interview-setup', available: unlocked('InterviewReadiness'), label: 'Open interviews' },
  };
  const renderScreen = () => {
    switch (screen) {
      case 'goal':
      case 'enroll':
        return <JourneyEnrollment journey={journey} onDone={() => {
          setSearchParams((previous) => { const params = new URLSearchParams(previous); params.delete('screen'); return params; });
          refresh();
        }} />;
      case 'assessment':
      case 'assessment-questions':
        return <JourneyAssessment journey={journey} refresh={refresh} />;
      case 'assessment-results':
        return <JourneyAssessmentResults journey={journey} />;
      case 'roadmap':
        return <JourneyRoadmap journey={journey} refresh={refresh} />;
      case 'learning':
      case 'learning-module':
        return <Stack spacing={2}>
          <Stack direction="row" spacing={1}>
            <Button component={Link} to={screenUrl('practice')}>Practice</Button>
            <Button component={Link} to={screenUrl('ai-tutor')}>AI tutor</Button>
          </Stack>
          {journey.enrollmentId ? <JourneyLessons enrollmentId={journey.enrollmentId} refresh={refresh} />
            : <JourneyRoadmap journey={journey} refresh={refresh} />}
        </Stack>;
      case 'practice':
      case 'practice-session':
      case 'practice-results':
        return <JourneyPractice journey={journey} refresh={refresh} />;
      case 'ai-tutor':
        return <JourneyTutor journey={journey} />;
      case 'project':
      case 'project-resources':
      case 'assignment':
      case 'assignment-results':
        return unlocked('BuildAndShowcase') ? <JourneyProjects journey={journey} refresh={refresh} />
          : <Alert severity="info">Complete Foundation and generate a roadmap to unlock projects.</Alert>;
      case 'mock-interview-setup':
      case 'mock-interview-live':
      case 'mock-interview-results':
        return unlocked('InterviewReadiness') ? <JourneyInterviews journey={journey} refresh={refresh} />
          : <Alert severity="info">Complete Foundation and build learning evidence to unlock interviews.</Alert>;
      case 'progress-insights':
      case 'career-readiness':
      case 'skill-passport':
        return <JourneyInsights journey={journey} />;
      case 'jobs':
        return <Stack spacing={2}>
          <Typography variant="h5">Jobs &amp; opportunities</Typography>
          <Typography>{matchingJobs == null ? 'Matching jobs are currently unavailable.' : `${matchingJobs} matching jobs`}</Typography>
          {jobsUrl && <Button component={Link} to={jobsUrl}>View matching jobs</Button>}
          <Button component={Link} to={ROUTES.APPLICATIONS}>View your applications</Button>
        </Stack>;
      default:
        return <Alert severity="info">This Accelerator section is unavailable.</Alert>;
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1500,
        mx: 'auto',

        px: {
          xs: 1.5,
          sm: 2,
          lg: 2.5,
        },

        py: {
          xs: 1.5,
          md: 2,
        },
      }}
    >
      {/* =====================================================
          HERO
      ====================================================== */}

      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',

          borderRadius: 3,

          px: {
            xs: 2.25,
            md: 3.5,
          },

          py: {
            xs: 2.5,
            md: 3,
          },

          color: '#fff',

          background:
            'linear-gradient(115deg, #1f55a9 0%, #314fcf 53%, #652bd8 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',

            width: 270,
            height: 270,

            borderRadius: '50%',

            right: -70,
            top: -150,

            bgcolor:
              'rgba(255,255,255,0.08)',
          }}
        />

        <Box
          sx={{
            position: 'absolute',

            width: 170,
            height: 170,

            borderRadius: '50%',

            right: 170,
            bottom: -125,

            bgcolor:
              'rgba(255,255,255,0.05)',
          }}
        />

        <Stack
          direction="row"
          spacing={1.2}
          alignItems="center"
          useFlexGap
          flexWrap="wrap"
          sx={{
            position: 'relative',
          }}
        >
          <AutoAwesomeRoundedIcon />

          <Typography
            component="h1"
            sx={{
              fontWeight: 800,

              fontSize: {
                xs: '1.5rem',
                md: '2rem',
              },

              letterSpacing: '-0.03em',
            }}
          >
            AI Career Accelerator
          </Typography>

          <Box
            sx={{
              px: 1.25,
              py: 0.4,

              borderRadius: 5,

              border:
                '1px solid rgba(255,200,70,0.75)',

              bgcolor:
                'rgba(255,180,40,0.12)',

              color: '#ffe39b',

              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            Premium
          </Box>
        </Stack>

        <Typography
          sx={{
            position: 'relative',

            mt: 0.65,

            maxWidth: 760,

            color:
              'rgba(255,255,255,0.9)',

            fontSize: {
              xs: '0.84rem',
              md: '0.95rem',
            },
          }}
        >
          Your personalized, AI-powered
          journey from your current skills
          to your next career goal.
        </Typography>
      </Box>

      {/* =====================================================
          BACK
      ====================================================== */}

      <Button
        startIcon={
          <ArrowBackRoundedIcon />
        }
        onClick={handleBack}
        sx={{
          mt: 1.5,

          px: 0,

          textTransform: 'none',

          color: '#263858',

          fontWeight: 700,

          '&:hover': {
            bgcolor: 'transparent',
            color: '#0b57d0',
          },
        }}
      >
        Back
      </Button>

      {/* =====================================================
          PATH HEADER
      ====================================================== */}

      <Stack
        direction={{
          xs: 'column',
          md: 'row',
        }}
        justifyContent="space-between"
        alignItems={{
          xs: 'flex-start',
          md: 'center',
        }}
        spacing={2}
        sx={{
          mt: 0.25,
        }}
      >
        <Box>
          <Typography
            component="h2"
            sx={{
              color: '#101936',

              fontWeight: 800,

              fontSize: {
                xs: '1.55rem',
                md: '2rem',
              },

              letterSpacing: '-0.03em',
            }}
          >
            {title} Path
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            sx={{
              mt: 0.8,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',

                overflow: 'hidden',

                borderRadius: 2,

                border:
                  '1px solid #dbe6f6',

                bgcolor: '#fff',
              }}
            >
              <Box
                sx={{
                  px: 1.3,
                  py: 0.65,

                  bgcolor: '#edf4ff',

                  color: '#145fd7',

                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                {isSkill ? 'Target Skill' : 'Target Role'}
              </Box>

              <Typography
                sx={{
                  px: 1.4,

                  color: '#263858',

                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                {title}
              </Typography>
            </Box>

            {path?.category && (
              <Box
                sx={{
                  px: 1.4,
                  py: 0.65,

                  borderRadius: 2,

                  border:
                    '1px solid #dfe5ee',

                  bgcolor: '#f8f9fc',

                  color: '#56637a',

                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                {path.category}
              </Box>
            )}
          </Stack>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
        >
          <Button
  variant="outlined"
  startIcon={
    <EditRoundedIcon />
  }
  onClick={handleBack}
  sx={{
    minHeight: 42,
    px: 2,
    borderRadius: 2,
    textTransform: 'none',
    fontWeight: 700,
  }}
>
  Change Goal
</Button>

          <Button
            variant="outlined"
            startIcon={
              <DownloadRoundedIcon />
            }
            disabled
            sx={{
              minHeight: 42,
              px: 2,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
            }}
          >
            Export Plan
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={1} sx={{ mb: 2 }}>
        {error && <Alert severity="error" action={<Button onClick={refresh}>Retry</Button>}>{error}</Alert>}
        <AcceleratorSubscriptionStatus entitlement={journey.entitlement} />
        {provisioning === 'pending' && (
          <Alert severity="info" role="status" icon={<CircularProgress size={20} />}>
            Preparing your personalized {title} journey…
          </Alert>
        )}
        {provisioning === 'unavailable' && journey.state !== 'ProvisioningUnavailable' && (
          <Alert severity="info">{journeyMessages.ProvisioningUnavailable}</Alert>
        )}
        <Stack direction="row" spacing={2} alignItems="center">
          {matchingJobs != null && <Typography>{matchingJobs} matching jobs</Typography>}
          {jobsUrl && <Button component={Link} to={jobsUrl}>View jobs</Button>}
        </Stack>
        {journey.summary && <Typography>
          {journey.summary.applicationCount} applications and {journey.summary.savedJobCount} saved jobs across your account
        </Typography>}
        {journeyMessages[journey.state] && <Alert severity="info">{journeyMessages[journey.state]}</Alert>}
        {!provisioningBlocked && action && actionUrl && <Button component={Link} to={actionUrl} variant="contained" sx={{ alignSelf: 'start' }}>{action.label}</Button>}
      </Stack>

      {/* =====================================================
          NAVIGATION TABS
      ====================================================== */}

      <Box
        sx={{
          mt: 2.25,

          border:
            '1px solid #e1e7f0',

          borderRadius: 2.5,

          bgcolor: '#fff',

          overflowX: 'auto',
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={(
            _event,
            value: number,
          ) => {
            const params = new URLSearchParams(searchParams);
            const tabScreen = ['', 'roadmap', 'learning', 'jobs', 'mock-interview-setup', 'progress-insights'][value];
            if (tabScreen) params.set('screen', tabScreen); else params.delete('screen');
            setSearchParams(params);
          }}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="AI Accelerator sections"
          sx={{
            minHeight: 54,

            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 3,
            },

            '& .MuiTab-root': {
              minHeight: 54,

              px: {
                xs: 1.7,
                md: 2.3,
              },

              textTransform: 'none',

              fontWeight: 700,

              fontSize: {
                xs: '0.78rem',
                md: '0.86rem',
              },

              whiteSpace: 'nowrap',
            },
          }}
        >
          {acceleratorTabs.map(
            (tab) => (
              <Tab
                key={tab}
                label={tab}
              />
            ),
          )}
        </Tabs>
      </Box>

      {/* =====================================================
          MY ACCELERATOR
      ====================================================== */}

      {!provisioningBlocked && dashboard && (
        <Box
          sx={{
            mt: 2.5,

            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',
              lg: '270px minmax(0, 1fr)',
            },

            gap: 2.5,
          }}
        >
          {/* =================================================
              LEFT PROGRESS CARD
          ================================================== */}

          <Box
            sx={{
              p: 2.25,

              border:
                '1px solid #e0e6ef',

              borderRadius: 3,

              bgcolor: '#fff',

              alignSelf: 'start',
            }}
          >
            <Typography
              sx={{
                color: '#111a38',

                fontWeight: 800,

                fontSize: '1rem',
              }}
            >
              Your Progress
            </Typography>

            {/* PROGRESS RING */}

            <Box
              sx={{
                mt: 2,

                display: 'grid',

                placeItems: 'center',
              }}
            >
              <Box
                sx={{
                  position: 'relative',

                  width: 130,
                  height: 130,

                  borderRadius: '50%',

                  background: displayedProgress === null ? '#e9eef6' : `conic-gradient(#2878f0 ${displayedProgress}%, #e9eef6 0)`,

                  display: 'grid',

                  placeItems: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 104,
                    height: 104,

                    borderRadius: '50%',

                    bgcolor: '#fff',

                    display: 'grid',

                    placeItems: 'center',
                  }}
                >
                  <Typography
                    sx={{
                      color: '#111a38',

                      fontSize: '1.8rem',

                      fontWeight: 800,
                    }}
                  >
                    {displayedProgress === null ? <span aria-label="Progress unavailable">—</span> : `${displayedProgress}%`}
                  </Typography>
                </Box>
              </Box>

              <Typography
                sx={{
                  mt: 1.2,

                  color: '#39445f',

                  fontSize: '0.84rem',

                  fontWeight: 700,
                }}
              >
                Accelerator Progress
              </Typography>
            </Box>

            {/* JOURNEY */}

            <Box
              sx={{
                mt: 2.5,
              }}
            >
              {journeySteps.map(
                (step, index) => {
                  const styles =
                    getStepStyles(
                      step.status,
                    );

                  const isActive =
                    index ===
                    activeJourneyIndex;

                  return (
                    <Box
                      key={step.id}
                      sx={{
                        position:
                          'relative',

                        display: 'flex',

                        gap: 1.4,

                        minHeight: 48,

                        px: isActive
                          ? 1
                          : 0,

                        py: 0.4,

                        borderRadius: 2,

                        bgcolor: isActive
                          ? '#f2f7ff'
                          : 'transparent',
                      }}
                    >
                      {index <
                        journeySteps.length -
                          1 && (
                        <Box
                          sx={{
                            position:
                              'absolute',

                            left: isActive
                              ? 22
                              : 13,

                            top: 29,

                            width: 1.5,

                            height: 28,

                            bgcolor:
                              '#d9e0ea',
                          }}
                        />
                      )}

                      <Box
                        sx={{
                          position:
                            'relative',

                          zIndex: 1,

                          mt: 0.2,

                          width: 27,
                          height: 27,

                          flexShrink: 0,

                          borderRadius:
                            '50%',

                          border: `2px solid ${styles.border}`,

                          bgcolor:
                            styles.background,

                          color:
                            styles.color,

                          display:
                            'grid',

                          placeItems:
                            'center',
                        }}
                      >
                        {step.status ===
                        'completed' ? (
                          <CheckRoundedIcon
                            sx={{
                              fontSize: 17,
                            }}
                          />
                        ) : step.status ===
                          'active' ? (
                          <Box
                            sx={{
                              width: 11,
                              height: 11,

                              borderRadius:
                                '50%',

                              bgcolor:
                                '#1677ff',
                            }}
                          />
                        ) : null}
                      </Box>

                      <Typography
                        sx={{
                          pt: 0.45,

                          color: isActive
                            ? '#1464dc'
                            : '#26324b',

                          fontSize:
                            '0.84rem',

                          fontWeight:
                            isActive
                              ? 800
                              : 650,
                        }}
                      >
                        {step.label}
                      </Typography>

                      {step.status ===
                        'completed' && (
                        <CheckRoundedIcon
                          sx={{
                            ml: 'auto',

                            mt: 0.5,

                            color:
                              '#22a447',

                            fontSize: 18,
                          }}
                        />
                      )}
                    </Box>
                  );
                },
              )}
            </Box>
          </Box>

          {/* =================================================
              RIGHT AI PLAN
          ================================================== */}

          <Stack spacing={2}>
            {/* PLAN HEADER */}

            <Box
              sx={{
                p: {
                  xs: 2,
                  md: 2.4,
                },

                border:
                  '1px solid #e0e6ef',

                borderRadius: 3,

                bgcolor: '#fff',

                display: 'flex',

                flexDirection: {
                  xs: 'column',
                  sm: 'row',
                },

                alignItems: {
                  xs: 'flex-start',
                  sm: 'center',
                },

                justifyContent:
                  'space-between',

                gap: 2,
              }}
            >
              <Stack
                direction="row"
                spacing={1.3}
                alignItems="flex-start"
              >
                <AutoAwesomeRoundedIcon
                  sx={{
                    color: '#4c43ed',

                    mt: 0.2,
                  }}
                />

                <Box>
                  <Typography
                    sx={{
                      color:
                        '#111a38',

                      fontWeight: 800,

                      fontSize:
                        '1.12rem',
                    }}
                  >
                    Your AI Plan
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.25,

                      color:
                        '#69758b',

                      fontSize:
                        '0.85rem',
                    }}
                  >
                    A personalized,
                    step-by-step plan
                    for becoming a{' '}
                    {title}.
                  </Typography>
                </Box>
              </Stack>

              <Box
                sx={{
                  minWidth: 145,

                  pl: {
                    xs: 0,
                    sm: 2,
                  },

                  borderLeft: {
                    xs: 'none',
                    sm:
                      '1px solid #e5e9f0',
                  },
                }}
              >
                <Typography
                  sx={{
                    color:
                      '#667085',

                    fontSize:
                      '0.72rem',

                    fontWeight: 700,
                  }}
                >
                  Estimated Time
                </Typography>

                <Typography
                  sx={{
                    mt: 0.2,

                    color:
                      '#17213b',

                    fontWeight: 800,

                    fontSize:
                      '0.9rem',
                  }}
                >
                  {remainingTime(journey.estimatedMinutesRemaining)}
                </Typography>
              </Box>
            </Box>

            {/* PHASES */}

            <Stack spacing={1.35}>
              {planPhases.map(
                (phase) => {
                  const isCompleted =
                    phase.status ===
                    'completed';

                  const isActive =
                    phase.status ===
                    'active';

                  return (
                    <Box
                      key={phase.id}
                      sx={{
                        position:
                          'relative',

                        p: {
                          xs: 1.7,
                          md: 2,
                        },

                        border:
                          isActive
                            ? '1.5px solid #1677ff'
                            : '1px solid #e0e6ef',

                        borderRadius: 2.5,

                        bgcolor:
                          isActive
                            ? '#f7fbff'
                            : '#fff',

                        display: 'grid',

                        gridTemplateColumns: {
                          xs: '42px minmax(0, 1fr)',
                          sm:
                            '46px minmax(0, 1fr) auto',
                        },

                        gap: 1.3,

                        alignItems:
                          'center',
                      }}
                    >
                      {/* PHASE NUMBER */}

                      <Box
                        sx={{
                          width: 38,
                          height: 38,

                          borderRadius:
                            '50%',

                          bgcolor:
                            isCompleted
                              ? '#20a44b'
                              : isActive
                                ? '#1677ff'
                                : '#eef2f7',

                          color:
                            isCompleted ||
                            isActive
                              ? '#fff'
                              : '#26324b',

                          display:
                            'grid',

                          placeItems:
                            'center',

                          fontWeight: 800,
                        }}
                      >
                        {isCompleted ? (
                          <CheckRoundedIcon />
                        ) : (
                          phase.id
                        )}
                      </Box>

                      {/* CONTENT */}

                      <Box>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          useFlexGap
                          flexWrap="wrap"
                        >
                          <Typography
                            sx={{
                              color:
                                isActive
                                  ? '#1464dc'
                                  : '#17213b',

                              fontSize:
                                '0.92rem',

                              fontWeight:
                                800,
                            }}
                          >
                            Phase{' '}
                            {phase.id}
                          </Typography>

                          <Typography
                            sx={{
                              color:
                                '#17213b',

                              fontSize:
                                '0.92rem',

                              fontWeight:
                                800,
                            }}
                          >
                            {phase.title}
                          </Typography>

                          {isActive && (
                            <Typography
                              component="span"
                              sx={{
                                color:
                                  '#1464dc',

                                fontSize:
                                  '0.75rem',

                                fontWeight:
                                  800,
                              }}
                            >
                              Current phase
                            </Typography>
                          )}
                        </Stack>

                        <Typography
                          sx={{
                            mt: 0.25,

                            color:
                              '#69758b',

                            fontSize:
                              '0.8rem',

                            lineHeight:
                              1.45,
                          }}
                        >
                          {
                            phase.description
                          }
                        </Typography>
                        {phase.progressPercent != null && (
                          <Stack spacing={0.5} sx={{ mt: 1 }}>
                            <Typography variant="caption">{phase.progressPercent}% complete</Typography>
                            <LinearProgress aria-label={phase.title + " progress"} variant="determinate" value={Math.min(100, Math.max(0, phase.progressPercent))} />
                          </Stack>
                        )}

                      </Box>

                      {/* ACTION */}

                      <Box
                        sx={{
                          gridColumn: {
                            xs:
                              '1 / -1',
                            sm: 'auto',
                          },

                          justifySelf: {
                            xs: 'stretch',
                            sm: 'end',
                          },
                        }}
                      >
                        {isCompleted ? (
                          <Box
                            sx={{
                              px: 1.4,
                              py: 0.7,

                              borderRadius:
                                2,

                              bgcolor:
                                '#eaf8ef',

                              color:
                                '#15883a',

                              fontSize:
                                '0.76rem',

                              fontWeight:
                                800,
                            }}
                          >
                            Completed
                          </Box>
                        ) : isActive ? (
                          <Button
                            variant="contained"
                            endIcon={
                              <ArrowForwardRoundedIcon />
                            }
                            component={Link}
                            to={actionUrl ?? "#"}
                            disabled={!actionUrl}
                            sx={{
                              minWidth: {
                                xs:
                                  '100%',
                                sm: 130,
                              },

                              minHeight:
                                40,

                              borderRadius:
                                2,

                              textTransform:
                                'none',

                              fontWeight:
                                800,
                            }}
                          >
                            {action?.label ?? 'Action unavailable'}
                          </Button>
                        ) : (
                          <Box
                            sx={{
                              display:
                                'flex',

                              alignItems:
                                'center',

                              gap: 0.7,

                              px: 1.3,
                              py: 0.7,

                              borderRadius:
                                2,

                              bgcolor:
                                '#f3f5f8',

                              color:
                                '#667085',

                              fontSize:
                                '0.76rem',

                              fontWeight:
                                700,
                            }}
                          >
                            <LockOutlinedIcon
                              sx={{
                                fontSize:
                                  16,
                              }}
                            />

                            {phase.unlocked ? 'Not started' : 'Locked'}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                },
              )}
            </Stack>

            {/* =================================================
                QUICK ACTION CARDS
            ================================================== */}

            <Box
              sx={{
                display: 'grid',

                gridTemplateColumns: {
                  xs: '1fr',
                  sm:
                    'repeat(2, minmax(0, 1fr))',
                  xl:
                    'repeat(4, minmax(0, 1fr))',
                },

                gap: 1.5,
              }}
            >
              {[
                {
                  title:
                    'Skill Assessment',
                  description:
                    'Understand your current proficiency.',
                  icon: (
                    <PsychologyRoundedIcon />
                  ),
                },

                {
                  title:
                    'Learning Roadmap',
                  description:
                    'Follow your personalized milestones.',
                  icon: (
                    <SchoolRoundedIcon />
                  ),
                },

                {
                  title:
                    'Build Projects',
                  description:
                    'Create evidence through real tasks.',
                  icon: (
                    <RocketLaunchRoundedIcon />
                  ),
                },

                {
                  title:
                    'Interview Prep',
                  description:
                    'Practice and improve your readiness.',
                  icon: (
                    <AssignmentTurnedInRoundedIcon />
                  ),
                },
              ].map(
                (item) => {
                  const quickAction = quickActions[item.title];
                  return (
                  <Box
                    key={item.title}
                    sx={{
                      p: 1.7,

                      border:
                        '1px solid #e0e6ef',

                      borderRadius: 2.5,

                      bgcolor: '#fff',
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,

                        borderRadius: 2,

                        bgcolor:
                          '#edf4ff',

                        color:
                          '#1769e0',

                        display:
                          'grid',

                        placeItems:
                          'center',

                        '& svg': {
                          fontSize: 20,
                        },
                      }}
                    >
                      {item.icon}
                    </Box>

                    <Typography
                      sx={{
                        mt: 1.2,

                        color:
                          '#17213b',

                        fontSize:
                          '0.84rem',

                        fontWeight:
                          800,
                      }}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.35,

                        color:
                          '#778399',

                        fontSize:
                          '0.75rem',

                        lineHeight:
                          1.45,
                      }}
                    >
                      {
                        item.description
                      }
                    </Typography>
                    {quickAction?.available ? (
                      <Button component={Link} to={screenUrl(quickAction.screen)} size="small">
                        {quickAction.label}
                      </Button>
                    ) : <Typography variant="caption">Available after journey prerequisites are met.</Typography>}
                  </Box>
                  );
                },
              )}
            </Box>
          </Stack>
        </Box>
      )}

      {!provisioningBlocked && !dashboard && (
        <Box sx={{ mt: 2.5, p: { xs: 2, md: 3 }, border: '1px solid #e0e6ef', borderRadius: 3, bgcolor: '#fff' }}>
          {renderScreen()}
        </Box>
      )}
    </Box>
  );
};
