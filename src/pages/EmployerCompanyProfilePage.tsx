import { useState } from 'react';
import type { ReactNode } from 'react';

import {
  Avatar,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import CheckIcon from '@mui/icons-material/Check';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import StarIcon from '@mui/icons-material/Star';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import XIcon from '@mui/icons-material/X';

type CompanyTab =
  | 'about'
  | 'media'
  | 'team'
  | 'benefits'
  | 'hiring';

export const EmployerCompanyProfilePage = () => {
  const [tab, setTab] = useState<CompanyTab>('about');

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
        <Typography sx={breadcrumbStyle}>CareerHarbor</Typography>
        <Typography sx={breadcrumbStyle}>/</Typography>

        <Typography
          sx={{
            ...breadcrumbStyle,
            color: '#17233d',
            fontWeight: 900,
          }}
        >
          Company Profile
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
            'linear-gradient(110deg,#f7f5ff 0%,#eef3ff 54%,#eee9ff 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 250,
            height: 250,
            borderRadius: '50%',
            right: 80,
            top: -190,
            border: '38px solid rgba(91,75,255,.05)',
          }}
        />

        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', lg: 'center' },
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
                  'linear-gradient(135deg,#2675f5 0%,#7b43ed 100%)',
              }}
            >
              <BusinessOutlinedIcon sx={{ fontSize: 27 }} />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: { xs: '1.15rem', md: '1.42rem' },
                  fontWeight: 950,
                  color: '#0f1b39',
                }}
              >
                Company Profile
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  fontSize: '0.73rem',
                  color: '#425477',
                }}
              >
                Manage your company details, branding, team and hiring
                preferences.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              startIcon={<VisibilityOutlinedIcon />}
              sx={heroButton}
            >
              View Public Page
            </Button>

            <Button
              variant="outlined"
              startIcon={<SettingsOutlinedIcon />}
              sx={heroButton}
            >
              Company Settings
            </Button>

            <Button
              variant="contained"
              startIcon={<EditOutlinedIcon />}
              sx={primaryButton}
            >
              Edit Profile
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Main content */}
      <Box
        sx={{
          mt: 1.4,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl: 'minmax(0,1.55fr) minmax(320px,1fr)',
          },
          gap: 1.3,
          alignItems: 'start',
        }}
      >
        {/* LEFT */}
        <Stack spacing={1.3}>
          {/* Company identity */}
          <Paper
            elevation={0}
            sx={{
              overflow: 'hidden',
              border: '1px solid #dfe6ef',
              borderRadius: '13px',
            }}
          >
            {/* Cover */}
            <Box
              sx={{
                height: { xs: 150, md: 190 },
                position: 'relative',
                background:
                  'linear-gradient(135deg,#8ac4ec 0%,#d8e6ef 38%,#708ea6 100%)',
                overflow: 'hidden',
              }}
            >
              {/* Building-style decorative background */}
              <Box
                sx={{
                  position: 'absolute',
                  width: '65%',
                  height: '130%',
                  right: '5%',
                  top: '12%',
                  transform: 'skewY(-4deg)',
                  background:
                    'linear-gradient(90deg,rgba(20,58,91,.75) 2px,transparent 2px), linear-gradient(rgba(20,58,91,.55) 2px,transparent 2px), linear-gradient(135deg,#5f91b8,#bdd5e5)',
                  backgroundSize: '42px 100%,100% 35px,100% 100%',
                  border: '2px solid rgba(30,61,87,.35)',
                }}
              />

              <Button
                startIcon={<EditOutlinedIcon />}
                sx={{
                  position: 'absolute',
                  top: 15,
                  right: 15,
                  bgcolor: '#fff',
                  color: '#17233d',
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontSize: '0.63rem',
                  fontWeight: 900,
                  px: 1.5,

                  '&:hover': {
                    bgcolor: '#f7f9fc',
                  },
                }}
              >
                Edit Cover
              </Button>
            </Box>

            <Box
              sx={{
                px: { xs: 1.5, md: 2 },
                pb: 1.6,
                position: 'relative',
              }}
            >
              {/* Logo */}
              <Paper
                elevation={1}
                sx={{
                  position: { xs: 'relative', md: 'absolute' },
                  top: { xs: -30, md: -80 },
                  left: { xs: 0, md: 28 },
                  width: 145,
                  height: 145,
                  borderRadius: '16px',
                  bgcolor: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  border: '1px solid #e1e7ef',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '2rem',
                    fontWeight: 950,
                    color: '#1261d7',
                    lineHeight: 1,
                  }}
                >
                  T
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    lineHeight: 1.05,
                    fontWeight: 950,
                    color: '#17233d',
                  }}
                >
                  TechNova
                  <br />
                  Solutions
                </Typography>
              </Paper>

              <Box
                sx={{
                  ml: { xs: 0, md: '180px' },
                  mt: { xs: -2, md: 1.8 },
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={1}
                >
                  <Box>
                    <Stack direction="row" spacing={0.6} alignItems="center">
                      <Typography
                        sx={{
                          fontSize: '1.25rem',
                          fontWeight: 950,
                          color: '#101b38',
                        }}
                      >
                        TechNova Solutions
                      </Typography>

                      <VerifiedIcon
                        sx={{
                          fontSize: 18,
                          color: '#1473e6',
                        }}
                      />
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={0.5}
                      flexWrap="wrap"
                      useFlexGap
                      sx={{ mt: 0.7 }}
                    >
                      <ProfileChip label="IT Services" />
                      <ProfileChip label="Product & Platforms" />

                      <ProfileChip
                        icon={<LocationOnOutlinedIcon />}
                        label="Pune, India"
                      />
                    </Stack>
                  </Box>

                  <Button
                    startIcon={<EditOutlinedIcon />}
                    sx={{
                      minWidth: 0,
                      textTransform: 'none',
                      fontSize: '0.62rem',
                      fontWeight: 900,
                    }}
                  >
                    Edit
                  </Button>
                </Stack>
              </Box>

              <Typography
                sx={{
                  mt: { xs: 1.5, md: 3.8 },
                  fontSize: '0.66rem',
                  lineHeight: 1.6,
                  color: '#344861',
                }}
              >
                A technology company building scalable products and enterprise
                solutions for global clients. We hire talented people to solve
                real-world problems at scale.
              </Typography>

              <Box
                sx={{
                  mt: 1.6,
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2,1fr)',
                    md: 'repeat(4,1fr)',
                  },
                }}
              >
                <CompanyStat
                  icon={<CalendarMonthOutlinedIcon />}
                  value="2018"
                  label="Founded"
                />

                <CompanyStat
                  icon={<GroupsOutlinedIcon />}
                  value="201 – 500"
                  label="Employees"
                  border
                />

                <CompanyStat
                  icon={<BusinessOutlinedIcon />}
                  value="6+"
                  label="Open Jobs"
                  border
                />

                <CompanyStat
                  icon={<WorkspacePremiumOutlinedIcon />}
                  value="4.3"
                  label="Company Rating"
                  suffix={<StarIcon sx={{ fontSize: 15, color: '#f59b16' }} />}
                  border
                />
              </Box>
            </Box>
          </Paper>

          {/* Profile tabs */}
          <Paper
            elevation={0}
            sx={{
              border: '1px solid #dfe6ef',
              borderRadius: '13px',
              overflow: 'hidden',
            }}
          >
            <Tabs
              value={tab}
              onChange={(_, value: CompanyTab) => setTab(value)}
              variant="scrollable"
              scrollButtons={false}
              sx={{
                px: 1.2,
                minHeight: 48,
                borderBottom: '1px solid #e3e9f1',

                '& .MuiTab-root': {
                  minHeight: 48,
                  textTransform: 'none',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  color: '#263750',
                  px: 2,
                },

                '& .Mui-selected': {
                  color: '#0758ce !important',
                },

                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: 3,
                  bgcolor: '#1261e8',
                },
              }}
            >
              <Tab value="about" label="About" />
              <Tab value="media" label="Media" />
              <Tab value="team" label="Team (12)" />
              <Tab value="benefits" label="Benefits" />
              <Tab value="hiring" label="Hiring Preferences" />
            </Tabs>

            <Box sx={{ p: 1.6 }}>
              {tab === 'about' && <AboutTab />}
              {tab === 'media' && <MediaTab />}
              {tab === 'team' && <TeamTab />}
              {tab === 'benefits' && <BenefitsTab />}
              {tab === 'hiring' && <HiringPreferencesTab />}
            </Box>
          </Paper>
        </Stack>

        {/* RIGHT */}
        <Stack spacing={1.3}>
          <CompanyDetails />

          <SocialLinks />
        </Stack>
      </Box>

      <Typography
        sx={{
          mt: 0.8,
          fontSize: '0.61rem',
          color: '#7b8799',
        }}
      >
        Company information shown here is frontend demo data until the Employer
        Company Profile API is connected.
      </Typography>
    </Box>
  );
};

/* =========================
   ABOUT TAB
========================= */

const AboutTab = () => (
  <Box>
    <SectionHeader title="About Us" />

    <Typography
      sx={{
        mt: 0.6,
        fontSize: '0.64rem',
        lineHeight: 1.6,
        color: '#344861',
      }}
    >
      A technology company building scalable products and enterprise solutions
      for global clients. We hire talented people to solve real-world problems
      at scale.
    </Typography>

    <Box
      sx={{
        mt: 1.5,
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(3,1fr)',
        },
        gap: 1,
      }}
    >
      <InfoCard
        icon={<TrackChangesOutlinedIcon />}
        title="Mission"
      >
        Build impactful, scalable and user-centric technology solutions.
      </InfoCard>

      <InfoCard
        icon={<VisibilityOutlinedIcon />}
        title="Vision"
      >
        Be a global product and talent-first technology company.
      </InfoCard>

      <InfoCard
        icon={<WorkspacePremiumOutlinedIcon />}
        title="Values"
      >
        <Stack spacing={0.2}>
          {[
            'Customer Focus',
            'Ownership',
            'Continuous Learning',
            'Inclusivity',
            'Impact at Scale',
          ].map((item) => (
            <Stack
              key={item}
              direction="row"
              spacing={0.5}
              alignItems="center"
            >
              <CheckIcon sx={{ fontSize: 13 }} />
              <Typography sx={{ fontSize: '0.59rem' }}>
                {item}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </InfoCard>
    </Box>
  </Box>
);

/* =========================
   MEDIA TAB
========================= */

const MediaTab = () => (
  <Box>
    <SectionHeader title="Company Media" />

    <Typography sx={sectionDescription}>
      Showcase your workplace, culture, events and team.
    </Typography>

    <Box
      sx={{
        mt: 1.3,
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2,1fr)',
          md: 'repeat(3,1fr)',
        },
        gap: 1,
      }}
    >
      {['Office', 'Team', 'Culture', 'Events', 'Workspace', 'Meetups'].map(
        (item, index) => (
          <Box
            key={item}
            sx={{
              height: 125,
              borderRadius: '10px',
              border: '1px solid #dfe6ef',
              background:
                index % 2 === 0
                  ? 'linear-gradient(135deg,#dbeafe,#eef2ff)'
                  : 'linear-gradient(135deg,#eee7ff,#f7f5ff)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
            }}
          >
            <CameraAltOutlinedIcon
              sx={{
                color: '#5d6f8b',
                fontSize: 25,
              }}
            />

            <Typography
              sx={{
                fontSize: '0.62rem',
                fontWeight: 900,
                color: '#344861',
              }}
            >
              {item}
            </Typography>
          </Box>
        ),
      )}
    </Box>

    <Button
      startIcon={<AddIcon />}
      variant="outlined"
      sx={{
        mt: 1.2,
        ...smallButton,
      }}
    >
      Add Media
    </Button>
  </Box>
);

/* =========================
   TEAM TAB
========================= */

const TeamTab = () => {
  const members = [
    ['AK', 'Amit Kulkarni', 'Engineering Director'],
    ['PS', 'Priya Shah', 'Head of Talent'],
    ['RM', 'Rahul Mehta', 'Product Director'],
    ['SK', 'Sneha Kapoor', 'HR Business Partner'],
  ];

  return (
    <Box>
      <SectionHeader title="Leadership & Hiring Team" />

      <Typography sx={sectionDescription}>
        People representing your company and managing recruitment.
      </Typography>

      <Box
        sx={{
          mt: 1.3,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2,1fr)',
          },
          gap: 1,
        }}
      >
        {members.map(([initials, name, role]) => (
          <Paper
            key={name}
            elevation={0}
            sx={{
              p: 1.2,
              border: '1px solid #e1e7ef',
              borderRadius: '10px',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: '#e9e5ff',
                  color: '#6033d4',
                  fontSize: '0.66rem',
                  fontWeight: 950,
                }}
              >
                {initials}
              </Avatar>

              <Box>
                <Typography sx={cardTitle}>{name}</Typography>
                <Typography sx={cardDescription}>{role}</Typography>
              </Box>
            </Stack>
          </Paper>
        ))}
      </Box>

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        sx={{
          mt: 1.2,
          ...smallButton,
        }}
      >
        Add Team Member
      </Button>
    </Box>
  );
};

/* =========================
   BENEFITS TAB
========================= */

const BenefitsTab = () => {
  const benefits = [
    'Flexible Working',
    'Health Insurance',
    'Learning Budget',
    'Performance Bonus',
    'Paid Time Off',
    'Hybrid Work',
    'Career Growth',
    'Team Events',
  ];

  return (
    <Box>
      <SectionHeader title="Employee Benefits" />

      <Typography sx={sectionDescription}>
        Benefits and workplace advantages visible to candidates.
      </Typography>

      <Stack
        direction="row"
        spacing={0.7}
        flexWrap="wrap"
        useFlexGap
        sx={{ mt: 1.3 }}
      >
        {benefits.map((benefit) => (
          <Chip
            key={benefit}
            icon={<CheckIcon />}
            label={benefit}
            sx={{
              bgcolor: '#f2f6ff',
              color: '#244b87',
              border: '1px solid #dce7f8',
              fontSize: '0.59rem',
              fontWeight: 800,

              '& .MuiChip-icon': {
                color: '#1473e6',
                fontSize: 15,
              },
            }}
          />
        ))}
      </Stack>

      <Button
        startIcon={<AddIcon />}
        variant="outlined"
        sx={{
          mt: 1.3,
          ...smallButton,
        }}
      >
        Add Benefit
      </Button>
    </Box>
  );
};

/* =========================
   HIRING PREFERENCES TAB
========================= */

const HiringPreferencesTab = () => (
  <Box>
    <SectionHeader title="Hiring Preferences" />

    <Typography sx={sectionDescription}>
      Default recruitment preferences used when creating and managing jobs.
    </Typography>

    <Box
      sx={{
        mt: 1.3,
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(2,1fr)',
        },
        gap: 1,
      }}
    >
      <PreferenceCard
        title="Primary Hiring Locations"
        value="Pune, Bengaluru, Hyderabad"
      />

      <PreferenceCard
        title="Preferred Work Mode"
        value="Hybrid / Remote"
      />

      <PreferenceCard
        title="Primary Hiring"
        value="Engineering, Product, Design"
      />

      <PreferenceCard
        title="Typical Experience"
        value="2 – 8 years"
      />

      <PreferenceCard
        title="Notice Period"
        value="Immediate – 60 days"
      />

      <PreferenceCard
        title="Interview Process"
        value="Screening → Technical → HR"
      />
    </Box>
  </Box>
);

/* =========================
   COMPANY DETAILS
========================= */

const CompanyDetails = () => (
  <Paper elevation={0} sx={sideCard}>
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Typography sx={sideTitle}>Company Details</Typography>

      <Button
        startIcon={<EditOutlinedIcon />}
        sx={editButton}
      >
        Edit
      </Button>
    </Stack>

    <Box sx={{ mt: 0.7 }}>
      <DetailRow
        icon={<LanguageOutlinedIcon />}
        label="Website"
        value={
          <Stack direction="row" spacing={0.3} alignItems="center">
            <Typography sx={linkText}>technova.com</Typography>
            <OpenInNewIcon sx={{ fontSize: 12, color: '#0758ce' }} />
          </Stack>
        }
      />

      <DetailRow
        icon={<BusinessOutlinedIcon />}
        label="Industry"
        value="IT Services & Consulting"
      />

      <DetailRow
        icon={<BusinessOutlinedIcon />}
        label="Company Type"
        value="Private Limited"
      />

      <DetailRow
        icon={<PublicOutlinedIcon />}
        label="Headquarters"
        value="Pune, Maharashtra, India"
      />

      <DetailRow
        icon={<LocationOnOutlinedIcon />}
        label="Locations"
        value="Pune, Bengaluru, Hyderabad"
      />

      <DetailRow
        icon={<GroupsOutlinedIcon />}
        label="Size"
        value="201 – 500 Employees"
        last
      />
    </Box>
  </Paper>
);

/* =========================
   SOCIAL LINKS
========================= */

const SocialLinks = () => (
  <Paper elevation={0} sx={sideCard}>
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Typography sx={sideTitle}>Social Links</Typography>

      <Button
        startIcon={<EditOutlinedIcon />}
        sx={editButton}
      >
        Edit
      </Button>
    </Stack>

    <Box sx={{ mt: 0.7 }}>
      <SocialRow
        icon={
          <LinkedInIcon
            sx={{
              color: '#0a66c2',
              fontSize: 19,
            }}
          />
        }
        label="LinkedIn"
        value="linkedin.com/company/technova"
      />

      <SocialRow
        icon={<XIcon sx={{ fontSize: 18 }} />}
        label="X (Twitter)"
        value="x.com/technova"
      />

      <SocialRow
        icon={
          <PlayCircleFilledWhiteOutlinedIcon
            sx={{
              color: '#ff0000',
              fontSize: 20,
            }}
          />
        }
        label="YouTube"
        value="youtube.com/@technova"
      />
    </Box>

    <Button
      startIcon={<AddIcon />}
      sx={{
        mt: 0.7,
        textTransform: 'none',
        fontSize: '0.63rem',
        fontWeight: 900,
      }}
    >
      Add Social Link
    </Button>
  </Paper>
);

/* =========================
   REUSABLE COMPONENTS
========================= */

const DetailRow = ({
  icon,
  label,
  value,
  last = false,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  last?: boolean;
}) => (
  <Box
    sx={{
      py: 0.8,
      display: 'grid',
      gridTemplateColumns: '34px 120px 1fr',
      gap: 0.7,
      alignItems: 'center',
      borderBottom: last ? 'none' : '1px solid #e6ebf2',
    }}
  >
    <Box
      sx={{
        width: 29,
        height: 29,
        borderRadius: '50%',
        bgcolor: '#f1f4f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#344861',

        '& svg': {
          fontSize: 16,
        },
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        fontSize: '0.62rem',
        fontWeight: 850,
        color: '#344861',
      }}
    >
      {label}
    </Typography>

    {typeof value === 'string' ? (
      <Typography
        sx={{
          fontSize: '0.62rem',
          fontWeight: 800,
          color: '#17233d',
        }}
      >
        {value}
      </Typography>
    ) : (
      value
    )}
  </Box>
);

const SocialRow = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) => (
  <Box
    sx={{
      py: 0.8,
      display: 'grid',
      gridTemplateColumns: '34px 100px minmax(0,1fr)',
      gap: 0.7,
      alignItems: 'center',
      borderBottom: '1px solid #e6ebf2',
    }}
  >
    <Box
      sx={{
        width: 29,
        height: 29,
        borderRadius: '7px',
        bgcolor: '#f3f6fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        fontSize: '0.62rem',
        fontWeight: 850,
        color: '#344861',
      }}
    >
      {label}
    </Typography>

    <Stack direction="row" spacing={0.3} alignItems="center" minWidth={0}>
      <Typography
        sx={{
          ...linkText,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {value}
      </Typography>

      <OpenInNewIcon
        sx={{
          flexShrink: 0,
          fontSize: 12,
          color: '#0758ce',
        }}
      />
    </Stack>
  </Box>
);

const CompanyStat = ({
  icon,
  value,
  label,
  suffix,
  border = false,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  suffix?: ReactNode;
  border?: boolean;
}) => (
  <Stack
    direction="row"
    spacing={0.8}
    alignItems="center"
    sx={{
      px: 1.2,
      borderLeft: {
        xs: 'none',
        md: border ? '1px solid #e2e8f0' : 'none',
      },
    }}
  >
    <Box
      sx={{
        width: 35,
        height: 35,
        flexShrink: 0,
        borderRadius: '50%',
        bgcolor: '#eef3ff',
        color: '#2159c6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        '& svg': {
          fontSize: 18,
        },
      }}
    >
      {icon}
    </Box>

    <Box>
      <Stack direction="row" spacing={0.25} alignItems="center">
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 950,
            color: '#17233d',
          }}
        >
          {value}
        </Typography>

        {suffix}
      </Stack>

      <Typography
        sx={{
          fontSize: '0.54rem',
          color: '#52627a',
        }}
      >
        {label}
      </Typography>
    </Box>
  </Stack>
);

const ProfileChip = ({
  label,
  icon,
}: {
  label: string;
  icon?: ReactNode;
}) => (
  <Chip
    size="small"
    icon={icon as React.ReactElement | undefined}
    label={label}
    sx={{
      height: 24,
      bgcolor: '#f3f6fb',
      color: '#40516b',
      border: '1px solid #e4eaf2',
      fontSize: '0.53rem',
      fontWeight: 800,

      '& .MuiChip-icon': {
        fontSize: 14,
        color: '#708099',
      },
    }}
  />
);

const SectionHeader = ({ title }: { title: string }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
  >
    <Typography
      sx={{
        fontSize: '0.82rem',
        fontWeight: 950,
        color: '#17233d',
      }}
    >
      {title}
    </Typography>

    <Button
      startIcon={<EditOutlinedIcon />}
      sx={editButton}
    >
      Edit
    </Button>
  </Stack>
);

const InfoCard = ({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.2,
      minHeight: 115,
      border: '1px solid #e1e7ef',
      borderRadius: '10px',
    }}
  >
    <Stack direction="row" spacing={0.7} alignItems="center">
      <Box
        sx={{
          color: '#5f37e6',
          display: 'flex',

          '& svg': {
            fontSize: 19,
          },
        }}
      >
        {icon}
      </Box>

      <Typography sx={cardTitle}>{title}</Typography>
    </Stack>

    <Box
      sx={{
        mt: 0.9,
        fontSize: '0.59rem',
        lineHeight: 1.5,
        color: '#344861',
      }}
    >
      {children}
    </Box>
  </Paper>
);

const PreferenceCard = ({
  title,
  value,
}: {
  title: string;
  value: string;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.1,
      border: '1px solid #e1e7ef',
      borderRadius: '9px',
    }}
  >
    <Typography
      sx={{
        fontSize: '0.56rem',
        color: '#718096',
      }}
    >
      {title}
    </Typography>

    <Typography
      sx={{
        mt: 0.3,
        fontSize: '0.64rem',
        fontWeight: 900,
        color: '#263750',
      }}
    >
      {value}
    </Typography>
  </Paper>
);

/* =========================
   STYLES
========================= */

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

const primaryButton = {
  minHeight: 38,
  px: 1.6,
  borderRadius: '8px',
  bgcolor: '#1261e8',
  textTransform: 'none',
  fontSize: '0.67rem',
  fontWeight: 900,
  boxShadow: 'none',

  '&:hover': {
    bgcolor: '#0758ce',
    boxShadow: 'none',
  },
};

const sideCard = {
  p: 1.5,
  border: '1px solid #dfe6ef',
  borderRadius: '13px',
};

const sideTitle = {
  fontSize: '0.86rem',
  fontWeight: 950,
  color: '#17233d',
};

const editButton = {
  minWidth: 0,
  p: 0.3,
  textTransform: 'none',
  fontSize: '0.6rem',
  fontWeight: 900,

  '& .MuiButton-startIcon': {
    mr: 0.3,
  },

  '& .MuiButton-startIcon svg': {
    fontSize: 15,
  },
};

const linkText = {
  fontSize: '0.6rem',
  fontWeight: 850,
  color: '#0758ce',
};

const sectionDescription = {
  mt: 0.4,
  fontSize: '0.61rem',
  color: '#64748b',
};

const cardTitle = {
  fontSize: '0.64rem',
  fontWeight: 900,
  color: '#263750',
};

const cardDescription = {
  mt: 0.15,
  fontSize: '0.56rem',
  color: '#64748b',
};

const smallButton = {
  borderRadius: '7px',
  textTransform: 'none',
  fontSize: '0.6rem',
  fontWeight: 900,
};

export default EmployerCompanyProfilePage;