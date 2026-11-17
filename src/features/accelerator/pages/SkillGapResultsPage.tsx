import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
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

type PerformanceItem = {
  topic: string;
  score: number;
  status: 'Strong' | 'Good' | 'Needs Focus';
};

const performance: PerformanceItem[] = [
  {
    topic: 'React Fundamentals',
    score: 100,
    status: 'Strong',
  },
  {
    topic: 'React Hooks',
    score: 75,
    status: 'Good',
  },
  {
    topic: 'State Management',
    score: 67,
    status: 'Needs Focus',
  },
  {
    topic: 'Routing',
    score: 80,
    status: 'Good',
  },
  {
    topic: 'Working with APIs',
    score: 60,
    status: 'Needs Focus',
  },
  {
    topic: 'Build & Best Practices',
    score: 83,
    status: 'Good',
  },
];

const skillGaps = [
  {
    title: 'State Management',
    description:
      'Context API, state handling, global state',
  },
  {
    title: 'Working with APIs',
    description:
      'API integration, error handling, loading states',
  },
];

const recommendedSteps = [
  'Follow a personalized learning roadmap',
  'Strengthen the identified gap areas',
  'Practice with targeted exercises',
  'Build a real-world project to apply your skills',
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

const StatCard = ({
  icon,
  value,
  label,
  color,
  background,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  color: string;
  background: string;
}) => (
  <Box
    sx={{
      minHeight: 70,
      borderRadius: 2.3,
      border: '1px solid #e4e8ef',
      px: 1.4,
      py: 1.1,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      bgcolor: '#fff',
    }}
  >
    <Box
      sx={{
        width: 38,
        height: 38,
        flexShrink: 0,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        bgcolor: background,
        color,
        '& svg': {
          fontSize: 21,
        },
      }}
    >
      {icon}
    </Box>

    <Box>
      <Typography
        sx={{
          color: '#172033',
          fontWeight: 900,
          fontSize: '0.95rem',
          lineHeight: 1.15,
        }}
      >
        {value}
      </Typography>

      <Typography
        sx={{
          mt: 0.2,
          color: '#667085',
          fontSize: '0.67rem',
        }}
      >
        {label}
      </Typography>
    </Box>
  </Box>
);

const getStatusStyle = (
  status: PerformanceItem['status'],
) => {
  if (status === 'Strong') {
    return {
      background: '#dcf8ea',
      color: '#087a52',
    };
  }

  if (status === 'Good') {
    return {
      background: '#e1f8ed',
      color: '#16825d',
    };
  }

  return {
    background: '#fff1cf',
    color: '#9a6400',
  };
};

const getProgressColor = (
  score: number,
) => {
  if (score >= 75) {
    return '#0ead7d';
  }

  if (score >= 70) {
    return '#41b883';
  }

  return '#f5aa00';
};

export const SkillGapResultsPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  /*
   * TEMPORARY UI DATA
   *
   * These values will later come from the real
   * Skill Assessment result returned by backend.
   */
  const skillName = 'React';
  const score = 75;
  const correctAnswers = 15;
  const incorrectAnswers = 5;
  const totalQuestions = 20;
  const timeTaken = '~ 30 min';
  const currentLevel = 'Intermediate';
  const targetTimeline = '4 - 6 weeks';

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
      'skill-assessment-questions',
    );
  };

  const handleViewRoadmap = () => {
    navigateToScreen('skill-roadmap');
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
        startIcon={<ArrowBackRoundedIcon />}
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
        Back to Assessment
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
            right: -80,
            top: -160,
            borderRadius: '50%',
            bgcolor:
              'rgba(255,255,255,0.07)',
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
              Skill Gap Analysis - {skillName}
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
              Your assessment results are ready!
              Here&apos;s your current skill level
              and recommended focus areas.
            </Typography>
          </Box>

          <EmojiEventsRoundedIcon
            sx={{
              display: {
                xs: 'none',
                md: 'block',
              },
              fontSize: 72,
              color: '#ffd43b',
              mr: 2,
            }}
          />
        </Stack>
      </Box>

      {/* Content */}
      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.7fr) minmax(300px, 1fr)',
          },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {/* LEFT */}
        <Stack spacing={2}>
          {/* Result summary */}
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
                Your Assessment Results
              </Typography>
            </Stack>

            <Box
              sx={{
                mt: 2,
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: '190px 1fr',
                },
                gap: 2,
                alignItems: 'center',
              }}
            >
              {/* Score circle */}
              <Box
                sx={{
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: 145,
                    height: 145,
                    borderRadius: '50%',
                    background: `conic-gradient(
                      #0caf7d 0% ${score}%,
                      #e2e7ed ${score}% 100%
                    )`,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 15,
                      borderRadius: '50%',
                      bgcolor: '#fff',
                    }}
                  />

                  <Box
                    sx={{
                      position: 'relative',
                      zIndex: 1,
                      textAlign: 'center',
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#0aaa79',
                        fontWeight: 950,
                        fontSize: '2rem',
                        lineHeight: 1,
                      }}
                    >
                      {score}%
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        color: '#344054',
                        fontWeight: 750,
                        fontSize: '0.75rem',
                      }}
                    >
                      Score
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box>
                <Stack
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={1}
                  alignItems={{
                    xs: 'flex-start',
                    sm: 'center',
                  }}
                >
                  <Typography
                    sx={{
                      color: '#172033',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                    }}
                  >
                    Your Current Level
                  </Typography>

                  <Chip
                    icon={
                      <BarChartRoundedIcon />
                    }
                    label={currentLevel}
                    sx={{
                      bgcolor: '#f0edff',
                      color: '#4632ba',
                      fontWeight: 850,
                    }}
                  />
                </Stack>

                <Typography
                  sx={{
                    mt: 1.5,
                    color: '#475467',
                    fontSize: '0.82rem',
                    lineHeight: 1.6,
                    maxWidth: 500,
                  }}
                >
                  You have a good understanding of{' '}
                  {skillName}. Focus on the
                  identified gaps to reach your
                  target level.
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                mt: 2,
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(4, minmax(0, 1fr))',
                },
                gap: 1,
              }}
            >
              <StatCard
                icon={
                  <CheckCircleRoundedIcon />
                }
                value={String(correctAnswers)}
                label="Correct Answers"
                color="#0aa879"
                background="#e4f9f1"
              />

              <StatCard
                icon={<CloseRoundedIcon />}
                value={String(
                  incorrectAnswers,
                )}
                label="Incorrect Answers"
                color="#f0445e"
                background="#fff0f2"
              />

              <StatCard
                icon={
                  <HelpOutlineRoundedIcon />
                }
                value={String(totalQuestions)}
                label="Total Questions"
                color="#563cf0"
                background="#f1efff"
              />

              <StatCard
                icon={
                  <ScheduleRoundedIcon />
                }
                value={timeTaken}
                label="Time Taken"
                color="#563cf0"
                background="#f1efff"
              />
            </Box>
          </Panel>

          {/* Topic performance */}
          <Panel>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1.5 }}
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
                Topic-wise Performance
              </Typography>
            </Stack>

            {/* Desktop heading */}
            <Box
              sx={{
                display: {
                  xs: 'none',
                  sm: 'grid',
                },
                gridTemplateColumns:
                  '1.2fr 1.35fr 100px',
                gap: 2,
                px: 1.5,
                py: 0.8,
                borderRadius: 1.5,
                bgcolor: '#f5f6fa',
              }}
            >
              <Typography
                sx={{
                  color: '#475467',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                }}
              >
                Topic
              </Typography>

              <Typography
                sx={{
                  color: '#475467',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                }}
              >
                Score
              </Typography>

              <Typography
                sx={{
                  color: '#475467',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                }}
              >
                Status
              </Typography>
            </Box>

            <Stack
              divider={
                <Box
                  sx={{
                    height: '1px',
                    bgcolor: '#edf0f4',
                  }}
                />
              }
            >
              {performance.map((item) => {
                const statusStyle =
                  getStatusStyle(item.status);

                return (
                  <Box
                    key={item.topic}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: '1.2fr 1.35fr 100px',
                      },
                      gap: {
                        xs: 0.8,
                        sm: 2,
                      },
                      alignItems: 'center',
                      px: 1.2,
                      py: 1,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          width: 31,
                          height: 31,
                          borderRadius:
                            '50%',
                          bgcolor:
                            '#f4f2ff',
                          color:
                            '#563cf0',
                          display: 'grid',
                          placeItems:
                            'center',
                        }}
                      >
                        <CodeRoundedIcon
                          sx={{
                            fontSize: 17,
                          }}
                        />
                      </Box>

                      <Typography
                        sx={{
                          color:
                            '#172033',
                          fontWeight: 800,
                          fontSize:
                            '0.79rem',
                        }}
                      >
                        {item.topic}
                      </Typography>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1.2}
                      alignItems="center"
                    >
                      <LinearProgress
                        variant="determinate"
                        value={item.score}
                        sx={{
                          flex: 1,
                          height: 8,
                          borderRadius: 99,
                          bgcolor:
                            '#e3e7ed',
                          '& .MuiLinearProgress-bar':
                            {
                              borderRadius:
                                99,
                              bgcolor:
                                getProgressColor(
                                  item.score,
                                ),
                            },
                        }}
                      />

                      <Typography
                        sx={{
                          minWidth: 38,
                          color:
                            '#172033',
                          fontWeight: 850,
                          fontSize:
                            '0.78rem',
                        }}
                      >
                        {item.score}%
                      </Typography>
                    </Stack>

                    <Chip
                      label={item.status}
                      size="small"
                      sx={{
                        justifySelf: {
                          xs: 'start',
                          sm: 'stretch',
                        },
                        bgcolor:
                          statusStyle.background,
                        color:
                          statusStyle.color,
                        fontWeight: 800,
                        fontSize:
                          '0.66rem',
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </Panel>
        </Stack>

        {/* RIGHT */}
        <Stack spacing={2}>
          {/* Gaps */}
          <Panel>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <TrackChangesRoundedIcon
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
                Your Skill Gaps
              </Typography>
            </Stack>

            <Typography
              sx={{
                mt: 0.7,
                color: '#667085',
                fontSize: '0.78rem',
              }}
            >
              Focus on these areas to improve
              your {skillName} skills:
            </Typography>

            <Stack
              spacing={1}
              sx={{ mt: 1.5 }}
            >
              {skillGaps.map((gap) => (
                <Box
                  key={gap.title}
                  sx={{
                    p: 1.3,
                    borderRadius: 2,
                    bgcolor: '#fff5f6',
                    display: 'flex',
                    gap: 1.2,
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      flexShrink: 0,
                      borderRadius: '50%',
                      bgcolor: '#ffe8ec',
                      color: '#ef4765',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <TrackChangesRoundedIcon />
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        color: '#172033',
                        fontWeight: 850,
                        fontSize: '0.86rem',
                      }}
                    >
                      {gap.title}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.15,
                        color: '#667085',
                        fontSize: '0.7rem',
                        lineHeight: 1.4,
                      }}
                    >
                      {gap.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Panel>

          {/* Recommendations */}
          <Panel>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <LightbulbRoundedIcon
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
                Recommended Next Steps
              </Typography>
            </Stack>

            <Stack
              spacing={1.2}
              sx={{ mt: 1.6 }}
            >
              {recommendedSteps.map(
                (step) => (
                  <Stack
                    key={step}
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                  >
                    <CheckCircleRoundedIcon
                      sx={{
                        mt: '2px',
                        color: '#0aaa79',
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
                      {step}
                    </Typography>
                  </Stack>
                ),
              )}
            </Stack>
          </Panel>

          {/* Motivation */}
          <Box
            sx={{
              borderRadius: 3,
              p: 2.3,
              background:
                'linear-gradient(145deg, #faf9ff, #eee9ff)',
              border:
                '1px solid #e6e0ff',
            }}
          >
            <Stack
              direction="row"
              spacing={1.4}
              alignItems="flex-start"
            >
              <RocketLaunchRoundedIcon
                sx={{
                  color: '#563cf0',
                  fontSize: 36,
                }}
              />

              <Box>
                <Typography
                  sx={{
                    color: '#172033',
                    fontWeight: 900,
                    fontSize: '1rem',
                  }}
                >
                  You&apos;re on the right track!
                </Typography>

                <Typography
                  sx={{
                    mt: 0.6,
                    color: '#475467',
                    fontSize: '0.78rem',
                    lineHeight: 1.5,
                  }}
                >
                  Complete the learning roadmap
                  to reach your target{' '}
                  <Box
                    component="span"
                    sx={{
                      fontWeight: 850,
                      color: '#172033',
                    }}
                  >
                    {currentLevel}
                  </Box>{' '}
                  level in{' '}
                  <Box
                    component="span"
                    sx={{
                      fontWeight: 850,
                      color: '#172033',
                    }}
                  >
                    {targetTimeline}
                  </Box>
                  .
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Bottom actions */}
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
          startIcon={
            <RocketLaunchRoundedIcon />
          }
          endIcon={
            <ArrowForwardRoundedIcon />
          }
          onClick={handleViewRoadmap}
          sx={{
            minHeight: 50,
            minWidth: {
              xs: '100%',
              sm: 330,
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
          View My Learning Roadmap
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
        Assessment scores and skill-gap data on
        this screen are temporary UI values until
        Skill Path assessment-result APIs are
        connected.
      </Typography>
    </Box>
  );
};