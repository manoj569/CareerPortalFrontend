import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';

import {
  Box,
  Button,
  Divider,
  Stack,
  Typography,
} from '@mui/material';

import { useSearchParams } from 'react-router-dom';

const overviewItems = [
  'AI-powered, role-based assessment',
  'Covers core, technical and practical skills',
  'Identifies your strengths and skill gaps',
  'Adaptive assessment based on your answers',
  'Personalized learning roadmap after completion',
];

const coverageItems = [
  {
    title: 'Programming',
    detail: 'Core concepts',
    icon: <CodeRoundedIcon />,
    background: '#f2f1ff',
    color: '#4f46e5',
  },
  {
    title: 'Backend & APIs',
    detail: 'API knowledge',
    icon: <DnsRoundedIcon />,
    background: '#ebfaff',
    color: '#0891b2',
  },
  {
    title: 'Database',
    detail: 'Data concepts',
    icon: <StorageRoundedIcon />,
    background: '#f5efff',
    color: '#6d28d9',
  },
  {
    title: 'System Design',
    detail: 'Architecture',
    icon: <AccountTreeRoundedIcon />,
    background: '#f6efff',
    color: '#7c3aed',
  },
  {
    title: 'Problem Solving',
    detail: 'Practical thinking',
    icon: <PsychologyRoundedIcon />,
    background: '#fff0fd',
    color: '#c026d3',
  },
];

const stepItems = [
  'Goal',
  'Assessment',
  'Roadmap',
  'Build',
  'Apply',
];

export const SkillAssessmentPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  /*
   * UI-only values for now.
   * During integration these will come from the
   * candidate goal + assessment template APIs.
   */
  const targetRole = 'Backend Developer';
  const experienceLevel = 'Not set';
  const estimatedTime = 'Calculated when assessment starts';
  const numberOfQuestions = 'Based on assessment template';

  const handleBack = () => {
    const params =
      new URLSearchParams(searchParams);

    params.set('screen', 'goal');

    setSearchParams(params);
  };

  const handleStartAssessment = () => {
    const params =
      new URLSearchParams(searchParams);

    /*
     * This will be the actual question screen.
     * We will build it next.
     */
    params.set(
      'screen',
      'assessment-questions',
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

      {/* PAGE HEADER */}

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
            AI Skill Assessment
          </Typography>

          <Typography
            sx={{
              mt: 0.3,

              maxWidth: 780,

              color: '#5f6c82',

              fontSize: '0.9rem',
            }}
          >
            Assess your current skills so we
            can identify your strengths, skill
            gaps, and create a personalized
            learning plan.
          </Typography>
        </Box>

        {/* STEPPER */}

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
            Step 2 of 5
          </Typography>

          <Stack
            direction="row"
            alignItems="flex-start"
          >
            {stepItems.map(
              (step, index) => {
                const completed =
                  index === 0;

                const active =
                  index === 1;

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

                          borderRadius:
                            '50%',

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

                          display:
                            'grid',

                          placeItems:
                            'center',

                          fontSize:
                            '0.75rem',

                          fontWeight: 800,

                          flexShrink: 0,
                        }}
                      >
                        {completed ? (
                          <CheckCircleRoundedIcon
                            sx={{
                              fontSize: 18,
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
                                ? '#9ec3ff'
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
      </Box>

      {/* ASSESSMENT OVERVIEW */}

      <Box
        sx={{
          mt: 2.5,

          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',
            lg:
              'minmax(0, 1fr) 380px',
          },

          gap: 2,
        }}
      >
        {/* OVERVIEW */}

        <Box
          sx={{
            minHeight: 300,

            p: {
              xs: 2,
              md: 2.5,
            },

            border:
              '1px solid #e0e6ef',

            borderRadius: 3,

            bgcolor: '#fff',

            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',
              md: '300px minmax(0, 1fr)',
            },

            gap: {
              xs: 2,
              md: 3,
            },

            alignItems: 'center',
          }}
        >
          {/* VISUAL */}

          <Box
            sx={{
              minHeight: 230,

              borderRadius: 3,

              bgcolor: '#f2f7ff',

              display: 'grid',

              placeItems: 'center',

              position: 'relative',

              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',

                width: 180,
                height: 180,

                borderRadius: '50%',

                bgcolor: '#e6efff',
              }}
            />

            <Box
              sx={{
                position: 'relative',

                width: 170,
                height: 125,

                border:
                  '7px solid #2057af',

                borderRadius:
                  '10px 10px 5px 5px',

                bgcolor: '#fff',

                display: 'flex',

                flexDirection:
                  'column',

                justifyContent:
                  'center',

                gap: 1,

                px: 2,
              }}
            >
              {[1, 2, 3].map(
                (item) => (
                  <Stack
                    key={item}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <CheckCircleRoundedIcon
                      sx={{
                        color:
                          '#1677ff',

                        fontSize: 19,
                      }}
                    />

                    <Box
                      sx={{
                        width:
                          item === 2
                            ? '55%'
                            : '72%',

                        height: 8,

                        borderRadius: 5,

                        bgcolor:
                          '#dce6f6',
                      }}
                    />
                  </Stack>
                ),
              )}

              <Box
                sx={{
                  position:
                    'absolute',

                  right: -30,
                  bottom: -22,

                  width: 70,
                  height: 70,

                  borderRadius: 3,

                  bgcolor:
                    '#1677ff',

                  color: '#fff',

                  display: 'grid',

                  placeItems:
                    'center',

                  fontSize:
                    '1.7rem',

                  fontWeight: 800,

                  boxShadow:
                    '0 8px 24px rgba(22,119,255,0.25)',
                }}
              >
                AI
              </Box>
            </Box>
          </Box>

          {/* OVERVIEW TEXT */}

          <Box>
            <Typography
              sx={{
                color: '#111a38',

                fontSize: {
                  xs: '1.1rem',
                  md: '1.25rem',
                },

                fontWeight: 800,
              }}
            >
              Skill Assessment Overview
            </Typography>

            <Stack
              spacing={1.25}
              sx={{
                mt: 2,
              }}
            >
              {overviewItems.map(
                (item) => (
                  <Stack
                    key={item}
                    direction="row"
                    spacing={1.2}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        width: 22,
                        height: 22,

                        borderRadius:
                          '50%',

                        bgcolor:
                          '#eaf9ef',

                        color:
                          '#16a34a',

                        display: 'grid',

                        placeItems:
                          'center',

                        flexShrink: 0,
                      }}
                    >
                      <CheckCircleRoundedIcon
                        sx={{
                          fontSize: 17,
                        }}
                      />
                    </Box>

                    <Typography
                      sx={{
                        color:
                          '#26324b',

                        fontSize:
                          '0.86rem',

                        fontWeight: 650,
                      }}
                    >
                      {item}
                    </Typography>
                  </Stack>
                ),
              )}
            </Stack>
          </Box>
        </Box>

        {/* ASSESSMENT DETAILS */}

        <Box
          sx={{
            p: 1.3,

            border:
              '1px solid #e0e6ef',

            borderRadius: 3,

            bgcolor: '#fff',
          }}
        >
          <Box
            sx={{
              height: '100%',

              px: 2,
              py: 1,

              borderRadius: 2.5,

              background:
                'linear-gradient(145deg, #f5f8ff 0%, #faf8ff 100%)',
            }}
          >
            <AssessmentInfoRow
              icon={
                <TrackChangesRoundedIcon />
              }
              title="Your Target Role"
              value={targetRole}
            />

            <Divider />

            <AssessmentInfoRow
              icon={
                <WorkOutlineRoundedIcon />
              }
              title="Experience Level"
              value={experienceLevel}
            />

            <Divider />

            <AssessmentInfoRow
              icon={
                <CalendarMonthRoundedIcon />
              }
              title="Estimated Time"
              value={estimatedTime}
            />

            <Divider />

            <AssessmentInfoRow
              icon={
                <HelpOutlineRoundedIcon />
              }
              title="Number of Questions"
              value={numberOfQuestions}
              last
            />
          </Box>
        </Box>
      </Box>

      {/* COVERAGE */}

      <Box
        sx={{
          mt: 2,

          p: {
            xs: 1.8,
            md: 2.2,
          },

          border:
            '1px solid #e0e6ef',

          borderRadius: 3,

          bgcolor: '#fff',
        }}
      >
        <Stack
          direction="row"
          spacing={1.2}
          alignItems="flex-start"
        >
          <TrackChangesRoundedIcon
            sx={{
              color: '#1269e8',
              fontSize: 30,
            }}
          />

          <Box>
            <Typography
              sx={{
                color: '#111a38',

                fontSize: '1.05rem',

                fontWeight: 800,
              }}
            >
              Assessment Coverage
            </Typography>

            <Typography
              sx={{
                mt: 0.15,

                color: '#5f6c82',

                fontSize: '0.82rem',
              }}
            >
              Your assessment will evaluate
              key areas relevant to your
              selected career path.
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            mt: 1.8,

            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',
              sm:
                'repeat(2, minmax(0, 1fr))',
              lg:
                'repeat(5, minmax(0, 1fr))',
            },

            gap: 1.2,
          }}
        >
          {coverageItems.map(
            (item) => (
              <Box
                key={item.title}
                sx={{
                  minHeight: 75,

                  px: 1.4,
                  py: 1.2,

                  border:
                    '1px solid #e0e6ef',

                  borderRadius: 2.5,

                  display: 'flex',

                  alignItems: 'center',

                  gap: 1.2,

                  bgcolor: '#fff',
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,

                    borderRadius: 2.5,

                    bgcolor:
                      item.background,

                    color: item.color,

                    display: 'grid',

                    placeItems:
                      'center',

                    flexShrink: 0,

                    '& svg': {
                      fontSize: 22,
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
                        '0.8rem',

                      fontWeight: 800,
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.15,

                      color:
                        '#69758b',

                      fontSize:
                        '0.72rem',
                    }}
                  >
                    {item.detail}
                  </Typography>
                </Box>
              </Box>
            ),
          )}
        </Box>

        <Divider
          sx={{
            my: 2,
          }}
        />

        {/* BEFORE START + CTA */}

        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',
              lg:
                'minmax(0, 1fr) 330px',
            },

            gap: 2,

            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              px: 1.8,
              py: 1.5,

              borderRadius: 2.5,

              bgcolor: '#edf6ff',
            }}
          >
            <Stack
              direction="row"
              spacing={1.2}
              alignItems="flex-start"
            >
              <InfoOutlinedIcon
                sx={{
                  color: '#1269e8',
                  mt: 0.1,
                }}
              />

              <Box>
                <Typography
                  sx={{
                    color:
                      '#17213b',

                    fontSize:
                      '0.88rem',

                    fontWeight: 800,
                  }}
                >
                  Before You Start
                </Typography>

                <Box
                  component="ul"
                  sx={{
                    mt: 0.5,
                    mb: 0,
                    pl: 2.2,

                    color:
                      '#26324b',

                    '& li': {
                      mb: 0.25,
                      fontSize:
                        '0.77rem',
                      lineHeight: 1.5,
                    },
                  }}
                >
                  <li>
                    Use a stable internet
                    connection.
                  </li>

                  <li>
                    Find a quiet place to
                    focus.
                  </li>

                  <li>
                    Answer based on your
                    current knowledge.
                  </li>
                </Box>
              </Box>
            </Stack>
          </Box>

          <Button
            variant="contained"
            endIcon={
              <ArrowForwardRoundedIcon />
            }
            onClick={
              handleStartAssessment
            }
            sx={{
              width: '100%',

              minHeight: 56,

              borderRadius: 3,

              textTransform: 'none',

              fontSize: '1rem',

              fontWeight: 800,

              boxShadow: 'none',

              background:
                'linear-gradient(90deg, #1269ef 0%, #075cff 100%)',
            }}
          >
            Start Assessment
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

interface AssessmentInfoRowProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  last?: boolean;
}

const AssessmentInfoRow = ({
  icon,
  title,
  value,
}: AssessmentInfoRowProps) => (
  <Stack
    direction="row"
    spacing={1.5}
    alignItems="center"
    sx={{
      minHeight: 68,
      py: 1,
    }}
  >
    <Box
      sx={{
        width: 38,
        height: 38,

        borderRadius: 2,

        color: '#1269e8',

        display: 'grid',

        placeItems: 'center',

        flexShrink: 0,

        '& svg': {
          fontSize: 24,
        },
      }}
    >
      {icon}
    </Box>

    <Box>
      <Typography
        sx={{
          color: '#17213b',

          fontSize: '0.78rem',

          fontWeight: 800,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 0.15,

          color: '#17213b',

          fontSize: '0.82rem',

          fontWeight: 700,

          lineHeight: 1.35,
        }}
      >
        {value}
      </Typography>
    </Box>
  </Stack>
);