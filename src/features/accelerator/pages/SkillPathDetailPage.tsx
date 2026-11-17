import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

type MetricCardProps = {
  icon: ReactNode;
  value: string;
  label: string;
};

type SectionCardProps = {
  children: ReactNode;
};

const MetricCard = ({
  icon,
  value,
  label,
}: MetricCardProps) => (
  <Box
    sx={{
      bgcolor: '#fff',
      border: '1px solid #e3e8f0',
      borderRadius: 3,
      p: 2,
      minHeight: 92,
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
    }}
  >
    <Box
      sx={{
        width: 42,
        height: 42,
        borderRadius: 2.2,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
        bgcolor: '#f0fdfa',
        color: '#0f9f83',
      }}
    >
      {icon}
    </Box>

    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          color: '#172033',
          fontWeight: 800,
          fontSize: {
            xs: '1rem',
            md: '1.08rem',
          },
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>

      <Typography
        sx={{
          mt: 0.35,
          color: '#697386',
          fontSize: '0.76rem',
          lineHeight: 1.3,
        }}
      >
        {label}
      </Typography>
    </Box>
  </Box>
);

const SectionCard = ({
  children,
}: SectionCardProps) => (
  <Box
    sx={{
      bgcolor: '#fff',
      border: '1px solid #e3e8f0',
      borderRadius: 3,
      p: {
        xs: 2,
        md: 2.5,
      },
      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.035)',
    }}
  >
    {children}
  </Box>
);

const CheckItem = ({
  children,
}: {
  children: ReactNode;
}) => (
  <Stack
    direction="row"
    spacing={1.2}
    alignItems="flex-start"
  >
    <CheckCircleRoundedIcon
      sx={{
        mt: '2px',
        color: '#0d9b7b',
        fontSize: 20,
        flexShrink: 0,
      }}
    />

    <Typography
      sx={{
        color: '#303a4d',
        fontSize: '0.88rem',
        lineHeight: 1.55,
      }}
    >
      {children}
    </Typography>
  </Stack>
);

/*
 * S1 - Skill Path Detail
 *
 * IMPORTANT:
 * The values below are temporary UI/demo values.
 * They must later come from CareerHarbor's market intelligence
 * and Accelerator backend APIs.
 */
export const SkillPathDetailPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  /*
   * Keep selected path in URL.
   * At the moment selected may be an ID rather than the display
   * name, so React is used as the temporary UI example.
   *
   * Later this page should fetch the selected skill by ID.
   */
  const selectedSkillId =
    searchParams.get('selected');

  const skillName = 'React';

  const navigateToScreen = (
    screen: string,
  ) => {
    const params =
      new URLSearchParams(searchParams);

    params.set('type', 'skill');
    params.set('screen', screen);

    setSearchParams(params);
  };

  const handleBack = () => {
    const params =
      new URLSearchParams(searchParams);

    params.set('type', 'skill');
    params.delete('selected');
    params.delete('screen');

    setSearchParams(params);
  };

  const handleStartJourney = () => {
    navigateToScreen('skill-goal');
  };

  const handleAssessment = () => {
    navigateToScreen('skill-assessment');
  };

  const handleViewJobs = () => {
    /*
     * TODO:
     * Connect this to CareerHarbor job search using the selected
     * skill/job filter once the selected skill DTO is wired here.
     *
     * Do not generate a fake job-search URL.
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
          xs: 2,
          md: 2.5,
        },
      }}
    >
      {/* Breadcrumb / Back */}
      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        justifyContent="space-between"
        alignItems={{
          xs: 'flex-start',
          sm: 'center',
        }}
        spacing={1}
        sx={{ mb: 2 }}
      >
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={handleBack}
          sx={{
            px: 0,
            minWidth: 0,
            color: '#46536a',
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': {
              bgcolor: 'transparent',
              color: '#4338ca',
            },
          }}
        >
          Back to Skill Paths
        </Button>

        {selectedSkillId && (
          <Typography
            sx={{
              color: '#98a2b3',
              fontSize: '0.72rem',
            }}
          >
            Skill ID: {selectedSkillId}
          </Typography>
        )}
      </Stack>

      {/* Hero */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          color: '#fff',
          background:
            'linear-gradient(120deg, #312e81 0%, #4338ca 48%, #667eea 100%)',
          px: {
            xs: 2.5,
            md: 4,
          },
          py: {
            xs: 3,
            md: 3.5,
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 280,
            height: 280,
            borderRadius: '50%',
            right: -80,
            top: -130,
            bgcolor:
              'rgba(255,255,255,0.08)',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: '50%',
            right: 160,
            bottom: -120,
            bgcolor:
              'rgba(255,255,255,0.06)',
          }}
        />

        <Stack
          direction={{
            xs: 'column',
            md: 'row',
          }}
          spacing={{
            xs: 2,
            md: 3,
          }}
          alignItems={{
            xs: 'flex-start',
            md: 'center',
          }}
          sx={{
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              width: {
                xs: 64,
                md: 78,
              },
              height: {
                xs: 64,
                md: 78,
              },
              borderRadius: 3,
              display: 'grid',
              placeItems: 'center',
              bgcolor:
                'rgba(255,255,255,0.13)',
              border:
                '1px solid rgba(255,255,255,0.16)',
              flexShrink: 0,
            }}
          >
            <CodeRoundedIcon
              sx={{
                fontSize: {
                  xs: 34,
                  md: 42,
                },
                color: '#67e8f9',
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              component="h1"
              sx={{
                fontWeight: 900,
                fontSize: {
                  xs: '1.65rem',
                  sm: '2rem',
                  md: '2.25rem',
                },
                lineHeight: 1.15,
                letterSpacing: '-0.035em',
              }}
            >
              {skillName} Skill Path
            </Typography>

            <Typography
              sx={{
                mt: 0.8,
                maxWidth: 760,
                color:
                  'rgba(255,255,255,0.88)',
                fontSize: {
                  xs: '0.9rem',
                  md: '1rem',
                },
                lineHeight: 1.55,
              }}
            >
              Build in-demand React skills and
              create real-world projects to
              become job ready.
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
              sx={{ mt: 1.8 }}
            >
              <Chip
                label="Skill Path"
                size="small"
                sx={{
                  bgcolor: '#fff4bf',
                  color: '#51440b',
                  fontWeight: 800,
                }}
              />

              <Chip
                label="Frontend Development"
                size="small"
                sx={{
                  bgcolor:
                    'rgba(255,255,255,0.88)',
                  color: '#344054',
                  fontWeight: 700,
                }}
              />
            </Stack>
          </Box>

          <Box
            sx={{
              width: {
                xs: '100%',
                md: 180,
              },
              minHeight: {
                xs: 80,
                md: 120,
              },
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 78,
                borderRadius: 2.5,
                border:
                  '4px solid rgba(255,255,255,0.65)',
                display: 'grid',
                placeItems: 'center',
                transform: 'rotate(3deg)',
                bgcolor:
                  'rgba(255,255,255,0.07)',
              }}
            >
              <CodeRoundedIcon
                sx={{
                  fontSize: 45,
                  color:
                    'rgba(255,255,255,0.82)',
                }}
              />
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* Market metrics */}
      <Box
        sx={{
          mt: 2.2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(5, minmax(0, 1fr))',
          },
          gap: 1.5,
        }}
      >
        <MetricCard
          icon={
            <TrendingUpRoundedIcon />
          }
          value="High Demand"
          label="Market Demand"
        />

        <MetricCard
          icon={
            <BusinessCenterRoundedIcon />
          }
          value="42,300+"
          label="Active Jobs"
        />

        <MetricCard
          icon={<GroupsRoundedIcon />}
          value="1,200+"
          label="Companies Hiring"
        />

        <MetricCard
          icon={<AutoGraphRoundedIcon />}
          value="₹8 - 22 LPA"
          label="Avg. Salary (India)"
        />

        <MetricCard
          icon={<SpeedRoundedIcon />}
          value="Medium"
          label="Difficulty Level"
        />
      </Box>

      {/* Main content */}
      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.8fr) minmax(300px, 0.95fr)',
          },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {/* Left */}
        <Stack spacing={2}>
          <SectionCard>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <SchoolRoundedIcon
                sx={{
                  color: '#4f46e5',
                }}
              />

              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 850,
                  fontSize: '1.1rem',
                }}
              >
                About This Skill
              </Typography>
            </Stack>

            <Typography
              sx={{
                mt: 1.5,
                color: '#475467',
                fontSize: '0.9rem',
                lineHeight: 1.65,
              }}
            >
              React is a popular JavaScript
              library for building fast,
              interactive and scalable user
              interfaces. It is widely used in
              modern web applications, startups
              and product companies.
            </Typography>

            <Typography
              sx={{
                mt: 2.3,
                mb: 1.3,
                color: '#172033',
                fontWeight: 850,
                fontSize: '1rem',
              }}
            >
              What You&apos;ll Learn
            </Typography>

            <Stack spacing={1}>
              <CheckItem>
                Build modern component-based user
                interfaces with React
              </CheckItem>

              <CheckItem>
                Manage application state with
                Hooks and Context API
              </CheckItem>

              <CheckItem>
                Work with APIs and real-world
                application data
              </CheckItem>

              <CheckItem>
                Build and deploy
                production-ready React
                applications
              </CheckItem>
            </Stack>
          </SectionCard>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            <SectionCard>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <MenuBookRoundedIcon
                  sx={{
                    color: '#4f46e5',
                  }}
                />

                <Typography
                  sx={{
                    color: '#172033',
                    fontWeight: 850,
                    fontSize: '1rem',
                  }}
                >
                  Prerequisites
                </Typography>
              </Stack>

              <Stack spacing={1}>
                <CheckItem>
                  Basic understanding of HTML,
                  CSS and JavaScript
                </CheckItem>

                <CheckItem>
                  Interest in building web
                  applications
                </CheckItem>
              </Stack>
            </SectionCard>

            <SectionCard>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <GroupsRoundedIcon
                  sx={{
                    color: '#4f46e5',
                  }}
                />

                <Typography
                  sx={{
                    color: '#172033',
                    fontWeight: 850,
                    fontSize: '1rem',
                  }}
                >
                  Career Roles Using React
                </Typography>
              </Stack>

              <Stack spacing={1}>
                <CheckItem>
                  Frontend Developer
                </CheckItem>

                <CheckItem>
                  React Developer
                </CheckItem>

                <CheckItem>
                  Full Stack Developer
                </CheckItem>

                <CheckItem>
                  UI Developer
                </CheckItem>
              </Stack>
            </SectionCard>
          </Box>
        </Stack>

        {/* Right */}
        <Stack spacing={2}>
          <SectionCard>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <TrendingUpRoundedIcon
                sx={{
                  color: '#4f46e5',
                }}
              />

              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 850,
                  fontSize: '1.05rem',
                }}
              >
                Your Progress
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={2.2}
              alignItems="center"
              sx={{ mt: 2 }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: 94,
                  height: 94,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={94}
                  thickness={5}
                  sx={{
                    position: 'absolute',
                    color: '#e8edf4',
                  }}
                />

                <CircularProgress
                  variant="determinate"
                  value={35}
                  size={94}
                  thickness={5}
                  sx={{
                    position: 'absolute',
                    color: '#0d9b7b',
                    '& .MuiCircularProgress-circle':
                      {
                        strokeLinecap: 'round',
                      },
                  }}
                />

                <Typography
                  sx={{
                    color: '#0d9b7b',
                    fontWeight: 900,
                    fontSize: '1.25rem',
                  }}
                >
                  35%
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    color: '#697386',
                    fontSize: '0.8rem',
                  }}
                >
                  Current Proficiency
                </Typography>

                <Typography
                  sx={{
                    mt: 0.3,
                    color: '#172033',
                    fontWeight: 850,
                    fontSize: '1.1rem',
                  }}
                >
                  Intermediate
                </Typography>

                <Button
                  size="small"
                  onClick={() =>
                    navigateToScreen(
                      'skill-passport',
                    )
                  }
                  sx={{
                    mt: 0.6,
                    px: 0,
                    minWidth: 0,
                    textTransform: 'none',
                    fontWeight: 800,
                  }}
                >
                  View Skill Passport →
                </Button>
              </Box>
            </Stack>
          </SectionCard>

          <SectionCard>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <ScheduleRoundedIcon
                sx={{
                  color: '#4f46e5',
                }}
              />

              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 850,
                  fontSize: '1rem',
                }}
              >
                Estimated Learning Time
              </Typography>
            </Stack>

            <Typography
              sx={{
                mt: 1.3,
                color: '#172033',
                fontWeight: 900,
                fontSize: '1.45rem',
              }}
            >
              4 - 6 weeks
            </Typography>

            <Typography
              sx={{
                mt: 0.3,
                color: '#697386',
                fontSize: '0.82rem',
              }}
            >
              10 - 12 hrs/week
            </Typography>
          </SectionCard>

          <SectionCard>
            <Typography
              sx={{
                color: '#172033',
                fontWeight: 850,
                fontSize: '1rem',
              }}
            >
              Related Skills
            </Typography>

            <Stack
              direction="row"
              spacing={0.8}
              useFlexGap
              flexWrap="wrap"
              sx={{ mt: 1.4 }}
            >
              {[
                'JavaScript',
                'TypeScript',
                'HTML',
                'CSS',
                'API Integration',
              ].map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  size="small"
                  sx={{
                    bgcolor: '#f1efff',
                    color: '#4338ca',
                    fontWeight: 700,
                  }}
                />
              ))}
            </Stack>
          </SectionCard>
        </Stack>
      </Box>

      {/* Actions */}
      <Box
        sx={{
          mt: 2.5,
          bgcolor: '#fff',
          border: '1px solid #e3e8f0',
          borderRadius: 3,
          p: {
            xs: 1.5,
            md: 2,
          },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 1.5,
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={
              <PlayArrowRoundedIcon />
            }
            onClick={handleStartJourney}
            sx={{
              minHeight: 52,
              borderRadius: 2.3,
              textTransform: 'none',
              fontWeight: 850,
              background:
                'linear-gradient(90deg, #4338ca, #5b32e8)',
              boxShadow: 'none',
            }}
          >
            Start Skill Journey
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={
              <AssessmentRoundedIcon />
            }
            onClick={handleAssessment}
            sx={{
              minHeight: 52,
              borderRadius: 2.3,
              textTransform: 'none',
              fontWeight: 850,
              borderWidth: 1.5,
              '&:hover': {
                borderWidth: 1.5,
              },
            }}
          >
            Take Assessment
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={
              <BusinessCenterRoundedIcon />
            }
            onClick={handleViewJobs}
            sx={{
              minHeight: 52,
              borderRadius: 2.3,
              textTransform: 'none',
              fontWeight: 850,
              borderWidth: 1.5,
              '&:hover': {
                borderWidth: 1.5,
              },
            }}
          >
            View Jobs
          </Button>
        </Box>
      </Box>

      <Typography
        sx={{
          mt: 1.3,
          color: '#98a2b3',
          fontSize: '0.7rem',
          textAlign: 'center',
        }}
      >
        Market metrics, proficiency and learning
        information shown on this screen are
        temporary UI values until Skill Path
        backend integration is completed.
      </Typography>
    </Box>
  );
};