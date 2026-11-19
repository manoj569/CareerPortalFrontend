import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';

import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SentimentSatisfiedAltOutlinedIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';

type ConversationFilter = 'all' | 'unread' | 'archived';

type Conversation = {
  id: number;
  candidateId: number;
  initials: string;
  name: string;
  role: string;
  applicationId: string;
  preview: string;
  time: string;
  unread: number;
  archived?: boolean;
};

type Message = {
  id: number;
  sender: 'candidate' | 'recruiter';
  text: string;
  time: string;
};

const conversations: Conversation[] = [
  {
    id: 1,
    candidateId: 1,
    initials: 'PD',
    name: 'Priya Deshmukh',
    role: 'Senior Frontend Developer',
    applicationId: 'APP-10456',
    preview: 'Thanks for the interview today!...',
    time: '11:24 AM',
    unread: 1,
  },
  {
    id: 2,
    candidateId: 2,
    initials: 'RS',
    name: 'Rohit Sharma',
    role: '.NET Developer',
    applicationId: 'APP-10442',
    preview: 'Could you please share the assessment...',
    time: '10:02 AM',
    unread: 1,
  },
  {
    id: 3,
    candidateId: 3,
    initials: 'AG',
    name: 'Ananya Gupta',
    role: 'Product Manager',
    applicationId: 'APP-10431',
    preview: "I'm available for the next round...",
    time: '9:45 AM',
    unread: 1,
  },
  {
    id: 4,
    candidateId: 4,
    initials: 'VJ',
    name: 'Vikram Joshi',
    role: 'React Developer',
    applicationId: 'APP-10418',
    preview: 'The take-home assignment is completed...',
    time: 'Yesterday',
    unread: 0,
  },
  {
    id: 5,
    candidateId: 5,
    initials: 'MN',
    name: 'Meera Nair',
    role: 'UI/UX Designer',
    applicationId: 'APP-10402',
    preview: 'Can we reschedule the interview?',
    time: 'Yesterday',
    unread: 0,
  },
  {
    id: 6,
    candidateId: 6,
    initials: 'KP',
    name: 'Karan Patel',
    role: 'Backend Developer',
    applicationId: 'APP-10391',
    preview: 'I have submitted the requested document...',
    time: 'Jan 26',
    unread: 0,
  },
  {
    id: 7,
    candidateId: 7,
    initials: 'AK',
    name: 'Aarav Kulkarni',
    role: 'QA Engineer',
    applicationId: 'APP-10372',
    preview: 'Thank you for the update.',
    time: 'Jan 24',
    unread: 0,
    archived: true,
  },
];

const initialMessages: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      sender: 'candidate',
      text:
        'Hi,\nThanks for the interview today! It was a great discussion. Could you please let me know the next steps and expected timeline?',
      time: '11:24 AM',
    },
    {
      id: 2,
      sender: 'recruiter',
      text:
        'Hi Priya,\n\nThanks for your time today. We are reviewing the feedback and will update you within 2–3 business days. In the meantime, let me know if you have any questions.',
      time: '11:32 AM',
    },
    {
      id: 3,
      sender: 'candidate',
      text:
        'Sounds good. Looking forward to the update!\n\nThanks.',
      time: '11:35 AM',
    },
  ],
  2: [
    {
      id: 1,
      sender: 'recruiter',
      text:
        'Hi Rohit, we have moved your application to the assessment stage. Please complete the assessment using the link shared with you.',
      time: 'Yesterday',
    },
    {
      id: 2,
      sender: 'candidate',
      text:
        'Could you please share the assessment deadline?',
      time: '10:02 AM',
    },
  ],
  3: [
    {
      id: 1,
      sender: 'recruiter',
      text:
        'Hi Ananya, we would like to schedule your next interview round.',
      time: 'Yesterday',
    },
    {
      id: 2,
      sender: 'candidate',
      text:
        "I'm available for the next round tomorrow afternoon.",
      time: '9:45 AM',
    },
  ],
};

export const EmployerMessagesPage = () => {
  const navigate = useNavigate();

  const [filter, setFilter] =
    useState<ConversationFilter>('all');

  const [search, setSearch] = useState('');

  const [selectedId, setSelectedId] =
    useState(1);

  const [draft, setDraft] = useState('');

  const [messageStore, setMessageStore] =
    useState(initialMessages);

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();

    return conversations.filter((conversation) => {
      if (
        filter === 'unread' &&
        conversation.unread === 0
      ) {
        return false;
      }

      if (
        filter === 'archived' &&
        !conversation.archived
      ) {
        return false;
      }

      if (
        filter !== 'archived' &&
        conversation.archived
      ) {
        return false;
      }

      if (!term) return true;

      return (
        conversation.name
          .toLowerCase()
          .includes(term) ||
        conversation.role
          .toLowerCase()
          .includes(term) ||
        conversation.applicationId
          .toLowerCase()
          .includes(term)
      );
    });
  }, [filter, search]);

  const selectedConversation =
    conversations.find(
      (conversation) =>
        conversation.id === selectedId,
    ) ?? conversations[0];

  const selectedMessages =
    selectedConversation
      ? messageStore[selectedConversation.id] ??
        []
      : [];

  const sendMessage = () => {
    const value = draft.trim();

    if (!value || !selectedConversation) return;

    const message: Message = {
      id: Date.now(),
      sender: 'recruiter',
      text: value,
      time: 'Now',
    };

    setMessageStore((current) => ({
      ...current,
      [selectedConversation.id]: [
        ...(current[selectedConversation.id] ??
          []),
        message,
      ],
    }));

    setDraft('');

    /*
     * Frontend demo only.
     * Replace local state with the real Employer
     * Messaging API when backend integration begins.
     */
  };

  if (!selectedConversation) {
    return null;
  }

  return (
    <Box
      sx={{
        px: { xs: 1.5, md: 2 },
        py: 1.5,
        maxWidth: 1800,
        mx: 'auto',
      }}
    >
      {/* Breadcrumb */}
      <Stack
        direction="row"
        spacing={0.7}
        alignItems="center"
        sx={{ mb: 1.3 }}
      >
        <Typography sx={breadcrumb}>
          CareerHarbor
        </Typography>

        <Typography sx={breadcrumb}>
          /
        </Typography>

        <Typography
          sx={{
            ...breadcrumb,
            color: '#17233d',
            fontWeight: 900,
          }}
        >
          Messages
        </Typography>
      </Stack>

      {/* Hero */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #dddfff',
          borderRadius: '14px',
          px: { xs: 1.8, md: 2.4 },
          py: 1.7,
          background:
            'linear-gradient(110deg,#f7f5ff 0%,#eef3ff 55%,#eee9ff 100%)',
        }}
      >
        <Stack
          direction={{
            xs: 'column',
            md: 'row',
          }}
          justifyContent="space-between"
          alignItems={{
            xs: 'flex-start',
            md: 'center',
          }}
          spacing={1.3}
        >
          <Stack
            direction="row"
            spacing={1.3}
            alignItems="center"
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '11px',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  'linear-gradient(135deg,#1674f6,#7a42ed)',
              }}
            >
              <EmailOutlinedIcon
                sx={{ fontSize: 26 }}
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: {
                    xs: '1.15rem',
                    md: '1.4rem',
                  },
                  fontWeight: 950,
                  color: '#101d3c',
                }}
              >
                Messages
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  fontSize: '0.68rem',
                  color: '#425477',
                }}
              >
                Manage conversations with
                candidates, schedule interviews,
                and share hiring updates.
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            sx={{
              minHeight: 40,
              px: 1.7,
              borderRadius: '8px',
              bgcolor: '#1261e8',
              boxShadow: 'none',
              textTransform: 'none',
              fontSize: '0.62rem',
              fontWeight: 900,

              '&:hover': {
                bgcolor: '#0758ce',
                boxShadow: 'none',
              },
            }}
          >
            New Message
          </Button>
        </Stack>
      </Paper>

      {/* Messages workspace */}
      <Box
        sx={{
          mt: 1.3,
          height: {
            xs: 'auto',
            xl: 'calc(100vh - 205px)',
          },
          minHeight: {
            xl: 620,
          },
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '330px minmax(0,1fr)',
            xl: '360px minmax(0,1fr) 330px',
          },
          gap: 1.2,
        }}
      >
        {/* Conversations */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #dfe6ef',
            borderRadius: '13px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ p: 1.2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search conversations..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon
                      sx={{
                        fontSize: 18,
                        color: '#53657e',
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 40,
                  borderRadius: '8px',
                  fontSize: '0.62rem',
                },
              }}
            />
          </Box>

          <Tabs
            value={filter}
            onChange={(
              _,
              value: ConversationFilter,
            ) => setFilter(value)}
            variant="fullWidth"
            sx={conversationTabs}
          >
            <Tab
              value="all"
              label="All (12)"
            />

            <Tab
              value="unread"
              label="Unread (3)"
            />

            <Tab
              value="archived"
              label="Archived"
            />
          </Tabs>

          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
            }}
          >
            {filteredConversations.map(
              (conversation) => (
                <ConversationRow
                  key={conversation.id}
                  conversation={conversation}
                  selected={
                    selectedId ===
                    conversation.id
                  }
                  onClick={() =>
                    setSelectedId(
                      conversation.id,
                    )
                  }
                />
              ),
            )}

            {filteredConversations.length ===
              0 && (
              <Box
                sx={{
                  p: 3,
                  textAlign: 'center',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.62rem',
                    color: '#7a8799',
                  }}
                >
                  No conversations found.
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Chat */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #dfe6ef',
            borderRadius: '13px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: {
              xs: 620,
              xl: 0,
            },
          }}
        >
          {/* Chat header */}
          <Box
            sx={{
              px: 1.5,
              py: 1.1,
              minHeight: 68,
              borderBottom:
                '1px solid #e1e7ef',
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                'space-between',
              gap: 1,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              minWidth={0}
            >
              <Avatar
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: '#e9e5ff',
                  color: '#6033d4',
                  fontSize: '0.72rem',
                  fontWeight: 950,
                }}
              >
                {
                  selectedConversation.initials
                }
              </Avatar>

              <Box minWidth={0}>
                <Typography
                  sx={{
                    fontSize: '0.83rem',
                    fontWeight: 950,
                    color: '#17233d',
                  }}
                >
                  {selectedConversation.name}
                </Typography>

                <Typography
                  noWrap
                  sx={{
                    mt: 0.1,
                    fontSize: '0.55rem',
                    color: '#53657e',
                  }}
                >
                  {selectedConversation.role}
                  {'  •  '}
                  {
                    selectedConversation.applicationId
                  }
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={0.2}
            >
              <IconButton size="small">
                <CallOutlinedIcon
                  sx={{ fontSize: 19 }}
                />
              </IconButton>

              <IconButton size="small">
                <VideoCameraFrontOutlinedIcon
                  sx={{ fontSize: 20 }}
                />
              </IconButton>

              <IconButton size="small">
                <InfoOutlinedIcon
                  sx={{ fontSize: 20 }}
                />
              </IconButton>

              <IconButton size="small">
                <MoreVertOutlinedIcon
                  sx={{ fontSize: 20 }}
                />
              </IconButton>
            </Stack>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: {
                xs: 1.2,
                md: 1.7,
              },
              bgcolor: '#fff',
            }}
          >
            <Typography
              sx={{
                mb: 1.5,
                textAlign: 'center',
                fontSize: '0.58rem',
                fontWeight: 850,
                color: '#52627a',
              }}
            >
              Today
            </Typography>

            {selectedMessages.length ===
              0 && (
              <Box
                sx={{
                  py: 6,
                  textAlign: 'center',
                }}
              >
                <EmailOutlinedIcon
                  sx={{
                    fontSize: 34,
                    color: '#c2ccda',
                  }}
                />

                <Typography
                  sx={{
                    mt: 0.7,
                    fontSize: '0.63rem',
                    fontWeight: 850,
                    color: '#53657e',
                  }}
                >
                  Start the conversation
                </Typography>

                <Typography
                  sx={{
                    mt: 0.25,
                    fontSize: '0.54rem',
                    color: '#8a96a8',
                  }}
                >
                  As the recruiter, you can
                  initiate communication with
                  this candidate.
                </Typography>
              </Box>
            )}

            <Stack spacing={1.3}>
              {selectedMessages.map(
                (message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    initials={
                      selectedConversation.initials
                    }
                  />
                ),
              )}
            </Stack>
          </Box>

          {/* Composer */}
          <Box
            sx={{
              px: 1.2,
              py: 1,
              borderTop:
                '1px solid #e1e7ef',
              bgcolor: '#fff',
            }}
          >
            <Stack
              direction="row"
              spacing={0.7}
              alignItems="center"
            >
              <IconButton
                size="small"
                sx={{
                  color: '#344861',
                }}
              >
                <AttachFileOutlinedIcon
                  sx={{ fontSize: 20 }}
                />
              </IconButton>

              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={draft}
                onChange={(event) =>
                  setDraft(
                    event.target.value,
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                      >
                        <SentimentSatisfiedAltOutlinedIcon
                          sx={{
                            fontSize: 19,
                          }}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 42,
                    borderRadius: '9px',
                    fontSize: '0.62rem',
                  },
                }}
              />

              <IconButton
                onClick={sendMessage}
                disabled={!draft.trim()}
                sx={{
                  width: 43,
                  height: 43,
                  borderRadius: '8px',
                  bgcolor: '#1261e8',
                  color: '#fff',

                  '&:hover': {
                    bgcolor: '#0758ce',
                  },

                  '&.Mui-disabled': {
                    bgcolor: '#d8e3f5',
                    color: '#8ca1c1',
                  },
                }}
              >
                <SendRoundedIcon
                  sx={{ fontSize: 20 }}
                />
              </IconButton>
            </Stack>
          </Box>
        </Paper>

        {/* Details */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #dfe6ef',
            borderRadius: '13px',
            overflow: 'hidden',
            display: {
              xs: 'block',
              lg: 'none',
              xl: 'block',
            },
          }}
        >
          <Box sx={{ p: 1.4 }}>
            <Typography sx={sectionTitle}>
              Conversation Details
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mt: 1.3 }}
            >
              <Avatar
                sx={{
                  width: 55,
                  height: 55,
                  bgcolor: '#e9e5ff',
                  color: '#6033d4',
                  fontSize: '0.8rem',
                  fontWeight: 950,
                }}
              >
                {
                  selectedConversation.initials
                }
              </Avatar>

              <Box minWidth={0}>
                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    fontWeight: 950,
                    color: '#17233d',
                  }}
                >
                  {selectedConversation.name}
                </Typography>

                <Typography
                  noWrap
                  sx={detailSecondary}
                >
                  priya.deshmukh@gmail.com
                </Typography>

                <Typography
                  sx={{
                    ...detailSecondary,
                    mt: 0.25,
                    fontWeight: 850,
                    color: '#263750',
                  }}
                >
                  +91 98765 43210
                </Typography>
              </Box>
            </Stack>

            <Button
              fullWidth
              variant="outlined"
              startIcon={
                <OpenInNewOutlinedIcon />
              }
              onClick={() =>
                navigate(
                  `/employer/candidates/${selectedConversation.candidateId}`,
                )
              }
              sx={{
                mt: 1.2,
                minHeight: 38,
                borderRadius: '7px',
                borderColor: '#ccd7e5',
                textTransform: 'none',
                fontSize: '0.58rem',
                fontWeight: 900,
              }}
            >
              View Profile
            </Button>
          </Box>

          <Divider />

          <Box sx={{ p: 1.4 }}>
            <Typography sx={sectionTitle}>
              Application Info
            </Typography>

            <Stack
              spacing={1.1}
              sx={{ mt: 1.2 }}
            >
              <DetailRow
                icon={
                  <DescriptionOutlinedIcon />
                }
                label="Applied For"
                value={
                  selectedConversation.role
                }
              />

              <DetailRow
                icon={
                  <DescriptionOutlinedIcon />
                }
                label="Application ID"
                value={
                  selectedConversation.applicationId
                }
              />

              <DetailRow
                icon={
                  <TrendingUpOutlinedIcon />
                }
                label="Current Stage"
                value="Interview"
              />

              <DetailRow
                icon={
                  <CalendarMonthOutlinedIcon />
                }
                label="Interview"
                value={
                  <>
                    Tue, 28 Jan 2025
                    <br />
                    11:00 AM – 12:00 PM
                  </>
                }
              />
            </Stack>
          </Box>

          <Divider />

          <Box sx={{ p: 1.4 }}>
            <Typography sx={sectionTitle}>
              Quick Actions
            </Typography>

            <Stack
              spacing={0.7}
              sx={{ mt: 1 }}
            >
              <QuickAction
                icon={
                  <CalendarMonthOutlinedIcon />
                }
                label="Schedule Interview"
                onClick={() =>
                  navigate(
                    '/employer/interviews',
                  )
                }
              />

              <QuickAction
                icon={
                  <DescriptionOutlinedIcon />
                }
                label="Share Document"
              />

              <QuickAction
                icon={
                  <TrendingUpOutlinedIcon />
                }
                label="Move to Next Stage"
                onClick={() =>
                  navigate(
                    '/employer/pipeline',
                  )
                }
              />
            </Stack>
          </Box>
        </Paper>
      </Box>

      <Typography
        sx={{
          mt: 0.7,
          fontSize: '0.58rem',
          color: '#7b8799',
        }}
      >
        Messaging is currently frontend demo
        data. For the production workflow,
        recruiters initiate conversations and
        candidates can reply only to authorized
        recruiter-created conversations.
      </Typography>
    </Box>
  );
};

/* ===========================
   CONVERSATION ROW
=========================== */

const ConversationRow = ({
  conversation,
  selected,
  onClick,
}: {
  conversation: Conversation;
  selected: boolean;
  onClick: () => void;
}) => (
  <Box
    onClick={onClick}
    sx={{
      px: 1.3,
      py: 1.05,
      cursor: 'pointer',
      borderBottom: '1px solid #edf1f5',
      bgcolor: selected
        ? '#eef4ff'
        : '#fff',

      '&:hover': {
        bgcolor: selected
          ? '#eef4ff'
          : '#f8fafc',
      },
    }}
  >
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
    >
      <Avatar
        sx={{
          width: 43,
          height: 43,
          bgcolor: '#e9e5ff',
          color: '#6033d4',
          fontSize: '0.67rem',
          fontWeight: 950,
        }}
      >
        {conversation.initials}
      </Avatar>

      <Box
        sx={{
          minWidth: 0,
          flex: 1,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={0.6}
        >
          <Typography
            noWrap
            sx={{
              fontSize: '0.65rem',
              fontWeight: 950,
              color: '#17233d',
            }}
          >
            {conversation.name}
          </Typography>

          <Typography
            sx={{
              flexShrink: 0,
              fontSize: '0.52rem',
              color: '#52627a',
            }}
          >
            {conversation.time}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={{ mt: 0.3 }}
        >
          <Typography
            noWrap
            sx={{
              flex: 1,
              fontSize: '0.55rem',
              color: '#52627a',
            }}
          >
            {conversation.preview}
          </Typography>

          {conversation.unread > 0 && (
            <Badge
              badgeContent={
                conversation.unread
              }
              color="error"
              sx={{
                mr: 0.8,

                '& .MuiBadge-badge': {
                  minWidth: 18,
                  height: 18,
                  fontSize: '0.48rem',
                  fontWeight: 900,
                },
              }}
            />
          )}
        </Stack>
      </Box>
    </Stack>
  </Box>
);

/* ===========================
   MESSAGE BUBBLE
=========================== */

const MessageBubble = ({
  message,
  initials,
}: {
  message: Message;
  initials: string;
}) => {
  const recruiter =
    message.sender === 'recruiter';

  return (
    <Stack
      direction="row"
      justifyContent={
        recruiter
          ? 'flex-end'
          : 'flex-start'
      }
      alignItems="flex-start"
      spacing={0.7}
    >
      {!recruiter && (
        <Avatar
          sx={{
            width: 34,
            height: 34,
            bgcolor: '#e9e5ff',
            color: '#6033d4',
            fontSize: '0.56rem',
            fontWeight: 950,
          }}
        >
          {initials}
        </Avatar>
      )}

      <Box
        sx={{
          maxWidth: {
            xs: '82%',
            md: '68%',
          },
        }}
      >
        <Box
          sx={{
            px: 1.2,
            py: 1,
            borderRadius: recruiter
              ? '12px 12px 3px 12px'
              : '12px 12px 12px 3px',
            bgcolor: recruiter
              ? '#1261e8'
              : '#eef2f6',
            color: recruiter
              ? '#fff'
              : '#17233d',
          }}
        >
          <Typography
            sx={{
              whiteSpace: 'pre-line',
              fontSize: '0.64rem',
              lineHeight: 1.55,
            }}
          >
            {message.text}
          </Typography>
        </Box>

        <Typography
          sx={{
            mt: 0.3,
            textAlign: recruiter
              ? 'right'
              : 'left',
            fontSize: '0.5rem',
            color: '#64748b',
          }}
        >
          {message.time}
          {recruiter && '  ✓✓'}
        </Typography>
      </Box>
    </Stack>
  );
};

/* ===========================
   DETAILS
=========================== */

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) => (
  <Stack
    direction="row"
    spacing={0.8}
    alignItems="flex-start"
  >
    <Box
      sx={{
        mt: 0.05,
        color: '#344861',
        display: 'flex',

        '& svg': {
          fontSize: 16,
        },
      }}
    >
      {icon}
    </Box>

    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        display: 'grid',
        gridTemplateColumns:
          '82px minmax(0,1fr)',
        gap: 0.5,
      }}
    >
      <Typography
        sx={{
          fontSize: '0.53rem',
          color: '#64748b',
        }}
      >
        {label}:
      </Typography>

      <Typography
        sx={{
          fontSize: '0.55rem',
          lineHeight: 1.5,
          fontWeight: 850,
          color: '#263750',
        }}
      >
        {value}
      </Typography>
    </Box>
  </Stack>
);

const QuickAction = ({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}) => (
  <Button
    fullWidth
    variant="outlined"
    startIcon={icon}
    onClick={onClick}
    sx={{
      justifyContent: 'center',
      minHeight: 38,
      borderRadius: '7px',
      borderColor: '#ccd7e5',
      color: '#0758ce',
      textTransform: 'none',
      fontSize: '0.57rem',
      fontWeight: 900,

      '& .MuiButton-startIcon svg': {
        fontSize: 16,
      },

      '&:hover': {
        borderColor: '#aebed3',
        bgcolor: '#f8fbff',
      },
    }}
  >
    {label}
  </Button>
);

/* ===========================
   STYLES
=========================== */

const breadcrumb = {
  fontSize: '0.65rem',
  color: '#64748b',
};

const sectionTitle = {
  fontSize: '0.76rem',
  fontWeight: 950,
  color: '#17233d',
};

const detailSecondary = {
  mt: 0.15,
  fontSize: '0.52rem',
  color: '#52627a',
};

const conversationTabs = {
  minHeight: 44,
  borderBottom: '1px solid #e5eaf1',

  '& .MuiTab-root': {
    minHeight: 44,
    px: 0.5,
    textTransform: 'none',
    fontSize: '0.57rem',
    fontWeight: 900,
    color: '#40516b',
  },

  '& .Mui-selected': {
    color: '#0758ce !important',
  },

  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: 3,
    bgcolor: '#1261e8',
  },
};

export default EmployerMessagesPage;