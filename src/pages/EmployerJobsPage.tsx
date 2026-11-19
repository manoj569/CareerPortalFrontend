import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
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

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

type JobStatus = 'Active' | 'Draft' | 'Paused' | 'Closed';

type EmployerJob = {
  id: number;
  title: string;
  type: string;
  experience: string;
  location: string;
  applications: number;
  newApplications?: number;
  status: JobStatus;
  postedOn: string;
  expiresOn: string;
};

const demoJobs: EmployerJob[] = [
  {
    id: 1,
    title: 'Senior React Developer',
    type: 'Full-time',
    experience: '5-8 yrs',
    location: 'Pune, India',
    applications: 128,
    newApplications: 42,
    status: 'Active',
    postedOn: 'Nov 18, 2026',
    expiresOn: 'Dec 18, 2026',
  },
  {
    id: 2,
    title: '.NET Full Stack Developer',
    type: 'Full-time',
    experience: '3-5 yrs',
    location: 'Remote',
    applications: 86,
    newApplications: 12,
    status: 'Active',
    postedOn: 'Nov 15, 2026',
    expiresOn: 'Dec 15, 2026',
  },
  {
    id: 3,
    title: 'Associate Product Manager',
    type: 'Full-time',
    experience: '2-4 yrs',
    location: 'Bengaluru, India',
    applications: 54,
    status: 'Active',
    postedOn: 'Nov 10, 2026',
    expiresOn: 'Dec 10, 2026',
  },
  {
    id: 4,
    title: 'Data Engineer',
    type: 'Full-time',
    experience: '3-6 yrs',
    location: 'Hyderabad, India',
    applications: 29,
    status: 'Paused',
    postedOn: 'Nov 5, 2026',
    expiresOn: 'Dec 5, 2026',
  },
  {
    id: 5,
    title: 'QA Automation Engineer',
    type: 'Full-time',
    experience: '2-4 yrs',
    location: 'Pune, India',
    applications: 0,
    status: 'Draft',
    postedOn: 'â€”',
    expiresOn: 'â€”',
  },
];

const tabCounts = {
  All: 12,
  Active: 7,
  Draft: 2,
  Paused: 1,
  Closed: 2,
};

export const EmployerJobsPage = () => {
  const navigate = useNavigate();

  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('All');
  const [jobType, setJobType] = useState('All');
  const [experience, setExperience] = useState('All');
  const [status, setStatus] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredJobs = useMemo(() => {
    return demoJobs.filter((job) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        job.title.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.experience.toLowerCase().includes(query);

      const matchesTab =
        tab === 'All' || (tab === 'Draft' && job.status === 'Draft') || job.status === tab;

      const matchesLocation = location === 'All' || job.location === location;

      const matchesType = jobType === 'All' || job.type === jobType;

      const matchesExperience = experience === 'All' || job.experience === experience;

      const matchesStatus = status === 'All' || job.status === status;

      return (
        matchesSearch &&
        matchesTab &&
        matchesLocation &&
        matchesType &&
        matchesExperience &&
        matchesStatus
      );
    });
  }, [tab, search, location, jobType, experience, status]);

  const getStatusStyles = (jobStatus: JobStatus) => {
    switch (jobStatus) {
      case 'Active':
        return {
          backgroundColor: '#e8f8ee',
          color: '#168a3b',
          dot: '#16a34a',
        };

      case 'Paused':
        return {
          backgroundColor: '#fff5df',
          color: '#a85b00',
          dot: '#f59e0b',
        };

      case 'Draft':
        return {
          backgroundColor: '#eef2f7',
          color: '#53627c',
          dot: '#94a3b8',
        };

      case 'Closed':
        return {
          backgroundColor: '#fdecec',
          color: '#b42318',
          dot: '#ef4444',
        };

      default:
        return {
          backgroundColor: '#eef2f7',
          color: '#53627c',
          dot: '#94a3b8',
        };
    }
  };

  const handleCreateJob = () => {
    navigate('/employer/jobs/create');
  };

  return (
    <Box
      sx={{
        minHeight: '100%',
        background: 'linear-gradient(180deg, #f8fbff 0%, #f3f7fc 100%)',
      }}
    >
      {/* PAGE HEADER */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2.2,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5ebf4',
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: '1.35rem', md: '1.55rem' },
              fontWeight: 900,
              color: '#0b1739',
              lineHeight: 1.2,
            }}
          >
            Jobs
          </Typography>

          <Typography
            sx={{
              mt: 0.4,
              fontSize: '0.86rem',
              color: '#65738b',
            }}
          >
            Manage your job openings, track applications and hiring progress.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateJob}
          sx={{
            textTransform: 'none',
            borderRadius: '10px',
            px: 2.4,
            py: 1.05,
            fontWeight: 800,
            boxShadow: '0 5px 14px rgba(20, 100, 220, 0.20)',
          }}
        >
          Create Job
        </Button>
      </Box>

      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2.4,
        }}
      >
        {/* TABS */}
        <Tabs
          value={tab}
          onChange={(_, value) => {
            setTab(value);
            setPage(1);
          }}
          variant="scrollable"
          scrollButtons={false}
          sx={{
            mb: 1.5,

            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px',
            },

            '& .MuiTab-root': {
              minHeight: 50,
              textTransform: 'none',
              fontWeight: 800,
              color: '#26344f',
              px: { xs: 1.5, md: 2.4 },
            },

            '& .Mui-selected': {
              color: '#1261d7 !important',
            },
          }}
        >
          {Object.entries(tabCounts).map(([name, count]) => (
            <Tab
              key={name}
              value={name}
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>{name === 'All' ? 'All Jobs' : name}</span>

                  <Box
                    component="span"
                    sx={{
                      minWidth: 25,
                      height: 25,
                      px: 0.7,
                      borderRadius: '50px',
                      backgroundColor: tab === name ? '#76aaf5' : '#edf2f8',
                      color: tab === name ? '#ffffff' : '#43516a',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.73rem',
                      fontWeight: 900,
                    }}
                  >
                    {count}
                  </Box>
                </Stack>
              }
            />
          ))}
        </Tabs>

        {/* FILTERS */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 0,
            border: '1px solid #e0e7f1',
            borderRadius: '18px 18px 0 0',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                lg: '2.2fr 1fr 1fr 1fr 1fr auto',
              },
              gap: 1.3,
              alignItems: 'center',
            }}
          >
            <TextField
              size="small"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by job title, location or skills..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{
                        color: '#66758f',
                        fontSize: 21,
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={filterFieldStyles}
            />

            <Select
              size="small"
              value={location}
              onChange={(event) => {
                setLocation(event.target.value);
                setPage(1);
              }}
              sx={filterFieldStyles}
            >
              <MenuItem value="All">Location</MenuItem>
              <MenuItem value="Pune, India">Pune</MenuItem>
              <MenuItem value="Bengaluru, India">Bengaluru</MenuItem>
              <MenuItem value="Hyderabad, India">Hyderabad</MenuItem>
              <MenuItem value="Remote">Remote</MenuItem>
            </Select>

            <Select
              size="small"
              value={jobType}
              onChange={(event) => {
                setJobType(event.target.value);
                setPage(1);
              }}
              sx={filterFieldStyles}
            >
              <MenuItem value="All">Job Type</MenuItem>
              <MenuItem value="Full-time">Full-time</MenuItem>
              <MenuItem value="Part-time">Part-time</MenuItem>
              <MenuItem value="Contract">Contract</MenuItem>
              <MenuItem value="Internship">Internship</MenuItem>
            </Select>

            <Select
              size="small"
              value={experience}
              onChange={(event) => {
                setExperience(event.target.value);
                setPage(1);
              }}
              sx={filterFieldStyles}
            >
              <MenuItem value="All">Experience</MenuItem>
              <MenuItem value="2-4 yrs">2-4 yrs</MenuItem>
              <MenuItem value="3-5 yrs">3-5 yrs</MenuItem>
              <MenuItem value="3-6 yrs">3-6 yrs</MenuItem>
              <MenuItem value="5-8 yrs">5-8 yrs</MenuItem>
            </Select>

            <Select
              size="small"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              sx={filterFieldStyles}
            >
              <MenuItem value="All">Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Paused">Paused</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </Select>

            <Box
              sx={{
                display: 'flex',
                border: '1px solid #d8e1ee',
                borderRadius: '11px',
                overflow: 'hidden',
                height: 40,
              }}
            >
              <IconButton
                onClick={() => setViewMode('list')}
                sx={{
                  width: 44,
                  borderRadius: 0,
                  color: viewMode === 'list' ? '#1261d7' : '#52617b',
                  backgroundColor: viewMode === 'list' ? '#edf5ff' : '#ffffff',
                }}
              >
                <ViewListOutlinedIcon />
              </IconButton>

              <IconButton
                onClick={() => setViewMode('grid')}
                sx={{
                  width: 44,
                  borderRadius: 0,
                  color: viewMode === 'grid' ? '#1261d7' : '#52617b',
                  backgroundColor: viewMode === 'grid' ? '#edf5ff' : '#ffffff',
                }}
              >
                <GridViewOutlinedIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>

        {/* JOB TABLE */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e0e7f1',
            borderTop: 0,
            borderRadius: '0 0 18px 18px',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              overflowX: 'auto',
            }}
          >
            <Box
              sx={{
                minWidth: 1080,
              }}
            >
              {/* HEADER */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '2.3fr 1.2fr 1.1fr 0.9fr 1fr 1fr 1fr',
                  gap: 1,
                  px: 2.2,
                  py: 1.55,
                  backgroundColor: '#f7f9fc',
                  borderBottom: '1px solid #e4eaf2',
                }}
              >
                {[
                  'Job Title',
                  'Location',
                  'Applications',
                  'Status',
                  'Posted On',
                  'Expires On',
                  'Actions',
                ].map((label) => (
                  <Typography
                    key={label}
                    sx={{
                      fontSize: '0.79rem',
                      fontWeight: 850,
                      color: '#182641',
                    }}
                  >
                    {label}
                  </Typography>
                ))}
              </Box>

              {/* ROWS */}
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => {
                  const statusStyles = getStatusStyles(job.status);

                  return (
                    <Box
                      key={job.id}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '2.3fr 1.2fr 1.1fr 0.9fr 1fr 1fr 1fr',
                        gap: 1,
                        px: 2.2,
                        py: 1.65,
                        alignItems: 'center',
                        borderBottom: '1px solid #e8edf4',

                        '&:hover': {
                          backgroundColor: '#fbfdff',
                        },
                      }}
                    >
                      {/* JOB */}
                      <Stack direction="row" spacing={1.3} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '11px',
                            backgroundColor: '#eaf3ff',
                            color: '#1261d7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <WorkOutlineIcon sx={{ fontSize: 20 }} />
                        </Box>

                        <Box>
                          <Typography
                            sx={{
                              fontSize: '0.88rem',
                              fontWeight: 850,
                              color: '#101d37',
                            }}
                          >
                            {job.title}
                          </Typography>

                          <Stack direction="row" spacing={0.7} sx={{ mt: 0.6 }}>
                            <SmallTag label={job.type} />
                            <SmallTag label={job.experience} />
                          </Stack>
                        </Box>
                      </Stack>

                      {/* LOCATION */}
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        <LocationOnOutlinedIcon
                          sx={{
                            fontSize: 18,
                            color: '#60718d',
                          }}
                        />

                        <Typography
                          sx={{
                            fontSize: '0.82rem',
                            color: '#263650',
                          }}
                        >
                          {job.location}
                        </Typography>
                      </Stack>

                      {/* APPLICATIONS */}
                      <Stack direction="row" spacing={0.8} alignItems="center">
                        <Typography
                          sx={{
                            fontSize: '0.83rem',
                            fontWeight: 850,
                            color: '#17243d',
                          }}
                        >
                          {job.applications}
                        </Typography>

                        {!!job.newApplications && (
                          <Chip
                            label={`${job.newApplications} new`}
                            size="small"
                            sx={{
                              height: 23,
                              backgroundColor: '#dff8e5',
                              color: '#128438',
                              fontSize: '0.68rem',
                              fontWeight: 850,

                              '& .MuiChip-label': {
                                px: 1,
                              },
                            }}
                          />
                        )}
                      </Stack>

                      {/* STATUS */}
                      <Box>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.7,
                            px: 1.1,
                            py: 0.55,
                            borderRadius: '50px',
                            backgroundColor: statusStyles.backgroundColor,
                          }}
                        >
                          <Box
                            sx={{
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              backgroundColor: statusStyles.dot,
                            }}
                          />

                          <Typography
                            sx={{
                              fontSize: '0.72rem',
                              fontWeight: 850,
                              color: statusStyles.color,
                            }}
                          >
                            {job.status}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography sx={dateTextStyles}>{job.postedOn}</Typography>

                      <Typography sx={dateTextStyles}>{job.expiresOn}</Typography>

                      {/* ACTIONS */}
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        <ActionButton
                          title="View"
                          icon={<VisibilityOutlinedIcon />}
                          onClick={() => navigate(`/employer/jobs/${job.id}`)}
                        />

                        <ActionButton title="Edit" icon={<EditOutlinedIcon />} />

                        <ActionButton title="Pause" icon={<PauseOutlinedIcon />} />

                        <ActionButton title="More" icon={<MoreVertIcon />} />
                      </Stack>
                    </Box>
                  );
                })
              ) : (
                <Box
                  sx={{
                    py: 8,
                    textAlign: 'center',
                  }}
                >
                  <WorkOutlineIcon
                    sx={{
                      fontSize: 42,
                      color: '#aab6c8',
                    }}
                  />

                  <Typography
                    sx={{
                      mt: 1,
                      fontWeight: 800,
                      color: '#34445f',
                    }}
                  >
                    No jobs found
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      color: '#77859a',
                      fontSize: '0.82rem',
                    }}
                  >
                    Try changing your search or filters.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* PAGINATION */}
          <Box
            sx={{
              px: 2.2,
              py: 1.7,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2,
              backgroundColor: '#ffffff',
            }}
          >
            <Typography
              sx={{
                color: '#52617a',
                fontSize: '0.8rem',
              }}
            >
              Showing 1-{Math.min(rowsPerPage, tabCounts.All)} of {tabCounts.All} jobs
            </Typography>

            <Stack direction="row" spacing={0.7} alignItems="center">
              <PaginationButton disabled>
                <ChevronLeftIcon fontSize="small" />
              </PaginationButton>

              {[1, 2, 3].map((item) => (
                <PaginationButton key={item} active={page === item} onClick={() => setPage(item)}>
                  {item}
                </PaginationButton>
              ))}

              <PaginationButton onClick={() => setPage((current) => Math.min(current + 1, 3))}>
                <ChevronRightIcon fontSize="small" />
              </PaginationButton>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: '#52617a',
                }}
              >
                Rows per page:
              </Typography>

              <Select
                size="small"
                value={rowsPerPage}
                onChange={(event) => setRowsPerPage(Number(event.target.value))}
                sx={{
                  width: 75,
                  height: 38,
                  fontSize: '0.8rem',
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
    </Box>
  );
};

const SmallTag = ({ label }: { label: string }) => (
  <Box
    sx={{
      px: 1,
      py: 0.35,
      backgroundColor: '#eef3fb',
      borderRadius: '50px',
      fontSize: '0.66rem',
      fontWeight: 800,
      color: '#34445e',
    }}
  >
    {label}
  </Box>
);

const ActionButton = ({
  icon,
  title,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
}) => (
  <IconButton
    title={title}
    size="small"
    onClick={onClick}
    sx={{
      width: 34,
      height: 34,
      border: '1px solid #dbe3ef',
      borderRadius: '10px',
      color: '#52627c',
      backgroundColor: '#ffffff',

      '& svg': {
        fontSize: 18,
      },

      '&:hover': {
        color: '#1261d7',
        backgroundColor: '#f1f7ff',
        borderColor: '#bdd4f5',
      },
    }}
  >
    {icon}
  </IconButton>
);

const PaginationButton = ({
  children,
  active = false,
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) => (
  <IconButton
    disabled={disabled}
    onClick={onClick}
    sx={{
      minWidth: 38,
      height: 38,
      px: 1,
      borderRadius: '9px',
      border: active ? '1px solid #1261d7' : '1px solid #dce4ef',
      backgroundColor: active ? '#1261d7' : '#ffffff',
      color: active ? '#ffffff' : '#263650',
      fontSize: '0.78rem',
      fontWeight: 850,

      '&:hover': {
        backgroundColor: active ? '#0e54bd' : '#f4f8fd',
      },

      '&.Mui-disabled': {
        opacity: 0.45,
      },
    }}
  >
    {children}
  </IconButton>
);

const filterFieldStyles = {
  '& .MuiOutlinedInput-root': {
    height: 42,
    borderRadius: '11px',
    backgroundColor: '#ffffff',
    fontSize: '0.8rem',

    '& fieldset': {
      borderColor: '#d8e1ee',
    },

    '&:hover fieldset': {
      borderColor: '#b8c7dc',
    },
  },
};

const dateTextStyles = {
  fontSize: '0.78rem',
  color: '#34445d',
};

export default EmployerJobsPage;
