import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';

import { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

interface BreakdownItem {
  id: string;
  label: string;
  score: number;
  icon: ReactNode;
  color: string;
  background: string;
}

interface ActionItem {
  id: number;
  title: string;
  duration: string;
  color: string;
  background: string;
}

interface LearningItem {
  id: string;
  title: string;
  duration: string;
  icon: ReactNode;
}

/*
 * C20 TEMPORARY UI CONTENT ONLY.
 *
 * During backend integration replace these values
 * with real Career Accelerator readiness data.
 */
const readinessScore = 82;

const breakdownItems: BreakdownItem[] = [
  {
    id: 'technical',
    label: 'Technical Skills',
    score: 85,
    icon: <CodeRoundedIcon />,
    color: '#13a82a',
    background: '#f0e5ff',
  },
  {
    id: 'project',
    label: 'Project Experience',
    score: 80,
    icon: <WorkRoundedIcon />,
    color: '#168bea',
    background: '#e6f4ff',
  },
  {
    id: 'communication',
    label: 'Communication',
    score: 82,
    icon: <PsychologyRoundedIcon />,
    color: '#7423e8',
    background: '#f1e6ff',
  },
  {
    id: 'behavioral',
    label: 'Behavioral & Culture Fit',
    score: 78,
    icon: <GroupsRoundedIcon />,
    color: '#ff7900',
    background: '#fff0dc',
  },
];

const actionItems: ActionItem[] = [
  {
    id: 1,
    title:
      'Strengthen SQL Performance & Optimization',
    duration: '~3–4 hours',
    color: '#7621e8',
    background: '#f3eaff',
  },
  {
    id: 2,
    title:
      'Enhance Project Documentation & Impact',
    duration: '~2–3 hours',
    color: '#148fe8',
    background: '#eaf6ff',
  },
  {
    id: 3,
    title: 'Practice More Mock Interviews',
    duration: '~3–5 hours',
    color: '#2fbd58',
    background: '#ebf9ef',
  },
  {
    id: 4,
    title:
      'Improve Communication & Storytelling',
    duration: '~2–3 hours',
    color: '#ff8a22',
    background: '#fff1e5',
  },
];

const learningItems: LearningItem[] = [
  {
    id: 'sql-optimization',
    title:
      'Advanced SQL & Query Optimization',
    duration: '3.5 hours',
    icon: <StorageRoundedIcon />,
  },
  {
    id: 'database-design',
    title:
      'Database Design & Best Practices',
    duration: '4 hours',
    icon: <CodeRoundedIcon />,
  },
  {
    id: 'project-deep-dive',
    title:
      'Project Deep-Dive: Real-world SQL Cases',
    duration: '3 hours',
    icon: <AssessmentRoundedIcon />,
  },
];

export const CareerReadinessPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const targetRole =
    searchParams.get('targetRole') ??
    'SQL Developer';

  const navigateToScreen = (
    screen: string,
    extra?: Record<string, string>,
  ) => {
    const params =
      new URLSearchParams(searchParams);

    params.set('screen', screen);

    if (extra) {
      Object.entries(extra).forEach(
        ([key, value]) => {
          params.set(key, value);
        },
      );
    }

    setSearchParams(params);
  };

  const handleBack = () => {
    navigateToScreen(
      'mock-interview-results',
    );
  };

  const handleAction = (
    actionId: number,
  ) => {
    switch (actionId) {
      case 1:
      case 2:
        navigateToScreen('roadmap');
        break;

      case 3:
        navigateToScreen(
          'mock-interview-setup',
        );
        break;

      case 4:
        navigateToScreen('ai-tutor');
        break;

      default:
        break;
    }
  };

  const handleLearning = (
    learningId: string,
  ) => {
    /*
     * We reuse the existing learning area.
     * Later backend integration should open the
     * exact recommended module returned by API.
     */
    navigateToScreen('active-learning', {
      recommendedLearning:
        learningId,
    });
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
            width: 280,
            height: 280,
            borderRadius: '50%',
            right: -80,
            top: -180,
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
              letterSpacing:
                '-0.03em',
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

      <Box sx={{ mt: 1.1 }}>
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
          Back to Results
        </Button>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mt: 0.15 }}
        >
          <Box
            sx={{
              width: 62,
              height: 62,
              borderRadius: '50%',
              bgcolor: '#f0e3ff',
              color: '#7a20e8',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <AssessmentRoundedIcon
              sx={{
                fontSize: 38,
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
              Career Readiness Dashboard
            </Typography>

            <Typography
              sx={{
                mt: 0.15,
                color: '#536078',
                fontSize: '0.82rem',
              }}
            >
              Your overall career readiness
              and personalized next steps to
              crack your target role.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* SCORE + BREAKDOWN */}

      <Box
        sx={{
          mt: 1.5,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl:
              'minmax(380px, 1fr) minmax(0, 1fr)',
          },
          gap: 1.5,
        }}
      >
        <Box sx={cardSx}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
          >
            <Stack
              direction="row"
              spacing={0.7}
              alignItems="center"
            >
              <Box
                sx={purpleIconSx}
              >
                <TrackChangesRoundedIcon />
              </Box>

              <Typography
                sx={cardTitleSx}
              >
                Career Readiness Score
              </Typography>
            </Stack>

            <Chip
              icon={<CheckRoundedIcon />}
              label="Strong Readiness"
              size="small"
              sx={{
                bgcolor: '#dcf7e1',
                color: '#16792a',
                fontWeight: 900,
                '& .MuiChip-icon': {
                  color: '#168c2b',
                },
              }}
            />
          </Stack>

          <Box
            sx={{
              mt: 1.2,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm:
                  '205px minmax(0, 1fr)',
              },
              gap: 1.5,
              alignItems: 'center',
            }}
          >
            <ReadinessCircle
              score={readinessScore}
            />

            <Stack
              divider={
                <Divider flexItem />
              }
            >
              <DetailRow
                icon={<WorkRoundedIcon />}
                label="Target Role:"
                value={targetRole}
              />

              <DetailRow
                icon={
                  <TrackChangesRoundedIcon />
                }
                label="Overall Level:"
                value="Intermediate"
              />

              <DetailRow
                icon={
                  <AssessmentRoundedIcon />
                }
                label="Based On:"
                value="Mock Interview, Skills & Profile"
              />

              <DetailRow
                icon={
                  <ScheduleRoundedIcon />
                }
                label="Last Updated:"
                value="Nov 17, 2026"
              />
            </Stack>
          </Box>
        </Box>

        {/* BREAKDOWN */}

        <Box sx={cardSx}>
          <Stack
            direction="row"
            spacing={0.7}
            alignItems="center"
          >
            <Box sx={purpleIconSx}>
              <AssessmentRoundedIcon />
            </Box>

            <Typography
              sx={cardTitleSx}
            >
              Readiness Breakdown
            </Typography>
          </Stack>

          <Stack
            spacing={1.15}
            sx={{ mt: 1.4 }}
          >
            {breakdownItems.map(
              (item) => (
                <BreakdownRow
                  key={item.id}
                  item={item}
                />
              ),
            )}
          </Stack>
        </Box>
      </Box>

      {/* ACTION PLAN + LEARNING */}

      <Box
        sx={{
          mt: 1.5,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl:
              'minmax(360px, 0.95fr) minmax(0, 1.05fr)',
          },
          gap: 1.5,
        }}
      >
        {/* ACTION PLAN */}

        <Box sx={cardSx}>
          <Stack
            direction="row"
            spacing={0.7}
            alignItems="center"
          >
            <TrackChangesRoundedIcon
              sx={{
                color: '#7b1ce8',
              }}
            />

            <Typography
              sx={cardTitleSx}
            >
              Personalized Action Plan
            </Typography>
          </Stack>

          <Stack
            spacing={0.7}
            sx={{ mt: 1 }}
          >
            {actionItems.map(
              (item) => (
                <Box
                  key={item.id}
                  onClick={() =>
                    handleAction(item.id)
                  }
                  sx={{
                    px: 0.8,
                    py: 0.65,
                    borderRadius: 2,
                    bgcolor:
                      item.background,
                    cursor: 'pointer',
                    display: 'grid',
                    gridTemplateColumns:
                      '36px minmax(0, 1fr) auto auto',
                    gap: 0.7,
                    alignItems: 'center',
                    transition:
                      'transform 0.15s ease',
                    '&:hover': {
                      transform:
                        'translateX(2px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 31,
                      height: 31,
                      borderRadius: '50%',
                      bgcolor: item.color,
                      color: '#fff',
                      display: 'grid',
                      placeItems:
                        'center',
                      fontSize:
                        '0.72rem',
                      fontWeight: 900,
                    }}
                  >
                    {item.id}
                  </Box>

                  <Typography
                    sx={{
                      color: '#17213b',
                      fontSize:
                        '0.7rem',
                      fontWeight: 900,
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={0.3}
                    alignItems="center"
                  >
                    <ScheduleRoundedIcon
                      sx={{
                        fontSize: 16,
                      }}
                    />

                    <Typography
                      sx={{
                        color:
                          '#17213b',
                        fontSize:
                          '0.62rem',
                        whiteSpace:
                          'nowrap',
                      }}
                    >
                      {item.duration}
                    </Typography>
                  </Stack>

                  <ArrowForwardRoundedIcon
                    sx={{
                      color: item.color,
                      fontSize: 20,
                    }}
                  />
                </Box>
              ),
            )}
          </Stack>
        </Box>

        {/* LEARNING PATH */}

        <Box sx={cardSx}>
          <Stack
            direction="row"
            spacing={0.7}
            alignItems="center"
          >
            <MenuBookRoundedIcon
              sx={{
                color: '#741de8',
              }}
            />

            <Typography
              sx={cardTitleSx}
            >
              Recommended Learning Path
            </Typography>
          </Stack>

          <Box
            sx={{
              mt: 1,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm:
                  'repeat(3, minmax(0, 1fr))',
              },
              gap: 0.9,
            }}
          >
            {learningItems.map(
              (item) => (
                <LearningCard
                  key={item.id}
                  item={item}
                  onStart={() =>
                    handleLearning(
                      item.id,
                    )
                  }
                />
              ),
            )}
          </Box>
        </Box>
      </Box>

      {/* MILESTONES */}

      <Box
        sx={{
          mt: 1.5,
          mb: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl:
              'minmax(0, 1.45fr) minmax(320px, 0.85fr)',
          },
          gap: 1.5,
        }}
      >
        <Box sx={cardSx}>
          <Stack
            direction="row"
            spacing={0.7}
            alignItems="center"
          >
            <TrackChangesRoundedIcon
              sx={{
                color: '#7b1ce8',
              }}
            />

            <Typography
              sx={cardTitleSx}
            >
              Next Milestones
            </Typography>
          </Stack>

          <Box
            sx={{
              mt: 1.5,
              overflowX: 'auto',
              pb: 0.5,
            }}
          >
            <Box
              sx={{
                minWidth: 650,
                display: 'grid',
                gridTemplateColumns:
                  'repeat(5, 1fr)',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 23,
                  left: '10%',
                  right: '10%',
                  height: 4,
                  bgcolor: '#d3daea',
                }}
              />

              <Box
                sx={{
                  position: 'absolute',
                  top: 23,
                  left: '10%',
                  width: '20%',
                  height: 4,
                  bgcolor: '#1ab72b',
                }}
              />

              <Milestone
                completed
                icon={
                  <CheckRoundedIcon />
                }
                title="Mock Interview"
                subtitle="Completed"
              />

              <Milestone
                active
                icon={
                  <TrackChangesRoundedIcon />
                }
                title="Career Readiness"
                subtitle="(You are here)"
              />

              <Milestone
                icon={
                  <SchoolRoundedIcon />
                }
                title="Learning Roadmap"
              />

              <Milestone
                icon={
                  <AssessmentRoundedIcon />
                }
                title="Skill Practice & Assessments"
              />

              <Milestone
                icon={
                  <WorkRoundedIcon />
                }
                title="Job Readiness"
              />
            </Box>
          </Box>
        </Box>

        {/* RIGHT TRACK CARD */}

        <Box
          sx={{
            ...cardSx,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              width: '100%',
              p: 1.6,
              borderRadius: 2.5,
              background:
                'linear-gradient(110deg, #f8edff 0%, #ead7ff 100%)',
            }}
          >
            <Stack
              direction="row"
              spacing={0.7}
              alignItems="center"
            >
              <RocketLaunchRoundedIcon
                sx={{
                  color: '#7b1ce8',
                }}
              />

              <Typography
                sx={{
                  color: '#6d1fd0',
                  fontSize: '1rem',
                  fontWeight: 900,
                }}
              >
                You&apos;re on the right
                track!
              </Typography>
            </Stack>

            <Typography
              sx={{
                mt: 0.8,
                color: '#17213b',
                fontSize: '0.76rem',
                lineHeight: 1.5,
              }}
            >
              Complete your action plan and
              learning path to reach 90%+
              career readiness and get job
              ready.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

/* =========================================
   READINESS CIRCLE
========================================= */

const ReadinessCircle = ({
  score,
}: {
  score: number;
}) => (
  <Box
    sx={{
      position: 'relative',
      width: 170,
      height: 170,
      mx: {
        xs: 'auto',
        sm: 0,
      },
    }}
  >
    <CircularProgress
      variant="determinate"
      value={100}
      size={170}
      thickness={5}
      sx={{
        position: 'absolute',
        color: '#e8edf3',
      }}
    />

    <CircularProgress
      variant="determinate"
      value={score}
      size={170}
      thickness={5}
      sx={{
        position: 'absolute',
        color: '#15bc25',
        '& .MuiCircularProgress-circle':
          {
            strokeLinecap: 'round',
          },
      }}
    />

    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
      }}
    >
      <Box>
        <Typography
          sx={{
            color: '#111a38',
            fontSize: '2.3rem',
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          {score}%
        </Typography>

        <Typography
          sx={{
            mt: 0.4,
            color: '#147b21',
            fontSize: '1.05rem',
            fontWeight: 900,
          }}
        >
          Ready
        </Typography>
      </Box>
    </Box>
  </Box>
);

/* =========================================
   DETAIL ROW
========================================= */

interface DetailRowProps {
  icon: ReactNode;
  label: string;
  value: string;
}

const DetailRow = ({
  icon,
  label,
  value,
}: DetailRowProps) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns:
        '22px 105px minmax(0, 1fr)',
      gap: 0.6,
      alignItems: 'center',
      py: 0.6,
    }}
  >
    <Box
      sx={{
        color: '#6620e7',
        display: 'grid',
        placeItems: 'center',
        '& svg': {
          fontSize: 17,
        },
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        color: '#17213b',
        fontSize: '0.68rem',
        fontWeight: 900,
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        color: '#17213b',
        fontSize: '0.68rem',
      }}
    >
      {value}
    </Typography>
  </Box>
);

/* =========================================
   BREAKDOWN
========================================= */

const BreakdownRow = ({
  item,
}: {
  item: BreakdownItem;
}) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs:
          '35px minmax(120px, .8fr) minmax(100px, 1fr) 45px',
        sm:
          '35px 180px minmax(140px, 1fr) 45px',
      },
      gap: 0.8,
      alignItems: 'center',
    }}
  >
    <Box
      sx={{
        width: 31,
        height: 31,
        borderRadius: 1.5,
        bgcolor: item.background,
        color: item.color,
        display: 'grid',
        placeItems: 'center',
        '& svg': {
          fontSize: 19,
        },
      }}
    >
      {item.icon}
    </Box>

    <Typography
      sx={{
        color: '#17213b',
        fontSize: '0.7rem',
        fontWeight: 750,
      }}
    >
      {item.label}
    </Typography>

    <LinearProgress
      variant="determinate"
      value={item.score}
      sx={{
        height: 11,
        borderRadius: 10,
        bgcolor: '#dce2ed',
        '& .MuiLinearProgress-bar': {
          borderRadius: 10,
          bgcolor: item.color,
        },
      }}
    />

    <Typography
      sx={{
        color: '#111a38',
        fontSize: '0.74rem',
        fontWeight: 900,
        textAlign: 'right',
      }}
    >
      {item.score}%
    </Typography>
  </Box>
);

/* =========================================
   LEARNING CARD
========================================= */

const LearningCard = ({
  item,
  onStart,
}: {
  item: LearningItem;
  onStart: () => void;
}) => (
  <Box
    sx={{
      minHeight: 170,
      border:
        '1px solid #d8dfeb',
      borderRadius: 2.5,
      p: 1.1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    }}
  >
    <Box
      sx={{
        color: '#7619e8',
        '& svg': {
          fontSize: 38,
        },
      }}
    >
      {item.icon}
    </Box>

    <Typography
      sx={{
        mt: 0.6,
        color: '#111a38',
        fontSize: '0.72rem',
        lineHeight: 1.3,
        fontWeight: 900,
        flex: 1,
      }}
    >
      {item.title}
    </Typography>

    <Stack
      direction="row"
      spacing={0.4}
      alignItems="center"
      sx={{ mt: 0.6 }}
    >
      <ScheduleRoundedIcon
        sx={{
          fontSize: 16,
        }}
      />

      <Typography
        sx={{
          color: '#17213b',
          fontSize: '0.64rem',
        }}
      >
        {item.duration}
      </Typography>
    </Stack>

    <Button
      endIcon={
        <ArrowForwardRoundedIcon />
      }
      onClick={onStart}
      sx={{
        mt: 0.4,
        color: '#6515e2',
        textTransform: 'none',
        fontWeight: 900,
        fontSize: '0.7rem',
      }}
    >
      Start
    </Button>
  </Box>
);

/* =========================================
   MILESTONE
========================================= */

interface MilestoneProps {
  completed?: boolean;
  active?: boolean;
  icon: ReactNode;
  title: string;
  subtitle?: string;
}

const Milestone = ({
  completed = false,
  active = false,
  icon,
  title,
  subtitle,
}: MilestoneProps) => (
  <Box
    sx={{
      position: 'relative',
      zIndex: 1,
      textAlign: 'center',
    }}
  >
    <Box
      sx={{
        width: 50,
        height: 50,
        mx: 'auto',
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        bgcolor: completed
          ? '#1bbb2c'
          : active
            ? '#6d1ee8'
            : '#f4f6fa',
        color:
          completed || active
            ? '#fff'
            : '#17213b',
        border:
          completed || active
            ? 'none'
            : '1px solid #ccd5e5',
        boxShadow: active
          ? '0 5px 14px rgba(107, 29, 231, 0.24)'
          : 'none',
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        mt: 0.6,
        color: '#17213b',
        fontSize: '0.68rem',
        lineHeight: 1.2,
        fontWeight: active
          ? 900
          : 750,
      }}
    >
      {title}
    </Typography>

    {subtitle && (
      <Typography
        sx={{
          mt: 0.15,
          color: active
            ? '#6c19e7'
            : '#17213b',
          fontSize: '0.62rem',
          fontWeight: active
            ? 900
            : 650,
        }}
      >
        {subtitle}
      </Typography>
    )}
  </Box>
);

const purpleIconSx = {
  width: 38,
  height: 38,
  borderRadius: 2,
  bgcolor: '#7819e8',
  color: '#fff',
  display: 'grid',
  placeItems: 'center',
};

const cardTitleSx = {
  color: '#111a38',
  fontSize: '0.95rem',
  fontWeight: 900,
};

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