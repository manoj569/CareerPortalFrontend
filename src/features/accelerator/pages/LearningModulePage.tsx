import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import YouTubeIcon from '@mui/icons-material/YouTube';

import {
  Box,
  Button,
  CircularProgress,
  Divider,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type LessonStatus =
  | 'completed'
  | 'active'
  | 'locked';

interface ModuleLesson {
  id: number;
  title: string;
  duration: string;
  status: LessonStatus;
}

const moduleLessons: ModuleLesson[] = [
  {
    id: 1,
    title: 'Introduction to Databases',
    duration: '10 min',
    status: 'completed',
  },
  {
    id: 2,
    title: 'SQL Basics & Queries',
    duration: '15 min',
    status: 'completed',
  },
  {
    id: 3,
    title: 'Normalization & DB Design',
    duration: '12 min',
    status: 'active',
  },
  {
    id: 4,
    title: 'Indexing & Performance',
    duration: '45 min',
    status: 'locked',
  },
  {
    id: 5,
    title: 'Transactions & Concurrency',
    duration: '20 min',
    status: 'locked',
  },
];

const takeaways = [
  'What is normalization and why it matters',
  'The normalization forms (1NF, 2NF, 3NF)',
  'Designing a normalized schema',
  'Real-world example with use case',
];

const objectives = [
  'Understand the need for normalization',
  'Learn 1NF, 2NF and 3NF with examples',
  'Apply normalization to a real-world database',
  'Identify and fix design issues in a schema',
];

const tabs = [
  'Overview',
  'Notes',
  'Practice',
  'Assignment',
  'Assessment',
  'Resources',
  'Discussion',
];

/*
 * FRONTEND UI DATA ONLY.
 *
 * youtubeVideoId should later come from the
 * curated learning-resource API/database.
 *
 * Do not download/re-upload YouTube videos.
 * CareerHarbor should embed the original resource.
 *
 * Replace this placeholder ID with an approved
 * curated YouTube video during integration.
 */
const youtubeVideoId = '';

export const LearningModulePage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [activeTab, setActiveTab] =
    useState(0);

  const moduleProgress = 60;

  const handleBack = () => {
    const params =
      new URLSearchParams(searchParams);

    params.set('screen', 'learning');

    setSearchParams(params);
  };

  const handlePractice = () => {
  const params =
    new URLSearchParams(searchParams);

  params.set('screen', 'practice');

  setSearchParams(params);
};

  const handleAssignment = () => {
    setActiveTab(3);
  };

  const handleAssessment = () => {
    setActiveTab(4);
  };

  const handleNextLesson = () => {
    /*
     * During API integration this should
     * load the next unlocked lesson ID.
     */
  };

  const handlePreviousLesson = () => {
    /*
     * During API integration this should
     * load the previous lesson ID.
     */
  };

  const handleComplete = () => {
    /*
     * During API integration:
     * 1. persist lesson completion;
     * 2. refresh module progress;
     * 3. unlock the next lesson if eligible.
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
            xs: 2.5,
            md: 3,
          },
          color: '#fff',
          background:
            'linear-gradient(115deg, #1158b9 0%, #3449d7 52%, #751fe4 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 280,
            height: 280,
            borderRadius: '50%',
            right: -70,
            top: -155,
            bgcolor:
              'rgba(255,255,255,0.08)',
          }}
        />

        <Stack
          direction="row"
          spacing={1.2}
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
              fontWeight: 850,
              fontSize: {
                xs: '1.5rem',
                md: '2rem',
              },
              letterSpacing: '-0.03em',
            }}
          >
            AI Career Accelerator
          </Typography>

          <Box
            sx={{
              px: 1.25,
              py: 0.4,
              borderRadius: 5,
              border:
                '1px solid rgba(255,200,70,0.75)',
              bgcolor:
                'rgba(255,180,40,0.12)',
              color: '#ffe39b',
              fontSize: '0.75rem',
              fontWeight: 750,
            }}
          >
            Premium
          </Box>
        </Stack>

        <Typography
          sx={{
            position: 'relative',
            mt: 0.65,
            maxWidth: 780,
            color:
              'rgba(255,255,255,0.9)',
            fontSize: {
              xs: '0.84rem',
              md: '0.95rem',
            },
          }}
        >
          Your personalized, AI-powered journey
          from your current skills to your next
          dream role.
        </Typography>
      </Box>

      {/* TITLE + PROGRESS */}

      <Box
        sx={{
          mt: 1.6,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1fr) 440px',
          },
          gap: 2,
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
              textTransform: 'none',
              color: '#17213b',
              fontWeight: 800,
              '&:hover': {
                bgcolor: 'transparent',
                color: '#075fd6',
              },
            }}
          >
            Back to Learning
          </Button>

          <Typography
            component="h2"
            sx={{
              mt: 0.25,
              color: '#0d1538',
              fontWeight: 900,
              fontSize: {
                xs: '1.5rem',
                md: '2rem',
              },
              letterSpacing: '-0.035em',
            }}
          >
            Database Design – Fundamentals
          </Typography>

          <Typography
            sx={{
              mt: 0.2,
              color: '#202b4b',
              fontWeight: 650,
              fontSize: '0.92rem',
            }}
          >
            Module 2 • Database &amp; Data
            Management
          </Typography>
        </Box>

        <Box
          sx={{
            border:
              '1px solid #dce3ee',
            borderRadius: 3,
            bgcolor: '#fff',
            px: 2,
            py: 1.5,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              sx={{
                color: '#111a38',
                fontWeight: 850,
              }}
            >
              Module Progress
            </Typography>

            <Typography
              sx={{
                color: '#111a38',
                fontSize: '1.1rem',
                fontWeight: 900,
              }}
            >
              {moduleProgress}%
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={moduleProgress}
            sx={{
              mt: 0.9,
              height: 10,
              borderRadius: 5,
              bgcolor: '#e5e8ef',
              '& .MuiLinearProgress-bar':
                {
                  borderRadius: 5,
                  backgroundColor:
                    '#18a93a',
                },
            }}
          />

          <Typography
            sx={{
              mt: 0.8,
              color: '#263858',
              fontSize: '0.78rem',
              fontWeight: 650,
            }}
          >
            3 of 5 lessons completed
          </Typography>
        </Box>
      </Box>

      {/* MAIN GRID */}

      <Box
        sx={{
          mt: 1.5,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl:
              'minmax(0, 1.65fr) 380px',
          },
          gap: 2,
        }}
      >
        {/* LEFT */}

        <Box>
          {/* VIDEO + LESSON INFO */}

          <Box
            sx={{
              border:
                '1px solid #dce3ee',
              borderRadius: 3,
              bgcolor: '#fff',
              p: 1.2,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                px: 0.4,
                pb: 1,
              }}
            >
              <YouTubeIcon
                sx={{
                  color: '#ff0000',
                  fontSize: 28,
                }}
              />

              <Typography
                sx={{
                  color: '#111a38',
                  fontWeight: 850,
                  fontSize: '0.85rem',
                }}
              >
                Video Lesson
              </Typography>

              <Typography
                sx={{
                  color: '#48566f',
                  fontSize: '0.78rem',
                }}
              >
                YouTube • Curated by
                CareerHarbor
              </Typography>
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  lg:
                    'minmax(0, 1.2fr) minmax(300px, 0.8fr)',
                },
                gap: 1.5,
              }}
            >
              <YouTubeLessonPlayer />

              <LessonInformation />
            </Box>
          </Box>

          {/* TABS */}

          <Box
            sx={{
              mt: 1.2,
              borderBottom:
                '1px solid #dce3ee',
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, value) =>
                setActiveTab(value)
              }
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 45,
                '& .MuiTab-root': {
                  minHeight: 45,
                  textTransform: 'none',
                  color: '#17213b',
                  fontSize: '0.78rem',
                  fontWeight: 750,
                },
                '& .Mui-selected': {
                  color:
                    '#075fd6 !important',
                  fontWeight: 850,
                },
              }}
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab}
                  label={tab}
                />
              ))}
            </Tabs>
          </Box>

          {/* TAB CONTENT */}

          <Box
            sx={{
              mt: 0.1,
              border:
                '1px solid #dce3ee',
              borderRadius: 3,
              bgcolor: '#fff',
              p: {
                xs: 1.6,
                md: 2,
              },
            }}
          >
            {activeTab === 0 && (
              <OverviewContent />
            )}

            {activeTab === 1 && (
              <PlaceholderTab
                title="Lesson Notes"
                description="Your CareerHarbor notes and AI-generated summaries for this lesson will appear here."
                icon={
                  <NotesRoundedIcon />
                }
              />
            )}

            {activeTab === 2 && (
  <Box
    sx={{
      minHeight: 180,
      display: 'grid',
      placeItems: 'center',
      textAlign: 'center',
      py: 2,
    }}
  >
    <Box>
      <CodeRoundedIcon
        sx={{
          color: '#1269e8',
          fontSize: 38,
        }}
      />

      <Typography
        sx={{
          mt: 0.6,
          color: '#111a38',
          fontSize: '1.05rem',
          fontWeight: 850,
        }}
      >
        Practice
      </Typography>

      <Typography
        sx={{
          mt: 0.4,
          maxWidth: 600,
          color: '#58657a',
          fontSize: '0.82rem',
          lineHeight: 1.5,
        }}
      >
        Practice database normalization with
        AI-generated questions and get instant
        feedback on your answers.
      </Typography>

      <Button
        variant="contained"
        onClick={handlePractice}
        sx={{
          mt: 1.3,
          borderRadius: 3,
          px: 3,
          textTransform: 'none',
          fontWeight: 800,
          boxShadow: 'none',
        }}
      >
        Start Practice
      </Button>
    </Box>
  </Box>
)}

            {activeTab === 3 && (
              <PlaceholderTab
                title="Assignment"
                description="Complete a practical database-design assignment to demonstrate this skill."
                icon={
                  <AssignmentOutlinedIcon />
                }
                buttonText="Start Assignment"
              />
            )}

            {activeTab === 4 && (
              <PlaceholderTab
                title="Lesson Assessment"
                description="Test your understanding before completing this learning module."
                icon={
                  <TrackChangesRoundedIcon />
                }
                buttonText="Start Assessment"
              />
            )}

            {activeTab === 5 && (
              <PlaceholderTab
                title="Additional Resources"
                description="CareerHarbor-curated documentation, articles, examples and learning resources will appear here."
                icon={
                  <MenuBookRoundedIcon />
                }
              />
            )}

            {activeTab === 6 && (
              <PlaceholderTab
                title="Discussion"
                description="Questions, AI tutor conversations and lesson discussions will appear here."
                icon={
                  <AutoAwesomeRoundedIcon />
                }
              />
            )}
          </Box>

          {/* BOTTOM ACTIONS */}

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            justifyContent="space-between"
            spacing={1.2}
            sx={{
              mt: 1.4,
            }}
          >
            <Button
              variant="outlined"
              startIcon={
                <ArrowBackRoundedIcon />
              }
              onClick={
                handlePreviousLesson
              }
              sx={navigationButtonSx}
            >
              Previous Lesson
            </Button>

            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={1.2}
            >
              <Button
                variant="contained"
                endIcon={
                  <CheckRoundedIcon />
                }
                onClick={
                  handleComplete
                }
                sx={{
                  minWidth: 240,
                  minHeight: 50,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 850,
                  boxShadow: 'none',
                  background:
                    'linear-gradient(90deg, #1269ef 0%, #075cff 100%)',
                }}
              >
                Mark as Complete
              </Button>

              <Button
                variant="outlined"
                endIcon={
                  <ArrowForwardRoundedIcon />
                }
                onClick={
                  handleNextLesson
                }
                sx={navigationButtonSx}
              >
                Next Lesson
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* RIGHT SIDEBAR */}

        <Stack spacing={2}>
          <ModuleLessonsCard />

          <ModuleProgressCard
            progress={moduleProgress}
            onPractice={
              handlePractice
            }
            onAssignment={
              handleAssignment
            }
            onAssessment={
              handleAssessment
            }
          />
        </Stack>
      </Box>
    </Box>
  );
};

/* ============================================
   YOUTUBE PLAYER
============================================ */

const YouTubeLessonPlayer = () => {
  if (youtubeVideoId) {
    return (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          overflow: 'hidden',
          borderRadius: 2.5,
          bgcolor: '#000',
        }}
      >
        <Box
          component="iframe"
          src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?rel=0`}
          title="Database Normalization lesson"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          sx={{
            width: '100%',
            height: '100%',
            border: 0,
          }}
        />
      </Box>
    );
  }

  /*
   * Safe empty state until an approved
   * YouTube resource is configured.
   */
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        overflow: 'hidden',
        borderRadius: 2.5,
        background:
          'linear-gradient(135deg, #103a78 0%, #081b43 100%)',
        color: '#fff',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Box>
        <YouTubeIcon
          sx={{
            color: '#ff0000',
            fontSize: 60,
          }}
        />

        <Typography
          sx={{
            mt: 0.8,
            fontSize: {
              xs: '1.15rem',
              md: '1.5rem',
            },
            fontWeight: 850,
          }}
        >
          Database Normalization
        </Typography>

        <Typography
          sx={{
            mt: 0.4,
            color:
              'rgba(255,255,255,0.78)',
            fontSize: '0.82rem',
          }}
        >
          Curated YouTube lesson will appear
          here.
        </Typography>
      </Box>
    </Box>
  );
};

/* ============================================
   LESSON INFO
============================================ */

const LessonInformation = () => (
  <Box
    sx={{
      px: {
        xs: 0.3,
        lg: 0.5,
      },
      py: 0.2,
    }}
  >
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Typography
        sx={{
          color: '#111a38',
          fontSize: '0.82rem',
          fontWeight: 850,
        }}
      >
        Lesson 3 of 5
      </Typography>

      <Stack
        direction="row"
        spacing={0.6}
      >
        <SmallCircleButton>
          <ChevronLeftRoundedIcon />
        </SmallCircleButton>

        <SmallCircleButton>
          <ChevronRightRoundedIcon />
        </SmallCircleButton>
      </Stack>
    </Stack>

    <Typography
      sx={{
        mt: 0.8,
        color: '#111a38',
        fontSize: {
          xs: '1.05rem',
          md: '1.18rem',
        },
        fontWeight: 900,
        lineHeight: 1.3,
      }}
    >
      Normalization &amp; Database Design
    </Typography>

    <Stack
      direction="row"
      spacing={2}
      useFlexGap
      flexWrap="wrap"
      sx={{
        mt: 1,
      }}
    >
      <LessonMeta
        icon={<PlayArrowRoundedIcon />}
        label="12 min"
      />

      <LessonMeta
        icon={
          <TrackChangesRoundedIcon />
        }
        label="Beginner"
      />

      <LessonMeta
        icon={<NotesRoundedIcon />}
        label="Notes"
      />
    </Stack>

    <Typography
      sx={{
        mt: 1.2,
        color: '#26324b',
        fontSize: '0.83rem',
        lineHeight: 1.5,
      }}
    >
      Learn what normalization is, its
      benefits, and how to design a clean,
      efficient database schema with real
      examples.
    </Typography>

    <Box
      sx={{
        mt: 1.25,
        border:
          '1px solid #f0d8aa',
        borderRadius: 2.5,
        bgcolor: '#fff9ef',
        p: 1.3,
      }}
    >
      <Stack
        direction="row"
        spacing={0.8}
        alignItems="center"
      >
        <EmojiEventsOutlinedIcon
          sx={{
            color: '#ef9300',
            fontSize: 23,
          }}
        />

        <Typography
          sx={{
            color: '#111a38',
            fontSize: '0.88rem',
            fontWeight: 850,
          }}
        >
          Key Takeaways
        </Typography>
      </Stack>

      <Stack
        spacing={0.55}
        sx={{
          mt: 0.8,
        }}
      >
        {takeaways.map(
          (takeaway) => (
            <Stack
              key={takeaway}
              direction="row"
              spacing={0.7}
              alignItems="flex-start"
            >
              <CheckRoundedIcon
                sx={{
                  color: '#18a63a',
                  fontSize: 19,
                }}
              />

              <Typography
                sx={{
                  color: '#202b43',
                  fontSize: '0.76rem',
                  lineHeight: 1.4,
                }}
              >
                {takeaway}
              </Typography>
            </Stack>
          ),
        )}
      </Stack>
    </Box>
  </Box>
);

/* ============================================
   OVERVIEW
============================================ */

const OverviewContent = () => (
  <Box>
    <Typography
      sx={{
        color: '#111a38',
        fontSize: '1.05rem',
        fontWeight: 850,
      }}
    >
      About this Lesson
    </Typography>

    <Typography
      sx={{
        mt: 0.4,
        maxWidth: 900,
        color: '#26324b',
        fontSize: '0.83rem',
        lineHeight: 1.55,
      }}
    >
      Normalization helps you organize data,
      reduce redundancy, and maintain data
      integrity. In this lesson, you&apos;ll
      learn the normalization forms, design
      principles, and see a practical example
      to build a clean database schema.
    </Typography>

    <Box
      sx={{
        mt: 1.4,
        border:
          '1px solid #d6c9ff',
        borderRadius: 2.5,
        bgcolor: '#f8f5ff',
        p: 1.5,
      }}
    >
      <Stack
        direction="row"
        spacing={0.8}
        alignItems="center"
      >
        <TrackChangesRoundedIcon
          sx={{
            color: '#5532ed',
          }}
        />

        <Typography
          sx={{
            color: '#111a38',
            fontWeight: 850,
          }}
        >
          Learning Objectives
        </Typography>
      </Stack>

      <Box
        sx={{
          mt: 1,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md:
              'repeat(2, minmax(0, 1fr))',
          },
          gap: 0.7,
        }}
      >
        {objectives.map(
          (objective) => (
            <Stack
              key={objective}
              direction="row"
              spacing={0.8}
              alignItems="flex-start"
            >
              <CheckRoundedIcon
                sx={{
                  color: '#19a63a',
                  fontSize: 20,
                }}
              />

              <Typography
                sx={{
                  color: '#202b43',
                  fontSize: '0.8rem',
                }}
              >
                {objective}
              </Typography>
            </Stack>
          ),
        )}
      </Box>
    </Box>
  </Box>
);

/* ============================================
   MODULE LESSONS
============================================ */

const ModuleLessonsCard = () => (
  <Box
    sx={{
      border:
        '1px solid #dce3ee',
      borderRadius: 3,
      bgcolor: '#fff',
      p: 1.8,
    }}
  >
    <Typography
      sx={{
        color: '#111a38',
        fontSize: '1.05rem',
        fontWeight: 900,
      }}
    >
      Module 2: Database &amp; Data Management
    </Typography>

    <Typography
      sx={{
        mt: 0.2,
        color: '#263858',
        fontSize: '0.78rem',
        fontWeight: 700,
      }}
    >
      4 / 5 Lessons
    </Typography>

    <Stack
      sx={{
        mt: 1.2,
      }}
    >
      {moduleLessons.map(
        (lesson, index) => (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            showLine={
              index <
              moduleLessons.length - 1
            }
          />
        ),
      )}
    </Stack>
  </Box>
);

interface LessonRowProps {
  lesson: ModuleLesson;
  showLine: boolean;
}

const LessonRow = ({
  lesson,
  showLine,
}: LessonRowProps) => {
  const completed =
    lesson.status === 'completed';

  const active =
    lesson.status === 'active';

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns:
          '38px minmax(0, 1fr) auto',
        gap: 0.8,
        alignItems: 'center',
        px: 0.8,
        py: 0.9,
        borderRadius: 2,
        bgcolor: active
          ? '#eaf1ff'
          : 'transparent',
      }}
    >
      {showLine && (
        <Box
          sx={{
            position: 'absolute',
            left: 25,
            top: 37,
            width: 2,
            height: 22,
            bgcolor: '#d9e0ea',
            zIndex: 0,
          }}
        />
      )}

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: 28,
          height: 28,
          borderRadius: '50%',
          bgcolor: completed
            ? '#20a83b'
            : active
              ? '#1269e8'
              : '#f1f3f6',
          color: completed || active
            ? '#fff'
            : '#69768b',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {completed ? (
          <CheckRoundedIcon
            sx={{
              fontSize: 18,
            }}
          />
        ) : active ? (
          <PlayArrowRoundedIcon
            sx={{
              fontSize: 18,
            }}
          />
        ) : (
          <LockOutlinedIcon
            sx={{
              fontSize: 16,
            }}
          />
        )}
      </Box>

      <Typography
        sx={{
          color: '#111a38',
          fontSize: '0.78rem',
          fontWeight: active
            ? 850
            : 650,
        }}
      >
        {lesson.title}
      </Typography>

      <Typography
        sx={{
          color: '#263858',
          fontSize: '0.72rem',
          whiteSpace: 'nowrap',
        }}
      >
        {lesson.duration}
      </Typography>
    </Box>
  );
};

/* ============================================
   MODULE PROGRESS
============================================ */

interface ModuleProgressCardProps {
  progress: number;
  onPractice: () => void;
  onAssignment: () => void;
  onAssessment: () => void;
}

const ModuleProgressCard = ({
  progress,
  onPractice,
  onAssignment,
  onAssessment,
}: ModuleProgressCardProps) => (
  <Box
    sx={{
      border:
        '1px solid #dce3ee',
      borderRadius: 3,
      bgcolor: '#fff',
      p: 1.8,
    }}
  >
    <Typography
      sx={{
        color: '#111a38',
        fontSize: '1.1rem',
        fontWeight: 900,
      }}
    >
      Your Progress in Module 2
    </Typography>

    <Divider
      sx={{
        my: 1.3,
      }}
    />

    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns:
          '120px minmax(0, 1fr)',
        gap: 1.5,
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 110,
          height: 110,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <CircularProgress
          variant="determinate"
          value={100}
          size={110}
          thickness={5}
          sx={{
            position: 'absolute',
            color: '#e8ebf0',
          }}
        />

        <CircularProgress
          variant="determinate"
          value={progress}
          size={110}
          thickness={5}
          sx={{
            position: 'absolute',
            color: '#18a93a',
            '& .MuiCircularProgress-circle':
              {
                strokeLinecap: 'round',
              },
          }}
        />

        <Typography
          sx={{
            color: '#111a38',
            fontSize: '1.6rem',
            fontWeight: 900,
          }}
        >
          {progress}%
        </Typography>
      </Box>

      <Stack spacing={1}>
        <ProgressLine
          icon={
            <CheckRoundedIcon />
          }
          label="Lessons"
          value="3 / 5"
          color="#18a93a"
        />

        <ProgressLine
          icon={<CodeRoundedIcon />}
          label="Practice"
          value="1 / 2"
          color="#1269e8"
          onClick={onPractice}
        />

        <ProgressLine
          icon={
            <AssignmentOutlinedIcon />
          }
          label="Assignment"
          value="0 / 1"
          color="#1269e8"
          onClick={onAssignment}
        />

        <ProgressLine
          icon={
            <EmojiEventsOutlinedIcon />
          }
          label="Module Test"
          value="Pending"
          color="#f0a000"
          onClick={onAssessment}
        />
      </Stack>
    </Box>
  </Box>
);

/* ============================================
   SMALL HELPERS
============================================ */

interface ProgressLineProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  onClick?: () => void;
}

const ProgressLine = ({
  icon,
  label,
  value,
  color,
  onClick,
}: ProgressLineProps) => (
  <Stack
    direction="row"
    spacing={0.8}
    alignItems="center"
    onClick={onClick}
    sx={{
      cursor: onClick
        ? 'pointer'
        : 'default',
    }}
  >
    <Box
      sx={{
        color,
        display: 'grid',
        placeItems: 'center',
        '& svg': {
          fontSize: 20,
        },
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        flex: 1,
        color: '#202b43',
        fontSize: '0.76rem',
        fontWeight: 650,
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        color: '#111a38',
        fontSize: '0.75rem',
        fontWeight: 800,
      }}
    >
      {value}
    </Typography>
  </Stack>
);

interface LessonMetaProps {
  icon: React.ReactNode;
  label: string;
}

const LessonMeta = ({
  icon,
  label,
}: LessonMetaProps) => (
  <Stack
    direction="row"
    spacing={0.45}
    alignItems="center"
  >
    <Box
      sx={{
        color: '#075fff',
        display: 'grid',
        placeItems: 'center',
        '& svg': {
          fontSize: 20,
        },
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        color: '#202b43',
        fontSize: '0.73rem',
        fontWeight: 650,
      }}
    >
      {label}
    </Typography>
  </Stack>
);

interface SmallCircleButtonProps {
  children: React.ReactNode;
}

const SmallCircleButton = ({
  children,
}: SmallCircleButtonProps) => (
  <Box
    sx={{
      width: 34,
      height: 34,
      borderRadius: '50%',
      bgcolor: '#f2f5fb',
      color: '#075fff',
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
      '& svg': {
        fontSize: 22,
      },
    }}
  >
    {children}
  </Box>
);

interface PlaceholderTabProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText?: string;
}

const PlaceholderTab = ({
  title,
  description,
  icon,
  buttonText,
}: PlaceholderTabProps) => (
  <Box
    sx={{
      minHeight: 160,
      display: 'grid',
      placeItems: 'center',
      textAlign: 'center',
      py: 2,
    }}
  >
    <Box>
      <Box
        sx={{
          color: '#1269e8',
          '& svg': {
            fontSize: 36,
          },
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          mt: 0.6,
          color: '#111a38',
          fontSize: '1.05rem',
          fontWeight: 850,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 0.4,
          maxWidth: 600,
          color: '#58657a',
          fontSize: '0.82rem',
          lineHeight: 1.5,
        }}
      >
        {description}
      </Typography>

      {buttonText && (
        <Button
          variant="contained"
          sx={{
            mt: 1.3,
            borderRadius: 3,
            px: 3,
            textTransform: 'none',
            fontWeight: 800,
            boxShadow: 'none',
          }}
        >
          {buttonText}
        </Button>
      )}
    </Box>
  </Box>
);

const navigationButtonSx = {
  minHeight: 50,
  px: 2.5,
  borderRadius: 3,
  textTransform: 'none',
  fontWeight: 850,
};