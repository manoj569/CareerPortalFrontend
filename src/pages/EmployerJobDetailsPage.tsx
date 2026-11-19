import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { EmployerJobDetailsTab } from '@/pages/EmployerJobDetailsTab';
import { EmployerHiringPipelineTab } from '@/pages/EmployerHiringPipelineTab';
import { EmployerJobActivityTab } from '@/pages/EmployerJobActivityTab';
type ApplicantStage = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';

type Applicant = {
  id: number;
  name: string;
  initials: string;
  email: string;
  experience: string;
  location: string;
  stage: ApplicantStage;
  match: number;
  appliedOn: string;
};

const demoApplicants: Applicant[] = [
  {
    id: 1,
    name: 'Rohan Sharma',
    initials: 'RS',
    email: 'rohan.sharma@gmail.com',
    experience: '5.5 years',
    location: 'Pune, India',
    stage: 'Applied',
    match: 96,
    appliedOn: 'Nov 18, 2026',
  },
  {
    id: 2,
    name: 'Ananya Patel',
    initials: 'AP',
    email: 'ananya.patel@gmail.com',
    experience: '6.2 years',
    location: 'Bengaluru, India',
    stage: 'Screening',
    match: 92,
    appliedOn: 'Nov 18, 2026',
  },
  {
    id: 3,
    name: 'Mohan Kumar',
    initials: 'MK',
    email: 'mohan.kumar@gmail.com',
    experience: '5.0 years',
    location: 'Hyderabad, India',
    stage: 'Interview',
    match: 88,
    appliedOn: 'Nov 17, 2026',
  },
  {
    id: 4,
    name: 'Sneha Desai',
    initials: 'SD',
    email: 'sneha.desai@gmail.com',
    experience: '7.1 years',
    location: 'Pune, India',
    stage: 'Applied',
    match: 85,
    appliedOn: 'Nov 17, 2026',
  },
  {
    id: 5,
    name: 'Nikhil Thakur',
    initials: 'NT',
    email: 'nikhil.thakur@gmail.com',
    experience: '5.8 years',
    location: 'Mumbai, India',
    stage: 'Screening',
    match: 84,
    appliedOn: 'Nov 16, 2026',
  },
];

const stageCounts = {
  All: 128,
  Applied: 78,
  Screening: 24,
  Interview: 12,
  Offer: 6,
  Hired: 4,
  Rejected: 4,
};

export const EmployerJobDetailsPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [selectedApplicants, setSelectedApplicants] = useState<number[]>([]);
  const [sort, setSort] = useState('newest');

  const [stageExpanded, setStageExpanded] = useState(true);
  const [experienceExpanded, setExperienceExpanded] = useState(true);
  const [skillsExpanded, setSkillsExpanded] = useState(false);
  const [educationExpanded, setEducationExpanded] = useState(false);

  const filteredApplicants = useMemo(() => {
    const query = search.trim().toLowerCase();

    return demoApplicants.filter((applicant) => {
      const matchesSearch =
        !query ||
        applicant.name.toLowerCase().includes(query) ||
        applicant.email.toLowerCase().includes(query) ||
        applicant.location.toLowerCase().includes(query);

      const matchesStage = selectedStages.length === 0 || selectedStages.includes(applicant.stage);

      return matchesSearch && matchesStage;
    });
  }, [search, selectedStages]);

  const toggleStage = (stage: string) => {
    setSelectedStages((current) =>
      current.includes(stage) ? current.filter((item) => item !== stage) : [...current, stage],
    );
  };

  const toggleExperience = (value: string) => {
    setSelectedExperience((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const toggleApplicant = (applicantId: number) => {
    setSelectedApplicants((current) =>
      current.includes(applicantId)
        ? current.filter((item) => item !== applicantId)
        : [...current, applicantId],
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100%',
        background: 'linear-gradient(180deg, #f9fbff 0%, #f3f7fc 100%)',
      }}
    >
      {/* JOB HEADER */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          pt: 2,
          pb: 1.8,
          backgroundColor: '#fff',
          borderBottom: '1px solid #e4eaf2',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <Typography
            onClick={() => navigate('/employer/jobs')}
            sx={{
              fontSize: '0.82rem',
              color: '#52627c',
              cursor: 'pointer',
              '&:hover': { color: '#1261d7' },
            }}
          >
            Jobs
          </Typography>

          <Typography sx={{ color: '#a0acbd' }}>/</Typography>

          <Typography
            sx={{
              fontSize: '0.82rem',
              color: '#16233d',
              fontWeight: 800,
            }}
          >
            Senior React Developer
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 2,
          }}
        >
          <Box>
            <Stack direction="row" spacing={1.2} alignItems="center" flexWrap="wrap">
              <Typography
                sx={{
                  fontSize: { xs: '1.35rem', md: '1.7rem' },
                  fontWeight: 900,
                  color: '#0c1733',
                }}
              >
                Senior React Developer
              </Typography>

              <Chip
                label="Active"
                size="small"
                sx={{
                  backgroundColor: '#dff7e6',
                  color: '#15803d',
                  fontWeight: 850,
                }}
              />
            </Stack>

            <Stack
              direction="row"
              spacing={{ xs: 1.5, md: 3 }}
              flexWrap="wrap"
              useFlexGap
              sx={{ mt: 1.4 }}
            >
              <JobMeta icon={<LocationOnOutlinedIcon />} text="Pune, India" />

              <JobMeta icon={<WorkOutlineIcon />} text="Full-time" />

              <JobMeta icon={<PersonOutlineIcon />} text="5-8 years" />

              <JobMeta icon={<CalendarTodayOutlinedIcon />} text="Posted Nov 18, 2026" />

              <JobMeta icon={<CalendarTodayOutlinedIcon />} text="Expires Dec 18, 2026" />
            </Stack>
          </Box>

          <Stack direction="row" spacing={1} alignItems="flex-start" flexWrap="wrap" useFlexGap>
            <Button variant="outlined" startIcon={<EditOutlinedIcon />} sx={headerButtonStyles}>
              Edit Job
            </Button>

            <Button variant="outlined" startIcon={<PauseOutlinedIcon />} sx={headerButtonStyles}>
              Pause
            </Button>

            <Button variant="outlined" endIcon={<ExpandMoreIcon />} sx={headerButtonStyles}>
              More
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* TABS */}
      <Box
        sx={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #e1e8f1',
          px: { xs: 2, md: 3 },
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant="scrollable"
          scrollButtons={false}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 850,
              minHeight: 58,
              color: '#26344f',
              px: { xs: 1.5, md: 2.5 },
            },

            '& .Mui-selected': {
              color: '#1261d7 !important',
            },

            '& .MuiTabs-indicator': {
              height: 3,
            },
          }}
        >
          <Tab label="Applicants (128)" />
          <Tab label="Job Details" />
          <Tab label="Hiring Pipeline" />
          <Tab label="Activity" />
        </Tabs>
      </Box>

      {tab === 0 && (
        <Box
          sx={{
            p: { xs: 2, md: 2.5 },
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: '280px minmax(0, 1fr)',
            },
            gap: 2,
          }}
        >
          {/* FILTER SIDEBAR */}
          <Paper
            elevation={0}
            sx={{
              border: '1px solid #e0e7f1',
              borderRadius: '16px',
              p: 2,
              alignSelf: 'start',
            }}
          >
            <Typography
              sx={{
                fontSize: '1rem',
                fontWeight: 900,
                color: '#111d37',
                mb: 1.6,
              }}
            >
              Filter Applicants
            </Typography>

            <TextField
              fullWidth
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, skills or email..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{
                        color: '#64748b',
                        fontSize: 19,
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  fontSize: '0.77rem',
                },
              }}
            />

            <FilterHeading
              title="Application Stage"
              expanded={stageExpanded}
              onClick={() => setStageExpanded((value) => !value)}
            />

            <Collapse in={stageExpanded}>
              <FilterCheck
                checked={selectedStages.length === 0}
                onChange={() => setSelectedStages([])}
                label="All Stages"
                count={128}
              />

              {(
                [
                  'Applied',
                  'Screening',
                  'Interview',
                  'Offer',
                  'Hired',
                  'Rejected',
                ] as ApplicantStage[]
              ).map((stage) => (
                <FilterCheck
                  key={stage}
                  checked={selectedStages.includes(stage)}
                  onChange={() => toggleStage(stage)}
                  label={stage}
                  count={stageCounts[stage]}
                />
              ))}
            </Collapse>

            <Divider sx={{ my: 1.5 }} />

            <FilterHeading
              title="Experience"
              expanded={experienceExpanded}
              onClick={() => setExperienceExpanded((value) => !value)}
            />

            <Collapse in={experienceExpanded}>
              {[
                ['0-1 years', 0],
                ['1-3 years', 8],
                ['3-5 years', 34],
                ['5-8 years', 62],
                ['8+ years', 24],
              ].map(([label, count]) => (
                <FilterCheck
                  key={String(label)}
                  checked={selectedExperience.includes(String(label))}
                  onChange={() => toggleExperience(String(label))}
                  label={String(label)}
                  count={Number(count)}
                />
              ))}
            </Collapse>

            <Divider sx={{ my: 1.5 }} />

            <FilterHeading
              title="Skills"
              expanded={skillsExpanded}
              onClick={() => setSkillsExpanded((value) => !value)}
            />

            <Collapse in={skillsExpanded}>
              <Stack direction="row" flexWrap="wrap" gap={0.7} sx={{ pt: 1 }}>
                {['React', 'TypeScript', 'JavaScript', 'CSS'].map((skill) => (
                  <Chip key={skill} label={skill} size="small" variant="outlined" />
                ))}
              </Stack>
            </Collapse>

            <Divider sx={{ my: 1.5 }} />

            <FilterHeading
              title="Education"
              expanded={educationExpanded}
              onClick={() => setEducationExpanded((value) => !value)}
            />

            <Collapse in={educationExpanded}>
              <Typography
                sx={{
                  mt: 1,
                  fontSize: '0.75rem',
                  color: '#6a7890',
                }}
              >
                Education filters will be connected to applicant data.
              </Typography>
            </Collapse>
          </Paper>

          {/* APPLICANTS */}
          <Paper
            elevation={0}
            sx={{
              border: '1px solid #e0e7f1',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.6,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1.5,
                borderBottom: '1px solid #e4eaf2',
              }}
            >
              <Typography
                sx={{
                  fontSize: '1.08rem',
                  fontWeight: 900,
                  color: '#101d37',
                }}
              >
                128 Applicants
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: '#53627b',
                  }}
                >
                  Sort by:
                </Typography>

                <Select
                  size="small"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  sx={{
                    minWidth: 175,
                    height: 38,
                    borderRadius: '9px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  <MenuItem value="newest">Applied Date (Newest)</MenuItem>
                  <MenuItem value="oldest">Applied Date (Oldest)</MenuItem>
                  <MenuItem value="match">Match Score</MenuItem>
                </Select>
              </Stack>
            </Box>

            {filteredApplicants.length > 0 ? (
              filteredApplicants.map((applicant) => (
                <ApplicantRow
                  key={applicant.id}
                  applicant={applicant}
                  selected={selectedApplicants.includes(applicant.id)}
                  onToggle={() => toggleApplicant(applicant.id)}
                />
              ))
            ) : (
              <Box
                sx={{
                  py: 8,
                  textAlign: 'center',
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 850,
                    color: '#35445e',
                  }}
                >
                  No applicants found
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    color: '#7a879b',
                    fontSize: '0.78rem',
                  }}
                >
                  Try changing your search or filters.
                </Typography>
              </Box>
            )}

            {/* PAGINATION */}
            <Box
              sx={{
                px: 2,
                py: 1.5,
                minHeight: 70,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
                borderTop: '1px solid #e5ebf3',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.76rem',
                  color: '#53627b',
                }}
              >
                Showing 1-5 of 128 applicants
              </Typography>

              <Stack direction="row" spacing={0.5} alignItems="center">
                <PageButton disabled>
                  <ArrowBackIosNewIcon sx={{ fontSize: 14 }} />
                </PageButton>

                <PageButton active>1</PageButton>
                <PageButton>2</PageButton>
                <PageButton>3</PageButton>
                <PageButton>4</PageButton>
                <PageButton>5</PageButton>

                <Typography sx={{ px: 0.5 }}>...</Typography>

                <PageButton>26</PageButton>

                <PageButton>
                  <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
                </PageButton>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: '#53627b',
                  }}
                >
                  Rows per page:
                </Typography>

                <Select
                  size="small"
                  value={5}
                  sx={{
                    width: 70,
                    height: 36,
                    fontSize: '0.75rem',
                    borderRadius: '9px',
                  }}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                </Select>
              </Stack>
            </Box>
          </Paper>
        </Box>
      )}

      {tab === 1 && <EmployerJobDetailsTab />}

      {tab === 2 && <EmployerHiringPipelineTab />}

      {tab === 3 && <EmployerJobActivityTab />}
    </Box>
  );
};

const ApplicantRow = ({
  applicant,
  selected,
  onToggle,
}: {
  applicant: Applicant;
  selected: boolean;
  onToggle: () => void;
}) => {
  const stageStyles = getStageStyles(applicant.stage);

  return (
    <Box
      sx={{
        px: 1.5,
        py: 1.7,
        display: 'grid',
        gridTemplateColumns: {
          xs: 'auto 1fr',
          md: '34px minmax(230px, 2fr) 120px 110px 125px 120px',
        },
        gap: 1.2,
        alignItems: 'center',
        borderBottom: '1px solid #e8edf4',

        '&:hover': {
          backgroundColor: '#fbfdff',
        },
      }}
    >
      <Checkbox size="small" checked={selected} onChange={onToggle} />

      <Stack direction="row" spacing={1.2} alignItems="center">
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #e1efff 0%, #dce8ff 100%)',
            color: '#145bc7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            flexShrink: 0,
          }}
        >
          {applicant.initials}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: '0.88rem',
              fontWeight: 900,
              color: '#101d37',
            }}
          >
            {applicant.name}
          </Typography>

          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25 }}>
            <MailOutlineIcon
              sx={{
                fontSize: 14,
                color: '#61718a',
              }}
            />

            <Typography
              noWrap
              sx={{
                fontSize: '0.7rem',
                color: '#52617a',
              }}
            >
              {applicant.email}
            </Typography>
          </Stack>

          <Typography
            sx={{
              mt: 0.25,
              fontSize: '0.7rem',
              color: '#52617a',
            }}
          >
            {applicant.experience} • {applicant.location}
          </Typography>
        </Box>
      </Stack>

      <Box>
        <Chip
          label={applicant.stage}
          size="small"
          sx={{
            height: 26,
            backgroundColor: stageStyles.background,
            color: stageStyles.color,
            fontSize: '0.69rem',
            fontWeight: 850,
          }}
        />
      </Box>

      <Chip
        label={`${applicant.match}% Match`}
        size="small"
        sx={{
          justifySelf: 'start',
          height: 27,
          backgroundColor: '#e1f6e6',
          color: '#13803a',
          fontWeight: 900,
          fontSize: '0.7rem',
        }}
      />

      <Box>
        <Typography
          sx={{
            fontSize: '0.68rem',
            color: '#65738a',
          }}
        >
          Applied
        </Typography>

        <Typography
          sx={{
            mt: 0.2,
            fontSize: '0.73rem',
            fontWeight: 700,
            color: '#263650',
          }}
        >
          {applicant.appliedOn}
        </Typography>
      </Box>

      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
        <ApplicantAction title="View candidate" icon={<VisibilityOutlinedIcon />} />

        <ApplicantAction title="Message" icon={<MailOutlineIcon />} />

        <ApplicantAction title="More" icon={<MoreVertIcon />} />
      </Stack>
    </Box>
  );
};

const JobMeta = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <Stack direction="row" spacing={0.65} alignItems="center">
    <Box
      sx={{
        display: 'flex',
        color: '#34445f',

        '& svg': {
          fontSize: 18,
        },
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        fontSize: '0.76rem',
        color: '#34445f',
      }}
    >
      {text}
    </Typography>
  </Stack>
);

const FilterHeading = ({
  title,
  expanded,
  onClick,
}: {
  title: string;
  expanded: boolean;
  onClick: () => void;
}) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
      py: 0.4,
    }}
  >
    <Typography
      sx={{
        fontSize: '0.79rem',
        fontWeight: 850,
        color: '#16233d',
      }}
    >
      {title}
    </Typography>

    {expanded ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
  </Box>
);

const FilterCheck = ({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  count: number;
}) => (
  <Stack direction="row" alignItems="center" sx={{ minHeight: 31 }}>
    <Checkbox
      checked={checked}
      onChange={onChange}
      size="small"
      sx={{
        p: 0.5,
        mr: 0.5,
      }}
    />

    <Typography
      sx={{
        fontSize: '0.75rem',
        color: '#263650',
      }}
    >
      {label} ({count})
    </Typography>
  </Stack>
);

const ApplicantAction = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <IconButton
    title={title}
    size="small"
    sx={{
      width: 34,
      height: 34,
      border: '1px solid #dbe3ee',
      borderRadius: '9px',
      color: '#52627b',

      '& svg': {
        fontSize: 17,
      },

      '&:hover': {
        backgroundColor: '#eff6ff',
        color: '#1261d7',
      },
    }}
  >
    {icon}
  </IconButton>
);

const PageButton = ({
  children,
  active = false,
  disabled = false,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}) => (
  <IconButton
    disabled={disabled}
    sx={{
      minWidth: 34,
      height: 34,
      px: 0.8,
      borderRadius: '8px',
      border: active ? '1px solid #1261d7' : '1px solid #dce4ee',
      backgroundColor: active ? '#1261d7' : '#fff',
      color: active ? '#fff' : '#263650',
      fontSize: '0.74rem',
      fontWeight: 850,

      '&:hover': {
        backgroundColor: active ? '#0f55bd' : '#f5f8fc',
      },
    }}
  >
    {children}
  </IconButton>
);



const getStageStyles = (stage: ApplicantStage) => {
  switch (stage) {
    case 'Applied':
      return {
        background: '#e4f0ff',
        color: '#1261d7',
      };

    case 'Screening':
      return {
        background: '#dcecff',
        color: '#075dc8',
      };

    case 'Interview':
      return {
        background: '#eee5ff',
        color: '#6938c6',
      };

    case 'Offer':
      return {
        background: '#fff2d9',
        color: '#9a5a00',
      };

    case 'Hired':
      return {
        background: '#dff7e6',
        color: '#15803d',
      };

    case 'Rejected':
      return {
        background: '#fde8e8',
        color: '#b42318',
      };

    default:
      return {
        background: '#eef2f7',
        color: '#52617a',
      };
  }
};

const headerButtonStyles = {
  textTransform: 'none',
  borderRadius: '9px',
  borderColor: '#cbd8e9',
  color: '#174c9f',
  fontWeight: 800,
  px: 1.7,
};

export default EmployerJobDetailsPage;
