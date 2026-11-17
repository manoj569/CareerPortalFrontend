import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded';
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import FormatListNumberedRoundedIcon from '@mui/icons-material/FormatListNumberedRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import RecordVoiceOverRoundedIcon from '@mui/icons-material/RecordVoiceOverRounded';
import StopCircleRoundedIcon from '@mui/icons-material/StopCircleRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VideocamOffRoundedIcon from '@mui/icons-material/VideocamOffRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';

import {
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type AnswerTab = 'answer' | 'notes';

/*
 * C18 FRONTEND-ONLY SCREEN
 *
 * IMPORTANT:
 * The question below exists only to reproduce the approved UI.
 *
 * During backend integration:
 * - create interview session from C17
 * - load current question from backend
 * - submit candidate answer to backend
 * - receive next question from backend
 * - persist skipped/submitted answers
 * - generate C19 result only after backend evaluation
 *
 * Do not treat this temporary question as production AI output.
 */
const TEMPORARY_QUESTION =
  'Explain the difference between INNER JOIN and LEFT JOIN in SQL. Give a real-world example for each.';

export const LiveMockInterviewPage = () => {
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

  /*
   * Approved UI shows Question 4,
   * meaning 3 questions are already completed.
   * This is temporary visual state only.
   */
  const [currentQuestion, setCurrentQuestion] =
    useState(
      Math.min(4, totalQuestions),
    );

  const [completedQuestions, setCompletedQuestions] =
    useState<number[]>(
      Array.from(
        {
          length: Math.min(
            3,
            Math.max(
              totalQuestions - 1,
              0,
            ),
          ),
        },
        (_, index) => index + 1,
      ),
    );

  const [answer, setAnswer] = useState('');
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] =
    useState<AnswerTab>('answer');

  const [microphoneOn, setMicrophoneOn] =
    useState(true);

  const [cameraOn, setCameraOn] =
    useState(true);

  const progress = useMemo(() => {
    if (totalQuestions <= 0) {
      return 0;
    }

    return Math.round(
      (completedQuestions.length /
        totalQuestions) *
        100,
    );
  }, [
    completedQuestions.length,
    totalQuestions,
  ]);

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

  const estimatedMinutes =
    totalQuestions === 5
      ? 10
      : totalQuestions === 15
        ? 30
        : 20;

  const navigateToScreen = (
    screen: string,
    extra?: Record<string, string>,
  ) => {
    const params =
      new URLSearchParams(searchParams);

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

  const handleBackToSetup = () => {
    navigateToScreen(
      'mock-interview-setup',
    );
  };

  const handleEndInterview = () => {
    /*
     * C19 will be created next.
     *
     * Later the backend should finalize the
     * interview before navigating to results.
     */
    navigateToScreen(
      'mock-interview-results',
      {
        completed: String(
          completedQuestions.length,
        ),
        total: String(totalQuestions),
      },
    );
  };

  const moveToNextQuestion = () => {
    if (
      currentQuestion >= totalQuestions
    ) {
      handleEndInterview();
      return;
    }

    setCurrentQuestion(
      (current) => current + 1,
    );

    setAnswer('');
  };

  const handleSubmitAnswer = () => {
    if (!answer.trim()) {
      return;
    }

    /*
     * Backend integration point:
     *
     * POST/submit answer here.
     *
     * Do not generate an AI score or feedback
     * locally.
     */

    setCompletedQuestions(
      (current) => {
        if (
          current.includes(
            currentQuestion,
          )
        ) {
          return current;
        }

        return [
          ...current,
          currentQuestion,
        ];
      },
    );

    moveToNextQuestion();
  };

  const handleSkipQuestion = () => {
    /*
     * Backend integration should eventually
     * persist skipped questions.
     */

    moveToNextQuestion();
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
              'minmax(0, 1fr) minmax(320px, 0.55fr)',
          },
          gap: 1.5,
          alignItems: 'end',
        }}
      >
        <Box>
          <Button
            startIcon={
              <ArrowBackRoundedIcon />
            }
            onClick={handleBackToSetup}
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
            Back to Setup
          </Button>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mt: 0.15 }}
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
                Live Mock Interview
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  color: '#536078',
                  fontSize: '0.82rem',
                }}
              >
                A real-time, AI-powered
                interview for {targetRole} (
                {formattedDifficulty}).
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* PROGRESS */}

        <Box>
          <Typography
            sx={{
              color: '#111a38',
              fontSize: '0.72rem',
              fontWeight: 900,
            }}
          >
            Interview Progress
          </Typography>

          <Stack
            direction="row"
            spacing={1.2}
            alignItems="center"
            sx={{
              mt: 0.5,
            }}
          >
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                flex: 1,
                height: 12,
                borderRadius: 10,
                bgcolor: '#d7deee',
                '& .MuiLinearProgress-bar':
                  {
                    borderRadius: 10,
                    bgcolor: '#19b629',
                  },
              }}
            />

            <Typography
              sx={{
                color: '#111a38',
                fontSize: '0.76rem',
                fontWeight: 900,
                whiteSpace: 'nowrap',
              }}
            >
              {completedQuestions.length} of{' '}
              {totalQuestions} Questions (
              {progress}%)
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* INTERVIEW AREA */}

      <Box
        sx={{
          mt: 1.5,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl:
              'minmax(0, 1.65fr) minmax(350px, 0.95fr)',
          },
          gap: 1.5,
          alignItems: 'stretch',
        }}
      >
        {/* LEFT */}

        <Box
          sx={{
            ...cardSx,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* INTERVIEW CONFIG */}

          <Stack
            direction="row"
            spacing={0.7}
            useFlexGap
            flexWrap="wrap"
          >
            <InfoChip
              label="Role"
              value={targetRole}
            />

            <InfoChip
              label="Type"
              value={
                formattedInterviewType
              }
            />

            <InfoChip
              label="Difficulty"
              value={
                formattedDifficulty
              }
            />

            <InfoChip
              label="Questions"
              value={`${totalQuestions} (~${estimatedMinutes} min)`}
            />
          </Stack>

          {/* AI QUESTION */}

          <Box
            sx={{
              mt: 2,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md:
                  '175px minmax(0, 1fr)',
              },
              gap: 1.6,
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: 145,
                  height: 145,
                  mx: 'auto',
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                  border:
                    '7px solid #d8c8ff',
                  background:
                    'linear-gradient(145deg, #272b62 0%, #6d42c7 100%)',
                }}
              >
                <RecordVoiceOverRoundedIcon
                  sx={{
                    fontSize: 72,
                  }}
                />
              </Box>

              <Chip
                label="AI Interviewer"
                sx={{
                  mt: 0.7,
                  bgcolor: '#6515df',
                  color: '#fff',
                  fontWeight: 900,
                }}
              />
            </Box>

            <Box
              sx={{
                position: 'relative',
                border:
                  '1px solid #cdb8ff',
                borderRadius: 3,
                bgcolor: '#fbf9ff',
                px: {
                  xs: 1.5,
                  md: 2,
                },
                py: 1.6,
                minHeight: 175,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                spacing={1}
                alignItems="center"
              >
                <Chip
                  label={`Question ${currentQuestion} of ${totalQuestions}`}
                  size="small"
                  sx={{
                    bgcolor: '#ebe4ff',
                    color: '#111a38',
                    fontWeight: 850,
                  }}
                />

                <IconButton
                  aria-label="Play question audio"
                  sx={{
                    color: '#6419e7',
                  }}
                >
                  <VolumeUpRoundedIcon />
                </IconButton>
              </Stack>

              <Typography
                sx={{
                  mt: 1,
                  color: '#111a38',
                  fontSize: {
                    xs: '1.05rem',
                    md: '1.35rem',
                  },
                  lineHeight: 1.28,
                  fontWeight: 900,
                }}
              >
                {TEMPORARY_QUESTION}
              </Typography>
            </Box>
          </Box>

          {/* CONTROLS */}

          <Box
            sx={{
              mt: 'auto',
              pt: 2,
            }}
          >
            <Box
              sx={{
                border:
                  '1px solid #dce3ee',
                borderRadius: 2.5,
                p: 1.3,
              }}
            >
              <Stack
                direction="row"
                spacing={0.7}
                alignItems="center"
              >
                <ListAltRoundedIcon
                  sx={{
                    color: '#671ce6',
                  }}
                />

                <Typography
                  sx={{
                    color: '#111a38',
                    fontSize: '0.85rem',
                    fontWeight: 900,
                  }}
                >
                  Interview Controls
                </Typography>
              </Stack>

              <Box
                sx={{
                  mt: 1,
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm:
                      'repeat(3, minmax(0, 1fr))',
                  },
                  gap: 1,
                }}
              >
                <ControlButton
                  active={microphoneOn}
                  activeIcon={
                    <MicRoundedIcon />
                  }
                  inactiveIcon={
                    <MicOffRoundedIcon />
                  }
                  label="Microphone"
                  onClick={() =>
                    setMicrophoneOn(
                      (current) =>
                        !current,
                    )
                  }
                />

                <ControlButton
                  active={cameraOn}
                  activeIcon={
                    <VideocamRoundedIcon />
                  }
                  inactiveIcon={
                    <VideocamOffRoundedIcon />
                  }
                  label="Camera"
                  onClick={() =>
                    setCameraOn(
                      (current) =>
                        !current,
                    )
                  }
                />

                <Button
                  startIcon={
                    <StopCircleRoundedIcon />
                  }
                  onClick={
                    handleEndInterview
                  }
                  sx={{
                    minHeight: 64,
                    border:
                      '1px solid #ff766d',
                    borderRadius: 2.2,
                    color: '#d51c16',
                    bgcolor: '#fff8f7',
                    textTransform: 'none',
                    fontWeight: 900,
                    '&:hover': {
                      bgcolor: '#fff1ef',
                      borderColor:
                        '#e83b33',
                    },
                  }}
                >
                  End Interview
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* RIGHT ANSWER PANEL */}

        <Box
          sx={{
            ...cardSx,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns:
                '1fr 1fr',
              gap: 0.7,
            }}
          >
            <AnswerTabButton
              active={
                activeTab === 'answer'
              }
              icon={<MicRoundedIcon />}
              label="Your Answer"
              onClick={() =>
                setActiveTab('answer')
              }
            />

            <AnswerTabButton
              active={
                activeTab === 'notes'
              }
              icon={<NotesRoundedIcon />}
              label="Notes"
              onClick={() =>
                setActiveTab('notes')
              }
            />
          </Box>

          {activeTab === 'answer' ? (
            <>
              <TextField
                multiline
                minRows={8}
                maxRows={12}
                fullWidth
                value={answer}
                onChange={(event) =>
                  setAnswer(
                    event.target.value.slice(
                      0,
                      2000,
                    ),
                  )
                }
                placeholder="Type your answer here..."
                sx={{
                  mt: 1,
                  '& .MuiOutlinedInput-root':
                    {
                      alignItems:
                        'flex-start',
                      borderRadius: 2.5,
                      bgcolor: '#fff',
                    },
                }}
              />

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  mt: -0.2,
                  px: 0.8,
                  py: 0.5,
                  border:
                    '1px solid #dce3ee',
                  borderTop: 'none',
                  borderRadius:
                    '0 0 10px 10px',
                }}
              >
                <Stack
                  direction="row"
                  spacing={0.15}
                >
                  <EditorButton>
                    <FormatBoldRoundedIcon />
                  </EditorButton>

                  <EditorButton>
                    <FormatItalicRoundedIcon />
                  </EditorButton>

                  <EditorButton>
                    <FormatListBulletedRoundedIcon />
                  </EditorButton>

                  <EditorButton>
                    <FormatListNumberedRoundedIcon />
                  </EditorButton>
                </Stack>

                <Typography
                  sx={{
                    color: '#536078',
                    fontSize: '0.65rem',
                    fontWeight: 750,
                  }}
                >
                  {answer.length} / 2,000
                </Typography>
              </Stack>
            </>
          ) : (
            <TextField
              multiline
              minRows={10}
              maxRows={14}
              fullWidth
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value,
                )
              }
              placeholder="Write private notes for this interview..."
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root':
                  {
                    borderRadius: 2.5,
                  },
              }}
            />
          )}

          {/* TIP */}

          <Box
            sx={{
              mt: 1,
              p: 1.1,
              borderRadius: 2.3,
              bgcolor: '#f5edff',
              border:
                '1px solid #ead9ff',
            }}
          >
            <Stack
              direction="row"
              spacing={0.7}
              alignItems="flex-start"
            >
              <LightbulbRoundedIcon
                sx={{
                  color: '#e9a900',
                  fontSize: 23,
                }}
              />

              <Typography
                sx={{
                  color: '#17213b',
                  fontSize: '0.7rem',
                  lineHeight: 1.4,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    fontWeight: 900,
                  }}
                >
                  Tip:{' '}
                </Box>
                Be clear, use simple
                examples, and explain the
                key differences with real
                scenarios.
              </Typography>
            </Stack>
          </Box>

          {/* ACTIONS */}

          <Box
            sx={{
              mt: 'auto',
              pt: 1.5,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '0.8fr 1fr',
              },
              gap: 0.8,
            }}
          >
            <Button
              variant="outlined"
              onClick={
                handleSkipQuestion
              }
              sx={{
                minHeight: 47,
                borderRadius: 2.2,
                borderColor: '#6419e7',
                color: '#5715cf',
                textTransform: 'none',
                fontWeight: 900,
              }}
            >
              Skip Question
            </Button>

            <Button
              variant="contained"
              endIcon={
                <ArrowForwardRoundedIcon />
              }
              disabled={
                !answer.trim()
              }
              onClick={
                handleSubmitAnswer
              }
              sx={{
                minHeight: 47,
                borderRadius: 2.2,
                textTransform: 'none',
                fontWeight: 900,
                boxShadow: 'none',
                background:
                  'linear-gradient(90deg, #7115e8 0%, #5018dd 100%)',
              }}
            >
              Submit Answer
            </Button>
          </Box>
        </Box>
      </Box>

      {/* QUESTION TIMELINE */}

      <Box
        sx={{
          ...cardSx,
          mt: 1.5,
          mb: 2,
        }}
      >
        <Stack
          direction="row"
          spacing={0.7}
          alignItems="center"
        >
          <ListAltRoundedIcon
            sx={{
              color: '#681ce7',
            }}
          />

          <Typography
            sx={{
              color: '#111a38',
              fontSize: '0.9rem',
              fontWeight: 900,
            }}
          >
            Question Timeline
          </Typography>
        </Stack>

        <Box
          sx={{
            mt: 1.2,
            display: 'grid',
            gridTemplateColumns: {
              xs:
                'repeat(5, minmax(45px, 1fr))',
              md: `repeat(${Math.min(
                totalQuestions,
                10,
              )}, minmax(50px, 1fr))`,
            },
            gap: 1,
          }}
        >
          {Array.from(
            {
              length: totalQuestions,
            },
            (_, index) => {
              const question =
                index + 1;

              const completed =
                completedQuestions.includes(
                  question,
                );

              const active =
                question ===
                currentQuestion;

              return (
                <QuestionBubble
                  key={question}
                  question={question}
                  completed={
                    completed
                  }
                  active={active}
                />
              );
            },
          )}
        </Box>
      </Box>
    </Box>
  );
};

/* =========================================
   INFO CHIP
========================================= */

const InfoChip = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <Box
    sx={{
      px: 1.2,
      py: 0.75,
      borderRadius: 2,
      bgcolor: '#eee9ff',
      color: '#17213b',
      fontSize: '0.68rem',
    }}
  >
    <Box
      component="span"
      sx={{
        fontWeight: 900,
      }}
    >
      {label}:{' '}
    </Box>

    {value}
  </Box>
);

/* =========================================
   CONTROL BUTTON
========================================= */

interface ControlButtonProps {
  active: boolean;
  activeIcon: React.ReactNode;
  inactiveIcon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const ControlButton = ({
  active,
  activeIcon,
  inactiveIcon,
  label,
  onClick,
}: ControlButtonProps) => (
  <Button
    onClick={onClick}
    sx={{
      minHeight: 64,
      borderRadius: 2.2,
      border: active
        ? '1px solid #a7e5b4'
        : '1px solid #e0e4eb',
      bgcolor: active
        ? '#f0fff3'
        : '#f7f8fa',
      color: active
        ? '#118b25'
        : '#5d687c',
      textTransform: 'none',
      '&:hover': {
        bgcolor: active
          ? '#e8fbed'
          : '#f0f2f5',
      },
    }}
  >
    <Stack
      direction="row"
      spacing={0.8}
      alignItems="center"
    >
      <Box
        sx={{
          display: 'grid',
          placeItems: 'center',
          '& svg': {
            fontSize: 27,
          },
        }}
      >
        {active
          ? activeIcon
          : inactiveIcon}
      </Box>

      <Box
        sx={{
          textAlign: 'left',
        }}
      >
        <Typography
          sx={{
            color: '#17213b',
            fontSize: '0.68rem',
            fontWeight: 750,
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            color: active
              ? '#109228'
              : '#d12c25',
            fontSize: '0.72rem',
            fontWeight: 900,
          }}
        >
          {active ? 'On' : 'Off'}
        </Typography>
      </Box>
    </Stack>
  </Button>
);

/* =========================================
   ANSWER TAB
========================================= */

interface AnswerTabButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const AnswerTabButton = ({
  active,
  icon,
  label,
  onClick,
}: AnswerTabButtonProps) => (
  <Button
    startIcon={icon}
    onClick={onClick}
    sx={{
      minHeight: 45,
      borderRadius: 2.2,
      color: active
        ? '#fff'
        : '#17213b',
      bgcolor: active
        ? '#6418e7'
        : '#f5f6fb',
      textTransform: 'none',
      fontWeight: 900,
      '&:hover': {
        bgcolor: active
          ? '#5313ca'
          : '#eef0f6',
      },
    }}
  >
    {label}
  </Button>
);

/* =========================================
   EDITOR BUTTON
========================================= */

const EditorButton = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <IconButton
    size="small"
    sx={{
      color: '#17213b',
      '& svg': {
        fontSize: 18,
      },
    }}
  >
    {children}
  </IconButton>
);

/* =========================================
   QUESTION BUBBLE
========================================= */

interface QuestionBubbleProps {
  question: number;
  completed: boolean;
  active: boolean;
}

const QuestionBubble = ({
  question,
  completed,
  active,
}: QuestionBubbleProps) => (
  <Box
    sx={{
      display: 'grid',
      placeItems: 'center',
    }}
  >
    <Box
      sx={{
        width: 45,
        height: 45,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        border: completed
          ? '1px solid #a8e4b1'
          : active
            ? '2px solid #6c19e7'
            : '1px solid #cad3e4',
        bgcolor: completed
          ? '#effcf1'
          : active
            ? '#7a28ef'
            : '#f2f5fa',
        color: completed
          ? '#148b27'
          : active
            ? '#fff'
            : '#17213b',
        fontSize: '0.8rem',
        fontWeight: 900,
        boxShadow: active
          ? '0 5px 14px rgba(105, 28, 226, 0.25)'
          : 'none',
      }}
    >
      {completed ? (
        <Stack
          direction="row"
          spacing={0.1}
          alignItems="center"
        >
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 900,
            }}
          >
            {question}
          </Typography>

          <CheckRoundedIcon
            sx={{
              fontSize: 15,
            }}
          />
        </Stack>
      ) : (
        question
      )}
    </Box>
  </Box>
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
    '0 4px 14px rgba(24,35,64,0.04)',
};