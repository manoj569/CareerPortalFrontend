import { useMemo, useState } from 'react';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import SettingsSuggestOutlinedIcon from '@mui/icons-material/SettingsSuggestOutlined';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';

import {
  Box,
  Button,
  Checkbox,
  FormControl,
  MenuItem,
  Radio,
  Select,
  Stack,
  Typography,
} from '@mui/material';

import { useSearchParams } from 'react-router-dom';

type ExperienceLevel =
  | 'fresher'
  | 'early'
  | 'mid'
  | 'senior';

type CurrentFocus =
  | 'student'
  | 'professional'
  | 'switch'
  | 'seeker';

type GoalTimeline =
  | '3-months'
  | '6-months'
  | '12-months'
  | 'flexible';

type Preference =
  | 'industry'
  | 'projects'
  | 'interview'
  | 'jobs';

const experienceOptions: {
  value: ExperienceLevel;
  label: string;
}[] = [
  {
    value: 'fresher',
    label: 'Fresher (0 – 1 year)',
  },
  {
    value: 'early',
    label: 'Early (1 – 3 years)',
  },
  {
    value: 'mid',
    label: 'Mid (3 – 5 years)',
  },
  {
    value: 'senior',
    label: 'Senior (5+ years)',
  },
];

const focusOptions: {
  value: CurrentFocus;
  label: string;
}[] = [
  {
    value: 'student',
    label: 'Student',
  },
  {
    value: 'professional',
    label: 'Working Professional',
  },
  {
    value: 'switch',
    label: 'Career Switch',
  },
  {
    value: 'seeker',
    label: 'Job Seeker',
  },
];

const timelineOptions: {
  value: GoalTimeline;
  label: string;
}[] = [
  {
    value: '3-months',
    label: '3 Months',
  },
  {
    value: '6-months',
    label: '6 Months',
  },
  {
    value: '12-months',
    label: '12 Months',
  },
  {
    value: 'flexible',
    label: 'Flexible',
  },
];

const preferenceOptions: {
  value: Preference;
  label: string;
}[] = [
  {
    value: 'industry',
    label: 'Industry-specific skills',
  },
  {
    value: 'projects',
    label: 'Real-world projects',
  },
  {
    value: 'interview',
    label: 'Interview preparation',
  },
  {
    value: 'jobs',
    label: 'Job recommendations',
  },
];

const benefitItems = [
  {
    title: 'Personalized learning roadmap',
    description:
      'A step-by-step plan for your target role.',
    icon: <CheckBoxOutlinedIcon />,
    background: '#f0efff',
    color: '#5645ed',
  },
  {
    title: 'AI skill gap analysis',
    description:
      'Identify key skills to focus on.',
    icon: <PsychologyOutlinedIcon />,
    background: '#fff5e7',
    color: '#f59e0b',
  },
  {
    title: 'Hands-on projects',
    description:
      'Build real-world experience.',
    icon: <RocketLaunchOutlinedIcon />,
    background: '#fff0fb',
    color: '#d946ef',
  },
  {
    title: 'Interview preparation',
    description:
      'Practice with AI and get feedback.',
    icon: <BusinessCenterOutlinedIcon />,
    background: '#eafaf4',
    color: '#10b981',
  },
  {
    title: 'Job matching',
    description:
      'Discover relevant opportunities when ready.',
    icon: <WorkOutlineRoundedIcon />,
    background: '#f1efff',
    color: '#6d4aff',
  },
];

const sectionIconSx = {
  width: 38,
  height: 38,
  borderRadius: 2,
  bgcolor: '#eef5ff',
  color: '#1269e8',
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
  '& svg': {
    fontSize: 22,
  },
};

const optionBoxSx = (
  selected: boolean,
) => ({
  minHeight: 42,
  px: 1.3,
  borderRadius: 2,
  border: selected
    ? '1.5px solid #1677ff'
    : '1px solid #d9e1ec',
  bgcolor: selected
    ? '#f5f9ff'
    : '#fff',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  transition: '0.15s ease',
  '&:hover': {
    borderColor: '#86b7ff',
    bgcolor: '#f9fbff',
  },
});

export const CareerGoalSetupPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const selectedPathId =
    searchParams.get('selected');

  /*
   * Frontend-only UI state.
   *
   * These values will be populated from the real
   * Accelerator goal/profile APIs during integration.
   */
  const [targetRole, setTargetRole] =
    useState('Backend Developer');

  const [
    experienceLevel,
    setExperienceLevel,
  ] =
    useState<ExperienceLevel>('fresher');

  const [currentFocus, setCurrentFocus] =
    useState<CurrentFocus[]>([
      'student',
    ]);

  const [goalTimeline, setGoalTimeline] =
    useState<GoalTimeline>('6-months');

  const [preferences, setPreferences] =
    useState<Preference[]>([
      'industry',
      'projects',
      'interview',
    ]);

  const targetRoles = useMemo(
    () => [
      'Backend Developer',
      'Frontend Developer',
      'Full Stack Developer',
      'Data Engineer',
      'Data Analyst',
      'Machine Learning Engineer',
      'DevOps Engineer',
      'QA Engineer',
    ],
    [],
  );

  const toggleFocus = (
    value: CurrentFocus,
  ) => {
    setCurrentFocus((previous) =>
      previous.includes(value)
        ? previous.filter(
            (item) => item !== value,
          )
        : [...previous, value],
    );
  };

  const togglePreference = (
    value: Preference,
  ) => {
    setPreferences((previous) =>
      previous.includes(value)
        ? previous.filter(
            (item) => item !== value,
          )
        : [...previous, value],
    );
  };

  const handleBack = () => {
    const params =
      new URLSearchParams(
        searchParams,
      );

    params.delete('screen');

    if (selectedPathId) {
      params.set(
        'selected',
        selectedPathId,
      );
    }

    params.set('type', 'career');

    setSearchParams(params);
  };

  /*
   * UI-only navigation for now.
   *
   * During API integration this button will:
   * 1. save/update the real career goal;
   * 2. create/refresh the Accelerator plan;
   * 3. continue to the assessment flow.
   */
  const handleCreatePlan = () => {
    const params =
      new URLSearchParams(
        searchParams,
      );

    params.set(
      'screen',
      'assessment',
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
          Your personalized, AI-powered
          journey from your current skills
          to your next dream role.
        </Typography>
      </Box>

      {/* TITLE / STEPPER */}

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
            Back to Accelerator
          </Button>

          <Typography
            component="h2"
            sx={{
              mt: 0.4,

              color: '#101936',

              fontWeight: 800,

              fontSize: {
                xs: '1.6rem',
                md: '2rem',
              },

              letterSpacing: '-0.03em',
            }}
          >
            Career Goal Setup
          </Typography>

          <Typography
            sx={{
              mt: 0.3,

              color: '#5f6c82',

              fontSize: '0.9rem',
            }}
          >
            Let&apos;s set up your career
            goal so we can create a
            personalized accelerator plan
            for you.
          </Typography>
        </Box>

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
            Step 1 of 5
          </Typography>

          <Stack
            direction="row"
            alignItems="flex-start"
          >
            {[
              'Goal',
              'Assessment',
              'Roadmap',
              'Build',
              'Apply',
            ].map(
              (step, index, array) => (
                <Box
                  key={step}
                  sx={{
                    flex:
                      index <
                      array.length - 1
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

                        borderRadius:
                          '50%',

                        border:
                          index === 0
                            ? '2px solid #1677ff'
                            : '2px solid #c5cedb',

                        bgcolor:
                          index === 0
                            ? '#1677ff'
                            : '#fff',

                        color:
                          index === 0
                            ? '#fff'
                            : '#8d99aa',

                        display: 'grid',

                        placeItems:
                          'center',

                        fontSize:
                          '0.75rem',

                        fontWeight: 800,

                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </Box>

                    {index <
                      array.length - 1 && (
                      <Box
                        sx={{
                          height: 2,

                          flex: 1,

                          bgcolor:
                            '#d9e1ed',
                        }}
                      />
                    )}
                  </Stack>

                  <Typography
                    sx={{
                      mt: 0.65,

                      color:
                        index === 0
                          ? '#17213b'
                          : '#58657a',

                      fontSize:
                        '0.72rem',

                      fontWeight:
                        index === 0
                          ? 800
                          : 600,
                    }}
                  >
                    {step}
                  </Typography>
                </Box>
              ),
            )}
          </Stack>
        </Box>
      </Box>

      {/* CONTENT */}

      <Box
        sx={{
          mt: 2.5,

          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',
            xl:
              'minmax(0, 1fr) 360px',
          },

          gap: 2,
        }}
      >
        {/* FORM */}

        <Box
          sx={{
            border:
              '1px solid #e0e6ef',

            borderRadius: 3,

            bgcolor: '#fff',

            overflow: 'hidden',
          }}
        >
          {/* TARGET ROLE */}

          <GoalSection
            icon={
              <SettingsSuggestOutlinedIcon />
            }
            title="Target Role"
            description="Choose the role you want to become."
            required
          >
            <FormControl
              fullWidth
              size="small"
            >
              <Select
                value={targetRole}
                onChange={(event) =>
                  setTargetRole(
                    event.target.value,
                  )
                }
                sx={{
                  borderRadius: 2,
                  bgcolor: '#fff',

                  '& .MuiSelect-select': {
                    py: 1.15,
                    fontSize:
                      '0.86rem',
                    fontWeight: 700,
                  },
                }}
              >
                {targetRoles.map(
                  (role) => (
                    <MenuItem
                      key={role}
                      value={role}
                    >
                      {role}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>
          </GoalSection>

          {/* EXPERIENCE */}

          <GoalSection
            icon={
              <BusinessCenterOutlinedIcon />
            }
            title="Experience Level"
            description="Select your current experience level."
            required
          >
            <Box
              sx={{
                display: 'grid',

                gridTemplateColumns: {
                  xs: '1fr',
                  sm:
                    'repeat(2, minmax(0, 1fr))',
                  lg:
                    'repeat(4, minmax(0, 1fr))',
                },

                gap: 1,
              }}
            >
              {experienceOptions.map(
                (option) => {
                  const selected =
                    experienceLevel ===
                    option.value;

                  return (
                    <Box
                      key={
                        option.value
                      }
                      onClick={() =>
                        setExperienceLevel(
                          option.value,
                        )
                      }
                      sx={optionBoxSx(
                        selected,
                      )}
                    >
                      <Radio
                        checked={
                          selected
                        }
                        size="small"
                        sx={{
                          p: 0,
                          mr: 0.8,
                        }}
                      />

                      <Typography
                        sx={{
                          color:
                            '#26324b',

                          fontSize:
                            '0.78rem',

                          fontWeight:
                            700,
                        }}
                      >
                        {
                          option.label
                        }
                      </Typography>
                    </Box>
                  );
                },
              )}
            </Box>
          </GoalSection>

          {/* CURRENT FOCUS */}

          <GoalSection
            icon={
              <AutoAwesomeRoundedIcon />
            }
            title="Current Focus"
            description="What best describes your current situation?"
            optional
          >
            <Box
              sx={{
                display: 'grid',

                gridTemplateColumns: {
                  xs: '1fr',
                  sm:
                    'repeat(2, minmax(0, 1fr))',
                  lg:
                    'repeat(4, minmax(0, 1fr))',
                },

                gap: 1,
              }}
            >
              {focusOptions.map(
                (option) => {
                  const checked =
                    currentFocus.includes(
                      option.value,
                    );

                  return (
                    <Box
                      key={
                        option.value
                      }
                      onClick={() =>
                        toggleFocus(
                          option.value,
                        )
                      }
                      sx={{
                        display:
                          'flex',

                        alignItems:
                          'center',

                        cursor:
                          'pointer',
                      }}
                    >
                      <Checkbox
                        checked={
                          checked
                        }
                        size="small"
                        sx={{
                          p: 0,
                          mr: 0.8,
                        }}
                      />

                      <Typography
                        sx={{
                          color:
                            '#26324b',

                          fontSize:
                            '0.8rem',

                          fontWeight:
                            650,
                        }}
                      >
                        {
                          option.label
                        }
                      </Typography>
                    </Box>
                  );
                },
              )}
            </Box>
          </GoalSection>

          {/* TIMELINE */}

          <GoalSection
            icon={
              <CalendarMonthOutlinedIcon />
            }
            title="Goal Timeline"
            description="When do you want to be ready for this role?"
          >
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
            >
              {timelineOptions.map(
                (option) => {
                  const selected =
                    goalTimeline ===
                    option.value;

                  return (
                    <Box
                      key={
                        option.value
                      }
                      onClick={() =>
                        setGoalTimeline(
                          option.value,
                        )
                      }
                      sx={{
                        ...optionBoxSx(
                          selected,
                        ),

                        minWidth: 125,
                      }}
                    >
                      <Radio
                        checked={
                          selected
                        }
                        size="small"
                        sx={{
                          p: 0,
                          mr: 0.8,
                        }}
                      />

                      <Typography
                        sx={{
                          color:
                            '#26324b',

                          fontSize:
                            '0.78rem',

                          fontWeight:
                            700,
                        }}
                      >
                        {
                          option.label
                        }
                      </Typography>
                    </Box>
                  );
                },
              )}
            </Stack>
          </GoalSection>

          {/* PREFERENCES */}

          <GoalSection
            icon={
              <TuneRoundedIcon />
            }
            title="Additional Preferences"
            description="Help us personalize your plan further."
            optional
            last
          >
            <Stack
              direction="row"
              spacing={2}
              useFlexGap
              flexWrap="wrap"
            >
              {preferenceOptions.map(
                (option) => {
                  const checked =
                    preferences.includes(
                      option.value,
                    );

                  return (
                    <Box
                      key={
                        option.value
                      }
                      onClick={() =>
                        togglePreference(
                          option.value,
                        )
                      }
                      sx={{
                        display:
                          'flex',

                        alignItems:
                          'center',

                        cursor:
                          'pointer',
                      }}
                    >
                      <Checkbox
                        checked={
                          checked
                        }
                        size="small"
                        sx={{
                          p: 0,
                          mr: 0.7,
                        }}
                      />

                      <Typography
                        sx={{
                          color:
                            '#26324b',

                          fontSize:
                            '0.78rem',

                          fontWeight:
                            650,
                        }}
                      >
                        {
                          option.label
                        }
                      </Typography>
                    </Box>
                  );
                },
              )}
            </Stack>
          </GoalSection>

          {/* ACTIONS */}

          <Stack
            direction={{
              xs: 'column-reverse',
              sm: 'row',
            }}
            justifyContent="flex-end"
            spacing={1.2}
            sx={{
              px: 2.2,
              py: 2,

              borderTop:
                '1px solid #e5e9f0',
            }}
          >
            <Button
              variant="outlined"
              onClick={handleBack}
              sx={{
                minWidth: 125,
                minHeight: 43,

                borderRadius: 2,

                textTransform: 'none',

                fontWeight: 700,
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              endIcon={
                <ArrowForwardRoundedIcon />
              }
              onClick={
                handleCreatePlan
              }
              sx={{
                minWidth: {
                  xs: '100%',
                  sm: 270,
                },

                minHeight: 43,

                borderRadius: 2,

                textTransform: 'none',

                fontWeight: 800,

                boxShadow: 'none',
              }}
            >
              Create My Accelerator Plan
            </Button>
          </Stack>
        </Box>

        {/* BENEFITS */}

        <Box
          sx={{
            alignSelf: 'start',

            border:
              '1px solid #e0e6ef',

            borderRadius: 3,

            bgcolor: '#fff',

            overflow: 'hidden',
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              px: 2.2,
              py: 2,

              borderBottom:
                '1px solid #edf0f5',
            }}
          >
            <AutoAwesomeRoundedIcon
              sx={{
                color: '#4c43ed',
              }}
            />

            <Typography
              sx={{
                color: '#111a38',

                fontSize: '1.1rem',

                fontWeight: 800,
              }}
            >
              What You&apos;ll Get
            </Typography>
          </Stack>

          <Stack
            spacing={2.2}
            sx={{
              p: 2.2,
            }}
          >
            {benefitItems.map(
              (item) => (
                <Stack
                  key={item.title}
                  direction="row"
                  spacing={1.3}
                  alignItems="flex-start"
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,

                      borderRadius: 2.5,

                      bgcolor:
                        item.background,

                      color:
                        item.color,

                      display: 'grid',

                      placeItems:
                        'center',

                      flexShrink: 0,

                      '& svg': {
                        fontSize: 21,
                      },
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        color:
                          '#17213b',

                        fontSize:
                          '0.86rem',

                        fontWeight:
                          800,
                      }}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.25,

                        color:
                          '#69758b',

                        fontSize:
                          '0.78rem',

                        lineHeight: 1.5,
                      }}
                    >
                      {
                        item.description
                      }
                    </Typography>
                  </Box>
                </Stack>
              ),
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

interface GoalSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  last?: boolean;
}

const GoalSection = ({
  icon,
  title,
  description,
  children,
  required = false,
  optional = false,
  last = false,
}: GoalSectionProps) => (
  <Box
    sx={{
      display: 'grid',

      gridTemplateColumns: {
        xs: '1fr',
        md: '310px minmax(0, 1fr)',
      },

      gap: {
        xs: 1.5,
        md: 2,
      },

      px: {
        xs: 1.7,
        md: 2.2,
      },

      py: 2,

      borderBottom: last
        ? 'none'
        : '1px solid #edf0f5',
    }}
  >
    <Stack
      direction="row"
      spacing={1.4}
      alignItems="flex-start"
    >
      <Box sx={sectionIconSx}>
        {icon}
      </Box>

      <Box>
        <Typography
          sx={{
            color: '#17213b',

            fontSize: '0.88rem',

            fontWeight: 800,
          }}
        >
          {title}

          {required && (
            <Box
              component="span"
              sx={{
                ml: 0.4,
                color: '#dc2626',
              }}
            >
              *
            </Box>
          )}

          {optional && (
            <Box
              component="span"
              sx={{
                ml: 0.4,

                color: '#667085',

                fontWeight: 600,
              }}
            >
              (Optional)
            </Box>
          )}
        </Typography>

        <Typography
          sx={{
            mt: 0.25,

            color: '#69758b',

            fontSize: '0.76rem',

            lineHeight: 1.45,
          }}
        >
          {description}
        </Typography>
      </Box>
    </Stack>

    <Box>{children}</Box>
  </Box>
);