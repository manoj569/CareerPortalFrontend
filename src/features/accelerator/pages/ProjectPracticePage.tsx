import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import SchemaRoundedIcon from '@mui/icons-material/SchemaRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';

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

interface PracticeSet {
  id: string;
  title: string;
  description: string;
  questions: number;
  duration: string;
  icon: ReactNode;
  completed?: boolean;
  score?: number;
}

interface PracticeActivity {
  id: string;
  title: string;
  score: string;
  time: string;
}

/*
 * C16 FRONTEND-ONLY DISPLAY DATA
 *
 * These values reproduce the approved UI only.
 * Replace them with the existing Accelerator backend
 * contracts during integration.
 *
 * Do not use these values as production progress.
 */
const practiceSets: PracticeSet[] = [
  {
    id: 'database-design',
    title: 'Database Design Fundamentals',
    description:
      'Test your understanding of entities, attributes and relationships.',
    questions: 5,
    duration: '~ 5 min',
    icon: <StorageRoundedIcon />,
    completed: true,
    score: 80,
  },
  {
    id: 'er-modeling',
    title: 'ER Modeling',
    description:
      'Practice creating and analyzing ER diagrams.',
    questions: 6,
    duration: '~ 7 min',
    icon: <SchemaRoundedIcon />,
    completed: true,
    score: 100,
  },
  {
    id: 'normalization',
    title: 'Normalization (1NF, 2NF, 3NF)',
    description:
      'Check your knowledge of database normalization with real scenarios.',
    questions: 5,
    duration: '~ 6 min',
    icon: <DataObjectRoundedIcon />,
  },
  {
    id: 'sql-relationships',
    title: 'SQL & Relationships',
    description:
      'Practice primary keys, foreign keys and table relationships.',
    questions: 8,
    duration: '~ 10 min',
    icon: <CodeRoundedIcon />,
  },
];

const recentActivity: PracticeActivity[] = [
  {
    id: 'activity-er',
    title: 'ER Modeling — Completed',
    score: '5/5 correct (100%)',
    time: 'Today, 11:20 AM',
  },
  {
    id: 'activity-db',
    title: 'Database Design Fundamentals — Completed',
    score: '4/5 correct (80%)',
    time: 'Today, 10:05 AM',
  },
];

export const ProjectPracticePage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

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
    navigateToScreen('project');
  };

  const handleTutor = () => {
    navigateToScreen('ai-tutor');
  };

  const handleStartPractice = (
    practice: PracticeSet,
  ) => {
    navigateToScreen(
      'practice-session',
      {
        practiceId: practice.id,
      },
    );
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
      {/* =====================================
          HERO
      ====================================== */}

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
            xs: 2.4,
            md: 2.8,
          },
          color: '#fff',
          background:
            'linear-gradient(110deg, #075fc5 0%, #4137e7 52%, #8c00f5 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            right: -80,
            top: -190,
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
            right: 220,
            bottom: -125,
            bgcolor:
              'rgba(255,255,255,0.05)',
          }}
        />

        <Stack
          direction="row"
          spacing={1.1}
          alignItems="center"
          useFlexGap
          flexWrap="wrap"
          sx={{ position: 'relative' }}
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

          <Box
            sx={{
              px: 1.2,
              py: 0.35,
              borderRadius: 5,
              border:
                '1px solid rgba(255,200,70,0.75)',
              bgcolor:
                'rgba(255,180,40,0.15)',
              color: '#ffe49b',
              fontSize: '0.72rem',
              fontWeight: 850,
            }}
          >
            👑 Premium
          </Box>
        </Stack>

        <Typography
          sx={{
            position: 'relative',
            mt: 0.5,
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

      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <Box
        sx={{
          mt: 1.3,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md:
              'minmax(0, 1fr) auto',
          },
          gap: 1.3,
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
            Back to Project
          </Button>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mt: 0.25 }}
          >
            <Box
              sx={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                bgcolor: '#f2e8ff',
                color: '#7522e8',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <ScienceRoundedIcon
                sx={{
                  fontSize: 34,
                }}
              />
            </Box>

            <Box>
              <Typography
                component="h2"
                sx={{
                  color: '#0d1538',
                  fontSize: {
                    xs: '1.6rem',
                    md: '2rem',
                  },
                  fontWeight: 900,
                  lineHeight: 1.05,
                  letterSpacing:
                    '-0.035em',
                }}
              >
                Practice
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  color: '#536078',
                  fontSize: '0.82rem',
                }}
              >
                Build and test your
                understanding with targeted
                practice.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack
          direction="row"
          spacing={0.6}
          sx={{
            p: 0.6,
            border:
              '1px solid #dce3ee',
            borderRadius: 3,
            bgcolor: '#fff',
            overflowX: 'auto',
          }}
        >
          <HeaderButton
            icon={
              <PsychologyRoundedIcon />
            }
            label="AI Tutor"
            onClick={handleTutor}
          />

          <HeaderButton
            active
            icon={
              <ScienceRoundedIcon />
            }
            label="Practice"
          />
        </Stack>
      </Box>

      {/* =====================================
          CURRENT PROJECT
      ====================================== */}

      <Box
        sx={{
          ...cardSx,
          mt: 1.6,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg:
              'minmax(300px, 0.8fr) minmax(0, 1.2fr)',
          },
          gap: 2,
          alignItems: 'center',
        }}
      >
        <Stack
          direction="row"
          spacing={1.2}
          alignItems="center"
        >
          <Box
            sx={{
              width: 100,
              height: 82,
              borderRadius: 2.3,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              color: '#fff',
              background:
                'linear-gradient(145deg, #0c69e9 0%, #2c21bd 100%)',
            }}
          >
            <StorageRoundedIcon
              sx={{ fontSize: 49 }}
            />
          </Box>

          <Box>
            <Typography
              sx={{
                color: '#5d687c',
                fontSize: '0.68rem',
                fontWeight: 800,
              }}
            >
              Current Project
            </Typography>

            <Typography
              sx={{
                mt: 0.1,
                color: '#111a38',
                fontSize: '1.15rem',
                fontWeight: 900,
              }}
            >
              Sales Management System
            </Typography>

            <Chip
              label="Milestone 2 • Database Design"
              size="small"
              sx={{
                mt: 0.5,
                bgcolor: '#edf0ff',
                color: '#202a63',
                fontWeight: 850,
                fontSize: '0.68rem',
              }}
            />
          </Box>
        </Stack>

        <Box
          sx={{
            pl: {
              xs: 0,
              lg: 2,
            },
            borderLeft: {
              xs: 'none',
              lg:
                '1px solid #dce3ee',
            },
          }}
        >
          <Stack
            direction="row"
            spacing={0.5}
            useFlexGap
            flexWrap="wrap"
            alignItems="center"
          >
            <Typography
              sx={{
                color: '#111a38',
                fontSize: '0.72rem',
                fontWeight: 900,
                mr: 0.3,
              }}
            >
              Skills:
            </Typography>

            {[
              'SQL',
              'Database Design',
              'Normalization',
              'ER Modeling',
            ].map((skill) => (
              <Chip
                key={skill}
                label={skill}
                size="small"
                sx={{
                  height: 24,
                  bgcolor: '#edf0ff',
                  color: '#26358d',
                  fontWeight: 850,
                  fontSize: '0.62rem',
                }}
              />
            ))}
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            spacing={1}
            sx={{ mt: 1 }}
          >
            <Typography
              sx={{
                color: '#111a38',
                fontSize: '0.75rem',
                fontWeight: 900,
              }}
            >
              Your Practice Progress
            </Typography>

            <Typography
              sx={{
                color: '#111a38',
                fontSize: '0.72rem',
                fontWeight: 850,
              }}
            >
              2 of 5 completed (40%)
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={40}
            sx={{
              mt: 0.55,
              height: 10,
              borderRadius: 10,
              bgcolor: '#d9e1f4',
              '& .MuiLinearProgress-bar':
                {
                  borderRadius: 10,
                  bgcolor: '#16a72d',
                },
            }}
          />
        </Box>
      </Box>

      {/* =====================================
          PRACTICE SETS
      ====================================== */}

      <SectionHeading
        icon={
          <WorkspacePremiumRoundedIcon />
        }
        title="Practice Sets for This Milestone"
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md:
              'repeat(2, minmax(0, 1fr))',
            xl:
              'repeat(4, minmax(0, 1fr))',
          },
          gap: 1.3,
        }}
      >
        {practiceSets.map(
          (practice) => (
            <PracticeCard
              key={practice.id}
              practice={practice}
              onStart={() =>
                handleStartPractice(
                  practice,
                )
              }
            />
          ),
        )}
      </Box>

      {/* =====================================
          SUMMARY + ACTIVITY
      ====================================== */}

      <Box
        sx={{
          mt: 1.5,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg:
              'minmax(300px, 0.75fr) minmax(0, 1.05fr)',
          },
          gap: 1.5,
        }}
      >
        {/* SUMMARY */}

        <Box sx={cardSx}>
          <Stack
            direction="row"
            spacing={0.8}
            alignItems="center"
          >
            <QueryStatsRoundedIcon
              sx={{
                color: '#075fd6',
              }}
            />

            <Typography
              sx={sectionCardTitleSx}
            >
              Your Practice Summary
            </Typography>
          </Stack>

          <Box
            sx={{
              mt: 1.2,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm:
                  '145px minmax(0, 1fr)',
              },
              gap: 1.4,
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: 125,
                height: 125,
                mx: {
                  xs: 'auto',
                  sm: 0,
                },
              }}
            >
              <CircularProgress
                variant="determinate"
                value={100}
                size={125}
                thickness={5}
                sx={{
                  position: 'absolute',
                  color: '#edf0f6',
                }}
              />

              <CircularProgress
                variant="determinate"
                value={40}
                size={125}
                thickness={5}
                sx={{
                  position: 'absolute',
                  color: '#20ae25',
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
                      fontSize: '1.6rem',
                      fontWeight: 900,
                      lineHeight: 1,
                    }}
                  >
                    40%
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.35,
                      color: '#27324a',
                      fontSize: '0.65rem',
                      fontWeight: 750,
                    }}
                  >
                    Completion
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Stack
              divider={
                <Divider flexItem />
              }
            >
              <SummaryRow
                icon={
                  <CheckCircleRoundedIcon />
                }
                value="2"
                label="Completed Practice Sets"
                color="#19a82d"
              />

              <SummaryRow
                icon={
                  <DataObjectRoundedIcon />
                }
                value="18"
                label="Total Questions Attempted"
                color="#27324a"
              />

              <SummaryRow
                icon={
                  <WorkspacePremiumRoundedIcon />
                }
                value="85%"
                label="Average Accuracy"
                color="#e7a000"
              />

              <SummaryRow
                icon={
                  <ScienceRoundedIcon />
                }
                value="3"
                label="Practice Sets Remaining"
                color="#e426ba"
              />
            </Stack>
          </Box>
        </Box>

        {/* RECENT ACTIVITY */}

        <Box sx={cardSx}>
          <Stack
            direction="row"
            spacing={0.8}
            alignItems="center"
          >
            <TimerOutlinedIcon
              sx={{
                color: '#8c17d9',
              }}
            />

            <Typography
              sx={sectionCardTitleSx}
            >
              Recent Practice Activity
            </Typography>
          </Stack>

          <Stack
            sx={{ mt: 1 }}
            divider={
              <Divider flexItem />
            }
          >
            {recentActivity.map(
              (activity) => (
                <Box
                  key={activity.id}
                  sx={{
                    py: 1,
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'auto minmax(0, 1fr)',
                      sm:
                        'auto minmax(0, 1fr) auto',
                    },
                    gap: 1,
                    alignItems: 'center',
                  }}
                >
                  <CheckCircleRoundedIcon
                    sx={{
                      color: '#20ae25',
                    }}
                  />

                  <Box>
                    <Typography
                      sx={{
                        color: '#111a38',
                        fontSize: '0.76rem',
                        fontWeight: 900,
                      }}
                    >
                      {activity.title}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.1,
                        color: '#536078',
                        fontSize: '0.67rem',
                      }}
                    >
                      {activity.score}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      gridColumn: {
                        xs: '2',
                        sm: 'auto',
                      },
                      color: '#536078',
                      fontSize: '0.65rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {activity.time}
                  </Typography>
                </Box>
              ),
            )}
          </Stack>
        </Box>
      </Box>

      {/* =====================================
          AI TUTOR CTA
      ====================================== */}

      <Box
        sx={{
          mt: 1.5,
          mb: 2,
          px: {
            xs: 1.4,
            md: 2,
          },
          py: 1.25,
          border:
            '1px solid #b88cff',
          borderRadius: 3,
          background:
            'linear-gradient(90deg, #fbf7ff 0%, #f5f0ff 100%)',
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md:
              'minmax(0, 1fr) auto',
          },
          gap: 1.2,
          alignItems: 'center',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2,
              bgcolor: '#eee3ff',
              color: '#7624e8',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <PsychologyRoundedIcon
              sx={{ fontSize: 29 }}
            />
          </Box>

          <Box>
            <Typography
              sx={{
                color: '#111a38',
                fontSize: '1rem',
                fontWeight: 900,
              }}
            >
              Need Help with Practice?
            </Typography>

            <Typography
              sx={{
                mt: 0.15,
                color: '#536078',
                fontSize: '0.74rem',
              }}
            >
              Ask AI Tutor to explain a
              question, review your answer
              or suggest what to practice
              next.
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="contained"
          endIcon={
            <ArrowForwardRoundedIcon />
          }
          onClick={handleTutor}
          sx={{
            minWidth: 175,
            minHeight: 44,
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 900,
            boxShadow: 'none',
            background:
              'linear-gradient(90deg, #7b14e8 0%, #5b15d7 100%)',
          }}
        >
          Ask AI Tutor
        </Button>
      </Box>
    </Box>
  );
};

/* =========================================
   PRACTICE CARD
========================================= */

interface PracticeCardProps {
  practice: PracticeSet;
  onStart: () => void;
}

const PracticeCard = ({
  practice,
  onStart,
}: PracticeCardProps) => (
  <Box
    sx={{
      ...cardSx,
      p: 1.4,
      minHeight: 245,
      display: 'flex',
      flexDirection: 'column',
      borderColor:
        practice.id ===
        'database-design'
          ? '#8d32ef'
          : '#dce3ee',
      background:
        practice.id ===
        'database-design'
          ? 'linear-gradient(145deg, #fff 0%, #fbf4ff 100%)'
          : '#fff',
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: 2,
        bgcolor: '#eee7ff',
        color: '#4321dc',
        display: 'grid',
        placeItems: 'center',
        '& svg': {
          fontSize: 30,
        },
      }}
    >
      {practice.icon}
    </Box>

    <Typography
      sx={{
        mt: 0.9,
        color: '#111a38',
        fontSize: '0.95rem',
        lineHeight: 1.12,
        fontWeight: 900,
      }}
    >
      {practice.title}
    </Typography>

    <Typography
      sx={{
        mt: 0.5,
        color: '#46536b',
        fontSize: '0.71rem',
        lineHeight: 1.45,
        flex: 1,
      }}
    >
      {practice.description}
    </Typography>

    <Stack
      direction="row"
      spacing={1.4}
      useFlexGap
      flexWrap="wrap"
      sx={{ mt: 1 }}
    >
      <Stack
        direction="row"
        spacing={0.4}
        alignItems="center"
      >
        <DataObjectRoundedIcon
          sx={{ fontSize: 17 }}
        />

        <Typography
          sx={practiceMetaSx}
        >
          {practice.questions} questions
        </Typography>
      </Stack>

      <Stack
        direction="row"
        spacing={0.4}
        alignItems="center"
      >
        <TimerOutlinedIcon
          sx={{ fontSize: 17 }}
        />

        <Typography
          sx={practiceMetaSx}
        >
          {practice.duration}
        </Typography>
      </Stack>
    </Stack>

    {practice.completed &&
      practice.score !== undefined && (
        <Chip
          icon={
            <CheckCircleRoundedIcon />
          }
          label={`Previous score ${practice.score}%`}
          size="small"
          sx={{
            mt: 0.8,
            alignSelf: 'flex-start',
            bgcolor: '#e8f8e9',
            color: '#18762b',
            fontSize: '0.6rem',
            fontWeight: 850,
            '& .MuiChip-icon': {
              color: '#1da334',
            },
          }}
        />
      )}

    <Button
      variant="outlined"
      endIcon={
        <ArrowForwardRoundedIcon />
      }
      onClick={onStart}
      sx={{
        mt: 1,
        minHeight: 38,
        borderRadius: 2.3,
        borderColor: '#7d27ee',
        color: '#4a16d3',
        textTransform: 'none',
        fontWeight: 900,
        fontSize: '0.72rem',
      }}
    >
      {practice.completed
        ? 'Practice Again'
        : 'Start Practice'}
    </Button>
  </Box>
);

/* =========================================
   SUMMARY ROW
========================================= */

interface SummaryRowProps {
  icon: ReactNode;
  value: string;
  label: string;
  color: string;
}

const SummaryRow = ({
  icon,
  value,
  label,
  color,
}: SummaryRowProps) => (
  <Stack
    direction="row"
    spacing={0.7}
    alignItems="center"
    sx={{
      py: 0.65,
    }}
  >
    <Box
      sx={{
        color,
        display: 'grid',
        placeItems: 'center',
        '& svg': {
          fontSize: 18,
        },
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        minWidth: 38,
        color: '#111a38',
        fontSize: '0.78rem',
        fontWeight: 900,
      }}
    >
      {value}
    </Typography>

    <Typography
      sx={{
        color: '#27324a',
        fontSize: '0.68rem',
      }}
    >
      {label}
    </Typography>
  </Stack>
);

/* =========================================
   SECTION HEADING
========================================= */

interface SectionHeadingProps {
  icon: ReactNode;
  title: string;
}

const SectionHeading = ({
  icon,
  title,
}: SectionHeadingProps) => (
  <Stack
    direction="row"
    spacing={0.75}
    alignItems="center"
    sx={{
      mt: 1.6,
      mb: 0.8,
    }}
  >
    <Box
      sx={{
        color: '#6c20e8',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        color: '#111a38',
        fontSize: '1.05rem',
        fontWeight: 900,
      }}
    >
      {title}
    </Typography>
  </Stack>
);

/* =========================================
   HEADER BUTTON
========================================= */

interface HeaderButtonProps {
  active?: boolean;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

const HeaderButton = ({
  active = false,
  icon,
  label,
  onClick,
}: HeaderButtonProps) => (
  <Button
    startIcon={icon}
    onClick={onClick}
    sx={{
      minWidth: {
        xs: 145,
        md: 190,
      },
      minHeight: 46,
      borderRadius: 2.3,
      color: active
        ? '#fff'
        : '#17213b',
      bgcolor: active
        ? '#6428e8'
        : '#f8f9fc',
      textTransform: 'none',
      fontWeight: 900,
      '&:hover': {
        bgcolor: active
          ? '#501bd2'
          : '#eef2f8',
      },
    }}
  >
    {label}
  </Button>
);

const cardSx = {
  border: '1px solid #dce3ee',
  borderRadius: 3,
  bgcolor: '#fff',
  p: {
    xs: 1.4,
    md: 1.6,
  },
};

const sectionCardTitleSx = {
  color: '#111a38',
  fontSize: '0.95rem',
  fontWeight: 900,
};

const practiceMetaSx = {
  color: '#26324a',
  fontSize: '0.65rem',
  fontWeight: 750,
};