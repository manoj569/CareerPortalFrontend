import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
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
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const metrics = [
  {
    label: 'Active Jobs',
    value: '12',
    icon: <BusinessCenterOutlinedIcon />,
    background: '#eaf1ff',
    color: '#075de7',
  },
  {
    label: 'Total Applicants',
    value: '286',
    icon: <GroupsOutlinedIcon />,
    background: '#e9f9ef',
    color: '#12a84f',
  },
  {
    label: 'Shortlisted',
    value: '24',
    icon: <PersonAddAltOutlinedIcon />,
    background: '#fff3e7',
    color: '#ef7900',
  },
  {
    label: 'Interviews',
    value: '8',
    icon: <CalendarMonthOutlinedIcon />,
    background: '#f4eaff',
    color: '#7c21e8',
  },
  {
    label: 'Hired',
    value: '3',
    icon: <CheckCircleOutlineOutlinedIcon />,
    background: '#e8f8ee',
    color: '#18a653',
  },
];

const pipeline = [
  {
    label: 'Applied',
    value: 286,
    progress: 100,
    color: '#0868ed',
    iconBackground: '#eaf2ff',
  },
  {
    label: 'Shortlisted',
    value: 24,
    progress: 22,
    color: '#4f98f8',
    iconBackground: '#eaf2ff',
  },
  {
    label: 'Screening',
    value: 12,
    progress: 12,
    color: '#8058e9',
    iconBackground: '#f0eaff',
  },
  {
    label: 'Interview',
    value: 8,
    progress: 8,
    color: '#ff9347',
    iconBackground: '#fff1e7',
  },
  {
    label: 'Offer',
    value: 4,
    progress: 4,
    color: '#91d85d',
    iconBackground: '#effbe8',
  },
  {
    label: 'Hired',
    value: 3,
    progress: 3,
    color: '#3cc66c',
    iconBackground: '#e9f9ef',
  },
];

const recentApplicants = [
  {
    initials: 'AP',
    name: 'Ananya Patil',
    role: 'Software Engineer',
    time: 'Applied 2 hours ago',
    background: '#e8f0ff',
    color: '#075de7',
    isNew: true,
  },
  {
    initials: 'RK',
    name: 'Rohan Kulkarni',
    role: 'Software Engineer',
    time: 'Applied 4 hours ago',
    background: '#e8f0ff',
    color: '#075de7',
    isNew: true,
  },
  {
    initials: 'SS',
    name: 'Shruti Sharma',
    role: 'Frontend Developer',
    time: 'Applied 5 hours ago',
    background: '#fff4dc',
    color: '#a96700',
    isNew: false,
  },
  {
    initials: 'VM',
    name: 'Vivek More',
    role: 'SDE - II',
    time: 'Applied 6 hours ago',
    background: '#eee7ff',
    color: '#5921d5',
    isNew: false,
  },
];

const activeJobs = [
  {
    title: 'Software Engineer',
    location: 'Pune, India',
    applicants: 86,
  },
  {
    title: 'Frontend Developer',
    location: 'Pune, India',
    applicants: 64,
  },
  {
    title: 'Product Manager',
    location: 'Bengaluru, India',
    applicants: 38,
  },
];

export const EmployerDashboardPage = () => {
  useDocumentMetadata(
    'Employer Dashboard | Career Harbor',
    'Manage jobs, candidates, interviews and your hiring pipeline on Career Harbor.',
    {
      canonicalPath: ROUTES.EMPLOYER_DASHBOARD,
      noIndex: true,
    },
  );

  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f5f8fd',
        color: '#101828',
      }}
    >
      {/* TOP HEADER */}
      <Box
        component="header"
        sx={{
          height: 74,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e4e9f2',
          display: 'flex',
          alignItems: 'center',
          px: { xs: 2, md: 4 },
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: { xs: '1.15rem', md: '1.35rem' },
              fontWeight: 800,
              lineHeight: 1.15,
            }}
          >
            Employer Dashboard
          </Typography>

          <Typography
            sx={{
              color: '#53627c',
              fontSize: '0.88rem',
              mt: 0.4,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Hire top talent, manage jobs and track your hiring pipeline.
          </Typography>
        </Box>

        <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 2 }}>
          <IconButton>
            <Box sx={{ position: 'relative' }}>
              <Typography sx={{ fontSize: 22 }}>♧</Typography>

              <Box
                sx={{
                  position: 'absolute',
                  top: -2,
                  right: -4,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#f04452',
                }}
              />
            </Box>
          </IconButton>

          <IconButton sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
            <Typography sx={{ fontSize: 20, fontWeight: 800 }}>?</Typography>
          </IconButton>

          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#075de7',
              fontSize: '0.82rem',
              fontWeight: 800,
            }}
          >
            RS
          </Avatar>

          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Typography fontSize="0.9rem" fontWeight={800}>
              Rohit Sharma
            </Typography>

            <Typography color="#53627c" fontSize="0.78rem">
              HR / Recruiter
            </Typography>
          </Box>

          <Typography
            sx={{
              display: { xs: 'none', md: 'block' },
              fontWeight: 800,
            }}
          >
            ⌄
          </Typography>
        </Stack>
      </Box>

      {/* DASHBOARD BODY */}
      <Box
        component="main"
        sx={{
          p: {
            xs: 2,
            sm: 2.5,
            md: 3.5,
          },
        }}
      >
        {/* WELCOME */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography
              component="h1"
              sx={{
                fontSize: {
                  xs: '1.55rem',
                  md: '1.8rem',
                },
                fontWeight: 850,
                lineHeight: 1.2,
              }}
            >
              Welcome back, Rohit! 👋
            </Typography>

            <Typography
              sx={{
                color: '#53627c',
                mt: 0.6,
                fontSize: '0.95rem',
              }}
            >
              Here&apos;s what&apos;s happening with your hiring today.
            </Typography>
          </Box>

          <Select
            defaultValue="30"
            size="small"
            sx={{
              minWidth: 165,
              bgcolor: '#fff',
              fontWeight: 700,
              borderRadius: 2,
            }}
          >
            <MenuItem value="7">Last 7 days</MenuItem>
            <MenuItem value="30">Last 30 days</MenuItem>
            <MenuItem value="90">Last 90 days</MenuItem>
          </Select>
        </Stack>

        {/* KPI CARDS */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(5, 1fr)',
            },
            gap: 2,
            mb: 2.5,
          }}
        >
          {metrics.map((metric) => (
            <Paper
              elevation={0}
              key={metric.label}
              sx={{
                minHeight: 104,
                border: '1px solid #e1e7f0',
                borderRadius: 3,
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                boxShadow: '0 3px 10px rgba(15,23,42,.04)',
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  flexShrink: 0,
                  borderRadius: 2.5,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: metric.background,
                  color: metric.color,
                  '& svg': {
                    fontSize: 29,
                  },
                }}
              >
                {metric.icon}
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: '1.75rem',
                    lineHeight: 1,
                    fontWeight: 850,
                  }}
                >
                  {metric.value}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.8,
                    color: '#34425b',
                    fontSize: '0.9rem',
                  }}
                >
                  {metric.label}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* MIDDLE */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              xl: '1fr 1fr',
            },
            gap: 2.5,
            mb: 2.5,
          }}
        >
          {/* PIPELINE */}
          <DashboardCard title="Hiring Pipeline">
            <Stack spacing={1.65}>
              {pipeline.map((stage) => (
                <Box
                  key={stage.label}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '28px 130px 50px 1fr',
                    gap: 1,
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: stage.iconBackground,
                      display: 'grid',
                      placeItems: 'center',
                      color: stage.color,
                      fontSize: '0.72rem',
                      fontWeight: 900,
                    }}
                  >
                    ▽
                  </Box>

                  <Typography
                    sx={{
                      fontSize: '0.88rem',
                      fontWeight: 650,
                    }}
                  >
                    {stage.label}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: '0.88rem',
                      fontWeight: 800,
                    }}
                  >
                    {stage.value}
                  </Typography>

                  <LinearProgress
                    value={stage.progress}
                    variant="determinate"
                    sx={{
                      height: 18,
                      borderRadius: 1.5,
                      bgcolor: '#e7ebf3',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 1.5,
                        bgcolor: stage.color,
                      },
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </DashboardCard>

          {/* RECENT APPLICANTS */}
          <DashboardCard
            action={
              <Button
                onClick={() => navigate(ROUTES.EMPLOYER_CANDIDATES)}
                sx={{
                  fontWeight: 800,
                  textTransform: 'none',
                }}
              >
                View All
              </Button>
            }
            title="Recent Applicants"
          >
            <Stack>
              {recentApplicants.map((applicant, index) => (
                <Box
                  key={applicant.name}
                  sx={{
                    minHeight: 61,
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom:
                      index === recentApplicants.length - 1
                        ? 'none'
                        : '1px solid #e5e9f0',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 43,
                      height: 43,
                      mr: 1.5,
                      bgcolor: applicant.background,
                      color: applicant.color,
                      fontSize: '0.8rem',
                      fontWeight: 850,
                    }}
                  >
                    {applicant.initials}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      noWrap
                      sx={{
                        fontSize: '0.9rem',
                        fontWeight: 800,
                      }}
                    >
                      {applicant.name}
                    </Typography>

                    <Typography
                      noWrap
                      sx={{
                        color: '#53627c',
                        fontSize: '0.78rem',
                      }}
                    >
                      {applicant.role} • {applicant.time}
                    </Typography>
                  </Box>

                  {applicant.isNew && (
                    <Chip
                      label="New"
                      size="small"
                      sx={{
                        mr: 1,
                        height: 24,
                        bgcolor: '#e8f0ff',
                        color: '#075de7',
                        fontWeight: 800,
                      }}
                    />
                  )}

                  <IconButton size="small">
                    <MoreVertOutlinedIcon />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </DashboardCard>
        </Box>

        {/* BOTTOM */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              xl: '1fr 1fr',
            },
            gap: 2.5,
          }}
        >
          {/* ACTIVE JOBS */}
          <DashboardCard
            action={
              <Button
                onClick={() => navigate(ROUTES.EMPLOYER_JOBS)}
                sx={{
                  fontWeight: 800,
                  textTransform: 'none',
                }}
              >
                View All Jobs
              </Button>
            }
            title="Active Jobs (12)"
          >
            <Stack>
              {activeJobs.map((job, index) => (
                <Box
                  key={job.title}
                  sx={{
                    minHeight: 63,
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom:
                      index === activeJobs.length - 1
                        ? 'none'
                        : '1px solid #e5e9f0',
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      bgcolor: '#eaf1ff',
                      color: '#075de7',
                      display: 'grid',
                      placeItems: 'center',
                      mr: 1.5,
                      flexShrink: 0,
                    }}
                  >
                    <BusinessCenterOutlinedIcon fontSize="small" />
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      noWrap
                      sx={{
                        fontSize: '0.9rem',
                        fontWeight: 800,
                      }}
                    >
                      {job.title}
                    </Typography>

                    <Typography
                      noWrap
                      sx={{
                        color: '#53627c',
                        fontSize: '0.78rem',
                      }}
                    >
                      {job.location} • {job.applicants} applicants
                    </Typography>
                  </Box>

                  <Chip
                    label="Active"
                    size="small"
                    sx={{
                      mr: 1,
                      bgcolor: '#e5f8ea',
                      color: '#07852f',
                      fontWeight: 800,
                    }}
                  />

                  <IconButton size="small">
                    <MoreVertOutlinedIcon />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </DashboardCard>

          {/* QUICK ACTIONS */}
          <DashboardCard title="Quick Actions">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                },
                gap: 1.5,
              }}
            >
              <QuickAction
                icon={<AddOutlinedIcon />}
                iconBackground="#eaf1ff"
                iconColor="#075de7"
                onClick={() => navigate(ROUTES.EMPLOYER_JOB_CREATE)}
                subtitle="Post a new job opening"
                title="Create Job"
              />

              <QuickAction
                icon={<GroupsOutlinedIcon />}
                iconBackground="#eaf1ff"
                iconColor="#075de7"
                onClick={() => navigate(ROUTES.EMPLOYER_CANDIDATE_FIND)}
                subtitle="Search with AI"
                title="Find Candidates"
              />

              <QuickAction
                icon={<CalendarMonthOutlinedIcon />}
                iconBackground="#f1eaff"
                iconColor="#7b25e8"
                onClick={() => navigate(ROUTES.EMPLOYER_INTERVIEWS)}
                subtitle="Plan and manage interviews"
                title="Schedule Interview"
              />

              <QuickAction
                icon={<AnalyticsOutlinedIcon />}
                iconBackground="#e6f8ec"
                iconColor="#13a54b"
                onClick={() => navigate(ROUTES.EMPLOYER_ANALYTICS)}
                subtitle="Track hiring performance"
                title="View Analytics"
              />
            </Box>
          </DashboardCard>
        </Box>
      </Box>
    </Box>
  );
};

const DashboardCard = ({
  action,
  children,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  title: string;
}) => (
  <Paper
    elevation={0}
    sx={{
      border: '1px solid #e1e7f0',
      borderRadius: 3,
      boxShadow: '0 3px 10px rgba(15,23,42,.04)',
      overflow: 'hidden',
    }}
  >
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        minHeight: 52,
        px: 2.25,
      }}
    >
      <Typography
        sx={{
          fontSize: '1.05rem',
          fontWeight: 850,
        }}
      >
        {title}
      </Typography>

      {action}
    </Stack>

    <Box sx={{ px: 2.25, pb: 2 }}>{children}</Box>
  </Paper>
);

const QuickAction = ({
  icon,
  iconBackground,
  iconColor,
  onClick,
  subtitle,
  title,
}: {
  icon: ReactNode;
  iconBackground: string;
  iconColor: string;
  onClick: () => void;
  subtitle: string;
  title: string;
}) => (
  <Box
    component="button"
    onClick={onClick}
    sx={{
      width: '100%',
      minHeight: 76,
      bgcolor: '#fff',
      border: '1px solid #dfe5ef',
      borderRadius: 2,
      px: 1.5,
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      textAlign: 'left',
      cursor: 'pointer',
      font: 'inherit',
      transition: 'border-color .15s ease, box-shadow .15s ease',
      '&:hover': {
        borderColor: '#b8c9e7',
        boxShadow: '0 4px 12px rgba(15,23,42,.05)',
      },
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        bgcolor: iconBackground,
        color: iconColor,
      }}
    >
      {icon}
    </Box>

    <Box>
      <Typography
        sx={{
          fontSize: '0.88rem',
          fontWeight: 800,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          color: '#53627c',
          fontSize: '0.76rem',
          mt: 0.25,
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  </Box>
);