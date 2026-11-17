import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

type InfoCardProps = {
  icon: ReactNode;
  value: string;
  label: string;
};

type Topic = {
  title: string;
  description: string;
  questions: string;
  icon: ReactNode;
};

const topics: Topic[] = [
  {
    title: 'React Fundamentals',
    description: 'Components, JSX, Props, State',
    questions: '~ 4 Questions',
    icon: <CodeRoundedIcon />,
  },
  {
    title: 'React Hooks',
    description: 'useState, useEffect, custom hooks',
    questions: '~ 4 Questions',
    icon: <AssessmentRoundedIcon />,
  },
  {
    title: 'State Management',
    description: 'Context API, state handling',
    questions: '~ 3 Questions',
    icon: <LayersRoundedIcon />,
  },
  {
    title: 'Routing',
    description: 'React Router, navigation, parameters',
    questions: '~ 3 Questions',
    icon: <RouteRoundedIcon />,
  },
  {
    title: 'Working with APIs',
    description: 'Fetching data, error handling, integration',
    questions: '~ 3 Questions',
    icon: <CodeRoundedIcon />,
  },
  {
    title: 'Build & Best Practices',
    description: 'Performance, project structure, deployment',
    questions: '~ 3 Questions',
    icon: <RocketLaunchRoundedIcon />,
  },
];

const outcomes = [
  'A detailed skill gap analysis',
  'Your current proficiency level',
  'A personalized learning roadmap',
  'Recommended projects and practice',
];

const InfoCard = ({
  icon,
  value,
  label,
}: InfoCardProps) => (
  <Box
    sx={{
      minHeight: 70,
      px: 1.5,
      py: 1.2,
      borderRadius: 2.3,
      border: '1px solid #e1e6ee',
      bgcolor: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: 1.1,
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        flexShrink: 0,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        bgcolor: '#f3f0ff',
        color: '#563df0',
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
          fontWeight: 850,
          fontSize: '0.85rem',
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>

      <Typography
        sx={{
          mt: 0.25,
          color: '#667085',
          fontSize: '0.68rem',
          lineHeight: 1.25,
        }}
      >
        {label}
      </Typography>
    </Box>
  </Box>
);

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

const SummaryItem = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) => (
  <Stack
    direction="row"
    spacing={1.3}
    alignItems="center"
    sx={{
      py: 1.3,
    }}
  >
    <Box
      sx={{
        width: 42,
        height: 42,
        flexShrink: 0,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        bgcolor: '#f2efff',
        color: '#5238e8',
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
          color: '#667085',
          fontSize: '0.72rem',
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.15,
          color: '#172033',
          fontWeight: 850,
          fontSize: '0.92rem',
        }}
      >
        {value}
      </Typography>
    </Box>
  </Stack>
);

export const SkillPathAssessmentPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  /*
   * Temporary UI values.
   *
   * Later these should come from:
   * - selected Skill Path
   * - saved Skill Goal
   * - assessment configuration returned by backend
   */
  const skillName = 'React';
  const primaryGoal = 'Get a Job';
  const targetLevel = 'Intermediate';
  const timeline = '4 - 6 Weeks';

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
    navigateToScreen('skill-goal');
  };

  const handleStartAssessment = () => {
    /*
     * S4 - Skill Assessment Questions.
     *
     * Later the backend should create/resume an
     * assessment attempt before navigation.
     */
    navigateToScreen(
      'skill-assessment-questions',
    );
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
        Back to Skill Goal
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
            xs: 2.8,
            md: 3.2,
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            right: -100,
            top: -150,
            borderRadius: '50%',
            bgcolor:
              'rgba(255,255,255,0.07)',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            width: 160,
            height: 160,
            right: 180,
            bottom: -120,
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
                  xs: '1.6rem',
                  md: '2rem',
                },
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
              }}
            >
              {skillName} Skill Assessment
            </Typography>

            <Typography
              sx={{
                mt: 0.65,
                maxWidth: 800,
                color:
                  'rgba(255,255,255,0.88)',
                fontSize: {
                  xs: '0.88rem',
                  md: '0.98rem',
                },
                lineHeight: 1.5,
              }}
            >
              Evaluate your current{' '}
              {skillName} knowledge and skills
              to create a personalized learning
              roadmap.
            </Typography>
          </Box>

          <Box
            sx={{
              display: {
                xs: 'none',
                md: 'grid',
              },
              placeItems: 'center',
              width: 120,
              height: 100,
            }}
          >
            <AssessmentRoundedIcon
              sx={{
                fontSize: 74,
                color:
                  'rgba(255,255,255,0.78)',
              }}
            />
          </Box>
        </Stack>
      </Box>

      {/* Main */}
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
        {/* LEFT */}
        <Stack spacing={2}>
          {/* About */}
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
                  fontWeight: 850,
                  fontSize: '1.08rem',
                }}
              >
                About the Assessment
              </Typography>
            </Stack>

            <Typography
              sx={{
                mt: 1.2,
                color: '#344054',
                fontSize: '0.88rem',
                lineHeight: 1.65,
                maxWidth: 800,
              }}
            >
              This assessment will check your
              knowledge and practical
              understanding of {skillName},
              including core concepts, hooks,
              state management, routing and
              real-world development.
            </Typography>

            <Box
              sx={{
                mt: 1.7,
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  xl: 'repeat(4, minmax(0, 1fr))',
                },
                gap: 1,
              }}
            >
              <InfoCard
                icon={
                  <ScheduleRoundedIcon />
                }
                value="~ 30 Minutes"
                label="Estimated Time"
              />

              <InfoCard
                icon={
                  <HelpOutlineRoundedIcon />
                }
                value="20 Questions"
                label="Multiple Choice"
              />

              <InfoCard
                icon={
                  <BarChartRoundedIcon />
                }
                value="Intermediate"
                label="Recommended Level"
              />

              <InfoCard
                icon={<CodeRoundedIcon />}
                value={skillName}
                label="Skill Assessment"
              />
            </Box>
          </Panel>

          {/* Topics */}
          <Panel>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1.5 }}
            >
              <LayersRoundedIcon
                sx={{
                  color: '#5138e8',
                }}
              />

              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 850,
                  fontSize: '1.08rem',
                }}
              >
                Topics Covered
              </Typography>
            </Stack>

            <Stack spacing={0.7}>
              {topics.map((topic) => (
                <Box
                  key={topic.title}
                  sx={{
                    border:
                      '1px solid #e4e8f0',
                    borderRadius: 2.2,
                    px: {
                      xs: 1.3,
                      sm: 1.7,
                    },
                    py: 1.05,
                  }}
                >
                  <Stack
                    direction={{
                      xs: 'column',
                      sm: 'row',
                    }}
                    spacing={1.2}
                    alignItems={{
                      xs: 'flex-start',
                      sm: 'center',
                    }}
                    justifyContent="space-between"
                  >
                    <Stack
                      direction="row"
                      spacing={1.3}
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          flexShrink: 0,
                          borderRadius:
                            '50%',
                          display: 'grid',
                          placeItems:
                            'center',
                          bgcolor:
                            '#f4f2ff',
                          color:
                            '#5238e8',
                          '& svg': {
                            fontSize: 22,
                          },
                        }}
                      >
                        {topic.icon}
                      </Box>

                      <Box>
                        <Typography
                          sx={{
                            color:
                              '#172033',
                            fontWeight: 800,
                            fontSize:
                              '0.86rem',
                          }}
                        >
                          {topic.title}
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.15,
                            color:
                              '#667085',
                            fontSize:
                              '0.72rem',
                          }}
                        >
                          {
                            topic.description
                          }
                        </Typography>
                      </Box>
                    </Stack>

                    <Chip
                      label={topic.questions}
                      size="small"
                      sx={{
                        flexShrink: 0,
                        bgcolor: '#f0edff',
                        color: '#4533b7',
                        fontWeight: 750,
                        fontSize: '0.67rem',
                      }}
                    />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Panel>
        </Stack>

        {/* RIGHT */}
        <Stack spacing={2}>
          <Panel>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 0.5 }}
            >
              <BarChartRoundedIcon
                sx={{
                  color: '#5138e8',
                }}
              />

              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 850,
                  fontSize: '1.05rem',
                }}
              >
                Your Skill Goal
              </Typography>
            </Stack>

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
              <SummaryItem
                icon={<CodeRoundedIcon />}
                label="Skill"
                value={skillName}
              />

              <SummaryItem
                icon={
                  <TrackChangesRoundedIcon />
                }
                label="Your Goal"
                value={primaryGoal}
              />

              <SummaryItem
                icon={
                  <BarChartRoundedIcon />
                }
                label="Target Level"
                value={targetLevel}
              />

              <SummaryItem
                icon={
                  <CalendarMonthRoundedIcon />
                }
                label="Timeline"
                value={timeline}
              />
            </Stack>
          </Panel>

          <Box
            sx={{
              p: {
                xs: 2.2,
                md: 2.5,
              },
              borderRadius: 3,
              background:
                'linear-gradient(145deg, #faf9ff, #f0edff)',
              border:
                '1px solid #e5e0ff',
            }}
          >
            <Stack
              direction="row"
              spacing={1.2}
              alignItems="center"
            >
              <EmojiEventsRoundedIcon
                sx={{
                  color: '#5138e8',
                  fontSize: 30,
                }}
              />

              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                }}
              >
                What You&apos;ll Get
              </Typography>
            </Stack>

            <Stack
              spacing={1.3}
              sx={{ mt: 2 }}
            >
              {outcomes.map((outcome) => (
                <Stack
                  key={outcome}
                  direction="row"
                  spacing={1.2}
                  alignItems="flex-start"
                >
                  <CheckCircleRoundedIcon
                    sx={{
                      mt: '2px',
                      color: '#0ba57d',
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  />

                  <Typography
                    sx={{
                      color: '#344054',
                      fontSize: '0.82rem',
                      lineHeight: 1.45,
                    }}
                  >
                    {outcome}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Bottom */}
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
          startIcon={<ArrowBackRoundedIcon />}
          onClick={handlePrevious}
          sx={{
            minHeight: 48,
            px: 3,
            borderRadius: 2.2,
            textTransform: 'none',
            fontWeight: 800,
          }}
        >
          Previous
        </Button>

        <Button
          variant="contained"
          startIcon={
            <PlayArrowRoundedIcon />
          }
          onClick={handleStartAssessment}
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
              'linear-gradient(90deg, #5138e8, #6535ec)',
          }}
        >
          Start Assessment
        </Button>
      </Stack>

      <Typography
        sx={{
          mt: 1.3,
          textAlign: 'center',
          color: '#98a2b3',
          fontSize: '0.7rem',
        }}
      >
        Assessment configuration shown here is
        temporary UI data. Question sets and
        assessment attempts will be connected to
        the Skill Path backend.
      </Typography>
    </Box>
  );
};