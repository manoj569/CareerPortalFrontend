import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';

import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined';

type ProfileTab =
  | 'overview'
  | 'resume'
  | 'assessments'
  | 'interviews'
  | 'notes'
  | 'activity';

type HiringStage =
  | 'Applied'
  | 'Screening'
  | 'Interview'
  | 'Offer'
  | 'Hired';

const skills = [
  'React',
  'TypeScript',
  'Redux',
  'Next.js',
  'JavaScript',
  'Material UI',
  'HTML',
  'CSS',
];

const stages: HiringStage[] = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Hired',
];

export const EmployerCandidateProfilePage = () => {
  const navigate = useNavigate();

  const [tab, setTab] =
    useState<ProfileTab>('overview');

  const [stage, setStage] =
    useState<HiringStage>('Screening');

  const [shortlisted, setShortlisted] =
    useState(true);

  const copyValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard may be unavailable in some browsers.
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 1.5, md: 2 },
        py: 1.5,
        maxWidth: 1650,
        mx: 'auto',
      }}
    >
      {/* BREADCRUMB */}
      <Stack
        direction="row"
        spacing={0.7}
        alignItems="center"
        sx={{ mb: 1.3 }}
      >
        <Typography sx={breadcrumbStyle}>
          Candidates
        </Typography>

        <Typography sx={breadcrumbStyle}>
          /
        </Typography>

        <Typography sx={breadcrumbStyle}>
          Candidates
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
          Rohan Sharma
        </Typography>
      </Stack>

      {/* HEADER */}
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
            width: 240,
            height: 240,
            borderRadius: '50%',
            right: 90,
            top: -170,
            border:
              '34px solid rgba(91,75,255,0.05)',
          }}
        />

        <Box
          sx={{
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
            position: 'relative',
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                background:
                  'linear-gradient(135deg, #2675f5 0%, #7b43ed 100%)',
              }}
            >
              <AutoAwesomeOutlinedIcon
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
                Candidate Profile
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  fontSize: '0.73rem',
                  color: '#425477',
                }}
              >
                Complete profile, application details,
                assessments and hiring actions.
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
              startIcon={<ArrowBackIcon />}
              onClick={() =>
                navigate('/employer/candidates')
              }
              sx={headerSecondaryButton}
            >
              Back to Candidates
            </Button>

            <Button
              variant="outlined"
              startIcon={<ShareOutlinedIcon />}
              sx={headerSecondaryButton}
            >
              Share Profile
            </Button>

            <Button
              variant="outlined"
              startIcon={<ArchiveOutlinedIcon />}
              sx={headerSecondaryButton}
            >
              Archive
            </Button>

            <Button
              variant="contained"
              endIcon={
                <EventAvailableOutlinedIcon />
              }
              onClick={() =>
                setStage('Interview')
              }
              sx={headerPrimaryButton}
            >
              Move to Interview
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* CONTENT */}
      <Box
        sx={{
          mt: 1.4,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '310px minmax(0, 1fr)',
          },
          gap: 1.4,
          alignItems: 'start',
        }}
      >
        {/* LEFT PROFILE */}
        <Stack spacing={1.1}>
          <Paper
            elevation={0}
            sx={cardStyle}
          >
            <Stack
              alignItems="center"
              sx={{ pt: 0.4 }}
            >
              <Avatar
                sx={{
                  width: 62,
                  height: 62,
                  backgroundColor: '#e6ddff',
                  color: '#5932ce',
                  fontWeight: 950,
                  fontSize: '1.1rem',
                }}
              >
                RS
              </Avatar>

              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{ mt: 1 }}
              >
                <Typography
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 950,
                    color: '#101d38',
                  }}
                >
                  Rohan Sharma
                </Typography>

                <CheckCircleIcon
                  sx={{
                    fontSize: 17,
                    color: '#0874eb',
                  }}
                />
              </Stack>

              <Typography
                sx={{
                  mt: 0.2,
                  fontSize: '0.7rem',
                  color: '#40516b',
                }}
              >
                Senior Frontend Developer
              </Typography>

              <Chip
                label="96% Match"
                size="small"
                sx={{
                  mt: 0.8,
                  height: 26,
                  backgroundColor: '#dcf6df',
                  color: '#16803c',
                  fontSize: '0.68rem',
                  fontWeight: 950,
                }}
              />
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            <ProfileInfo
              icon={<EmailOutlinedIcon />}
              value="rohan.sharma@email.com"
              action={
                <IconButton
                  onClick={() =>
                    copyValue(
                      'rohan.sharma@email.com',
                    )
                  }
                  sx={copyButtonStyle}
                >
                  <ContentCopyOutlinedIcon />
                </IconButton>
              }
            />

            <ProfileInfo
              icon={<PhoneOutlinedIcon />}
              value="+91 98765 43210"
              action={
                <IconButton
                  onClick={() =>
                    copyValue('+91 98765 43210')
                  }
                  sx={copyButtonStyle}
                >
                  <ContentCopyOutlinedIcon />
                </IconButton>
              }
            />

            <ProfileInfo
              icon={<LocationOnOutlinedIcon />}
              value="Pune, India"
            />

            <ProfileInfo
              icon={<BusinessCenterOutlinedIcon />}
              value="5.5 years"
            />

            <ProfileInfo
              icon={<WorkHistoryOutlinedIcon />}
              value="Applied on Nov 18, 2026"
            />

            <ProfileInfo
              icon={<TimelineOutlinedIcon />}
              value="Source: CareerHarbor"
            />

            <Stack
              direction="row"
              spacing={0.7}
              sx={{ mt: 1.4 }}
            >
              <Button
                fullWidth
                variant={
                  shortlisted
                    ? 'contained'
                    : 'outlined'
                }
                startIcon={
                  <StarOutlinedIcon />
                }
                onClick={() =>
                  setShortlisted(
                    (current) => !current,
                  )
                }
                sx={{
                  ...smallActionButton,
                  ...(shortlisted && {
                    backgroundColor: '#e8f1ff',
                    color: '#0758ce',
                    boxShadow: 'none',

                    '&:hover': {
                      backgroundColor: '#dceaff',
                      boxShadow: 'none',
                    },
                  }),
                }}
              >
                {shortlisted
                  ? 'Shortlisted'
                  : 'Shortlist'}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={
                  <AddCommentOutlinedIcon />
                }
                onClick={() => setTab('notes')}
                sx={smallActionButton}
              >
                Add Note
              </Button>
            </Stack>
          </Paper>

          {/* CURRENT STAGE */}
          <Paper
            elevation={0}
            sx={{
              ...cardStyle,
              p: 1.4,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography
                sx={{
                  fontSize: '0.76rem',
                  fontWeight: 900,
                  color: '#17233d',
                }}
              >
                Current Stage
              </Typography>

              <Select
                size="small"
                value={stage}
                onChange={(event) =>
                  setStage(
                    event.target
                      .value as HiringStage,
                  )
                }
                sx={{
                  height: 32,
                  minWidth: 120,
                  borderRadius: '8px',
                  fontSize: '0.66rem',
                  fontWeight: 900,
                  color: '#5c28c8',
                  backgroundColor: '#f1e8ff',

                  '& fieldset': {
                    border: 'none',
                  },
                }}
              >
                {stages.map((item) => (
                  <MenuItem
                    key={item}
                    value={item}
                  >
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          </Paper>

          {/* APPLIED FOR */}
          <Paper
            elevation={0}
            sx={cardStyle}
          >
            <Typography
              sx={{
                fontSize: '0.76rem',
                fontWeight: 900,
                color: '#17233d',
              }}
            >
              Applied For
            </Typography>

            <Box
              sx={{
                mt: 1,
                p: 1.1,
                border:
                  '1px solid #dce5f0',
                borderRadius: '9px',
                backgroundColor: '#fbfdff',
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 900,
                      color: '#0758ce',
                    }}
                  >
                    Senior React Developer
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.2,
                      fontSize: '0.62rem',
                      color: '#52627a',
                    }}
                  >
                    Job #SRD-1024
                  </Typography>
                </Box>

                <OpenInNewOutlinedIcon
                  sx={{
                    fontSize: 16,
                    color: '#0874eb',
                  }}
                />
              </Stack>
            </Box>
          </Paper>
        </Stack>

        {/* RIGHT */}
        <Box minWidth={0}>
          {/* TABS */}
          <Paper
            elevation={0}
            sx={{
              border:
                '1px solid #e0e7ef',
              borderRadius: '13px',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                overflowX: 'auto',
                borderBottom:
                  '1px solid #e4eaf2',
              }}
            >
              <ProfileTabButton
                active={tab === 'overview'}
                label="Overview"
                icon={
                  <PersonOutlineOutlinedIcon />
                }
                onClick={() =>
                  setTab('overview')
                }
              />

              <ProfileTabButton
                active={tab === 'resume'}
                label="Resume"
                icon={
                  <DescriptionOutlinedIcon />
                }
                onClick={() =>
                  setTab('resume')
                }
              />

              <ProfileTabButton
                active={
                  tab === 'assessments'
                }
                label="Assessments"
                icon={
                  <TaskAltOutlinedIcon />
                }
                onClick={() =>
                  setTab('assessments')
                }
              />

              <ProfileTabButton
                active={
                  tab === 'interviews'
                }
                label="Interviews"
                icon={
                  <EventAvailableOutlinedIcon />
                }
                onClick={() =>
                  setTab('interviews')
                }
              />

              <ProfileTabButton
                active={tab === 'notes'}
                label="Notes (2)"
                icon={
                  <NoteAltOutlinedIcon />
                }
                onClick={() =>
                  setTab('notes')
                }
              />

              <ProfileTabButton
                active={
                  tab === 'activity'
                }
                label="Activity"
                icon={<HistoryOutlinedIcon />}
                onClick={() =>
                  setTab('activity')
                }
              />
            </Box>

            {tab === 'overview' ? (
              <OverviewContent stage={stage} />
            ) : (
              <SecondaryTab
                tab={tab}
              />
            )}
          </Paper>
        </Box>
      </Box>

      <Typography
        sx={{
          mt: 0.8,
          fontSize: '0.61rem',
          color: '#7b8799',
        }}
      >
        Candidate profile information and AI insights
        on this screen are demo frontend data. Hiring
        actions are UI-only until the Employer
        Candidate API is connected.
      </Typography>
    </Box>
  );
};

const OverviewContent = ({
  stage,
}: {
  stage: HiringStage;
}) => (
  <Box
    sx={{
      p: 1.3,
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        xl: 'minmax(0, 1fr) 280px',
      },
      gap: 1.2,
      alignItems: 'start',
    }}
  >
    <Stack spacing={1.1}>
      {/* SUMMARY */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 0.8,
        }}
      >
        <MetricCard
          icon={<StarOutlinedIcon />}
          value="96% Match"
          label="AI fit score"
          background="#e5f8e9"
          color="#159340"
        />

        <MetricCard
          icon={
            <BusinessCenterOutlinedIcon />
          }
          value="5.5 years"
          label="Experience"
          background="#e7f0ff"
          color="#1261d7"
        />

        <MetricCard
          icon={
            <AutoAwesomeOutlinedIcon />
          }
          value="React, TypeScript, Redux"
          label="Top Skills"
          background="#efe6ff"
          color="#7037d2"
          compact
        />

        <MetricCard
          icon={<SchoolOutlinedIcon />}
          value="B.E. Computer Engineering"
          label="Education"
          background="#fff0dd"
          color="#d86b00"
          compact
        />
      </Box>

      {/* ABOUT */}
      <ContentCard title="About Candidate">
        <Typography sx={bodyTextStyle}>
          Frontend developer with 5.5 years of
          experience building scalable and responsive
          web applications using React, TypeScript and
          modern frontend tools. Passionate about clean
          code and strong user experiences.
        </Typography>

        <Divider sx={{ my: 1.2 }} />

        <Typography sx={sectionLabelStyle}>
          Skills
        </Typography>

        <Stack
          direction="row"
          gap={0.6}
          flexWrap="wrap"
          useFlexGap
          sx={{ mt: 0.7 }}
        >
          {skills.map((skill) => (
            <Chip
              key={skill}
              label={skill}
              size="small"
              sx={{
                height: 25,
                px: 0.3,
                backgroundColor: '#e6efff',
                color: '#174ea6',
                fontSize: '0.62rem',
                fontWeight: 850,
              }}
            />
          ))}
        </Stack>
      </ContentCard>

      {/* EXPERIENCE */}
      <ContentCard title="Experience">
        <ExperienceItem
          title="Senior Frontend Developer"
          company="Infosys"
          period="Jan 2023 – Present (3.9 years)"
          bullets={[
            'Developed and maintained React-based web applications for enterprise clients.',
            'Improved performance and reduced load time by 40%.',
          ]}
        />

        <Divider sx={{ my: 1.2 }} />

        <ExperienceItem
          title="Frontend Developer"
          company="Wipro"
          period="Jul 2020 – Dec 2022 (2.5 years)"
          bullets={[
            'Built reusable UI components and integrated REST APIs.',
            'Collaborated with product and design teams to deliver new features.',
          ]}
        />
      </ContentCard>

      {/* EDUCATION */}
      <ContentCard title="Education">
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#e8f1ff',
              color: '#1261d7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SchoolOutlinedIcon
              sx={{ fontSize: 18 }}
            />
          </Box>

          <Box flex={1}>
            <Typography
              sx={{
                fontSize: '0.7rem',
                fontWeight: 900,
                color: '#15223d',
              }}
            >
              B.E. Computer Engineering — Savitribai
              Phule Pune University
            </Typography>
          </Box>

          <Typography
            sx={{
              fontSize: '0.62rem',
              color: '#52627a',
            }}
          >
            2016 – 2020
          </Typography>
        </Stack>
      </ContentCard>
    </Stack>

    {/* RIGHT SIDEBAR */}
    <Stack spacing={1.1}>
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          border:
            '1px solid #ded8ff',
          borderRadius: '12px',
          background:
            'linear-gradient(135deg, #f5f0ff 0%, #f9f7ff 100%)',
        }}
      >
        <Stack
          direction="row"
          spacing={0.8}
          alignItems="center"
        >
          <AutoAwesomeOutlinedIcon
            sx={{
              color: '#6938d3',
              fontSize: 21,
            }}
          />

          <Typography
            sx={{
              fontSize: '0.9rem',
              fontWeight: 950,
              color: '#171d3b',
            }}
          >
            AI Insights
          </Typography>
        </Stack>

        <Stack
          spacing={1}
          sx={{ mt: 1.4 }}
        >
          <InsightItem text="Strong match for the role (96%)" />
          <InsightItem text="Relevant experience (5.5 years)" />
          <InsightItem text="All key skills are present" />
          <InsightItem text="Education aligns with requirement" />
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
        <Typography
          sx={{
            fontSize: '0.86rem',
            fontWeight: 950,
            color: '#17233d',
            mb: 1.4,
          }}
        >
          Hiring Progress
        </Typography>

        {stages.map(
          (item, index) => (
            <ProgressStage
              key={item}
              stage={item}
              index={index}
              currentStage={stage}
              last={
                index === stages.length - 1
              }
            />
          ),
        )}
      </Paper>
    </Stack>
  </Box>
);

const SecondaryTab = ({
  tab,
}: {
  tab: Exclude<ProfileTab, 'overview'>;
}) => {
  const config = {
    resume: {
      title: 'Resume',
      description:
        'Candidate resume and extracted profile information will appear here.',
      icon: <DescriptionOutlinedIcon />,
    },
    assessments: {
      title: 'Assessments',
      description:
        'Skills assessments, scores and evidence will appear here.',
      icon: <TaskAltOutlinedIcon />,
    },
    interviews: {
      title: 'Interviews',
      description:
        'Scheduled and completed interview rounds will appear here.',
      icon: <EventAvailableOutlinedIcon />,
    },
    notes: {
      title: 'Candidate Notes',
      description:
        'Recruiter and hiring-team notes will appear here.',
      icon: <NoteAltOutlinedIcon />,
    },
    activity: {
      title: 'Candidate Activity',
      description:
        'Application and hiring activity history will appear here.',
      icon: <HistoryOutlinedIcon />,
    },
  }[tab];

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
          width: 56,
          height: 56,
          mx: 'auto',
          borderRadius: '50%',
          backgroundColor: '#edf3fb',
          color: '#526781',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          '& svg': {
            fontSize: 25,
          },
        }}
      >
        {config.icon}
      </Box>

      <Typography
        sx={{
          mt: 1,
          fontSize: '0.9rem',
          fontWeight: 950,
          color: '#263750',
        }}
      >
        {config.title}
      </Typography>

      <Typography
        sx={{
          mt: 0.4,
          fontSize: '0.7rem',
          color: '#758298',
        }}
      >
        {config.description}
      </Typography>
    </Box>
  );
};

const ContentCard = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.5,
      border: '1px solid #e0e7ef',
      borderRadius: '11px',
    }}
  >
    <Typography
      sx={{
        fontSize: '0.77rem',
        fontWeight: 950,
        color: '#17233d',
        mb: 0.8,
      }}
    >
      {title}
    </Typography>

    {children}
  </Paper>
);

const MetricCard = ({
  icon,
  value,
  label,
  background,
  color,
  compact = false,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  background: string;
  color: string;
  compact?: boolean;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 1,
      border: '1px solid #e0e7ef',
      borderRadius: '10px',
    }}
  >
    <Stack
      direction="row"
      spacing={0.8}
      alignItems="center"
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          flexShrink: 0,
          borderRadius: '9px',
          backgroundColor: background,
          color,
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

      <Box minWidth={0}>
        <Typography
          sx={{
            fontSize: compact
              ? '0.61rem'
              : '0.8rem',
            lineHeight: 1.2,
            fontWeight: 950,
            color: '#17233d',
          }}
        >
          {value}
        </Typography>

        <Typography
          sx={{
            mt: 0.15,
            fontSize: '0.58rem',
            color: '#65738a',
          }}
        >
          {label}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

const ExperienceItem = ({
  title,
  company,
  period,
  bullets,
}: {
  title: string;
  company: string;
  period: string;
  bullets: string[];
}) => (
  <Stack
    direction="row"
    spacing={1}
    alignItems="flex-start"
  >
    <Box
      sx={{
        width: 35,
        height: 35,
        flexShrink: 0,
        borderRadius: '50%',
        backgroundColor: '#e7f0ff',
        color: '#1261d7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <BusinessCenterOutlinedIcon
        sx={{ fontSize: 17 }}
      />
    </Box>

    <Box flex={1}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: {
            xs: 'column',
            md: 'row',
          },
          gap: 0.5,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 900,
            color: '#15223d',
          }}
        >
          {title} — {company}
        </Typography>

        <Typography
          sx={{
            fontSize: '0.61rem',
            color: '#52627a',
          }}
        >
          {period}
        </Typography>
      </Box>

      <Box
        component="ul"
        sx={{
          mt: 0.5,
          mb: 0,
          pl: 2.1,
          color: '#40516b',
        }}
      >
        {bullets.map((bullet) => (
          <Typography
            key={bullet}
            component="li"
            sx={{
              mb: 0.25,
              fontSize: '0.64rem',
              lineHeight: 1.5,
            }}
          >
            {bullet}
          </Typography>
        ))}
      </Box>
    </Box>
  </Stack>
);

const InsightItem = ({
  text,
}: {
  text: string;
}) => (
  <Stack
    direction="row"
    spacing={0.7}
    alignItems="center"
  >
    <CheckCircleIcon
      sx={{
        fontSize: 16,
        color: '#35bd62',
      }}
    />

    <Typography
      sx={{
        fontSize: '0.65rem',
        color: '#34445e',
      }}
    >
      {text}
    </Typography>
  </Stack>
);

const ProgressStage = ({
  stage,
  index,
  currentStage,
  last,
}: {
  stage: HiringStage;
  index: number;
  currentStage: HiringStage;
  last: boolean;
}) => {
  const currentIndex =
    stages.indexOf(currentStage);

  const completed = index < currentIndex;
  const current = index === currentIndex;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns:
          '32px minmax(0, 1fr)',
        gap: 0.8,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {!last && (
          <Box
            sx={{
              position: 'absolute',
              top: 26,
              bottom: -5,
              width: '2px',
              backgroundColor:
                completed
                  ? '#5ccf7c'
                  : '#dbe3ed',
            }}
          />
        )}

        <Box
          sx={{
            width: 25,
            height: 25,
            borderRadius: '50%',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border:
              completed || current
                ? 'none'
                : '2px solid #aebaca',
            backgroundColor: completed
              ? '#19b84b'
              : current
                ? '#1261e8'
                : '#fff',
            color: '#fff',
          }}
        >
          {completed && (
            <CheckCircleIcon
              sx={{ fontSize: 16 }}
            />
          )}
        </Box>
      </Box>

      <Box
        sx={{
          pb: last ? 0 : 1.5,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.68rem',
            fontWeight: 900,
            color: current
              ? '#0758ce'
              : '#17233d',
          }}
        >
          {stage}
        </Typography>

        <Typography
          sx={{
            mt: 0.1,
            fontSize: '0.59rem',
            color: current
              ? '#1261d7'
              : '#68778c',
          }}
        >
          {stage === 'Applied'
            ? 'Nov 18, 2026'
            : current
              ? 'In Progress'
              : completed
                ? 'Completed'
                : 'Not Started'}
        </Typography>
      </Box>
    </Box>
  );
};

const ProfileInfo = ({
  icon,
  value,
  action,
}: {
  icon: ReactNode;
  value: string;
  action?: ReactNode;
}) => (
  <Stack
    direction="row"
    spacing={0.8}
    alignItems="center"
    sx={{ mb: 1 }}
  >
    <Box
      sx={{
        width: 23,
        display: 'flex',
        color: '#40516b',

        '& svg': {
          fontSize: 17,
        },
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        flex: 1,
        minWidth: 0,
        fontSize: '0.66rem',
        color: '#33445d',
        overflowWrap: 'anywhere',
      }}
    >
      {value}
    </Typography>

    {action}
  </Stack>
);

const ProfileTabButton = ({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) => (
  <Button
    onClick={onClick}
    startIcon={icon}
    sx={{
      minHeight: 45,
      flexShrink: 0,
      px: 1.5,
      borderRadius: 0,
      borderBottom: active
        ? '2px solid #1261e8'
        : '2px solid transparent',
      backgroundColor: active
        ? '#f1f6ff'
        : '#fff',
      color: active
        ? '#0758ce'
        : '#35445d',
      textTransform: 'none',
      fontSize: '0.67rem',
      fontWeight: active ? 900 : 750,

      '& .MuiButton-startIcon': {
        mr: 0.55,

        '& svg': {
          fontSize: 17,
        },
      },
    }}
  >
    {label}
  </Button>
);

const breadcrumbStyle = {
  fontSize: '0.65rem',
  color: '#64748b',
};

const cardStyle = {
  p: 1.5,
  border: '1px solid #e0e7ef',
  borderRadius: '12px',
};

const copyButtonStyle = {
  width: 27,
  height: 27,
  color: '#40516b',

  '& svg': {
    fontSize: 15,
  },
};

const headerSecondaryButton = {
  minHeight: 38,
  px: 1.4,
  borderRadius: '8px',
  borderColor: '#ccd8e7',
  color: '#17233d',
  backgroundColor: '#fff',
  textTransform: 'none',
  fontSize: '0.67rem',
  fontWeight: 900,

  '& .MuiButton-startIcon svg, & .MuiButton-endIcon svg':
    {
      fontSize: 17,
    },
};

const headerPrimaryButton = {
  minHeight: 38,
  px: 1.5,
  borderRadius: '8px',
  backgroundColor: '#0867e8',
  textTransform: 'none',
  fontSize: '0.67rem',
  fontWeight: 900,
  boxShadow: 'none',

  '&:hover': {
    backgroundColor: '#075acb',
    boxShadow: 'none',
  },
};

const smallActionButton = {
  minHeight: 35,
  borderRadius: '8px',
  borderColor: '#d4deea',
  textTransform: 'none',
  fontSize: '0.64rem',
  fontWeight: 900,

  '& .MuiButton-startIcon': {
    mr: 0.5,

    '& svg': {
      fontSize: 15,
    },
  },
};

const bodyTextStyle = {
  fontSize: '0.66rem',
  lineHeight: 1.55,
  color: '#40516b',
};

const sectionLabelStyle = {
  fontSize: '0.7rem',
  fontWeight: 900,
  color: '#17233d',
};

export default EmployerCandidateProfilePage;