import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Radio,
  Stack,
  Typography,
} from '@mui/material';
import { type ReactNode, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type GoalId =
  | 'job'
  | 'switch'
  | 'upskill'
  | 'projects';

type LevelId =
  | 'beginner'
  | 'intermediate'
  | 'advanced';

type TimelineId =
  | 'fast'
  | 'recommended'
  | 'deep';

type PreferenceId =
  | 'projects'
  | 'interviews'
  | 'system-design'
  | 'job-prep'
  | 'job-opportunities';

type GoalOption = {
  id: GoalId;
  title: string;
  description: string;
  icon: ReactNode;
};

type LevelOption = {
  id: LevelId;
  title: string;
  description: string;
};

type TimelineOption = {
  id: TimelineId;
  title: string;
  description: string;
};

const goals: GoalOption[] = [
  {
    id: 'job',
    title: 'Get a Job',
    description: 'Become job ready and get hired',
    icon: <BusinessCenterRoundedIcon />,
  },
  {
    id: 'switch',
    title: 'Switch Role',
    description: 'Move to a React / Frontend role',
    icon: <RocketLaunchRoundedIcon />,
  },
  {
    id: 'upskill',
    title: 'Increase Skills',
    description: 'Upskill for current job or higher role',
    icon: <TrendingUpRoundedIcon />,
  },
  {
    id: 'projects',
    title: 'Build Projects',
    description: 'Learn by building real-world applications',
    icon: <CodeRoundedIcon />,
  },
];

const levels: LevelOption[] = [
  {
    id: 'beginner',
    title: 'Beginner',
    description: 'Basics & Fundamentals',
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    description: 'Build real applications',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description:
      'Production, performance & best practices',
  },
];

const timelines: TimelineOption[] = [
  {
    id: 'fast',
    title: '2 - 4 Weeks',
    description: 'Fast track - Basics + 1 project',
  },
  {
    id: 'recommended',
    title: '4 - 6 Weeks',
    description: 'Recommended',
  },
  {
    id: 'deep',
    title: '8 - 12 Weeks',
    description: 'In-depth + multiple projects',
  },
];

const goalLabels: Record<GoalId, string> = {
  job: 'Get a Job',
  switch: 'Switch Role',
  upskill: 'Increase Skills',
  projects: 'Build Projects',
};

const levelLabels: Record<LevelId, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const timelineLabels: Record<TimelineId, string> = {
  fast: '2 - 4 Weeks',
  recommended: '4 - 6 Weeks',
  deep: '8 - 12 Weeks',
};

const preferenceOptions: {
  id: PreferenceId;
  label: string;
}[] = [
  {
    id: 'projects',
    label: 'Include hands-on projects',
  },
  {
    id: 'interviews',
    label: 'Include mock interview practice',
  },
  {
    id: 'system-design',
    label: 'Focus on system design (Frontend)',
  },
  {
    id: 'job-prep',
    label: 'Add job preparation & resume guidance',
  },
  {
    id: 'job-opportunities',
    label: 'Suggest real job opportunities',
  },
];

const Panel = ({
  children,
}: {
  children: ReactNode;
}) => (
  <Box
    sx={{
      bgcolor: '#fff',
      border: '1px solid #e4e8f0',
      borderRadius: 3,
      p: {
        xs: 2,
        md: 2.25,
      },
      boxShadow:
        '0 4px 16px rgba(15, 23, 42, 0.035)',
    }}
  >
    {children}
  </Box>
);

const SectionTitle = ({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) => (
  <Stack
    direction="row"
    spacing={1}
    alignItems="center"
    sx={{ mb: 1.6 }}
  >
    <Box
      sx={{
        display: 'grid',
        placeItems: 'center',
        color: '#4f46e5',
        '& svg': {
          fontSize: 23,
        },
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        color: '#172033',
        fontWeight: 850,
        fontSize: {
          xs: '1rem',
          md: '1.05rem',
        },
      }}
    >
      {children}
    </Typography>
  </Stack>
);

export const SkillGoalSetupPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [selectedGoal, setSelectedGoal] =
    useState<GoalId>('job');

  const [selectedLevel, setSelectedLevel] =
    useState<LevelId>('intermediate');

  const [selectedTimeline, setSelectedTimeline] =
    useState<TimelineId>('recommended');

  const [preferences, setPreferences] = useState<
    Record<PreferenceId, boolean>
  >({
    projects: true,
    interviews: true,
    'system-design': false,
    'job-prep': true,
    'job-opportunities': false,
  });

  /*
   * Temporary UI example.
   *
   * Later this must come from the selected Skill Path DTO
   * using searchParams.get('selected').
   */
  const skillName = 'React';

  const navigateToScreen = (screen: string) => {
    const params =
      new URLSearchParams(searchParams);

    params.set('type', 'skill');
    params.set('screen', screen);

    setSearchParams(params);
  };

  const handlePrevious = () => {
    const params =
      new URLSearchParams(searchParams);

    params.set('type', 'skill');
    params.delete('screen');

    setSearchParams(params);
  };

  const handleCreatePlan = () => {
    /*
     * TODO BACKEND:
     *
     * Save:
     * - selected skill
     * - primary goal
     * - target proficiency
     * - timeline
     * - preferences
     *
     * Then navigate to the Skill Assessment.
     *
     * Until the API is implemented, selections remain
     * frontend-only.
     */
    navigateToScreen('skill-assessment');
  };

  const handlePreferenceChange = (
    id: PreferenceId,
  ) => {
    setPreferences((current) => ({
      ...current,
      [id]: !current[id],
    }));
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
        Back to Skill Path
      </Button>

      {/* Hero */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          color: '#fff',
          background:
            'linear-gradient(120deg, #312e81 0%, #4338ca 48%, #7657f6 100%)',
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
            width: 180,
            height: 180,
            right: 180,
            bottom: -140,
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
              width: 72,
              height: 72,
              borderRadius: 3,
              display: 'grid',
              placeItems: 'center',
              bgcolor:
                'rgba(255,255,255,0.12)',
              border:
                '1px solid rgba(255,255,255,0.18)',
              flexShrink: 0,
            }}
          >
            <CodeRoundedIcon
              sx={{
                fontSize: 38,
                color: '#67e8f9',
              }}
            />
          </Box>

          <Box>
            <Typography
              component="h1"
              sx={{
                fontWeight: 900,
                fontSize: {
                  xs: '1.65rem',
                  md: '2rem',
                },
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
              }}
            >
              Set Your Skill Goal
            </Typography>

            <Typography
              sx={{
                mt: 0.65,
                color:
                  'rgba(255,255,255,0.88)',
                fontSize: {
                  xs: '0.88rem',
                  md: '0.98rem',
                },
                lineHeight: 1.5,
              }}
            >
              Define what you want to achieve
              with {skillName} and get a
              personalized learning plan.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Content */}
      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 2.25fr) minmax(290px, 0.9fr)',
          },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {/* LEFT */}
        <Stack spacing={2}>
          {/* Primary goal */}
          <Panel>
            <SectionTitle
              icon={<FlagRoundedIcon />}
            >
              What is your primary goal with{' '}
              {skillName}?
            </SectionTitle>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  xl: 'repeat(4, minmax(0, 1fr))',
                },
                gap: 1.5,
              }}
            >
              {goals.map((goal) => {
                const selected =
                  selectedGoal === goal.id;

                return (
                  <Box
                    key={goal.id}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      setSelectedGoal(goal.id)
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key === 'Enter' ||
                        event.key === ' '
                      ) {
                        event.preventDefault();
                        setSelectedGoal(goal.id);
                      }
                    }}
                    sx={{
                      position: 'relative',
                      minHeight: 155,
                      p: 2,
                      cursor: 'pointer',
                      borderRadius: 2.5,
                      border: selected
                        ? '2px solid #5b3df5'
                        : '1px solid #dfe4ec',
                      bgcolor: selected
                        ? '#faf9ff'
                        : '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      transition:
                        'all 160ms ease',
                      '&:hover': {
                        borderColor:
                          '#7966f2',
                        transform:
                          'translateY(-1px)',
                      },
                    }}
                  >
                    {selected && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -9,
                          right: -7,
                          width: 32,
                          height: 32,
                          display: 'grid',
                          placeItems: 'center',
                          borderRadius: '50%',
                          bgcolor: '#5b3df5',
                          color: '#fff',
                          border:
                            '3px solid #fff',
                        }}
                      >
                        <CheckCircleRoundedIcon
                          sx={{
                            fontSize: 19,
                          }}
                        />
                      </Box>
                    )}

                    <Box
                      sx={{
                        color: selected
                          ? '#5237e9'
                          : '#5c49df',
                        '& svg': {
                          fontSize: 34,
                        },
                      }}
                    >
                      {goal.icon}
                    </Box>

                    <Typography
                      sx={{
                        mt: 1,
                        color: '#172033',
                        fontWeight: 850,
                        fontSize: '0.98rem',
                      }}
                    >
                      {goal.title}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        color: '#667085',
                        fontSize: '0.76rem',
                        lineHeight: 1.4,
                      }}
                    >
                      {goal.description}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Panel>

          {/* Level + timeline */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            <Panel>
              <SectionTitle
                icon={
                  <BarChartRoundedIcon />
                }
              >
                Target Proficiency Level
              </SectionTitle>

              <Stack spacing={1}>
                {levels.map((level) => {
                  const selected =
                    selectedLevel === level.id;

                  return (
                    <Box
                      key={level.id}
                      onClick={() =>
                        setSelectedLevel(
                          level.id,
                        )
                      }
                      sx={{
                        cursor: 'pointer',
                        borderRadius: 2,
                        border: selected
                          ? '1.5px solid #5b3df5'
                          : '1px solid #dfe4ec',
                        bgcolor: selected
                          ? '#f7f5ff'
                          : '#fff',
                        px: 1.4,
                        py: 0.85,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <Radio
                          checked={selected}
                          onChange={() =>
                            setSelectedLevel(
                              level.id,
                            )
                          }
                          size="small"
                          sx={{
                            p: 0.5,
                          }}
                        />

                        <Box>
                          <Typography
                            sx={{
                              color:
                                '#172033',
                              fontWeight: 800,
                              fontSize:
                                '0.88rem',
                            }}
                          >
                            {level.title}
                          </Typography>

                          <Typography
                            sx={{
                              color:
                                '#667085',
                              fontSize:
                                '0.72rem',
                            }}
                          >
                            {
                              level.description
                            }
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Panel>

            <Panel>
              <SectionTitle
                icon={
                  <CalendarMonthRoundedIcon />
                }
              >
                Target Timeline
              </SectionTitle>

              <Stack spacing={1}>
                {timelines.map(
                  (timeline) => {
                    const selected =
                      selectedTimeline ===
                      timeline.id;

                    return (
                      <Box
                        key={timeline.id}
                        onClick={() =>
                          setSelectedTimeline(
                            timeline.id,
                          )
                        }
                        sx={{
                          cursor: 'pointer',
                          borderRadius: 2,
                          border: selected
                            ? '1.5px solid #5b3df5'
                            : '1px solid #dfe4ec',
                          bgcolor: selected
                            ? '#f7f5ff'
                            : '#fff',
                          px: 1.4,
                          py: 0.85,
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          <Radio
                            checked={selected}
                            onChange={() =>
                              setSelectedTimeline(
                                timeline.id,
                              )
                            }
                            size="small"
                            sx={{
                              p: 0.5,
                            }}
                          />

                          <Box>
                            <Typography
                              sx={{
                                color:
                                  '#172033',
                                fontWeight: 800,
                                fontSize:
                                  '0.88rem',
                              }}
                            >
                              {
                                timeline.title
                              }
                            </Typography>

                            <Typography
                              sx={{
                                color:
                                  '#667085',
                                fontSize:
                                  '0.72rem',
                              }}
                            >
                              {
                                timeline.description
                              }
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    );
                  },
                )}
              </Stack>
            </Panel>
          </Box>

          {/* Preferences */}
          <Panel>
            <SectionTitle
              icon={<SettingsRoundedIcon />}
            >
              Additional Preferences (Optional)
            </SectionTitle>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, minmax(0, 1fr))',
                  xl: 'repeat(3, minmax(0, 1fr))',
                },
                columnGap: 2,
                rowGap: 0.2,
              }}
            >
              {preferenceOptions.map(
                (preference) => (
                  <FormControlLabel
                    key={preference.id}
                    control={
                      <Checkbox
                        checked={
                          preferences[
                            preference.id
                          ]
                        }
                        onChange={() =>
                          handlePreferenceChange(
                            preference.id,
                          )
                        }
                        size="small"
                      />
                    }
                    label={preference.label}
                    sx={{
                      m: 0,
                      '& .MuiFormControlLabel-label':
                        {
                          color: '#344054',
                          fontSize: '0.78rem',
                        },
                    }}
                  />
                ),
              )}
            </Box>
          </Panel>
        </Stack>

        {/* RIGHT */}
        <Stack spacing={2}>
          <Panel>
            <SectionTitle
              icon={<FlagRoundedIcon />}
            >
              Your Goal Summary
            </SectionTitle>

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
                label="Selected Skill"
                value={skillName}
              />

              <SummaryItem
                icon={
                  <BusinessCenterRoundedIcon />
                }
                label="Primary Goal"
                value={
                  goalLabels[selectedGoal]
                }
              />

              <SummaryItem
                icon={
                  <BarChartRoundedIcon />
                }
                label="Target Level"
                value={
                  levelLabels[
                    selectedLevel
                  ]
                }
              />

              <SummaryItem
                icon={
                  <CalendarMonthRoundedIcon />
                }
                label="Timeline"
                value={
                  timelineLabels[
                    selectedTimeline
                  ]
                }
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
              textAlign: 'center',
              background:
                'linear-gradient(145deg, #faf9ff, #f0edff)',
              border:
                '1px solid #e5e0ff',
            }}
          >
            <Box
              sx={{
                width: 66,
                height: 66,
                mx: 'auto',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                bgcolor: '#e9e3ff',
                color: '#5438e8',
              }}
            >
              <AutoAwesomeRoundedIcon
                sx={{
                  fontSize: 35,
                }}
              />
            </Box>

            <Typography
              sx={{
                mt: 1.3,
                color: '#172033',
                fontWeight: 900,
                fontSize: '1.1rem',
              }}
            >
              Next Step
            </Typography>

            <Typography
              sx={{
                mt: 0.8,
                color: '#475467',
                fontSize: '0.82rem',
                lineHeight: 1.55,
              }}
            >
              We&apos;ll assess your current{' '}
              {skillName} skills to find your
              strengths and gaps, then create a
              personalized learning roadmap for
              you.
            </Typography>
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
          endIcon={
            <RocketLaunchRoundedIcon />
          }
          onClick={handleCreatePlan}
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
          Create My Learning Plan
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
        Goal selections are currently stored in
        this screen only. Backend persistence
        will be connected when the Skill Path
        goal API is implemented.
      </Typography>
    </Box>
  );
};

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
    spacing={1.4}
    alignItems="center"
    sx={{
      py: 1.35,
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
        bgcolor: '#f1efff',
        color: '#5138e8',
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
          fontSize: '0.73rem',
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