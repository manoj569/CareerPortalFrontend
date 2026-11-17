import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
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
import {
  type ReactNode,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

type ModuleStatus =
  | 'active'
  | 'locked'
  | 'completed';

type LearningModule = {
  id: number;
  title: string;
  lessons: number;
  hours: number;
  status: ModuleStatus;
};

type Lesson = {
  id: number;
  title: string;
  duration: string;
  completed: boolean;
  active: boolean;
};

const modules: LearningModule[] = [
  {
    id: 1,
    title: 'State Management',
    lessons: 4,
    hours: 3,
    status: 'active',
  },
  {
    id: 2,
    title: 'Working with APIs',
    lessons: 5,
    hours: 4,
    status: 'locked',
  },
  {
    id: 3,
    title: 'Advanced React Patterns',
    lessons: 4,
    hours: 3,
    status: 'locked',
  },
  {
    id: 4,
    title: 'Testing in React',
    lessons: 3,
    hours: 2,
    status: 'locked',
  },
  {
    id: 5,
    title: 'Performance & Optimization',
    lessons: 4,
    hours: 3,
    status: 'locked',
  },
  {
    id: 6,
    title: 'Build & Deployment',
    lessons: 3,
    hours: 2,
    status: 'locked',
  },
];

const lessons: Lesson[] = [
  {
    id: 1,
    title:
      'Introduction to State Management',
    duration: '10:24',
    completed: false,
    active: true,
  },
  {
    id: 2,
    title: 'Using Context API',
    duration: '14:36',
    completed: false,
    active: false,
  },
  {
    id: 3,
    title: 'Building a Global State',
    duration: '18:20',
    completed: false,
    active: false,
  },
  {
    id: 4,
    title:
      'Best Practices & Interview Tips',
    duration: '12:18',
    completed: false,
    active: false,
  },
];

const learningObjectives = [
  'What is state management and why it matters',
  'Common challenges with state in React',
  'Different state management approaches (useState, Context API, etc.)',
  'When to choose each approach',
];

const takeaways = [
  'State management helps maintain predictable and scalable applications.',
  'React provides multiple ways to manage state, including useState and Context API.',
  'Choose the right approach based on your application size and complexity.',
];

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

export const SkillActiveLearningPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [activeTab, setActiveTab] =
    useState(0);

  /*
   * TEMPORARY FRONTEND DATA
   *
   * Later these values should come from:
   * - selected skill path
   * - generated roadmap
   * - module/lesson content API
   * - learner progress API
   */
  const skillName = 'React';
  const moduleName = 'State Management';

  const overallProgress = 17;
  const moduleProgress = 25;

//   const navigateToScreen = (
//     screen: string,
//   ) => {
//     const params =
//       new URLSearchParams(searchParams);

//     params.set('type', 'skill');
//     params.set('screen', screen);

//     setSearchParams(params);
//   };

  const handleBackToRoadmap = () => {
    const params =
      new URLSearchParams(searchParams);

    params.set('type', 'skill');
    params.set('screen', 'skill-roadmap');
    params.delete('module');
    params.delete('lesson');

    setSearchParams(params);
  };

  const handleNextLesson = () => {
    /*
     * S8 - Learning Module / lesson experience.
     *
     * Later the backend should mark the current
     * lesson progress before navigation.
     */
    const params =
      new URLSearchParams(searchParams);

    params.set('type', 'skill');
    params.set(
      'screen',
      'skill-learning-module',
    );
    params.set('module', '1');
    params.set('lesson', '2');

    setSearchParams(params);
  };

  const handlePreviousLesson = () => {
    handleBackToRoadmap();
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
      {/* Back */}
      <Button
        startIcon={
          <ArrowBackRoundedIcon />
        }
        onClick={handleBackToRoadmap}
        sx={{
          mb: 2,
          px: 0,
          minWidth: 0,
          color: '#46536a',
          textTransform: 'none',
          fontWeight: 750,
          '&:hover': {
            bgcolor: 'transparent',
            color: '#4338ca',
          },
        }}
      >
        Back to Learning Roadmap
      </Button>

      {/* Header */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3.5,
          color: '#fff',
          background:
            'linear-gradient(110deg, #302b87 0%, #4338ca 55%, #6651e8 100%)',
          px: {
            xs: 2,
            md: 2.8,
          },
          py: 2.2,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 220,
            height: 220,
            right: -60,
            top: -120,
            borderRadius: '50%',
            bgcolor:
              'rgba(255,255,255,0.06)',
          }}
        />

        <Stack
          direction={{
            xs: 'column',
            md: 'row',
          }}
          justifyContent="space-between"
          alignItems={{
            xs: 'flex-start',
            md: 'center',
          }}
          spacing={2}
          sx={{
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Stack
            direction="row"
            spacing={1.7}
            alignItems="center"
          >
            <Box
              sx={{
                width: 66,
                height: 66,
                flexShrink: 0,
                borderRadius: 2.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor:
                  'rgba(255,255,255,0.12)',
              }}
            >
              <MenuBookRoundedIcon
                sx={{
                  fontSize: 36,
                  color: '#fff',
                }}
              />
            </Box>

            <Box>
              <Typography
                component="h1"
                sx={{
                  fontWeight: 900,
                  fontSize: {
                    xs: '1.35rem',
                    md: '1.65rem',
                  },
                  letterSpacing:
                    '-0.025em',
                }}
              >
                Module 1: {moduleName}
              </Typography>

              <Typography
                sx={{
                  mt: 0.45,
                  color:
                    'rgba(255,255,255,0.87)',
                  fontSize: '0.85rem',
                }}
              >
                Learn how to manage and share
                state effectively in React
                applications.
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              minWidth: {
                xs: '100%',
                md: 170,
              },
            }}
          >
            <Typography
              sx={{
                display: 'inline-block',
                px: 1.3,
                py: 0.5,
                borderRadius: 99,
                bgcolor: '#dff8ea',
                color: '#09865c',
                fontWeight: 850,
                fontSize: '0.7rem',
              }}
            >
              In Progress
            </Typography>

            <Typography
              sx={{
                mt: 0.7,
                color:
                  'rgba(255,255,255,0.9)',
                fontSize: '0.7rem',
              }}
            >
              1 of 4 Lessons
            </Typography>

            <LinearProgress
              variant="determinate"
              value={moduleProgress}
              sx={{
                mt: 0.6,
                height: 8,
                borderRadius: 99,
                bgcolor:
                  'rgba(255,255,255,0.25)',
                '& .MuiLinearProgress-bar':
                  {
                    borderRadius: 99,
                    bgcolor: '#17c982',
                  },
              }}
            />
          </Box>
        </Stack>
      </Box>

      {/* Main grid */}
      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl: 'minmax(0, 2.1fr) minmax(300px, 0.9fr)',
          },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {/* Main lesson */}
        <Panel>
          <Typography
            sx={{
              color: '#111827',
              fontWeight: 950,
              fontSize: {
                xs: '1.25rem',
                md: '1.55rem',
              },
              lineHeight: 1.2,
            }}
          >
            Lesson 1: Introduction to State
            Management
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              color: '#475467',
              fontSize: '0.85rem',
              lineHeight: 1.5,
            }}
          >
            Understand why state management is
            important and explore different
            approaches in React.
          </Typography>

          {/* Video placeholder */}
          <Box
            sx={{
              mt: 1.8,
              position: 'relative',
              minHeight: {
                xs: 250,
                md: 370,
              },
              borderRadius: 2.5,
              overflow: 'hidden',
              background:
                'linear-gradient(135deg, #07305b 0%, #0b4279 45%, #282088 100%)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                width: 260,
                height: 260,
                left: -50,
                top: -80,
                transform:
                  'rotate(45deg)',
                bgcolor:
                  'rgba(255,255,255,0.025)',
              }}
            />

            <Stack
              spacing={1}
              alignItems="center"
              sx={{
                position: 'relative',
                zIndex: 1,
              }}
            >
              <CodeRoundedIcon
                sx={{
                  color: '#3fe3f3',
                  fontSize: {
                    xs: 70,
                    md: 100,
                  },
                }}
              />

              <Typography
                sx={{
                  color: '#fff',
                  fontWeight: 950,
                  fontSize: {
                    xs: '2rem',
                    md: '3rem',
                  },
                }}
              >
                {skillName}
              </Typography>

              <Typography
                sx={{
                  px: 2.5,
                  py: 0.6,
                  borderRadius: 2,
                  color: '#fff',
                  bgcolor:
                    'rgba(112,61,242,0.85)',
                  fontWeight: 850,
                  fontSize: {
                    xs: '1rem',
                    md: '1.45rem',
                  },
                }}
              >
                {moduleName}
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
                  mt: 3,
                  width: 74,
                  height: 74,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor:
                    'rgba(8,18,46,0.8)',
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

            {/* fake controls */}
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                px: 2,
                py: 1.2,
                bgcolor:
                  'rgba(4,15,36,0.75)',
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
                    width: '5%',
                    height: '100%',
                    borderRadius: 99,
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
                    0:00 / 10:24
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  spacing={1.2}
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

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, value) =>
              setActiveTab(value)
            }
            sx={{
              mt: 1.4,
              minHeight: 44,
              borderBottom:
                '1px solid #e6e9ef',
              '& .MuiTab-root': {
                minHeight: 44,
                textTransform: 'none',
                fontWeight: 800,
                fontSize: '0.78rem',
              },
            }}
          >
            <Tab label="Overview" />
            <Tab label="Notes" />
            <Tab label="Resources (3)" />
          </Tabs>

          {/* Overview */}
          {activeTab === 0 && (
            <Box
              sx={{
                mt: 1.6,
                border:
                  '1px solid #e3e8f0',
                borderRadius: 2.5,
                p: 2,
              }}
            >
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
                  What You&apos;ll Learn in This
                  Lesson
                </Typography>
              </Stack>

              <Stack
                spacing={0.9}
                sx={{ mt: 1.4 }}
              >
                {learningObjectives.map(
                  (objective) => (
                    <Stack
                      key={objective}
                      direction="row"
                      spacing={1}
                      alignItems="flex-start"
                    >
                      <CheckCircleRoundedIcon
                        sx={{
                          mt: '2px',
                          color: '#0daf7d',
                          fontSize: 19,
                        }}
                      />

                      <Typography
                        sx={{
                          color: '#344054',
                          fontSize: '0.78rem',
                          lineHeight: 1.45,
                        }}
                      >
                        {objective}
                      </Typography>
                    </Stack>
                  ),
                )}
              </Stack>
            </Box>
          )}

          {/* Notes */}
          {activeTab === 1 && (
            <Box
              sx={{
                mt: 1.6,
                p: 2,
                border:
                  '1px solid #e3e8f0',
                borderRadius: 2.5,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <NotesRoundedIcon
                  sx={{
                    color: '#5138e8',
                  }}
                />

                <Typography
                  sx={{
                    color: '#172033',
                    fontWeight: 900,
                  }}
                >
                  Lesson Notes
                </Typography>
              </Stack>

              <Typography
                sx={{
                  mt: 1,
                  color: '#667085',
                  fontSize: '0.8rem',
                  lineHeight: 1.6,
                }}
              >
                Your lesson notes will appear
                here. Note saving will be
                connected when the learning
                content API is implemented.
              </Typography>
            </Box>
          )}

          {/* Resources */}
          {activeTab === 2 && (
            <Box
              sx={{
                mt: 1.6,
                p: 2,
                border:
                  '1px solid #e3e8f0',
                borderRadius: 2.5,
              }}
            >
              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 900,
                }}
              >
                Lesson Resources
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: '#667085',
                  fontSize: '0.8rem',
                  lineHeight: 1.6,
                }}
              >
                Resource links are intentionally
                not fabricated. Real learning
                resources will be loaded from
                the backend.
              </Typography>
            </Box>
          )}

          {/* Buttons */}
          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            justifyContent="space-between"
            spacing={1.5}
            sx={{
              mt: 2,
              pt: 1.8,
              borderTop:
                '1px solid #e8ebf0',
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
              onClick={handleNextLesson}
              sx={{
                minHeight: 48,
                minWidth: {
                  xs: '100%',
                  sm: 190,
                },
                borderRadius: 2.2,
                textTransform: 'none',
                fontWeight: 850,
                boxShadow: 'none',
                background:
                  'linear-gradient(90deg, #6134f3, #5138e8)',
              }}
            >
              Next Lesson
            </Button>
          </Stack>
        </Panel>

        {/* RIGHT */}
        <Stack spacing={2}>
          {/* Module progress */}
          <Panel>
            <Typography
              sx={{
                color: '#172033',
                fontWeight: 900,
                fontSize: '1.03rem',
              }}
            >
              Module Progress
            </Typography>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mt: 1.5 }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: 100,
                  height: 100,
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    background: `conic-gradient(
                      #0daf7d 0% ${moduleProgress}%,
                      #e2e7ed ${moduleProgress}% 100%
                    )`,
                  }}
                />

                <Box
                  sx={{
                    position: 'absolute',
                    inset: 12,
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
                      fontSize: '1.35rem',
                    }}
                  >
                    {moduleProgress}%
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    color: '#344054',
                    fontWeight: 800,
                    fontSize: '0.76rem',
                  }}
                >
                  1 of 4 Lessons Completed
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={moduleProgress}
                  sx={{
                    mt: 1,
                    height: 8,
                    borderRadius: 99,
                    bgcolor: '#e4e8ee',
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

          {/* Lessons */}
          <Panel>
            <Typography
              sx={{
                color: '#172033',
                fontWeight: 900,
                fontSize: '1.03rem',
              }}
            >
              Lessons in This Module
            </Typography>

            <Stack
              spacing={0.6}
              sx={{ mt: 1.3 }}
            >
              {lessons.map((lesson) => (
                <Box
                  key={lesson.id}
                  sx={{
                    px: 1.2,
                    py: 1.1,
                    borderRadius: 2,
                    bgcolor: lesson.active
                      ? '#f0edff'
                      : '#fff',
                    border: lesson.active
                      ? '1px solid #e2dcff'
                      : '1px solid transparent',
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        width: 27,
                        height: 27,
                        flexShrink: 0,
                        borderRadius: '50%',
                        border:
                          '1.5px solid #6045e8',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#563cf0',
                      }}
                    >
                      {lesson.active ? (
                        <PlayArrowRoundedIcon
                          sx={{
                            fontSize: 16,
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius:
                              '50%',
                            bgcolor:
                              'transparent',
                          }}
                        />
                      )}
                    </Box>

                    <Typography
                      sx={{
                        flex: 1,
                        color: '#172033',
                        fontWeight:
                          lesson.active
                            ? 850
                            : 700,
                        fontSize: '0.75rem',
                        lineHeight: 1.35,
                      }}
                    >
                      {lesson.id}.{' '}
                      {lesson.title}
                    </Typography>

                    <Typography
                      sx={{
                        color: '#536174',
                        fontSize: '0.67rem',
                      }}
                    >
                      {lesson.duration}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Panel>

          {/* Takeaways */}
          <Panel>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <LightbulbRoundedIcon
                sx={{
                  color: '#5138e8',
                }}
              />

              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 900,
                  fontSize: '1.03rem',
                }}
              >
                Key Takeaways
              </Typography>
            </Stack>

            <Stack
              spacing={1.2}
              sx={{ mt: 1.5 }}
            >
              {takeaways.map(
                (takeaway) => (
                  <Stack
                    key={takeaway}
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                  >
                    <CheckCircleRoundedIcon
                      sx={{
                        mt: '2px',
                        color: '#0daf7d',
                        fontSize: 19,
                        flexShrink: 0,
                      }}
                    />

                    <Typography
                      sx={{
                        color: '#344054',
                        fontSize: '0.76rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {takeaway}
                    </Typography>
                  </Stack>
                ),
              )}
            </Stack>
          </Panel>
        </Stack>
      </Box>

      {/* Mobile module list / overall progress */}
      <Box
        sx={{
          mt: 2,
        }}
      >
        <Panel>
          <Stack
            direction={{
              xs: 'column',
              md: 'row',
            }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 900,
                  fontSize: '1rem',
                }}
              >
                {skillName} Learning Path
              </Typography>

              <Typography
                sx={{
                  mt: 0.4,
                  color: '#667085',
                  fontSize: '0.75rem',
                }}
              >
                Overall Progress:{' '}
                {overallProgress}%
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={overallProgress}
              sx={{
                width: {
                  xs: '100%',
                  md: 260,
                },
                alignSelf: 'center',
                height: 8,
                borderRadius: 99,
                bgcolor: '#e4e8ee',
                '& .MuiLinearProgress-bar':
                  {
                    borderRadius: 99,
                    bgcolor: '#0daf7d',
                  },
              }}
            />
          </Stack>

          <Box
            sx={{
              mt: 1.7,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(3, minmax(0, 1fr))',
              },
              gap: 1,
            }}
          >
            {modules.map((module) => (
              <Box
                key={module.id}
                sx={{
                  p: 1.2,
                  borderRadius: 2,
                  border:
                    module.status ===
                    'active'
                      ? '1px solid #49c997'
                      : '1px solid #e3e7ed',
                  bgcolor:
                    module.status ===
                    'active'
                      ? '#f1fcf7'
                      : '#fff',
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      flexShrink: 0,
                      borderRadius: 1.5,
                      bgcolor:
                        module.status ===
                        'active'
                          ? '#dcf8ea'
                          : '#f1f3f7',
                      color:
                        module.status ===
                        'active'
                          ? '#0a9c70'
                          : '#64748b',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 900,
                      fontSize: '0.72rem',
                    }}
                  >
                    {module.id}
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        color: '#172033',
                        fontWeight: 850,
                        fontSize: '0.75rem',
                      }}
                    >
                      {module.title}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.2,
                        color: '#667085',
                        fontSize: '0.66rem',
                      }}
                    >
                      {module.lessons} Lessons · ~{' '}
                      {module.hours} Hours
                    </Typography>
                  </Box>

                  {module.status ===
                  'active' ? (
                    <PlayArrowRoundedIcon
                      sx={{
                        color: '#0daf7d',
                        fontSize: 20,
                      }}
                    />
                  ) : (
                    <LockRoundedIcon
                      sx={{
                        color: '#64748b',
                        fontSize: 18,
                      }}
                    />
                  )}
                </Stack>
              </Box>
            ))}
          </Box>
        </Panel>
      </Box>

      <Typography
        sx={{
          mt: 1.2,
          textAlign: 'center',
          color: '#98a2b3',
          fontSize: '0.69rem',
        }}
      >
        Lesson video, lesson content, progress
        and module data are temporary UI values.
        No fake video or resource URLs have been
        added.
      </Typography>
    </Box>
  );
};