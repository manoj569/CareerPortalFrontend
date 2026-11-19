import { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';

type PipelineStage =
  | 'Applied'
  | 'Screening'
  | 'Interview'
  | 'Offer'
  | 'Hired';

type PipelineCandidate = {
  id: number;
  name: string;
  initials: string;
  role: string;
  experience: number;
  location: string;
  match: number;
  appliedOn: string;
  stage: PipelineStage;
};

const stages: PipelineStage[] = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Hired',
];

const stageTotals: Record<PipelineStage, number> = {
  Applied: 78,
  Screening: 24,
  Interview: 12,
  Offer: 6,
  Hired: 4,
};

const initialCandidates: PipelineCandidate[] = [
  {
    id: 1,
    name: 'Rohan Sharma',
    initials: 'RS',
    role: 'Senior React Developer',
    experience: 5.5,
    location: 'Pune, India',
    match: 96,
    appliedOn: 'Nov 18, 2026',
    stage: 'Applied',
  },
  {
    id: 2,
    name: 'Sneha Desai',
    initials: 'SD',
    role: 'Frontend Developer',
    experience: 7.1,
    location: 'Pune, India',
    match: 85,
    appliedOn: 'Nov 17, 2026',
    stage: 'Applied',
  },
  {
    id: 3,
    name: 'Ananya Patel',
    initials: 'AP',
    role: 'React Developer',
    experience: 6.2,
    location: 'Bengaluru, India',
    match: 92,
    appliedOn: 'Nov 18, 2026',
    stage: 'Screening',
  },
  {
    id: 4,
    name: 'Nikhil Thakur',
    initials: 'NT',
    role: 'Frontend Engineer',
    experience: 5.8,
    location: 'Mumbai, India',
    match: 84,
    appliedOn: 'Nov 16, 2026',
    stage: 'Screening',
  },
  {
    id: 5,
    name: 'Mohan Kumar',
    initials: 'MK',
    role: 'Senior Frontend Engineer',
    experience: 5,
    location: 'Hyderabad, India',
    match: 88,
    appliedOn: 'Nov 17, 2026',
    stage: 'Interview',
  },
  {
    id: 6,
    name: 'Priya Kulkarni',
    initials: 'PK',
    role: 'React Engineer',
    experience: 6.8,
    location: 'Pune, India',
    match: 91,
    appliedOn: 'Nov 15, 2026',
    stage: 'Interview',
  },
  {
    id: 7,
    name: 'Arjun Mehta',
    initials: 'AM',
    role: 'Frontend Lead',
    experience: 7.4,
    location: 'Mumbai, India',
    match: 94,
    appliedOn: 'Nov 14, 2026',
    stage: 'Offer',
  },
  {
    id: 8,
    name: 'Kavya Joshi',
    initials: 'KJ',
    role: 'Senior React Developer',
    experience: 6.1,
    location: 'Pune, India',
    match: 93,
    appliedOn: 'Nov 13, 2026',
    stage: 'Hired',
  },
];

export const EmployerHiringPipelineTab = () => {
  const [candidates, setCandidates] =
    useState<PipelineCandidate[]>(initialCandidates);

  const [search, setSearch] = useState('');
  const [experience, setExperience] = useState('all');
  const [matchScore, setMatchScore] = useState('all');

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesSearch =
        !query ||
        candidate.name.toLowerCase().includes(query) ||
        candidate.role.toLowerCase().includes(query) ||
        candidate.location.toLowerCase().includes(query);

      const matchesExperience =
        experience === 'all' ||
        (experience === '0-3' && candidate.experience <= 3) ||
        (experience === '3-5' &&
          candidate.experience > 3 &&
          candidate.experience <= 5) ||
        (experience === '5-8' &&
          candidate.experience > 5 &&
          candidate.experience <= 8) ||
        (experience === '8+' && candidate.experience > 8);

      const matchesScore =
        matchScore === 'all' ||
        (matchScore === '90+' && candidate.match >= 90) ||
        (matchScore === '80+' && candidate.match >= 80) ||
        (matchScore === '70+' && candidate.match >= 70);

      return matchesSearch && matchesExperience && matchesScore;
    });
  }, [candidates, search, experience, matchScore]);

  const moveCandidate = (
  candidateId: number,
  direction: 'previous' | 'next',
) => {
  setCandidates((current) =>
    current.map((candidate) => {
      if (candidate.id !== candidateId) {
        return candidate;
      }

      const currentIndex = stages.indexOf(candidate.stage);

      const targetIndex =
        direction === 'next'
          ? Math.min(currentIndex + 1, stages.length - 1)
          : Math.max(currentIndex - 1, 0);

      const targetStage = stages[targetIndex];

      if (!targetStage) {
        return candidate;
      }

      return {
        ...candidate,
        stage: targetStage,
      };
    }),
  );
};

  const clearFilters = () => {
    setSearch('');
    setExperience('all');
    setMatchScore('all');
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.5 },
        minHeight: 600,
      }}
    >
      {/* HEADER */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.3 },
          border: '1px solid #e0e7f1',
          borderRadius: '15px',
          mb: 2,
        }}
      >
        <Box
          sx={{
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
            gap: 2,
          }}
        >
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  backgroundColor: '#e7f0ff',
                  color: '#1261d7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PersonSearchOutlinedIcon />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: '1.15rem',
                    fontWeight: 900,
                    color: '#101d37',
                  }}
                >
                  Hiring Pipeline
                </Typography>

                <Typography
                  sx={{
                    mt: 0.2,
                    fontSize: '0.76rem',
                    color: '#65738a',
                  }}
                >
                  Track and manage candidates through every hiring
                  stage.
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={1}
            sx={{
              width: {
                xs: '100%',
                lg: 'auto',
              },
            }}
          >
            <TextField
              size="small"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search candidates..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{
                        fontSize: 19,
                        color: '#65738a',
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: {
                  xs: '100%',
                  sm: 240,
                },

                '& .MuiOutlinedInput-root': {
                  height: 40,
                  borderRadius: '9px',
                  fontSize: '0.75rem',
                },
              }}
            />

            <Select
              size="small"
              value={experience}
              onChange={(event) =>
                setExperience(event.target.value)
              }
              displayEmpty
              sx={filterSelectStyles}
            >
              <MenuItem value="all">
                All Experience
              </MenuItem>

              <MenuItem value="0-3">0-3 years</MenuItem>
              <MenuItem value="3-5">3-5 years</MenuItem>
              <MenuItem value="5-8">5-8 years</MenuItem>
              <MenuItem value="8+">8+ years</MenuItem>
            </Select>

            <Select
              size="small"
              value={matchScore}
              onChange={(event) =>
                setMatchScore(event.target.value)
              }
              displayEmpty
              sx={filterSelectStyles}
            >
              <MenuItem value="all">
                All Match Scores
              </MenuItem>

              <MenuItem value="90+">90%+</MenuItem>
              <MenuItem value="80+">80%+</MenuItem>
              <MenuItem value="70+">70%+</MenuItem>
            </Select>
          </Stack>
        </Box>

        {(search ||
          experience !== 'all' ||
          matchScore !== 'all') && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              mt: 1.5,
            }}
          >
            <FilterListOutlinedIcon
              sx={{
                fontSize: 17,
                color: '#65738a',
              }}
            />

            <Typography
              sx={{
                fontSize: '0.72rem',
                color: '#65738a',
              }}
            >
              Filters applied
            </Typography>

            <Button
              size="small"
              onClick={clearFilters}
              sx={{
                textTransform: 'none',
                fontSize: '0.7rem',
                fontWeight: 800,
              }}
            >
              Clear filters
            </Button>
          </Stack>
        )}
      </Paper>

      {/* PIPELINE */}
      <Box
        sx={{
          overflowX: 'auto',
          pb: 1.5,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(5, minmax(265px, 1fr))',
            gap: 1.4,
            minWidth: 1380,
          }}
        >
          {stages.map((stage) => {
            const stageCandidates =
              filteredCandidates.filter(
                (candidate) =>
                  candidate.stage === stage,
              );

            return (
              <PipelineColumn
                key={stage}
                stage={stage}
                total={stageTotals[stage]}
              >
                {stageCandidates.length > 0 ? (
                  stageCandidates.map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onPrevious={() =>
                        moveCandidate(
                          candidate.id,
                          'previous',
                        )
                      }
                      onNext={() =>
                        moveCandidate(
                          candidate.id,
                          'next',
                        )
                      }
                    />
                  ))
                ) : (
                  <EmptyStage />
                )}
              </PipelineColumn>
            );
          })}
        </Box>
      </Box>

      <Typography
        sx={{
          mt: 0.8,
          fontSize: '0.67rem',
          color: '#7b8799',
        }}
      >
        Candidate movement on this screen is currently UI-only.
        Backend stage updates will be connected to the Employer
        Hiring API.
      </Typography>
    </Box>
  );
};

const PipelineColumn = ({
  stage,
  total,
  children,
}: {
  stage: PipelineStage;
  total: number;
  children: React.ReactNode;
}) => {
  const colors = getStageColors(stage);

  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: 510,
        backgroundColor: '#f8fafc',
        border: '1px solid #e0e7ef',
        borderRadius: '13px',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 1.25,
          borderTop: `3px solid ${colors.main}`,
          borderBottom: '1px solid #e1e8f1',
          backgroundColor: '#fff',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack
            direction="row"
            spacing={0.8}
            alignItems="center"
          >
            <Box
              sx={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                backgroundColor: colors.main,
              }}
            />

            <Typography
              sx={{
                fontSize: '0.8rem',
                fontWeight: 900,
                color: '#17243d',
              }}
            >
              {stage}
            </Typography>
          </Stack>

          <Chip
            label={total}
            size="small"
            sx={{
              minWidth: 30,
              height: 24,
              backgroundColor: colors.light,
              color: colors.main,
              fontSize: '0.67rem',
              fontWeight: 900,
            }}
          />
        </Stack>

        <Typography
          sx={{
            mt: 0.35,
            ml: 2.15,
            fontSize: '0.64rem',
            color: '#788599',
          }}
        >
          {total} candidates
        </Typography>
      </Box>

      <Stack
        spacing={1}
        sx={{
          p: 1,
        }}
      >
        {children}
      </Stack>
    </Paper>
  );
};

const CandidateCard = ({
  candidate,
  onPrevious,
  onNext,
}: {
  candidate: PipelineCandidate;
  onPrevious: () => void;
  onNext: () => void;
}) => {
  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null);

  const stageIndex = stages.indexOf(candidate.stage);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.25,
        border: '1px solid #dde5ef',
        borderRadius: '11px',
        backgroundColor: '#fff',

        '&:hover': {
          borderColor: '#b9cbe4',
          boxShadow:
            '0 4px 14px rgba(20, 44, 82, 0.06)',
        },
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
              width: 38,
              height: 38,
              background:
                'linear-gradient(135deg, #e2efff, #dce7ff)',
              color: '#145bc7',
              fontSize: '0.72rem',
              fontWeight: 900,
            }}
          >
            {candidate.initials}
          </Avatar>

          <Box>
            <Typography
              sx={{
                fontSize: '0.77rem',
                fontWeight: 900,
                color: '#14213b',
              }}
            >
              {candidate.name}
            </Typography>

            <Typography
              sx={{
                mt: 0.1,
                fontSize: '0.62rem',
                color: '#68768c',
              }}
            >
              {candidate.role}
            </Typography>
          </Box>
        </Stack>

        <IconButton
          size="small"
          onClick={(event) =>
            setAnchorEl(event.currentTarget)
          }
          sx={{
            width: 29,
            height: 29,
          }}
        >
          <MoreVertIcon
            sx={{
              fontSize: 17,
            }}
          />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem
            onClick={() => setAnchorEl(null)}
          >
            View Candidate
          </MenuItem>

          <MenuItem
            onClick={() => setAnchorEl(null)}
          >
            Send Message
          </MenuItem>

          <MenuItem
            onClick={() => setAnchorEl(null)}
          >
            Add Note
          </MenuItem>
        </Menu>
      </Stack>

      <Stack
        direction="row"
        spacing={0.6}
        sx={{
          mt: 1.1,
        }}
      >
        <Chip
          label={`${candidate.match}% Match`}
          size="small"
          sx={{
            height: 24,
            backgroundColor:
              candidate.match >= 90
                ? '#e0f6e6'
                : '#e6efff',
            color:
              candidate.match >= 90
                ? '#16803c'
                : '#1261d7',
            fontSize: '0.64rem',
            fontWeight: 900,
          }}
        />
      </Stack>

      <Stack
        spacing={0.55}
        sx={{
          mt: 1.1,
        }}
      >
        <CandidateMeta
          icon={<WorkOutlineIcon />}
          text={`${candidate.experience} years experience`}
        />

        <CandidateMeta
          icon={<LocationOnOutlinedIcon />}
          text={candidate.location}
        />
      </Stack>

      <Box
        sx={{
          mt: 1.1,
          pt: 0.9,
          borderTop: '1px solid #edf1f5',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.61rem',
            color: '#8390a2',
          }}
        >
          Applied {candidate.appliedOn}
        </Typography>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            mt: 0.8,
          }}
        >
          <Stack
            direction="row"
            spacing={0.3}
          >
            <IconButton
              title="View candidate"
              size="small"
              sx={candidateActionStyles}
            >
              <VisibilityOutlinedIcon />
            </IconButton>

            <IconButton
              title="Message candidate"
              size="small"
              sx={candidateActionStyles}
            >
              <MailOutlineIcon />
            </IconButton>
          </Stack>

          <Stack
            direction="row"
            spacing={0.4}
          >
            {stageIndex > 0 && (
              <IconButton
                title="Move to previous stage"
                onClick={onPrevious}
                size="small"
                sx={movementButtonStyles}
              >
                <ArrowBackOutlinedIcon />
              </IconButton>
            )}

            {stageIndex <
              stages.length - 1 && (
              <IconButton
                title="Move to next stage"
                onClick={onNext}
                size="small"
                sx={{
                  ...movementButtonStyles,
                  backgroundColor: '#1261d7',
                  color: '#fff',

                  '&:hover': {
                    backgroundColor: '#0f55bd',
                  },
                }}
              >
                <ArrowForwardOutlinedIcon />
              </IconButton>
            )}
          </Stack>
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
  <Stack
    direction="row"
    spacing={0.55}
    alignItems="center"
  >
    <Box
      sx={{
        display: 'flex',
        color: '#6d7b90',

        '& svg': {
          fontSize: 14,
        },
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        fontSize: '0.64rem',
        color: '#53627a',
      }}
    >
      {text}
    </Typography>
  </Stack>
);

const EmptyStage = () => (
  <Box
    sx={{
      py: 5,
      px: 1,
      textAlign: 'center',
      border: '1px dashed #d5deea',
      borderRadius: '10px',
      backgroundColor: '#fff',
    }}
  >
    <PersonSearchOutlinedIcon
      sx={{
        fontSize: 28,
        color: '#b3bfce',
      }}
    />

    <Typography
      sx={{
        mt: 0.6,
        fontSize: '0.7rem',
        fontWeight: 800,
        color: '#66758a',
      }}
    >
      No candidates
    </Typography>

    <Typography
      sx={{
        mt: 0.2,
        fontSize: '0.62rem',
        color: '#8a96a7',
      }}
    >
      Candidates moved to this stage will appear
      here.
    </Typography>
  </Box>
);

const getStageColors = (
  stage: PipelineStage,
) => {
  switch (stage) {
    case 'Applied':
      return {
        main: '#1261d7',
        light: '#e5efff',
      };

    case 'Screening':
      return {
        main: '#3156b8',
        light: '#e7edff',
      };

    case 'Interview':
      return {
        main: '#6938c6',
        light: '#eee6ff',
      };

    case 'Offer':
      return {
        main: '#b65c00',
        light: '#fff0d7',
      };

    case 'Hired':
      return {
        main: '#16803c',
        light: '#dff7e6',
      };
  }
};

const filterSelectStyles = {
  minWidth: 155,
  height: 40,
  borderRadius: '9px',
  fontSize: '0.72rem',
  fontWeight: 700,
};

const candidateActionStyles = {
  width: 29,
  height: 29,
  border: '1px solid #dce4ee',
  borderRadius: '7px',
  color: '#52627b',

  '& svg': {
    fontSize: 15,
  },

  '&:hover': {
    color: '#1261d7',
    backgroundColor: '#eff6ff',
  },
};

const movementButtonStyles = {
  width: 29,
  height: 29,
  border: '1px solid #d7e1ed',
  borderRadius: '7px',
  color: '#52627b',

  '& svg': {
    fontSize: 15,
  },
};

export default EmployerHiringPipelineTab;