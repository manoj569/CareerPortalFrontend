import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SearchIcon from '@mui/icons-material/Search';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';

type InterviewStatus =
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

type Interview = {
  id: number;
  candidateId: number;
  candidate: string;
  initials: string;
  email: string;
  role: string;
  jobId: string;
  round: string;
  date: string;
  time: string;
  interviewers: string[];
  status: InterviewStatus;
};

const initialInterviews: Interview[] = [
  {
    id: 1,
    candidateId: 4,
    candidate: 'Rohan Sharma',
    initials: 'RS',
    email: 'rohan.sharma@email.com',
    role: 'Senior React Developer',
    jobId: '#SRD-1024',
    round: 'Technical Round',
    date: 'Nov 20, 2026',
    time: '11:00 AM – 12:00 PM',
    interviewers: ['AK', 'SK'],
    status: 'Scheduled',
  },
  {
    id: 2,
    candidateId: 7,
    candidate: 'Ananya Patel',
    initials: 'AP',
    email: 'ananya.patel@email.com',
    role: 'Frontend Developer',
    jobId: '#SRD-1024',
    round: 'Technical Round',
    date: 'Nov 20, 2026',
    time: '02:00 PM – 03:00 PM',
    interviewers: ['MT'],
    status: 'Scheduled',
  },
  {
    id: 3,
    candidateId: 8,
    candidate: 'Mohan Kumar',
    initials: 'MK',
    email: 'mohan.kumar@email.com',
    role: 'Senior React Developer',
    jobId: '#SRD-1024',
    round: 'HR Round',
    date: 'Nov 21, 2026',
    time: '10:00 AM – 10:30 AM',
    interviewers: ['RD', 'PS'],
    status: 'In Progress',
  },
  {
    id: 4,
    candidateId: 5,
    candidate: 'Priya Kulkarni',
    initials: 'PK',
    email: 'priya.kulkarni@email.com',
    role: 'React Developer',
    jobId: '#SRD-1024',
    round: 'Technical Round',
    date: 'Nov 18, 2026',
    time: '04:00 PM – 05:00 PM',
    interviewers: ['AK'],
    status: 'Completed',
  },
  {
    id: 5,
    candidateId: 10,
    candidate: 'Arjun Mehta',
    initials: 'AM',
    email: 'arjun.mehta@email.com',
    role: 'Frontend Lead',
    jobId: '#SRD-1024',
    round: 'Final Round',
    date: 'Nov 17, 2026',
    time: '11:00 AM – 12:00 PM',
    interviewers: ['SK', 'RD'],
    status: 'Completed',
  },
];

export const EmployerInterviewsPage = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [job, setJob] = useState('all');
  const [stage, setStage] = useState('all');
  const [time, setTime] = useState('week');
  const [page, setPage] = useState(1);

  const filteredInterviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return initialInterviews.filter((interview) => {
      const matchesSearch =
        !query ||
        interview.candidate.toLowerCase().includes(query) ||
        interview.role.toLowerCase().includes(query) ||
        interview.round.toLowerCase().includes(query) ||
        interview.email.toLowerCase().includes(query);

      const matchesStage =
        stage === 'all' || interview.status === stage;

      return matchesSearch && matchesStage;
    });
  }, [search, stage]);

  return (
    <Box
      sx={{
        px: { xs: 1.5, md: 2 },
        py: 1.5,
        maxWidth: 1700,
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
        <Typography sx={breadcrumbStyle}>
          CareerHarbor
        </Typography>

        <Typography sx={breadcrumbStyle}>/</Typography>

        <Typography
          sx={{
            ...breadcrumbStyle,
            color: '#17233d',
            fontWeight: 900,
          }}
        >
          Interviews
        </Typography>
      </Stack>

      {/* Hero */}
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #dddfff',
          borderRadius: '14px',
          px: { xs: 1.8, md: 2.4 },
          py: 1.8,
          background:
            'linear-gradient(110deg, #f7f5ff 0%, #eef3ff 54%, #eee9ff 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 250,
            height: 250,
            borderRadius: '50%',
            right: 80,
            top: -180,
            border: '36px solid rgba(91,75,255,0.05)',
          }}
        />

        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: { xs: 'flex-start', lg: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 1.5,
          }}
        >
          <Stack direction="row" spacing={1.3} alignItems="center">
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
                  'linear-gradient(135deg, #2675f5 0%, #7b43ed 100%)',
              }}
            >
              <CalendarMonthOutlinedIcon sx={{ fontSize: 27 }} />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: { xs: '1.15rem', md: '1.42rem' },
                  fontWeight: 950,
                  color: '#0f1b39',
                }}
              >
                Interviews
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  fontSize: '0.73rem',
                  color: '#425477',
                }}
              >
                Schedule, manage and track candidate interviews across all
                roles.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={0.7}
            flexWrap="wrap"
            useFlexGap
          >
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              sx={heroButton}
            >
              Schedule Interview
            </Button>

            <Button
              variant="outlined"
              startIcon={<TaskAltOutlinedIcon />}
              sx={heroButton}
            >
              Interview Templates
            </Button>

            <Button
              variant="outlined"
              startIcon={<SettingsOutlinedIcon />}
              sx={heroButton}
            >
              Settings
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Metrics */}
      <Paper
        elevation={0}
        sx={{
          mt: 1.4,
          p: 1.5,
          border: '1px solid #e0e7ef',
          borderRadius: '13px',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              md: 'repeat(5, 1fr)',
            },
          }}
        >
          <SummaryItem
            icon={<CalendarMonthOutlinedIcon />}
            value="24"
            label="Total Interviews"
            iconBg="#eee7ff"
            iconColor="#6d35e3"
          />

          <SummaryItem
            icon={<CheckCircleOutlineIcon />}
            value="8"
            label="Completed"
            iconBg="#e5f8e9"
            iconColor="#139b42"
            border
          />

          <SummaryItem
            icon={<CalendarMonthOutlinedIcon />}
            value="12"
            label="Scheduled"
            iconBg="#e7f0ff"
            iconColor="#1261d7"
            border
          />

          <SummaryItem
            icon={<GroupsOutlinedIcon />}
            value="3"
            label="In Progress"
            iconBg="#e7f0ff"
            iconColor="#1261d7"
            border
          />

          <SummaryItem
            icon={<CancelOutlinedIcon />}
            value="1"
            label="Cancelled"
            iconBg="#ffe9e7"
            iconColor="#e43c31"
            border
          />
        </Box>
      </Paper>

      {/* Filters */}
      <Paper
        elevation={0}
        sx={{
          mt: 1.4,
          p: 1.2,
          border: '1px solid #e0e7ef',
          borderRadius: '13px',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1.5fr .9fr .9fr .9fr auto',
            },
            gap: 0.9,
            alignItems: 'center',
          }}
        >
          <TextField
            size="small"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by candidate, job or interviewer..."
            InputProps={{
              startAdornment: (
                <SearchIcon
                  sx={{
                    mr: 0.8,
                    fontSize: 19,
                    color: '#50617a',
                  }}
                />
              ),
            }}
            sx={filterFieldStyle}
          />

          <Select
            size="small"
            value={job}
            onChange={(event) => setJob(event.target.value)}
            sx={filterSelectStyle}
          >
            <MenuItem value="all">All Jobs</MenuItem>
            <MenuItem value="react">
              Senior React Developer
            </MenuItem>
            <MenuItem value="frontend">
              Frontend Developer
            </MenuItem>
          </Select>

          <Select
            size="small"
            value={stage}
            onChange={(event) => setStage(event.target.value)}
            sx={filterSelectStyle}
          >
            <MenuItem value="all">All Stages</MenuItem>
            <MenuItem value="Scheduled">Scheduled</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>

          <Select
            size="small"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            sx={filterSelectStyle}
          >
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="all">Any Time</MenuItem>
          </Select>

          <Stack direction="row" spacing={0.6}>
            <IconButton sx={viewButtonStyle}>
              <ViewListOutlinedIcon />
            </IconButton>

            <IconButton sx={viewButtonStyle}>
              <ViewAgendaOutlinedIcon />
            </IconButton>
          </Stack>
        </Box>
      </Paper>

      {/* Main */}
      <Box
        sx={{
          mt: 1.2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl: 'minmax(0, 1fr) 320px',
          },
          gap: 1.2,
          alignItems: 'start',
        }}
      >
        {/* Interview schedule */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e0e7ef',
            borderRadius: '13px',
            overflow: 'hidden',
          }}
        >
          <Typography
            sx={{
              px: 1.5,
              pt: 1.4,
              pb: 1,
              fontSize: '0.88rem',
              fontWeight: 950,
              color: '#17233d',
            }}
          >
            Interview Schedule
          </Typography>

          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ minWidth: 930 }}>
              <Box
                sx={{
                  px: 1.5,
                  py: 0.9,
                  mx: 1.2,
                  display: 'grid',
                  gridTemplateColumns:
                    '1.55fr 1.2fr 1fr 1.3fr .9fr .9fr 50px',
                  gap: 1,
                  bgcolor: '#f3f6fa',
                  borderRadius: '7px',
                }}
              >
                {[
                  'Candidate',
                  'Job / Role',
                  'Interview Round',
                  'Date & Time',
                  'Interviewer(s)',
                  'Status',
                  'Actions',
                ].map((heading) => (
                  <Typography
                    key={heading}
                    sx={{
                      fontSize: '0.61rem',
                      fontWeight: 900,
                      color: '#263750',
                    }}
                  >
                    {heading}
                  </Typography>
                ))}
              </Box>

              {filteredInterviews.map((interview) => (
                <InterviewRow
                  key={interview.id}
                  interview={interview}
                  onOpen={() =>
                    navigate(`/employer/interviews/${interview.id}`)
                  }
                  onCandidate={() =>
                    navigate(
                      `/employer/candidates/${interview.candidateId}`,
                    )
                  }
                />
              ))}

              {filteredInterviews.length === 0 && (
                <Box
                  sx={{
                    py: 8,
                    textAlign: 'center',
                  }}
                >
                  <CalendarMonthOutlinedIcon
                    sx={{
                      fontSize: 34,
                      color: '#a9b4c4',
                    }}
                  />

                  <Typography
                    sx={{
                      mt: 0.7,
                      fontSize: '0.7rem',
                      color: '#758298',
                    }}
                  >
                    No interviews match your current filters.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Pagination */}
          <Box
            sx={{
              px: 1.5,
              py: 1.2,
              borderTop: '1px solid #e6ebf2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: '0.62rem',
                color: '#40516b',
              }}
            >
              Showing 1–5 of 24 interviews
            </Typography>

            <Stack direction="row" spacing={0.3}>
              <IconButton
                size="small"
                disabled={page === 1}
                onClick={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
              >
                <ChevronLeftIcon sx={{ fontSize: 18 }} />
              </IconButton>

              {[1, 2, 3, 4, 5].map((item) => (
                <Button
                  key={item}
                  onClick={() => setPage(item)}
                  sx={{
                    minWidth: 31,
                    height: 31,
                    p: 0,
                    borderRadius: '7px',
                    border:
                      page === item
                        ? '1px solid #1261e8'
                        : '1px solid transparent',
                    color:
                      page === item ? '#0758ce' : '#35445d',
                    bgcolor:
                      page === item ? '#f2f6ff' : 'transparent',
                    fontSize: '0.64rem',
                    fontWeight: 900,
                  }}
                >
                  {item}
                </Button>
              ))}

              <IconButton
                size="small"
                disabled={page === 5}
                onClick={() =>
                  setPage((current) => Math.min(5, current + 1))
                }
              >
                <ChevronRightIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Stack>
          </Box>
        </Paper>

        {/* Right side */}
        <Stack spacing={1.2}>
          <Paper
            elevation={0}
            sx={{
              overflow: 'hidden',
              border: '1px solid #ded8ff',
              borderRadius: '12px',
            }}
          >
            <Box
              sx={{
                px: 1.4,
                py: 1.1,
                background:
                  'linear-gradient(135deg, #f3eaff 0%, #eee8ff 100%)',
              }}
            >
              <Stack direction="row" spacing={0.7} alignItems="center">
                <CalendarMonthOutlinedIcon
                  sx={{
                    fontSize: 20,
                    color: '#6b32e4',
                  }}
                />

                <Typography
                  sx={{
                    fontSize: '0.86rem',
                    fontWeight: 950,
                    color: '#17233d',
                  }}
                >
                  Upcoming Today (3)
                </Typography>
              </Stack>
            </Box>

            <Box sx={{ px: 1.2 }}>
              <UpcomingInterview
                initials="RS"
                candidate="Rohan Sharma"
                details="Technical Round · 11:00 AM"
              />

              <UpcomingInterview
                initials="AP"
                candidate="Ananya Patel"
                details="Technical Round · 02:00 PM"
              />

              <UpcomingInterview
                initials="MK"
                candidate="Mohan Kumar"
                details="HR Round · 04:00 PM"
                last
              />
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              border: '1px solid #e0e7ef',
              borderRadius: '12px',
            }}
          >
            <Stack direction="row" spacing={0.7} alignItems="center">
              <BarChartOutlinedIcon
                sx={{
                  fontSize: 21,
                  color: '#7436e5',
                }}
              />

              <Typography
                sx={{
                  fontSize: '0.86rem',
                  fontWeight: 950,
                  color: '#17233d',
                }}
              >
                Interview Insights
              </Typography>
            </Stack>

            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              <InsightProgress
                label="Completion Rate"
                value={87}
              />

              <InsightProgress
                label="On-time Interviews"
                value={92}
              />

              <InsightProgress
                label="Candidate Show-up"
                value={96}
              />
            </Stack>
          </Paper>
        </Stack>
      </Box>

      <Typography
        sx={{
          mt: 0.8,
          fontSize: '0.61rem',
          color: '#7b8799',
        }}
      >
        Interview information and actions shown here are frontend demo data
        until the Employer Interview API is connected.
      </Typography>
    </Box>
  );
};

const InterviewRow = ({
  interview,
  onOpen,
  onCandidate,
}: {
  interview: Interview;
  onOpen: () => void;
  onCandidate: () => void;
}) => (
  <Box
    sx={{
      px: 1.5,
      py: 1,
      mx: 1.2,
      display: 'grid',
      gridTemplateColumns:
        '1.55fr 1.2fr 1fr 1.3fr .9fr .9fr 50px',
      gap: 1,
      alignItems: 'center',
      borderBottom: '1px solid #e7ecf2',

      '&:hover': {
        bgcolor: '#fbfcff',
      },
    }}
  >
    <Stack
      direction="row"
      spacing={0.8}
      alignItems="center"
      minWidth={0}
    >
      <Avatar
        sx={{
          width: 38,
          height: 38,
          bgcolor:
            interview.initials === 'AM' ? '#fff0dd' : '#ece4ff',
          color:
            interview.initials === 'AM' ? '#e36a00' : '#6430d8',
          fontSize: '0.7rem',
          fontWeight: 950,
        }}
      >
        {interview.initials}
      </Avatar>

      <Box minWidth={0}>
        <Button
          onClick={onCandidate}
          sx={{
            p: 0,
            minWidth: 0,
            display: 'block',
            color: '#15213a',
            textTransform: 'none',
            textAlign: 'left',
            fontSize: '0.67rem',
            lineHeight: 1.3,
            fontWeight: 950,
          }}
        >
          {interview.candidate}
        </Button>

        <Typography
          sx={{
            mt: 0.15,
            fontSize: '0.58rem',
            color: '#52627a',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {interview.email}
        </Typography>
      </Box>
    </Stack>

    <Box>
      <Typography sx={rowPrimaryStyle}>
        {interview.role}
      </Typography>

      <Typography sx={rowSecondaryStyle}>
        {interview.jobId}
      </Typography>
    </Box>

    <Typography sx={rowPrimaryStyle}>
      {interview.round}
    </Typography>

    <Stack direction="row" spacing={0.6} alignItems="flex-start">
      <CalendarMonthOutlinedIcon
        sx={{
          mt: 0.1,
          fontSize: 17,
          color: '#1261e8',
        }}
      />

      <Box>
        <Typography sx={rowPrimaryStyle}>
          {interview.date}
        </Typography>

        <Typography sx={rowSecondaryStyle}>
          {interview.time}
        </Typography>
      </Box>
    </Stack>

    <Stack direction="row" spacing={-0.3}>
      {interview.interviewers.map((person) => (
        <Avatar
          key={person}
          sx={{
            width: 30,
            height: 30,
            border: '2px solid #fff',
            bgcolor: '#eee6ff',
            color: '#5530b6',
            fontSize: '0.56rem',
            fontWeight: 900,
          }}
        >
          {person}
        </Avatar>
      ))}
    </Stack>

    <StatusChip status={interview.status} />

    <IconButton
      title="Open interview"
      onClick={onOpen}
      sx={{
        width: 34,
        height: 34,
        border: '1px solid #dce4ef',
        borderRadius: '8px',
        color: '#344861',
      }}
    >
      <MoreHorizIcon sx={{ fontSize: 18 }} />
    </IconButton>
  </Box>
);

const StatusChip = ({
  status,
}: {
  status: InterviewStatus;
}) => {
  const styles: Record<
    InterviewStatus,
    {
      bg: string;
      color: string;
    }
  > = {
    Scheduled: {
      bg: '#e6f0ff',
      color: '#0758ce',
    },
    'In Progress': {
      bg: '#fff0dd',
      color: '#db6900',
    },
    Completed: {
      bg: '#e2f7e6',
      color: '#108637',
    },
    Cancelled: {
      bg: '#ffe9e7',
      color: '#d8382d',
    },
  };

  const style = styles[status];

  return (
    <Chip
      size="small"
      label={status}
      sx={{
        width: 'fit-content',
        height: 24,
        bgcolor: style.bg,
        color: style.color,
        fontSize: '0.56rem',
        fontWeight: 900,
      }}
    />
  );
};

const UpcomingInterview = ({
  initials,
  candidate,
  details,
  last = false,
}: {
  initials: string;
  candidate: string;
  details: string;
  last?: boolean;
}) => (
  <Stack
    direction="row"
    spacing={0.9}
    alignItems="center"
    sx={{
      py: 1,
      borderBottom: last ? 'none' : '1px solid #e6ebf2',
    }}
  >
    <Avatar
      sx={{
        width: 38,
        height: 38,
        bgcolor: '#eee5ff',
        color: '#6730d9',
        fontSize: '0.68rem',
        fontWeight: 950,
      }}
    >
      {initials}
    </Avatar>

    <Box flex={1}>
      <Typography
        sx={{
          fontSize: '0.66rem',
          fontWeight: 950,
          color: '#17233d',
        }}
      >
        {candidate}
      </Typography>

      <Typography
        sx={{
          mt: 0.1,
          fontSize: '0.59rem',
          color: '#40516b',
        }}
      >
        {details}
      </Typography>
    </Box>

    <CalendarMonthOutlinedIcon
      sx={{
        fontSize: 17,
        color: '#31537e',
      }}
    />
  </Stack>
);

const InsightProgress = ({
  label,
  value,
}: {
  label: string;
  value: number;
}) => (
  <Box>
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ mb: 0.5 }}
    >
      <Typography
        sx={{
          fontSize: '0.63rem',
          fontWeight: 850,
          color: '#263750',
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: '0.63rem',
          fontWeight: 950,
          color: '#17233d',
        }}
      >
        {value}%
      </Typography>
    </Stack>

    <LinearProgress
      variant="determinate"
      value={value}
      sx={{
        height: 7,
        borderRadius: 10,
        bgcolor: '#edf1f6',

        '& .MuiLinearProgress-bar': {
          borderRadius: 10,
          background:
            value >= 95
              ? 'linear-gradient(90deg,#6936eb,#8d3af0)'
              : value >= 90
                ? 'linear-gradient(90deg,#1476ed,#3888f4)'
                : 'linear-gradient(90deg,#18a951,#3bc66b)',
        },
      }}
    />
  </Box>
);

const SummaryItem = ({
  icon,
  value,
  label,
  iconBg,
  iconColor,
  border = false,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  iconBg: string;
  iconColor: string;
  border?: boolean;
}) => (
  <Box
    sx={{
      px: 1.5,
      minHeight: 64,
      display: 'flex',
      alignItems: 'center',
      gap: 1.2,
      borderLeft: {
        xs: 'none',
        md: border ? '1px solid #e2e8f0' : 'none',
      },
    }}
  >
    <Box
      sx={{
        width: 43,
        height: 43,
        flexShrink: 0,
        borderRadius: '50%',
        bgcolor: iconBg,
        color: iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

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
          fontSize: '1rem',
          lineHeight: 1.05,
          fontWeight: 950,
          color: '#101b38',
        }}
      >
        {value}
      </Typography>

      <Typography
        sx={{
          mt: 0.3,
          fontSize: '0.65rem',
          color: '#344a6c',
        }}
      >
        {label}
      </Typography>
    </Box>
  </Box>
);

const breadcrumbStyle = {
  fontSize: '0.65rem',
  color: '#64748b',
};

const heroButton = {
  minHeight: 38,
  px: 1.5,
  borderRadius: '8px',
  borderColor: '#d3ddec',
  bgcolor: '#fff',
  color: '#17233d',
  textTransform: 'none',
  fontSize: '0.67rem',
  fontWeight: 900,

  '&:hover': {
    bgcolor: '#f8fbff',
    borderColor: '#bdcbe0',
  },

  '& .MuiButton-startIcon svg': {
    fontSize: 18,
  },
};

const filterFieldStyle = {
  '& .MuiOutlinedInput-root': {
    height: 40,
    borderRadius: '8px',
    fontSize: '0.68rem',

    '& fieldset': {
      borderColor: '#d5deea',
    },
  },
};

const filterSelectStyle = {
  height: 40,
  borderRadius: '8px',
  fontSize: '0.68rem',
  fontWeight: 800,
  color: '#24344e',

  '& fieldset': {
    borderColor: '#d5deea',
  },
};

const viewButtonStyle = {
  width: 40,
  height: 40,
  border: '1px solid #d5deea',
  borderRadius: '8px',
  color: '#31537e',

  '& svg': {
    fontSize: 18,
  },
};

const rowPrimaryStyle = {
  fontSize: '0.62rem',
  fontWeight: 850,
  color: '#24344e',
};

const rowSecondaryStyle = {
  mt: 0.15,
  fontSize: '0.57rem',
  color: '#52627a',
};

export default EmployerInterviewsPage;