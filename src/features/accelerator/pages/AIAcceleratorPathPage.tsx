import { useEffect, useMemo, useState } from 'react';

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
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';

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

import { useSearchParams } from 'react-router-dom';

import { getCareerPath } from '../api/acceleratorMarketApi';
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

interface JourneyStep {
  id: string;
  label: string;
  status: JourneyStatus;
}

interface PlanPhase {
  id: number;
  title: string;
  description: string;
  status: JourneyStatus;
  progress: number;
}

/*
 * IMPORTANT
 *
 * These are safe frontend defaults only.
 *
 * We intentionally DO NOT fake:
 * - assessment completion
 * - roadmap completion
 * - project completion
 * - interview completion
 * - job applications
 * - estimated weeks
 *
 * Real values will be populated from the existing Accelerator
 * backend during the integration pass.
 */
const defaultJourneySteps: JourneyStep[] = [
  {
    id: 'goal',
    label: 'Set Career Goal',
    status: 'active',
  },
  {
    id: 'assessment',
    label: 'AI Skill Assessment',
    status: 'upcoming',
  },
  {
    id: 'roadmap',
    label: 'Follow Roadmap',
    status: 'upcoming',
  },
  {
    id: 'projects',
    label: 'Build Projects',
    status: 'upcoming',
  },
  {
    id: 'interview',
    label: 'Interview Preparation',
    status: 'upcoming',
  },
  {
    id: 'jobs',
    label: 'Apply to Jobs',
    status: 'upcoming',
  },
];

const defaultPlanPhases: PlanPhase[] = [
  {
    id: 1,
    title: 'Foundation',
    description:
      'Understand your current skills and identify the most important gaps.',
    status: 'active',
    progress: 0,
  },
  {
    id: 2,
    title: 'Skill Build',
    description:
      'Learn and practice the in-demand skills required for your target role.',
    status: 'upcoming',
    progress: 0,
  },
  {
    id: 3,
    title: 'Build & Showcase',
    description:
      'Create real-world projects and build evidence of your capabilities.',
    status: 'upcoming',
    progress: 0,
  },
  {
    id: 4,
    title: 'Interview Readiness',
    description:
      'Practice interview questions, mock interviews and improve with feedback.',
    status: 'upcoming',
    progress: 0,
  },
  {
    id: 5,
    title: 'Job Application & Tracking',
    description:
      'Discover relevant opportunities, apply and track your job-search progress.',
    status: 'upcoming',
    progress: 0,
  },
];

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

  const [pathDetail, setPathDetail] =
    useState<MarketPathDetail | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [activeTab, setActiveTab] =
    useState(0);

  /*
   * These will later come from real Accelerator APIs.
   * Keep them safe instead of showing invented progress.
   */
  const progressPercent = 0;
  const estimatedTime: string | null = null;

  const journeySteps =
    defaultJourneySteps;

  const planPhases =
    defaultPlanPhases;

  useEffect(() => {
    let cancelled = false;

    const loadPath = async () => {
      if (!selectedPathId) {
        setError(
          'No career path was selected.',
        );

        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result =
          await getCareerPath(
            selectedPathId,
          );

        if (!cancelled) {
          setPathDetail(result);
        }
      } catch {
        if (!cancelled) {
          setError(
            'We could not load this career path.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadPath();

    return () => {
      cancelled = true;
    };
  }, [selectedPathId]);

  const handleBack = () => {
    const params =
      new URLSearchParams(
        searchParams,
      );

    params.delete('selected');
    params.set('type', 'career');

    setSearchParams(params);
  };

  const handleChangeGoal = () => {
  const params =
    new URLSearchParams(searchParams);

  params.set('type', 'career');
  params.set('screen', 'goal');

  setSearchParams(params);
};

  const activeJourneyIndex =
    useMemo(() => {
      const index =
        journeySteps.findIndex(
          (step) =>
            step.status === 'active',
        );

      return index >= 0 ? index : 0;
    }, [journeySteps]);

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

  if (error || !pathDetail) {
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
              onClick={handleBack}
            >
              Back
            </Button>
          }
        >
          {error ??
            'Career path was not found.'}
        </Alert>
      </Box>
    );
  }

  const path = pathDetail.path;

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
            {path.name} Path
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
                Target Role
              </Box>

              <Typography
                sx={{
                  px: 1.4,

                  color: '#263858',

                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                {path.name}
              </Typography>
            </Box>

            {path.category && (
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
  onClick={handleChangeGoal}
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
          value={activeTab}
          onChange={(
            _event,
            value: number,
          ) => setActiveTab(value)}
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

      {activeTab === 0 && (
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

                  background: `conic-gradient(
                    #2878f0 ${progressPercent * 3.6}deg,
                    #e9eef6 0deg
                  )`,

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
                    {progressPercent}%
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
                    {path.name}.
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
                  {estimatedTime ??
                    'Not calculated yet'}
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
                              Not Started
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

                        {isActive && (
                          <Box
                            sx={{
                              mt: 1.1,

                              display:
                                'flex',

                              alignItems:
                                'center',

                              gap: 1.2,
                            }}
                          >
                            <LinearProgress
                              variant="determinate"
                              value={
                                phase.progress
                              }
                              sx={{
                                flex: 1,

                                height: 7,

                                borderRadius:
                                  5,

                                bgcolor:
                                  '#e3eaf5',

                                '& .MuiLinearProgress-bar':
                                  {
                                    borderRadius:
                                      5,
                                  },
                              }}
                            />

                            <Typography
                              sx={{
                                color:
                                  '#26324b',

                                fontSize:
                                  '0.76rem',

                                fontWeight:
                                  800,
                              }}
                            >
                              {
                                phase.progress
                              }
                              %
                            </Typography>
                          </Box>
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
                            disabled
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
                            Start
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

                            Upcoming
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
                (item) => (
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
                  </Box>
                ),
              )}
            </Box>
          </Stack>
        </Box>
      )}

      {/* =====================================================
          OTHER TABS
          Their full screens are C6-C12 and will be developed
          individually after C2 approval.
      ====================================================== */}

      {activeTab !== 0 && (
        <Box
          sx={{
            mt: 2.5,

            minHeight: 350,

            p: {
              xs: 2,
              md: 3,
            },

            border:
              '1px solid #e0e6ef',

            borderRadius: 3,

            bgcolor: '#fff',

            display: 'grid',

            placeItems: 'center',
          }}
        >
          <Stack
            alignItems="center"
            spacing={1.2}
            sx={{
              maxWidth: 500,
              textAlign: 'center',
            }}
          >
            {activeTab === 1 && (
              <SchoolRoundedIcon
                sx={{
                  fontSize: 38,
                  color: '#2878f0',
                }}
              />
            )}

            {activeTab === 2 && (
              <PsychologyRoundedIcon
                sx={{
                  fontSize: 38,
                  color: '#2878f0',
                }}
              />
            )}

            {activeTab === 3 && (
              <WorkOutlineRoundedIcon
                sx={{
                  fontSize: 38,
                  color: '#2878f0',
                }}
              />
            )}

            {activeTab >= 4 && (
              <AutoAwesomeRoundedIcon
                sx={{
                  fontSize: 38,
                  color: '#2878f0',
                }}
              />
            )}

            <Typography
              sx={{
                color: '#17213b',

                fontSize: '1.1rem',

                fontWeight: 800,
              }}
            >
              {
                acceleratorTabs[
                  activeTab
                ]
              }
            </Typography>

            <Typography
              sx={{
                color: '#778399',

                fontSize: '0.86rem',

                lineHeight: 1.6,
              }}
            >
              This Accelerator section will
              be developed as its dedicated
              frontend screen.
            </Typography>
          </Stack>
        </Box>
      )}
    </Box>
  );
};