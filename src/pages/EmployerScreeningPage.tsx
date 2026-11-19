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
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';

type ScreeningStatus =
  | 'Cleared'
  | 'In Review'
  | 'Not Qualified';

type MatchLevel =
  | 'Strong Match'
  | 'Good Match'
  | 'Partial Match'
  | 'Low Match';

type ScreeningCandidate = {
  id: number;
  candidateId: number;
  name: string;
  initials: string;
  email: string;
  role: string;
  jobId: string;
  assessment: string;
  score: number;
  match: MatchLevel;
  status: ScreeningStatus;
};

const initialCandidates: ScreeningCandidate[] = [
  {
    id: 1,
    candidateId: 1,
    name: 'Rohan Sharma',
    initials: 'RS',
    email: 'rohan.sharma@email.com',
    role: 'Senior React Developer',
    jobId: '#SRD-1024',
    assessment: 'Frontend Skill Test',
    score: 92,
    match: 'Strong Match',
    status: 'Cleared',
  },
  {
    id: 2,
    candidateId: 2,
    name: 'Ananya Patel',
    initials: 'AP',
    email: 'ananya.patel@email.com',
    role: 'Frontend Developer',
    jobId: '#SRD-1024',
    assessment: 'React + TypeScript',
    score: 88,
    match: 'Strong Match',
    status: 'Cleared',
  },
  {
    id: 3,
    candidateId: 3,
    name: 'Mohan Kumar',
    initials: 'MK',
    email: 'mohan.kumar@email.com',
    role: 'Senior React Developer',
    jobId: '#SRD-1024',
    assessment: 'Coding Assessment',
    score: 76,
    match: 'Good Match',
    status: 'In Review',
  },
  {
    id: 4,
    candidateId: 4,
    name: 'Priya Kulkarni',
    initials: 'PK',
    email: 'priya.kulkarni@email.com',
    role: 'React Developer',
    jobId: '#SRD-1024',
    assessment: 'Frontend Skill Test',
    score: 69,
    match: 'Partial Match',
    status: 'In Review',
  },
  {
    id: 5,
    candidateId: 5,
    name: 'Arjun Mehta',
    initials: 'AM',
    email: 'arjun.mehta@email.com',
    role: 'Frontend Lead',
    jobId: '#SRD-1024',
    assessment: 'System Design (Frontend)',
    score: 58,
    match: 'Low Match',
    status: 'Not Qualified',
  },
];

export const EmployerScreeningPage = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [job, setJob] = useState('all');
  const [assessment, setAssessment] = useState('all');
  const [status, setStatus] = useState('all');
  const [period, setPeriod] = useState('month');
  const [page, setPage] = useState(1);

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return initialCandidates.filter((candidate) => {
      const matchesSearch =
        !query ||
        candidate.name.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query) ||
        candidate.role.toLowerCase().includes(query) ||
        candidate.assessment.toLowerCase().includes(query);

      const matchesJob =
        job === 'all' ||
        (job === 'react' &&
          candidate.role.includes('React')) ||
        (job === 'frontend' &&
          candidate.role.includes('Frontend'));

      const matchesAssessment =
        assessment === 'all' ||
        candidate.assessment === assessment;

      const matchesStatus =
        status === 'all' ||
        candidate.status === status;

      return (
        matchesSearch &&
        matchesJob &&
        matchesAssessment &&
        matchesStatus
      );
    });
  }, [search, job, assessment, status]);

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

        <Typography sx={breadcrumbStyle}>
          /
        </Typography>

        <Typography
          sx={{
            ...breadcrumbStyle,
            color: '#17233d',
            fontWeight: 900,
          }}
        >
          Screening
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
            border:
              '36px solid rgba(91,75,255,0.05)',
          }}
        />

        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: {
              xs: 'flex-start',
              lg: 'center',
            },
            justifyContent: 'space-between',
            flexDirection: {
              xs: 'column',
              lg: 'row',
            },
            gap: 1.5,
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
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  'linear-gradient(135deg, #2675f5 0%, #7b43ed 100%)',
              }}
            >
              <WorkspacePremiumOutlinedIcon
                sx={{ fontSize: 27 }}
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: {
                    xs: '1.15rem',
                    md: '1.42rem',
                  },
                  fontWeight: 950,
                  color: '#0f1b39',
                }}
              >
                Screening
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  fontSize: '0.73rem',
                  color: '#425477',
                }}
              >
                Review assessments, AI screening
                results and shortlisted candidates.
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
              Create Assessment
            </Button>

            <Button
              variant="outlined"
              startIcon={
                <LibraryBooksOutlinedIcon />
              }
              sx={heroButton}
            >
              Assessment Library
            </Button>

            <Button
              variant="outlined"
              startIcon={
                <SettingsOutlinedIcon />
              }
              sx={heroButton}
            >
              Screening Rules
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Summary */}
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
            icon={<GroupsOutlinedIcon />}
            value="86"
            label="To Be Reviewed"
            iconBg="#eee7ff"
            iconColor="#6d35e3"
          />

          <SummaryItem
            icon={
              <CheckCircleOutlineIcon />
            }
            value="48"
            label="Cleared"
            iconBg="#e5f8e9"
            iconColor="#139b42"
            border
          />

          <SummaryItem
            icon={<PendingOutlinedIcon />}
            value="24"
            label="In Review"
            iconBg="#fff0dd"
            iconColor="#e36a00"
            border
          />

          <SummaryItem
            icon={
              <HighlightOffOutlinedIcon />
            }
            value="8"
            label="Not Qualified"
            iconBg="#ffe9e7"
            iconColor="#e43c31"
            border
          />

          <SummaryItem
            icon={
              <AnalyticsOutlinedIcon />
            }
            value="92%"
            label="Screening Accuracy"
            iconBg="#e7f0ff"
            iconColor="#1261d7"
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
              md:
                '1.5fr .75fr .9fr .75fr .9fr auto',
            },
            gap: 0.9,
            alignItems: 'center',
          }}
        >
          <TextField
            size="small"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by candidate, job or skill..."
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
            onChange={(event) =>
              setJob(event.target.value)
            }
            sx={filterSelectStyle}
          >
            <MenuItem value="all">
              All Jobs
            </MenuItem>

            <MenuItem value="react">
              React Roles
            </MenuItem>

            <MenuItem value="frontend">
              Frontend Roles
            </MenuItem>
          </Select>

          <Select
            size="small"
            value={assessment}
            onChange={(event) =>
              setAssessment(event.target.value)
            }
            sx={filterSelectStyle}
          >
            <MenuItem value="all">
              All Assessments
            </MenuItem>

            <MenuItem value="Frontend Skill Test">
              Frontend Skill Test
            </MenuItem>

            <MenuItem value="React + TypeScript">
              React + TypeScript
            </MenuItem>

            <MenuItem value="Coding Assessment">
              Coding Assessment
            </MenuItem>

            <MenuItem value="System Design (Frontend)">
              System Design
            </MenuItem>
          </Select>

          <Select
            size="small"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            sx={filterSelectStyle}
          >
            <MenuItem value="all">
              All Status
            </MenuItem>

            <MenuItem value="Cleared">
              Cleared
            </MenuItem>

            <MenuItem value="In Review">
              In Review
            </MenuItem>

            <MenuItem value="Not Qualified">
              Not Qualified
            </MenuItem>
          </Select>

          <Select
            size="small"
            value={period}
            onChange={(event) =>
              setPeriod(event.target.value)
            }
            sx={filterSelectStyle}
          >
            <MenuItem value="today">
              Today
            </MenuItem>

            <MenuItem value="week">
              This Week
            </MenuItem>

            <MenuItem value="month">
              This Month
            </MenuItem>

            <MenuItem value="all">
              Any Time
            </MenuItem>
          </Select>

          <Stack
            direction="row"
            spacing={0.6}
          >
            <IconButton
              sx={{
                ...viewButtonStyle,
                borderColor: '#1261e8',
                color: '#1261e8',
                bgcolor: '#f3f7ff',
              }}
            >
              <TableRowsOutlinedIcon />
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
            xl: 'minmax(0, 1fr) 330px',
          },
          gap: 1.2,
          alignItems: 'start',
        }}
      >
        {/* Results */}
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
            Assessment Results (86)
          </Typography>

          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ minWidth: 900 }}>
              {/* Header */}
              <Box
                sx={{
                  mx: 1.2,
                  px: 1.5,
                  py: 0.9,
                  display: 'grid',
                  gridTemplateColumns:
                    '1.5fr 1.25fr 1.1fr .55fr 1.1fr .9fr 50px',
                  gap: 1,
                  bgcolor: '#f3f6fa',
                  borderRadius: '7px',
                }}
              >
                {[
                  'Candidate',
                  'Job / Role',
                  'Assessment',
                  'Score',
                  'AI Screening',
                  'Status',
                  'Actions',
                ].map((heading) => (
                  <Typography
                    key={heading}
                    sx={tableHeaderStyle}
                  >
                    {heading}
                  </Typography>
                ))}
              </Box>

              {filteredCandidates.map(
                (candidate) => (
                  <ScreeningRow
                    key={candidate.id}
                    candidate={candidate}
                    onOpen={() =>
                      navigate(
                        `/employer/candidates/${candidate.candidateId}`,
                      )
                    }
                  />
                ),
              )}

              {filteredCandidates.length ===
                0 && (
                <Box
                  sx={{
                    py: 8,
                    textAlign: 'center',
                  }}
                >
                  <TuneOutlinedIcon
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
                    No screening results match
                    your current filters.
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
              borderTop:
                '1px solid #e6ebf2',
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                'space-between',
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
              Showing 1–5 of 86 candidates
            </Typography>

            <Stack
              direction="row"
              spacing={0.3}
            >
              <IconButton
                size="small"
                disabled={page === 1}
                onClick={() =>
                  setPage((current) =>
                    Math.max(
                      1,
                      current - 1,
                    ),
                  )
                }
              >
                <ChevronLeftIcon
                  sx={{ fontSize: 18 }}
                />
              </IconButton>

              {[1, 2, 3, 4, 5].map(
                (item) => (
                  <Button
                    key={item}
                    onClick={() =>
                      setPage(item)
                    }
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
                        page === item
                          ? '#0758ce'
                          : '#35445d',
                      bgcolor:
                        page === item
                          ? '#f2f6ff'
                          : 'transparent',
                      fontSize: '0.64rem',
                      fontWeight: 900,
                    }}
                  >
                    {item}
                  </Button>
                ),
              )}

              <IconButton
                size="small"
                disabled={page === 5}
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      5,
                      current + 1,
                    ),
                  )
                }
              >
                <ChevronRightIcon
                  sx={{ fontSize: 18 }}
                />
              </IconButton>
            </Stack>
          </Box>
        </Paper>

        {/* Right column */}
        <Stack spacing={1.2}>
          <Paper
            elevation={0}
            sx={{
              overflow: 'hidden',
              border:
                '1px solid #ded8ff',
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
              <Stack
                direction="row"
                spacing={0.7}
                alignItems="center"
              >
                <GroupsOutlinedIcon
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
                  Screening Insights
                </Typography>
              </Stack>
            </Box>

            <Stack
              spacing={1.6}
              sx={{ p: 1.5 }}
            >
              <InsightProgress
                value={56}
                label="Cleared Rate"
                tone="success"
              />

              <InsightProgress
                value={28}
                label="In Review Rate"
                tone="warning"
              />

              <InsightProgress
                value={9}
                label="Not Qualified Rate"
                tone="danger"
              />
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              border:
                '1px solid #e0e7ef',
              borderRadius: '12px',
            }}
          >
            <Stack
              direction="row"
              spacing={0.7}
              alignItems="center"
            >
              <AnalyticsOutlinedIcon
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
                Top Skills in Cleared
                Candidates
              </Typography>
            </Stack>

            <Box
              sx={{
                mt: 1.4,
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: 1,
              }}
            >
              <SkillScore
                skill="React"
                value={96}
              />

              <SkillScore
                skill="Redux"
                value={88}
              />

              <SkillScore
                skill="TypeScript"
                value={94}
              />

              <SkillScore
                skill="Next.js"
                value={85}
              />

              <SkillScore
                skill="JavaScript"
                value={92}
              />

              <SkillScore
                skill="CSS"
                value={82}
              />
            </Box>
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
        Screening scores, AI match results and
        actions on this screen are frontend demo
        data until the Employer Screening API is
        connected.
      </Typography>
    </Box>
  );
};

const ScreeningRow = ({
  candidate,
  onOpen,
}: {
  candidate: ScreeningCandidate;
  onOpen: () => void;
}) => (
  <Box
    sx={{
      mx: 1.2,
      px: 1.5,
      py: 1,
      display: 'grid',
      gridTemplateColumns:
        '1.5fr 1.25fr 1.1fr .55fr 1.1fr .9fr 50px',
      gap: 1,
      alignItems: 'center',
      borderBottom:
        '1px solid #e7ecf2',

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
            candidate.initials === 'AM'
              ? '#fff0dd'
              : '#eee5ff',
          color:
            candidate.initials === 'AM'
              ? '#df6a00'
              : '#6332d5',
          fontSize: '0.7rem',
          fontWeight: 950,
        }}
      >
        {candidate.initials}
      </Avatar>

      <Box minWidth={0}>
        <Button
          onClick={onOpen}
          sx={{
            p: 0,
            minWidth: 0,
            display: 'block',
            textTransform: 'none',
            textAlign: 'left',
            color: '#15213a',
            fontSize: '0.67rem',
            lineHeight: 1.3,
            fontWeight: 950,
          }}
        >
          {candidate.name}
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
          {candidate.email}
        </Typography>
      </Box>
    </Stack>

    <Box>
      <Typography sx={rowPrimaryStyle}>
        {candidate.role}
      </Typography>

      <Typography sx={rowSecondaryStyle}>
        {candidate.jobId}
      </Typography>
    </Box>

    <Typography sx={rowPrimaryStyle}>
      {candidate.assessment}
    </Typography>

    <ScoreChip
      score={candidate.score}
    />

    <MatchChip
      match={candidate.match}
    />

    <StatusChip
      status={candidate.status}
    />

    <IconButton
      title="View candidate"
      onClick={onOpen}
      sx={actionButtonStyle}
    >
      <MoreHorizIcon
        sx={{ fontSize: 18 }}
      />
    </IconButton>
  </Box>
);

const ScoreChip = ({
  score,
}: {
  score: number;
}) => {
  let background = '#ffe7e5';
  let color = '#d93025';

  if (score >= 85) {
    background = '#ddf7e2';
    color = '#118438';
  } else if (score >= 70) {
    background = '#e5efff';
    color = '#0758ce';
  } else if (score >= 60) {
    background = '#fff0dd';
    color = '#df6900';
  }

  return (
    <Chip
      label={`${score}%`}
      size="small"
      sx={{
        width: 'fit-content',
        height: 26,
        bgcolor: background,
        color,
        fontSize: '0.62rem',
        fontWeight: 950,
      }}
    />
  );
};

const MatchChip = ({
  match,
}: {
  match: MatchLevel;
}) => {
  const styles: Record<
    MatchLevel,
    {
      background: string;
      color: string;
    }
  > = {
    'Strong Match': {
      background: '#dcf7e2',
      color: '#108438',
    },

    'Good Match': {
      background: '#e5efff',
      color: '#0758ce',
    },

    'Partial Match': {
      background: '#fff0dd',
      color: '#df6900',
    },

    'Low Match': {
      background: '#ffe5e4',
      color: '#d92d25',
    },
  };

  const style = styles[match];

  return (
    <Chip
      icon={
        <AutoAwesomeOutlinedIcon />
      }
      label={match}
      size="small"
      sx={{
        width: 'fit-content',
        height: 25,
        bgcolor: style.background,
        color: style.color,
        fontSize: '0.56rem',
        fontWeight: 900,

        '& .MuiChip-icon': {
          color: style.color,
          fontSize: 14,
        },
      }}
    />
  );
};

const StatusChip = ({
  status,
}: {
  status: ScreeningStatus;
}) => {
  const styles: Record<
    ScreeningStatus,
    {
      background: string;
      color: string;
    }
  > = {
    Cleared: {
      background: '#dcf7e2',
      color: '#108438',
    },

    'In Review': {
      background: '#fff0dd',
      color: '#df6900',
    },

    'Not Qualified': {
      background: '#ffe5e4',
      color: '#d92d25',
    },
  };

  const style = styles[status];

  return (
    <Chip
      label={status}
      size="small"
      sx={{
        width: 'fit-content',
        height: 25,
        bgcolor: style.background,
        color: style.color,
        fontSize: '0.56rem',
        fontWeight: 900,
      }}
    />
  );
};

const InsightProgress = ({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: 'success' | 'warning' | 'danger';
}) => {
  const barColor =
    tone === 'success'
      ? '#20bf55'
      : tone === 'warning'
        ? '#ff8a00'
        : '#ff3944';

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
      >
        <Typography
          sx={{
            width: 45,
            fontSize: '0.95rem',
            fontWeight: 950,
            color: '#17233d',
          }}
        >
          {value}%
        </Typography>

        <Box flex={1}>
          <Typography
            sx={{
              mb: 0.55,
              fontSize: '0.65rem',
              fontWeight: 850,
              color: '#24344e',
            }}
          >
            {label}
          </Typography>

          <LinearProgress
            variant="determinate"
            value={value}
            sx={{
              height: 8,
              borderRadius: 10,
              bgcolor: '#edf1f6',

              '& .MuiLinearProgress-bar':
                {
                  borderRadius: 10,
                  backgroundColor:
                    barColor,
                },
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
};

const SkillScore = ({
  skill,
  value,
}: {
  skill: string;
  value: number;
}) => (
  <Stack
    direction="row"
    spacing={0.7}
    alignItems="center"
  >
    <Chip
      label={skill}
      size="small"
      sx={{
        minWidth: 85,
        height: 27,
        justifyContent: 'flex-start',
        bgcolor: '#e7f0ff',
        color: '#0758ce',
        fontSize: '0.6rem',
        fontWeight: 900,
      }}
    />

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
        md: border
          ? '1px solid #e2e8f0'
          : 'none',
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
  border:
    '1px solid #d5deea',
  borderRadius: '8px',
  color: '#31537e',

  '& svg': {
    fontSize: 18,
  },
};

const actionButtonStyle = {
  width: 34,
  height: 34,
  border:
    '1px solid #dce4ef',
  borderRadius: '8px',
  color: '#344861',
};

const tableHeaderStyle = {
  fontSize: '0.61rem',
  fontWeight: 900,
  color: '#263750',
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

export default EmployerScreeningPage;