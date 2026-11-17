import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  LinearProgress,
  Radio,
  Stack,
  Typography,
} from '@mui/material';
import { type ReactNode, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type QuestionOption = {
  id: string;
  text: string;
};

type Question = {
  id: number;
  topic: string;
  difficulty: string;
  question: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
};

const questions: Question[] = [
  {
    id: 1,
    topic: 'React Fundamentals',
    difficulty: 'Intermediate',
    question:
      'What is the primary purpose of props in React?',
    options: [
      {
        id: 'A',
        text: 'To store local component state',
      },
      {
        id: 'B',
        text: 'To pass data from a parent component to a child component',
      },
      {
        id: 'C',
        text: 'To directly update the DOM',
      },
      {
        id: 'D',
        text: 'To replace React hooks',
      },
    ],
    correctOptionId: 'B',
    explanation:
      'Props are used to pass data and configuration from a parent component to a child component.',
  },
  {
    id: 2,
    topic: 'React Fundamentals',
    difficulty: 'Intermediate',
    question:
      'Which React hook is commonly used to manage local component state?',
    options: [
      {
        id: 'A',
        text: 'useEffect',
      },
      {
        id: 'B',
        text: 'useContext',
      },
      {
        id: 'C',
        text: 'useState',
      },
      {
        id: 'D',
        text: 'useMemo',
      },
    ],
    correctOptionId: 'C',
    explanation:
      'useState provides a state value and a setter function for managing local component state.',
  },
  {
    id: 3,
    topic: 'React Hooks',
    difficulty: 'Intermediate',
    question:
      'What is the main purpose of the useMemo hook?',
    options: [
      {
        id: 'A',
        text: 'To navigate between pages',
      },
      {
        id: 'B',
        text: 'To memoize a calculated value',
      },
      {
        id: 'C',
        text: 'To make an API public',
      },
      {
        id: 'D',
        text: 'To create CSS styles',
      },
    ],
    correctOptionId: 'B',
    explanation:
      'useMemo can memoize an expensive calculated value and recompute it when its dependencies change.',
  },
  {
    id: 4,
    topic: 'React Hooks',
    difficulty: 'Intermediate',
    question:
      'Which hook is designed for running side effects in a React component?',
    options: [
      {
        id: 'A',
        text: 'useState',
      },
      {
        id: 'B',
        text: 'useEffect',
      },
      {
        id: 'C',
        text: 'useRef only',
      },
      {
        id: 'D',
        text: 'useReducer only',
      },
    ],
    correctOptionId: 'B',
    explanation:
      'useEffect is designed for side effects such as data fetching, subscriptions and synchronization with external systems.',
  },
  {
    id: 5,
    topic: 'React Hooks',
    difficulty: 'Intermediate',
    question:
      'What is the correct way to run a side effect once when a component mounts in React?',
    options: [
      {
        id: 'A',
        text: 'useEffect(() => { ... });',
      },
      {
        id: 'B',
        text: 'useEffect(() => { ... }, []);',
      },
      {
        id: 'C',
        text: 'useEffect(() => { ... }, [state]);',
      },
      {
        id: 'D',
        text: 'useEffect(() => { ... }, [props, state]);',
      },
    ],
    correctOptionId: 'B',
    explanation:
      'Using an empty dependency array with useEffect runs the effect after the initial mount. In development Strict Mode, React may run an extra setup/cleanup cycle to help detect bugs.',
  },
  {
    id: 6,
    topic: 'State Management',
    difficulty: 'Intermediate',
    question:
      'When is React Context most useful?',
    options: [
      {
        id: 'A',
        text: 'When sharing values across multiple components without passing props through every level',
      },
      {
        id: 'B',
        text: 'Only when writing CSS',
      },
      {
        id: 'C',
        text: 'Only for database queries',
      },
      {
        id: 'D',
        text: 'To replace every component prop',
      },
    ],
    correctOptionId: 'A',
    explanation:
      'Context is useful when data needs to be available to multiple components without manually passing it through every intermediate component.',
  },
  {
    id: 7,
    topic: 'Routing',
    difficulty: 'Intermediate',
    question:
      'What is client-side routing used for in a React application?',
    options: [
      {
        id: 'A',
        text: 'To change application views without requiring a full page reload for each navigation',
      },
      {
        id: 'B',
        text: 'To compile C# code',
      },
      {
        id: 'C',
        text: 'To create SQL indexes',
      },
      {
        id: 'D',
        text: 'To replace an API',
      },
    ],
    correctOptionId: 'A',
    explanation:
      'Client-side routing maps URLs to application views while allowing a single-page application to navigate without traditional full page reloads.',
  },
  {
    id: 8,
    topic: 'Working with APIs',
    difficulty: 'Intermediate',
    question:
      'What should a React UI normally do when an API request is still in progress?',
    options: [
      {
        id: 'A',
        text: 'Always show an error',
      },
      {
        id: 'B',
        text: 'Provide an appropriate loading state',
      },
      {
        id: 'C',
        text: 'Reload the browser continuously',
      },
      {
        id: 'D',
        text: 'Delete existing data',
      },
    ],
    correctOptionId: 'B',
    explanation:
      'A clear loading state helps users understand that the request is still being processed.',
  },
  {
    id: 9,
    topic: 'Best Practices',
    difficulty: 'Intermediate',
    question:
      'Why are stable keys important when rendering React lists?',
    options: [
      {
        id: 'A',
        text: 'They help React identify which items changed, were added or were removed',
      },
      {
        id: 'B',
        text: 'They automatically secure API requests',
      },
      {
        id: 'C',
        text: 'They replace component state',
      },
      {
        id: 'D',
        text: 'They create database primary keys',
      },
    ],
    correctOptionId: 'A',
    explanation:
      'Stable keys help React correctly match list items between renders and update the UI efficiently.',
  },
  {
    id: 10,
    topic: 'Best Practices',
    difficulty: 'Intermediate',
    question:
      'What is one benefit of splitting a large React UI into reusable components?',
    options: [
      {
        id: 'A',
        text: 'It can improve maintainability and reuse',
      },
      {
        id: 'B',
        text: 'It removes the need for JavaScript',
      },
      {
        id: 'C',
        text: 'It automatically creates backend APIs',
      },
      {
        id: 'D',
        text: 'It guarantees zero bugs',
      },
    ],
    correctOptionId: 'A',
    explanation:
      'Reusable components can make a UI easier to maintain, test and reuse across different parts of an application.',
  },
];

/*
 * The final backend assessment can contain 20 questions.
 * For this frontend screen we repeat the sample question
 * structure to provide a complete 20-question UI flow.
 *
 * TODO BACKEND:
 * Replace this with the assessment-attempt/question API.
 */
const assessmentQuestions: Question[] = Array.from(
  { length: 20 },
  (_, index): Question => {
    const source =
      questions[index % questions.length];

    if (!source) {
      throw new Error(
        'Assessment question configuration is missing.',
      );
    }

    return {
      ...source,
      id: index + 1,
    };
  },
);

const Panel = ({
  children,
}: {
  children: ReactNode;
}) => (
  <Box
    sx={{
      bgcolor: '#fff',
      border: '1px solid #e2e7ef',
      borderRadius: 3,
      p: {
        xs: 2,
        md: 2.4,
      },
      boxShadow:
        '0 4px 16px rgba(15, 23, 42, 0.035)',
    }}
  >
    {children}
  </Box>
);

const DetailRow = ({
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
      py: 1.15,
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
        color: '#563cf0',
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
          fontSize: '0.95rem',
        }}
      >
        {value}
      </Typography>
    </Box>
  </Stack>
);

export const SkillPathAssessmentQuestionsPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [currentIndex, setCurrentIndex] =
    useState(4);

  const [answers, setAnswers] = useState<
    Record<number, string>
  >({
    1: 'B',
    2: 'C',
    3: 'B',
    4: 'B',
    5: 'B',
  });

  const [reviewQuestions, setReviewQuestions] =
    useState<number[]>([]);

  const currentQuestion =
  assessmentQuestions[currentIndex];

if (!currentQuestion) {
  return (
    <Box
      sx={{
        p: 4,
        textAlign: 'center',
      }}
    >
      <Typography
        sx={{
          fontWeight: 800,
          color: '#172033',
        }}
      >
        Assessment question could not be loaded.
      </Typography>
    </Box>
  );
}

  const totalQuestions =
    assessmentQuestions.length;

  const answeredCount = Object.keys(
    answers,
  ).length;

  const progress =
    (answeredCount / totalQuestions) * 100;

  const selectedAnswer =
    answers[currentQuestion.id];

  const answerIsCorrect =
    selectedAnswer ===
    currentQuestion.correctOptionId;

  const isMarkedForReview =
    reviewQuestions.includes(
      currentQuestion.id,
    );

  const navigateToScreen = (
    screen: string,
  ) => {
    const params =
      new URLSearchParams(searchParams);

    params.set('type', 'skill');
    params.set('screen', screen);

    setSearchParams(params);
  };

  const handleBack = () => {
    navigateToScreen('skill-assessment');
  };

  const handleSelectAnswer = (
    optionId: string,
  ) => {
    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleReviewChange = () => {
    setReviewQuestions((current) => {
      if (
        current.includes(currentQuestion.id)
      ) {
        return current.filter(
          (id) => id !== currentQuestion.id,
        );
      }

      return [
        ...current,
        currentQuestion.id,
      ];
    });
  };

  const handlePreviousQuestion = () => {
    setCurrentIndex((current) =>
      Math.max(0, current - 1),
    );
  };

  const handleNextQuestion = () => {
    if (
      currentIndex <
      totalQuestions - 1
    ) {
      setCurrentIndex(
        (current) => current + 1,
      );
      return;
    }

    /*
     * TODO BACKEND:
     * Submit the real assessment attempt before
     * opening S5.
     */
    navigateToScreen(
      'skill-assessment-results',
    );
  };

  const answeredPercentage =
    Math.round(progress);

  const unansweredCount =
    totalQuestions - answeredCount;

  const explanation = useMemo(() => {
    if (!selectedAnswer) {
      return null;
    }

    if (answerIsCorrect) {
      return {
        title: 'Why this is correct?',
        text: currentQuestion.explanation,
        success: true,
      };
    }

    return {
      title: 'Review this concept',
      text: currentQuestion.explanation,
      success: false,
    };
  }, [
    answerIsCorrect,
    currentQuestion.explanation,
    selectedAnswer,
  ]);

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
        onClick={handleBack}
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
        Back to Skill Assessment
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
            width: 320,
            height: 320,
            right: -100,
            top: -180,
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

          <Box>
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
              React Skill Assessment
            </Typography>

            <Typography
              sx={{
                mt: 0.6,
                color:
                  'rgba(255,255,255,0.88)',
                fontSize: {
                  xs: '0.88rem',
                  md: '0.98rem',
                },
              }}
            >
              Answer the questions to evaluate
              your React knowledge and practical
              skills.
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
            lg: 'minmax(0, 2.15fr) minmax(280px, 0.8fr)',
          },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {/* Question */}
        <Panel>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <ScheduleRoundedIcon
                sx={{
                  color: '#5138e8',
                }}
              />

              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 900,
                  fontSize: {
                    xs: '1rem',
                    md: '1.1rem',
                  },
                }}
              >
                Question {currentIndex + 1}{' '}
                of {totalQuestions}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={0.5}
            >
              <Button
                aria-label="Previous question"
                disabled={
                  currentIndex === 0
                }
                onClick={
                  handlePreviousQuestion
                }
                sx={{
                  minWidth: 38,
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  bgcolor: '#f4f1ff',
                }}
              >
                <ArrowBackRoundedIcon />
              </Button>

              <Button
                aria-label="Next question"
                onClick={
                  handleNextQuestion
                }
                sx={{
                  minWidth: 38,
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  bgcolor: '#f4f1ff',
                }}
              >
                <ArrowForwardRoundedIcon />
              </Button>
            </Stack>
          </Stack>

          <Stack
            direction="row"
            spacing={1.2}
            alignItems="center"
            sx={{ mt: 1.5 }}
          >
            <LinearProgress
              variant="determinate"
              value={
                ((currentIndex + 1) /
                  totalQuestions) *
                100
              }
              sx={{
                flex: 1,
                height: 9,
                borderRadius: 99,
                bgcolor: '#e5e5f4',
                '& .MuiLinearProgress-bar':
                  {
                    borderRadius: 99,
                    background:
                      'linear-gradient(90deg, #7c3aed, #4f46e5)',
                  },
              }}
            />

            <Typography
              sx={{
                minWidth: 90,
                textAlign: 'right',
                color: '#172033',
                fontWeight: 800,
                fontSize: '0.76rem',
              }}
            >
              {Math.round(
                ((currentIndex + 1) /
                  totalQuestions) *
                  100,
              )}
              % Complete
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            sx={{ mt: 2 }}
          >
            <Chip
              label={currentQuestion.topic}
              size="small"
              icon={
                <AssessmentRoundedIcon />
              }
              sx={{
                bgcolor: '#f0edff',
                color: '#4338ca',
                fontWeight: 800,
              }}
            />

            <Chip
              label={
                currentQuestion.difficulty
              }
              size="small"
              icon={<BarChartRoundedIcon />}
              sx={{
                bgcolor: '#e8f7ff',
                color: '#315b85',
                fontWeight: 800,
              }}
            />
          </Stack>

          <Typography
            sx={{
              mt: 2.5,
              color: '#111827',
              fontWeight: 900,
              fontSize: {
                xs: '1.05rem',
                md: '1.25rem',
              },
              lineHeight: 1.45,
            }}
          >
            {currentQuestion.question}
          </Typography>

          <Stack
            spacing={1.15}
            sx={{ mt: 2 }}
          >
            {currentQuestion.options.map(
              (option) => {
                const selected =
                  selectedAnswer ===
                  option.id;

                return (
                  <Box
                    key={option.id}
                    onClick={() =>
                      handleSelectAnswer(
                        option.id,
                      )
                    }
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 2.3,
                      border: selected
                        ? '1.8px solid #6236f2'
                        : '1px solid #dfe4ec',
                      bgcolor: selected
                        ? '#f7f5ff'
                        : '#fff',
                      px: {
                        xs: 1.2,
                        sm: 1.5,
                      },
                      py: 1.15,
                      transition:
                        'all 150ms ease',
                      '&:hover': {
                        borderColor:
                          '#7b61f2',
                      },
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
                          handleSelectAnswer(
                            option.id,
                          )
                        }
                        size="small"
                      />

                      <Typography
                        sx={{
                          color: '#172033',
                          fontWeight: 750,
                          fontSize: '0.9rem',
                          lineHeight: 1.45,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            mr: 1,
                            fontWeight: 900,
                          }}
                        >
                          {option.id}.
                        </Box>

                        {option.text}
                      </Typography>
                    </Stack>
                  </Box>
                );
              },
            )}
          </Stack>

          {explanation && (
            <Box
              sx={{
                mt: 2,
                p: 1.7,
                borderRadius: 2.5,
                bgcolor: explanation.success
                  ? '#f4f0ff'
                  : '#fff8ed',
                border: explanation.success
                  ? '1px solid #e4dcff'
                  : '1px solid #fed7aa',
              }}
            >
              <Stack
                direction="row"
                spacing={1.2}
                alignItems="flex-start"
              >
                <CheckCircleRoundedIcon
                  sx={{
                    mt: '2px',
                    color: explanation.success
                      ? '#5b3df5'
                      : '#d97706',
                    flexShrink: 0,
                  }}
                />

                <Box>
                  <Typography
                    sx={{
                      color: '#172033',
                      fontWeight: 850,
                      fontSize: '0.86rem',
                    }}
                  >
                    {explanation.title}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.4,
                      color: '#344054',
                      fontSize: '0.8rem',
                      lineHeight: 1.55,
                    }}
                  >
                    {explanation.text}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          <Box sx={{ mt: 1.5 }}>
            <Stack
              direction="row"
              alignItems="center"
            >
              <Checkbox
                checked={isMarkedForReview}
                onChange={
                  handleReviewChange
                }
                size="small"
              />

              <Typography
                sx={{
                  color: '#344054',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                Mark for Review
              </Typography>
            </Stack>
          </Box>
        </Panel>

        {/* Right side */}
        <Stack spacing={2}>
          <Panel>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <AssessmentRoundedIcon
                sx={{
                  color: '#5138e8',
                }}
              />

              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 900,
                  fontSize: '1.02rem',
                }}
              >
                Assessment Progress
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
                    #0aa47a 0% ${answeredPercentage}%,
                    #e3e7ed ${answeredPercentage}% 100%
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
                  color: '#0a9b75',
                  fontWeight: 900,
                  fontSize: '1.4rem',
                }}
              >
                {answeredPercentage}%
              </Typography>
            </Box>

            <Typography
              sx={{
                mt: 1.2,
                textAlign: 'center',
                color: '#172033',
                fontWeight: 850,
                fontSize: '0.85rem',
              }}
            >
              {answeredCount} of{' '}
              {totalQuestions} Questions
            </Typography>

            <Stack
              spacing={1}
              sx={{ mt: 2 }}
            >
              <ProgressRow
                icon={
                  <CheckCircleRoundedIcon />
                }
                label="Answered"
                value={String(answeredCount)}
                color="#0aa47a"
              />

              <ProgressRow
                icon={
                  <HelpOutlineRoundedIcon />
                }
                label="Not Answered"
                value={String(
                  unansweredCount,
                )}
                color="#7b8798"
              />

              <ProgressRow
                icon={
                  <BookmarkBorderRoundedIcon />
                }
                label="Marked for Review"
                value={String(
                  reviewQuestions.length,
                )}
                color="#563cf0"
              />
            </Stack>
          </Panel>

          <Panel>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <FlagRoundedIcon
                sx={{
                  color: '#5138e8',
                }}
              />

              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 900,
                  fontSize: '1.02rem',
                }}
              >
                Assessment Details
              </Typography>
            </Stack>

            <Stack
              sx={{ mt: 1 }}
              divider={
                <Box
                  sx={{
                    height: '1px',
                    bgcolor: '#edf0f4',
                  }}
                />
              }
            >
              <DetailRow
                icon={
                  <ScheduleRoundedIcon />
                }
                label="Time Remaining"
                value="24:36"
              />

              <DetailRow
                icon={
                  <HelpOutlineRoundedIcon />
                }
                label="Total Questions"
                value={String(
                  totalQuestions,
                )}
              />

              <DetailRow
                icon={
                  <BarChartRoundedIcon />
                }
                label="Difficulty Level"
                value="Intermediate"
              />
            </Stack>
          </Panel>
        </Stack>
      </Box>

      {/* Navigation */}
      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{
          mt: 2.5,
        }}
      >
        <Button
          variant="outlined"
          startIcon={
            <ArrowBackRoundedIcon />
          }
          disabled={currentIndex === 0}
          onClick={handlePreviousQuestion}
          sx={{
            minHeight: 48,
            minWidth: {
              xs: '100%',
              sm: 190,
            },
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
          onClick={handleNextQuestion}
          sx={{
            minHeight: 50,
            minWidth: {
              xs: '100%',
              sm: 260,
            },
            borderRadius: 2.2,
            textTransform: 'none',
            fontWeight: 850,
            boxShadow: 'none',
            background:
              'linear-gradient(90deg, #6134f3, #5138e8)',
          }}
        >
          {currentIndex ===
          totalQuestions - 1
            ? 'Submit Assessment'
            : 'Next Question'}
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
        Questions, timer and answers on this
        screen are temporary frontend data.
        Assessment attempts will be connected to
        the Skill Path backend later.
      </Typography>
    </Box>
  );
};

const ProgressRow = ({
  icon,
  label,
  value,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  color: string;
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
          display: 'grid',
          placeItems: 'center',
          color,
          '& svg': {
            fontSize: 19,
          },
        }}
      >
        {icon}
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
        fontSize: '0.8rem',
      }}
    >
      {value}
    </Typography>
  </Stack>
);