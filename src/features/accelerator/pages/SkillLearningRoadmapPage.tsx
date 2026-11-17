import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

type ModuleStatus =
  | 'completed'
  | 'in-progress'
  | 'not-started';

type RoadmapModule = {
  id: number;
  title: string;
  description: string;
  lessons: number;
  hours: number;
  status: ModuleStatus;
  icon: ReactNode;
};

const roadmapModules: RoadmapModule[] = [
  {
    id: 1,
    title: 'State Management',
    description:
      'Context API, state handling, global state',
    lessons: 4,
    hours: 3,
    status: 'in-progress',
    icon: <LayersRoundedIcon />,
  },
  {
    id: 2,
    title: 'Working with APIs',
    description:
      'API integration, error handling, loading states',
    lessons: 5,
    hours: 4,
    status: 'not-started',
    icon: <CodeRoundedIcon />,
  },
  {
    id: 3,
    title: 'Advanced React Patterns',
    description:
      'Custom hooks, optimization, reusability',
    lessons: 4,
    hours: 3,
    status: 'not-started',
    icon: <LayersRoundedIcon />,
  },
  {
    id: 4,
    title: 'Testing in React',
    description:
      'Unit testing, component testing, best practices',
    lessons: 3,
    hours: 2,
    status: 'not-started',
    icon: <ScienceRoundedIcon />,
  },
  {
    id: 5,
    title: 'Performance & Optimization',
    description:
      'Memoization, lazy loading, code splitting',
    lessons: 4,
    hours: 3,
    status: 'not-started',
    icon: <RocketLaunchRoundedIcon />,
  },
  {
    id: 6,
    title: 'Build & Deployment',
    description:
      'Production build, hosting, CI/CD basics',
    lessons: 3,
    hours: 2,
    status: 'not-started',
    icon: <RocketLaunchRoundedIcon />,
  },
];

const outcomes = [
  'Strengthen your weak areas',
  'Reach Intermediate React level',
  'Build a real-world project',
  'Get job-ready with practical skills',
];

const Panel = ({
  children,
}: {
  children: ReactNode;
}) => (
  <Box
    sx={{
      bgcolor: '#fff',
      border: '1px solid #e3e8f0',
      borderRadius: 3,
      p: {
        xs: 2,
        md: 2.3,
      },
      boxShadow:
        '0 4px 16px rgba(15, 23, 42, 0.035)',
    }}
  >
    {children}
  </Box>
);

const SummaryCard = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) => (
  <Box
    sx={{
      bgcolor: '#fff',
      border: '1px solid #e1e6ee',
      borderRadius: 2.7,
      px: 1.6,
      py: 1.4,
      minHeight: 80,
      display: 'flex',
      alignItems: 'center',
      gap: 1.2,
      boxShadow:
        '0 3px 12px rgba(15,23,42,0.03)',
    }}
  >
    <Box
      sx={{
        width: 44,
        height: 44,
        flexShrink: 0,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        bgcolor: '#f2efff',
        color: '#563cf0',
        '& svg': {
          fontSize: 23,
        },
      }}
    >
      {icon}
    </Box>

    <Box>
      <Typography
        sx={{
          color: '#667085',
          fontSize: '0.7rem',
          lineHeight: 1.2,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.25,
          color: '#172033',
          fontWeight: 900,
          fontSize: '0.9rem',
          lineHeight: 1.25,
        }}
      >
        {value}
      </Typography>
    </Box>
  </Box>
);

const statusLabel = (
  status: ModuleStatus,
) => {
  if (status === 'completed') {
    return 'Completed';
  }

  if (status === 'in-progress') {
    return 'In Progress';
  }

  return 'Not Started';
};

const statusChipStyle = (
  status: ModuleStatus,
) => {
  if (status === 'completed') {
    return {
      bgcolor: '#dcf8ea',
      color: '#087a52',
    };
  }

  if (status === 'in-progress') {
    return {
      bgcolor: '#dff8ea',
      color: '#0b8b5e',
    };
  }

  return {
    bgcolor: '#f1f3f7',
    color: '#536174',
  };
};

export const SkillLearningRoadmapPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  /*
   * TEMPORARY UI VALUES
   *
   * Later these must come from:
   * - selected Skill Path
   * - Skill Goal
   * - Skill Gap Analysis
   * - generated roadmap API
   */
  const skillName = 'React';
  const primaryGoal = 'Get a Job';
  const targetLevel = 'Intermediate';
  const timeline = '4 - 6 Weeks';

  const totalModules = roadmapModules.length;

  const completedModules =
    roadmapModules.filter(
      (module) =>
        module.status === 'completed',
    ).length;

  const inProgressModules =
    roadmapModules.filter(
      (module) =>
        module.status === 'in-progress',
    ).length;

  const notStartedModules =
    roadmapModules.filter(
      (module) =>
        module.status === 'not-started',
    ).length;

  /*
   * UI mock shows 17%.
   * This represents 1 active module out of 6.
   */
  const roadmapProgress = 17;

  const navigateToScreen = (
    screen: string,
  ) => {
    const params =
      new URLSearchParams(searchParams);

    params.set('type', 'skill');
    params.set('screen', screen);

    setSearchParams(params);
  };

  const handlePrevious = () => {
    navigateToScreen(
      'skill-assessment-results',
    );
  };

  const handleStartModule = () => {
    /*
     * S7 - Active Learning.
     *
     * Later we can also pass the selected
     * roadmap/module id returned by backend.
     */
    const params =
      new URLSearchParams(searchParams);

    params.set('type', 'skill');
    params.set(
      'screen',
      'skill-learning',
    );
    params.set('module', '1');

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
          xs: 2,
          md: 2.5,
        },
      }}
    >
      {/* Back */}
      <Button
        startIcon={
          <ArrowBackRoundedIcon />
        }
        onClick={handlePrevious}
        sx={{
          mb: 2,
          px: 0,
          minWidth: 0,
          color: '#46536a',
          textTransform: 'none',
          fontWeight: 700,
          '&:hover': {
            bgcolor: 'transparent',
            color: '#4338ca',
          },
        }}
      >
        Back to Skill Gap Results
      </Button>

      {/* Hero */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          color: '#fff',
          background:
            'linear-gradient(120deg, #302b87 0%, #4338ca 48%, #7959f5 100%)',
          px: {
            xs: 2.5,
            md: 4,
          },
          py: {
            xs: 2.7,
            md: 3.1,
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            right: -100,
            top: -170,
            borderRadius: '50%',
            bgcolor:
              'rgba(255,255,255,0.07)',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            width: 180,
            height: 180,
            right: 150,
            bottom: -130,
            borderRadius: '50%',
            bgcolor:
              'rgba(255,255,255,0.05)',
          }}
        />

        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          spacing={2.2}
          alignItems={{
            xs: 'flex-start',
            sm: 'center',
          }}
          sx={{
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              width: 74,
              height: 74,
              flexShrink: 0,
              borderRadius: 3,
              display: 'grid',
              placeItems: 'center',
              bgcolor:
                'rgba(255,255,255,0.12)',
              border:
                '1px solid rgba(255,255,255,0.18)',
            }}
          >
            <CodeRoundedIcon
              sx={{
                fontSize: 40,
                color: '#67e8f9',
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              component="h1"
              sx={{
                fontWeight: 900,
                fontSize: {
                  xs: '1.55rem',
                  md: '2rem',
                },
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
              }}
            >
              {skillName} Learning Roadmap
            </Typography>

            <Typography
              sx={{
                mt: 0.65,
                color:
                  'rgba(255,255,255,0.88)',
                fontSize: {
                  xs: '0.86rem',
                  md: '0.96rem',
                },
                lineHeight: 1.5,
              }}
            >
              A personalized, step-by-step
              plan to fill your skill gaps and
              reach {targetLevel} level.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Summary */}
      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 1.5,
        }}
      >
        <SummaryCard
          icon={
            <TrackChangesRoundedIcon />
          }
          label="Your Goal"
          value={primaryGoal}
        />

        <SummaryCard
          icon={<BarChartRoundedIcon />}
          label="Target Level"
          value={targetLevel}
        />

        <SummaryCard
          icon={
            <CalendarMonthRoundedIcon />
          }
          label="Timeline"
          value={timeline}
        />

        <SummaryCard
          icon={
            <TrackChangesRoundedIcon />
          }
          label="Total Modules"
          value={`${totalModules} Modules`}
        />
      </Box>

      {/* Main content */}
      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 2fr) minmax(290px, 0.95fr)',
          },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {/* Roadmap */}
        <Panel>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <RocketLaunchRoundedIcon
              sx={{
                color: '#5138e8',
              }}
            />

            <Typography
              sx={{
                color: '#172033',
                fontWeight: 900,
                fontSize: '1.05rem',
              }}
            >
              Your Learning Roadmap
            </Typography>
          </Stack>

          <Stack spacing={1.1}>
            {roadmapModules.map(
              (module, index) => {
                const active =
                  module.status ===
                  'in-progress';

                const completed =
                  module.status ===
                  'completed';

                const locked =
                  module.status ===
                  'not-started';

                const chipStyle =
                  statusChipStyle(
                    module.status,
                  );

                return (
                  <Box
                    key={module.id}
                    sx={{
                      position: 'relative',
                      pl: {
                        xs: 0,
                        sm: 6,
                      },
                    }}
                  >
                    {/* vertical line */}
                    {index <
                      roadmapModules.length -
                        1 && (
                      <Box
                        sx={{
                          display: {
                            xs: 'none',
                            sm: 'block',
                          },
                          position:
                            'absolute',
                          left: 20,
                          top: 43,
                          width: 2,
                          height:
                            'calc(100% + 10px)',
                          bgcolor:
                            completed ||
                            active
                              ? '#bfead9'
                              : '#dde2ea',
                        }}
                      />
                    )}

                    {/* number */}
                    <Box
                      sx={{
                        display: {
                          xs: 'none',
                          sm: 'grid',
                        },
                        position:
                          'absolute',
                        left: 3,
                        top: 14,
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        placeItems:
                          'center',
                        bgcolor:
                          completed ||
                          active
                            ? '#0daf7d'
                            : '#eef1f5',
                        color:
                          completed ||
                          active
                            ? '#fff'
                            : '#344054',
                        border:
                          completed ||
                          active
                            ? 'none'
                            : '1px solid #d4dae4',
                        fontWeight: 900,
                        fontSize:
                          '0.8rem',
                        zIndex: 1,
                      }}
                    >
                      {completed ? (
                        <CheckCircleRoundedIcon
                          sx={{
                            fontSize: 20,
                          }}
                        />
                      ) : (
                        module.id
                      )}
                    </Box>

                    {/* module card */}
                    <Box
                      sx={{
                        borderRadius: 2.5,
                        border: active
                          ? '1.5px solid #2bc38c'
                          : '1px solid #e0e5ed',
                        bgcolor: active
                          ? '#f1fcf7'
                          : '#fff',
                        px: {
                          xs: 1.3,
                          sm: 1.6,
                        },
                        py: 1.25,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: {
                            xs: '1fr',
                            md: 'minmax(0, 1fr) auto auto auto',
                          },
                          gap: {
                            xs: 1,
                            md: 1.5,
                          },
                          alignItems:
                            'center',
                        }}
                      >
                        {/* title */}
                        <Stack
                          direction="row"
                          spacing={1.3}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 42,
                              height: 42,
                              flexShrink: 0,
                              borderRadius: 2,
                              display:
                                'grid',
                              placeItems:
                                'center',
                              bgcolor:
                                '#f2efff',
                              color:
                                '#563cf0',
                              '& svg': {
                                fontSize:
                                  23,
                              },
                            }}
                          >
                            {module.icon}
                          </Box>

                          <Box>
                            <Typography
                              sx={{
                                color:
                                  '#172033',
                                fontWeight:
                                  900,
                                fontSize:
                                  '0.86rem',
                              }}
                            >
                              {
                                module.title
                              }
                            </Typography>

                            <Typography
                              sx={{
                                mt: 0.2,
                                color:
                                  '#667085',
                                fontSize:
                                  '0.7rem',
                                lineHeight:
                                  1.35,
                              }}
                            >
                              {
                                module.description
                              }
                            </Typography>
                          </Box>
                        </Stack>

                        <Chip
                          label={statusLabel(
                            module.status,
                          )}
                          size="small"
                          sx={{
                            justifySelf: {
                              xs: 'start',
                              md: 'center',
                            },
                            bgcolor:
                              chipStyle.bgcolor,
                            color:
                              chipStyle.color,
                            fontWeight: 800,
                            fontSize:
                              '0.65rem',
                          }}
                        />

                        <Box
                          sx={{
                            minWidth: 80,
                          }}
                        >
                          <Typography
                            sx={{
                              color:
                                '#172033',
                              fontWeight: 800,
                              fontSize:
                                '0.72rem',
                            }}
                          >
                            {
                              module.lessons
                            }{' '}
                            Lessons
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.15,
                              color:
                                '#667085',
                              fontSize:
                                '0.68rem',
                            }}
                          >
                            ~ {module.hours}{' '}
                            Hours
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius:
                              '50%',
                            display: 'grid',
                            placeItems:
                              'center',
                            bgcolor: active
                              ? '#fff'
                              : '#f4f5f8',
                            color: active
                              ? '#563cf0'
                              : '#526079',
                            border:
                              active
                                ? '1.5px solid #563cf0'
                                : 'none',
                          }}
                        >
                          {active ? (
                            <PlayArrowRoundedIcon
                              sx={{
                                fontSize:
                                  20,
                              }}
                            />
                          ) : locked ? (
                            <LockRoundedIcon
                              sx={{
                                fontSize:
                                  18,
                              }}
                            />
                          ) : (
                            <CheckCircleRoundedIcon
                              sx={{
                                fontSize:
                                  20,
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              },
            )}
          </Stack>
        </Panel>

        {/* Right */}
        <Stack spacing={2}>
          {/* Progress */}
          <Panel>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <BarChartRoundedIcon
                sx={{
                  color: '#5138e8',
                }}
              />

              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                }}
              >
                Roadmap Progress
              </Typography>
            </Stack>

            <Box
              sx={{
                position: 'relative',
                width: 120,
                height: 120,
                mx: 'auto',
                mt: 2,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: `conic-gradient(
                    #0daf7d 0% ${roadmapProgress}%,
                    #e2e7ed ${roadmapProgress}% 100%
                  )`,
                }}
              />

              <Box
                sx={{
                  position: 'absolute',
                  inset: 13,
                  borderRadius: '50%',
                  bgcolor: '#fff',
                }}
              />

              <Typography
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  color: '#0aaa79',
                  fontWeight: 950,
                  fontSize: '1.45rem',
                }}
              >
                {roadmapProgress}%
              </Typography>
            </Box>

            <Typography
              sx={{
                mt: 1.2,
                textAlign: 'center',
                color: '#172033',
                fontWeight: 800,
                fontSize: '0.8rem',
              }}
            >
              1 of {totalModules} Modules
              Started
            </Typography>

            <LinearProgress
              variant="determinate"
              value={roadmapProgress}
              sx={{
                mt: 1.7,
                height: 8,
                borderRadius: 99,
                bgcolor: '#e4e8ee',
                '& .MuiLinearProgress-bar':
                  {
                    borderRadius: 99,
                    bgcolor: '#0daf7d',
                  },
              }}
            />

            <Stack
              spacing={1.1}
              sx={{ mt: 1.7 }}
            >
              <ProgressItem
                color="#22c985"
                label="Completed"
                value={String(
                  completedModules,
                )}
              />

              <ProgressItem
                color="#563cf0"
                label="In Progress"
                value={String(
                  inProgressModules,
                )}
              />

              <ProgressItem
                color="#7d8999"
                label="Not Started"
                value={String(
                  notStartedModules,
                )}
              />
            </Stack>
          </Panel>

          {/* Achievements */}
          <Panel>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <EmojiEventsRoundedIcon
                sx={{
                  color: '#5138e8',
                }}
              />

              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                }}
              >
                What You&apos;ll Achieve
              </Typography>
            </Stack>

            <Stack
              spacing={1.25}
              sx={{ mt: 1.7 }}
            >
              {outcomes.map((outcome) => (
                <Stack
                  key={outcome}
                  direction="row"
                  spacing={1}
                  alignItems="flex-start"
                >
                  <CheckCircleRoundedIcon
                    sx={{
                      mt: '1px',
                      color: '#0daf7d',
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  />

                  <Typography
                    sx={{
                      color: '#344054',
                      fontSize: '0.79rem',
                      lineHeight: 1.45,
                    }}
                  >
                    {outcome}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Panel>
        </Stack>
      </Box>

      {/* Actions */}
      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{
          mt: 2.5,
          pt: 2,
          borderTop:
            '1px solid #e8ebf0',
        }}
      >
        <Button
          variant="outlined"
          startIcon={
            <ArrowBackRoundedIcon />
          }
          onClick={handlePrevious}
          sx={{
            minHeight: 48,
            px: 3,
            borderRadius: 2.2,
            textTransform: 'none',
            fontWeight: 850,
          }}
        >
          Previous
        </Button>

        <Button
          variant="contained"
          endIcon={
            <ArrowForwardRoundedIcon />
          }
          onClick={handleStartModule}
          sx={{
            minHeight: 50,
            minWidth: {
              xs: '100%',
              sm: 300,
            },
            px: 3,
            borderRadius: 2.2,
            textTransform: 'none',
            fontWeight: 850,
            boxShadow: 'none',
            background:
              'linear-gradient(90deg, #6134f3, #5138e8)',
          }}
        >
          Start Next Module
        </Button>
      </Stack>

      <Typography
        sx={{
          mt: 1.2,
          textAlign: 'center',
          color: '#98a2b3',
          fontSize: '0.69rem',
        }}
      >
        Roadmap modules and progress are
        temporary UI data until the Skill Path
        roadmap generation and progress APIs are
        connected.
      </Typography>
    </Box>
  );
};

const ProgressItem = ({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
  >
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
    >
      <Box
        sx={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: `2px solid ${color}`,
          bgcolor:
            label === 'Completed'
              ? color
              : '#fff',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {label === 'Completed' && (
          <CheckCircleRoundedIcon
            sx={{
              fontSize: 14,
              color: '#fff',
            }}
          />
        )}

        {label === 'In Progress' && (
          <PlayArrowRoundedIcon
            sx={{
              fontSize: 12,
              color,
            }}
          />
        )}
      </Box>

      <Typography
        sx={{
          color: '#344054',
          fontSize: '0.78rem',
        }}
      >
        {label}
      </Typography>
    </Stack>

    <Typography
      sx={{
        color: '#172033',
        fontWeight: 850,
        fontSize: '0.78rem',
      }}
    >
      {value}
    </Typography>
  </Stack>
);