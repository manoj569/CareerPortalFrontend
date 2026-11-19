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

import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SentimentSatisfiedAltOutlinedIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';

type MessageFilter = 'all' | 'unread' | 'archived';

type Conversation = {
  id: number;
  company: string;
  initials: string;
  role: string;
  applicationId: string;
  preview: string;
  time: string;
  unread: number;
  archived?: boolean;
  logoText?: string;
  jobId: number;
};

type ChatMessage = {
  id: number;
  sender: 'company' | 'candidate';
  text: string;
  time: string;
};

const conversations: Conversation[] = [
  {
    id: 1,
    company: 'TechNova Solutions',
    initials: 'TN',
    role: 'Senior Frontend Developer',
    applicationId: 'APP-10456',
    preview: 'Interview update — We are reviewing...',
    time: '11:24 AM',
    unread: 1,
    jobId: 1,
  },
  {
    id: 2,
    company: 'HCLTech',
    initials: 'HCL',
    role: 'Software Engineer',
    applicationId: 'APP-10441',
    preview: 'Please complete the assessment by...',
    time: '10:02 AM',
    unread: 1,
    jobId: 2,
  },
  {
    id: 3,
    company: 'Deloitte',
    initials: 'D',
    role: 'AI/ML Analyst',
    applicationId: 'APP-10429',
    preview: 'Your next round is scheduled for...',
    time: '9:45 AM',
    unread: 1,
    jobId: 3,
  },
  {
    id: 4,
    company: 'Siemens',
    initials: 'S',
    role: 'Finance Operations Trainee',
    applicationId: 'APP-10408',
    preview: 'Thanks for sharing the documents.',
    time: 'Yesterday',
    unread: 0,
    jobId: 4,
  },
  {
    id: 5,
    company: 'PhonePe',
    initials: 'P',
    role: 'Company Secretary Intern',
    applicationId: 'APP-10398',
    preview: "We've received your application.",
    time: 'Yesterday',
    unread: 0,
    jobId: 5,
  },
  {
    id: 6,
    company: 'Infosys',
    initials: 'INF',
    role: '.NET Developer',
    applicationId: 'APP-10372',
    preview: 'Application status update — Shortlisted...',
    time: 'Jan 26',
    unread: 0,
    jobId: 6,
  },
  {
    id: 7,
    company: 'Archived Company',
    initials: 'AC',
    role: 'Software Developer',
    applicationId: 'APP-10291',
    preview: 'This conversation has been archived.',
    time: 'Jan 18',
    unread: 0,
    archived: true,
    jobId: 7,
  },
];

const initialMessages: Record<number, ChatMessage[]> = {
  1: [
    {
      id: 1,
      sender: 'company',
      text:
        'Hi Manoj,\n\nThanks for the interview today! We are reviewing the feedback and will update you within 2–3 business days regarding the next steps.',
      time: '11:24 AM',
    },
    {
      id: 2,
      sender: 'candidate',
      text:
        'Hi Team,\n\nThanks for the update. Please let me know if you need any additional information from my side.',
      time: '11:35 AM',
    },
    {
      id: 3,
      sender: 'company',
      text:
        'Sure, we will reach out in case we need anything else. Thanks!',
      time: '11:40 AM',
    },
  ],
  2: [
    {
      id: 1,
      sender: 'company',
      text:
        'Hi Manoj, your profile has been shortlisted for the assessment round. Please complete the assessment before the deadline mentioned in the email.',
      time: '10:02 AM',
    },
  ],
  3: [
    {
      id: 1,
      sender: 'company',
      text:
        'Hi Manoj, your next interview round has been scheduled. Please check your interview details and confirm your availability.',
      time: '9:45 AM',
    },
  ],
  4: [
    {
      id: 1,
      sender: 'company',
      text:
        'Thanks for sharing the requested documents. Our recruitment team will review them and update you.',
      time: 'Yesterday',
    },
  ],
  5: [
    {
      id: 1,
      sender: 'company',
      text:
        "We've received your application. We'll contact you if your profile is shortlisted for the next stage.",
      time: 'Yesterday',
    },
  ],
  6: [
    {
      id: 1,
      sender: 'company',
      text:
        'Your application has been shortlisted. Our recruitment team will contact you regarding the next step.',
      time: 'Jan 26',
    },
  ],
};

export const CandidateMessagesPage = () => {
  const navigate = useNavigate();

  const [filter, setFilter] =
    useState<MessageFilter>('all');

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(1);
  const [draft, setDraft] = useState('');

  const [messageStore, setMessageStore] =
    useState<Record<number, ChatMessage[]>>(
      initialMessages,
    );

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

      if (!term) {
        return true;
      }

      return (
        conversation.company
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

  const selectedMessages = selectedConversation
    ? messageStore[selectedConversation.id] ?? []
    : [];

  const sendMessage = () => {
    const value = draft.trim();

    if (!value || !selectedConversation) {
      return;
    }

    const message: ChatMessage = {
      id: Date.now(),
      sender: 'candidate',
      text: value,
      time: 'Now',
    };

    setMessageStore((current) => ({
      ...current,
      [selectedConversation.id]: [
        ...(current[selectedConversation.id] ?? []),
        message,
      ],
    }));

    setDraft('');

    /*
     * Frontend demo only.
     *
     * Production rule:
     * Candidate may reply only to an existing
     * recruiter-created conversation.
     *
     * Replace this local state update with the
     * real messaging API later.
     */
  };

  if (!selectedConversation) {
    return null;
  }

  return (
    <Box
      sx={{
        width: '100%',
        px: { xs: 1.5, md: 2 },
        py: 1.5,
      }}
    >
      {/* Hero */}
      <Paper
        elevation={0}
        sx={{
          px: { xs: 1.7, md: 2.2 },
          py: 1.6,
          border: '1px solid #e0ddff',
          borderRadius: '16px',
          background:
            'linear-gradient(110deg,#f8f6ff 0%,#f1f4ff 55%,#eee9ff 100%)',
        }}
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
              background:
                'linear-gradient(135deg,#246df2,#773fe9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <MessageIcon />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: {
                  xs: '1.15rem',
                  md: '1.4rem',
                },
                lineHeight: 1.2,
                fontWeight: 950,
                color: '#111d39',
              }}
            >
              Messages
            </Typography>

            <Typography
              sx={{
                mt: 0.25,
                fontSize: '0.68rem',
                color: '#425477',
              }}
            >
              Conversations from companies and
              recruiters about your applications,
              interviews, and next steps.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Workspace */}
      <Box
        sx={{
          mt: 1.3,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '330px minmax(0,1fr)',
            xl: '360px minmax(0,1fr) 330px',
          },
          gap: 1.2,
          minHeight: {
            xl: 'calc(100vh - 220px)',
          },
        }}
      >
        {/* Conversation list */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #dfe6ef',
            borderRadius: '13px',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 1.2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search messages..."
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
                  height: 41,
                  borderRadius: '9px',
                  fontSize: '0.62rem',
                },
              }}
            />
          </Box>

          <Tabs
            value={filter}
            onChange={(_, value: MessageFilter) =>
              setFilter(value)
            }
            variant="fullWidth"
            sx={conversationTabs}
          >
            <Tab value="all" label="All (6)" />

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
              maxHeight: {
                xs: 420,
                xl: 'calc(100vh - 335px)',
              },
              overflowY: 'auto',
            }}
          >
            {filteredConversations.map(
              (conversation) => (
                <ConversationRow
                  key={conversation.id}
                  conversation={conversation}
                  selected={
                    conversation.id === selectedId
                  }
                  onClick={() =>
                    setSelectedId(conversation.id)
                  }
                />
              ),
            )}

            {filteredConversations.length === 0 && (
              <Box
                sx={{
                  px: 2,
                  py: 5,
                  textAlign: 'center',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.64rem',
                    fontWeight: 800,
                    color: '#64748b',
                  }}
                >
                  No messages found.
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
            minHeight: 620,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Chat header */}
          <Box
            sx={{
              minHeight: 72,
              px: 1.5,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom:
                '1px solid #e1e7ef',
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              minWidth={0}
            >
              <CompanyAvatar
                conversation={selectedConversation}
                size={45}
              />

              <Box minWidth={0}>
                <Stack
                  direction="row"
                  spacing={0.4}
                  alignItems="center"
                >
                  <Typography
                    noWrap
                    sx={{
                      fontSize: '0.82rem',
                      fontWeight: 950,
                      color: '#17233d',
                    }}
                  >
                    {selectedConversation.company}
                  </Typography>

                  <VerifiedIcon
                    sx={{
                      flexShrink: 0,
                      fontSize: 16,
                      color: '#1261e8',
                    }}
                  />
                </Stack>

                <Typography
                  noWrap
                  sx={{
                    mt: 0.1,
                    fontSize: '0.55rem',
                    color: '#53657e',
                  }}
                >
                  {selectedConversation.role}
                  {'  •  Application: '}
                  {selectedConversation.applicationId}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={0.2}>
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

          {/* Chat content */}
          <Box
            sx={{
              flex: 1,
              p: {
                xs: 1.3,
                md: 1.7,
              },
              overflowY: 'auto',
            }}
          >
            <Typography
              sx={{
                mb: 1.5,
                textAlign: 'center',
                fontSize: '0.57rem',
                fontWeight: 850,
                color: '#52627a',
              }}
            >
              Today
            </Typography>

            {selectedMessages.length > 0 ? (
              <Stack spacing={1.4}>
                {selectedMessages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    message={message}
                    companyInitials={
                      selectedConversation.initials
                    }
                  />
                ))}
              </Stack>
            ) : (
              <EmptyConversation />
            )}
          </Box>

          {/* Reply composer */}
          <Box
            sx={{
              px: 1.2,
              py: 1,
              borderTop:
                '1px solid #e1e7ef',
            }}
          >
            <Stack
              direction="row"
              spacing={0.7}
              alignItems="center"
            >
              <IconButton size="small">
                <AttachFileOutlinedIcon
                  sx={{
                    fontSize: 21,
                    color: '#344861',
                  }}
                />
              </IconButton>

              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={draft}
                onChange={(event) =>
                  setDraft(event.target.value)
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
                      <IconButton size="small">
                        <SentimentSatisfiedAltOutlinedIcon
                          sx={{ fontSize: 19 }}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 43,
                    borderRadius: '9px',
                    fontSize: '0.62rem',
                  },
                }}
              />

              <IconButton
                onClick={sendMessage}
                disabled={!draft.trim()}
                sx={{
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  borderRadius: '9px',
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

            <Typography
              sx={{
                mt: 0.45,
                ml: 4.7,
                fontSize: '0.5rem',
                color: '#8a96a8',
              }}
            >
              You can reply because this
              conversation was initiated by the
              employer.
            </Typography>
          </Box>
        </Paper>

        {/* Right panel */}
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
              Conversation Info
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mt: 1.3 }}
            >
              <CompanyAvatar
                conversation={selectedConversation}
                size={57}
              />

              <Box minWidth={0}>
                <Stack
                  direction="row"
                  spacing={0.35}
                  alignItems="center"
                >
                  <Typography
                    noWrap
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 950,
                      color: '#17233d',
                    }}
                  >
                    {selectedConversation.company}
                  </Typography>

                  <VerifiedIcon
                    sx={{
                      fontSize: 14,
                      color: '#1261e8',
                    }}
                  />
                </Stack>

                <Typography
                  sx={{
                    mt: 0.2,
                    fontSize: '0.54rem',
                    color: '#53657e',
                  }}
                >
                  IT Services & Consulting
                </Typography>
              </Box>
            </Stack>

            <Button
              fullWidth
              variant="outlined"
              startIcon={
                <ApartmentOutlinedIcon />
              }
              endIcon={
                <OpenInNewOutlinedIcon />
              }
              sx={rightButton}
            >
              View Company Profile
            </Button>
          </Box>

          <Divider />

          <Box sx={{ p: 1.4 }}>
            <Typography sx={sectionTitle}>
              Job & Application Details
            </Typography>

            <Stack
              spacing={1.1}
              sx={{ mt: 1.2 }}
            >
              <DetailRow
                icon={<WorkOutlineOutlinedIcon />}
                label="Job Role"
                value={selectedConversation.role}
              />

              <DetailRow
                icon={<DescriptionOutlinedIcon />}
                label="Application ID"
                value={
                  selectedConversation.applicationId
                }
              />

              <DetailRow
                icon={<TrendingUpOutlinedIcon />}
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
              spacing={0.75}
              sx={{ mt: 1 }}
            >
              <Button
                fullWidth
                variant="outlined"
                startIcon={
                  <WorkOutlineOutlinedIcon />
                }
                endIcon={
                  <OpenInNewOutlinedIcon />
                }
                onClick={() =>
                  navigate(
                    `/jobs/${selectedConversation.jobId}`,
                  )
                }
                sx={quickActionButton}
              >
                View Job
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={
                  <DescriptionOutlinedIcon />
                }
                endIcon={
                  <OpenInNewOutlinedIcon />
                }
                onClick={() =>
                  navigate(
                    '/dashboard/applications',
                  )
                }
                sx={quickActionButton}
              >
                View Application
              </Button>
            </Stack>
          </Box>

          <Divider />

          <Box
            sx={{
              p: 1.4,
              bgcolor: '#f8faff',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.56rem',
                lineHeight: 1.55,
                color: '#64748b',
              }}
            >
              For your privacy and to reduce
              recruiter spam, candidates cannot
              start new employer conversations.
              You can reply when an employer
              contacts you through CareerHarbor.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

/* ==========================================
   CONVERSATION ROW
========================================== */

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
      px: 1.2,
      py: 1.05,
      cursor: 'pointer',
      bgcolor: selected
        ? '#eef4ff'
        : '#fff',
      borderBottom:
        '1px solid #edf1f5',

      '&:hover': {
        bgcolor: selected
          ? '#eef4ff'
          : '#f8fafc',
      },
    }}
  >
    <Stack
      direction="row"
      spacing={0.9}
      alignItems="center"
    >
      <CompanyAvatar
        conversation={conversation}
        size={43}
      />

      <Box
        sx={{
          minWidth: 0,
          flex: 1,
        }}
      >
        <Stack
          direction="row"
          spacing={0.5}
          justifyContent="space-between"
        >
          <Typography
            noWrap
            sx={{
              fontSize: '0.64rem',
              fontWeight: 950,
              color: '#17233d',
            }}
          >
            {conversation.company}
          </Typography>

          <Typography
            sx={{
              flexShrink: 0,
              fontSize: '0.5rem',
              color: '#52627a',
            }}
          >
            {conversation.time}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={0.4}
          alignItems="center"
          sx={{ mt: 0.3 }}
        >
          <Typography
            noWrap
            sx={{
              flex: 1,
              fontSize: '0.54rem',
              color: '#52627a',
            }}
          >
            {conversation.preview}
          </Typography>

          {conversation.unread > 0 && (
            <Badge
              badgeContent={conversation.unread}
              color="error"
              sx={{
                mr: 0.8,

                '& .MuiBadge-badge': {
                  minWidth: 18,
                  height: 18,
                  fontSize: '0.47rem',
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

/* ==========================================
   CHAT
========================================== */

const ChatBubble = ({
  message,
  companyInitials,
}: {
  message: ChatMessage;
  companyInitials: string;
}) => {
  const candidate =
    message.sender === 'candidate';

  return (
    <Stack
      direction="row"
      spacing={0.7}
      justifyContent={
        candidate
          ? 'flex-end'
          : 'flex-start'
      }
      alignItems="flex-start"
    >
      {!candidate && (
        <Avatar
          sx={{
            width: 34,
            height: 34,
            bgcolor: '#eee8ff',
            color: '#6133dc',
            fontSize: '0.55rem',
            fontWeight: 950,
          }}
        >
          {companyInitials}
        </Avatar>
      )}

      <Box
        sx={{
          maxWidth: {
            xs: '84%',
            md: '70%',
          },
        }}
      >
        <Box
          sx={{
            px: 1.2,
            py: 1,
            borderRadius: candidate
              ? '12px 12px 3px 12px'
              : '12px 12px 12px 3px',
            bgcolor: candidate
              ? '#1261e8'
              : '#eef1f5',
            color: candidate
              ? '#fff'
              : '#17233d',
          }}
        >
          <Typography
            sx={{
              whiteSpace: 'pre-line',
              fontSize: '0.63rem',
              lineHeight: 1.55,
            }}
          >
            {message.text}
          </Typography>
        </Box>

        <Typography
          sx={{
            mt: 0.3,
            textAlign: candidate
              ? 'right'
              : 'left',
            fontSize: '0.5rem',
            color: '#64748b',
          }}
        >
          {message.time}
          {candidate && '  ✓✓'}
        </Typography>
      </Box>
    </Stack>
  );
};

const EmptyConversation = () => (
  <Box
    sx={{
      py: 8,
      textAlign: 'center',
    }}
  >
    <Box
      sx={{
        width: 58,
        height: 58,
        mx: 'auto',
        borderRadius: '50%',
        bgcolor: '#eef3ff',
        color: '#1261e8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MessageIcon />
    </Box>

    <Typography
      sx={{
        mt: 1,
        fontSize: '0.7rem',
        fontWeight: 900,
        color: '#263750',
      }}
    >
      No messages yet
    </Typography>

    <Typography
      sx={{
        mt: 0.3,
        fontSize: '0.55rem',
        color: '#7a8799',
      }}
    >
      Messages from this employer will appear
      here.
    </Typography>
  </Box>
);

/* ==========================================
   COMPANY AVATAR
========================================== */

const CompanyAvatar = ({
  conversation,
  size,
}: {
  conversation: Conversation;
  size: number;
}) => {
  const backgroundMap: Record<string, string> = {
    HCL: '#ffffff',
    D: '#111111',
    S: '#029f9c',
    P: '#5b13a8',
    INF: '#ffffff',
  };

  const colorMap: Record<string, string> = {
    HCL: '#0758ce',
    D: '#ffffff',
    S: '#ffffff',
    P: '#ffffff',
    INF: '#1683cf',
  };

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        bgcolor:
          backgroundMap[conversation.initials] ??
          '#eee8ff',
        color:
          colorMap[conversation.initials] ??
          '#6133dc',
        border:
          conversation.initials === 'HCL' ||
          conversation.initials === 'INF'
            ? '1px solid #dbe2ec'
            : 'none',
        fontSize:
          conversation.initials.length > 2
            ? '0.48rem'
            : '0.65rem',
        fontWeight: 950,
      }}
    >
      {conversation.initials}
    </Avatar>
  );
};

/* ==========================================
   DETAILS
========================================== */

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
          fontSize: '0.52rem',
          color: '#64748b',
        }}
      >
        {label}:
      </Typography>

      <Typography
        sx={{
          fontSize: '0.54rem',
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

/* ==========================================
   MESSAGE ICON
========================================== */

const MessageIcon = () => (
  <Box
    sx={{
      width: 24,
      height: 19,
      border: '2px solid currentColor',
      borderRadius: '5px',
      position: 'relative',

      '&::after': {
        content: '""',
        position: 'absolute',
        left: 5,
        bottom: -5,
        width: 7,
        height: 7,
        borderLeft: '2px solid currentColor',
        transform: 'skew(-28deg)',
      },
    }}
  />
);

/* ==========================================
   STYLES
========================================== */

const sectionTitle = {
  fontSize: '0.76rem',
  fontWeight: 950,
  color: '#17233d',
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

const rightButton = {
  mt: 1.2,
  minHeight: 39,
  borderRadius: '8px',
  borderColor: '#ccd7e5',
  color: '#0758ce',
  textTransform: 'none',
  fontSize: '0.57rem',
  fontWeight: 900,

  '& .MuiButton-startIcon svg': {
    fontSize: 16,
  },

  '& .MuiButton-endIcon svg': {
    fontSize: 14,
  },
};

const quickActionButton = {
  minHeight: 39,
  borderRadius: '8px',
  borderColor: '#ccd7e5',
  color: '#0758ce',
  textTransform: 'none',
  fontSize: '0.57rem',
  fontWeight: 900,

  '& .MuiButton-startIcon svg': {
    fontSize: 16,
  },

  '& .MuiButton-endIcon svg': {
    fontSize: 14,
  },

  '&:hover': {
    bgcolor: '#f8fbff',
    borderColor: '#afbed3',
  },
};

export default CandidateMessagesPage;