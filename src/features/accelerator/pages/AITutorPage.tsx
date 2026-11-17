import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import RadioButtonCheckedRoundedIcon from '@mui/icons-material/RadioButtonCheckedRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import {
  KeyboardEvent,
  ReactNode,
  useState,
} from 'react';

import { useSearchParams } from 'react-router-dom';

type TutorMode =
  | 'guided'
  | 'concept'
  | 'review'
  | 'interview';

interface TutorMessage {
  id: number;
  sender: 'user' | 'assistant';
  content: string;
  hint?: string;
}

const tutorModes: {
  id: TutorMode;
  label: string;
}[] = [
  {
    id: 'guided',
    label: 'Guided Learning',
  },
  {
    id: 'concept',
    label: 'Explain Concept',
  },
  {
    id: 'review',
    label: 'Review My Work',
  },
  {
    id: 'interview',
    label: 'Interview Style',
  },
];

/*
 * TEMPORARY UI CONTENT ONLY.
 *
 * These messages exist only so the approved C14 screen can
 * be developed visually.
 *
 * During backend integration:
 * - load the real tutor conversation;
 * - send real project/learning context;
 * - use the existing Accelerator AI Tutor backend;
 * - remove these temporary messages.
 */
const initialMessages: TutorMessage[] = [
  {
    id: 1,
    sender: 'assistant',
    content:
      'Hi Manoj 👋\nI can help you understand the project, concepts and next steps.',
  },
  {
    id: 2,
    sender: 'user',
    content:
      'How can I design the ER diagram?',
  },
  {
    id: 3,
    sender: 'assistant',
    content:
      'Start by identifying the main business entities for this project. For the Sales Management System, think about:\n\n• Customer\n• Product\n• Order\n• Order Item\n\nThen determine how they relate. For example, one customer can have many orders, and one order can have many order items.',
    hint:
      'One customer can have many orders.',
  },
];

export const AITutorPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [mode, setMode] =
    useState<TutorMode>('guided');

  const [messages, setMessages] =
    useState<TutorMessage[]>(
      initialMessages,
    );

  const [question, setQuestion] =
    useState('');

  const [isSending, setIsSending] =
    useState(false);

  const navigateToScreen = (
    screen: string,
  ) => {
    const params =
      new URLSearchParams(
        searchParams,
      );

    params.set('screen', screen);

    setSearchParams(params);
  };

  const handleBack = () => {
    navigateToScreen('project');
  };

  const handleResources = () => {
    navigateToScreen(
      'project-resources',
    );
  };

  /*
   * FRONTEND-ONLY SEND BEHAVIOUR.
   *
   * We add only the user's message locally.
   * We intentionally do NOT fabricate an AI answer.
   *
   * The real backend response will be connected later.
   */
  const handleSend = () => {
    const trimmed =
      question.trim();

    if (!trimmed || isSending) {
      return;
    }

    setIsSending(true);

    setMessages((previous) => [
      ...previous,
      {
        id: Date.now(),
        sender: 'user',
        content: trimmed,
      },
    ]);

    setQuestion('');

    window.setTimeout(() => {
      setIsSending(false);
    }, 400);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
  ) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSend();
    }
  };

  const applyQuickQuestion = (
    value: string,
  ) => {
    setQuestion(value);
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
      {/* =========================
          HERO
      ========================== */}

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
            'linear-gradient(115deg, #075fbd 0%, #3944df 52%, #8a00f5 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            right: -70,
            top: -180,
            bgcolor:
              'rgba(255,255,255,0.08)',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: '50%',
            right: 190,
            bottom: -120,
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
              fontWeight: 800,
            }}
          >
            👑 Premium
          </Box>
        </Stack>

        <Typography
          sx={{
            position: 'relative',
            mt: 0.6,
            maxWidth: 850,
            color:
              'rgba(255,255,255,0.92)',
            fontSize: {
              xs: '0.84rem',
              md: '0.95rem',
            },
          }}
        >
          Your personalized,
          AI-powered journey from your
          current skills to your next
          dream role.
        </Typography>
      </Box>

      {/* =========================
          PAGE HEADER
      ========================== */}

      <Box
        sx={{
          mt: 1.4,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg:
              'minmax(0, 1fr) auto',
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
            spacing={1.2}
            alignItems="center"
            sx={{
              mt: 0.4,
            }}
          >
            <Box
              sx={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                bgcolor: '#f2e9ff',
                color: '#7522e8',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <PsychologyRoundedIcon
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
                    xs: '1.6rem',
                    md: '2rem',
                  },
                  fontWeight: 900,
                  lineHeight: 1.05,
                  letterSpacing:
                    '-0.035em',
                }}
              >
                AI Tutor
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  color: '#536078',
                  fontSize: '0.82rem',
                }}
              >
                Get personalized
                guidance without directly
                giving away the solution.
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
          <HeaderModeButton
            active
            icon={
              <PsychologyRoundedIcon />
            }
            label="AI Tutor"
          />

          <HeaderModeButton
            icon={
              <MenuBookRoundedIcon />
            }
            label="Learning Resources"
            onClick={handleResources}
          />
        </Stack>
      </Box>

      {/* =========================
          MAIN WORKSPACE
      ========================== */}

      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg:
              '300px minmax(0, 1fr)',
          },
          gap: 2,
          alignItems: 'stretch',
        }}
      >
        {/* =========================
            LEFT CONTEXT
        ========================== */}

        <Box sx={cardSx}>
          <Stack
            direction="row"
            spacing={0.8}
            alignItems="center"
          >
            <FlagOutlinedIcon
              sx={{
                color: '#1269ef',
              }}
            />

            <Typography
              sx={{
                color: '#111a38',
                fontSize: '1.05rem',
                fontWeight: 900,
              }}
            >
              Current Context
            </Typography>
          </Stack>

          <Divider sx={{ my: 1.2 }} />

          <ContextSection
            icon={
              <StorageRoundedIcon />
            }
            title="Virtual Project"
          >
            <Typography
              sx={contextValueSx}
            >
              Sales Management System
            </Typography>
          </ContextSection>

          <Divider sx={{ my: 1.2 }} />

          <ContextSection
            icon={
              <FlagOutlinedIcon />
            }
            title="Current Milestone"
          >
            <Box
              sx={{
                mt: 0.5,
                px: 1.1,
                py: 0.65,
                borderRadius: 2,
                bgcolor: '#fff2cf',
              }}
            >
              <Typography
                sx={{
                  color: '#17213b',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                }}
              >
                2. Database Design
              </Typography>
            </Box>
          </ContextSection>

          <Divider sx={{ my: 1.2 }} />

          <ContextSection
            icon={
              <TaskAltRoundedIcon />
            }
            title="Current Tasks"
          >
            <Stack
              spacing={0.8}
              sx={{ mt: 0.7 }}
            >
              <TaskRow
                completed
                label="Create an ER diagram with entities, attributes and relationships."
              />

              <TaskRow
                label="List all tables with primary keys, foreign keys and brief descriptions."
              />
            </Stack>
          </ContextSection>

          <Divider sx={{ my: 1.2 }} />

          <ContextSection
            icon={
              <DataObjectRoundedIcon />
            }
            title="Skills Involved"
          >
            <Stack
              direction="row"
              spacing={0.5}
              useFlexGap
              flexWrap="wrap"
              sx={{ mt: 0.7 }}
            >
              {[
                'SQL',
                'Database Design',
                'Normalization',
              ].map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  size="small"
                  sx={{
                    bgcolor: '#edf0ff',
                    color: '#26358d',
                    fontWeight: 800,
                    fontSize: '0.66rem',
                  }}
                />
              ))}
            </Stack>
          </ContextSection>

          <Divider sx={{ my: 1.2 }} />

          <ContextSection
            icon={
              <PsychologyRoundedIcon />
            }
            title="Tutor Mode"
          >
            <Stack
              spacing={0.3}
              sx={{
                mt: 0.6,
              }}
            >
              {tutorModes.map(
                (item) => (
                  <TutorModeRow
                    key={item.id}
                    active={
                      mode === item.id
                    }
                    label={item.label}
                    onClick={() =>
                      setMode(item.id)
                    }
                  />
                ),
              )}
            </Stack>
          </ContextSection>
        </Box>

        {/* =========================
            CHAT
        ========================== */}

        <Box
          sx={{
            ...cardSx,
            p: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: {
              xs: 620,
              md: 660,
            },
          }}
        >
          {/* CHAT HEADER */}

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            justifyContent="space-between"
            alignItems={{
              xs: 'flex-start',
              sm: 'center',
            }}
            spacing={1}
            sx={{
              px: {
                xs: 1.4,
                md: 1.8,
              },
              py: 1.2,
              borderBottom:
                '1px solid #dce3ee',
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: '#f1e9ff',
                  color: '#7424e8',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <PsychologyRoundedIcon />
              </Box>

              <Box>
                <Typography
                  sx={{
                    color: '#111a38',
                    fontSize: '1rem',
                    fontWeight: 900,
                  }}
                >
                  CareerHarbor AI Tutor
                </Typography>

                <Typography
                  sx={{
                    color: '#758096',
                    fontSize: '0.67rem',
                  }}
                >
                  {getModeDescription(
                    mode,
                  )}
                </Typography>
              </Box>
            </Stack>

            <Chip
              icon={
                <CheckCircleRoundedIcon />
              }
              label="Project Context Active"
              size="small"
              sx={{
                bgcolor: '#e7f8e9',
                color: '#16752b',
                fontWeight: 850,
                '& .MuiChip-icon': {
                  color: '#16a334',
                },
              }}
            />
          </Stack>

          {/* MESSAGES */}

          <Box
            sx={{
              flex: 1,
              px: {
                xs: 1.2,
                md: 2,
              },
              py: 1.5,
              bgcolor: '#fff',
              overflowY: 'auto',
            }}
          >
            <Stack spacing={1.5}>
              {messages.map(
                (message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onExplainMore={() =>
                      applyQuickQuestion(
                        'Please explain this in more detail.',
                      )
                    }
                    onAnotherHint={() =>
                      applyQuickQuestion(
                        'Give me another hint without giving me the full solution.',
                      )
                    }
                    onShowExample={() =>
                      applyQuickQuestion(
                        'Show me a simple example so I can understand the concept.',
                      )
                    }
                  />
                ),
              )}

              {isSending && (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    color: '#68748a',
                  }}
                >
                  <CircularProgress
                    size={17}
                  />

                  <Typography
                    sx={{
                      fontSize:
                        '0.72rem',
                    }}
                  >
                    Preparing tutor
                    request...
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>

          {/* COMPOSER */}

          <Box
            sx={{
              px: {
                xs: 1,
                md: 1.5,
              },
              py: 1.2,
              borderTop:
                '1px solid #dce3ee',
              bgcolor: '#fbfcff',
            }}
          >
            <Stack
              direction="row"
              spacing={0.8}
              alignItems="flex-end"
            >
              <IconButton
                aria-label="Attach work"
                sx={{
                  width: 44,
                  height: 44,
                  border:
                    '1px solid #d5ddea',
                  bgcolor: '#fff',
                }}
              >
                <DescriptionOutlinedIcon />
              </IconButton>

              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={question}
                onChange={(event) =>
                  setQuestion(
                    event.target.value,
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                placeholder="Type your question..."
                sx={{
                  '& .MuiOutlinedInput-root':
                    {
                      minHeight: 44,
                      borderRadius: 2.5,
                      bgcolor: '#fff',
                      fontSize:
                        '0.82rem',
                    },
                }}
              />

              <Button
                variant="contained"
                endIcon={
                  <SendRoundedIcon />
                }
                disabled={
                  !question.trim() ||
                  isSending
                }
                onClick={handleSend}
                sx={{
                  minWidth: {
                    xs: 52,
                    sm: 115,
                  },
                  minHeight: 44,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 900,
                  boxShadow: 'none',
                  background:
                    'linear-gradient(90deg, #1269ef 0%, #075cff 100%)',
                }}
              >
                <Box
                  component="span"
                  sx={{
                    display: {
                      xs: 'none',
                      sm: 'inline',
                    },
                  }}
                >
                  Send
                </Box>
              </Button>
            </Stack>

            <Typography
              sx={{
                mt: 0.65,
                color: '#8a94a7',
                fontSize: '0.62rem',
                textAlign: 'center',
              }}
            >
              AI Tutor can make
              mistakes. Use guidance to
              learn and verify your work.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* =========================
          QUICK ACTIONS
      ========================== */}

      <Box
        sx={{
          mt: 2,
          mb: 2,
          border:
            '1px solid #b8c9ff',
          borderRadius: 3,
          p: {
            xs: 1.2,
            md: 1.5,
          },
          background:
            'linear-gradient(100deg, #f6f9ff 0%, #fbf7ff 100%)',
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg:
              '190px minmax(0, 1fr)',
          },
          gap: 1.2,
          alignItems: 'center',
        }}
      >
        <Stack
          direction="row"
          spacing={0.8}
          alignItems="center"
        >
          <AutoAwesomeRoundedIcon
            sx={{
              color: '#ef9b00',
              fontSize: 31,
            }}
          />

          <Typography
            sx={{
              color: '#111a38',
              fontSize: '1rem',
              fontWeight: 900,
            }}
          >
            Quick Actions
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              xl:
                'repeat(4, minmax(0, 1fr))',
            },
            gap: 0.8,
          }}
        >
          <QuickAction
            icon={
              <LightbulbOutlinedIcon />
            }
            label="Give me a hint"
            onClick={() =>
              applyQuickQuestion(
                'Give me a hint for my current task without giving me the full answer.',
              )
            }
          />

          <QuickAction
            icon={
              <MenuBookRoundedIcon />
            }
            label="Explain this concept"
            onClick={() =>
              applyQuickQuestion(
                'Explain the current concept in simple terms with an example.',
              )
            }
          />

          <QuickAction
            icon={
              <SearchRoundedIcon />
            }
            label="Review my work"
            onClick={() => {
              setMode('review');
              applyQuickQuestion(
                'Review my current work and tell me what I should improve.',
              );
            }}
          />

          <QuickAction
            icon={
              <HelpOutlineRoundedIcon />
            }
            label="What should I do next?"
            onClick={() =>
              applyQuickQuestion(
                'Based on my current project progress, what should I do next?',
              )
            }
          />
        </Box>
      </Box>
    </Box>
  );
};

/* =========================================
   CONTEXT SECTION
========================================= */

interface ContextSectionProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

const ContextSection = ({
  icon,
  title,
  children,
}: ContextSectionProps) => (
  <Box>
    <Stack
      direction="row"
      spacing={0.7}
      alignItems="center"
    >
      <Box
        sx={{
          color: '#5f23e5',
          display: 'grid',
          placeItems: 'center',
          '& svg': {
            fontSize: 23,
          },
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          color: '#111a38',
          fontSize: '0.82rem',
          fontWeight: 900,
        }}
      >
        {title}
      </Typography>
    </Stack>

    {children}
  </Box>
);

/* =========================================
   TASK
========================================= */

interface TaskRowProps {
  completed?: boolean;
  label: string;
}

const TaskRow = ({
  completed = false,
  label,
}: TaskRowProps) => (
  <Stack
    direction="row"
    spacing={0.7}
    alignItems="flex-start"
  >
    {completed ? (
      <CheckCircleRoundedIcon
        sx={{
          color: '#15aa31',
          fontSize: 19,
          mt: 0.05,
          flexShrink: 0,
        }}
      />
    ) : (
      <Box
        sx={{
          width: 17,
          height: 17,
          border:
            '1.5px solid #8f9bad',
          borderRadius: 0.7,
          mt: 0.1,
          flexShrink: 0,
        }}
      />
    )}

    <Typography
      sx={{
        color: '#26324a',
        fontSize: '0.7rem',
        lineHeight: 1.4,
      }}
    >
      {label}
    </Typography>
  </Stack>
);

/* =========================================
   TUTOR MODE
========================================= */

interface TutorModeRowProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

const TutorModeRow = ({
  active,
  label,
  onClick,
}: TutorModeRowProps) => (
  <Button
    onClick={onClick}
    startIcon={
      active ? (
        <RadioButtonCheckedRoundedIcon />
      ) : (
        <RadioButtonUncheckedRoundedIcon />
      )
    }
    sx={{
      justifyContent: 'flex-start',
      minHeight: 34,
      px: 1,
      borderRadius: 2,
      color: active
        ? '#3519b6'
        : '#28334a',
      bgcolor: active
        ? '#eee5ff'
        : 'transparent',
      textTransform: 'none',
      fontSize: '0.75rem',
      fontWeight: active
        ? 900
        : 700,
      '& .MuiButton-startIcon': {
        color: active
          ? '#6525e8'
          : '#8e99aa',
      },
      '&:hover': {
        bgcolor: active
          ? '#e8dcff'
          : '#f5f7fa',
      },
    }}
  >
    {label}
  </Button>
);

/* =========================================
   CHAT MESSAGE
========================================= */

interface ChatMessageProps {
  message: TutorMessage;
  onExplainMore: () => void;
  onAnotherHint: () => void;
  onShowExample: () => void;
}

const ChatMessage = ({
  message,
  onExplainMore,
  onAnotherHint,
  onShowExample,
}: ChatMessageProps) => {
  const assistant =
    message.sender === 'assistant';

  return (
    <Box>
      <Stack
        direction="row"
        spacing={0.8}
        justifyContent={
          assistant
            ? 'flex-start'
            : 'flex-end'
        }
        alignItems="flex-start"
      >
        {assistant && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: '#f0e8ff',
              color: '#7523e8',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <PsychologyRoundedIcon
              sx={{
                fontSize: 22,
              }}
            />
          </Box>
        )}

        <Box
          sx={{
            maxWidth: {
              xs: '88%',
              md: '78%',
            },
            px: 1.5,
            py: 1,
            borderRadius: assistant
              ? '4px 16px 16px 16px'
              : '16px 4px 16px 16px',
            bgcolor: assistant
              ? '#f1effb'
              : '#dcecff',
          }}
        >
          <Typography
            sx={{
              whiteSpace: 'pre-line',
              color: '#111a38',
              fontSize: '0.78rem',
              lineHeight: 1.55,
            }}
          >
            {message.content}
          </Typography>
        </Box>

        {!assistant && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: '#e7f2ff',
              color: '#0868e8',
              display: 'grid',
              placeItems: 'center',
              fontSize: '0.7rem',
              fontWeight: 900,
              flexShrink: 0,
            }}
          >
            MS
          </Box>
        )}
      </Stack>

      {assistant &&
        message.hint && (
          <>
            <Box
              sx={{
                ml: {
                  xs: 0,
                  sm: 5.5,
                },
                mt: 0.8,
                px: 1.3,
                py: 0.9,
                maxWidth: 650,
                borderRadius: 2,
                bgcolor: '#fff1bd',
                display: 'flex',
                gap: 0.8,
                alignItems: 'center',
              }}
            >
              <LightbulbOutlinedIcon
                sx={{
                  color: '#e99500',
                }}
              />

              <Typography
                sx={{
                  color: '#533d00',
                  fontSize: '0.75rem',
                }}
              >
                <Box
                  component="span"
                  sx={{
                    color: '#bf5a00',
                    fontWeight: 900,
                  }}
                >
                  Hint:{' '}
                </Box>

                {message.hint}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={0.7}
              useFlexGap
              flexWrap="wrap"
              sx={{
                ml: {
                  xs: 0,
                  sm: 5.5,
                },
                mt: 0.8,
              }}
            >
              <MessageAction
                icon={
                  <MenuBookRoundedIcon />
                }
                label="Explain more"
                onClick={
                  onExplainMore
                }
              />

              <MessageAction
                icon={
                  <LightbulbOutlinedIcon />
                }
                label="Give another hint"
                onClick={
                  onAnotherHint
                }
              />

              <MessageAction
                icon={
                  <CodeRoundedIcon />
                }
                label="Show example"
                onClick={
                  onShowExample
                }
              />
            </Stack>
          </>
        )}
    </Box>
  );
};

/* =========================================
   MESSAGE ACTION
========================================= */

interface MessageActionProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

const MessageAction = ({
  icon,
  label,
  onClick,
}: MessageActionProps) => (
  <Button
    variant="outlined"
    startIcon={icon}
    onClick={onClick}
    size="small"
    sx={{
      minHeight: 34,
      borderRadius: 2.3,
      borderColor: '#7a35ef',
      color: '#4320c8',
      textTransform: 'none',
      fontSize: '0.69rem',
      fontWeight: 850,
    }}
  >
    {label}
  </Button>
);

/* =========================================
   QUICK ACTION
========================================= */

interface QuickActionProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

const QuickAction = ({
  icon,
  label,
  onClick,
}: QuickActionProps) => (
  <Button
    variant="outlined"
    startIcon={icon}
    onClick={onClick}
    sx={{
      minHeight: 43,
      borderRadius: 3,
      borderColor: '#7433ef',
      color: '#3419bb',
      bgcolor: '#fff',
      textTransform: 'none',
      fontSize: '0.72rem',
      fontWeight: 900,
      '&:hover': {
        borderColor: '#5520dc',
        bgcolor: '#f7f3ff',
      },
    }}
  >
    {label}
  </Button>
);

/* =========================================
   HEADER MODE
========================================= */

interface HeaderModeButtonProps {
  active?: boolean;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

const HeaderModeButton = ({
  active = false,
  icon,
  label,
  onClick,
}: HeaderModeButtonProps) => (
  <Button
    startIcon={icon}
    onClick={onClick}
    sx={{
      minWidth: {
        xs: 160,
        md: 205,
      },
      minHeight: 47,
      borderRadius: 2.3,
      color: active
        ? '#fff'
        : '#17213b',
      bgcolor: active
        ? '#5e24e8'
        : '#f8f9fc',
      textTransform: 'none',
      fontWeight: 900,
      '&:hover': {
        bgcolor: active
          ? '#4c1bd0'
          : '#eef2f8',
      },
    }}
  >
    {label}
  </Button>
);

/* =========================================
   MODE DESCRIPTION
========================================= */

const getModeDescription = (
  mode: TutorMode,
) => {
  switch (mode) {
    case 'guided':
      return 'Guided learning with hints and step-by-step support.';

    case 'concept':
      return 'Understand concepts with clear explanations and examples.';

    case 'review':
      return 'Review your work and identify improvements.';

    case 'interview':
      return 'Practice by answering tutor-led interview questions.';

    default:
      return '';
  }
};

const cardSx = {
  border: '1px solid #dce3ee',
  borderRadius: 3,
  bgcolor: '#fff',
  p: {
    xs: 1.4,
    md: 1.6,
  },
};

const contextValueSx = {
  mt: 0.35,
  ml: 3.6,
  color: '#111a38',
  fontSize: '0.78rem',
  fontWeight: 900,
};