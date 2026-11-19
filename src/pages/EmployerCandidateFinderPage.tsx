import { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import BookmarkOutlinedIcon from '@mui/icons-material/BookmarkOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined';

type FinderTab = 'find' | 'saved' | 'shortlisted' | 'outreach';

type Candidate = {
  id: number;
  initials: string;
  name: string;
  title: string;
  experience: number;
  location: string;
  education: string;
  match: number;
  skills: string[];
};

const candidates: Candidate[] = [
  {
    id: 1,
    initials: 'RS',
    name: 'Rohan Sharma',
    title: 'Senior Frontend Developer',
    experience: 5.5,
    location: 'Pune, India',
    education: 'B.E. Computer Engineering',
    match: 96,
    skills: ['React', 'TypeScript', 'Redux', 'Next.js'],
  },
  {
    id: 2,
    initials: 'AP',
    name: 'Ananya Patel',
    title: 'Frontend Developer',
    experience: 6.2,
    location: 'Bengaluru, India',
    education: 'B.Tech Computer Science',
    match: 94,
    skills: ['React', 'JavaScript', 'TypeScript', 'Material UI'],
  },
  {
    id: 3,
    initials: 'MK',
    name: 'Mohan Kumar',
    title: 'Senior React Developer',
    experience: 5.8,
    location: 'Hyderabad, India',
    education: 'B.Tech Information Technology',
    match: 92,
    skills: ['React', 'TypeScript', 'Redux', 'Node.js'],
  },
  {
    id: 4,
    initials: 'PK',
    name: 'Priya Kulkarni',
    title: 'React Developer',
    experience: 6.8,
    location: 'Pune, India',
    education: 'MCA',
    match: 91,
    skills: ['React', 'JavaScript', 'Next.js', 'Tailwind CSS'],
  },
  {
    id: 5,
    initials: 'AM',
    name: 'Arjun Mehta',
    title: 'Frontend Lead',
    experience: 7.4,
    location: 'Mumbai, India',
    education: 'B.E. Information Technology',
    match: 90,
    skills: ['React', 'TypeScript', 'Redux', 'Jest'],
  },
];

const availableSkills = [
  'React',
  'TypeScript',
  'JavaScript',
  'Redux',
  'Next.js',
  'Angular',
  'Node.js',
];

export const EmployerCandidateFinderPage = () => {
  const [tab, setTab] = useState<FinderTab>('find');

  const [role, setRole] = useState('Senior React Developer');

  const [skills, setSkills] = useState<string[]>([
    'React',
    'TypeScript',
    'JavaScript',
    'Redux',
  ]);

  const [experience, setExperience] = useState('5-8');
  const [location, setLocation] = useState('Pune, India');
  const [workMode, setWorkMode] = useState('any');

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [education, setEducation] = useState('any');
  const [noticePeriod, setNoticePeriod] = useState('any');

  const [activelyLooking, setActivelyLooking] = useState(false);
  const [verifiedEvidence, setVerifiedEvidence] = useState(false);

  const [sort, setSort] = useState('match');

  const [saved, setSaved] = useState<number[]>([]);
  const [shortlisted, setShortlisted] = useState<number[]>([]);
  const [outreach, setOutreach] = useState<number[]>([]);

  const sortedCandidates = useMemo(() => {
    const result = [...candidates];

    if (sort === 'experience') {
      return result.sort((a, b) => b.experience - a.experience);
    }

    if (sort === 'name') {
      return result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result.sort((a, b) => b.match - a.match);
  }, [sort]);

  const visibleCandidates = useMemo(() => {
    if (tab === 'saved') {
      return sortedCandidates.filter((candidate) =>
        saved.includes(candidate.id),
      );
    }

    if (tab === 'shortlisted') {
      return sortedCandidates.filter((candidate) =>
        shortlisted.includes(candidate.id),
      );
    }

    if (tab === 'outreach') {
      return sortedCandidates.filter((candidate) =>
        outreach.includes(candidate.id),
      );
    }

    return sortedCandidates;
  }, [outreach, saved, shortlisted, sortedCandidates, tab]);

  const toggleSaved = (candidateId: number) => {
    setSaved((current) =>
      current.includes(candidateId)
        ? current.filter((id) => id !== candidateId)
        : [...current, candidateId],
    );
  };

  const toggleShortlist = (candidateId: number) => {
    setShortlisted((current) =>
      current.includes(candidateId)
        ? current.filter((id) => id !== candidateId)
        : [...current, candidateId],
    );
  };

  const toggleOutreach = (candidateId: number) => {
    setOutreach((current) =>
      current.includes(candidateId)
        ? current.filter((id) => id !== candidateId)
        : [...current, candidateId],
    );
  };

  const removeSkill = (skill: string) => {
    setSkills((current) => current.filter((item) => item !== skill));
  };

  const addSkill = (skill: string) => {
    if (!skills.includes(skill)) {
      setSkills((current) => [...current, skill]);
    }
  };

  const handleFindCandidates = () => {
    /*
     * UI-only.
     * Connect this action to the real CareerHarbor candidate
     * matching/search API when the backend contract is ready.
     */
    setTab('find');
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
        spacing={0.8}
        alignItems="center"
        sx={{ mb: 1.4 }}
      >
        <Typography
          sx={{
            fontSize: '0.68rem',
            color: '#64748b',
          }}
        >
          Candidates
        </Typography>

        <Typography
          sx={{
            fontSize: '0.68rem',
            color: '#94a3b8',
          }}
        >
          /
        </Typography>

        <Typography
          sx={{
            fontSize: '0.68rem',
            fontWeight: 900,
            color: '#17233d',
          }}
        >
          AI Candidate Finder
        </Typography>
      </Stack>

      {/* AI Hero */}
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #dddfff',
          borderRadius: '14px',
          px: { xs: 2, md: 2.5 },
          py: { xs: 2, md: 2.2 },
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
            top: -170,
            border: '35px solid rgba(91,75,255,0.05)',
          }}
        />

        <Stack direction="row" spacing={1.5} alignItems="center">
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
            <AutoAwesomeOutlinedIcon sx={{ fontSize: 29 }} />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                fontWeight: 950,
                color: '#0f1b39',
              }}
            >
              AI Candidate Finder
            </Typography>

            <Typography
              sx={{
                mt: 0.25,
                fontSize: '0.78rem',
                color: '#425477',
              }}
            >
              Use AI to find the best matching candidates from our talent pool.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Tabs */}
      <Box
        sx={{
          mt: 1.4,
          borderBottom: '1px solid #dfe6ef',
          display: 'flex',
          overflowX: 'auto',
          gap: 1.5,
        }}
      >
        <FinderTabButton
          active={tab === 'find'}
          label="Find Candidates"
          icon={<PersonSearchOutlinedIcon />}
          onClick={() => setTab('find')}
        />

        <FinderTabButton
          active={tab === 'saved'}
          label={`Saved Searches (${saved.length})`}
          icon={<BookmarkBorderOutlinedIcon />}
          onClick={() => setTab('saved')}
        />

        <FinderTabButton
          active={tab === 'shortlisted'}
          label={`Shortlisted (${shortlisted.length})`}
          icon={<StarBorderOutlinedIcon />}
          onClick={() => setTab('shortlisted')}
        />

        <FinderTabButton
          active={tab === 'outreach'}
          label={`Outreach (${outreach.length})`}
          icon={<SendOutlinedIcon />}
          onClick={() => setTab('outreach')}
        />
      </Box>

      {/* Main */}
      <Box
        sx={{
          mt: 1.5,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '330px minmax(0, 1fr)',
          },
          gap: 1.5,
          alignItems: 'start',
        }}
      >
        {/* Search Criteria */}
        <Paper
          elevation={0}
          sx={{
            p: 1.8,
            border: '1px solid #dfe6ef',
            borderRadius: '13px',
          }}
        >
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 950,
              color: '#101d38',
              mb: 1.5,
            }}
          >
            Search Criteria
          </Typography>

          <FieldLabel>Job / Role</FieldLabel>

          <TextField
            fullWidth
            size="small"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon sx={{ fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
            sx={inputStyles}
          />

          <FieldLabel>Skills (optional)</FieldLabel>

          <Paper
            elevation={0}
            sx={{
              p: 0.8,
              minHeight: 66,
              border: '1px solid #ccd6e4',
              borderRadius: '8px',
            }}
          >
            <Stack direction="row" gap={0.6} flexWrap="wrap">
              {skills.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  onDelete={() => removeSkill(skill)}
                  size="small"
                  sx={{
                    height: 25,
                    backgroundColor: '#e5efff',
                    color: '#0756c9',
                    fontSize: '0.66rem',
                    fontWeight: 850,
                  }}
                />
              ))}
            </Stack>
          </Paper>

          <Select
            fullWidth
            size="small"
            displayEmpty
            value=""
            onChange={(event) => {
              const value = event.target.value;

              if (value) {
                addSkill(value);
              }
            }}
            sx={{
              ...selectStyles,
              mt: 0.6,
            }}
          >
            <MenuItem value="">Add another skill</MenuItem>

            {availableSkills
              .filter((skill) => !skills.includes(skill))
              .map((skill) => (
                <MenuItem key={skill} value={skill}>
                  {skill}
                </MenuItem>
              ))}
          </Select>

          <FieldLabel>Experience</FieldLabel>

          <Select
            fullWidth
            size="small"
            value={experience}
            onChange={(event) => setExperience(event.target.value)}
            sx={selectStyles}
          >
            <MenuItem value="0-2">0 - 2 years</MenuItem>
            <MenuItem value="2-5">2 - 5 years</MenuItem>
            <MenuItem value="5-8">5 - 8 years</MenuItem>
            <MenuItem value="8-12">8 - 12 years</MenuItem>
            <MenuItem value="12+">12+ years</MenuItem>
          </Select>

          <FieldLabel>Location</FieldLabel>

          <Select
            fullWidth
            size="small"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            sx={selectStyles}
          >
            <MenuItem value="Pune, India">Pune, India</MenuItem>
            <MenuItem value="Bengaluru, India">Bengaluru, India</MenuItem>
            <MenuItem value="Mumbai, India">Mumbai, India</MenuItem>
            <MenuItem value="Hyderabad, India">Hyderabad, India</MenuItem>
            <MenuItem value="Remote">Remote</MenuItem>
          </Select>

          <FieldLabel>Work Mode</FieldLabel>

          <RadioGroup
            row
            value={workMode}
            onChange={(event) => setWorkMode(event.target.value)}
            sx={{
              gap: 0.5,
              flexWrap: 'wrap',

              '& .MuiFormControlLabel-root': {
                mr: 1,
              },

              '& .MuiFormControlLabel-label': {
                fontSize: '0.68rem',
                color: '#334155',
              },

              '& .MuiRadio-root': {
                p: 0.5,
              },

              '& .MuiSvgIcon-root': {
                fontSize: 17,
              },
            }}
          >
            <FormControlLabel value="any" control={<Radio />} label="Any" />
            <FormControlLabel value="remote" control={<Radio />} label="Remote" />
            <FormControlLabel value="hybrid" control={<Radio />} label="Hybrid" />
            <FormControlLabel value="onsite" control={<Radio />} label="On-site" />
          </RadioGroup>

          <Button
            onClick={() => setAdvancedOpen((current) => !current)}
            endIcon={
              <ExpandMoreIcon
                sx={{
                  transform: advancedOpen ? 'rotate(180deg)' : 'none',
                  transition: '0.2s',
                }}
              />
            }
            sx={{
              mt: 0.5,
              px: 0,
              textTransform: 'none',
              fontSize: '0.7rem',
              fontWeight: 900,
            }}
          >
            Advanced Filters
          </Button>

          <Collapse in={advancedOpen}>
            <Box
              sx={{
                mt: 0.7,
                pt: 1,
                borderTop: '1px solid #edf1f5',
              }}
            >
              <FieldLabel>Education</FieldLabel>

              <Select
                fullWidth
                size="small"
                value={education}
                onChange={(event) => setEducation(event.target.value)}
                sx={selectStyles}
              >
                <MenuItem value="any">Any Education</MenuItem>
                <MenuItem value="graduate">Graduate</MenuItem>
                <MenuItem value="postgraduate">Post Graduate</MenuItem>
              </Select>

              <FieldLabel>Notice Period</FieldLabel>

              <Select
                fullWidth
                size="small"
                value={noticePeriod}
                onChange={(event) => setNoticePeriod(event.target.value)}
                sx={selectStyles}
              >
                <MenuItem value="any">Any Notice Period</MenuItem>
                <MenuItem value="immediate">Immediate</MenuItem>
                <MenuItem value="15">Within 15 days</MenuItem>
                <MenuItem value="30">Within 30 days</MenuItem>
                <MenuItem value="60">Within 60 days</MenuItem>
              </Select>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={activelyLooking}
                    onChange={(event) =>
                      setActivelyLooking(event.target.checked)
                    }
                    size="small"
                  />
                }
                label="Actively looking candidates"
                sx={checkboxStyles}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={verifiedEvidence}
                    onChange={(event) =>
                      setVerifiedEvidence(event.target.checked)
                    }
                    size="small"
                  />
                }
                label="Verified skill evidence"
                sx={checkboxStyles}
              />
            </Box>
          </Collapse>

          <Divider sx={{ my: 1.4 }} />

          <Button
            fullWidth
            variant="contained"
            startIcon={<AutoAwesomeOutlinedIcon />}
            onClick={handleFindCandidates}
            sx={{
              minHeight: 44,
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '0.78rem',
              fontWeight: 900,
              boxShadow: 'none',
              background:
                'linear-gradient(90deg, #0878f5 0%, #164ce7 100%)',

              '&:hover': {
                boxShadow: 'none',
                background:
                  'linear-gradient(90deg, #066bdc 0%, #1244cf 100%)',
              },
            }}
          >
            Find Candidates with AI
          </Button>
        </Paper>

        {/* Candidate Results */}
        <Paper
          elevation={0}
          sx={{
            p: 1.6,
            border: '1px solid #dfe6ef',
            borderRadius: '13px',
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              gap: 1.2,
              mb: 1.4,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: '1rem',
                  fontWeight: 950,
                  color: '#101d38',
                }}
              >
                {tab === 'find' && 'Top Matching Candidates (128)'}
                {tab === 'saved' && `Saved Candidates (${saved.length})`}
                {tab === 'shortlisted' &&
                  `Shortlisted Candidates (${shortlisted.length})`}
                {tab === 'outreach' &&
                  `Outreach Candidates (${outreach.length})`}
              </Typography>

              <Typography
                sx={{
                  mt: 0.2,
                  fontSize: '0.69rem',
                  color: '#65738a',
                }}
              >
                {tab === 'find'
                  ? 'AI-ranked candidates based on skills, experience, role fit and profile relevance.'
                  : 'Manage candidates from your current AI Candidate Finder session.'}
              </Typography>
            </Box>

            <Stack direction="row" spacing={0.7} alignItems="center">
              <Typography
                sx={{
                  fontSize: '0.66rem',
                  color: '#52627a',
                }}
              >
                Sort by:
              </Typography>

              <Select
                size="small"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                sx={{
                  width: 140,
                  height: 36,
                  borderRadius: '8px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                }}
              >
                <MenuItem value="match">Best Match</MenuItem>
                <MenuItem value="experience">Experience</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </Select>
            </Stack>
          </Box>

          {visibleCandidates.length > 0 ? (
            <Stack spacing={1}>
              {visibleCandidates.map((candidate, index) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  index={index}
                  saved={saved.includes(candidate.id)}
                  shortlisted={shortlisted.includes(candidate.id)}
                  outreach={outreach.includes(candidate.id)}
                  onSave={() => toggleSaved(candidate.id)}
                  onShortlist={() => toggleShortlist(candidate.id)}
                  onOutreach={() => toggleOutreach(candidate.id)}
                />
              ))}
            </Stack>
          ) : (
            <EmptyResults tab={tab} onBack={() => setTab('find')} />
          )}

          {tab === 'find' && (
            <Box
              sx={{
                mt: 1.5,
                p: 1.2,
                borderRadius: '9px',
                backgroundColor: '#f8faff',
                border: '1px solid #e6ecf5',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.64rem',
                  color: '#748197',
                }}
              >
                Candidate results and AI match scores on this screen are demo
                frontend data. Real ranking, availability and candidate data
                should be populated only after the Candidate Finder API is
                connected.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

const CandidateCard = ({
  candidate,
  index,
  saved,
  shortlisted,
  outreach,
  onSave,
  onShortlist,
  onOutreach,
}: {
  candidate: Candidate;
  index: number;
  saved: boolean;
  shortlisted: boolean;
  outreach: boolean;
  onSave: () => void;
  onShortlist: () => void;
  onOutreach: () => void;
}) => {
  const avatarBackgrounds = [
    '#eee8ff',
    '#e4efff',
    '#eeeaff',
    '#e3f7e8',
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
    <Paper
      elevation={0}
      sx={{
        p: 1.35,
        border: '1px solid #e0e7ef',
        borderRadius: '11px',

        '&:hover': {
          borderColor: '#bfcde0',
          boxShadow: '0 3px 12px rgba(24, 50, 86, 0.05)',
        },
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'minmax(0, 1fr) auto',
          },
          gap: 1.2,
          alignItems: 'center',
        }}
      >
        <Stack direction="row" spacing={1.2} minWidth={0}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              flexShrink: 0,
              backgroundColor: avatarBackgrounds[index % avatarBackgrounds.length],
              color: avatarColors[index % avatarColors.length],
              fontSize: '0.88rem',
              fontWeight: 950,
            }}
          >
            {candidate.initials}
          </Avatar>

          <Box minWidth={0} flex={1}>
            <Stack
              direction="row"
              spacing={0.6}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <Typography
                sx={{
                  fontSize: '0.82rem',
                  fontWeight: 950,
                  color: '#101d38',
                }}
              >
                {candidate.name}
              </Typography>

              <CheckCircleIcon
                sx={{
                  fontSize: 15,
                  color: '#0874eb',
                }}
              />

              <Chip
                label={`${candidate.match}% Match`}
                size="small"
                sx={{
                  ml: { sm: 1 },
                  height: 24,
                  backgroundColor: '#dcf6df',
                  color: '#17752f',
                  fontSize: '0.65rem',
                  fontWeight: 950,
                }}
              />
            </Stack>

            <Typography
              sx={{
                mt: 0.1,
                fontSize: '0.68rem',
                color: '#43526a',
              }}
            >
              {candidate.title}
            </Typography>

            <Stack
              direction="row"
              gap={1.3}
              flexWrap="wrap"
              useFlexGap
              sx={{ mt: 0.65 }}
            >
              <CandidateMeta
                icon={<WorkHistoryOutlinedIcon />}
                text={`${candidate.experience} years`}
              />

              <CandidateMeta
                icon={<LocationOnOutlinedIcon />}
                text={candidate.location}
              />

              <CandidateMeta
                icon={<BusinessCenterOutlinedIcon />}
                text={candidate.skills.join(' · ')}
              />
            </Stack>

            <Stack
              direction="row"
              spacing={0.5}
              flexWrap="wrap"
              useFlexGap
              sx={{
                mt: 0.7,
                display: { xs: 'flex', lg: 'none' },
              }}
            >
              {candidate.skills.slice(0, 4).map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.59rem',
                    backgroundColor: '#f2f6fb',
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={0.7}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{
            justifyContent: {
              xs: 'flex-start',
              md: 'flex-end',
            },
          }}
        >
          <IconButton
            title={saved ? 'Remove saved candidate' : 'Save candidate'}
            onClick={onSave}
            sx={iconButtonStyles}
          >
            {saved ? (
              <BookmarkOutlinedIcon />
            ) : (
              <BookmarkBorderOutlinedIcon />
            )}
          </IconButton>

          <Button
            variant="outlined"
            startIcon={<SchoolOutlinedIcon />}
            sx={secondaryButtonStyles}
          >
            View Profile
          </Button>

          <Button
            variant={shortlisted ? 'outlined' : 'contained'}
            onClick={onShortlist}
            sx={{
              ...primaryButtonStyles,
              ...(shortlisted && {
                color: '#16803c',
                borderColor: '#a8dcb7',
                backgroundColor: '#effaf2',
              }),
            }}
          >
            {shortlisted ? 'Shortlisted' : 'Shortlist'}
          </Button>

          <IconButton
            title={outreach ? 'Remove from outreach' : 'Add to outreach'}
            onClick={onOutreach}
            sx={{
              ...iconButtonStyles,
              ...(outreach && {
                color: '#1261d7',
                backgroundColor: '#eaf2ff',
              }),
            }}
          >
            <SendOutlinedIcon />
          </IconButton>
        </Stack>
      </Box>
    </Paper>
  );
};

const CandidateMeta = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) => (
  <Stack direction="row" spacing={0.45} alignItems="center">
    <Box
      sx={{
        display: 'flex',
        color: '#52627a',

        '& svg': {
          fontSize: 14,
        },
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        fontSize: '0.62rem',
        color: '#44536a',
      }}
    >
      {text}
    </Typography>
  </Stack>
);

const FinderTabButton = ({
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
      minHeight: 43,
      px: 1.7,
      borderRadius: '8px 8px 0 0',
      borderBottom: active
        ? '2px solid #1261d7'
        : '2px solid transparent',
      backgroundColor: active ? '#eef5ff' : 'transparent',
      color: active ? '#0758ce' : '#35445d',
      textTransform: 'none',
      fontSize: '0.72rem',
      fontWeight: active ? 900 : 750,

      '&:hover': {
        backgroundColor: active ? '#e7f1ff' : '#f7f9fc',
      },

      '& .MuiButton-startIcon svg': {
        fontSize: 18,
      },
    }}
  >
    {label}
  </Button>
);

const FieldLabel = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <Typography
    sx={{
      mt: 1.1,
      mb: 0.45,
      fontSize: '0.69rem',
      fontWeight: 900,
      color: '#17233c',
    }}
  >
    {children}
  </Typography>
);

const EmptyResults = ({
  tab,
  onBack,
}: {
  tab: FinderTab;
  onBack: () => void;
}) => {
  const title =
    tab === 'saved'
      ? 'No saved candidates'
      : tab === 'shortlisted'
        ? 'No shortlisted candidates'
        : 'No outreach candidates';

  return (
    <Box
      sx={{
        py: 9,
        px: 2,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 58,
          height: 58,
          mx: 'auto',
          borderRadius: '50%',
          backgroundColor: '#edf3fb',
          color: '#5c6e88',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PersonSearchOutlinedIcon />
      </Box>

      <Typography
        sx={{
          mt: 1.2,
          fontSize: '0.9rem',
          fontWeight: 900,
          color: '#263750',
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 0.4,
          fontSize: '0.7rem',
          color: '#758298',
        }}
      >
        Find candidates and add them to this list.
      </Typography>

      <Button
        onClick={onBack}
        sx={{
          mt: 1,
          textTransform: 'none',
          fontSize: '0.7rem',
          fontWeight: 900,
        }}
      >
        Find Candidates
      </Button>
    </Box>
  );
};

const inputStyles = {
  '& .MuiOutlinedInput-root': {
    height: 38,
    borderRadius: '8px',
    fontSize: '0.7rem',
  },
};

const selectStyles = {
  height: 38,
  borderRadius: '8px',
  fontSize: '0.7rem',
};

const checkboxStyles = {
  display: 'flex',
  mt: 0.25,

  '& .MuiFormControlLabel-label': {
    fontSize: '0.66rem',
    color: '#40516b',
  },
};

const iconButtonStyles = {
  width: 36,
  height: 36,
  border: '1px solid #ccd6e3',
  borderRadius: '8px',
  color: '#31425c',

  '& svg': {
    fontSize: 17,
  },
};

const secondaryButtonStyles = {
  height: 36,
  px: 1.3,
  borderRadius: '8px',
  borderColor: '#ccd6e3',
  color: '#17233c',
  textTransform: 'none',
  fontSize: '0.67rem',
  fontWeight: 900,

  '& .MuiButton-startIcon': {
    mr: 0.5,

    '& svg': {
      fontSize: 15,
    },
  },
};

const primaryButtonStyles = {
  height: 36,
  minWidth: 90,
  px: 1.5,
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '0.68rem',
  fontWeight: 900,
  boxShadow: 'none',

  '&:hover': {
    boxShadow: 'none',
  },
};

export default EmployerCandidateFinderPage;