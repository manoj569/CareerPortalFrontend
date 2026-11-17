import { useMemo, useState } from 'react';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';

import {
  Box,
  Button,
  LinearProgress,
  Radio,
  Stack,
  Typography,
} from '@mui/material';

import { useSearchParams } from 'react-router-dom';

type QuestionStatus =
  | 'answered'
  | 'current'
  | 'unanswered'
  | 'marked';

interface AssessmentQuestion {
  id: number;
  category: string;
  difficulty: string;
  question: string;
  options: string[];
}

/*
 * UI DEMO DATA ONLY.
 *
 * This is temporary frontend content so we can complete
 * and approve the Assessment Questions screen.
 *
 * During backend integration this entire question object,
 * question count, answers, timer/attempt state and navigation
 * will come from the existing Accelerator assessment APIs.
 */
const demoQuestions: AssessmentQuestion[] = [
  {
    id: 1,
    category: 'Programming',
    difficulty: 'Medium',
    question:
      'Which data structure is most suitable for implementing a first-in, first-out (FIFO) order?',
    options: [
      'Stack',
      'Queue',
      'Linked List',
      'Binary Tree',
    ],
  },
  {
    id: 2,
    category: 'Backend & APIs',
    difficulty: 'Medium',
    question:
      'Which HTTP method is normally used when partially updating an existing resource?',
    options: [
      'GET',
      'POST',
      'PATCH',
      'DELETE',
    ],
  },
  {
    id: 3,
    category: 'Database',
    difficulty: 'Medium',
    question:
      'Which database concept helps reduce unnecessary duplication of data?',
    options: [
      'Normalization',
      'Replication',
      'Caching',
      'Partitioning',
    ],
  },
  {
    id: 4,
    category: 'System Design',
    difficulty: 'Medium',
    question:
      'Which component is commonly used to distribute incoming requests across multiple application servers?',
    options: [
      'Load Balancer',
      'Compiler',
      'Message Serializer',
      'Database Trigger',
    ],
  },
  {
    id: 5,
    category: 'Problem Solving',
    difficulty: 'Medium',
    question:
      'What is the first step when investigating an unexpected production issue?',
    options: [
      'Delete the logs',
      'Reproduce and gather evidence',
      'Rewrite the entire service',
      'Restart every server immediately',
    ],
  },
];

const stepItems = [
  'Goal',
  'Assessment',
  'Roadmap',
  'Build',
  'Apply',
];

export const AssessmentQuestionsPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answers, setAnswers] =
    useState<Record<number, number>>({});

  const [markedQuestions, setMarkedQuestions] =
    useState<number[]>([]);

  const currentQuestion =
  demoQuestions[currentIndex];

if (!currentQuestion) {
  return (
    <Box
      sx={{
        minHeight: 400,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Stack
        spacing={1}
        alignItems="center"
      >
        <Typography
          sx={{
            color: '#17213b',
            fontWeight: 800,
            fontSize: '1rem',
          }}
        >
          Assessment question unavailable
        </Typography>

        <Typography
          sx={{
            color: '#69758b',
            fontSize: '0.82rem',
          }}
        >
          We could not load this assessment question.
        </Typography>

        <Button
          variant="outlined"
          onClick={() => {
            const params =
              new URLSearchParams(
                searchParams,
              );

            params.set(
              'screen',
              'assessment',
            );

            setSearchParams(params);
          }}
        >
          Back to Assessment
        </Button>
      </Stack>
    </Box>
  );
}

  const totalQuestions =
    demoQuestions.length;

  const answeredCount =
    Object.keys(answers).length;

  const progressPercent =
    totalQuestions > 0
      ? Math.round(
          (answeredCount /
            totalQuestions) *
            100,
        )
      : 0;

  const currentAnswer =
    answers[currentQuestion.id];

  const isMarked =
    markedQuestions.includes(
      currentQuestion.id,
    );

  const handleBack = () => {
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

  const handleSelectAnswer = (
    optionIndex: number,
  ) => {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]:
        optionIndex,
    }));
  };

  const handleMarkForReview = () => {
    setMarkedQuestions(
      (previous) => {
        if (
          previous.includes(
            currentQuestion.id,
          )
        ) {
          return previous.filter(
            (id) =>
              id !==
              currentQuestion.id,
          );
        }

        return [
          ...previous,
          currentQuestion.id,
        ];
      },
    );
  };

  const handlePrevious = () => {
    setCurrentIndex(
      (previous) =>
        Math.max(0, previous - 1),
    );
  };

  const handleNext = () => {
    if (
      currentIndex <
      totalQuestions - 1
    ) {
      setCurrentIndex(
        (previous) =>
          previous + 1,
      );

      return;
    }

    /*
     * UI-only transition.
     * C5 will be the Assessment Results / Skill Gap screen.
     */
    const params =
      new URLSearchParams(
        searchParams,
      );

    params.set(
      'screen',
      'assessment-results',
    );

    setSearchParams(params);
  };

  const handleQuestionNavigation = (
    index: number,
  ) => {
    setCurrentIndex(index);
  };

  const getQuestionStatus = (
    question: AssessmentQuestion,
    index: number,
  ): QuestionStatus => {
    if (
      index === currentIndex
    ) {
      return 'current';
    }

    if (
      markedQuestions.includes(
        question.id,
      )
    ) {
      return 'marked';
    }

    if (
      answers[question.id] !==
      undefined
    ) {
      return 'answered';
    }

    return 'unanswered';
  };

  const questionNumber =
    currentIndex + 1;

  const questionProgress =
    Math.round(
      (questionNumber /
        totalQuestions) *
        100,
    );

  const optionLetters =
    useMemo(
      () => [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
      ],
      [],
    );

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
      {/* ============================================
          HERO
      ============================================= */}

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

              letterSpacing:
                '-0.03em',
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
          Your personalized,
          AI-powered journey from
          your current skills to your
          next dream role.
        </Typography>
      </Box>

      {/* ============================================
          PAGE HEADER + STEPPER
      ============================================= */}

      <Box
        sx={{
          mt: 2,

          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',
            lg:
              'minmax(0, 1fr) 420px',
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
                bgcolor:
                  'transparent',

                color: '#0b57d0',
              },
            }}
          >
            Back to Assessment
            Overview
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

              letterSpacing:
                '-0.03em',
            }}
          >
            AI Skill Assessment
          </Typography>

          <Typography
            sx={{
              mt: 0.3,

              color: '#5f6c82',

              fontSize: '0.9rem',
            }}
          >
            Assess your skills for
            your selected career path.
            Answer based on your
            current knowledge.
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
              (
                step,
                index,
              ) => {
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
                        stepItems.length -
                          1
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

                          fontWeight:
                            800,

                          flexShrink: 0,
                        }}
                      >
                        {completed ? (
                          <CheckRoundedIcon
                            sx={{
                              fontSize:
                                17,
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

      {/* ============================================
          QUESTION + SIDEBAR
      ============================================= */}

      <Box
        sx={{
          mt: 2.5,

          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',
            xl:
              'minmax(0, 1fr) 350px',
          },

          gap: 2,
        }}
      >
        {/* QUESTION CARD */}

        <Box
          sx={{
            border:
              '1px solid #e0e6ef',

            borderRadius: 3,

            bgcolor: '#fff',

            overflow: 'hidden',
          }}
        >
          {/* QUESTION PROGRESS */}

          <Box
            sx={{
              p: {
                xs: 1.8,
                md: 2.5,
              },

              borderBottom:
                '1px solid #edf0f5',
            }}
          >
            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              justifyContent="space-between"
              alignItems={{
                xs: 'stretch',
                sm: 'center',
              }}
              spacing={1.5}
            >
              <Typography
                sx={{
                  color: '#111a38',

                  fontSize: '1rem',

                  fontWeight: 800,
                }}
              >
                Question{' '}
                {questionNumber} of{' '}
                {totalQuestions}
              </Typography>

              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                justifyContent={{
                  xs: 'space-between',
                  sm: 'flex-end',
                }}
              >
                <Typography
                  sx={{
                    color: '#17213b',

                    fontSize:
                      '0.82rem',

                    fontWeight: 700,
                  }}
                >
                  {questionProgress}%
                  Complete
                </Typography>

                <Stack
                  direction="row"
                  spacing={0.7}
                  alignItems="center"
                  sx={{
                    px: 1.4,
                    py: 0.8,

                    borderRadius: 2,

                    bgcolor:
                      '#edf4ff',

                    color:
                      '#123d9c',
                  }}
                >
                  <TimerOutlinedIcon
                    sx={{
                      fontSize: 21,
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize:
                        '0.9rem',

                      fontWeight: 800,
                    }}
                  >
                    --:--
                  </Typography>
                </Stack>
              </Stack>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={questionProgress}
              sx={{
                mt: 1.4,

                height: 8,

                borderRadius: 6,

                bgcolor: '#e5eaf2',

                '& .MuiLinearProgress-bar':
                  {
                    borderRadius: 6,
                  },
              }}
            />
          </Box>

          {/* QUESTION BODY */}

          <Box
            sx={{
              p: {
                xs: 1.8,
                md: 2.5,
              },

              minHeight: 390,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
            >
              <Box
                sx={{
                  display: 'flex',

                  alignItems:
                    'center',

                  gap: 0.7,

                  px: 1.2,
                  py: 0.55,

                  borderRadius: 5,

                  bgcolor:
                    '#f1edff',

                  color:
                    '#5635d5',

                  fontSize:
                    '0.76rem',

                  fontWeight: 800,
                }}
              >
                <CodeRoundedIcon
                  sx={{
                    fontSize: 18,
                  }}
                />

                {
                  currentQuestion.category
                }
              </Box>

              <Box
                sx={{
                  px: 1.2,
                  py: 0.55,

                  borderRadius: 5,

                  bgcolor:
                    '#fff4dd',

                  color:
                    '#b66a00',

                  fontSize:
                    '0.76rem',

                  fontWeight: 800,
                }}
              >
                {
                  currentQuestion.difficulty
                }
              </Box>
            </Stack>

            <Typography
              sx={{
                mt: 2,

                maxWidth: 850,

                color: '#111a38',

                fontSize: {
                  xs: '1.05rem',
                  md: '1.25rem',
                },

                lineHeight: 1.45,

                fontWeight: 800,
              }}
            >
              {
                currentQuestion.question
              }
            </Typography>

            {/* ANSWERS */}

            <Stack
              spacing={1.15}
              sx={{
                mt: 2.3,
              }}
            >
              {currentQuestion.options.map(
                (
                  option,
                  optionIndex,
                ) => {
                  const selected =
                    currentAnswer ===
                    optionIndex;

                  return (
                    <Box
                      key={option}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        handleSelectAnswer(
                          optionIndex,
                        )
                      }
                      onKeyDown={(
                        event,
                      ) => {
                        if (
                          event.key ===
                            'Enter' ||
                          event.key ===
                            ' '
                        ) {
                          handleSelectAnswer(
                            optionIndex,
                          );
                        }
                      }}
                      sx={{
                        minHeight: 54,

                        px: 1.5,

                        border:
                          selected
                            ? '1.5px solid #1677ff'
                            : '1px solid #ccd5e2',

                        borderRadius:
                          2.2,

                        bgcolor:
                          selected
                            ? '#f3f8ff'
                            : '#fff',

                        display:
                          'flex',

                        alignItems:
                          'center',

                        cursor:
                          'pointer',

                        transition:
                          '0.15s ease',

                        '&:hover': {
                          borderColor:
                            '#6ba8ff',

                          bgcolor:
                            '#f8fbff',
                        },
                      }}
                    >
                      <Radio
                        checked={
                          selected
                        }
                        size="small"
                        sx={{
                          p: 0,
                          mr: 1.3,
                        }}
                      />

                      <Typography
                        sx={{
                          color:
                            '#17213b',

                          fontSize:
                            '0.9rem',

                          fontWeight:
                            selected
                              ? 800
                              : 650,
                        }}
                      >
                        {
                          optionLetters[
                            optionIndex
                          ]
                        }
                        . {option}
                      </Typography>
                    </Box>
                  );
                },
              )}
            </Stack>
          </Box>

          {/* FOOTER ACTIONS */}

          <Box
            sx={{
              p: {
                xs: 1.5,
                md: 2,
              },

              borderTop:
                '1px solid #edf0f5',

              display: 'flex',

              flexDirection: {
                xs: 'column',
                md: 'row',
              },

              justifyContent:
                'space-between',

              gap: 1.2,
            }}
          >
            <Button
              variant="outlined"
              startIcon={
                isMarked ? (
                  <BookmarkRoundedIcon />
                ) : (
                  <BookmarkBorderRoundedIcon />
                )
              }
              onClick={
                handleMarkForReview
              }
              sx={{
                minHeight: 44,

                borderRadius: 2,

                textTransform: 'none',

                fontWeight: 700,
              }}
            >
              {isMarked
                ? 'Marked for Review'
                : 'Mark for Review'}
            </Button>

            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={1}
            >
              <Button
                variant="outlined"
                startIcon={
                  <ArrowBackRoundedIcon />
                }
                onClick={
                  handlePrevious
                }
                disabled={
                  currentIndex === 0
                }
                sx={{
                  minWidth: 140,
                  minHeight: 44,

                  borderRadius: 2,

                  textTransform:
                    'none',

                  fontWeight: 700,
                }}
              >
                Previous
              </Button>

              <Button
                variant="contained"
                endIcon={
                  <ArrowForwardRoundedIcon />
                }
                onClick={handleNext}
                sx={{
                  minWidth: 180,
                  minHeight: 44,

                  borderRadius: 2,

                  textTransform:
                    'none',

                  fontWeight: 800,

                  boxShadow: 'none',
                }}
              >
                {currentIndex ===
                totalQuestions - 1
                  ? 'Finish Assessment'
                  : 'Next Question'}
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* ============================================
            RIGHT SIDEBAR
        ============================================= */}

        <Stack
          spacing={1.6}
          sx={{
            alignSelf: 'start',
          }}
        >
          {/* ASSESSMENT PROGRESS */}

          <Box
            sx={{
              p: 2,

              border:
                '1px solid #e0e6ef',

              borderRadius: 3,

              bgcolor: '#fff',
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <TimerOutlinedIcon
                sx={{
                  color: '#1269e8',
                }}
              />

              <Typography
                sx={{
                  color: '#111a38',

                  fontSize: '1rem',

                  fontWeight: 800,
                }}
              >
                Assessment Progress
              </Typography>
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                mt: 2,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    color: '#111a38',

                    fontSize: '1.3rem',

                    fontWeight: 800,
                  }}
                >
                  {answeredCount} /{' '}
                  {totalQuestions}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.2,

                    color: '#5f6c82',

                    fontSize:
                      '0.78rem',
                  }}
                >
                  Questions Answered
                </Typography>
              </Box>

              <Box
                sx={{
                  px: 1.4,
                  py: 1,

                  borderRadius: 2,

                  bgcolor:
                    '#edf4ff',

                  color: '#1269e8',

                  fontSize: '1rem',

                  fontWeight: 800,
                }}
              >
                {progressPercent}%
              </Box>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={progressPercent}
              sx={{
                mt: 1.5,

                height: 8,

                borderRadius: 6,

                bgcolor: '#e5eaf2',

                '& .MuiLinearProgress-bar':
                  {
                    borderRadius: 6,
                  },
              }}
            />
          </Box>

          {/* QUESTION NAVIGATOR */}

          <Box
            sx={{
              p: 2,

              border:
                '1px solid #e0e6ef',

              borderRadius: 3,

              bgcolor: '#fff',
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <HelpOutlineRoundedIcon
                sx={{
                  color: '#1269e8',
                }}
              />

              <Typography
                sx={{
                  color: '#111a38',

                  fontSize: '1rem',

                  fontWeight: 800,
                }}
              >
                Question Navigator
              </Typography>
            </Stack>

            {/* LEGEND */}

            <Stack
              direction="row"
              spacing={1.3}
              useFlexGap
              flexWrap="wrap"
              sx={{
                mt: 1.6,
              }}
            >
              <NavigatorLegend
                color="#22a447"
                label="Answered"
              />

              <NavigatorLegend
                color="#1677ff"
                label="Current"
              />

              <NavigatorLegend
                color="#dfe5ee"
                label="Not Answered"
              />

              <NavigatorLegend
                color="#7c3aed"
                label="Marked"
              />
            </Stack>

            {/* NUMBER GRID */}

            <Box
              sx={{
                mt: 1.8,

                display: 'grid',

                gridTemplateColumns:
                  'repeat(5, minmax(0, 1fr))',

                gap: 1,
              }}
            >
              {demoQuestions.map(
                (
                  question,
                  index,
                ) => {
                  const status =
                    getQuestionStatus(
                      question,
                      index,
                    );

                  return (
                    <QuestionNavigatorButton
                      key={
                        question.id
                      }
                      number={
                        index + 1
                      }
                      status={status}
                      onClick={() =>
                        handleQuestionNavigation(
                          index,
                        )
                      }
                    />
                  );
                },
              )}
            </Box>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

interface NavigatorLegendProps {
  color: string;
  label: string;
}

const NavigatorLegend = ({
  color,
  label,
}: NavigatorLegendProps) => (
  <Stack
    direction="row"
    spacing={0.6}
    alignItems="center"
  >
    <Box
      sx={{
        width: 11,
        height: 11,

        borderRadius: 0.8,

        bgcolor: color,
      }}
    />

    <Typography
      sx={{
        color: '#58657a',

        fontSize: '0.68rem',

        fontWeight: 650,
      }}
    >
      {label}
    </Typography>
  </Stack>
);

interface QuestionNavigatorButtonProps {
  number: number;
  status: QuestionStatus;
  onClick: () => void;
}

const QuestionNavigatorButton = ({
  number,
  status,
  onClick,
}: QuestionNavigatorButtonProps) => {
  const styles = {
    answered: {
      background: '#e9f9ef',
      border: '#bdeccc',
      color: '#14853a',
    },

    current: {
      background: '#f2f7ff',
      border: '#1677ff',
      color: '#1269e8',
    },

    unanswered: {
      background: '#f7f8fa',
      border: '#dfe5ee',
      color: '#344054',
    },

    marked: {
      background: '#f3edff',
      border: '#9c6df3',
      color: '#6d28d9',
    },
  }[status];

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (
          event.key === 'Enter' ||
          event.key === ' '
        ) {
          onClick();
        }
      }}
      sx={{
        position: 'relative',

        aspectRatio: '1 / 1',

        minHeight: 42,

        border: `1.5px solid ${styles.border}`,

        borderRadius: 2,

        bgcolor: styles.background,

        color: styles.color,

        display: 'grid',

        placeItems: 'center',

        cursor: 'pointer',

        fontSize: '0.82rem',

        fontWeight: 800,

        transition: '0.15s ease',

        '&:hover': {
          transform:
            'translateY(-1px)',
        },
      }}
    >
      {number}

      {status === 'answered' && (
        <Box
          sx={{
            position: 'absolute',

            top: 3,
            right: 3,

            width: 14,
            height: 14,

            borderRadius: '50%',

            bgcolor: '#22a447',

            color: '#fff',

            display: 'grid',

            placeItems: 'center',
          }}
        >
          <CheckRoundedIcon
            sx={{
              fontSize: 10,
            }}
          />
        </Box>
      )}

      {status === 'marked' && (
        <BookmarkRoundedIcon
          sx={{
            position: 'absolute',

            top: 3,
            right: 3,

            fontSize: 13,
          }}
        />
      )}
    </Box>
  );
};