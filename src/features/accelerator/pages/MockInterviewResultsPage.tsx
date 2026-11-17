import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';

import { ReactNode, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

interface PerformanceItem {
  id: string;
  label: string;
  score: number;
  icon: ReactNode;
  barColor: string;
  iconColor: string;
  iconBackground: string;
}

interface QuestionResult {
  number: number;
  title: string;
  score: number;
}

/*
 * C19 TEMPORARY UI DATA ONLY
 *
 * This data exists only to reproduce the approved
 * Interview Results & AI Feedback design.
 *
 * Production integration must replace:
 * - overall score
 * - performance breakdown
 * - question scores
 * - strengths
 * - improvement areas
 * - recommendations
 * - duration
 *
 * with actual backend interview evaluation data.
 */
const overallScore = 84;

const performanceItems: PerformanceItem[] = [
  {
    id: 'technical',
    label: 'Technical (SQL & DB)',
    score: 88,
    icon: <StorageRoundedIcon />,
    barColor: '#14a72a',
    iconColor: '#7a18e8',
    iconBackground: '#f0e5ff',
  },
  {
    id: 'project',
    label: 'Project Discussion',
    score: 82,
    icon: <WorkRoundedIcon />,
    barColor: '#1689e8',
    iconColor: '#0782e8',
    iconBackground: '#e5f4ff',
  },
  {
    id: 'problem-solving',
    label: 'Problem Solving',
    score: 80,
    icon: <PsychologyRoundedIcon />,
    barColor: '#7521e8',
    iconColor: '#7521e8',
    iconBackground: '#efe5ff',
  },
  {
    id: 'behavioral',
    label: 'Behavioral (Soft Skills)',
    score: 86,
    icon: <SchoolRoundedIcon />,
    barColor: '#ff7a00',
    iconColor: '#ef7900',
    iconBackground: '#fff0dc',
  },
];

const questionResults: QuestionResult[] = [
  {
    number: 1,
    title: 'SQL Joins & Difference',
    score: 90,
  },
  {
    number: 2,
    title: 'Query Writing Scenario',
    score: 85,
  },
  {
    number: 3,
    title: 'Database Design',
    score: 82,
  },
  {
    number: 4,
    title: 'Project Implementation',
    score: 80,
  },
  {
    number: 5,
    title: 'Problem Solving',
    score: 78,
  },
  {
    number: 6,
    title: 'Scenario-based SQL',
    score: 88,
  },
  {
    number: 7,
    title: 'Behavioral – Teamwork',
    score: 86,
  },
  {
    number: 8,
    title: 'Behavioral – Challenge',
    score: 85,
  },
  {
    number: 9,
    title: 'Project Impact & Learnings',
    score: 82,
  },
  {
    number: 10,
    title: 'Closing & Fit for Role',
    score: 86,
  },
];

const strengths = [
  'Clear understanding of SQL concepts and joins.',
  'Provided relevant and practical examples.',
  'Good problem-solving approach and communication.',
];

const improvementAreas = [
  'Add more details on performance and optimization.',
  'Structure your answers using a clear approach (e.g., problem, solution, result).',
  'Be more specific about your role and impact in the project.',
];

const recommendations = [
  'Review indexing and query optimization concepts.',
  'Practice explaining projects with your contribution and measurable results.',
  'Take a few more mock interviews to improve confidence and response flow.',
];

export const MockInterviewResultsPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const targetRole =
    searchParams.get('targetRole') ??
    'SQL Developer';

  const interviewType =
    searchParams.get('interviewType') ??
    'role';

  const difficulty =
    searchParams.get('difficulty') ??
    'intermediate';

  const parsedQuestionCount = Number(
    searchParams.get('questionCount') ?? 10,
  );

  const totalQuestions =
    Number.isFinite(parsedQuestionCount) &&
    parsedQuestionCount > 0
      ? parsedQuestionCount
      : 10;

  const formattedInterviewType =
    useMemo(() => {
      switch (interviewType) {
        case 'project':
          return 'Project';
        case 'behavioral':
          return 'Behavioral';
        case 'mixed':
          return 'Mixed';
        default:
          return 'Role-based';
      }
    }, [interviewType]);

  const formattedDifficulty =
    difficulty.length > 0
      ? `${difficulty
          .charAt(0)
          .toUpperCase()}${difficulty.slice(1)}`
      : 'Intermediate';

  const navigateToScreen = (
    screen: string,
  ) => {
    const params =
      new URLSearchParams(searchParams);

    params.set('screen', screen);

    setSearchParams(params);
  };

  const handleBack = () => {
    navigateToScreen(
      'mock-interview-setup',
    );
  };

  const handleRetake = () => {
    navigateToScreen(
      'mock-interview-setup',
    );
  };

  const handleCareerReadiness = () => {
    navigateToScreen(
      'career-readiness',
    );
  };

  const handleDetailedAnalysis = () => {
    /*
     * For now this page itself contains the
     * detailed breakdown.
     *
     * Once the backend evaluation contract is
     * integrated, this can scroll/open a dedicated
     * detailed analysis experience if required.
     */
    const element =
      document.getElementById(
        'question-wise-performance',
      );

    element?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
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
            xs: 2.2,
            md: 2.6,
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
              letterSpacing:
                '-0.03em',
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
          journey from your current skills
          to your next dream role.
        </Typography>
      </Box>

      {/* PAGE HEADER */}

      <Box
        sx={{
          mt: 1.1,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg:
              'minmax(0, 1fr) auto',
          },
          gap: 1.4,
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
            Back to Interview
          </Button>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              mt: 0.15,
            }}
          >
            <Box
              sx={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                bgcolor: '#fff0db',
                color: '#f1a000',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <EmojiEventsRoundedIcon
                sx={{
                  fontSize: 37,
                }}
              />
            </Box>

            <Box>
              <Typography
                component="h2"
                sx={{
                  color: '#0d1538',
                  fontSize: {
                    xs: '1.5rem',
                    md: '1.9rem',
                  },
                  fontWeight: 900,
                  lineHeight: 1.05,
                  letterSpacing:
                    '-0.035em',
                }}
              >
                Interview Results & AI
                Feedback
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  color: '#536078',
                  fontSize: '0.8rem',
                }}
              >
                Your mock interview is
                complete! Here&apos;s your
                performance, feedback, and
                next steps.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          spacing={0.8}
        >
          <Button
            variant="outlined"
            startIcon={
              <RefreshRoundedIcon />
            }
            onClick={handleRetake}
            sx={{
              minHeight: 46,
              minWidth: 190,
              borderRadius: 2.4,
              borderColor: '#ccd5e6',
              color: '#17213b',
              textTransform: 'none',
              fontWeight: 900,
            }}
          >
            Retake Interview
          </Button>

          <Button
            variant="contained"
            startIcon={
              <AssessmentRoundedIcon />
            }
            onClick={
              handleCareerReadiness
            }
            sx={{
              minHeight: 46,
              minWidth: 190,
              borderRadius: 2.4,
              textTransform: 'none',
              fontWeight: 900,
              boxShadow: 'none',
              background:
                'linear-gradient(90deg, #7a20e8 0%, #5a22df 100%)',
            }}
          >
            Career Readiness
          </Button>
        </Stack>
      </Box>

      {/* SCORE + BREAKDOWN */}

      <Box
        sx={{
          mt: 1.5,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl:
              'minmax(360px, 0.95fr) minmax(0, 1.05fr)',
          },
          gap: 1.5,
        }}
      >
        {/* OVERALL SCORE */}

        <Box sx={cardSx}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
          >
            <Stack
              direction="row"
              spacing={0.7}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  bgcolor: '#791be8',
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <EmojiEventsRoundedIcon
                  sx={{
                    fontSize: 23,
                  }}
                />
              </Box>

              <Typography
                sx={cardTitleSx}
              >
                Overall Interview Score
              </Typography>
            </Stack>

            <Chip
              icon={
                <CheckCircleRoundedIcon />
              }
              label="Interview Completed"
              size="small"
              sx={{
                bgcolor: '#dcf7e1',
                color: '#187a29',
                fontWeight: 900,
                '& .MuiChip-icon': {
                  color: '#17902c',
                },
              }}
            />
          </Stack>

          <Box
            sx={{
              mt: 1.2,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm:
                  '200px minmax(0, 1fr)',
              },
              gap: 1.5,
              alignItems: 'center',
            }}
          >
            <ScoreCircle
              score={overallScore}
            />

            <Stack
              divider={
                <Divider flexItem />
              }
            >
              <DetailRow
                icon={
                  <WorkRoundedIcon />
                }
                label="Target Role:"
                value={targetRole}
              />

              <DetailRow
                icon={
                  <TrackChangesRoundedIcon />
                }
                label="Interview Type:"
                value={
                  formattedInterviewType
                }
              />

              <DetailRow
                icon={
                  <AssessmentRoundedIcon />
                }
                label="Difficulty:"
                value={
                  formattedDifficulty
                }
              />

              <DetailRow
                icon={
                  <ListAltRoundedIcon />
                }
                label="Questions:"
                value={String(
                  totalQuestions,
                )}
              />

              <DetailRow
                icon={
                  <TimerOutlinedIcon />
                }
                label="Duration:"
                value="19 min 42 sec"
              />
            </Stack>
          </Box>
        </Box>

        {/* PERFORMANCE */}

        <Box sx={cardSx}>
          <Stack
            direction="row"
            spacing={0.7}
            alignItems="center"
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: '#791be8',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <AssessmentRoundedIcon />
            </Box>

            <Typography
              sx={cardTitleSx}
            >
              Performance Breakdown
            </Typography>
          </Stack>

          <Stack
            spacing={1.2}
            sx={{
              mt: 1.4,
            }}
          >
            {performanceItems.map(
              (item) => (
                <PerformanceRow
                  key={item.id}
                  item={item}
                />
              ),
            )}
          </Stack>
        </Box>
      </Box>

      {/* FEEDBACK + QUESTIONS */}

      <Box
        sx={{
          mt: 1.5,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl:
              'minmax(0, 1.05fr) minmax(400px, 0.95fr)',
          },
          gap: 1.5,
          alignItems: 'start',
        }}
      >
        {/* AI FEEDBACK */}

        <Box sx={cardSx}>
          <Stack
            direction="row"
            spacing={0.7}
            alignItems="center"
          >
            <AutoAwesomeRoundedIcon
              sx={{
                color: '#7520e8',
              }}
            />

            <Typography
              sx={cardTitleSx}
            >
              AI Feedback & Insights
            </Typography>
          </Stack>

          <FeedbackSection
            title="Strengths"
            icon={
              <CheckCircleRoundedIcon />
            }
            items={strengths}
            background="#ecfbef"
            titleColor="#16782a"
            bulletColor="#16a72a"
          />

          <FeedbackSection
            title="Areas for Improvement"
            icon={
              <ReportProblemRoundedIcon />
            }
            items={improvementAreas}
            background="#fff0f2"
            titleColor="#b51f35"
            bulletColor="#e11f37"
          />

          <FeedbackSection
            title="AI Recommendations"
            icon={
              <LightbulbRoundedIcon />
            }
            items={recommendations}
            background="#f4edff"
            titleColor="#28216e"
            bulletColor="#5d20d8"
          />
        </Box>

        {/* QUESTIONS */}

        <Box
          id="question-wise-performance"
          sx={cardSx}
        >
          <Stack
            direction="row"
            spacing={0.7}
            alignItems="center"
          >
            <ListAltRoundedIcon
              sx={{
                color: '#701be7',
              }}
            />

            <Typography
              sx={cardTitleSx}
            >
              Question-wise Performance
            </Typography>
          </Stack>

          <Box
            sx={{
              mt: 1,
              overflowX: 'auto',
            }}
          >
            <Box
              sx={{
                minWidth: 500,
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns:
                    '55px minmax(220px, 1fr) 90px 75px',
                  gap: 0.5,
                  px: 0.8,
                  py: 0.6,
                  borderRadius: 1.5,
                  bgcolor: '#eeeaff',
                }}
              >
                <TableHeader>#</TableHeader>

                <TableHeader>
                  Question (Short Title)
                </TableHeader>

                <TableHeader>
                  Result
                </TableHeader>

                <TableHeader>
                  Score
                </TableHeader>
              </Box>

              {questionResults
                .slice(
                  0,
                  totalQuestions,
                )
                .map((question) => (
                  <Box
                    key={
                      question.number
                    }
                    sx={{
                      display: 'grid',
                      gridTemplateColumns:
                        '55px minmax(220px, 1fr) 90px 75px',
                      gap: 0.5,
                      alignItems: 'center',
                      px: 0.8,
                      py: 0.55,
                      borderBottom:
                        '1px solid #dfe5ef',
                    }}
                  >
                    <Typography
                      sx={tableTextSx}
                    >
                      Q{question.number}
                    </Typography>

                    <Typography
                      sx={tableTextSx}
                    >
                      {question.title}
                    </Typography>

                    <CheckCircleRoundedIcon
                      sx={{
                        color: '#19b52b',
                        fontSize: 20,
                      }}
                    />

                    <Typography
                      sx={{
                        ...tableTextSx,
                        color: '#147523',
                        fontWeight: 900,
                      }}
                    >
                      {question.score}%
                    </Typography>
                  </Box>
                ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* BOTTOM ACTIONS */}

      <Box
        sx={{
          mt: 1.5,
          mb: 2,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          spacing={1}
          sx={{
            width: {
              xs: '100%',
              lg: 'auto',
            },
          }}
        >
          <Button
            variant="outlined"
            startIcon={
              <DescriptionRoundedIcon />
            }
            onClick={
              handleDetailedAnalysis
            }
            sx={{
              minWidth: 230,
              minHeight: 48,
              borderRadius: 2.3,
              borderColor: '#6f1bea',
              color: '#5115cf',
              textTransform: 'none',
              fontWeight: 900,
            }}
          >
            View Detailed Analysis
          </Button>

          <Button
            variant="contained"
            endIcon={
              <ArrowForwardRoundedIcon />
            }
            onClick={
              handleCareerReadiness
            }
            sx={{
              minWidth: 285,
              minHeight: 48,
              borderRadius: 2.3,
              textTransform: 'none',
              fontWeight: 900,
              boxShadow: 'none',
              background:
                'linear-gradient(90deg, #7a17e8 0%, #4d1bdf 100%)',
            }}
          >
            Continue to Career Readiness
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

/* =========================================
   SCORE CIRCLE
========================================= */

const ScoreCircle = ({
  score,
}: {
  score: number;
}) => (
  <Box
    sx={{
      position: 'relative',
      width: 170,
      height: 170,
      mx: {
        xs: 'auto',
        sm: 0,
      },
    }}
  >
    <CircularProgress
      variant="determinate"
      value={100}
      size={170}
      thickness={5}
      sx={{
        position: 'absolute',
        color: '#e8edf3',
      }}
    />

    <CircularProgress
      variant="determinate"
      value={score}
      size={170}
      thickness={5}
      sx={{
        position: 'absolute',
        color: '#14bc22',
        '& .MuiCircularProgress-circle':
          {
            strokeLinecap: 'round',
          },
      }}
    />

    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
      }}
    >
      <Box>
        <Typography
          sx={{
            color: '#111a38',
            fontSize: '2.3rem',
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          {score}%
        </Typography>

        <Typography
          sx={{
            mt: 0.4,
            color: '#147b21',
            fontSize: '1.05rem',
            fontWeight: 900,
          }}
        >
          Good
        </Typography>
      </Box>
    </Box>
  </Box>
);

/* =========================================
   DETAILS
========================================= */

interface DetailRowProps {
  icon: ReactNode;
  label: string;
  value: string;
}

const DetailRow = ({
  icon,
  label,
  value,
}: DetailRowProps) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns:
        '22px 115px minmax(0, 1fr)',
      gap: 0.5,
      alignItems: 'center',
      py: 0.55,
    }}
  >
    <Box
      sx={{
        color: '#5b22df',
        display: 'grid',
        placeItems: 'center',
        '& svg': {
          fontSize: 17,
        },
      }}
    >
      {icon}
    </Box>

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
      }}
    >
      {value}
    </Typography>
  </Box>
);

/* =========================================
   PERFORMANCE
========================================= */

const PerformanceRow = ({
  item,
}: {
  item: PerformanceItem;
}) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs:
          '35px minmax(125px, 0.8fr) minmax(100px, 1fr) 45px',
        sm:
          '35px 170px minmax(140px, 1fr) 45px',
      },
      gap: 0.8,
      alignItems: 'center',
    }}
  >
    <Box
      sx={{
        width: 31,
        height: 31,
        borderRadius: 1.5,
        bgcolor: item.iconBackground,
        color: item.iconColor,
        display: 'grid',
        placeItems: 'center',
        '& svg': {
          fontSize: 18,
        },
      }}
    >
      {item.icon}
    </Box>

    <Typography
      sx={{
        color: '#17213b',
        fontSize: '0.7rem',
        fontWeight: 750,
      }}
    >
      {item.label}
    </Typography>

    <LinearProgress
      variant="determinate"
      value={item.score}
      sx={{
        height: 11,
        borderRadius: 10,
        bgcolor: '#dce2ed',
        '& .MuiLinearProgress-bar': {
          borderRadius: 10,
          bgcolor: item.barColor,
        },
      }}
    />

    <Typography
      sx={{
        color: '#111a38',
        fontSize: '0.75rem',
        fontWeight: 900,
        textAlign: 'right',
      }}
    >
      {item.score}%
    </Typography>
  </Box>
);

/* =========================================
   FEEDBACK
========================================= */

interface FeedbackSectionProps {
  title: string;
  icon: ReactNode;
  items: string[];
  background: string;
  titleColor: string;
  bulletColor: string;
}

const FeedbackSection = ({
  title,
  icon,
  items,
  background,
  titleColor,
  bulletColor,
}: FeedbackSectionProps) => (
  <Box
    sx={{
      mt: 1,
      p: 1.2,
      borderRadius: 2.3,
      bgcolor: background,
    }}
  >
    <Stack
      direction="row"
      spacing={0.6}
      alignItems="center"
    >
      <Box
        sx={{
          color: titleColor,
          display: 'grid',
          placeItems: 'center',
          '& svg': {
            fontSize: 21,
          },
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          color: titleColor,
          fontSize: '0.86rem',
          fontWeight: 900,
        }}
      >
        {title}
      </Typography>
    </Stack>

    <Stack
      spacing={0.35}
      sx={{
        mt: 0.6,
      }}
    >
      {items.map((item) => (
        <Stack
          key={item}
          direction="row"
          spacing={0.7}
          alignItems="flex-start"
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              mt: '7px',
              borderRadius: '50%',
              bgcolor: bulletColor,
              flexShrink: 0,
            }}
          />

          <Typography
            sx={{
              color: '#17213b',
              fontSize: '0.7rem',
              lineHeight: 1.4,
            }}
          >
            {item}
          </Typography>
        </Stack>
      ))}
    </Stack>
  </Box>
);

/* =========================================
   TABLE
========================================= */

const TableHeader = ({
  children,
}: {
  children: ReactNode;
}) => (
  <Typography
    sx={{
      color: '#17213b',
      fontSize: '0.65rem',
      fontWeight: 900,
    }}
  >
    {children}
  </Typography>
);

const tableTextSx = {
  color: '#17213b',
  fontSize: '0.66rem',
};

const cardTitleSx = {
  color: '#111a38',
  fontSize: '0.95rem',
  fontWeight: 900,
};

const cardSx = {
  border: '1px solid #dce3ee',
  borderRadius: 3,
  bgcolor: '#fff',
  p: {
    xs: 1.4,
    md: 1.6,
  },
  boxShadow:
    '0 4px 14px rgba(24,35,64,0.04)',
};