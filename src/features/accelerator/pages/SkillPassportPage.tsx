import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';

import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';

import { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

interface SkillItem {
  id: string;
  label: string;
  score: number;
  icon: ReactNode;
  color: string;
  background: string;
}

interface BadgeItem {
  id: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  color: string;
  background: string;
}

interface ProjectItem {
  id: string;
  title: string;
  technologies: string;
}

interface AssessmentItem {
  id: string;
  title: string;
  score: number;
  color: string;
  background: string;
}

/*
 * C21 TEMPORARY UI CONTENT ONLY
 *
 * Replace these values during backend integration with:
 * - actual candidate identity/profile
 * - verified skills
 * - verified projects
 * - assessments
 * - achievements
 * - readiness score
 * - learning history
 *
 * PDF generation and public sharing are intentionally
 * not faked in this frontend-only version.
 */

const readinessScore = 82;

const skills: SkillItem[] = [
  {
    id: 'sql',
    label: 'SQL & Database',
    score: 90,
    icon: <StorageRoundedIcon />,
    color: '#15b629',
    background: '#eee7ff',
  },
  {
    id: 'backend',
    label: '.NET & Backend',
    score: 78,
    icon: <CodeRoundedIcon />,
    color: '#087ef2',
    background: '#e8f2ff',
  },
  {
    id: 'frontend',
    label: 'Frontend (React/Angular)',
    score: 72,
    icon: <CodeRoundedIcon />,
    color: '#8c22ec',
    background: '#f2e7ff',
  },
  {
    id: 'system-design',
    label: 'System Design',
    score: 68,
    icon: <PsychologyRoundedIcon />,
    color: '#ff8500',
    background: '#fff0df',
  },
  {
    id: 'product',
    label: 'Product & Business (PM)',
    score: 76,
    icon: <AssessmentRoundedIcon />,
    color: '#12aaa4',
    background: '#e7faf8',
  },
];

const badges: BadgeItem[] = [
  {
    id: 'interview',
    title: 'Mock Interview Pro',
    subtitle: 'Completed 3+ mock interviews',
    icon: <EmojiEventsRoundedIcon />,
    color: '#f4a000',
    background: '#fff3dc',
  },
  {
    id: 'sql',
    title: 'SQL Expert',
    subtitle: 'Scored 90%+ in SQL assessments',
    icon: <CodeRoundedIcon />,
    color: '#087bea',
    background: '#e8f3ff',
  },
  {
    id: 'project',
    title: 'Project Builder',
    subtitle: 'Completed 4 verified projects',
    icon: <RocketLaunchRoundedIcon />,
    color: '#8124eb',
    background: '#f3e9ff',
  },
  {
    id: 'learner',
    title: 'Consistent Learner',
    subtitle: '7+ days learning streak',
    icon: <MenuBookRoundedIcon />,
    color: '#15922b',
    background: '#e9faec',
  },
];

const projects: ProjectItem[] = [
  {
    id: 'sales-management',
    title: 'Sales Management System',
    technologies:
      'ASP.NET Core, C#, SQL Server',
  },
  {
    id: 'foreign-tour',
    title: 'Foreign Tour Request (SBI)',
    technologies:
      'ASP.NET Core, Web API, SQL Server',
  },
  {
    id: 'backend-services',
    title: 'Backend Services Project',
    technologies:
      'Microservices, .NET Core, SQL Server',
  },
];

const assessments: AssessmentItem[] = [
  {
    id: 'sql',
    title: 'SQL Test',
    score: 90,
    color: '#168e27',
    background: '#dff7e3',
  },
  {
    id: 'dotnet',
    title: '.NET Core Test',
    score: 78,
    color: '#1266db',
    background: '#e1eeff',
  },
  {
    id: 'system-design',
    title: 'System Design (Basics)',
    score: 70,
    color: '#f07700',
    background: '#fff0dd',
  },
  {
    id: 'product',
    title: 'Product Thinking (PM)',
    score: 76,
    color: '#7a20e8',
    background: '#f1e5ff',
  },
];

const growthSuggestions = [
  'Improve System Design with real case studies.',
  'Build one more end-to-end project with deployment.',
  'Take 2–3 more mock interviews for higher confidence.',
];

export const SkillPassportPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const targetRole =
    searchParams.get('targetRole') ??
    'SQL Developer';

  const navigateToScreen = (
    screen: string,
  ) => {
    const params =
      new URLSearchParams(searchParams);

    params.set('screen', screen);
    setSearchParams(params);
  };

  const handleBack = () => {
    navigateToScreen('career-readiness');
  };

  const handleDownload = () => {
    /*
     * TODO:
     * Connect to the real Skill Passport PDF
     * generation/download endpoint.
     *
     * We deliberately do not create a fake PDF here.
     */
  };

  const handleShare = () => {
    /*
     * TODO:
     * Backend should create/retrieve a secure
     * shareable Skill Passport URL.
     *
     * Do not expose private candidate data
     * through a client-generated public URL.
     */
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1500,
        mx: 'auto',
        px: {
          xs: 1.5,
          sm: 2,
          lg: 2.5,
        },
        py: {
          xs: 1.5,
          md: 2,
        },
      }}
    >
      {/* HERO */}

      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          px: {
            xs: 2.25,
            md: 3.5,
          },
          py: {
            xs: 2.2,
            md: 2.6,
          },
          color: '#fff',
          background:
            'linear-gradient(110deg, #075fc5 0%, #4137e7 52%, #8c00f5 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 270,
            height: 270,
            borderRadius: '50%',
            right: -70,
            top: -175,
            bgcolor:
              'rgba(255,255,255,0.08)',
          }}
        />

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          useFlexGap
          flexWrap="wrap"
          sx={{
            position: 'relative',
          }}
        >
          <AutoAwesomeRoundedIcon />

          <Typography
            component="h1"
            sx={{
              fontWeight: 900,
              fontSize: {
                xs: '1.5rem',
                md: '2rem',
              },
              letterSpacing: '-0.03em',
            }}
          >
            AI Career Accelerator
          </Typography>

          <Chip
            label="👑 Premium"
            size="small"
            sx={{
              bgcolor:
                'rgba(255,171,40,0.25)',
              color: '#ffe49b',
              border:
                '1px solid rgba(255,200,70,0.7)',
              fontWeight: 900,
            }}
          />
        </Stack>

        <Typography
          sx={{
            position: 'relative',
            mt: 0.45,
            color:
              'rgba(255,255,255,0.92)',
            fontSize: {
              xs: '0.82rem',
              md: '0.94rem',
            },
          }}
        >
          Your personalized, AI-powered
          journey from your current skills
          to your next dream role.
        </Typography>
      </Box>

      {/* HEADER */}

      <Box
        sx={{
          mt: 1.1,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0,1fr) auto',
          },
          gap: 1.2,
          alignItems: 'end',
        }}
      >
        <Box>
          <Button
            startIcon={
              <ArrowBackRoundedIcon />
            }
            onClick={handleBack}
            sx={{
              px: 0,
              minWidth: 0,
              color: '#17213b',
              textTransform: 'none',
              fontWeight: 850,
              '&:hover': {
                bgcolor: 'transparent',
                color: '#075fd6',
              },
            }}
          >
            Back to Career Readiness
          </Button>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mt: 0.15 }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: '#f1e4ff',
                color: '#7b1de8',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <WorkspacePremiumRoundedIcon
                sx={{
                  fontSize: 37,
                }}
              />
            </Box>

            <Box>
              <Typography
                component="h2"
                sx={{
                  color: '#0d1538',
                  fontSize: {
                    xs: '1.55rem',
                    md: '2rem',
                  },
                  fontWeight: 900,
                  lineHeight: 1.05,
                  letterSpacing:
                    '-0.035em',
                }}
              >
                Skill Passport
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  color: '#536078',
                  fontSize: '0.82rem',
                }}
              >
                Your skill profile, verified
                progress, and readiness for
                your target role.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          spacing={0.8}
        >
          <Button
            variant="outlined"
            startIcon={
              <DownloadRoundedIcon />
            }
            onClick={handleDownload}
            sx={{
              minHeight: 46,
              minWidth: 225,
              borderRadius: 2.3,
              borderColor: '#ccd5e5',
              color: '#17213b',
              textTransform: 'none',
              fontWeight: 900,
            }}
          >
            Download Passport (PDF)
          </Button>

          <Button
            variant="contained"
            startIcon={<ShareRoundedIcon />}
            onClick={handleShare}
            sx={{
              minHeight: 46,
              minWidth: 180,
              borderRadius: 2.3,
              textTransform: 'none',
              fontWeight: 900,
              boxShadow: 'none',
              background:
                'linear-gradient(90deg, #7b1ce8 0%, #561be1 100%)',
            }}
          >
            Share Profile
          </Button>
        </Stack>
      </Box>

      {/* TOP GRID */}

      <Box
        sx={{
          mt: 1.5,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl:
              'minmax(350px, .9fr) minmax(360px, .82fr) minmax(320px, .68fr)',
          },
          gap: 1.4,
        }}
      >
        {/* PASSPORT CARD */}

        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: 285,
            borderRadius: 3,
            p: 2,
            color: '#fff',
            background:
              'linear-gradient(135deg, #075ce1 0%, #6534e9 48%, #9224ef 100%)',
            boxShadow:
              '0 8px 24px rgba(77,44,207,0.18)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: 210,
              height: 210,
              borderRadius: '50%',
              right: -55,
              top: -70,
              bgcolor:
                'rgba(255,255,255,0.07)',
            }}
          />

          <Typography
            sx={{
              position: 'relative',
              fontSize: '1.25rem',
              lineHeight: 1.15,
              fontWeight: 900,
            }}
          >
            CareerHarbor
            <br />
            Skill Passport
          </Typography>

          <Box
            sx={{
              mt: 1.2,
              display: 'grid',
              gridTemplateColumns:
                '110px minmax(0,1fr)',
              gap: 1.2,
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                width: 92,
                height: 92,
                borderRadius: '50%',
                bgcolor:
                  'rgba(255,255,255,0.18)',
                border:
                  '3px solid rgba(255,255,255,0.85)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  bgcolor: '#1e315f',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '1.4rem',
                    fontWeight: 900,
                  }}
                >
                  MS
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: '1.08rem',
                  fontWeight: 900,
                }}
              >
                Manoj Shekapure
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  fontSize: '0.72rem',
                  opacity: 0.95,
                }}
              >
                Target Role: {targetRole}
              </Typography>

              <Chip
                label={`Readiness: ${readinessScore}%`}
                size="small"
                sx={{
                  mt: 0.7,
                  bgcolor: '#b9ff9e',
                  color: '#126d1c',
                  fontWeight: 900,
                }}
              />
            </Box>
          </Box>

          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{
              mt: 1.1,
              position: 'relative',
            }}
          >
            <VerifiedRoundedIcon
              sx={{
                color: '#ffe75c',
              }}
            />

            <Typography
              sx={{
                fontSize: '0.72rem',
              }}
            >
              Verified Learning Passport
            </Typography>
          </Stack>

          <Box
            sx={{
              mt: 0.8,
              pt: 0.8,
              borderTop:
                '1px solid rgba(255,255,255,.35)',
              display: 'grid',
              gridTemplateColumns:
                'repeat(4,1fr)',
              position: 'relative',
            }}
          >
            <PassportMetric
              value="12"
              label="Skills"
            />

            <PassportMetric
              value="4"
              label="Projects"
            />

            <PassportMetric
              value="6"
              label="Assessments"
            />

            <PassportMetric
              value="3"
              label="Mock Interviews"
            />
          </Box>
        </Box>

        {/* PROFICIENCY */}

        <Box sx={cardSx}>
          <SectionTitle
            icon={
              <VerifiedRoundedIcon />
            }
            title="Skill Proficiency"
          />

          <Stack
            spacing={1.15}
            sx={{ mt: 1.2 }}
          >
            {skills.map((skill) => (
              <SkillRow
                key={skill.id}
                skill={skill}
              />
            ))}
          </Stack>
        </Box>

        {/* BADGES */}

        <Box sx={cardSx}>
          <SectionTitle
            icon={
              <WorkspacePremiumRoundedIcon />
            }
            title="Badges & Achievements"
          />

          <Stack
            spacing={0.65}
            sx={{ mt: 1 }}
          >
            {badges.map((badge) => (
              <BadgeRow
                key={badge.id}
                badge={badge}
              />
            ))}
          </Stack>
        </Box>
      </Box>

      {/* PROJECTS + ASSESSMENTS */}

      <Box
        sx={{
          mt: 1.4,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '1fr 1fr',
          },
          gap: 1.4,
        }}
      >
        {/* PROJECTS */}

        <Box sx={cardSx}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            <SectionTitle
              icon={
                <WorkRoundedIcon />
              }
              title="Verified Projects"
            />

            <Button
              onClick={() =>
                navigateToScreen('project')
              }
              sx={{
                minWidth: 0,
                color: '#711be8',
                textTransform: 'none',
                fontWeight: 900,
              }}
            >
              View All
            </Button>
          </Stack>

          <Stack
            spacing={0.55}
            sx={{ mt: 0.8 }}
          >
            {projects.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
              />
            ))}
          </Stack>
        </Box>

        {/* ASSESSMENTS */}

        <Box sx={cardSx}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            <SectionTitle
              icon={
                <AssessmentRoundedIcon />
              }
              title="Assessments & Scores"
            />

            <Button
              onClick={() =>
                navigateToScreen(
                  'assessment-results',
                )
              }
              sx={{
                minWidth: 0,
                color: '#711be8',
                textTransform: 'none',
                fontWeight: 900,
              }}
            >
              View All
            </Button>
          </Stack>

          <Stack
            spacing={0.55}
            sx={{ mt: 0.8 }}
          >
            {assessments.map(
              (assessment) => (
                <AssessmentRow
                  key={assessment.id}
                  assessment={
                    assessment
                  }
                />
              ),
            )}
          </Stack>
        </Box>
      </Box>

      {/* GROWTH */}

      <Box
        sx={{
          ...cardSx,
          mt: 1.4,
          mb: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg:
              'minmax(0,1.25fr) minmax(320px,.75fr)',
          },
          gap: 1.4,
        }}
      >
        <Box>
          <SectionTitle
            icon={
              <TrackChangesRoundedIcon />
            }
            title="Next Growth Suggestions"
          />

          <Stack
            spacing={0.65}
            sx={{ mt: 1 }}
          >
            {growthSuggestions.map(
              (suggestion) => (
                <Stack
                  key={suggestion}
                  direction="row"
                  spacing={0.7}
                  alignItems="center"
                >
                  <CheckCircleRoundedIcon
                    sx={{
                      color: '#12a925',
                      fontSize: 20,
                    }}
                  />

                  <Typography
                    sx={{
                      color: '#17213b',
                      fontSize:
                        '0.75rem',
                    }}
                  >
                    {suggestion}
                  </Typography>
                </Stack>
              ),
            )}
          </Stack>
        </Box>

        <Box
          sx={{
            p: 1.5,
            borderRadius: 2.5,
            background:
              'linear-gradient(105deg, #f4edff 0%, #eee2ff 100%)',
            display: 'grid',
            gridTemplateColumns:
              '52px minmax(0,1fr)',
            gap: 1,
            alignItems: 'start',
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: '#fff',
              color: '#781be8',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <AssessmentRoundedIcon />
          </Box>

          <Box>
            <Stack
              direction="row"
              spacing={0.8}
              alignItems="center"
              useFlexGap
              flexWrap="wrap"
            >
              <Typography
                sx={{
                  color: '#111a38',
                  fontSize: '1rem',
                  fontWeight: 900,
                }}
              >
                Overall Status
              </Typography>

              <Chip
                label="On Track"
                size="small"
                sx={{
                  bgcolor: '#dff8e2',
                  color: '#147426',
                  border:
                    '1px solid #83df90',
                  fontWeight: 900,
                }}
              />
            </Stack>

            <Typography
              sx={{
                mt: 0.65,
                color: '#17213b',
                fontSize: '0.76rem',
                lineHeight: 1.45,
              }}
            >
              You&apos;re at{' '}
              {readinessScore}% readiness.
              Complete the suggested actions
              to reach 90%+.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

/* =========================================
   SECTION TITLE
========================================= */

const SectionTitle = ({
  icon,
  title,
}: {
  icon: ReactNode;
  title: string;
}) => (
  <Stack
    direction="row"
    spacing={0.65}
    alignItems="center"
  >
    <Box
      sx={{
        color: '#741ce8',
        display: 'grid',
        placeItems: 'center',
        '& svg': {
          fontSize: 23,
        },
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        color: '#111a38',
        fontSize: '0.95rem',
        fontWeight: 900,
      }}
    >
      {title}
    </Typography>
  </Stack>
);

/* =========================================
   PASSPORT METRIC
========================================= */

const PassportMetric = ({
  value,
  label,
}: {
  value: string;
  label: string;
}) => (
  <Box
    sx={{
      textAlign: 'center',
      '&:not(:last-child)': {
        borderRight:
          '1px solid rgba(255,255,255,.3)',
      },
    }}
  >
    <Typography
      sx={{
        fontSize: '1.15rem',
        fontWeight: 900,
        lineHeight: 1,
      }}
    >
      {value}
    </Typography>

    <Typography
      sx={{
        mt: 0.2,
        fontSize: '0.6rem',
        fontWeight: 750,
      }}
    >
      {label}
    </Typography>
  </Box>
);

/* =========================================
   SKILL ROW
========================================= */

const SkillRow = ({
  skill,
}: {
  skill: SkillItem;
}) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns:
        '35px minmax(120px,.9fr) minmax(90px,1fr) 42px',
      gap: 0.7,
      alignItems: 'center',
    }}
  >
    <Box
      sx={{
        width: 31,
        height: 31,
        borderRadius: 1.5,
        bgcolor: skill.background,
        color: skill.color,
        display: 'grid',
        placeItems: 'center',
        '& svg': {
          fontSize: 18,
        },
      }}
    >
      {skill.icon}
    </Box>

    <Typography
      sx={{
        color: '#17213b',
        fontSize: '0.68rem',
        fontWeight: 750,
      }}
    >
      {skill.label}
    </Typography>

    <LinearProgress
      variant="determinate"
      value={skill.score}
      sx={{
        height: 11,
        borderRadius: 10,
        bgcolor: '#dce2ed',
        '& .MuiLinearProgress-bar': {
          borderRadius: 10,
          bgcolor: skill.color,
        },
      }}
    />

    <Typography
      sx={{
        color: '#111a38',
        fontSize: '0.72rem',
        fontWeight: 900,
        textAlign: 'right',
      }}
    >
      {skill.score}%
    </Typography>
  </Box>
);

/* =========================================
   BADGE ROW
========================================= */

const BadgeRow = ({
  badge,
}: {
  badge: BadgeItem;
}) => (
  <Box
    sx={{
      p: 0.7,
      borderRadius: 2,
      bgcolor: '#f7f8fb',
      display: 'grid',
      gridTemplateColumns:
        '40px minmax(0,1fr) 25px',
      gap: 0.7,
      alignItems: 'center',
    }}
  >
    <Box
      sx={{
        width: 37,
        height: 37,
        borderRadius: 1.7,
        bgcolor: badge.background,
        color: badge.color,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {badge.icon}
    </Box>

    <Box>
      <Typography
        sx={{
          color: '#111a38',
          fontSize: '0.72rem',
          fontWeight: 900,
        }}
      >
        {badge.title}
      </Typography>

      <Typography
        sx={{
          color: '#536078',
          fontSize: '0.61rem',
        }}
      >
        {badge.subtitle}
      </Typography>
    </Box>

    <CheckCircleRoundedIcon
      sx={{
        color: '#0cab25',
        fontSize: 21,
      }}
    />
  </Box>
);

/* =========================================
   PROJECT ROW
========================================= */

const ProjectRow = ({
  project,
}: {
  project: ProjectItem;
}) => (
  <Box
    sx={{
      px: 0.8,
      py: 0.6,
      border:
        '1px solid #e0e5ee',
      borderRadius: 1.8,
      display: 'grid',
      gridTemplateColumns:
        '48px minmax(0,1fr) auto',
      gap: 0.8,
      alignItems: 'center',
    }}
  >
    <Box
      sx={{
        width: 44,
        height: 34,
        borderRadius: 1.2,
        bgcolor: '#eaf1ff',
        color: '#1265dd',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <LaptopMacRoundedIcon />
    </Box>

    <Box>
      <Typography
        sx={{
          color: '#111a38',
          fontSize: '0.72rem',
          fontWeight: 900,
        }}
      >
        {project.title}
      </Typography>

      <Typography
        sx={{
          color: '#536078',
          fontSize: '0.62rem',
        }}
      >
        {project.technologies}
      </Typography>
    </Box>

    <Chip
      icon={<CheckCircleRoundedIcon />}
      label="Verified"
      size="small"
      sx={{
        bgcolor: '#e4f9e8',
        color: '#167928',
        fontWeight: 850,
        '& .MuiChip-icon': {
          color: '#17912b',
        },
      }}
    />
  </Box>
);

/* =========================================
   ASSESSMENT ROW
========================================= */

const AssessmentRow = ({
  assessment,
}: {
  assessment: AssessmentItem;
}) => (
  <Box
    sx={{
      px: 0.8,
      py: 0.65,
      border:
        '1px solid #e0e5ee',
      borderRadius: 1.8,
      display: 'grid',
      gridTemplateColumns:
        '32px minmax(0,1fr) auto',
      gap: 0.7,
      alignItems: 'center',
    }}
  >
    <Box
      sx={{
        color: '#741ce8',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <AssessmentRoundedIcon
        sx={{
          fontSize: 20,
        }}
      />
    </Box>

    <Typography
      sx={{
        color: '#111a38',
        fontSize: '0.7rem',
        fontWeight: 850,
      }}
    >
      {assessment.title}
    </Typography>

    <Chip
      label={`${assessment.score}%`}
      size="small"
      sx={{
        minWidth: 55,
        bgcolor:
          assessment.background,
        color: assessment.color,
        fontWeight: 900,
      }}
    />
  </Box>
);

const cardSx = {
  border: '1px solid #dce3ee',
  borderRadius: 3,
  bgcolor: '#fff',
  p: {
    xs: 1.4,
    md: 1.6,
  },
  boxShadow:
    '0 4px 14px rgba(24,35,64,0.04)',
};