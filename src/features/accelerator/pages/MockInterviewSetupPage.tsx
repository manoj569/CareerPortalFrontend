import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';

import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  MenuItem,
  Radio,
  Select,
  Stack,
  Typography,
} from '@mui/material';

import { ReactNode, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type InterviewType =
  | 'role'
  | 'project'
  | 'behavioral'
  | 'mixed';

type Difficulty =
  | 'beginner'
  | 'intermediate'
  | 'advanced';

type QuestionCount = 5 | 10 | 15;

interface InterviewTypeOption {
  id: InterviewType;
  title: string;
  description: string;
  icon: ReactNode;
}

interface FocusAreaOption {
  id: string;
  label: string;
}

/*
 * C17 FRONTEND-ONLY CONFIGURATION
 *
 * These values are presentation/configuration data for
 * the approved Mock Interview Setup UI.
 *
 * During backend integration:
 * - roles should come from Accelerator career/role APIs
 * - supported interview types should come from backend policy
 * - focus areas should be based on the user's roadmap/skills
 * - Start Interview should create a real interview session
 */
const interviewTypes: InterviewTypeOption[] = [
  {
    id: 'role',
    title: 'Role-based Interview',
    description:
      'Realistic questions for your target role (e.g., SQL Developer, Data Analyst).',
    icon: <BusinessCenterRoundedIcon />,
  },
  {
    id: 'project',
    title: 'Project Interview',
    description:
      'Questions based on your virtual project (Sales Management System).',
    icon: <CodeRoundedIcon />,
  },
  {
    id: 'behavioral',
    title: 'Behavioral Interview',
    description:
      'Evaluate your soft skills and work style (e.g., teamwork, problem-solving).',
    icon: <GroupsRoundedIcon />,
  },
  {
    id: 'mixed',
    title: 'Mixed Interview',
    description:
      'A combination of technical, project and behavioral questions.',
    icon: <LayersRoundedIcon />,
  },
];

const targetRoles = [
  'SQL Developer',
  'Backend Developer',
  'Frontend Developer',
  'Full Stack Developer',
  'Data Engineer',
  'Data Analyst',
  'Machine Learning Engineer',
  'DevOps Engineer',
  'QA Engineer',
];

const focusAreaOptions: FocusAreaOption[] = [
  {
    id: 'sql',
    label: 'SQL & Query Writing',
  },
  {
    id: 'database-design',
    label: 'Database Design',
  },
  {
    id: 'problem-solving',
    label: 'Problem Solving',
  },
  {
    id: 'project-discussion',
    label: 'Project Discussion',
  },
  {
    id: 'behavioral',
    label: 'Behavioral (Soft Skills)',
  },
];

const difficultyLabels: Record<
  Difficulty,
  string
> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const questionDuration: Record<
  QuestionCount,
  string
> = {
  5: '~10 minutes',
  10: '~20 minutes',
  15: '~30 minutes',
};

export const MockInterviewSetupPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [interviewType, setInterviewType] =
    useState<InterviewType>('role');

  const [targetRole, setTargetRole] =
    useState('SQL Developer');

  const [difficulty, setDifficulty] =
    useState<Difficulty>('intermediate');

  const [questionCount, setQuestionCount] =
    useState<QuestionCount>(10);

  const [focusAreas, setFocusAreas] = useState<
    string[]
  >([
    'sql',
    'database-design',
    'problem-solving',
  ]);

 const selectedInterviewType = useMemo(
  (): InterviewTypeOption => {
    const selected = interviewTypes.find(
      (item) => item.id === interviewType,
    );

    if (selected) {
      return selected;
    }

    return {
      id: 'role',
      title: 'Role-based Interview',
      description:
        'Realistic questions for your target role.',
      icon: <BusinessCenterRoundedIcon />,
    };
  },
  [interviewType],
);

  const selectedFocusAreaLabels = useMemo(
    () =>
      focusAreaOptions
        .filter((item) =>
          focusAreas.includes(item.id),
        )
        .map((item) => item.label),
    [focusAreas],
  );

  const navigateToScreen = (
    screen: string,
    extra?: Record<string, string>,
  ) => {
    const params = new URLSearchParams(
      searchParams,
    );

    params.set('screen', screen);

    if (extra) {
      Object.entries(extra).forEach(
        ([key, value]) => {
          params.set(key, value);
        },
      );
    }

    setSearchParams(params);
  };

  const handleBack = () => {
    navigateToScreen('project');
  };

  const handleAITutor = () => {
    navigateToScreen('ai-tutor');
  };

  const handleToggleFocusArea = (
    focusAreaId: string,
  ) => {
    setFocusAreas((current) => {
      if (current.includes(focusAreaId)) {
        return current.filter(
          (item) => item !== focusAreaId,
        );
      }

      return [...current, focusAreaId];
    });
  };

  const handleStartInterview = () => {
    /*
     * C18 will read these query-string values.
     *
     * Later this action should call the backend,
     * create a real mock-interview session and
     * navigate using the returned session id.
     */
    navigateToScreen('mock-interview-live', {
      interviewType,
      targetRole,
      difficulty,
      questionCount: String(questionCount),
      focusAreas: focusAreas.join(','),
    });
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
            xs: 2.3,
            md: 2.7,
          },
          color: '#fff',
          background:
            'linear-gradient(110deg, #075fc5 0%, #4137e7 52%, #8c00f5 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 260,
            height: 260,
            borderRadius: '50%',
            right: -70,
            top: -170,
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
            right: 220,
            bottom: -125,
            bgcolor:
              'rgba(255,255,255,0.05)',
          }}
        />

        <Stack
          direction="row"
          spacing={1}
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
              fontWeight: 900,
              fontSize: {
                xs: '1.5rem',
                md: '2rem',
              },
              letterSpacing: '-0.03em',
            }}
          >
            AI Career Accelerator
          </Typography>

          <Chip
            label="👑 Premium"
            size="small"
            sx={{
              bgcolor:
                'rgba(255,171,40,0.25)',
              color: '#ffe49b',
              border:
                '1px solid rgba(255,200,70,0.7)',
              fontWeight: 900,
            }}
          />
        </Stack>

        <Typography
          sx={{
            position: 'relative',
            mt: 0.45,
            color:
              'rgba(255,255,255,0.92)',
            fontSize: {
              xs: '0.82rem',
              md: '0.94rem',
            },
          }}
        >
          Your personalized, AI-powered
          journey from your current skills to
          your next dream role.
        </Typography>
      </Box>

      {/* HEADER */}

      <Box
        sx={{
          mt: 1.2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md:
              'minmax(0, 1fr) auto',
          },
          gap: 1.3,
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
              color: '#17213b',
              textTransform: 'none',
              fontWeight: 850,
              '&:hover': {
                bgcolor: 'transparent',
                color: '#075fd6',
              },
            }}
          >
            Back to Project
          </Button>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              mt: 0.2,
            }}
          >
            <Box
              sx={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                bgcolor: '#f3e7ff',
                color: '#7b20e9',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <MicRoundedIcon
                sx={{
                  fontSize: 34,
                }}
              />
            </Box>

            <Box>
              <Typography
                component="h2"
                sx={{
                  color: '#0d1538',
                  fontSize: {
                    xs: '1.55rem',
                    md: '2rem',
                  },
                  fontWeight: 900,
                  lineHeight: 1.05,
                  letterSpacing:
                    '-0.035em',
                }}
              >
                Mock Interview Setup
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  color: '#536078',
                  fontSize: '0.82rem',
                }}
              >
                Prepare for real interviews
                with an AI-powered mock
                interview.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack
          direction="row"
          spacing={0.6}
          sx={{
            p: 0.6,
            border:
              '1px solid #dce3ee',
            borderRadius: 3,
            bgcolor: '#fff',
            overflowX: 'auto',
          }}
        >
          <TopTab
            icon={
              <PsychologyRoundedIcon />
            }
            label="AI Tutor"
            onClick={handleAITutor}
          />

          <TopTab
            active
            icon={<MicRoundedIcon />}
            label="Mock Interview"
          />
        </Stack>
      </Box>

      {/* MAIN CONFIGURATION */}

      <Box
        sx={{
          mt: 1.5,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg:
              'minmax(320px, 0.85fr) minmax(0, 1fr)',
          },
          gap: 1.5,
        }}
      >
        {/* STEP 1 */}

        <Box sx={cardSx}>
          <StepHeading
            step="1"
            title="Choose Interview Type"
          />

          <Stack
            spacing={0.85}
            sx={{
              mt: 1.1,
            }}
          >
            {interviewTypes.map((option) => {
              const selected =
                interviewType === option.id;

              return (
                <Box
                  key={option.id}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    setInterviewType(
                      option.id,
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                        'Enter' ||
                      event.key === ' '
                    ) {
                      setInterviewType(
                        option.id,
                      );
                    }
                  }}
                  sx={{
                    cursor: 'pointer',
                    border: selected
                      ? '1.5px solid #8125f4'
                      : '1px solid #dce3ee',
                    borderRadius: 2.5,
                    px: 1,
                    py: 0.85,
                    background: selected
                      ? 'linear-gradient(90deg, #fff 0%, #fbf3ff 100%)'
                      : '#fff',
                    transition:
                      'all 0.18s ease',
                    '&:hover': {
                      borderColor:
                        '#9b5df4',
                      transform:
                        'translateY(-1px)',
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={0.8}
                    alignItems="center"
                  >
                    <Radio
                      checked={selected}
                      size="small"
                      sx={{
                        p: 0.2,
                        color: '#27324a',
                        '&.Mui-checked': {
                          color: '#7b16e8',
                        },
                      }}
                    />

                    <Box
                      sx={{
                        width: 50,
                        height: 46,
                        borderRadius: 2,
                        bgcolor: selected
                          ? '#eee2ff'
                          : '#eef2ff',
                        color: '#4922e6',
                        display: 'grid',
                        placeItems:
                          'center',
                        flexShrink: 0,
                        '& svg': {
                          fontSize: 28,
                        },
                      }}
                    >
                      {option.icon}
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          color:
                            '#111a38',
                          fontSize:
                            '0.87rem',
                          fontWeight: 900,
                        }}
                      >
                        {option.title}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.1,
                          color:
                            '#536078',
                          fontSize:
                            '0.68rem',
                          lineHeight: 1.35,
                        }}
                      >
                        {
                          option.description
                        }
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Box>

        {/* STEP 2 */}

        <Box sx={cardSx}>
          <StepHeading
            step="2"
            title="Target Role & Configuration"
          />

          <Typography
            sx={{
              mt: 1,
              ...fieldLabelSx,
            }}
          >
            Target Role *
          </Typography>

          <FormControl
            fullWidth
            size="small"
            sx={{
              mt: 0.45,
            }}
          >
            <Select
              value={targetRole}
              onChange={(event) =>
                setTargetRole(
                  event.target.value,
                )
              }
              sx={{
                borderRadius: 2.2,
                fontWeight: 800,
                color: '#111a38',
                bgcolor: '#fff',
              }}
            >
              {targetRoles.map((role) => (
                <MenuItem
                  key={role}
                  value={role}
                >
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* DIFFICULTY */}

          <Typography
            sx={{
              mt: 1.15,
              ...fieldLabelSx,
            }}
          >
            Interview Difficulty
          </Typography>

          <Box
            sx={{
              mt: 0.55,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm:
                  'repeat(3, minmax(0, 1fr))',
              },
              gap: 0.7,
            }}
          >
            <DifficultyButton
              active={
                difficulty === 'beginner'
              }
              icon={
                <SpeedRoundedIcon />
              }
              label="Beginner"
              onClick={() =>
                setDifficulty(
                  'beginner',
                )
              }
            />

            <DifficultyButton
              active={
                difficulty ===
                'intermediate'
              }
              icon={
                <TrackChangesRoundedIcon />
              }
              label="Intermediate"
              onClick={() =>
                setDifficulty(
                  'intermediate',
                )
              }
            />

            <DifficultyButton
              active={
                difficulty === 'advanced'
              }
              icon={
                <RocketLaunchRoundedIcon />
              }
              label="Advanced"
              onClick={() =>
                setDifficulty(
                  'advanced',
                )
              }
            />
          </Box>

          {/* QUESTION COUNT */}

          <Typography
            sx={{
              mt: 1.15,
              ...fieldLabelSx,
            }}
          >
            Number of Questions
          </Typography>

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={0.8}
            useFlexGap
            flexWrap="wrap"
            sx={{
              mt: 0.4,
            }}
          >
            {(
              [5, 10, 15] as QuestionCount[]
            ).map((count) => (
              <Button
                key={count}
                onClick={() =>
                  setQuestionCount(count)
                }
                startIcon={
                  <Radio
                    checked={
                      questionCount ===
                      count
                    }
                    size="small"
                    sx={{
                      p: 0,
                      color: '#27324a',
                      '&.Mui-checked': {
                        color:
                          '#7b16e8',
                      },
                    }}
                  />
                }
                sx={{
                  px: 0.4,
                  color: '#111a38',
                  textTransform: 'none',
                  fontSize: '0.7rem',
                  fontWeight: 750,
                }}
              >
                {count} Questions (
                {
                  questionDuration[count]
                }
                )
              </Button>
            ))}
          </Stack>

          {/* FOCUS AREAS */}

          <Typography
            sx={{
              mt: 1,
              ...fieldLabelSx,
            }}
          >
            Focus Areas (Optional)
          </Typography>

          <Box
            sx={{
              mt: 0.35,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm:
                  'repeat(2, minmax(0, 1fr))',
                xl:
                  'repeat(3, minmax(0, 1fr))',
              },
              gap: 0.2,
            }}
          >
            {focusAreaOptions.map(
              (focusArea) => {
                const selected =
                  focusAreas.includes(
                    focusArea.id,
                  );

                return (
                  <Stack
                    key={focusArea.id}
                    direction="row"
                    spacing={0.3}
                    alignItems="center"
                    onClick={() =>
                      handleToggleFocusArea(
                        focusArea.id,
                      )
                    }
                    sx={{
                      cursor: 'pointer',
                    }}
                  >
                    <Checkbox
                      checked={selected}
                      size="small"
                      sx={{
                        p: 0.25,
                        color: '#8490a4',
                        '&.Mui-checked': {
                          color:
                            '#7816e7',
                        },
                      }}
                    />

                    <Typography
                      sx={{
                        color: '#17213b',
                        fontSize:
                          '0.68rem',
                        fontWeight: 750,
                      }}
                    >
                      {focusArea.label}
                    </Typography>
                  </Stack>
                );
              },
            )}
          </Box>
        </Box>
      </Box>

      {/* PREVIEW + TIPS */}

      <Box
        sx={{
          mt: 1.5,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg:
              'minmax(300px, 0.8fr) minmax(0, 1fr)',
          },
          gap: 1.5,
        }}
      >
        {/* PREVIEW */}

        <Box sx={cardSx}>
          <Stack
            direction="row"
            spacing={0.7}
            alignItems="center"
          >
            <BusinessCenterRoundedIcon
              sx={{
                color: '#6d20e9',
              }}
            />

            <Typography
              sx={{
                color: '#111a38',
                fontSize: '1rem',
                fontWeight: 900,
              }}
            >
              Interview Preview
            </Typography>
          </Stack>

          <Stack
            spacing={0.55}
            sx={{
              mt: 1,
            }}
          >
            <PreviewRow
              label="Type:"
              value={
                selectedInterviewType.title
              }
            />

            <PreviewRow
              label="Target Role:"
              value={targetRole}
            />

            <PreviewRow
              label="Difficulty:"
              value={
                difficultyLabels[
                  difficulty
                ]
              }
            />

            <PreviewRow
              label="Questions:"
              value={`${questionCount} (${questionDuration[questionCount]})`}
            />

            <PreviewRow
              label="Focus Areas:"
              value={
                selectedFocusAreaLabels
                  .length > 0
                  ? selectedFocusAreaLabels.join(
                      ', ',
                    )
                  : 'General interview preparation'
              }
            />
          </Stack>
        </Box>

        {/* TIPS */}

        <Box
          sx={{
            ...cardSx,
            position: 'relative',
            overflow: 'hidden',
            borderColor: '#b988ff',
            background:
              'linear-gradient(110deg, #fff 0%, #faf3ff 100%)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              right: 20,
              bottom: -10,
              opacity: 0.14,
              color: '#7118e8',
            }}
          >
            <TrackChangesRoundedIcon
              sx={{
                fontSize: 120,
              }}
            />
          </Box>

          <Stack
            direction="row"
            spacing={0.7}
            alignItems="center"
            sx={{
              position: 'relative',
            }}
          >
            <AutoAwesomeRoundedIcon
              sx={{
                color: '#7b18e8',
              }}
            />

            <Typography
              sx={{
                color: '#111a38',
                fontSize: '1rem',
                fontWeight: 900,
              }}
            >
              Tips for a Better Mock
              Interview
            </Typography>
          </Stack>

          <Stack
            spacing={0.65}
            sx={{
              mt: 1,
              position: 'relative',
            }}
          >
            <TipRow>
              Choose the same role and
              difficulty as your target job.
            </TipRow>

            <TipRow>
              Answer as you would in a real
              interview.
            </TipRow>

            <TipRow>
              Use the virtual project you are
              working on as practical context.
            </TipRow>

            <TipRow>
              Get AI feedback and improvement
              suggestions after the interview.
            </TipRow>
          </Stack>
        </Box>
      </Box>

      {/* START BUTTON */}

      <Box
        sx={{
          mt: 1.5,
          mb: 2,
          display: 'flex',
          justifyContent: {
            xs: 'stretch',
            md: 'flex-end',
          },
        }}
      >
        <Button
          variant="contained"
          size="large"
          startIcon={
            <PlayArrowRoundedIcon />
          }
          endIcon={
            <ArrowForwardRoundedIcon />
          }
          onClick={handleStartInterview}
          sx={{
            width: {
              xs: '100%',
              md: 360,
            },
            minHeight: 52,
            borderRadius: 2.5,
            textTransform: 'none',
            fontSize: '0.95rem',
            fontWeight: 900,
            boxShadow:
              '0 10px 24px rgba(91, 24, 220, 0.22)',
            background:
              'linear-gradient(90deg, #7115e8 0%, #8611ef 55%, #4b22df 100%)',
            '&:hover': {
              boxShadow:
                '0 12px 28px rgba(91, 24, 220, 0.3)',
            },
          }}
        >
          Start Mock Interview
        </Button>
      </Box>
    </Box>
  );
};

/* =========================================
   STEP HEADING
========================================= */

interface StepHeadingProps {
  step: string;
  title: string;
}

const StepHeading = ({
  step,
  title,
}: StepHeadingProps) => (
  <Stack
    direction="row"
    spacing={0.8}
    alignItems="center"
  >
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        bgcolor: '#6516df',
        color: '#fff',
        display: 'grid',
        placeItems: 'center',
        fontWeight: 900,
      }}
    >
      {step}
    </Box>

    <Typography
      sx={{
        color: '#111a38',
        fontSize: '1rem',
        fontWeight: 900,
      }}
    >
      {title}
    </Typography>
  </Stack>
);

/* =========================================
   TOP TAB
========================================= */

interface TopTabProps {
  active?: boolean;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

const TopTab = ({
  active = false,
  icon,
  label,
  onClick,
}: TopTabProps) => (
  <Button
    startIcon={icon}
    onClick={onClick}
    sx={{
      minWidth: {
        xs: 150,
        md: 190,
      },
      minHeight: 46,
      borderRadius: 2.3,
      color: active
        ? '#fff'
        : '#17213b',
      bgcolor: active
        ? '#6b24e8'
        : '#f8f9fc',
      textTransform: 'none',
      fontWeight: 900,
      boxShadow: active
        ? '0 5px 14px rgba(105, 36, 232, 0.2)'
        : 'none',
      '&:hover': {
        bgcolor: active
          ? '#5719d4'
          : '#eef2f8',
      },
    }}
  >
    {label}
  </Button>
);

/* =========================================
   DIFFICULTY
========================================= */

interface DifficultyButtonProps {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

const DifficultyButton = ({
  active,
  icon,
  label,
  onClick,
}: DifficultyButtonProps) => (
  <Button
    startIcon={icon}
    onClick={onClick}
    sx={{
      minHeight: 43,
      borderRadius: 2.2,
      border: active
        ? '1.5px solid #7a1ff0'
        : '1px solid #d6ddea',
      bgcolor: active
        ? '#fbf4ff'
        : '#fff',
      color: active
        ? '#6717e3'
        : '#17213b',
      textTransform: 'none',
      fontSize: '0.7rem',
      fontWeight: 900,
      '&:hover': {
        bgcolor: active
          ? '#f6eaff'
          : '#f8f9fc',
        borderColor: '#8d4de8',
      },
    }}
  >
    {label}
  </Button>
);

/* =========================================
   PREVIEW
========================================= */

interface PreviewRowProps {
  label: string;
  value: string;
}

const PreviewRow = ({
  label,
  value,
}: PreviewRowProps) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: '110px minmax(0, 1fr)',
        sm: '125px minmax(0, 1fr)',
      },
      gap: 0.7,
      alignItems: 'start',
      pb: 0.45,
      borderBottom:
        '1px solid #e4e8f0',
    }}
  >
    <Typography
      sx={{
        color: '#17213b',
        fontSize: '0.7rem',
        fontWeight: 900,
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        color: '#17213b',
        fontSize: '0.7rem',
        fontWeight: 650,
      }}
    >
      {value}
    </Typography>
  </Box>
);

/* =========================================
   TIP
========================================= */

const TipRow = ({
  children,
}: {
  children: ReactNode;
}) => (
  <Stack
    direction="row"
    spacing={0.7}
    alignItems="flex-start"
  >
    <CheckCircleRoundedIcon
      sx={{
        mt: '1px',
        color: '#14a52b',
        fontSize: 19,
      }}
    />

    <Typography
      sx={{
        color: '#17213b',
        fontSize: '0.7rem',
        lineHeight: 1.4,
      }}
    >
      {children}
    </Typography>
  </Stack>
);

const cardSx = {
  border: '1px solid #dce3ee',
  borderRadius: 3,
  bgcolor: '#fff',
  p: {
    xs: 1.4,
    md: 1.6,
  },
  boxShadow:
    '0 4px 14px rgba(24, 35, 64, 0.04)',
};

const fieldLabelSx = {
  color: '#111a38',
  fontSize: '0.72rem',
  fontWeight: 900,
};