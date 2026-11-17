import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';

import {
  Box,
  Button,
  CircularProgress,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';

import { useSearchParams } from 'react-router-dom';

interface RoadmapPhase {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'progress' | 'upcoming';
  progress?: number;
}

interface UpcomingLesson {
  title: string;
  meta: string;
}

const stepItems = [
  'Goal',
  'Assessment',
  'Roadmap',
  'Build',
  'Apply',
];

/*
 * TEMPORARY FRONTEND DATA ONLY.
 *
 * This page is being built first for UI approval.
 * During backend integration replace these values
 * with the real Accelerator roadmap, progress,
 * practice, tutor and schedule APIs.
 */
const roadmapPhases: RoadmapPhase[] = [
  {
    id: 1,
    title: 'Foundation & Core Concepts',
    description:
      'Programming, backend fundamentals and core concepts.',
    status: 'completed',
  },
  {
    id: 2,
    title: 'Database & Data Management',
    description:
      'Learn database design, optimization, and real-world data handling.',
    status: 'progress',
    progress: 60,
  },
  {
    id: 3,
    title: 'System Design & Scalability',
    description:
      'System design, scalability and building resilient systems.',
    status: 'upcoming',
  },
  {
    id: 4,
    title: 'Build & Practice',
    description:
      'Projects, code practice and mock interviews.',
    status: 'upcoming',
  },
];

const upcomingLessons: UpcomingLesson[] = [
  {
    title: 'Query Optimization',
    meta: 'Module 2 • 35 min',
  },
  {
    title: 'Indexing & Performance',
    meta: 'Module 2 • 45 min',
  },
];

export const ActiveLearningPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  /*
   * Temporary visual values.
   * Replace with real candidate progress later.
   */
  const overallProgress = 32;
  const targetRole = 'Backend Developer';
  const currentLevel = 'Fresher (0 – 1 year)';

  const handleBack = () => {
    const params =
      new URLSearchParams(searchParams);

    params.set('screen', 'roadmap');

    setSearchParams(params);
  };

  const handleViewRoadmap = () => {
    const params =
      new URLSearchParams(searchParams);

    params.set('screen', 'roadmap');

    setSearchParams(params);
  };

  const handleContinueLearning = () => {
    const params =
      new URLSearchParams(searchParams);

    /*
     * C8 will be the actual learning module /
     * lesson experience.
     */
    params.set(
      'screen',
      'learning-module',
    );

    setSearchParams(params);
  };

  const handleAskAi = () => {
    const params =
      new URLSearchParams(searchParams);

    /*
     * Tutor screen will be connected later.
     */
    params.set('screen', 'ai-tutor');

    setSearchParams(params);
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
      {/* =========================================
          HERO
      ========================================== */}

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

            width: 280,
            height: 280,

            borderRadius: '50%',

            right: -70,
            top: -155,

            bgcolor:
              'rgba(255,255,255,0.08)',
          }}
        />

        <Box
          sx={{
            position: 'absolute',

            width: 180,
            height: 180,

            borderRadius: '50%',

            right: 180,
            bottom: -135,

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

            maxWidth: 780,

            color:
              'rgba(255,255,255,0.9)',

            fontSize: {
              xs: '0.84rem',
              md: '0.95rem',
            },
          }}
        >
          Your personalized, AI-powered journey
          from your current skills to your next
          dream role.
        </Typography>
      </Box>

      {/* =========================================
          PAGE HEADER
      ========================================== */}

      <Box
        sx={{
          mt: 2,

          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1fr) 420px',
          },

          gap: 3,

          alignItems: 'end',
        }}
      >
        <Box>
          <Button
            startIcon={
              <ArrowBackRoundedIcon />
            }
            onClick={handleBack}
            sx={{
              px: 0,
              minWidth: 0,

              textTransform: 'none',

              color: '#263858',

              fontWeight: 750,

              '&:hover': {
                bgcolor: 'transparent',
                color: '#0b57d0',
              },
            }}
          >
            Back to Roadmap
          </Button>

          <Typography
            component="h2"
            sx={{
              mt: 0.35,

              color: '#101936',

              fontWeight: 850,

              fontSize: {
                xs: '1.55rem',
                md: '2rem',
              },

              letterSpacing: '-0.03em',
            }}
          >
            Active Learning: Your Roadmap in
            Progress
          </Typography>

          <Typography
            sx={{
              mt: 0.35,

              color: '#26324b',

              fontSize: '0.9rem',
            }}
          >
            Follow your personalized plan,
            track your progress, and build the
            skills for{' '}
            <Box
              component="span"
              sx={{
                fontWeight: 850,
              }}
            >
              {targetRole}
            </Box>
            .
          </Typography>
        </Box>

        <LearningStepper />
      </Box>

      {/* =========================================
          PROGRESS SUMMARY
      ========================================== */}

      <Box
        sx={{
          mt: 2.5,

          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',
            xl: 'minmax(0, 1fr) 350px',
          },

          gap: 2,
        }}
      >
        <Box
          sx={{
            border:
              '1px solid #dce3ee',

            borderRadius: 3,

            bgcolor: '#fff',

            p: {
              xs: 2,
              md: 2.4,
            },

            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',
              md:
                '190px minmax(0, 1fr) 260px',
            },

            gap: 2.5,

            alignItems: 'center',
          }}
        >
          {/* PROGRESS CIRCLE */}

          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Box
              sx={{
                position: 'relative',

                width: 165,
                height: 165,

                display: 'grid',
                placeItems: 'center',
              }}
            >
              <CircularProgress
                variant="determinate"
                value={100}
                size={165}
                thickness={4.5}
                sx={{
                  position: 'absolute',
                  color: '#e7ebf2',
                }}
              />

              <CircularProgress
                variant="determinate"
                value={overallProgress}
                size={165}
                thickness={4.5}
                sx={{
                  position: 'absolute',
                  color: '#20ad3c',

                  '& .MuiCircularProgress-circle':
                    {
                      strokeLinecap:
                        'round',
                    },
                }}
              />

              <Box
                sx={{
                  textAlign: 'center',
                }}
              >
                <Typography
                  sx={{
                    color: '#111a38',

                    fontSize: '2.2rem',

                    lineHeight: 1,

                    fontWeight: 900,
                  }}
                >
                  {overallProgress}%
                </Typography>

                <Typography
                  sx={{
                    mt: 0.55,

                    color: '#263858',

                    fontSize: '0.78rem',

                    fontWeight: 700,
                  }}
                >
                  Overall Progress
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* TRACK MESSAGE */}

          <Box
            sx={{
              minHeight: 130,

              px: {
                md: 2.5,
              },

              borderLeft: {
                xs: 'none',
                md:
                  '1px solid #e5e9f0',
              },

              borderRight: {
                xs: 'none',
                md:
                  '1px solid #e5e9f0',
              },

              display: 'flex',

              flexDirection: 'column',

              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                alignSelf: 'flex-start',

                display: 'flex',

                alignItems: 'center',

                gap: 0.6,

                px: 1.2,
                py: 0.6,

                borderRadius: 5,

                bgcolor: '#dcf6df',

                color: '#167b2d',

                fontSize: '0.86rem',

                fontWeight: 850,
              }}
            >
              <CheckRoundedIcon
                sx={{
                  fontSize: 20,
                }}
              />

              You&apos;re on track! 🎉
            </Box>

            <Typography
              sx={{
                mt: 1.3,

                maxWidth: 350,

                color: '#26324b',

                fontSize: '0.9rem',

                lineHeight: 1.55,
              }}
            >
              You&apos;ve completed{' '}
              <Box
                component="span"
                sx={{
                  fontWeight: 850,
                }}
              >
                2 of 6
              </Box>{' '}
              key milestones. Keep going!
            </Typography>
          </Box>

          {/* METRICS */}

          <Stack
            divider={<Divider />}
          >
            <ProgressMetric
              icon={
                <MenuBookRoundedIcon />
              }
              value="4 / 12 Weeks"
              label="Time Elapsed"
            />

            <ProgressMetric
              icon={
                <TrackChangesRoundedIcon />
              }
              value="2 / 6 Milestones"
              label="Completed"
            />

            <ProgressMetric
              icon={
                <BarChartRoundedIcon />
              }
              value="8 / 25 Modules"
              label="Completed"
            />
          </Stack>
        </Box>

        {/* ROLE CARD */}

        <Box
          sx={{
            border:
              '1px solid #dce3ee',

            borderRadius: 3,

            bgcolor: '#fff',

            p: 1.3,
          }}
        >
          <Box
            sx={{
              height: '100%',

              borderRadius: 2.5,

              p: 2,

              background:
                'linear-gradient(145deg, #f4f7ff 0%, #f8f6ff 100%)',
            }}
          >
            <RoleInfo
              icon={
                <TrackChangesRoundedIcon />
              }
              label="Target Role"
              value={targetRole}
              color="#7c2df3"
            />

            <Divider
              sx={{
                my: 1.8,
              }}
            />

            <RoleInfo
              icon={
                <BarChartRoundedIcon />
              }
              label="Current Level"
              value={currentLevel}
              color="#1269e8"
            />
          </Box>
        </Box>
      </Box>

      {/* =========================================
          MAIN LEARNING AREA
      ========================================== */}

      <Box
        sx={{
          mt: 2,

          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',
            xl:
              'minmax(0, 1.55fr) minmax(340px, 0.95fr)',
          },

          gap: 2,
        }}
      >
        {/* LEFT COLUMN */}

        <Stack spacing={2}>
          {/* ROADMAP */}

          <Box
            sx={{
              border:
                '1px solid #dce3ee',

              borderRadius: 3,

              bgcolor: '#fff',

              p: {
                xs: 1.6,
                md: 2,
              },
            }}
          >
            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              justifyContent="space-between"
              alignItems={{
                xs: 'flex-start',
                sm: 'center',
              }}
              spacing={1}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <MenuBookRoundedIcon
                  sx={{
                    color: '#1269e8',
                    fontSize: 30,
                  }}
                />

                <Typography
                  sx={{
                    color: '#111a38',

                    fontSize: '1.15rem',

                    fontWeight: 850,
                  }}
                >
                  Your Learning Roadmap
                </Typography>
              </Stack>

              <Button
                endIcon={
                  <ArrowForwardRoundedIcon />
                }
                onClick={
                  handleViewRoadmap
                }
                sx={{
                  textTransform: 'none',

                  fontWeight: 800,
                }}
              >
                View Full Roadmap
              </Button>
            </Stack>

            <Stack
              spacing={1}
              sx={{
                mt: 1.6,
              }}
            >
              {roadmapPhases.map(
                (phase) => (
                  <LearningPhaseCard
                    key={phase.id}
                    phase={phase}
                  />
                ),
              )}
            </Stack>
          </Box>

          {/* AI ASSISTANT */}

          <Box
            sx={{
              border:
                '1px solid #eadcff',

              borderRadius: 3,

              bgcolor: '#fff',

              p: 1,
            }}
          >
            <Box
              sx={{
                borderRadius: 2.4,

                px: {
                  xs: 1.4,
                  md: 2,
                },

                py: 1.5,

                background:
                  'linear-gradient(90deg, #fbf5ff 0%, #f6edff 100%)',

                display: 'flex',

                flexDirection: {
                  xs: 'column',
                  sm: 'row',
                },

                justifyContent:
                  'space-between',

                alignItems: {
                  xs: 'stretch',
                  sm: 'center',
                },

                gap: 1.5,
              }}
            >
              <Stack
                direction="row"
                spacing={1.3}
                alignItems="center"
              >
                <PsychologyRoundedIcon
                  sx={{
                    color: '#7d2ff2',

                    fontSize: 34,
                  }}
                />

                <Box>
                  <Typography
                    sx={{
                      color:
                        '#111a38',

                      fontSize:
                        '1rem',

                      fontWeight: 850,
                    }}
                  >
                    AI Learning Assistant
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.15,

                      color:
                        '#39455d',

                      fontSize:
                        '0.8rem',
                    }}
                  >
                    Get personalized help,
                    explain concepts, and
                    practice with AI.
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="outlined"
                startIcon={
                  <AutoAwesomeRoundedIcon />
                }
                onClick={handleAskAi}
                sx={{
                  borderRadius: 4,

                  textTransform: 'none',

                  fontWeight: 800,

                  whiteSpace: 'nowrap',

                  borderColor:
                    '#8b3cf5',

                  color: '#6921df',
                }}
              >
                Ask AI Assistant
              </Button>
            </Box>
          </Box>
        </Stack>

        {/* RIGHT COLUMN */}

        <Stack spacing={2}>
          {/* CONTINUE LEARNING */}

          <Box
            sx={{
              border:
                '1px solid #dce3ee',

              borderRadius: 3,

              bgcolor: '#fff',

              p: 1.7,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <PlayArrowRoundedIcon
                sx={{
                  color: '#1269e8',

                  fontSize: 30,
                }}
              />

              <Typography
                sx={{
                  color: '#111a38',

                  fontSize: '1.1rem',

                  fontWeight: 850,
                }}
              >
                Continue Learning
              </Typography>
            </Stack>

            <Box
              sx={{
                mt: 1.3,

                border:
                  '1px solid #dfe5ee',

                borderRadius: 2.5,

                p: 1.5,

                display: 'grid',

                gridTemplateColumns:
                  '64px minmax(0, 1fr)',

                gap: 1.4,

                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,

                  borderRadius: 2,

                  bgcolor: '#eee3ff',

                  color: '#5525ee',

                  display: 'grid',

                  placeItems: 'center',
                }}
              >
                <CodeRoundedIcon
                  sx={{
                    fontSize: 34,
                  }}
                />
              </Box>

              <Box
                sx={{
                  minWidth: 0,
                }}
              >
                <Typography
                  sx={{
                    color:
                      '#111a38',

                    fontSize:
                      '0.9rem',

                    fontWeight: 850,
                  }}
                >
                  Database Design –
                  Fundamentals
                </Typography>

                <Typography
                  sx={{
                    mt: 0.15,

                    color:
                      '#58657a',

                    fontSize:
                      '0.76rem',
                  }}
                >
                  Module 2 • 40 min
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    mt: 1,
                  }}
                >
                  <LinearProgress
                    variant="determinate"
                    value={60}
                    sx={{
                      height: 8,

                      flex: 1,

                      borderRadius: 5,

                      bgcolor:
                        '#e4e8ef',

                      '& .MuiLinearProgress-bar':
                        {
                          borderRadius:
                            5,

                          backgroundColor:
                            '#20ad3c',
                        },
                    }}
                  />

                  <Typography
                    sx={{
                      color:
                        '#111a38',

                      fontSize:
                        '0.8rem',

                      fontWeight: 850,
                    }}
                  >
                    60%
                  </Typography>
                </Stack>
              </Box>
            </Box>

            <Button
              fullWidth
              variant="contained"
              endIcon={
                <ArrowForwardRoundedIcon />
              }
              onClick={
                handleContinueLearning
              }
              sx={{
                mt: 1.3,

                minHeight: 48,

                borderRadius: 4,

                textTransform: 'none',

                fontWeight: 850,

                fontSize: '0.95rem',

                boxShadow: 'none',

                background:
                  'linear-gradient(90deg, #1269ef 0%, #075cff 100%)',
              }}
            >
              Continue Learning
            </Button>
          </Box>

          {/* UPCOMING */}

          <Box
            sx={{
              border:
                '1px solid #dce3ee',

              borderRadius: 3,

              bgcolor: '#fff',

              p: 1.7,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <CalendarMonthRoundedIcon
                sx={{
                  color: '#1269e8',

                  fontSize: 28,
                }}
              />

              <Typography
                sx={{
                  color: '#111a38',

                  fontSize: '1.1rem',

                  fontWeight: 850,
                }}
              >
                Upcoming Next
              </Typography>
            </Stack>

            <Stack
              divider={<Divider />}
              sx={{
                mt: 1,
              }}
            >
              {upcomingLessons.map(
                (lesson) => (
                  <UpcomingLessonRow
                    key={lesson.title}
                    lesson={lesson}
                  />
                ),
              )}
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

/* ===============================================
   STEPPER
================================================ */

const LearningStepper = () => (
  <Box
    sx={{
      display: {
        xs: 'none',
        md: 'block',
      },
    }}
  >
    <Typography
      sx={{
        mb: 1.2,

        color: '#17213b',

        fontSize: '0.8rem',

        fontWeight: 800,
      }}
    >
      Step 4 of 5
    </Typography>

    <Stack
      direction="row"
      alignItems="flex-start"
    >
      {stepItems.map(
        (step, index) => {
          const completed =
            index < 3;

          const active =
            index === 3;

          return (
            <Box
              key={step}
              sx={{
                flex:
                  index <
                  stepItems.length - 1
                    ? 1
                    : 'none',

                minWidth: 68,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,

                    borderRadius: '50%',

                    border:
                      completed ||
                      active
                        ? '2px solid #1677ff'
                        : '2px solid #c5cedb',

                    bgcolor:
                      completed ||
                      active
                        ? '#1677ff'
                        : '#fff',

                    color:
                      completed ||
                      active
                        ? '#fff'
                        : '#8d99aa',

                    display: 'grid',

                    placeItems: 'center',

                    fontSize:
                      '0.75rem',

                    fontWeight: 800,

                    flexShrink: 0,
                  }}
                >
                  {completed ? (
                    <CheckRoundedIcon
                      sx={{
                        fontSize: 17,
                      }}
                    />
                  ) : (
                    index + 1
                  )}
                </Box>

                {index <
                  stepItems.length -
                    1 && (
                  <Box
                    sx={{
                      height: 2,

                      flex: 1,

                      bgcolor:
                        completed
                          ? '#1677ff'
                          : '#d9e1ed',
                    }}
                  />
                )}
              </Stack>

              <Typography
                sx={{
                  mt: 0.65,

                  color:
                    completed ||
                    active
                      ? '#17213b'
                      : '#58657a',

                  fontSize:
                    '0.72rem',

                  fontWeight:
                    active
                      ? 800
                      : 600,
                }}
              >
                {step}
              </Typography>
            </Box>
          );
        },
      )}
    </Stack>
  </Box>
);

/* ===============================================
   PROGRESS METRIC
================================================ */

interface ProgressMetricProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const ProgressMetric = ({
  icon,
  value,
  label,
}: ProgressMetricProps) => (
  <Stack
    direction="row"
    spacing={1.2}
    alignItems="center"
    sx={{
      py: 1.05,
    }}
  >
    <Box
      sx={{
        color: '#1269e8',

        display: 'grid',

        placeItems: 'center',

        '& svg': {
          fontSize: 28,
        },
      }}
    >
      {icon}
    </Box>

    <Box>
      <Typography
        sx={{
          color: '#111a38',

          fontSize: '0.95rem',

          fontWeight: 850,
        }}
      >
        {value}
      </Typography>

      <Typography
        sx={{
          mt: 0.05,

          color: '#58657a',

          fontSize: '0.73rem',
        }}
      >
        {label}
      </Typography>
    </Box>
  </Stack>
);

/* ===============================================
   ROLE INFO
================================================ */

interface RoleInfoProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const RoleInfo = ({
  icon,
  label,
  value,
  color,
}: RoleInfoProps) => (
  <Stack
    direction="row"
    spacing={1.4}
    alignItems="flex-start"
  >
    <Box
      sx={{
        color,

        pt: 0.15,

        '& svg': {
          fontSize: 30,
        },
      }}
    >
      {icon}
    </Box>

    <Box>
      <Typography
        sx={{
          color: '#26324b',

          fontSize: '0.78rem',

          fontWeight: 700,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.25,

          color: '#111a38',

          fontSize: '0.98rem',

          fontWeight: 850,
        }}
      >
        {value}
      </Typography>
    </Box>
  </Stack>
);

/* ===============================================
   ROADMAP PHASE CARD
================================================ */

interface LearningPhaseCardProps {
  phase: RoadmapPhase;
}

const LearningPhaseCard = ({
  phase,
}: LearningPhaseCardProps) => {
  const completed =
    phase.status === 'completed';

  const inProgress =
    phase.status === 'progress';

  return (
    <Box
      sx={{
        display: 'grid',

        gridTemplateColumns:
          '42px minmax(0, 1fr)',

        gap: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',

          justifyContent: 'center',

          pt: 1.2,
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,

            borderRadius: '50%',

            bgcolor: completed
              ? '#20a83b'
              : inProgress
                ? '#1269e8'
                : '#a9b1c1',

            color: '#fff',

            display: 'grid',

            placeItems: 'center',

            fontWeight: 850,

            flexShrink: 0,
          }}
        >
          {completed ? (
            <CheckRoundedIcon
              sx={{
                fontSize: 18,
              }}
            />
          ) : (
            phase.id
          )}
        </Box>
      </Box>

      <Box
        sx={{
          border: inProgress
            ? '1px solid #b9d3ff'
            : '1px solid #e1e6ee',

          borderRadius: 2.5,

          bgcolor: inProgress
            ? '#f6f9ff'
            : '#fff',

          px: {
            xs: 1.3,
            md: 1.6,
          },

          py: 1.25,
        }}
      >
        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          justifyContent="space-between"
          alignItems={{
            xs: 'flex-start',
            sm: 'center',
          }}
          spacing={1}
        >
          <Box>
            <Typography
              sx={{
                color: '#111a38',

                fontSize: '0.9rem',

                fontWeight: 850,
              }}
            >
              {phase.id}. {phase.title}
            </Typography>

            <Typography
              sx={{
                mt: 0.2,

                color: '#455168',

                fontSize: '0.75rem',

                lineHeight: 1.4,
              }}
            >
              {phase.description}
            </Typography>
          </Box>

          {completed && (
            <Box
              sx={{
                px: 1.3,
                py: 0.45,

                borderRadius: 5,

                bgcolor: '#dcf6df',

                color: '#14792c',

                fontSize: '0.72rem',

                fontWeight: 850,

                whiteSpace: 'nowrap',
              }}
            >
              ✓ Completed
            </Box>
          )}

          {phase.status ===
            'upcoming' && (
            <Box
              sx={{
                px: 1.3,
                py: 0.45,

                borderRadius: 5,

                bgcolor: '#f0f2f6',

                color: '#687489',

                fontSize: '0.72rem',

                fontWeight: 750,

                whiteSpace: 'nowrap',
              }}
            >
              Upcoming
            </Box>
          )}
        </Stack>

        {inProgress && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              mt: 1,
            }}
          >
            <LinearProgress
              variant="determinate"
              value={
                phase.progress ?? 0
              }
              sx={{
                flex: 1,

                height: 7,

                borderRadius: 5,

                bgcolor: '#e1e6ef',

                '& .MuiLinearProgress-bar':
                  {
                    borderRadius: 5,

                    backgroundColor:
                      '#1269e8',
                  },
              }}
            />

            <Typography
              sx={{
                minWidth: 100,

                color: '#075fd6',

                fontSize: '0.73rem',

                fontWeight: 850,

                textAlign: 'right',
              }}
            >
              In Progress (
              {phase.progress}%)
            </Typography>
          </Stack>
        )}
      </Box>
    </Box>
  );
};

/* ===============================================
   UPCOMING LESSON
================================================ */

interface UpcomingLessonRowProps {
  lesson: UpcomingLesson;
}

const UpcomingLessonRow = ({
  lesson,
}: UpcomingLessonRowProps) => (
  <Stack
    direction="row"
    spacing={1.2}
    alignItems="center"
    sx={{
      py: 1.25,
    }}
  >
    <Box
      sx={{
        width: 44,
        height: 44,

        borderRadius: '50%',

        bgcolor: '#eee6ff',

        color: '#5d2bea',

        display: 'grid',

        placeItems: 'center',

        flexShrink: 0,
      }}
    >
      <PlayArrowRoundedIcon />
    </Box>

    <Box
      sx={{
        flex: 1,
        minWidth: 0,
      }}
    >
      <Typography
        sx={{
          color: '#111a38',

          fontSize: '0.84rem',

          fontWeight: 850,
        }}
      >
        {lesson.title}
      </Typography>

      <Typography
        sx={{
          mt: 0.15,

          color: '#58657a',

          fontSize: '0.73rem',
        }}
      >
        {lesson.meta}
      </Typography>
    </Box>

    <LockOutlinedIcon
      sx={{
        color: '#7c8798',

        fontSize: 21,
      }}
    />
  </Stack>
);