import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';

import {
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Radio,
  Stack,
  Typography,
} from '@mui/material';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface PracticeQuestion {
  id: number;
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  options: string[];
  correctOption: number;
  explanation: string;
}

const practiceQuestions: PracticeQuestion[] = [
  {
    id: 1,
    question:
      'What is the primary purpose of database normalization?',
    difficulty: 'Easy',
    options: [
      'Reduce data redundancy and improve data integrity',
      'Increase the number of database tables',
      'Make every database query slower',
      'Remove all relationships between tables',
    ],
    correctOption: 0,
    explanation:
      'Normalization organizes related data into appropriate tables to reduce duplication and improve consistency.',
  },
  {
    id: 2,
    question:
      'Which normal form requires every non-key attribute to depend on the whole primary key?',
    difficulty: 'Medium',
    options: [
      'First Normal Form',
      'Second Normal Form',
      'Third Normal Form',
      'Boyce-Codd Normal Form',
    ],
    correctOption: 1,
    explanation:
      'Second Normal Form removes partial dependencies, so non-key attributes must depend on the complete primary key.',
  },
  {
    id: 3,
    question:
      'What is the main normalization problem with this design?',
    difficulty: 'Medium',
    options: [
      'Customer data is duplicated across orders',
      'OrderId should not be a primary key',
      'ProductName cannot be stored in a database',
      'CustomerPhone must always be NULL',
    ],
    correctOption: 0,
    explanation:
      'CustomerName and CustomerPhone describe the customer and are repeated for every order. A normalized design would separate Customers and Orders and connect them using CustomerId.',
  },
  {
    id: 4,
    question:
      'Which database design best separates customer information from order information?',
    difficulty: 'Medium',
    options: [
      'Store all customer and order data in one table',
      'Create Customers and Orders tables connected using CustomerId',
      'Remove CustomerId from all tables',
      'Store every order in a separate database',
    ],
    correctOption: 1,
    explanation:
      'Separating Customers and Orders removes repeated customer details while maintaining the relationship using CustomerId.',
  },
  {
    id: 5,
    question:
      'Which normal form primarily removes transitive dependencies?',
    difficulty: 'Medium',
    options: [
      '1NF',
      '2NF',
      '3NF',
      'No normal form',
    ],
    correctOption: 2,
    explanation:
      'Third Normal Form removes transitive dependencies between non-key attributes.',
  },
  {
    id: 6,
    question:
      'Which issue is most likely caused by storing the same customer phone number in many order rows?',
    difficulty: 'Easy',
    options: [
      'Update anomaly',
      'Compilation error',
      'Network timeout',
      'Authentication failure',
    ],
    correctOption: 0,
    explanation:
      'Repeated data can cause an update anomaly because every duplicate value must be updated consistently.',
  },
  {
    id: 7,
    question:
      'A normalized relational design should generally represent separate business entities as what?',
    difficulty: 'Easy',
    options: [
      'Separate related tables',
      'Repeated columns',
      'One very large text field',
      'Unrelated databases',
    ],
    correctOption: 0,
    explanation:
      'Separate business entities are typically represented by related tables with keys defining their relationships.',
  },
  {
    id: 8,
    question:
      'What should connect an Orders table to a Customers table?',
    difficulty: 'Medium',
    options: [
      'A CustomerId foreign key',
      'CustomerName copied into every column',
      'ProductName',
      'A random text value',
    ],
    correctOption: 0,
    explanation:
      'Orders can reference Customers through a CustomerId foreign key, avoiding repeated customer details.',
  },
];

const practicedSkills = [
  'Database Design',
  'Normalization',
  'Data Modeling',
  'SQL Fundamentals',
];

export const PracticeSessionPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  /*
   * TEMPORARY UI STATE.
   *
   * Replace practiceQuestions and the local attempt state
   * with the existing Accelerator Practice Session /
   * Question / Attempt / Evaluation APIs during integration.
   */
  const [questionIndex, setQuestionIndex] =
    useState(2);

  const [selectedOption, setSelectedOption] =
    useState<number | null>(0);

  const [submitted, setSubmitted] =
    useState(false);

  const [answers, setAnswers] =
    useState<Record<number, boolean>>({
      1: true,
      2: true,
    });

  const [hintVisible, setHintVisible] =
    useState(false);
const currentQuestion =
  practiceQuestions[questionIndex] ??
  practiceQuestions[0];

if (!currentQuestion) {
  return null;
}

  const totalQuestions =
    practiceQuestions.length;

  const answeredCount =
    Object.keys(answers).length;

  const correctCount =
    Object.values(answers).filter(Boolean)
      .length;

  const incorrectCount =
    Object.values(answers).filter(
      (value) => !value,
    ).length;

  const score =
    answeredCount > 0
      ? Math.round(
          (correctCount /
            answeredCount) *
            100,
        )
      : 0;

  const progress = Math.round(
    ((questionIndex + 1) /
      totalQuestions) *
      100,
  );

  const selectedIsCorrect =
    selectedOption ===
    currentQuestion.correctOption;

  const handleBack = () => {
    const params =
      new URLSearchParams(searchParams);

    params.set(
      'screen',
      'learning-module',
    );

    setSearchParams(params);
  };

  const handleReviewLesson = () => {
    handleBack();
  };

  const handleAskAi = () => {
    const params =
      new URLSearchParams(searchParams);

    params.set('screen', 'ai-tutor');

    setSearchParams(params);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) {
      return;
    }

    setSubmitted(true);

    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]:
        selectedOption ===
        currentQuestion.correctOption,
    }));
  };

  const handleNextQuestion = () => {
    if (
      questionIndex ===
      totalQuestions - 1
    ) {
      const params =
        new URLSearchParams(
          searchParams,
        );

      params.set(
        'screen',
        'practice-results',
      );

      setSearchParams(params);

      return;
    }

    setQuestionIndex(
      (previous) => previous + 1,
    );

    setSelectedOption(null);
    setSubmitted(false);
    setHintVisible(false);
  };

  const handlePreviousQuestion = () => {
    if (questionIndex === 0) {
      return;
    }

    setQuestionIndex(
      (previous) => previous - 1,
    );

    setSelectedOption(null);
    setSubmitted(false);
    setHintVisible(false);
  };

  const handleQuestionSelect = (
    index: number,
  ) => {
    setQuestionIndex(index);
    setSelectedOption(null);
    setSubmitted(false);
    setHintVisible(false);
  };

  const handleAssignment = () => {
    const params =
      new URLSearchParams(searchParams);

    params.set(
      'screen',
      'assignment',
    );

    setSearchParams(params);
  };

  const handleAssessment = () => {
    const params =
      new URLSearchParams(searchParams);

    params.set(
      'screen',
      'module-assessment',
    );

    setSearchParams(params);
  };

  const questionStatus = useMemo(
    () =>
      practiceQuestions.map(
        (question, index) => ({
          question,
          index,
          result:
            answers[question.id],
        }),
      ),
    [answers],
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
      {/* ======================================
          ACCELERATOR HERO
      ======================================= */}

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
            'linear-gradient(115deg, #1158b9 0%, #3449d7 52%, #751fe4 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 280,
            height: 280,
            borderRadius: '50%',
            right: -70,
            top: -155,
            bgcolor:
              'rgba(255,255,255,0.08)',
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
              fontWeight: 850,
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
              fontWeight: 750,
            }}
          >
            Premium
          </Box>
        </Stack>

        <Typography
          sx={{
            position: 'relative',
            mt: 0.65,
            maxWidth: 800,
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

      {/* ======================================
          HEADER
      ======================================= */}

      <Box
        sx={{
          mt: 1.5,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg:
              'minmax(0, 1fr) auto',
          },
          gap: 2,
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
              color: '#17213b',
              fontWeight: 800,
              '&:hover': {
                bgcolor: 'transparent',
                color: '#075fd6',
              },
            }}
          >
            Back to Lesson
          </Button>

          <Stack
            direction="row"
            spacing={1.2}
            alignItems="center"
            sx={{
              mt: 0.3,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: '#fff0f0',
                color: '#ef2020',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <TrackChangesRoundedIcon
                sx={{
                  fontSize: 30,
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
                  letterSpacing:
                    '-0.035em',
                  lineHeight: 1.1,
                }}
              >
                Practice Session
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  color: '#111a38',
                  fontSize: '1.05rem',
                  fontWeight: 850,
                }}
              >
                Database Normalization
              </Typography>

              <Typography
                sx={{
                  mt: 0.1,
                  color: '#263858',
                  fontSize: '0.82rem',
                }}
              >
                Practice what you learned
                and get instant AI feedback.
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* MODE NAV */}

        <Stack
          direction="row"
          spacing={0.7}
          sx={{
            p: 0.65,
            border:
              '1px solid #dce3ee',
            borderRadius: 3,
            bgcolor: '#fff',
            overflowX: 'auto',
          }}
        >
          <ModeButton
            active
            icon={
              <CodeRoundedIcon />
            }
            label="Practice"
          />

          <ModeButton
            icon={
              <AssignmentOutlinedIcon />
            }
            label="Assignment"
            onClick={handleAssignment}
          />

          <ModeButton
            icon={
              <EmojiEventsOutlinedIcon />
            }
            label="Assessment"
            onClick={handleAssessment}
          />
        </Stack>
      </Box>

      {/* CONTEXT CHIPS */}

      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        sx={{
          mt: 1.5,
        }}
      >
        <ContextChip
          icon={<StorageRoundedIcon />}
          text="Module 2: Database & Data Management"
        />

        <ContextChip
          icon={
            <MenuBookRoundedIcon />
          }
          text="Lesson: Normalization & Database Design"
        />
      </Stack>

      {/* ======================================
          MAIN CONTENT
      ======================================= */}

      <Box
        sx={{
          mt: 1.5,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl:
              'minmax(0, 1.65fr) 390px',
          },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {/* LEFT QUESTION AREA */}

        <Box
          sx={{
            border:
              '1px solid #dce3ee',
            borderRadius: 3,
            bgcolor: '#fff',
            p: {
              xs: 1.4,
              md: 1.8,
            },
          }}
        >
          {/* QUESTION PROGRESS */}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md:
                  'auto minmax(220px, 1fr)',
              },
              gap: {
                xs: 1,
                md: 3,
              },
              alignItems: 'center',
            }}
          >
            <Typography
              sx={{
                color: '#111a38',
                fontSize: '1rem',
                fontWeight: 900,
              }}
            >
              Question {questionIndex + 1}{' '}
              of {totalQuestions}
            </Typography>

            <Stack
              direction="row"
              spacing={1.2}
              alignItems="center"
              justifyContent={{
                xs: 'flex-start',
                md: 'flex-end',
              }}
            >
              <Typography
                sx={{
                  color: '#111a38',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                }}
              >
                Practice Progress
              </Typography>

              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  width: {
                    xs: 120,
                    md: 190,
                  },
                  height: 10,
                  borderRadius: 6,
                  bgcolor: '#e4e8ef',
                  '& .MuiLinearProgress-bar':
                    {
                      borderRadius: 6,
                      backgroundColor:
                        '#18a93a',
                    },
                }}
              />

              <Typography
                sx={{
                  color: '#111a38',
                  fontSize: '0.9rem',
                  fontWeight: 900,
                }}
              >
                {progress}%
              </Typography>
            </Stack>
          </Box>

          {/* QUESTION CARD */}

          <Box
            sx={{
              mt: 1.5,
              border:
                '1px solid #c9d7ff',
              borderRadius: 3,
              p: {
                xs: 1.4,
                md: 1.8,
              },
              background:
                'linear-gradient(180deg, #fff 0%, #fbfcff 100%)',
            }}
          >
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
                spacing={0.8}
                alignItems="center"
              >
                <HelpOutlineRoundedIcon
                  sx={{
                    color: '#6b22ed',
                  }}
                />

                <Typography
                  sx={{
                    color: '#5e1cd7',
                    fontSize: '0.8rem',
                    fontWeight: 900,
                  }}
                >
                  PRACTICE QUESTION
                </Typography>
              </Stack>

              <DifficultyChip
                difficulty={
                  currentQuestion.difficulty
                }
              />
            </Stack>

            <Typography
              sx={{
                mt: 1.2,
                color: '#111a38',
                fontSize: '0.95rem',
                fontWeight: 750,
                lineHeight: 1.5,
              }}
            >
              A database contains the
              following table:
            </Typography>

            {/* SAMPLE TABLE */}

            <DatabaseExample />

            <Typography
              sx={{
                mt: 1.5,
                color: '#111a38',
                fontSize: '1rem',
                fontWeight: 900,
                lineHeight: 1.45,
              }}
            >
              {currentQuestion.question}
            </Typography>

            {/* ANSWERS */}

            <Stack
              spacing={0.7}
              sx={{
                mt: 1.2,
              }}
            >
              {currentQuestion.options.map(
                (option, index) => (
                  <AnswerOption
                    key={option}
                    label={option}
                    index={index}
                    selected={
                      selectedOption ===
                      index
                    }
                    submitted={
                      submitted
                    }
                    correct={
                      index ===
                      currentQuestion.correctOption
                    }
                    onSelect={() => {
                      if (!submitted) {
                        setSelectedOption(
                          index,
                        );
                      }
                    }}
                  />
                ),
              )}
            </Stack>

            {/* HINT */}

            {hintVisible &&
              !submitted && (
                <Box
                  sx={{
                    mt: 1.2,
                    border:
                      '1px solid #ffd58a',
                    borderRadius: 2.5,
                    bgcolor: '#fff9eb',
                    p: 1.2,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={0.8}
                    alignItems="flex-start"
                  >
                    <LightbulbOutlinedIcon
                      sx={{
                        color: '#ee9b00',
                      }}
                    />

                    <Box>
                      <Typography
                        sx={{
                          color:
                            '#111a38',
                          fontSize:
                            '0.8rem',
                          fontWeight:
                            850,
                        }}
                      >
                        Hint
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.15,
                          color:
                            '#4a5365',
                          fontSize:
                            '0.77rem',
                          lineHeight: 1.5,
                        }}
                      >
                        Look for information
                        that belongs to one
                        business entity but is
                        repeated whenever
                        another entity creates
                        a new record.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}

            {/* FEEDBACK */}

            {submitted && (
              <FeedbackCard
                correct={
                  selectedIsCorrect
                }
                explanation={
                  currentQuestion.explanation
                }
                onAskAi={
                  handleAskAi
                }
              />
            )}
          </Box>

          {/* QUESTION ACTIONS */}

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            justifyContent="space-between"
            spacing={1}
            sx={{
              mt: 1.4,
            }}
          >
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
                  <LightbulbOutlinedIcon />
                }
                disabled={submitted}
                onClick={() =>
                  setHintVisible(true)
                }
                sx={secondaryButtonSx}
              >
                Get a Hint
              </Button>

              <Button
                variant="outlined"
                startIcon={
                  <AutoAwesomeRoundedIcon />
                }
                onClick={handleAskAi}
                sx={secondaryButtonSx}
              >
                Ask AI Tutor
              </Button>
            </Stack>

            {!submitted ? (
              <Button
                variant="contained"
                endIcon={
                  <ArrowForwardRoundedIcon />
                }
                disabled={
                  selectedOption === null
                }
                onClick={
                  handleCheckAnswer
                }
                sx={primaryButtonSx}
              >
                Check Answer
              </Button>
            ) : (
              <Button
                variant="contained"
                endIcon={
                  <ArrowForwardRoundedIcon />
                }
                onClick={
                  handleNextQuestion
                }
                sx={primaryButtonSx}
              >
                {questionIndex ===
                totalQuestions - 1
                  ? 'View Results'
                  : 'Next Question'}
              </Button>
            )}
          </Stack>

          {/* PREVIOUS */}

          {questionIndex > 0 && (
            <Button
              startIcon={
                <ArrowBackRoundedIcon />
              }
              onClick={
                handlePreviousQuestion
              }
              sx={{
                mt: 1,
                px: 0,
                textTransform: 'none',
                fontWeight: 750,
              }}
            >
              Previous Question
            </Button>
          )}
        </Box>

        {/* ==================================
            RIGHT SIDEBAR
        =================================== */}

        <Stack spacing={2}>
          {/* SESSION PROGRESS */}

          <Box sx={sideCardSx}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <BarChartRoundedIcon
                sx={{
                  color: '#1269e8',
                  fontSize: 29,
                }}
              />

              <Typography
                sx={{
                  color: '#111a38',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                }}
              >
                Session Progress
              </Typography>
            </Stack>

            <Stack
              divider={<Divider />}
              sx={{
                mt: 1.2,
              }}
            >
              <StatRow
                icon={
                  <QuizOutlinedIcon />
                }
                label="Questions"
                value={`${questionIndex + 1} / ${totalQuestions}`}
                color="#7624ec"
              />

              <StatRow
                icon={
                  <CheckRoundedIcon />
                }
                label="Correct"
                value={`${correctCount}`}
                color="#18a93a"
              />

              <StatRow
                icon={
                  <CloseRoundedIcon />
                }
                label="Incorrect"
                value={`${incorrectCount}`}
                color="#f02020"
              />

              <StatRow
                icon={
                  <TrackChangesRoundedIcon />
                }
                label="Current Score"
                value={
                  answeredCount > 0
                    ? `${score}%`
                    : '—'
                }
                color="#ef2020"
                score
              />
            </Stack>

            {/* QUESTION DOTS */}

            <Stack
              direction="row"
              spacing={0.7}
              useFlexGap
              flexWrap="wrap"
              sx={{
                mt: 1.4,
              }}
            >
              {questionStatus.map(
                ({
                  question,
                  index,
                  result,
                }) => {
                  const current =
                    index ===
                    questionIndex;

                  return (
                    <Box
                      key={question.id}
                      onClick={() =>
                        handleQuestionSelect(
                          index,
                        )
                      }
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border:
                          current
                            ? '2px solid #1269e8'
                            : result ===
                                undefined
                              ? '1px solid #cdd5e2'
                              : 'none',
                        bgcolor:
                          current
                            ? '#1269e8'
                            : result === true
                              ? '#19a63a'
                              : result ===
                                  false
                                ? '#ef2525'
                                : '#fff',
                        color:
                          current ||
                          result !==
                            undefined
                            ? '#fff'
                            : '#657187',
                        display: 'grid',
                        placeItems:
                          'center',
                        fontSize:
                          '0.78rem',
                        fontWeight: 850,
                      }}
                    >
                      {result === true &&
                      !current ? (
                        <CheckRoundedIcon
                          sx={{
                            fontSize: 18,
                          }}
                        />
                      ) : result ===
                          false &&
                        !current ? (
                        <CloseRoundedIcon
                          sx={{
                            fontSize: 18,
                          }}
                        />
                      ) : (
                        index + 1
                      )}
                    </Box>
                  );
                },
              )}
            </Stack>
          </Box>

          {/* SKILLS */}

          <Box sx={sideCardSx}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <DataObjectRoundedIcon
                sx={{
                  color: '#1269e8',
                  fontSize: 29,
                }}
              />

              <Typography
                sx={{
                  color: '#111a38',
                  fontSize: '1.05rem',
                  fontWeight: 900,
                }}
              >
                Skills Being Practiced
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={0.8}
              useFlexGap
              flexWrap="wrap"
              sx={{
                mt: 1.3,
              }}
            >
              {practicedSkills.map(
                (skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    sx={{
                      bgcolor: '#e8edff',
                      color: '#17213b',
                      fontWeight: 750,
                      fontSize: '0.74rem',
                    }}
                  />
                ),
              )}
            </Stack>
          </Box>

          {/* HELP */}

          <Box
            sx={{
              ...sideCardSx,
              borderColor: '#ddc7ff',
              background:
                'linear-gradient(145deg, #fbf7ff 0%, #f6efff 100%)',
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="flex-start"
            >
              <PsychologyRoundedIcon
                sx={{
                  color: '#7324e9',
                  fontSize: 30,
                }}
              />

              <Box>
                <Typography
                  sx={{
                    color: '#111a38',
                    fontSize: '1.05rem',
                    fontWeight: 900,
                  }}
                >
                  Need Help?
                </Typography>

                <Typography
                  sx={{
                    mt: 0.15,
                    color: '#4a5368',
                    fontSize: '0.76rem',
                    lineHeight: 1.4,
                  }}
                >
                  Stuck on this question?
                  Get guidance, a hint, or
                  revisit the lesson.
                </Typography>
              </Box>
            </Stack>

            <Stack
              spacing={0.8}
              sx={{
                mt: 1.3,
              }}
            >
              <HelpButton
                icon={
                  <LightbulbOutlinedIcon />
                }
                label="Get a Hint"
                onClick={() =>
                  setHintVisible(true)
                }
              />

              <HelpButton
                icon={
                  <AutoAwesomeRoundedIcon />
                }
                label="Ask AI Tutor"
                onClick={handleAskAi}
              />

              <HelpButton
                icon={
                  <MenuBookRoundedIcon />
                }
                label="Review Lesson"
                onClick={
                  handleReviewLesson
                }
              />
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

/* ==========================================
   DATABASE EXAMPLE
========================================== */

const DatabaseExample = () => (
  <Box
    sx={{
      mt: 1.1,
      width: '100%',
      maxWidth: 670,
      overflowX: 'auto',
      border:
        '1px solid #bdd0ec',
      borderRadius: 1.5,
    }}
  >
    <Box
      component="table"
      sx={{
        width: '100%',
        minWidth: 550,
        borderCollapse: 'collapse',
        fontSize: '0.75rem',

        '& th, & td': {
          px: 1.1,
          py: 0.55,
          textAlign: 'left',
          borderRight:
            '1px solid #c9d6e8',
          borderBottom:
            '1px solid #c9d6e8',
        },

        '& th': {
          color: '#111a38',
          fontWeight: 850,
          bgcolor: '#dceaff',
        },

        '& td': {
          color: '#17213b',
          bgcolor: '#f9fbff',
        },
      }}
    >
      <thead>
        <tr>
          <th>OrderId</th>
          <th>CustomerName</th>
          <th>CustomerPhone</th>
          <th>ProductName</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td>101</td>
          <td>Amit Sharma</td>
          <td>9876543210</td>
          <td>Laptop</td>
        </tr>

        <tr>
          <td>102</td>
          <td>Amit Sharma</td>
          <td>9876543210</td>
          <td>Mouse</td>
        </tr>

        <tr>
          <td>103</td>
          <td>Priya Deshmukh</td>
          <td>9866123456</td>
          <td>Keyboard</td>
        </tr>
      </tbody>
    </Box>
  </Box>
);

/* ==========================================
   ANSWER
========================================== */

interface AnswerOptionProps {
  label: string;
  index: number;
  selected: boolean;
  submitted: boolean;
  correct: boolean;
  onSelect: () => void;
}

const AnswerOption = ({
  label,
  selected,
  submitted,
  correct,
  onSelect,
}: AnswerOptionProps) => {
  const wrong =
    submitted &&
    selected &&
    !correct;

  const showCorrect =
    submitted && correct;

  return (
    <Box
      onClick={onSelect}
      sx={{
        minHeight: 48,
        px: 1,
        borderRadius: 2,
        cursor: submitted
          ? 'default'
          : 'pointer',
        border: showCorrect
          ? '1px solid #21aa42'
          : wrong
            ? '1px solid #ef3333'
            : selected
              ? '1px solid #2378f5'
              : '1px solid transparent',
        bgcolor: showCorrect
          ? '#effbf2'
          : wrong
            ? '#fff2f2'
            : selected
              ? '#eef5ff'
              : '#fff',
        display: 'flex',
        alignItems: 'center',
        transition:
          'all 0.15s ease',
        '&:hover': {
          bgcolor: submitted
            ? undefined
            : '#f5f8fd',
        },
      }}
    >
      <Radio
        checked={selected}
        disabled={submitted}
        sx={{
          p: 0.6,
        }}
      />

      <Typography
        sx={{
          flex: 1,
          color: '#17213b',
          fontSize: '0.83rem',
          fontWeight: selected
            ? 700
            : 550,
        }}
      >
        {label}
      </Typography>

      {showCorrect && (
        <CheckRoundedIcon
          sx={{
            color: '#19a63a',
          }}
        />
      )}

      {wrong && (
        <CloseRoundedIcon
          sx={{
            color: '#ef2525',
          }}
        />
      )}
    </Box>
  );
};

/* ==========================================
   FEEDBACK
========================================== */

interface FeedbackCardProps {
  correct: boolean;
  explanation: string;
  onAskAi: () => void;
}

const FeedbackCard = ({
  correct,
  explanation,
  onAskAi,
}: FeedbackCardProps) => (
  <Box
    sx={{
      mt: 1.4,
      border: correct
        ? '1px solid #9adca9'
        : '1px solid #ffb5b5',
      borderRadius: 2.5,
      bgcolor: correct
        ? '#f2fcf4'
        : '#fff5f5',
      p: 1.4,
    }}
  >
    <Stack
      direction="row"
      spacing={0.8}
      alignItems="center"
    >
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          bgcolor: correct
            ? '#1cab3c'
            : '#ef2525',
          color: '#fff',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {correct ? (
          <CheckRoundedIcon
            sx={{
              fontSize: 19,
            }}
          />
        ) : (
          <CloseRoundedIcon
            sx={{
              fontSize: 19,
            }}
          />
        )}
      </Box>

      <Typography
        sx={{
          color: correct
            ? '#137a2c'
            : '#b71919',
          fontWeight: 900,
        }}
      >
        {correct
          ? 'Correct Answer'
          : 'Not Quite'}
      </Typography>
    </Stack>

    <Typography
      sx={{
        mt: 0.9,
        color: '#26324b',
        fontSize: '0.8rem',
        lineHeight: 1.55,
      }}
    >
      {explanation}
    </Typography>

    <Box
      sx={{
        mt: 1,
        borderRadius: 2,
        bgcolor:
          'rgba(104,43,234,0.06)',
        p: 1,
      }}
    >
      <Stack
        direction="row"
        spacing={0.7}
        alignItems="center"
      >
        <AutoAwesomeRoundedIcon
          sx={{
            color: '#7026e9',
            fontSize: 20,
          }}
        />

        <Typography
          sx={{
            color: '#111a38',
            fontSize: '0.77rem',
            fontWeight: 850,
          }}
        >
          AI Explanation
        </Typography>
      </Stack>

      <Typography
        sx={{
          mt: 0.4,
          color: '#455168',
          fontSize: '0.75rem',
          lineHeight: 1.5,
        }}
      >
        Think about which information belongs
        to each business entity. Normalization
        separates those entities while keys
        preserve their relationships.
      </Typography>

      <Button
        startIcon={
          <AutoAwesomeRoundedIcon />
        }
        onClick={onAskAi}
        sx={{
          mt: 0.5,
          px: 0,
          textTransform: 'none',
          fontSize: '0.76rem',
          fontWeight: 800,
        }}
      >
        Ask AI About This
      </Button>
    </Box>
  </Box>
);

/* ==========================================
   SMALL COMPONENTS
========================================== */

interface ModeButtonProps {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const ModeButton = ({
  active = false,
  icon,
  label,
  onClick,
}: ModeButtonProps) => (
  <Button
    startIcon={icon}
    onClick={onClick}
    sx={{
      minWidth: 135,
      minHeight: 48,
      borderRadius: 2.5,
      textTransform: 'none',
      fontWeight: 800,
      color: active
        ? '#fff'
        : '#17213b',
      bgcolor: active
        ? '#4b37e8'
        : '#f7f8fc',
      '&:hover': {
        bgcolor: active
          ? '#3d2ed0'
          : '#eef2f8',
      },
    }}
  >
    {label}
  </Button>
);

interface ContextChipProps {
  icon: React.ReactNode;
  text: string;
}

const ContextChip = ({
  icon,
  text,
}: ContextChipProps) => (
  <Stack
    direction="row"
    spacing={0.8}
    alignItems="center"
    sx={{
      px: 1.5,
      py: 0.8,
      border:
        '1px solid #d5e0f2',
      borderRadius: 5,
      bgcolor: '#f8faff',
      color: '#17213b',
    }}
  >
    <Box
      sx={{
        color: '#1269e8',
        display: 'grid',
        placeItems: 'center',
        '& svg': {
          fontSize: 20,
        },
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        fontSize: '0.76rem',
        fontWeight: 750,
      }}
    >
      {text}
    </Typography>
  </Stack>
);

interface DifficultyChipProps {
  difficulty:
    | 'Easy'
    | 'Medium'
    | 'Hard';
}

const DifficultyChip = ({
  difficulty,
}: DifficultyChipProps) => (
  <Chip
    icon={
      <BarChartRoundedIcon />
    }
    label={difficulty}
    size="small"
    sx={{
      bgcolor:
        difficulty === 'Hard'
          ? '#ffe8e8'
          : difficulty === 'Medium'
            ? '#fff0d8'
            : '#e9f8ed',
      color:
        difficulty === 'Hard'
          ? '#c82121'
          : difficulty === 'Medium'
            ? '#a95a00'
            : '#147c2e',
      fontWeight: 850,
      '& .MuiChip-icon': {
        color: 'inherit',
      },
    }}
  />
);

interface StatRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  score?: boolean;
}

const StatRow = ({
  icon,
  label,
  value,
  color,
  score = false,
}: StatRowProps) => (
  <Stack
    direction="row"
    spacing={0.9}
    alignItems="center"
    sx={{
      py: 0.75,
    }}
  >
    <Box
      sx={{
        color,
        display: 'grid',
        placeItems: 'center',
        '& svg': {
          fontSize: 22,
        },
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        flex: 1,
        color: '#17213b',
        fontSize: '0.8rem',
        fontWeight: 700,
      }}
    >
      {label}
    </Typography>

    <Box
      sx={{
        px: score ? 1 : 0,
        py: score ? 0.25 : 0,
        borderRadius: 5,
        bgcolor: score
          ? '#dff7e3'
          : 'transparent',
        color: score
          ? '#147c2e'
          : '#111a38',
        fontSize: '0.8rem',
        fontWeight: 900,
      }}
    >
      {value}
    </Box>
  </Stack>
);

interface HelpButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const HelpButton = ({
  icon,
  label,
  onClick,
}: HelpButtonProps) => (
  <Button
    fullWidth
    variant="outlined"
    startIcon={icon}
    onClick={onClick}
    sx={{
      justifyContent: 'flex-start',
      borderRadius: 2,
      borderColor: '#ad7af6',
      color: '#17213b',
      textTransform: 'none',
      fontWeight: 800,
      '&:hover': {
        borderColor: '#7b35e8',
        bgcolor: '#f9f5ff',
      },
    }}
  >
    {label}
  </Button>
);

const sideCardSx = {
  border: '1px solid #dce3ee',
  borderRadius: 3,
  bgcolor: '#fff',
  p: 1.8,
};

const secondaryButtonSx = {
  minHeight: 46,
  px: 2.3,
  borderRadius: 3,
  textTransform: 'none',
  fontWeight: 800,
};

const primaryButtonSx = {
  minWidth: {
    xs: '100%',
    sm: 220,
  },
  minHeight: 48,
  borderRadius: 3,
  textTransform: 'none',
  fontWeight: 850,
  boxShadow: 'none',
  background:
    'linear-gradient(90deg, #1269ef 0%, #075cff 100%)',
};