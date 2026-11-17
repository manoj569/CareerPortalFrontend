import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import InsertChartOutlinedRoundedIcon from '@mui/icons-material/InsertChartOutlinedRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import {
  Box,
  Button,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { type ReactNode, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type LessonStatus =
  | 'completed'
  | 'active'
  | 'available'
  | 'locked';

type Lesson = {
  id: number;
  title: string;
  duration: string;
  status: LessonStatus;
};

const lessons: Lesson[] = [
  {
    id: 1,
    title: 'Introduction to State Management',
    duration: '10:24',
    status: 'completed',
  },
  {
    id: 2,
    title: 'Using Context API',
    duration: '14:36',
    status: 'active',
  },
  {
    id: 3,
    title: 'Building a Global State',
    duration: '18:20',
    status: 'available',
  },
  {
    id: 4,
    title: 'Best Practices & Interview Tips',
    duration: '12:18',
    status: 'locked',
  },
];

const learningPoints = [
  'What is Context API and why to use it',
  'Creating and using a Context',
  'Consuming context in components',
  'When to use Context vs other state solutions',
];

const contextExample = `import { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Dashboard />
    </ThemeContext.Provider>
  );
}

function Dashboard() {
  const theme = useContext(ThemeContext);

  return <div>Current theme: {theme}</div>;
}`;

const Panel = ({
  children,
}: {
  children: ReactNode;
}) => (
  <Box
    sx={{
      bgcolor: '#fff',
      border: '1px solid #e3e8f0',
      borderRadius: 3,
      p: {
        xs: 2,
        md: 2.2,
      },
      boxShadow:
        '0 4px 16px rgba(15,23,42,0.035)',
    }}
  >
    {children}
  </Box>
);

export const SkillLearningModulePage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [activeTab, setActiveTab] =
    useState(0);

  /*
   * TEMPORARY FRONTEND DATA
   *
   * Later load this from the learning-content
   * and learner-progress APIs.
   */
  const skillName = 'React';
  const moduleName = 'State Management';
  const currentLesson = 2;
  const totalLessons = 4;
  const lessonProgress = 25;

  const navigateToScreen = (
    screen: string,
  ) => {
    const params =
      new URLSearchParams(searchParams);

    params.set('type', 'skill');
    params.set('screen', screen);

    setSearchParams(params);
  };

  const handleBackToModule = () => {
    const params =
      new URLSearchParams(searchParams);

    params.set('type', 'skill');
    params.set('screen', 'skill-learning');
    params.set('module', '1');
    params.delete('lesson');

    setSearchParams(params);
  };

  const handlePreviousLesson = () => {
    const params =
      new URLSearchParams(searchParams);

    params.set('type', 'skill');
    params.set('screen', 'skill-learning');
    params.set('module', '1');
    params.set('lesson', '1');

    setSearchParams(params);
  };

  const handleCompleteAndNext = () => {
    /*
     * S9 - Skill Practice.
     *
     * TODO BACKEND:
     * Mark lesson 2 as completed before
     * navigating to practice.
     */
    const params =
      new URLSearchParams(searchParams);

    params.set('type', 'skill');
    params.set('screen', 'skill-practice');
    params.set('module', '1');
    params.set('lesson', '2');

    setSearchParams(params);
  };

  const handleStartPractice = () => {
    navigateToScreen('skill-practice');
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
      {/* Breadcrumb */}
      <Stack
        direction="row"
        spacing={0.8}
        useFlexGap
        flexWrap="wrap"
        alignItems="center"
        sx={{ mb: 1.5 }}
      >
        {[
          'AI Accelerator',
          'Skill Paths',
          skillName,
          'Module 1',
        ].map((item) => (
          <Stack
            key={item}
            direction="row"
            spacing={0.8}
            alignItems="center"
          >
            <Typography
              sx={{
                color: '#475467',
                fontSize: '0.76rem',
                fontWeight: 700,
              }}
            >
              {item}
            </Typography>

            <Typography
              sx={{
                color: '#98a2b3',
                fontSize: '0.8rem',
              }}
            >
              ›
            </Typography>
          </Stack>
        ))}

        <Typography
          sx={{
            color: '#172033',
            fontSize: '0.76rem',
            fontWeight: 900,
          }}
        >
          Lesson 2
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '240px minmax(0, 1fr)',
          },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {/* LEFT LESSON NAVIGATION */}
        <Box
          sx={{
            display: {
              xs: 'none',
              lg: 'block',
            },
            position: 'sticky',
            top: 90,
          }}
        >
          <Button
            startIcon={
              <ArrowBackRoundedIcon />
            }
            onClick={handleBackToModule}
            sx={{
              px: 0,
              mb: 2,
              color: '#344054',
              textTransform: 'none',
              fontWeight: 800,
              '&:hover': {
                bgcolor: 'transparent',
                color: '#5138e8',
              },
            }}
          >
            Back to Module
          </Button>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <LayersRoundedIcon
              sx={{
                color: '#563cf0',
              }}
            />

            <Typography
              sx={{
                color: '#172033',
                fontWeight: 900,
                fontSize: '0.92rem',
              }}
            >
              {skillName} – {moduleName}
            </Typography>
          </Stack>

          <Typography
            sx={{
              mt: 1.5,
              color: '#172033',
              fontWeight: 800,
              fontSize: '0.75rem',
            }}
          >
            25% (1 of 4 Lessons)
          </Typography>

          <LinearProgress
            variant="determinate"
            value={lessonProgress}
            sx={{
              mt: 0.8,
              mb: 2.2,
              height: 8,
              borderRadius: 99,
              bgcolor: '#e1e5ed',
              '& .MuiLinearProgress-bar': {
                borderRadius: 99,
                bgcolor: '#0daf7d',
              },
            }}
          />

          <Stack spacing={0.8}>
            {lessons.map((lesson) => {
              const active =
                lesson.status === 'active';

              const completed =
                lesson.status === 'completed';

              return (
                <Box
                  key={lesson.id}
                  sx={{
                    p: 1.15,
                    borderRadius: 2,
                    bgcolor: active
                      ? '#f0edff'
                      : 'transparent',
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        width: 31,
                        height: 31,
                        flexShrink: 0,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: completed
                          ? '#dff8ea'
                          : active
                            ? '#e3ddff'
                            : '#f0f2f6',
                        color: completed
                          ? '#0b9568'
                          : active
                            ? '#5138e8'
                            : '#344054',
                        fontWeight: 900,
                        fontSize: '0.74rem',
                      }}
                    >
                      {lesson.id}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          color: active
                            ? '#5138e8'
                            : '#172033',
                          fontWeight: active
                            ? 900
                            : 750,
                          fontSize: '0.73rem',
                          lineHeight: 1.35,
                        }}
                      >
                        {lesson.title}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.15,
                          color: '#98a2b3',
                          fontSize: '0.62rem',
                        }}
                      >
                        {lesson.duration}
                      </Typography>
                    </Box>

                    {completed && (
                      <CheckCircleRoundedIcon
                        sx={{
                          color: '#0daf7d',
                          fontSize: 19,
                        }}
                      />
                    )}

                    {active && (
                      <PlayArrowRoundedIcon
                        sx={{
                          color: '#563cf0',
                          fontSize: 20,
                        }}
                      />
                    )}

                    {lesson.status ===
                      'locked' && (
                      <LockRoundedIcon
                        sx={{
                          color: '#667085',
                          fontSize: 17,
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Box>

        {/* PAGE CONTENT */}
        <Box>
          {/* HERO */}
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 3.5,
              color: '#fff',
              background:
                'linear-gradient(110deg, #292678 0%, #4338ca 52%, #654de3 100%)',
              px: {
                xs: 2,
                md: 2.8,
              },
              py: 2.2,
            }}
          >
            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              justifyContent="space-between"
              spacing={2}
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 66,
                    height: 66,
                    borderRadius: 2.5,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor:
                      'rgba(255,255,255,0.11)',
                    border:
                      '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <LayersRoundedIcon
                    sx={{
                      color: '#fff',
                      fontSize: 38,
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    component="h1"
                    sx={{
                      fontWeight: 950,
                      fontSize: {
                        xs: '1.35rem',
                        md: '1.75rem',
                      },
                    }}
                  >
                    Module 1: {moduleName}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.4,
                      color:
                        'rgba(255,255,255,0.88)',
                      fontSize: '0.85rem',
                    }}
                  >
                    Lesson {currentLesson} of{' '}
                    {totalLessons} &nbsp;•&nbsp;
                    Using Context API
                  </Typography>
                </Box>
              </Stack>

              <Box
                sx={{
                  minWidth: {
                    xs: '100%',
                    sm: 160,
                  },
                }}
              >
                <Typography
                  sx={{
                    display: 'inline-block',
                    px: 1.3,
                    py: 0.5,
                    borderRadius: 99,
                    bgcolor: '#dcf8ea',
                    color: '#087a52',
                    fontWeight: 900,
                    fontSize: '0.7rem',
                  }}
                >
                  In Progress
                </Typography>

                <Typography
                  sx={{
                    mt: 0.8,
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.7rem',
                  }}
                >
                  {lessonProgress}% Complete
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={lessonProgress}
                  sx={{
                    mt: 0.6,
                    height: 8,
                    borderRadius: 99,
                    bgcolor:
                      'rgba(255,255,255,0.25)',
                    '& .MuiLinearProgress-bar':
                      {
                        borderRadius: 99,
                        bgcolor: '#0daf7d',
                      },
                  }}
                />
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              mt: 2,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                xl: 'minmax(0, 2fr) minmax(270px, 0.75fr)',
              },
              gap: 2,
              alignItems: 'start',
            }}
          >
            {/* CENTER */}
            <Stack spacing={2}>
              {/* VIDEO PLACEHOLDER */}
              <Box
                sx={{
                  position: 'relative',
                  minHeight: {
                    xs: 280,
                    md: 390,
                  },
                  borderRadius: 2.8,
                  overflow: 'hidden',
                  background:
                    'linear-gradient(135deg, #07315d 0%, #10467d 45%, #282087 100%)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Stack
                  spacing={0.7}
                  alignItems="center"
                >
                  <CodeRoundedIcon
                    sx={{
                      color: '#31d9ed',
                      fontSize: {
                        xs: 75,
                        md: 105,
                      },
                    }}
                  />

                  <Typography
                    sx={{
                      color: '#fff',
                      fontWeight: 950,
                      fontSize: {
                        xs: '2rem',
                        md: '3.2rem',
                      },
                    }}
                  >
                    React
                  </Typography>

                  <Typography
                    sx={{
                      px: 2.5,
                      py: 0.6,
                      borderRadius: 2,
                      bgcolor:
                        'rgba(111,61,242,0.9)',
                      color: '#fff',
                      fontWeight: 900,
                      fontSize: {
                        xs: '1.15rem',
                        md: '1.7rem',
                      },
                    }}
                  >
                    Context API
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor:
                        'rgba(5,17,45,0.78)',
                      border:
                        '2px solid rgba(255,255,255,0.7)',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <PlayArrowRoundedIcon
                      sx={{
                        ml: 0.5,
                        fontSize: 42,
                      }}
                    />
                  </Box>
                </Box>

                {/* controls */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    px: 2,
                    py: 1.2,
                    bgcolor:
                      'rgba(4,15,36,0.76)',
                  }}
                >
                  <Box
                    sx={{
                      height: 4,
                      borderRadius: 99,
                      bgcolor:
                        'rgba(255,255,255,0.5)',
                    }}
                  >
                    <Box
                      sx={{
                        width: '3%',
                        height: '100%',
                        bgcolor: '#6d42f5',
                      }}
                    />
                  </Box>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mt: 0.7 }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <PlayArrowRoundedIcon
                        sx={{
                          color: '#fff',
                          fontSize: 20,
                        }}
                      />

                      <Typography
                        sx={{
                          color: '#fff',
                          fontSize: '0.7rem',
                        }}
                      >
                        0:00 / 14:36
                      </Typography>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1.3}
                    >
                      <VolumeUpRoundedIcon
                        sx={{
                          color: '#fff',
                          fontSize: 19,
                        }}
                      />

                      <SettingsRoundedIcon
                        sx={{
                          color: '#fff',
                          fontSize: 19,
                        }}
                      />
                    </Stack>
                  </Stack>
                </Box>
              </Box>

              {/* TABS */}
              <Box>
                <Tabs
                  value={activeTab}
                  onChange={(_, value) =>
                    setActiveTab(value)
                  }
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    minHeight: 46,
                    borderBottom:
                      '1px solid #e4e8ef',
                    '& .MuiTab-root': {
                      minHeight: 46,
                      textTransform: 'none',
                      fontWeight: 850,
                      fontSize: '0.76rem',
                    },
                  }}
                >
                  <Tab
                    icon={
                      <MenuBookRoundedIcon />
                    }
                    iconPosition="start"
                    label="Overview"
                  />

                  <Tab
                    icon={
                      <CodeRoundedIcon />
                    }
                    iconPosition="start"
                    label="Code Example"
                  />

                  <Tab
                    icon={
                      <TrackChangesRoundedIcon />
                    }
                    iconPosition="start"
                    label="Practice"
                  />

                  <Tab
                    icon={
                      <NotesRoundedIcon />
                    }
                    iconPosition="start"
                    label="Notes"
                  />

                  <Tab
                    icon={<QuizRoundedIcon />}
                    iconPosition="start"
                    label="Q&A"
                  />
                </Tabs>

                {/* OVERVIEW */}
                {activeTab === 0 && (
                  <Box
                    sx={{
                      mt: 1.7,
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        md: '1fr 1fr',
                      },
                      gap: 1.5,
                    }}
                  >
                    <Panel>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <TrackChangesRoundedIcon
                          sx={{
                            color: '#5138e8',
                          }}
                        />

                        <Typography
                          sx={{
                            color: '#172033',
                            fontWeight: 900,
                            fontSize: '1rem',
                          }}
                        >
                          What You&apos;ll Learn
                        </Typography>
                      </Stack>

                      <Stack
                        spacing={1}
                        sx={{ mt: 1.5 }}
                      >
                        {learningPoints.map(
                          (point) => (
                            <Stack
                              key={point}
                              direction="row"
                              spacing={1}
                              alignItems="flex-start"
                            >
                              <CheckCircleRoundedIcon
                                sx={{
                                  mt: '2px',
                                  color:
                                    '#0daf7d',
                                  fontSize: 19,
                                }}
                              />

                              <Typography
                                sx={{
                                  color:
                                    '#344054',
                                  fontSize:
                                    '0.77rem',
                                  lineHeight:
                                    1.45,
                                }}
                              >
                                {point}
                              </Typography>
                            </Stack>
                          ),
                        )}
                      </Stack>
                    </Panel>

                    <Panel>
                      <Typography
                        sx={{
                          color: '#172033',
                          fontWeight: 900,
                          fontSize: '0.92rem',
                        }}
                      >
                        Example: Create & Use
                        Context
                      </Typography>

                      <Box
                        component="pre"
                        sx={{
                          mt: 1.2,
                          mb: 0,
                          p: 1.5,
                          overflowX: 'auto',
                          borderRadius: 2,
                          bgcolor: '#f7f6fc',
                          color: '#172033',
                          fontFamily:
                            'Consolas, Monaco, monospace',
                          fontSize: '0.68rem',
                          lineHeight: 1.55,
                          whiteSpace: 'pre',
                        }}
                      >
                        {contextExample}
                      </Box>
                    </Panel>
                  </Box>
                )}

                {/* CODE */}
                {activeTab === 1 && (
                  <Panel>
                    <Typography
                      sx={{
                        color: '#172033',
                        fontWeight: 900,
                      }}
                    >
                      Context API Code Example
                    </Typography>

                    <Box
                      component="pre"
                      sx={{
                        mt: 1.3,
                        mb: 0,
                        p: 2,
                        overflowX: 'auto',
                        borderRadius: 2,
                        bgcolor: '#111827',
                        color: '#e5e7eb',
                        fontFamily:
                          'Consolas, Monaco, monospace',
                        fontSize: '0.74rem',
                        lineHeight: 1.65,
                      }}
                    >
                      {contextExample}
                    </Box>
                  </Panel>
                )}

                {/* PRACTICE */}
                {activeTab === 2 && (
                  <Panel>
                    <Typography
                      sx={{
                        color: '#172033',
                        fontWeight: 900,
                      }}
                    >
                      Context API Practice
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.8,
                        color: '#667085',
                        fontSize: '0.8rem',
                        lineHeight: 1.6,
                      }}
                    >
                      Create a small theme
                      context and consume it from
                      a child component.
                    </Typography>

                    <Button
                      variant="contained"
                      endIcon={
                        <ArrowForwardRoundedIcon />
                      }
                      onClick={
                        handleStartPractice
                      }
                      sx={{
                        mt: 1.5,
                        textTransform: 'none',
                        fontWeight: 850,
                        borderRadius: 2,
                        boxShadow: 'none',
                      }}
                    >
                      Start Practice
                    </Button>
                  </Panel>
                )}

                {/* NOTES */}
                {activeTab === 3 && (
                  <Panel>
                    <Typography
                      sx={{
                        color: '#172033',
                        fontWeight: 900,
                      }}
                    >
                      My Notes
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.8,
                        color: '#667085',
                        fontSize: '0.8rem',
                      }}
                    >
                      Note saving will be
                      connected to the learning
                      backend later.
                    </Typography>
                  </Panel>
                )}

                {/* Q&A */}
                {activeTab === 4 && (
                  <Panel>
                    <Typography
                      sx={{
                        color: '#172033',
                        fontWeight: 900,
                      }}
                    >
                      Lesson Q&amp;A
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.8,
                        color: '#667085',
                        fontSize: '0.8rem',
                      }}
                    >
                      AI Tutor / lesson Q&amp;A
                      will be connected when the
                      learning assistant API is
                      available.
                    </Typography>
                  </Panel>
                )}
              </Box>
            </Stack>

            {/* RIGHT */}
            <Stack spacing={2}>
              {/* PROGRESS */}
              <Panel>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <InsertChartOutlinedRoundedIcon
                    sx={{
                      color: '#5138e8',
                    }}
                  />

                  <Typography
                    sx={{
                      color: '#172033',
                      fontWeight: 900,
                      fontSize: '1rem',
                    }}
                  >
                    Lesson Progress
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{ mt: 1.6 }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      width: 92,
                      height: 92,
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        background: `conic-gradient(
                          #0daf7d 0% ${lessonProgress}%,
                          #e1e5ed ${lessonProgress}% 100%
                        )`,
                      }}
                    />

                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 11,
                        borderRadius: '50%',
                        bgcolor: '#fff',
                      }}
                    />

                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#0aaa79',
                          fontWeight: 950,
                          fontSize: '1.3rem',
                        }}
                      >
                        {lessonProgress}%
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        color: '#172033',
                        fontWeight: 850,
                        fontSize: '0.75rem',
                      }}
                    >
                      1 of 4 Lessons Completed
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={lessonProgress}
                      sx={{
                        mt: 1,
                        height: 8,
                        borderRadius: 99,
                        bgcolor: '#e3e7ed',
                        '& .MuiLinearProgress-bar':
                          {
                            borderRadius: 99,
                            bgcolor: '#0daf7d',
                          },
                      }}
                    />
                  </Box>
                </Stack>
              </Panel>

              {/* RESOURCES */}
              <Panel>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <DescriptionRoundedIcon
                    sx={{
                      color: '#5138e8',
                    }}
                  />

                  <Typography
                    sx={{
                      color: '#172033',
                      fontWeight: 900,
                      fontSize: '1rem',
                    }}
                  >
                    Lesson Resources
                  </Typography>
                </Stack>

                <Stack
                  spacing={1}
                  sx={{ mt: 1.5 }}
                >
                  <ResourceRow
                    icon={
                      <DescriptionRoundedIcon />
                    }
                    title="Context API Cheatsheet"
                    action={
                      <DownloadRoundedIcon />
                    }
                  />

                  <ResourceRow
                    icon={
                      <CodeRoundedIcon />
                    }
                    title="Example Code"
                    action={
                      <OpenInNewRoundedIcon />
                    }
                  />

                  <ResourceRow
                    icon={
                      <LinkRoundedIcon />
                    }
                    title="React Context Documentation"
                    action={
                      <OpenInNewRoundedIcon />
                    }
                  />
                </Stack>

                <Typography
                  sx={{
                    mt: 1.3,
                    color: '#98a2b3',
                    fontSize: '0.64rem',
                    lineHeight: 1.45,
                  }}
                >
                  Resource URLs are not connected
                  yet. No fake download or
                  external links are used.
                </Typography>
              </Panel>

              {/* PRACTICE */}
              <Panel>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <CodeRoundedIcon
                    sx={{
                      color: '#5138e8',
                    }}
                  />

                  <Typography
                    sx={{
                      color: '#172033',
                      fontWeight: 900,
                      fontSize: '1rem',
                    }}
                  >
                    Quick Practice
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    mt: 1.2,
                    color: '#344054',
                    fontSize: '0.78rem',
                    lineHeight: 1.5,
                  }}
                >
                  Try a small exercise to apply
                  Context API.
                </Typography>

                <Button
                  fullWidth
                  variant="outlined"
                  endIcon={
                    <ArrowForwardRoundedIcon />
                  }
                  onClick={
                    handleStartPractice
                  }
                  sx={{
                    mt: 1.4,
                    minHeight: 44,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 850,
                  }}
                >
                  Start Practice
                </Button>
              </Panel>
            </Stack>
          </Box>

          {/* BOTTOM NAVIGATION */}
          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            justifyContent="space-between"
            spacing={1.5}
            sx={{
              mt: 2.5,
              pt: 2,
              borderTop:
                '1px solid #e5e9ef',
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
              sx={{
                minHeight: 48,
                px: 3,
                borderRadius: 2.2,
                textTransform: 'none',
                fontWeight: 850,
              }}
            >
              Previous Lesson
            </Button>

            <Button
              variant="contained"
              endIcon={
                <ArrowForwardRoundedIcon />
              }
              onClick={
                handleCompleteAndNext
              }
              sx={{
                minHeight: 50,
                minWidth: {
                  xs: '100%',
                  sm: 310,
                },
                px: 3,
                borderRadius: 2.2,
                textTransform: 'none',
                fontWeight: 900,
                boxShadow: 'none',
                background:
                  'linear-gradient(90deg, #6134f3, #5138e8)',
              }}
            >
              Mark as Complete &amp; Next
            </Button>
          </Stack>

          <Typography
            sx={{
              mt: 1.2,
              textAlign: 'center',
              color: '#98a2b3',
              fontSize: '0.67rem',
            }}
          >
            Lesson video, progress and resource
            information are temporary frontend
            values until the Skill Path learning
            APIs are connected.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const ResourceRow = ({
  icon,
  title,
  action,
}: {
  icon: ReactNode;
  title: string;
  action: ReactNode;
}) => (
  <Stack
    direction="row"
    spacing={1}
    alignItems="center"
    sx={{
      py: 1,
      borderBottom:
        '1px solid #edf0f4',
    }}
  >
    <Box
      sx={{
        width: 30,
        height: 30,
        flexShrink: 0,
        borderRadius: 1.5,
        display: 'grid',
        placeItems: 'center',
        bgcolor: '#f1efff',
        color: '#563cf0',
        '& svg': {
          fontSize: 18,
        },
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        flex: 1,
        color: '#172033',
        fontWeight: 750,
        fontSize: '0.72rem',
      }}
    >
      {title}
    </Typography>

    <Box
      sx={{
        color: '#563cf0',
        display: 'grid',
        placeItems: 'center',
        '& svg': {
          fontSize: 18,
        },
      }}
    >
      {action}
    </Box>
  </Stack>
);