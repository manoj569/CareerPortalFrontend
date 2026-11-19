import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';


const skills = [
  'React',
  'TypeScript',
  'JavaScript',
  'Next.js',
  'HTML',
  'CSS',
  'Redux',
  'REST APIs',
  'Git',
];

const responsibilities = [
  'Design, develop and maintain scalable React.js applications.',
  'Collaborate with product and design to translate requirements into features.',
  'Write clean, reusable and testable code with a focus on performance.',
  'Mentor junior developers and follow best practices for code review and CI/CD.',
];

const sections = [
  {
    label: 'Overview',
    icon: <BusinessCenterOutlinedIcon />,
    active: true,
  },
  {
    label: 'Description',
    icon: <DescriptionOutlinedIcon />,
  },
  {
    label: 'Responsibilities',
    icon: <TaskAltOutlinedIcon />,
  },
  {
    label: 'Skills & Requirements',
    icon: <CodeOutlinedIcon />,
  },
  {
    label: 'Salary & Benefits',
    icon: <PaymentsOutlinedIcon />,
  },
  {
    label: 'Screening & Interviews',
    icon: <FilterAltOutlinedIcon />,
  },
  {
    label: 'Hiring Stages',
    icon: <ChecklistOutlinedIcon />,
  },
  {
    label: 'Visibility & Status',
    icon: <VisibilityOutlinedIcon />,
  },
];

export const EmployerJobDetailsTab = () => {
  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.5 },
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          lg: '250px minmax(0, 1fr)',
        },
        gap: 2,
      }}
    >
      {/* LEFT COLUMN */}
      <Stack spacing={2}>
        <Paper sx={cardStyles}>
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 900,
              color: '#111d37',
              mb: 1.2,
            }}
          >
            Job Sections
          </Typography>

          <Stack spacing={0.45}>
            {sections.map((section) => (
              <Box
                key={section.label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
                  px: 1.2,
                  py: 1,
                  borderRadius: '9px',
                  cursor: 'pointer',
                  color: section.active
                    ? '#0b5bd7'
                    : '#263650',
                  backgroundColor: section.active
                    ? '#e8f1ff'
                    : 'transparent',
                  borderLeft: section.active
                    ? '3px solid #1261d7'
                    : '3px solid transparent',

                  '& svg': {
                    fontSize: 19,
                  },

                  '&:hover': {
                    backgroundColor: '#f3f7fc',
                  },
                }}
              >
                {section.icon}

                <Typography
                  sx={{
                    fontSize: '0.78rem',
                    fontWeight: section.active ? 850 : 700,
                  }}
                >
                  {section.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>

        <Paper sx={cardStyles}>
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 900,
              color: '#111d37',
              mb: 1.3,
            }}
          >
            Quick Actions
          </Typography>

          <Stack spacing={0.9}>
            <QuickAction
              icon={<EditOutlinedIcon />}
              label="Edit Job Details"
            />

            <QuickAction
              icon={<FilterAltOutlinedIcon />}
              label="Manage Screening"
            />

            <QuickAction
              icon={<ChecklistOutlinedIcon />}
              label="Manage Hiring Stages"
            />

            <QuickAction
              icon={<ShareOutlinedIcon />}
              label="Share Job"
            />
          </Stack>
        </Paper>
      </Stack>

      {/* MAIN CONTENT */}
      <Paper
        elevation={0}
        sx={{
          ...cardStyles,
          p: { xs: 2, md: 2.4 },
        }}
      >
        {/* OVERVIEW HEADER */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            flexDirection: { xs: 'column', md: 'row' },
            gap: 1.5,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '13px',
                backgroundColor: '#e6f0ff',
                color: '#1261d7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CodeOutlinedIcon sx={{ fontSize: 29 }} />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: '1.3rem',
                  fontWeight: 900,
                  color: '#101d37',
                }}
              >
                Job Overview
              </Typography>

              <Typography
                sx={{
                  mt: 0.25,
                  fontSize: '0.76rem',
                  color: '#65738a',
                }}
              >
                Key information and summary of this job.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              label="Active"
              size="small"
              sx={{
                backgroundColor: '#ddf7e5',
                color: '#16803c',
                fontWeight: 850,
              }}
            />

            <Typography
              sx={{
                fontSize: '0.7rem',
                color: '#596981',
              }}
            >
              Last updated: Nov 18, 2026, 10:24 AM
            </Typography>
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* SUMMARY CARDS */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
              xl: 'repeat(6, minmax(0, 1fr))',
            },
            gap: 1.2,
          }}
        >
          <SummaryCard
            icon={<WorkOutlineIcon />}
            label="Job Type"
            value="Full-time"
          />

          <SummaryCard
            icon={<BusinessCenterOutlinedIcon />}
            label="Experience"
            value="5-8 years"
          />

          <SummaryCard
            icon={<LocationOnOutlinedIcon />}
            label="Location"
            value="Pune, India"
          />

          <SummaryCard
            icon={<SchoolOutlinedIcon />}
            label="Work Mode"
            value="On-site"
          />

          <SummaryCard
            icon={<GroupsOutlinedIcon />}
            label="Openings"
            value="3"
          />

          <SummaryCard
            icon={<BusinessCenterOutlinedIcon />}
            label="Department"
            value="Engineering"
          />
        </Box>

        {/* BASIC + HIRING SUMMARY */}
        <Box
          sx={{
            mt: 1.5,
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              xl: '1.45fr 1fr',
            },
            gap: 1.5,
          }}
        >
          <SectionCard title="Basic Information">
            <InfoRow
              label="Job Title"
              value="Senior React Developer"
            />
            <InfoRow label="Department" value="Engineering" />
            <InfoRow label="Role Level" value="Senior" />
            <InfoRow
              label="Job Category"
              value="Software Development"
            />
            <InfoRow
              label="Reporting To"
              value="Engineering Manager"
              last
            />
          </SectionCard>

          <SectionCard
            title="Hiring Summary"
            icon={<FilterAltOutlinedIcon />}
          >
            <HiringRow
              label="Total Applicants"
              value="128"
              background="#e5efff"
              color="#1261d7"
            />
            <HiringRow
              label="In Pipeline"
              value="36"
              background="#e7efff"
              color="#3156b8"
            />
            <HiringRow
              label="Shortlisted"
              value="14"
              background="#e1f6e7"
              color="#15803d"
            />
            <HiringRow
              label="Interviews"
              value="8"
              background="#eee6ff"
              color="#6938c6"
            />
            <HiringRow
              label="Offers"
              value="2"
              background="#fff1d8"
              color="#b65c00"
            />
            <HiringRow
              label="Hired"
              value="1"
              background="#dff7e6"
              color="#15803d"
              last
            />
          </SectionCard>
        </Box>

        {/* DESCRIPTION */}
        <SectionCard
          title="Job Description"
          icon={<DescriptionOutlinedIcon />}
          sx={{ mt: 1.5 }}
        >
          <Typography
            sx={{
              fontSize: '0.77rem',
              color: '#34445e',
              lineHeight: 1.65,
            }}
          >
            We are looking for a Senior React Developer to build and
            scale web applications. You will work closely with product,
            design and backend teams to deliver high-quality,
            performant and maintainable solutions.
          </Typography>
        </SectionCard>

        {/* RESPONSIBILITIES + SKILLS */}
        <Box
          sx={{
            mt: 1.5,
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              xl: '1.15fr 0.95fr',
            },
            gap: 1.5,
          }}
        >
          <SectionCard
            title="Key Responsibilities"
            icon={<TaskAltOutlinedIcon />}
          >
            <Stack spacing={0.7}>
              {responsibilities.map((item) => (
                <Stack
                  key={item}
                  direction="row"
                  spacing={0.8}
                  alignItems="flex-start"
                >
                  <TaskAltOutlinedIcon
                    sx={{
                      mt: 0.1,
                      fontSize: 16,
                      color: '#16803c',
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: '0.73rem',
                      color: '#34445e',
                      lineHeight: 1.45,
                    }}
                  >
                    {item}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </SectionCard>

          <SectionCard
            title="Required Skills"
            icon={<CodeOutlinedIcon />}
          >
            <Stack
              direction="row"
              flexWrap="wrap"
              gap={0.8}
            >
              {skills.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  size="small"
                  sx={{
                    backgroundColor: '#eaf2ff',
                    color: '#173d7a',
                    fontWeight: 750,
                    fontSize: '0.68rem',
                  }}
                />
              ))}
            </Stack>
          </SectionCard>
        </Box>

        {/* BOTTOM DETAILS */}
        <Box
          sx={{
            mt: 1.5,
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              xl: 'repeat(4, 1fr)',
            },
            gap: 1.3,
          }}
        >
          <BottomCard
            icon={<PaymentsOutlinedIcon />}
            label="Salary (CTC)"
          >
            <Typography sx={bottomValueStyles}>
              ₹18 - 28 LPA
            </Typography>

            <Typography sx={bottomSubStyles}>
              Based on experience
            </Typography>
          </BottomCard>

          <BottomCard
            icon={<SchoolOutlinedIcon />}
            label="Education"
          >
            <Typography sx={bottomValueStyles}>
              B.E. / B.Tech / M.Tech
            </Typography>

            <Typography sx={bottomSubStyles}>
              Computer Science or related
            </Typography>
          </BottomCard>

          <BottomCard
            icon={<CalendarMonthOutlinedIcon />}
            label="Application Deadline"
          >
            <Typography sx={bottomValueStyles}>
              Dec 18, 2026
            </Typography>

            <Typography
              sx={{
                ...bottomSubStyles,
                color: '#16803c',
                fontWeight: 800,
              }}
            >
              30 days left
            </Typography>
          </BottomCard>

          <BottomCard
            icon={<GroupsOutlinedIcon />}
            label="Candidate Eligibility"
          >
            <EligibilityRow text="Work authorization in India" />
            <EligibilityRow text="Notice period: ≤ 30 days preferred" />
          </BottomCard>
        </Box>

        {/* FULL DEPTH: SCREENING */}
        <SectionCard
          title="Screening & Interviews"
          icon={<FilterAltOutlinedIcon />}
          sx={{ mt: 1.5 }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
                xl: 'repeat(4, 1fr)',
              },
              gap: 1.2,
            }}
          >
            <MiniDetail
              label="Resume Screening"
              value="Enabled"
            />

            <MiniDetail
              label="Skills Assessment"
              value="Enabled"
            />

            <MiniDetail
              label="Minimum Score"
              value="60%"
            />

            <MiniDetail
              label="Shortlisting"
              value="Automatic"
            />

            <MiniDetail
              label="Interview Mode"
              value="Online Video"
            />

            <MiniDetail
              label="Duration"
              value="45 minutes"
            />

            <MiniDetail
              label="Interviewers"
              value="2 members"
            />

            <MiniDetail
              label="Automatic Invite"
              value="Enabled"
            />
          </Box>
        </SectionCard>

        {/* FULL DEPTH: HIRING STAGES */}
        <SectionCard
          title="Hiring Stages"
          icon={<ChecklistOutlinedIcon />}
          sx={{ mt: 1.5 }}
        >
          <Stack
            direction="row"
            flexWrap="wrap"
            alignItems="center"
            useFlexGap
            gap={0.8}
          >
            {[
              'Applied',
              'Resume Screening',
              'Skills Assessment',
              'Interview',
              'Offer',
              'Hired',
            ].map((stage, index, array) => (
              <Stack
                key={stage}
                direction="row"
                spacing={0.8}
                alignItems="center"
              >
                <Chip
                  label={`${index + 1}. ${stage}`}
                  size="small"
                  sx={{
                    backgroundColor:
                      index === 0 ? '#e5efff' : '#f3f6fa',
                    color:
                      index === 0 ? '#1261d7' : '#34445e',
                    fontWeight: 800,
                  }}
                />

                {index < array.length - 1 && (
                  <Typography
                    sx={{
                      color: '#a2adbc',
                      fontWeight: 800,
                    }}
                  >
                    →
                  </Typography>
                )}
              </Stack>
            ))}
          </Stack>
        </SectionCard>

        {/* FULL DEPTH: VISIBILITY */}
        <SectionCard
          title="Visibility & Status"
          icon={<VisibilityOutlinedIcon />}
          sx={{ mt: 1.5 }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(3, 1fr)',
              },
              gap: 1.2,
            }}
          >
            <MiniDetail label="Job Status" value="Active" />
            <MiniDetail label="Visibility" value="Public" />
            <MiniDetail
              label="Applications"
              value="Accepting applications"
            />
          </Box>
        </SectionCard>
      </Paper>
    </Box>
  );
};

const SummaryCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <Paper
    variant="outlined"
    sx={{
      p: 1.2,
      borderRadius: '11px',
      borderColor: '#dfe7f1',
    }}
  >
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={smallIconStyles}>{icon}</Box>

      <Box>
        <Typography
          sx={{
            fontSize: '0.65rem',
            color: '#65738a',
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            mt: 0.15,
            fontSize: '0.76rem',
            color: '#15223d',
            fontWeight: 850,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

const SectionCard = ({
  title,
  icon,
  children,
  sx = {},
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  sx?: object;
}) => (
  <Paper
    variant="outlined"
    sx={{
      p: 1.5,
      borderRadius: '11px',
      borderColor: '#dfe7f1',
      ...sx,
    }}
  >
    <Stack
      direction="row"
      spacing={0.8}
      alignItems="center"
      sx={{ mb: 1 }}
    >
      {icon && (
        <Box
          sx={{
            display: 'flex',
            color: '#1261d7',

            '& svg': {
              fontSize: 19,
            },
          }}
        >
          {icon}
        </Box>
      )}

      <Typography
        sx={{
          fontSize: '0.88rem',
          fontWeight: 900,
          color: '#14213b',
        }}
      >
        {title}
      </Typography>
    </Stack>

    {children}
  </Paper>
);

const InfoRow = ({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: '180px 1fr',
      gap: 1,
      py: 0.65,
      borderBottom: last ? 0 : '1px solid #e8edf4',
    }}
  >
    <Typography
      sx={{
        fontSize: '0.72rem',
        fontWeight: 750,
        color: '#263650',
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        fontSize: '0.72rem',
        color: '#17243d',
      }}
    >
      {value}
    </Typography>
  </Box>
);

const HiringRow = ({
  label,
  value,
  background,
  color,
  last = false,
}: {
  label: string;
  value: string;
  background: string;
  color: string;
  last?: boolean;
}) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      py: 0.45,
      borderBottom: last ? 0 : '1px solid #e8edf4',
    }}
  >
    <Typography
      sx={{
        fontSize: '0.72rem',
        color: '#34445e',
      }}
    >
      {label}
    </Typography>

    <Box
      sx={{
        minWidth: 30,
        height: 23,
        px: 0.7,
        borderRadius: '7px',
        backgroundColor: background,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.7rem',
        fontWeight: 900,
      }}
    >
      {value}
    </Box>
  </Box>
);

const BottomCard = ({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) => (
  <Paper
    variant="outlined"
    sx={{
      p: 1.4,
      borderRadius: '11px',
      borderColor: '#dfe7f1',
    }}
  >
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <Box sx={smallIconStyles}>{icon}</Box>

      <Box>
        <Typography
          sx={{
            fontSize: '0.68rem',
            color: '#53627a',
            fontWeight: 750,
            mb: 0.35,
          }}
        >
          {label}
        </Typography>

        {children}
      </Box>
    </Stack>
  </Paper>
);

const MiniDetail = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <Box
    sx={{
      px: 1.2,
      py: 1,
      border: '1px solid #e2e8f1',
      borderRadius: '9px',
      backgroundColor: '#fbfdff',
    }}
  >
    <Typography
      sx={{
        fontSize: '0.64rem',
        color: '#6b7890',
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        mt: 0.25,
        fontSize: '0.73rem',
        color: '#1c2b45',
        fontWeight: 800,
      }}
    >
      {value}
    </Typography>
  </Box>
);

const EligibilityRow = ({ text }: { text: string }) => (
  <Stack
    direction="row"
    spacing={0.6}
    alignItems="flex-start"
    sx={{ mb: 0.35 }}
  >
    <TaskAltOutlinedIcon
      sx={{
        fontSize: 15,
        color: '#16803c',
        mt: 0.05,
      }}
    />

    <Typography
      sx={{
        fontSize: '0.68rem',
        color: '#34445e',
      }}
    >
      {text}
    </Typography>
  </Stack>
);

const QuickAction = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <Button
    variant="outlined"
    startIcon={icon}
    fullWidth
    sx={{
      justifyContent: 'flex-start',
      textTransform: 'none',
      borderRadius: '8px',
      borderColor: '#d7e0ec',
      color: '#263650',
      fontSize: '0.73rem',
      fontWeight: 750,

      '&:hover': {
        borderColor: '#aac6ee',
        backgroundColor: '#f2f7ff',
      },
    }}
  >
    {label}
  </Button>
);

const cardStyles = {
  p: 1.7,
  border: '1px solid #e0e7f1',
  borderRadius: '15px',
  boxShadow: 'none',
};

const smallIconStyles = {
  width: 35,
  height: 35,
  borderRadius: '9px',
  backgroundColor: '#e8f1ff',
  color: '#1261d7',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,

  '& svg': {
    fontSize: 19,
  },
};

const bottomValueStyles = {
  fontSize: '0.78rem',
  color: '#15223d',
  fontWeight: 900,
};

const bottomSubStyles = {
  mt: 0.2,
  fontSize: '0.64rem',
  color: '#65738a',
};

export default EmployerJobDetailsTab;