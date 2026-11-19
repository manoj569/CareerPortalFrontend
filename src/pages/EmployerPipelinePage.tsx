import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Avatar,
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SearchIcon from '@mui/icons-material/Search';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';

type PipelineStage =
  | 'Applied'
  | 'Screening'
  | 'Interview'
  | 'Offer'
  | 'Hired';

type Candidate = {
  id: number;
  name: string;
  initials: string;
  match: number;
  experience: number;
  role: string;
  stage: PipelineStage;
  hiredDate?: string;
};

const stages: PipelineStage[] = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Hired',
];

const stageTotals: Record<PipelineStage, number> = {
  Applied: 128,
  Screening: 54,
  Interview: 32,
  Offer: 16,
  Hired: 12,
};

const initialCandidates: Candidate[] = [
  {
    id: 1,
    name: 'Rohan Verma',
    initials: 'RV',
    match: 94,
    experience: 5.2,
    role: 'Senior React Developer',
    stage: 'Applied',
  },
  {
    id: 2,
    name: 'Kirti Desai',
    initials: 'KD',
    match: 91,
    experience: 4.8,
    role: 'Frontend Developer',
    stage: 'Applied',
  },
  {
    id: 3,
    name: 'Aman Gupta',
    initials: 'AG',
    match: 88,
    experience: 3.9,
    role: 'React Developer',
    stage: 'Applied',
  },

  {
    id: 4,
    name: 'Rohan Sharma',
    initials: 'RS',
    match: 96,
    experience: 5.5,
    role: 'Senior Frontend Developer',
    stage: 'Screening',
  },
  {
    id: 5,
    name: 'Priya Kulkarni',
    initials: 'PK',
    match: 91,
    experience: 6.8,
    role: 'React Developer',
    stage: 'Screening',
  },
  {
    id: 6,
    name: 'Neha Patil',
    initials: 'NP',
    match: 89,
    experience: 4.6,
    role: 'Frontend Developer',
    stage: 'Screening',
  },

  {
    id: 7,
    name: 'Ananya Patel',
    initials: 'AP',
    match: 94,
    experience: 6.2,
    role: 'Frontend Developer',
    stage: 'Interview',
  },
  {
    id: 8,
    name: 'Mohan Kumar',
    initials: 'MK',
    match: 92,
    experience: 5.8,
    role: 'Senior React Developer',
    stage: 'Interview',
  },
  {
    id: 9,
    name: 'Kavya Iyer',
    initials: 'KI',
    match: 90,
    experience: 5.1,
    role: 'UI Developer',
    stage: 'Interview',
  },

  {
    id: 10,
    name: 'Arjun Mehta',
    initials: 'AM',
    match: 90,
    experience: 7.4,
    role: 'Frontend Lead',
    stage: 'Offer',
  },
  {
    id: 11,
    name: 'Sneha Rao',
    initials: 'SR',
    match: 88,
    experience: 6,
    role: 'React Developer',
    stage: 'Offer',
  },

  {
    id: 12,
    name: 'Vikram Joshi',
    initials: 'VJ',
    match: 95,
    experience: 6.5,
    role: 'Senior Frontend Developer',
    stage: 'Hired',
    hiredDate: 'Nov 10, 2026',
  },
  {
    id: 13,
    name: 'Ishita Roy',
    initials: 'IR',
    match: 93,
    experience: 5.7,
    role: 'Frontend Developer',
    stage: 'Hired',
    hiredDate: 'Nov 5, 2026',
  },
];

export const EmployerPipelinePage = () => {
  const navigate = useNavigate();

  const [candidates, setCandidates] =
    useState<Candidate[]>(initialCandidates);

  const [search, setSearch] = useState('');
  const [job, setJob] = useState('all');
  const [role, setRole] = useState('all');
  const [time, setTime] = useState('any');

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesSearch =
        !query ||
        candidate.name.toLowerCase().includes(query) ||
        candidate.role.toLowerCase().includes(query);

      const matchesRole =
        role === 'all' ||
        candidate.role === role;

      return matchesSearch && matchesRole;
    });
  }, [candidates, search, role]);

  const moveCandidate = (
    candidateId: number,
    nextStage: PipelineStage,
  ) => {
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === candidateId
          ? {
              ...candidate,
              stage: nextStage,
              hiredDate:
                nextStage === 'Hired'
                  ? 'Nov 18, 2026'
                  : undefined,
            }
          : candidate,
      ),
    );
  };

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
          Hiring Pipeline
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
            width: 260,
            height: 260,
            borderRadius: '50%',
            right: 70,
            top: -190,
            border:
              '38px solid rgba(91,75,255,0.05)',
          }}
        />

        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: {
              xs: 'flex-start',
              lg: 'center',
            },
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
              <ViewKanbanOutlinedIcon
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
                Hiring Pipeline
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  fontSize: '0.73rem',
                  color: '#425477',
                }}
              >
                Track candidates across all hiring
                stages and move them forward.
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
              onClick={() =>
                navigate(
                  '/employer/candidates/find',
                )
              }
              sx={heroButton}
            >
              Add Candidate
            </Button>

            <Button
              variant="outlined"
              startIcon={
                <AutoAwesomeOutlinedIcon />
              }
              sx={heroButton}
            >
              Automation
            </Button>

            <Button
              variant="outlined"
              startIcon={
                <SettingsOutlinedIcon />
              }
              sx={heroButton}
            >
              Pipeline Settings
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
            value="342"
            label="Total Candidates"
            iconBg="#eee7ff"
            iconColor="#6d35e3"
          />

          <SummaryItem
            icon={<FilterAltOutlinedIcon />}
            value="28"
            label="Shortlisted"
            iconBg="#e5f8e9"
            iconColor="#139b42"
            border
          />

          <SummaryItem
            icon={<TimelineOutlinedIcon />}
            value="54"
            label="In Process"
            iconBg="#e7f0ff"
            iconColor="#1261d7"
            border
          />

          <SummaryItem
            icon={
              <CheckCircleOutlineIcon />
            }
            value="12"
            label="Hired"
            iconBg="#e4f8e9"
            iconColor="#07923c"
            border
          />

          <SummaryItem
            icon={<ArchiveOutlinedIcon />}
            value="18"
            label="Archived"
            iconBg="#eef1f6"
            iconColor="#52627a"
            border
          />
        </Box>
      </Paper>

      {/* Filters + pipeline */}
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
              md: '1.5fr 0.9fr 0.9fr 0.9fr',
            },
            gap: 0.9,
          }}
        >
          <TextField
            size="small"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by name, job or email..."
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
              Senior React Developer
            </MenuItem>

            <MenuItem value="frontend">
              Frontend Developer
            </MenuItem>
          </Select>

          <Select
            size="small"
            value={role}
            onChange={(event) =>
              setRole(event.target.value)
            }
            sx={filterSelectStyle}
          >
            <MenuItem value="all">
              All Roles
            </MenuItem>

            <MenuItem value="Senior React Developer">
              Senior React Developer
            </MenuItem>

            <MenuItem value="Frontend Developer">
              Frontend Developer
            </MenuItem>

            <MenuItem value="React Developer">
              React Developer
            </MenuItem>

            <MenuItem value="Frontend Lead">
              Frontend Lead
            </MenuItem>
          </Select>

          <Select
            size="small"
            value={time}
            onChange={(event) =>
              setTime(event.target.value)
            }
            sx={filterSelectStyle}
          >
            <MenuItem value="any">
              Any Time
            </MenuItem>

            <MenuItem value="today">
              Today
            </MenuItem>

            <MenuItem value="week">
              This Week
            </MenuItem>

            <MenuItem value="month">
              This Month
            </MenuItem>
          </Select>
        </Box>

        {/* Kanban */}
        <Box
          sx={{
            mt: 1.2,
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(5, 270px)',
              xl: 'repeat(5, minmax(0, 1fr))',
            },
            gap: 0.8,
            overflowX: 'auto',
            pb: 0.4,
          }}
        >
          {stages.map((stage) => (
            <PipelineColumn
              key={stage}
              stage={stage}
              total={stageTotals[stage]}
              candidates={filteredCandidates.filter(
                (candidate) =>
                  candidate.stage === stage,
              )}
              onOpen={(candidateId) =>
                navigate(
                  `/employer/candidates/${candidateId}`,
                )
              }
              onMove={moveCandidate}
            />
          ))}
        </Box>
      </Paper>

      <Typography
        sx={{
          mt: 0.8,
          fontSize: '0.61rem',
          color: '#7b8799',
        }}
      >
        Pipeline candidate information and stage
        changes on this screen are frontend demo data
        until the Employer Pipeline API is connected.
      </Typography>
    </Box>
  );
};

const PipelineColumn = ({
  stage,
  total,
  candidates,
  onOpen,
  onMove,
}: {
  stage: PipelineStage;
  total: number;
  candidates: Candidate[];
  onOpen: (id: number) => void;
  onMove: (
    id: number,
    stage: PipelineStage,
  ) => void;
}) => {
  const theme = stageThemes[stage];

  return (
    <Box
      sx={{
        minHeight: 440,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        overflow: 'hidden',
        background: theme.background,
      }}
    >
      {/* Column title */}
      <Box
        sx={{
          px: 1.3,
          py: 1.2,
          backgroundColor: theme.header,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.83rem',
            fontWeight: 950,
            color: theme.text,
          }}
        >
          {stage} ({total})
        </Typography>

        <ChevronRightIcon
          sx={{
            fontSize: 19,
            color: theme.text,
          }}
        />
      </Box>

      <Stack
        spacing={0.8}
        sx={{
          p: 0.8,
          minHeight: 330,
        }}
      >
        {candidates.length > 0 ? (
          candidates
            .slice(0, 4)
            .map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onOpen={() =>
                  onOpen(candidate.id)
                }
                onMove={(nextStage) =>
                  onMove(
                    candidate.id,
                    nextStage,
                  )
                }
              />
            ))
        ) : (
          <Box
            sx={{
              minHeight: 150,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              px: 2,
            }}
          >
            <Box>
              <WorkOutlineOutlinedIcon
                sx={{
                  fontSize: 25,
                  color: '#a4afbf',
                }}
              />

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: '0.64rem',
                  color: '#78869a',
                }}
              >
                No candidates match the current
                filters.
              </Typography>
            </Box>
          </Box>
        )}
      </Stack>

      <Button
        fullWidth
        endIcon={<ChevronRightIcon />}
        sx={{
          mt: 'auto',
          py: 1,
          borderRadius: 0,
          color: theme.text,
          textTransform: 'none',
          fontSize: '0.66rem',
          fontWeight: 900,
        }}
      >
        View All ({total})
      </Button>
    </Box>
  );
};

const CandidateCard = ({
  candidate,
  onOpen,
  onMove,
}: {
  candidate: Candidate;
  onOpen: () => void;
  onMove: (stage: PipelineStage) => void;
}) => (
  <Paper
    elevation={0}
    onClick={onOpen}
    sx={{
      p: 1,
      border: '1px solid #e0e6ef',
      borderRadius: '10px',
      backgroundColor: '#fff',
      cursor: 'pointer',
      transition:
        'transform 120ms ease, box-shadow 120ms ease',

      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow:
          '0 5px 15px rgba(30,55,90,0.08)',
      },
    }}
  >
    <Stack
      direction="row"
      spacing={0.8}
      alignItems="flex-start"
    >
      <Avatar
        sx={{
          width: 39,
          height: 39,
          flexShrink: 0,
          bgcolor:
            candidate.stage === 'Hired'
              ? '#dcf5e2'
              : candidate.stage === 'Offer'
                ? '#fff0dd'
                : '#ece4ff',
          color:
            candidate.stage === 'Hired'
              ? '#0d8c38'
              : candidate.stage === 'Offer'
                ? '#e36a00'
                : '#6430d8',
          fontSize: '0.72rem',
          fontWeight: 950,
        }}
      >
        {candidate.initials}
      </Avatar>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={0.5}
        >
          <Typography
            sx={{
              fontSize: '0.69rem',
              fontWeight: 950,
              color: '#15213a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {candidate.name}
          </Typography>

          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
            }}
            sx={{
              width: 25,
              height: 25,
              color: '#445570',
            }}
          >
            <MoreHorizIcon
              sx={{ fontSize: 17 }}
            />
          </IconButton>
        </Stack>

        {candidate.stage === 'Hired' ? (
          <Typography
            sx={{
              mt: 0.1,
              fontSize: '0.61rem',
              color: '#40516b',
            }}
          >
            <Box
              component="span"
              sx={{
                color: '#14923d',
                fontWeight: 900,
              }}
            >
              Hired
            </Box>{' '}
            · {candidate.hiredDate}
          </Typography>
        ) : (
          <Typography
            sx={{
              mt: 0.1,
              fontSize: '0.61rem',
              color: '#40516b',
            }}
          >
            <Box
              component="span"
              sx={{
                color: '#16933f',
                fontWeight: 900,
              }}
            >
              {candidate.match}% Match
            </Box>{' '}
            · {candidate.experience} yrs
          </Typography>
        )}

        <Typography
          sx={{
            mt: 0.3,
            fontSize: '0.61rem',
            color: '#253b61',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {candidate.role}
        </Typography>

        {candidate.stage !== 'Hired' && (
          <Select
            size="small"
            value={candidate.stage}
            onClick={(event) =>
              event.stopPropagation()
            }
            onChange={(event) =>
              onMove(
                event.target
                  .value as PipelineStage,
              )
            }
            sx={{
              mt: 0.7,
              width: '100%',
              height: 27,
              borderRadius: '7px',
              fontSize: '0.58rem',
              fontWeight: 800,
              bgcolor: '#f8faff',

              '& fieldset': {
                borderColor: '#e2e8f0',
              },
            }}
          >
            {stages.map((stage) => (
              <MenuItem
                key={stage}
                value={stage}
                sx={{ fontSize: '0.7rem' }}
              >
                Move to {stage}
              </MenuItem>
            ))}
          </Select>
        )}
      </Box>
    </Stack>
  </Paper>
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
        borderRadius: '50%',
        flexShrink: 0,
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

const stageThemes: Record<
  PipelineStage,
  {
    background: string;
    header: string;
    border: string;
    text: string;
  }
> = {
  Applied: {
    background:
      'linear-gradient(180deg, #fafbfe 0%, #f4f6fa 100%)',
    header: '#f0f2f7',
    border: '#e0e5ed',
    text: '#1e2b44',
  },

  Screening: {
    background:
      'linear-gradient(180deg, #f8fbff 0%, #edf5ff 100%)',
    header: '#e4f0ff',
    border: '#d4e4fa',
    text: '#0758ce',
  },

  Interview: {
    background:
      'linear-gradient(180deg, #fcfaff 0%, #f5edff 100%)',
    header: '#eee3ff',
    border: '#e3d6f8',
    text: '#6423cf',
  },

  Offer: {
    background:
      'linear-gradient(180deg, #fffdf9 0%, #fff4e6 100%)',
    header: '#fff0dd',
    border: '#f4dfc4',
    text: '#d96800',
  },

  Hired: {
    background:
      'linear-gradient(180deg, #fbfffc 0%, #effaf2 100%)',
    header: '#e4f7e8',
    border: '#d1ead7',
    text: '#108332',
  },
};

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

export default EmployerPipelinePage;