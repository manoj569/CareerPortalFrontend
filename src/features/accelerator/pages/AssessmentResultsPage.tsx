import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import QueryBuilderRoundedIcon from '@mui/icons-material/QueryBuilderRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';

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

interface SkillResult {
  name: string;
  score: number;
  icon: React.ReactNode;
}

const stepItems = [
  'Goal',
  'Assessment',
  'Roadmap',
  'Build',
  'Apply',
];

/*
 * TEMPORARY UI DATA ONLY.
 *
 * These values exist only so we can finish and approve
 * the frontend experience before API integration.
 *
 * During integration replace these with the real
 * Accelerator assessment result / evidence / skill-gap data.
 */
const skillResults: SkillResult[] = [
  {
    name: 'Programming',
    score: 85,
    icon: <CodeRoundedIcon />,
  },
  {
    name: 'Backend & APIs',
    score: 78,
    icon: <DnsRoundedIcon />,
  },
  {
    name: 'Database',
    score: 62,
    icon: <StorageRoundedIcon />,
  },
  {
    name: 'System Design',
    score: 56,
    icon: <DataObjectRoundedIcon />,
  },
  {
    name: 'Problem Solving',
    score: 80,
    icon: <PsychologyRoundedIcon />,
  },
];

const strengths = [
  'Good grasp of programming fundamentals',
  'Strong problem-solving approach',
  'Solid understanding of backend concepts',
];

const skillGaps = [
  'Database design and optimization',
  'System design and scalability',
  'Advanced backend architecture (e.g., caching, queues)',
];

export const AssessmentResultsPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  // Temporary UI values.
  const overallScore = 72;
  const correctAnswers = 36;
  const totalQuestions = 50;
  const areasToImprove = 14;
  const timeTaken = '~ 30 Min';

  const targetRole = 'Backend Developer';
  const experienceLevel = 'Fresher (0 – 1 year)';

  const handleBack = () => {
    const params =
      new URLSearchParams(searchParams);

    params.set(
      'screen',
      'assessment-questions',
    );

    setSearchParams(params);
  };

  const handleCreateRoadmap = () => {
    const params =
      new URLSearchParams(searchParams);

    /*
     * UI navigation only.
     * The real integration phase will generate/load
     * the candidate roadmap before navigating.
     */
    params.set('screen', 'roadmap');

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

      {/* =========================================
          HEADER + STEPPER
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

              fontWeight: 700,

              '&:hover': {
                bgcolor: 'transparent',
                color: '#0b57d0',
              },
            }}
          >
            Back to Assessment
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
            Assessment Results &amp; Skill Gap
          </Typography>

          <Typography
            sx={{
              mt: 0.3,

              maxWidth: 760,

              color: '#5f6c82',

              fontSize: '0.9rem',
            }}
          >
            Here&apos;s how you performed,
            your strengths, and the key areas
            to improve for your target role.
          </Typography>
        </Box>

        <AcceleratorStepper />
      </Box>

      {/* =========================================
          SCORE SUMMARY
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
              '1px solid #e0e6ef',

            borderRadius: 3,

            bgcolor: '#fff',

            p: {
              xs: 2,
              md: 2.5,
            },

            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',
              md:
                '190px minmax(0, 1fr) 230px',
            },

            gap: {
              xs: 2,
              md: 2.5,
            },

            alignItems: 'center',
          }}
        >
          {/* SCORE */}

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
                value={overallScore}
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

                    fontSize: '2.25rem',

                    lineHeight: 1,

                    fontWeight: 900,
                  }}
                >
                  {overallScore}%
                </Typography>

                <Typography
                  sx={{
                    mt: 0.6,

                    color: '#263858',

                    fontSize: '0.82rem',

                    fontWeight: 650,
                  }}
                >
                  Overall Score
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* PERFORMANCE MESSAGE */}

          <Box
            sx={{
              minHeight: 130,

              px: {
                md: 2.5,
              },

              borderLeft: {
                xs: 'none',
                md:
                  '1px solid #e6eaf0',
              },

              borderRight: {
                xs: 'none',
                md:
                  '1px solid #e6eaf0',
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

                gap: 0.7,

                px: 1.2,
                py: 0.6,

                borderRadius: 5,

                bgcolor: '#ddf6e1',

                color: '#14782b',

                fontSize: '0.85rem',

                fontWeight: 800,
              }}
            >
              <CheckCircleRoundedIcon
                sx={{
                  fontSize: 20,
                }}
              />

              Good Performance
            </Box>

            <Typography
              sx={{
                mt: 1.4,

                maxWidth: 420,

                color: '#26324b',

                fontSize: '0.9rem',

                lineHeight: 1.55,
              }}
            >
              You have a solid foundation!
              Focus on the identified skill
              gaps to reach a higher level for{' '}
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

          {/* STATS */}

          <Stack
            divider={<Divider />}
          >
            <ResultStat
              icon={
                <TrackChangesRoundedIcon />
              }
              value={`${correctAnswers} / ${totalQuestions}`}
              label="Correct Answers"
            />

            <ResultStat
              icon={
                <BarChartRoundedIcon />
              }
              value={`${areasToImprove} / ${totalQuestions}`}
              label="Areas to Improve"
            />

            <ResultStat
              icon={
                <QueryBuilderRoundedIcon />
              }
              value={timeTaken}
              label="Time Taken"
            />
          </Stack>
        </Box>

        {/* TARGET ROLE */}

        <Box
          sx={{
            border:
              '1px solid #e0e6ef',

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
            <TargetInfo
              icon={
                <TrackChangesRoundedIcon />
              }
              title="Your Target Role"
              value={targetRole}
            />

            <Divider
              sx={{
                my: 1.5,
              }}
            />

            <TargetInfo
              icon={
                <WorkOutlineRoundedIcon />
              }
              title="Experience Level"
              value={experienceLevel}
            />
          </Box>
        </Box>
      </Box>

      {/* =========================================
          PERFORMANCE + STRENGTHS/GAPS
      ========================================== */}

      <Box
        sx={{
          mt: 2,

          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',
            xl:
              'minmax(0, 1.08fr) minmax(0, 0.92fr)',
          },

          gap: 2,
        }}
      >
        {/* SKILL PERFORMANCE */}

        <Box
          sx={{
            border:
              '1px solid #e0e6ef',

            borderRadius: 3,

            bgcolor: '#fff',

            p: {
              xs: 1.8,
              md: 2.2,
            },
          }}
        >
          <Stack
            direction="row"
            spacing={1.2}
            alignItems="flex-start"
          >
            <BarChartRoundedIcon
              sx={{
                color: '#1269e8',
                fontSize: 30,
              }}
            />

            <Box>
              <Typography
                sx={{
                  color: '#111a38',

                  fontSize: '1.1rem',

                  fontWeight: 800,
                }}
              >
                Skill-wise Performance
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,

                  color: '#5f6c82',

                  fontSize: '0.8rem',
                }}
              >
                Your proficiency across key
                skill areas.
              </Typography>
            </Box>
          </Stack>

          <Stack
            spacing={1.25}
            sx={{
              mt: 2,
            }}
          >
            {skillResults.map(
              (skill) => (
                <SkillPerformanceRow
                  key={skill.name}
                  skill={skill}
                />
              ),
            )}
          </Stack>
        </Box>

        {/* RIGHT SIDE */}

        <Stack spacing={1.5}>
          {/* STRENGTHS */}

          <Box
            sx={{
              border:
                '1px solid #d9ebdc',

              borderRadius: 3,

              bgcolor: '#fff',

              p: 1.4,
            }}
          >
            <Box
              sx={{
                borderRadius: 2.5,

                p: 1.7,

                background:
                  'linear-gradient(100deg, #f4fff5 0%, #effbef 100%)',
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <EmojiEventsOutlinedIcon
                  sx={{
                    color: '#1fa33b',
                    fontSize: 28,
                  }}
                />

                <Typography
                  sx={{
                    color: '#111a38',

                    fontSize: '1.05rem',

                    fontWeight: 800,
                  }}
                >
                  Your Strengths
                </Typography>
              </Stack>

              <Stack
                spacing={0.9}
                sx={{
                  mt: 1.2,
                }}
              >
                {strengths.map(
                  (strength) => (
                    <Stack
                      key={strength}
                      direction="row"
                      spacing={1}
                      alignItems="flex-start"
                    >
                      <CheckRoundedIcon
                        sx={{
                          mt: 0.1,

                          color:
                            '#1ca238',

                          fontSize: 20,
                        }}
                      />

                      <Typography
                        sx={{
                          color:
                            '#26324b',

                          fontSize:
                            '0.84rem',

                          lineHeight: 1.45,
                        }}
                      >
                        {strength}
                      </Typography>
                    </Stack>
                  ),
                )}
              </Stack>
            </Box>
          </Box>

          {/* GAPS */}

          <Box
            sx={{
              border:
                '1px solid #eee1c7',

              borderRadius: 3,

              bgcolor: '#fff',

              p: 1.4,
            }}
          >
            <Box
              sx={{
                borderRadius: 2.5,

                p: 1.7,

                background:
                  'linear-gradient(100deg, #fffdf8 0%, #fff4df 100%)',
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <TrackChangesRoundedIcon
                  sx={{
                    color: '#ff3b30',
                    fontSize: 28,
                  }}
                />

                <Typography
                  sx={{
                    color: '#111a38',

                    fontSize: '1.05rem',

                    fontWeight: 800,
                  }}
                >
                  Key Skill Gaps to Work On
                </Typography>
              </Stack>

              <Stack
                spacing={0.9}
                sx={{
                  mt: 1.2,
                }}
              >
                {skillGaps.map(
                  (gap) => (
                    <Stack
                      key={gap}
                      direction="row"
                      spacing={1}
                      alignItems="flex-start"
                    >
                      <Box
                        sx={{
                          mt: 0.2,

                          width: 18,
                          height: 18,

                          borderRadius:
                            '50%',

                          bgcolor:
                            '#ffad0a',

                          color: '#fff',

                          display: 'grid',

                          placeItems:
                            'center',

                          flexShrink: 0,

                          fontSize:
                            '0.68rem',

                          fontWeight: 900,
                        }}
                      >
                        !
                      </Box>

                      <Typography
                        sx={{
                          color:
                            '#26324b',

                          fontSize:
                            '0.84rem',

                          lineHeight: 1.45,
                        }}
                      >
                        {gap}
                      </Typography>
                    </Stack>
                  ),
                )}
              </Stack>
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* =========================================
          ROADMAP CTA
      ========================================== */}

      <Box
        sx={{
          mt: 2,

          border:
            '1px solid #dce3ee',

          borderRadius: 3,

          bgcolor: '#fff',

          px: {
            xs: 1.8,
            md: 2.5,
          },

          py: {
            xs: 1.8,
            md: 2,
          },

          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',
            lg:
              '100px minmax(0, 1fr) 360px',
          },

          gap: 2,

          alignItems: 'center',
        }}
      >
        {/* ICON */}

        <Box
          sx={{
            width: 86,
            height: 86,

            borderRadius: '50%',

            bgcolor: '#f1efff',

            display: 'grid',

            placeItems: 'center',

            mx: {
              xs: 'auto',
              lg: 0,
            },
          }}
        >
          <Box
            sx={{
              width: 58,
              height: 68,

              borderRadius: 2,

              border:
                '4px solid #5364ee',

              bgcolor: '#fff',

              position: 'relative',

              display: 'flex',

              flexDirection: 'column',

              justifyContent:
                'center',

              gap: 0.7,

              px: 1,
            }}
          >
            {[1, 2, 3].map(
              (item) => (
                <Stack
                  key={item}
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                >
                  <CheckRoundedIcon
                    sx={{
                      color:
                        '#1677ff',

                      fontSize: 13,
                    }}
                  />

                  <Box
                    sx={{
                      height: 4,

                      width: '70%',

                      borderRadius: 5,

                      bgcolor:
                        '#dce5ff',
                    }}
                  />
                </Stack>
              ),
            )}

            <Box
              sx={{
                position:
                  'absolute',

                right: -22,
                bottom: -10,

                width: 42,
                height: 42,

                borderRadius:
                  '50%',

                bgcolor:
                  '#3d6ef0',

                color: '#fff',

                display: 'grid',

                placeItems:
                  'center',

                fontSize:
                  '0.85rem',

                fontWeight: 900,
              }}
            >
              AI
            </Box>
          </Box>
        </Box>

        {/* TEXT */}

        <Box
          sx={{
            textAlign: {
              xs: 'center',
              lg: 'left',
            },
          }}
        >
          <Typography
            sx={{
              color: '#111a38',

              fontSize: {
                xs: '1.1rem',
                md: '1.3rem',
              },

              fontWeight: 850,
            }}
          >
            Generate Your Personalized Roadmap
          </Typography>

          <Typography
            sx={{
              mt: 0.45,

              maxWidth: 650,

              color: '#39455d',

              fontSize: '0.88rem',

              lineHeight: 1.5,
            }}
          >
            Get a step-by-step learning plan
            to close your skill gaps and become
            a {targetRole}.
          </Typography>
        </Box>

        {/* BUTTON */}

        <Button
          variant="contained"
          endIcon={
            <ArrowForwardRoundedIcon />
          }
          onClick={
            handleCreateRoadmap
          }
          sx={{
            width: '100%',

            minHeight: 54,

            borderRadius: 4,

            textTransform: 'none',

            fontSize: {
              xs: '0.9rem',
              md: '1rem',
            },

            fontWeight: 800,

            boxShadow: 'none',

            background:
              'linear-gradient(90deg, #1269ef 0%, #075cff 100%)',
          }}
        >
          Create My Learning Roadmap
        </Button>
      </Box>
    </Box>
  );
};

/* ===============================================
   STEPPER
================================================ */

const AcceleratorStepper = () => (
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
);

/* ===============================================
   RESULT STAT
================================================ */

interface ResultStatProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const ResultStat = ({
  icon,
  value,
  label,
}: ResultStatProps) => (
  <Stack
    direction="row"
    spacing={1.2}
    alignItems="center"
    sx={{
      py: 1.1,
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

          fontSize: '1rem',

          fontWeight: 850,
        }}
      >
        {value}
      </Typography>

      <Typography
        sx={{
          mt: 0.1,

          color: '#4e5b72',

          fontSize: '0.73rem',
        }}
      >
        {label}
      </Typography>
    </Box>
  </Stack>
);

/* ===============================================
   TARGET INFO
================================================ */

interface TargetInfoProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

const TargetInfo = ({
  icon,
  title,
  value,
}: TargetInfoProps) => (
  <Stack
    direction="row"
    spacing={1.3}
    alignItems="flex-start"
  >
    <Box
      sx={{
        color: '#1269e8',

        pt: 0.2,

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

          fontSize: '0.82rem',

          fontWeight: 800,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 0.25,

          color: '#111a38',

          fontSize: '0.95rem',

          fontWeight: 850,
        }}
      >
        {value}
      </Typography>
    </Box>
  </Stack>
);

/* ===============================================
   SKILL PERFORMANCE
================================================ */

interface SkillPerformanceRowProps {
  skill: SkillResult;
}

const SkillPerformanceRow = ({
  skill,
}: SkillPerformanceRowProps) => {
  const progressColor =
    skill.score >= 70
      ? '#20ad3c'
      : skill.score >= 50
        ? '#ffb000'
        : '#ef4444';

  return (
    <Box
      sx={{
        display: 'grid',

        gridTemplateColumns: {
          xs: '40px 1fr 42px',
          sm:
            '42px 165px minmax(0, 1fr) 45px',
        },

        gap: 1,

        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,

          borderRadius: 2,

          bgcolor: '#f3f5ff',

          color: '#5b45f5',

          display: 'grid',

          placeItems: 'center',

          '& svg': {
            fontSize: 21,
          },
        }}
      >
        {skill.icon}
      </Box>

      <Typography
        sx={{
          color: '#17213b',

          fontSize: '0.82rem',

          fontWeight: 800,

          display: {
            xs: 'none',
            sm: 'block',
          },
        }}
      >
        {skill.name}
      </Typography>

      <Box
        sx={{
          minWidth: 0,
        }}
      >
        <Typography
          sx={{
            mb: 0.5,

            color: '#17213b',

            fontSize: '0.76rem',

            fontWeight: 800,

            display: {
              xs: 'block',
              sm: 'none',
            },
          }}
        >
          {skill.name}
        </Typography>

        <LinearProgress
          variant="determinate"
          value={skill.score}
          sx={{
            height: 10,

            borderRadius: 6,

            bgcolor: '#e5e8ef',

            '& .MuiLinearProgress-bar':
              {
                borderRadius: 6,

                backgroundColor:
                  progressColor,
              },
          }}
        />
      </Box>

      <Typography
        sx={{
          color: '#111a38',

          textAlign: 'right',

          fontSize: '0.85rem',

          fontWeight: 850,
        }}
      >
        {skill.score}%
      </Typography>
    </Box>
  );
};