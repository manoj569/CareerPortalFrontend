import { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchIcon from '@mui/icons-material/Search';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import { useNavigate } from 'react-router-dom';
type CandidateTab =
  | 'all'
  | 'shortlisted'
  | 'process'
  | 'hired'
  | 'archived';

type CandidateStage =
  | 'Applied'
  | 'Screening'
  | 'Interview'
  | 'In Review'
  | 'Offer'
  | 'Hired'
  | 'Archived';

type Candidate = {
  id: number;
  initials: string;
  name: string;
  email: string;
  role: string;
  jobId: string;
  experience: number;
  location: string;
  stage: CandidateStage;
  match: number;
  appliedOn: string;
  source: string;
  shortlisted: boolean;
};

const initialCandidates: Candidate[] = [
  {
    id: 1,
    initials: 'RS',
    name: 'Rohan Sharma',
    email: 'rohan.sharma@email.com',
    role: 'Senior React Developer',
    jobId: '#SRD-1024',
    experience: 5.5,
    location: 'Pune, India',
    stage: 'Screening',
    match: 96,
    appliedOn: 'Nov 18, 2026',
    source: 'CareerHarbor',
    shortlisted: true,
  },
  {
    id: 2,
    initials: 'AP',
    name: 'Ananya Patel',
    email: 'ananya.patel@email.com',
    role: 'Frontend Developer',
    jobId: '#SRD-1024',
    experience: 6.2,
    location: 'Bengaluru, India',
    stage: 'Interview',
    match: 94,
    appliedOn: 'Nov 18, 2026',
    source: 'CareerHarbor',
    shortlisted: true,
  },
  {
    id: 3,
    initials: 'MK',
    name: 'Mohan Kumar',
    email: 'mohan.kumar@email.com',
    role: 'Senior React Developer',
    jobId: '#SRD-1024',
    experience: 5.8,
    location: 'Hyderabad, India',
    stage: 'Interview',
    match: 92,
    appliedOn: 'Nov 17, 2026',
    source: 'AI Finder',
    shortlisted: false,
  },
  {
    id: 4,
    initials: 'PK',
    name: 'Priya Kulkarni',
    email: 'priya.kulkarni@email.com',
    role: 'React Developer',
    jobId: '#SRD-1024',
    experience: 6.8,
    location: 'Pune, India',
    stage: 'In Review',
    match: 91,
    appliedOn: 'Nov 18, 2026',
    source: 'Referral',
    shortlisted: false,
  },
  {
    id: 5,
    initials: 'AM',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@email.com',
    role: 'Frontend Lead',
    jobId: '#SRD-1024',
    experience: 7.4,
    location: 'Mumbai, India',
    stage: 'Offer',
    match: 90,
    appliedOn: 'Nov 15, 2026',
    source: 'CareerHarbor',
    shortlisted: true,
  },
];

const tabCounts = {
  all: 342,
  shortlisted: 28,
  process: 54,
  hired: 12,
  archived: 18,
};

export const EmployerCandidatesPage = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] =
    useState<Candidate[]>(initialCandidates);

  const [tab, setTab] = useState<CandidateTab>('all');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [stage, setStage] = useState('all');
  const [source, setSource] = useState('all');
  const [time, setTime] = useState('all');
  const [view, setView] = useState<'table' | 'grid'>('table');

  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesSearch =
        !query ||
        candidate.name.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query) ||
        candidate.role.toLowerCase().includes(query) ||
        candidate.location.toLowerCase().includes(query);

      const matchesRole =
        role === 'all' || candidate.role === role;

      const matchesStage =
        stage === 'all' || candidate.stage === stage;

      const matchesSource =
        source === 'all' || candidate.source === source;

      let matchesTab = true;

      if (tab === 'shortlisted') {
        matchesTab = candidate.shortlisted;
      }

      if (tab === 'process') {
        matchesTab = [
          'Screening',
          'Interview',
          'In Review',
          'Offer',
        ].includes(candidate.stage);
      }

      if (tab === 'hired') {
        matchesTab = candidate.stage === 'Hired';
      }

      if (tab === 'archived') {
        matchesTab = candidate.stage === 'Archived';
      }

      /*
       * "time" is UI-only until real application dates
       * are supplied by the Employer Candidate API.
       */
      const matchesTime = time === 'all' || true;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStage &&
        matchesSource &&
        matchesTab &&
        matchesTime
      );
    });
  }, [candidates, role, search, source, stage, tab, time]);

  const toggleCandidate = (candidateId: number) => {
    setSelected((current) =>
      current.includes(candidateId)
        ? current.filter((id) => id !== candidateId)
        : [...current, candidateId],
    );
  };

  const toggleAllVisible = () => {
    const visibleIds = filteredCandidates.map(
      (candidate) => candidate.id,
    );

    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selected.includes(id));

    if (allSelected) {
      setSelected((current) =>
        current.filter((id) => !visibleIds.includes(id)),
      );

      return;
    }

    setSelected((current) => [
      ...new Set([...current, ...visibleIds]),
    ]);
  };

  const toggleShortlist = (candidateId: number) => {
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === candidateId
          ? {
              ...candidate,
              shortlisted: !candidate.shortlisted,
            }
          : candidate,
      ),
    );
  };

  const archiveCandidate = (candidateId: number) => {
    /*
     * UI-only state change.
     * Connect to the real Employer Candidate API later.
     */
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === candidateId
          ? {
              ...candidate,
              stage: 'Archived',
            }
          : candidate,
      ),
    );
  };

  const changeStage = (
    candidateId: number,
    nextStage: CandidateStage,
  ) => {
    /*
     * UI-only state change.
     */
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === candidateId
          ? {
              ...candidate,
              stage: nextStage,
            }
          : candidate,
      ),
    );
  };

  return (
    <Box
      sx={{
        px: { xs: 1.5, md: 2 },
        py: 1.6,
        maxWidth: 1650,
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
          Candidates
        </Typography>

        <Typography sx={breadcrumbStyle}>/</Typography>

        <Typography
          sx={{
            ...breadcrumbStyle,
            color: '#17233d',
            fontWeight: 900,
          }}
        >
          Candidates
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
          px: { xs: 2, md: 2.5 },
          py: 2.1,
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
            right: 70,
            top: -170,
            border: '35px solid rgba(91,75,255,0.05)',
          }}
        />

        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
        >
          <Box
            sx={{
              width: 54,
              height: 54,
              flexShrink: 0,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              background:
                'linear-gradient(135deg, #2675f5 0%, #7b43ed 100%)',
            }}
          >
            <GroupsOutlinedIcon sx={{ fontSize: 29 }} />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: {
                  xs: '1.2rem',
                  md: '1.5rem',
                },
                fontWeight: 950,
                color: '#0f1b39',
              }}
            >
              Candidates
            </Typography>

            <Typography
              sx={{
                mt: 0.25,
                fontSize: '0.78rem',
                color: '#425477',
              }}
            >
              Manage your talent pipeline, shortlisted profiles and
              hiring actions.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Tabs */}
      <Box
        sx={{
          mt: 1.3,
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          borderBottom: '1px solid #dfe6ef',
        }}
      >
        <CandidateTabButton
          active={tab === 'all'}
          label={`All Candidates (${tabCounts.all})`}
          icon={<GroupsOutlinedIcon />}
          onClick={() => {
            setTab('all');
            setPage(1);
          }}
        />

        <CandidateTabButton
          active={tab === 'shortlisted'}
          label={`Shortlisted (${tabCounts.shortlisted})`}
          icon={<StarBorderOutlinedIcon />}
          onClick={() => {
            setTab('shortlisted');
            setPage(1);
          }}
        />

        <CandidateTabButton
          active={tab === 'process'}
          label={`In Process (${tabCounts.process})`}
          icon={<WatchLaterOutlinedIcon />}
          onClick={() => {
            setTab('process');
            setPage(1);
          }}
        />

        <CandidateTabButton
          active={tab === 'hired'}
          label={`Hired (${tabCounts.hired})`}
          icon={<CheckCircleOutlineIcon />}
          onClick={() => {
            setTab('hired');
            setPage(1);
          }}
        />

        <CandidateTabButton
          active={tab === 'archived'}
          label={`Archived (${tabCounts.archived})`}
          icon={<ArchiveOutlinedIcon />}
          onClick={() => {
            setTab('archived');
            setPage(1);
          }}
        />
      </Box>

      {/* Summary */}
      <Box
        sx={{
          mt: 1.4,
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(5, minmax(0, 1fr))',
          },
          gap: 1.1,
        }}
      >
        <SummaryCard
          icon={<GroupsOutlinedIcon />}
          value="342"
          label="Total Candidates"
          background="#e7f0ff"
          color="#0874eb"
        />

        <SummaryCard
          icon={<StarBorderOutlinedIcon />}
          value="28"
          label="Shortlisted"
          background="#e4f7e8"
          color="#14943d"
        />

        <SummaryCard
          icon={<WatchLaterOutlinedIcon />}
          value="54"
          label="In Process"
          background="#efe5ff"
          color="#7337d4"
        />

        <SummaryCard
          icon={<CheckCircleOutlineIcon />}
          value="12"
          label="Hired"
          background="#e3f7e7"
          color="#15803d"
        />

        <SummaryCard
          icon={<ArchiveOutlinedIcon />}
          value="18"
          label="Archived"
          background="#edf2f8"
          color="#40516b"
        />
      </Box>

      {/* Candidate area */}
      <Paper
        elevation={0}
        sx={{
          mt: 1.4,
          border: '1px solid #dfe6ef',
          borderRadius: '13px',
          overflow: 'hidden',
        }}
      >
        {/* Filters */}
        <Box
          sx={{
            p: 1.1,
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'minmax(240px, 1.6fr) repeat(4, minmax(120px, 0.75fr)) auto',
            },
            gap: 0.8,
            alignItems: 'center',
            borderBottom: '1px solid #e6ebf2',
          }}
        >
          <TextField
            size="small"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search candidates by name, role, skills..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    sx={{
                      fontSize: 18,
                      color: '#65738a',
                    }}
                  />
                </InputAdornment>
              ),
            }}
            sx={filterInputStyles}
          />

          <Select
            size="small"
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setPage(1);
            }}
            sx={filterSelectStyles}
          >
            <MenuItem value="all">All Roles</MenuItem>
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
            value={stage}
            onChange={(event) => {
              setStage(event.target.value);
              setPage(1);
            }}
            sx={filterSelectStyles}
          >
            <MenuItem value="all">All Stages</MenuItem>
            <MenuItem value="Applied">Applied</MenuItem>
            <MenuItem value="Screening">Screening</MenuItem>
            <MenuItem value="Interview">Interview</MenuItem>
            <MenuItem value="In Review">In Review</MenuItem>
            <MenuItem value="Offer">Offer</MenuItem>
            <MenuItem value="Hired">Hired</MenuItem>
            <MenuItem value="Archived">Archived</MenuItem>
          </Select>

          <Select
            size="small"
            value={source}
            onChange={(event) => {
              setSource(event.target.value);
              setPage(1);
            }}
            sx={filterSelectStyles}
          >
            <MenuItem value="all">All Sources</MenuItem>
            <MenuItem value="CareerHarbor">
              CareerHarbor
            </MenuItem>
            <MenuItem value="AI Finder">AI Finder</MenuItem>
            <MenuItem value="Referral">Referral</MenuItem>
          </Select>

          <Select
            size="small"
            value={time}
            onChange={(event) => {
              setTime(event.target.value);
              setPage(1);
            }}
            sx={filterSelectStyles}
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="week">Last 7 Days</MenuItem>
            <MenuItem value="month">Last 30 Days</MenuItem>
          </Select>

          <Stack direction="row" spacing={0.5}>
            <IconButton
              title="Grid view"
              onClick={() => setView('grid')}
              sx={{
                ...viewButtonStyles,
                ...(view === 'grid' && activeViewButtonStyles),
              }}
            >
              <GridViewOutlinedIcon />
            </IconButton>

            <IconButton
              title="Table view"
              onClick={() => setView('table')}
              sx={{
                ...viewButtonStyles,
                ...(view === 'table' && activeViewButtonStyles),
              }}
            >
              <ViewListOutlinedIcon />
            </IconButton>
          </Stack>
        </Box>

        {selected.length > 0 && (
          <Box
            sx={{
              px: 1.5,
              py: 0.8,
              backgroundColor: '#eef5ff',
              borderBottom: '1px solid #dce8f8',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.68rem',
                color: '#0758ce',
                fontWeight: 850,
              }}
            >
              {selected.length} candidate
              {selected.length === 1 ? '' : 's'} selected
            </Typography>
          </Box>
        )}

        {view === 'table' ? (
          <CandidateTable
  candidates={filteredCandidates}
  selected={selected}
  onToggle={toggleCandidate}
  onToggleAll={toggleAllVisible}
  onShortlist={toggleShortlist}
  onArchive={archiveCandidate}
  onChangeStage={changeStage}
  onView={(candidateId) =>
    navigate(`/employer/candidates/${candidateId}`)
  }
/>
        ) : (
          <CandidateGrid
  candidates={filteredCandidates}
  selected={selected}
  onToggle={toggleCandidate}
  onShortlist={toggleShortlist}
  onView={(candidateId) =>
    navigate(`/employer/candidates/${candidateId}`)
  }
/>
        )}
      </Paper>

      {/* Pagination */}
      <Box
        sx={{
          mt: 1.2,
          display: 'flex',
          alignItems: {
            xs: 'flex-start',
            md: 'center',
          },
          justifyContent: 'space-between',
          flexDirection: {
            xs: 'column',
            md: 'row',
          },
          gap: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.68rem',
            color: '#40516b',
          }}
        >
          Showing 1 – {Math.min(rowsPerPage, 342)} of 342 candidates
        </Typography>

        <Stack
          direction="row"
          spacing={0.6}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          <Typography
            sx={{
              fontSize: '0.66rem',
              color: '#40516b',
            }}
          >
            Rows per page:
          </Typography>

          <Select
            size="small"
            value={rowsPerPage}
            onChange={(event) =>
              setRowsPerPage(Number(event.target.value))
            }
            sx={{
              width: 72,
              height: 34,
              fontSize: '0.67rem',
              borderRadius: '7px',
            }}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </Select>

          <IconButton
            disabled={page === 1}
            onClick={() =>
              setPage((current) => Math.max(1, current - 1))
            }
            sx={paginationButtonStyles}
          >
            <NavigateBeforeIcon />
          </IconButton>

          {[1, 2, 3, 4, 5].map((pageNumber) => (
            <Button
              key={pageNumber}
              onClick={() => setPage(pageNumber)}
              sx={{
                ...paginationNumberStyles,
                ...(page === pageNumber && {
                  color: '#fff',
                  backgroundColor: '#0867e8',

                  '&:hover': {
                    backgroundColor: '#075acb',
                  },
                }),
              }}
            >
              {pageNumber}
            </Button>
          ))}

          <Typography sx={{ px: 0.3 }}>...</Typography>

          <Button
            onClick={() => setPage(69)}
            sx={{
              ...paginationNumberStyles,
              ...(page === 69 && {
                color: '#fff',
                backgroundColor: '#0867e8',
              }),
            }}
          >
            69
          </Button>

          <IconButton
            disabled={page === 69}
            onClick={() =>
              setPage((current) => Math.min(69, current + 1))
            }
            sx={paginationButtonStyles}
          >
            <NavigateNextIcon />
          </IconButton>
        </Stack>
      </Box>

      <Typography
        sx={{
          mt: 0.8,
          fontSize: '0.62rem',
          color: '#7b8799',
        }}
      >
        Candidate counts and profiles on this screen are demo frontend
        data. Candidate actions are UI-only until the Employer Candidate
        API is connected.
      </Typography>
    </Box>
  );
};

const CandidateTable = ({
  candidates,
  selected,
  onToggle,
  onToggleAll,
  onShortlist,
  onArchive,
  onChangeStage,
  onView,
}: {
  candidates: Candidate[];
  selected: number[];
  onToggle: (id: number) => void;
  onToggleAll: () => void;
  onShortlist: (id: number) => void;
  onArchive: (id: number) => void;
  onChangeStage: (
    id: number,
    stage: CandidateStage,
  ) => void;
  onView: (id: number) => void;
}) => (
  <TableContainer>
    <Table
      sx={{
        minWidth: 1120,

        '& .MuiTableCell-root': {
          borderColor: '#e8edf3',
        },
      }}
    >
      <TableHead>
        <TableRow
          sx={{
            backgroundColor: '#f6f8fb',
          }}
        >
          <HeaderCell width={44}>
            <Checkbox
              size="small"
              checked={
                candidates.length > 0 &&
                candidates.every((candidate) =>
                  selected.includes(candidate.id),
                )
              }
              indeterminate={
                candidates.some((candidate) =>
                  selected.includes(candidate.id),
                ) &&
                !candidates.every((candidate) =>
                  selected.includes(candidate.id),
                )
              }
              onChange={onToggleAll}
            />
          </HeaderCell>

          <HeaderCell>Candidate</HeaderCell>
          <HeaderCell>Role / Applied For</HeaderCell>
          <HeaderCell>Experience</HeaderCell>
          <HeaderCell>Location</HeaderCell>
          <HeaderCell>Current Stage</HeaderCell>
          <HeaderCell>Match</HeaderCell>
          <HeaderCell>Applied On</HeaderCell>
          <HeaderCell>Actions</HeaderCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {candidates.length > 0 ? (
          candidates.map((candidate, index) => (
            <CandidateRow
              key={candidate.id}
              candidate={candidate}
              index={index}
              selected={selected.includes(candidate.id)}
              onToggle={() => onToggle(candidate.id)}
              onShortlist={() =>
                onShortlist(candidate.id)
              }
              onArchive={() => onArchive(candidate.id)}
              onChangeStage={(stage) =>
                onChangeStage(candidate.id, stage)
              }
                onView={() => onView(candidate.id)}

            />
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={9}>
              <Box
                sx={{
                  py: 7,
                  textAlign: 'center',
                }}
              >
                <GroupsOutlinedIcon
                  sx={{
                    fontSize: 35,
                    color: '#aab6c6',
                  }}
                />

                <Typography
                  sx={{
                    mt: 0.7,
                    fontSize: '0.82rem',
                    fontWeight: 900,
                    color: '#40516b',
                  }}
                >
                  No candidates found
                </Typography>

                <Typography
                  sx={{
                    mt: 0.3,
                    fontSize: '0.67rem',
                    color: '#8290a3',
                  }}
                >
                  Try changing your filters or search.
                </Typography>
              </Box>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </TableContainer>
);

const CandidateRow = ({
  candidate,
  index,
  selected,
  onToggle,
  onShortlist,
  onArchive,
  onChangeStage,
  onView,
}: {
  candidate: Candidate;
  index: number;
  selected: boolean;
  onToggle: () => void;
  onShortlist: () => void;
  onArchive: () => void;
  onChangeStage: (stage: CandidateStage) => void;
  onView: () => void;
}) => {
  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null);

  const avatarBackgrounds = [
    '#eee8ff',
    '#e4efff',
    '#eeeaff',
    '#e4f7e8',
    '#ffe8e8',
  ];

  const avatarColors = [
    '#5538c7',
    '#165bc7',
    '#4b45b8',
    '#13813c',
    '#b52635',
  ];

  return (
    <TableRow
      hover
      sx={{
        backgroundColor: selected ? '#f5f9ff' : '#fff',
      }}
    >
      <BodyCell>
        <Checkbox
          size="small"
          checked={selected}
          onChange={onToggle}
        />
      </BodyCell>

      <BodyCell>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <Avatar
            sx={{
              width: 38,
              height: 38,
              backgroundColor:
                avatarBackgrounds[
                  index % avatarBackgrounds.length
                ],
              color:
                avatarColors[index % avatarColors.length],
              fontSize: '0.7rem',
              fontWeight: 950,
            }}
          >
            {candidate.initials}
          </Avatar>

          <Box>
            <Stack
              direction="row"
              spacing={0.4}
              alignItems="center"
            >
              <Typography sx={candidateNameStyle}>
                {candidate.name}
              </Typography>

              <CheckCircleIcon
                sx={{
                  fontSize: 13,
                  color: '#0874eb',
                }}
              />
            </Stack>

            <Typography sx={secondaryTextStyle}>
              {candidate.email}
            </Typography>
          </Box>
        </Stack>
      </BodyCell>

      <BodyCell>
        <Typography sx={primaryCellStyle}>
          {candidate.role}
        </Typography>

        <Typography sx={secondaryTextStyle}>
          Job {candidate.jobId}
        </Typography>
      </BodyCell>

      <BodyCell>
        <Typography sx={primaryCellStyle}>
          {candidate.experience} years
        </Typography>
      </BodyCell>

      <BodyCell>
        <Stack
          direction="row"
          spacing={0.4}
          alignItems="center"
        >
          <LocationOnOutlinedIcon
            sx={{
              fontSize: 14,
              color: '#52627a',
            }}
          />

          <Typography sx={primaryCellStyle}>
            {candidate.location}
          </Typography>
        </Stack>
      </BodyCell>

      <BodyCell>
        <StageChip stage={candidate.stage} />
      </BodyCell>

      <BodyCell>
        <Chip
          label={`${candidate.match}%`}
          size="small"
          sx={{
            height: 22,
            backgroundColor: '#dcf6df',
            color: '#17752f',
            fontSize: '0.62rem',
            fontWeight: 950,
          }}
        />
      </BodyCell>

      <BodyCell>
        <Typography sx={primaryCellStyle}>
          {candidate.appliedOn}
        </Typography>
      </BodyCell>

      <BodyCell>
        <Stack direction="row" spacing={0.4}>
          <IconButton
            title="View candidate"
            onClick={onView}
            sx={actionButtonStyles}
          >
            <VisibilityOutlinedIcon />
          </IconButton>

          <IconButton
            title={
              candidate.shortlisted
                ? 'Remove from shortlist'
                : 'Shortlist'
            }
            onClick={onShortlist}
            sx={{
              ...actionButtonStyles,
              ...(candidate.shortlisted && {
                color: '#1261d7',
                backgroundColor: '#eef5ff',
              }),
            }}
          >
            {candidate.shortlisted ? (
              <StarOutlinedIcon />
            ) : (
              <StarBorderOutlinedIcon />
            )}
          </IconButton>

          <IconButton
            onClick={(event) =>
              setAnchorEl(event.currentTarget)
            }
            sx={actionButtonStyles}
          >
            <MoreHorizIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem
              onClick={() => {
                onChangeStage('Screening');
                setAnchorEl(null);
              }}
            >
              Move to Screening
            </MenuItem>

            <MenuItem
              onClick={() => {
                onChangeStage('Interview');
                setAnchorEl(null);
              }}
            >
              Move to Interview
            </MenuItem>

            <MenuItem
              onClick={() => {
                onChangeStage('Offer');
                setAnchorEl(null);
              }}
            >
              Move to Offer
            </MenuItem>

            <MenuItem
              onClick={() => {
                onChangeStage('Hired');
                setAnchorEl(null);
              }}
            >
              Mark as Hired
            </MenuItem>

            <MenuItem
              onClick={() => {
                onArchive();
                setAnchorEl(null);
              }}
            >
              Archive
            </MenuItem>
          </Menu>
        </Stack>
      </BodyCell>
    </TableRow>
  );
};

const CandidateGrid = ({
  candidates,
  selected,
  onToggle,
  onShortlist,
  onView,
}: {
  candidates: Candidate[];
  selected: number[];
  onToggle: (id: number) => void;
  onShortlist: (id: number) => void;
  onView: (id: number) => void;
}) => (
  <Box
    sx={{
      p: 1.3,
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, minmax(0, 1fr))',
        xl: 'repeat(3, minmax(0, 1fr))',
      },
      gap: 1,
    }}
  >
    {candidates.map((candidate) => (
      <Paper
        key={candidate.id}
        elevation={0}
        sx={{
          p: 1.4,
          border: selected.includes(candidate.id)
            ? '1px solid #86b8ff'
            : '1px solid #e0e7ef',
          borderRadius: '11px',
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: '#e9efff',
                color: '#2459bd',
                fontSize: '0.7rem',
                fontWeight: 950,
              }}
            >
              {candidate.initials}
            </Avatar>

            <Box>
              <Typography sx={candidateNameStyle}>
                {candidate.name}
              </Typography>

              <Typography sx={secondaryTextStyle}>
                {candidate.role}
              </Typography>
            </Box>
          </Stack>

          <Checkbox
            size="small"
            checked={selected.includes(candidate.id)}
            onChange={() => onToggle(candidate.id)}
          />
        </Stack>

        <Stack
          direction="row"
          spacing={0.7}
          alignItems="center"
          sx={{ mt: 1.2 }}
        >
          <StageChip stage={candidate.stage} />

          <Chip
            label={`${candidate.match}% Match`}
            size="small"
            sx={{
              height: 22,
              backgroundColor: '#dcf6df',
              color: '#17752f',
              fontSize: '0.61rem',
              fontWeight: 900,
            }}
          />
        </Stack>

        <Typography
          sx={{
            mt: 1,
            fontSize: '0.65rem',
            color: '#52627a',
          }}
        >
          {candidate.experience} years · {candidate.location}
        </Typography>

        <Stack
          direction="row"
          spacing={0.7}
          sx={{ mt: 1.2 }}
        >
          <Button
            variant="outlined"
            startIcon={<VisibilityOutlinedIcon />}
            onClick={() => onView(candidate.id)}
            sx={gridActionStyle}
          >
            View
          </Button>

          <Button
            variant="outlined"
            onClick={() => onShortlist(candidate.id)}
            startIcon={
              candidate.shortlisted ? (
                <StarOutlinedIcon />
              ) : (
                <StarBorderOutlinedIcon />
              )
            }
            sx={gridActionStyle}
          >
            {candidate.shortlisted
              ? 'Shortlisted'
              : 'Shortlist'}
          </Button>
        </Stack>
      </Paper>
    ))}
  </Box>
);

const StageChip = ({
  stage,
}: {
  stage: CandidateStage;
}) => {
  const styles: Record<
    CandidateStage,
    {
      background: string;
      color: string;
    }
  > = {
    Applied: {
      background: '#e5efff',
      color: '#1261d7',
    },
    Screening: {
      background: '#eee4ff',
      color: '#6430c6',
    },
    Interview: {
      background: '#dfeaff',
      color: '#164eb8',
    },
    'In Review': {
      background: '#fff0d8',
      color: '#a75a00',
    },
    Offer: {
      background: '#dff6e4',
      color: '#16803c',
    },
    Hired: {
      background: '#dff6e4',
      color: '#16803c',
    },
    Archived: {
      background: '#edf1f6',
      color: '#536176',
    },
  };

  return (
    <Chip
      label={stage}
      size="small"
      sx={{
        height: 22,
        backgroundColor: styles[stage].background,
        color: styles[stage].color,
        fontSize: '0.6rem',
        fontWeight: 900,
      }}
    />
  );
};

const CandidateTabButton = ({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) => (
  <Button
    onClick={onClick}
    startIcon={icon}
    sx={{
      flexShrink: 0,
      minHeight: 44,
      px: 1.7,
      borderRadius: '8px 8px 0 0',
      borderBottom: active
        ? '2px solid #1261d7'
        : '2px solid transparent',
      backgroundColor: active
        ? '#eef5ff'
        : 'transparent',
      color: active ? '#0758ce' : '#35445d',
      textTransform: 'none',
      fontSize: '0.7rem',
      fontWeight: active ? 900 : 750,

      '& .MuiButton-startIcon svg': {
        fontSize: 18,
      },
    }}
  >
    {label}
  </Button>
);

const SummaryCard = ({
  icon,
  value,
  label,
  background,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  background: string;
  color: string;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.4,
      border: '1px solid #dfe6ef',
      borderRadius: '12px',
    }}
  >
    <Stack
      direction="row"
      spacing={1.1}
      alignItems="center"
    >
      <Box
        sx={{
          width: 43,
          height: 43,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: background,
          color,

          '& svg': {
            fontSize: 22,
          },
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: '1.1rem',
            fontWeight: 950,
            color: '#101d38',
          }}
        >
          {value}
        </Typography>

        <Typography
          sx={{
            fontSize: '0.65rem',
            color: '#40516b',
          }}
        >
          {label}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

const HeaderCell = ({
  children,
  width,
}: {
  children: React.ReactNode;
  width?: number;
}) => (
  <TableCell
    width={width}
    sx={{
      py: 0.8,
      px: 1,
      fontSize: '0.64rem',
      fontWeight: 900,
      color: '#26364e',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </TableCell>
);

const BodyCell = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <TableCell
    sx={{
      py: 0.8,
      px: 1,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </TableCell>
);

const breadcrumbStyle = {
  fontSize: '0.66rem',
  color: '#64748b',
};

const candidateNameStyle = {
  fontSize: '0.69rem',
  fontWeight: 900,
  color: '#15223d',
};

const primaryCellStyle = {
  fontSize: '0.65rem',
  color: '#26364e',
};

const secondaryTextStyle = {
  mt: 0.1,
  fontSize: '0.6rem',
  color: '#68778c',
};

const filterInputStyles = {
  '& .MuiOutlinedInput-root': {
    height: 38,
    borderRadius: '8px',
    fontSize: '0.68rem',
  },
};

const filterSelectStyles = {
  height: 38,
  borderRadius: '8px',
  fontSize: '0.66rem',
  fontWeight: 750,
};

const viewButtonStyles = {
  width: 38,
  height: 38,
  border: '1px solid #d5deea',
  borderRadius: '8px',
  color: '#40516b',

  '& svg': {
    fontSize: 18,
  },
};

const activeViewButtonStyles = {
  color: '#1261d7',
  backgroundColor: '#eaf2ff',
  borderColor: '#a8c8f8',
};

const actionButtonStyles = {
  width: 30,
  height: 30,
  border: '1px solid #e0e7ef',
  borderRadius: '7px',
  color: '#31425c',

  '& svg': {
    fontSize: 16,
  },
};

const gridActionStyle = {
  minHeight: 32,
  borderRadius: '7px',
  borderColor: '#d3deea',
  color: '#31425c',
  textTransform: 'none',
  fontSize: '0.64rem',
  fontWeight: 850,

  '& .MuiButton-startIcon svg': {
    fontSize: 15,
  },
};

const paginationButtonStyles = {
  width: 34,
  height: 34,
  border: '1px solid #d9e2ed',
  borderRadius: '7px',

  '& svg': {
    fontSize: 18,
  },
};

const paginationNumberStyles = {
  minWidth: 34,
  width: 34,
  height: 34,
  p: 0,
  border: '1px solid #d9e2ed',
  borderRadius: '7px',
  color: '#31425c',
  fontSize: '0.68rem',
  fontWeight: 850,
};

export default EmployerCandidatesPage;