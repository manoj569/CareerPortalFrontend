import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';

import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from '@mui/material';

import { useSearchParams } from 'react-router-dom';

interface RoadmapPhase {
  id: number;
  title: string;
  description: string;
  duration: string;
  skills: string[];
  color: string;
  lightColor: string;
  borderColor: string;
}

interface SummaryItem {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBackground: string;
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
 * These values exist only for visual development.
 * During backend integration replace them with the
 * existing Accelerator roadmap / schedule / skill-gap APIs.
 */
const roadmapPhases: RoadmapPhase[] = [
  {
    id: 1,
    title: 'Foundation & Core Concepts',
    description:
      'Strengthen programming, backend fundamentals and core concepts.',
    duration: 'Weeks 1 – 2',
    skills: [
      'Programming Fundamentals',
      'Backend Basics',
      'API Fundamentals',
    ],
    color: '#15963a',
    lightColor: '#f2fbf4',
    borderColor: '#9edcaf',
  },
  {
    id: 2,
    title: 'Database & Data Management',
    description:
      'Learn database design, optimization, and real-world data handling.',
    duration: 'Weeks 3 – 4',
    skills: [
      'SQL',
      'Database Design',
      'Query Optimization',
    ],
    color: '#1269e8',
    lightColor: '#f3f7ff',
    borderColor: '#b6d0fa',
  },
  {
    id: 3,
    title: 'System Design & Scalability',
    description:
      'Build a strong foundation in system design and scalable architectures.',
    duration: 'Weeks 5 – 8',
    skills: [
      'System Design Basics',
      'Scalability',
      'Caching & Queues',
    ],
    color: '#7c3aed',
    lightColor: '#f8f4ff',
    borderColor: '#d4c0ff',
  },
  {
    id: 4,
    title: 'Build & Practice',
    description:
      'Apply your learning with projects and interview-style practice.',
    duration: 'Weeks 9 – 12',
    skills: [
      'End-to-End Project',
      'Code Practice',
      'Mock Interviews',
    ],
    color: '#ed8b00',
    lightColor: '#fff9ef',
    borderColor: '#f5d7a5',
  },
];

const skillsToBuild = [
  'Backend development and API design',
  'Database design and optimization',
  'System design and scalability',
  'Caching, queues and performance',
  'Real-world project experience',
];

const milestones = [
  {
    label: 'Complete foundation modules',
    completed: true,
  },
  {
    label: 'Build a backend project',
    completed: false,
  },
  {
    label: 'Solve 100+ practice problems',
    completed: false,
  },
  {
    label: 'Complete a system design mini-project',
    completed: false,
  },
  {
    label: 'Take a mock interview',
    completed: false,
  },
];

export const LearningRoadmapPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  /*
   * Temporary UI values.
   * These will come from candidate goal +
   * generated roadmap data during integration.
   */
  const targetRole = 'Backend Developer';
  const currentLevel = 'Fresher (0 – 1 year)';
  const roadmapDuration = '~ 12 Weeks';
  const estimatedEffort = '6 – 8 hrs / week';

  const summaryItems: SummaryItem[] = [
    {
      title: 'Target Role',
      value: targetRole,
      icon: <WorkOutlineRoundedIcon />,
      iconColor: '#1269e8',
      iconBackground: '#edf4ff',
    },
    {
      title: 'Current Level',
      value: currentLevel,
      icon: <BarChartRoundedIcon />,
      iconColor: '#1269e8',
      iconBackground: '#edf4ff',
    },
    {
      title: 'Roadmap Duration',
      value: roadmapDuration,
      icon: <TrackChangesRoundedIcon />,
      iconColor: '#c026d3',
      iconBackground: '#faefff',
    },
    {
      title: 'Estimated Effort',
      value: estimatedEffort,
      icon: <CalendarMonthRoundedIcon />,
      iconColor: '#1269e8',
      iconBackground: '#edf4ff',
    },
  ];

  const handleBack = () => {
    const params =
      new URLSearchParams(searchParams);

    params.set(
      'screen',
      'assessment-results',
    );

    setSearchParams(params);
  };

  const handleStartLearning = () => {
    const params =
      new URLSearchParams(searchParams);

    /*
     * Next screen will be the active roadmap /
     * learning dashboard.
     */
    params.set(
      'screen',
      'learning',
    );

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
      {/* HERO */}

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
          Your personalized, AI-powered journey
          from your current skills to your next
          dream role.
        </Typography>
      </Box>

      {/* HEADER */}

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

              fontWeight: 700,

              '&:hover': {
                bgcolor: 'transparent',
                color: '#0b57d0',
              },
            }}
          >
            Back to Results
          </Button>

          <Typography
            component="h2"
            sx={{
              mt: 0.4,

              color: '#101936',

              fontWeight: 850,

              fontSize: {
                xs: '1.55rem',
                md: '2rem',
              },

              letterSpacing: '-0.03em',
            }}
          >
            Your Personalized Learning Roadmap
          </Typography>

          <Typography
            sx={{
              mt: 0.3,

              color: '#26324b',

              fontSize: '0.9rem',
            }}
          >
            A step-by-step plan to close your
            skill gaps and become a{' '}
            <Box
              component="span"
              sx={{
                fontWeight: 800,
              }}
            >
              {targetRole}
            </Box>
            .
          </Typography>
        </Box>

        <RoadmapStepper />
      </Box>

      {/* SUMMARY */}

      <Box
        sx={{
          mt: 2.5,

          border:
            '1px solid #dce3ee',

          borderRadius: 3,

          bgcolor: '#fff',

          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',
            sm:
              'repeat(2, minmax(0, 1fr))',
            xl:
              'repeat(4, minmax(0, 1fr))',
          },

          overflow: 'hidden',
        }}
      >
        {summaryItems.map(
          (item, index) => (
            <SummaryCard
              key={item.title}
              item={item}
              showDivider={
                index <
                summaryItems.length - 1
              }
            />
          ),
        )}
      </Box>

      {/* MAIN CONTENT */}

      <Box
        sx={{
          mt: 2,

          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',
            xl:
              'minmax(0, 1.65fr) minmax(330px, 0.95fr)',
          },

          gap: 2,
        }}
      >
        {/* LEARNING PATH */}

        <Box
          sx={{
            border:
              '1px solid #dce3ee',

            borderRadius: 3,

            bgcolor: '#fff',

            p: {
              xs: 1.5,
              md: 2,
            },
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
                fontSize: 29,
              }}
            />

            <Typography
              sx={{
                color: '#111a38',

                fontSize: '1.15rem',

                fontWeight: 850,
              }}
            >
              Your Learning Path
            </Typography>
          </Stack>

          <Box
            sx={{
              mt: 1.8,
            }}
          >
            {roadmapPhases.map(
              (phase, index) => (
                <RoadmapPhaseCard
                  key={phase.id}
                  phase={phase}
                  isLast={
                    index ===
                    roadmapPhases.length -
                      1
                  }
                />
              ),
            )}
          </Box>
        </Box>

        {/* RIGHT COLUMN */}

        <Stack spacing={2}>
          {/* SKILLS */}

          <Box
            sx={{
              border:
                '1px solid #dce3ee',

              borderRadius: 3,

              bgcolor: '#fff',

              p: {
                xs: 1.7,
                md: 2,
              },
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <TrackChangesRoundedIcon
                sx={{
                  color: '#ef312f',
                  fontSize: 29,
                }}
              />

              <Typography
                sx={{
                  color: '#111a38',

                  fontSize: '1.1rem',

                  fontWeight: 850,
                }}
              >
                Skills You&apos;ll Build
              </Typography>
            </Stack>

            <Stack
              spacing={1}
              sx={{
                mt: 1.5,
              }}
            >
              {skillsToBuild.map(
                (skill) => (
                  <Stack
                    key={skill}
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                  >
                    <CheckRoundedIcon
                      sx={{
                        mt: 0.05,

                        color:
                          '#16a338',

                        fontSize: 21,
                      }}
                    />

                    <Typography
                      sx={{
                        color:
                          '#202b43',

                        fontSize:
                          '0.85rem',

                        lineHeight: 1.45,
                      }}
                    >
                      {skill}
                    </Typography>
                  </Stack>
                ),
              )}
            </Stack>
          </Box>

          {/* MILESTONES */}

          <Box
            sx={{
              border:
                '1px solid #dce3ee',

              borderRadius: 3,

              bgcolor: '#fff',

              p: {
                xs: 1.7,
                md: 2,
              },
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <FlagOutlinedIcon
                sx={{
                  color: '#6d35f5',
                  fontSize: 29,
                }}
              />

              <Typography
                sx={{
                  color: '#111a38',

                  fontSize: '1.1rem',

                  fontWeight: 850,
                }}
              >
                Milestones
              </Typography>
            </Stack>

            <Stack
              spacing={1.15}
              sx={{
                mt: 1.5,
              }}
            >
              {milestones.map(
                (milestone) => (
                  <Stack
                    key={
                      milestone.label
                    }
                    direction="row"
                    spacing={1.2}
                    alignItems="flex-start"
                  >
                    <Box
                      sx={{
                        mt: 0.1,

                        width: 20,
                        height: 20,

                        borderRadius:
                          '50%',

                        border:
                          milestone.completed
                            ? 'none'
                            : '2px solid #8e99aa',

                        bgcolor:
                          milestone.completed
                            ? '#20a83b'
                            : '#fff',

                        color: '#fff',

                        display: 'grid',

                        placeItems:
                          'center',

                        flexShrink: 0,
                      }}
                    >
                      {milestone.completed && (
                        <CheckRoundedIcon
                          sx={{
                            fontSize:
                              14,
                          }}
                        />
                      )}
                    </Box>

                    <Typography
                      sx={{
                        color:
                          '#202b43',

                        fontSize:
                          '0.85rem',

                        lineHeight: 1.45,

                        fontWeight:
                          milestone.completed
                            ? 700
                            : 500,
                      }}
                    >
                      {
                        milestone.label
                      }
                    </Typography>
                  </Stack>
                ),
              )}
            </Stack>
          </Box>

          {/* CTA */}

          <Box
            sx={{
              border:
                '1px solid #dce3ee',

              borderRadius: 3,

              bgcolor: '#fff',

              p: 2,
            }}
          >
            <Button
              fullWidth
              variant="contained"
              endIcon={
                <ArrowForwardRoundedIcon />
              }
              onClick={
                handleStartLearning
              }
              sx={{
                minHeight: 56,

                borderRadius: 4,

                textTransform: 'none',

                fontSize: '1rem',

                fontWeight: 850,

                boxShadow: 'none',

                background:
                  'linear-gradient(90deg, #1269ef 0%, #075cff 100%)',
              }}
            >
              Start Learning Now
            </Button>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

/* ==================================================
   STEPPER
================================================== */

const RoadmapStepper = () => (
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
      Step 3 of 5
    </Typography>

    <Stack
      direction="row"
      alignItems="flex-start"
    >
      {stepItems.map(
        (step, index) => {
          const completed =
            index < 2;

          const active =
            index === 2;

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

/* ==================================================
   SUMMARY CARD
================================================== */

interface SummaryCardProps {
  item: SummaryItem;
  showDivider: boolean;
}

const SummaryCard = ({
  item,
  showDivider,
}: SummaryCardProps) => (
  <Box
    sx={{
      position: 'relative',

      minHeight: 90,

      px: 2,
      py: 1.6,

      display: 'flex',

      alignItems: 'center',

      gap: 1.4,

      '&::after': showDivider
        ? {
            content: '""',

            position: 'absolute',

            top: '18%',
            right: 0,

            width: '1px',
            height: '64%',

            bgcolor: '#e1e6ef',

            display: {
              xs: 'none',
              xl: 'block',
            },
          }
        : undefined,
    }}
  >
    <Box
      sx={{
        width: 50,
        height: 50,

        borderRadius: 2.5,

        bgcolor:
          item.iconBackground,

        color: item.iconColor,

        display: 'grid',

        placeItems: 'center',

        flexShrink: 0,

        '& svg': {
          fontSize: 28,
        },
      }}
    >
      {item.icon}
    </Box>

    <Box>
      <Typography
        sx={{
          color: '#26324b',

          fontSize: '0.76rem',

          fontWeight: 700,
        }}
      >
        {item.title}
      </Typography>

      <Typography
        sx={{
          mt: 0.25,

          color: '#111a38',

          fontSize: '0.95rem',

          fontWeight: 850,

          lineHeight: 1.3,
        }}
      >
        {item.value}
      </Typography>
    </Box>
  </Box>
);

/* ==================================================
   ROADMAP PHASE
================================================== */

interface RoadmapPhaseCardProps {
  phase: RoadmapPhase;
  isLast: boolean;
}

const RoadmapPhaseCard = ({
  phase,
  isLast,
}: RoadmapPhaseCardProps) => (
  <Box
    sx={{
      display: 'grid',

      gridTemplateColumns:
        '48px minmax(0, 1fr)',

      gap: 1.2,
    }}
  >
    {/* TIMELINE */}

    <Box
      sx={{
        position: 'relative',

        display: 'flex',

        flexDirection: 'column',

        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,

          width: 38,
          height: 38,

          borderRadius: '50%',

          bgcolor: phase.color,

          color: '#fff',

          display: 'grid',

          placeItems: 'center',

          fontSize: '0.95rem',

          fontWeight: 900,

          border:
            '4px solid #fff',

          boxShadow:
            '0 0 0 1px #e4e8ef',
        }}
      >
        {phase.id}
      </Box>

      {!isLast && (
        <Box
          sx={{
            width: 2,

            flex: 1,

            minHeight: 38,

            bgcolor: '#cbd8ea',

            my: 0.4,
          }}
        />
      )}
    </Box>

    {/* CARD */}

    <Box
      sx={{
        mb: isLast ? 0 : 1.4,

        p: {
          xs: 1.4,
          md: 1.7,
        },

        border: `1px solid ${phase.borderColor}`,

        borderRadius: 2.5,

        bgcolor: phase.lightColor,
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
        <Typography
          sx={{
            color: '#111a38',

            fontSize: '1rem',

            fontWeight: 850,
          }}
        >
          {phase.title}
        </Typography>

        <Box
          sx={{
            px: 1.3,
            py: 0.45,

            borderRadius: 5,

            bgcolor: '#fff',

            color: phase.color,

            border: `1px solid ${phase.borderColor}`,

            fontSize: '0.73rem',

            fontWeight: 850,

            whiteSpace: 'nowrap',
          }}
        >
          {phase.duration}
        </Box>
      </Stack>

      <Typography
        sx={{
          mt: 0.35,

          color: '#344158',

          fontSize: '0.8rem',

          lineHeight: 1.45,
        }}
      >
        {phase.description}
      </Typography>

      <Stack
        direction="row"
        spacing={0.8}
        useFlexGap
        flexWrap="wrap"
        sx={{
          mt: 1.1,
        }}
      >
        {phase.skills.map(
          (skill) => (
            <Chip
              key={skill}
              label={skill}
              size="small"
              sx={{
                height: 28,

                borderRadius: 5,

                bgcolor:
                  'rgba(255,255,255,0.75)',

                border: `1px solid ${phase.borderColor}`,

                color: '#26324b',

                fontSize: '0.72rem',

                fontWeight: 700,

                '& .MuiChip-label': {
                  px: 1.3,
                },
              }}
            />
          ),
        )}
      </Stack>
    </Box>
  </Box>
);