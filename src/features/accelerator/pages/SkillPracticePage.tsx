import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { type ReactNode, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type PracticeStatus =
  | 'in-progress'
  | 'not-started'
  | 'completed';

type PracticeProblem = {
  id: number;
  title: string;
  status: PracticeStatus;
};

const practiceProblems: PracticeProblem[] = [
  {
    id: 1,
    title: 'Theme Switcher (Context API)',
    status: 'in-progress',
  },
  {
    id: 2,
    title: 'User Auth State (Context)',
    status: 'not-started',
  },
  {
    id: 3,
    title: 'Cart State (Context)',
    status: 'not-started',
  },
];

const requirements = [
  'Create a ThemeContext with default theme ("light").',
  'Wrap the app with ThemeProvider.',
  'Add a toggle button to switch between light and dark.',
  'Apply the theme in a component (e.g., background and text color).',
];

const learningOutcomes = [
  'Understand real-world use of Context API',
  'Manage global state across components',
  'Apply state changes (theme) in the UI',
];

const Panel = ({
  children,
}: {
  children: ReactNode;
}) => (
  <Box
    sx={{
      bgcolor: '#fff',
      border: '1px solid #e1e6ee',
      borderRadius: 3,
      p: {
        xs: 1.7,
        md: 2,
      },
      boxShadow:
        '0 4px 16px rgba(15,23,42,0.035)',
    }}
  >
    {children}
  </Box>
);

const PracticeStatusChip = ({
  status,
}: {
  status: PracticeStatus;
}) => {
  if (status === 'completed') {
    return (
      <Chip
        label="Completed"
        size="small"
        sx={{
          bgcolor: '#dcf8ea',
          color: '#087a52',
          fontWeight: 850,
          fontSize: '0.65rem',
        }}
      />
    );
  }

  if (status === 'in-progress') {
    return (
      <Chip
        label="In Progress"
        size="small"
        sx={{
          bgcolor: '#dcf8ea',
          color: '#087a52',
          fontWeight: 850,
          fontSize: '0.65rem',
        }}
      />
    );
  }

  return (
    <Chip
      label="Not Started"
      size="small"
      sx={{
        bgcolor: '#eef1f5',
        color: '#475467',
        fontWeight: 800,
        fontSize: '0.65rem',
      }}
    />
  );
};

export const SkillPracticePage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [activeTab, setActiveTab] = useState(0);

  /*
   * TEMPORARY UI DATA
   *
   * Later this screen should load:
   * - practice problems
   * - current attempt
   * - test cases
   * - hints
   * - learner progress
   * from the Skill Practice backend APIs.
   */
  const skillName = 'React';
  const moduleName = 'State Management';
  const moduleProgress = 25;
  const practiceProgress = 0;

//   const navigateToScreen = (
//     screen: string,
//   ) => {
//     const params =
//       new URLSearchParams(searchParams);

//     params.set('type', 'skill');
//     params.set('screen', screen);

//     setSearchParams(params);
//   };

  const handleBackToLesson = () => {
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

  const handleOpenCodeEditor = () => {
    /*
     * S10 will use this route for the actual
     * interactive practice session.
     */
    const params =
      new URLSearchParams(searchParams);

    params.set('type', 'skill');
    params.set(
      'screen',
      'skill-practice-session',
    );
    params.set('module', '1');
    params.set('lesson', '2');
    params.set('problem', '1');

    setSearchParams(params);
  };

  const handleViewSolution = () => {
    setActiveTab(3);
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
        spacing={0.7}
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
            spacing={0.7}
            alignItems="center"
          >
            <Typography
              sx={{
                color: '#475467',
                fontSize: '0.75rem',
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
            fontSize: '0.75rem',
            fontWeight: 900,
          }}
        >
          Practice
        </Typography>
      </Stack>

      {/* HERO */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3.5,
          color: '#fff',
          background:
            'linear-gradient(105deg, #30288c 0%, #5533ec 52%, #7137f4 100%)',
          px: {
            xs: 2,
            md: 3,
          },
          py: 2.3,
        }}
      >
        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{
            xs: 'flex-start',
            sm: 'center',
          }}
        >
          <Stack
            direction="row"
            spacing={1.7}
            alignItems="center"
          >
            <Box
              sx={{
                width: 76,
                height: 76,
                flexShrink: 0,
                borderRadius: 2.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor:
                  'rgba(255,255,255,0.12)',
                border:
                  '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <CodeRoundedIcon
                sx={{
                  fontSize: 43,
                }}
              />
            </Box>

            <Box>
              <Typography
                component="h1"
                sx={{
                  fontWeight: 950,
                  fontSize: {
                    xs: '1.45rem',
                    md: '2rem',
                  },
                  letterSpacing: '-0.03em',
                }}
              >
                Practice: Context API
              </Typography>

              <Typography
                sx={{
                  mt: 0.35,
                  color:
                    'rgba(255,255,255,0.9)',
                  fontSize: {
                    xs: '0.8rem',
                    md: '0.95rem',
                  },
                }}
              >
                Apply what you learned by
                solving hands-on problems.
              </Typography>
            </Box>
          </Stack>

          <Chip
            label={`Practice • ${skillName}`}
            sx={{
              bgcolor: '#bff7db',
              color: '#087a52',
              fontWeight: 900,
            }}
          />
        </Stack>
      </Box>

      {/* MAIN */}
      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl: 'minmax(0, 1.65fr) minmax(300px, 0.85fr)',
          },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {/* LEFT */}
        <Panel>
          <Tabs
            value={activeTab}
            onChange={(_, value) =>
              setActiveTab(value)
            }
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mx: -1,
              mt: -1,
              mb: 2,
              minHeight: 48,
              borderBottom:
                '1px solid #e5e9ef',
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 850,
                fontSize: '0.76rem',
              },
            }}
          >
            <Tab
              icon={
                <QuizRoundedIcon />
              }
              iconPosition="start"
              label="Problem"
            />

            <Tab
              icon={
                <CodeRoundedIcon />
              }
              iconPosition="start"
              label="Code Editor"
            />

            <Tab
              icon={
                <CheckCircleRoundedIcon />
              }
              iconPosition="start"
              label="Test Cases"
            />

            <Tab
              icon={
                <DescriptionRoundedIcon />
              }
              iconPosition="start"
              label="Solution"
            />

            <Tab
              icon={
                <ForumRoundedIcon />
              }
              iconPosition="start"
              label="Discussion"
            />
          </Tabs>

          {/* PROBLEM */}
          {activeTab === 0 && (
            <Box>
              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={1}
                justifyContent="space-between"
                alignItems={{
                  xs: 'flex-start',
                  sm: 'center',
                }}
              >
                <Typography
                  sx={{
                    color: '#111827',
                    fontWeight: 950,
                    fontSize: {
                      xs: '1.2rem',
                      md: '1.45rem',
                    },
                  }}
                >
                  Problem: Theme Switcher using
                  Context API
                </Typography>

                <Chip
                  label="Easy"
                  size="small"
                  sx={{
                    bgcolor: '#dff8ea',
                    color: '#087a52',
                    fontWeight: 900,
                  }}
                />
              </Stack>

              <Typography
                sx={{
                  mt: 1.2,
                  color: '#344054',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                }}
              >
                Build a simple React app that
                uses Context API to manage a
                global theme (light / dark) and
                allows the user to toggle the
                theme.
              </Typography>

              {/* Requirements */}
              <Box
                sx={{
                  mt: 2,
                  p: 1.8,
                  borderRadius: 2.5,
                  border:
                    '1px solid #dde3ec',
                  bgcolor: '#fbfcfe',
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <TrackChangesRoundedIcon
                    sx={{
                      color: '#172033',
                    }}
                  />

                  <Typography
                    sx={{
                      color: '#172033',
                      fontWeight: 900,
                      fontSize: '0.95rem',
                    }}
                  >
                    Requirements
                  </Typography>
                </Stack>

                <Stack
                  spacing={1}
                  sx={{ mt: 1.4 }}
                >
                  {requirements.map(
                    (requirement) => (
                      <Stack
                        key={requirement}
                        direction="row"
                        spacing={1}
                        alignItems="flex-start"
                      >
                        <CheckCircleRoundedIcon
                          sx={{
                            mt: '2px',
                            color:
                              '#0daf7d',
                            fontSize: 20,
                            flexShrink: 0,
                          }}
                        />

                        <Typography
                          sx={{
                            color:
                              '#344054',
                            fontSize:
                              '0.8rem',
                            lineHeight:
                              1.5,
                          }}
                        >
                          {requirement}
                        </Typography>
                      </Stack>
                    ),
                  )}
                </Stack>
              </Box>

              {/* Expected output */}
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.8,
                  borderRadius: 2.5,
                  border:
                    '1px solid #dde3ec',
                  bgcolor: '#fbfcfe',
                }}
              >
                <Typography
                  sx={{
                    color: '#172033',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                  }}
                >
                  Expected Output
                </Typography>

                <Box
                  sx={{
                    mt: 1.3,
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      md: '1fr 1fr',
                    },
                    gap: 1.3,
                  }}
                >
                  {/* Light */}
                  <Box
                    sx={{
                      minHeight: 165,
                      borderRadius: 2,
                      border:
                        '1px solid #d9dee8',
                      bgcolor: '#fff',
                      p: 1.5,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={0.8}
                      alignItems="center"
                    >
                      <LightModeRoundedIcon
                        sx={{
                          color: '#f5a300',
                        }}
                      />

                      <Typography
                        sx={{
                          color: '#172033',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                        }}
                      >
                        Light Theme
                      </Typography>
                    </Stack>

                    <Box
                      sx={{
                        mt: 1.5,
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#111827',
                          fontWeight: 950,
                          fontSize: '1.2rem',
                        }}
                      >
                        Theme Demo
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.6,
                          color: '#344054',
                          fontSize: '0.8rem',
                        }}
                      >
                        This is light mode.
                      </Typography>

                      <Button
                        variant="contained"
                        sx={{
                          mt: 1.4,
                          minWidth: 145,
                          textTransform: 'none',
                          fontWeight: 850,
                          borderRadius: 2,
                          boxShadow: 'none',
                          background:
                            'linear-gradient(90deg, #7342f4, #5435e8)',
                        }}
                      >
                        Switch to Dark
                      </Button>
                    </Box>
                  </Box>

                  {/* Dark */}
                  <Box
                    sx={{
                      minHeight: 165,
                      borderRadius: 2,
                      bgcolor: '#172844',
                      color: '#fff',
                      p: 1.5,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={0.8}
                      alignItems="center"
                    >
                      <DarkModeRoundedIcon />

                      <Typography
                        sx={{
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                        }}
                      >
                        Dark Theme
                      </Typography>
                    </Stack>

                    <Box
                      sx={{
                        mt: 1.5,
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 950,
                          fontSize: '1.2rem',
                        }}
                      >
                        Theme Demo
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.6,
                          fontSize: '0.8rem',
                        }}
                      >
                        This is dark mode.
                      </Typography>

                      <Button
                        variant="outlined"
                        sx={{
                          mt: 1.4,
                          minWidth: 145,
                          color: '#fff',
                          borderColor: '#fff',
                          textTransform: 'none',
                          fontWeight: 850,
                          borderRadius: 2,
                        }}
                      >
                        Switch to Light
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* CODE EDITOR TAB */}
          {activeTab === 1 && (
            <Box>
              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                }}
              >
                Code Editor
              </Typography>

              <Typography
                sx={{
                  mt: 0.6,
                  color: '#667085',
                  fontSize: '0.8rem',
                }}
              >
                Open the interactive practice
                session to write and test your
                React solution.
              </Typography>

              <Box
                sx={{
                  mt: 1.5,
                  minHeight: 320,
                  borderRadius: 2.5,
                  bgcolor: '#111827',
                  p: 2,
                  color: '#d1d5db',
                  fontFamily:
                    'Consolas, Monaco, monospace',
                  fontSize: '0.8rem',
                }}
              >
                {'// Your React code will appear here\n'}
                {'// when the practice editor is connected.\n\n'}
                {'function ThemeSwitcher() {\n'}
                {'  // TODO: implement ThemeContext\n'}
                {'  return null;\n'}
                {'}'}
              </Box>

              <Button
                variant="contained"
                startIcon={
                  <CodeRoundedIcon />
                }
                endIcon={
                  <ArrowForwardRoundedIcon />
                }
                onClick={
                  handleOpenCodeEditor
                }
                sx={{
                  mt: 1.5,
                  textTransform: 'none',
                  fontWeight: 900,
                  borderRadius: 2,
                  boxShadow: 'none',
                }}
              >
                Open Full Code Editor
              </Button>
            </Box>
          )}

          {/* TEST CASES */}
          {activeTab === 2 && (
            <Box>
              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                }}
              >
                Test Cases
              </Typography>

              <Typography
                sx={{
                  mt: 0.7,
                  color: '#667085',
                  fontSize: '0.8rem',
                  lineHeight: 1.6,
                }}
              >
                Automated practice test cases
                will be loaded from the backend
                when the practice execution
                service is connected.
              </Typography>
            </Box>
          )}

          {/* SOLUTION */}
          {activeTab === 3 && (
            <Box>
              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                }}
              >
                Solution
              </Typography>

              <Typography
                sx={{
                  mt: 0.7,
                  color: '#667085',
                  fontSize: '0.8rem',
                  lineHeight: 1.6,
                }}
              >
                The final solution is intentionally
                hidden in this UI version. It
                should be revealed according to
                your practice-attempt rules.
              </Typography>
            </Box>
          )}

          {/* DISCUSSION */}
          {activeTab === 4 && (
            <Box>
              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                }}
              >
                Discussion
              </Typography>

              <Typography
                sx={{
                  mt: 0.7,
                  color: '#667085',
                  fontSize: '0.8rem',
                  lineHeight: 1.6,
                }}
              >
                Discussion and AI Tutor support
                will be connected when the
                learning assistant backend is
                available.
              </Typography>
            </Box>
          )}
        </Panel>

        {/* RIGHT */}
        <Stack spacing={2}>
          {/* Progress */}
          <Panel>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <MenuBookRoundedIcon
                sx={{
                  color: '#563cf0',
                }}
              />

              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                }}
              >
                Practice Progress
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ mt: 1.5 }}
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
                      #0daf7d 0% ${practiceProgress}%,
                      #e0e5ed ${practiceProgress}% 100%
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
                    {practiceProgress}%
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    color: '#172033',
                    fontWeight: 850,
                    fontSize: '0.76rem',
                  }}
                >
                  0 of 3 Practice Problems
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={practiceProgress}
                  sx={{
                    mt: 1,
                    height: 8,
                    borderRadius: 99,
                    bgcolor: '#e2e6ee',
                    '& .MuiLinearProgress-bar':
                      {
                        borderRadius: 99,
                        bgcolor: '#0daf7d',
                      },
                  }}
                />
              </Box>
            </Stack>

            <Stack
              spacing={0.5}
              sx={{ mt: 1.6 }}
            >
              {practiceProblems.map(
                (problem) => (
                  <Box
                    key={problem.id}
                    sx={{
                      px: 1,
                      py: 0.8,
                      borderRadius: 1.8,
                      bgcolor:
                        problem.status ===
                        'in-progress'
                          ? '#f0edff'
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
                          width: 22,
                          height: 22,
                          flexShrink: 0,
                          borderRadius:
                            '50%',
                          border:
                            '1.5px solid #563cf0',
                          display: 'grid',
                          placeItems:
                            'center',
                        }}
                      >
                        {problem.status ===
                        'in-progress' ? (
                          <PlayArrowRoundedIcon
                            sx={{
                              color:
                                '#563cf0',
                              fontSize: 14,
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius:
                                '50%',
                            }}
                          />
                        )}
                      </Box>

                      <Typography
                        sx={{
                          flex: 1,
                          color: '#172033',
                          fontWeight: 800,
                          fontSize: '0.7rem',
                        }}
                      >
                        {problem.id}.{' '}
                        {problem.title}
                      </Typography>

                      <PracticeStatusChip
                        status={problem.status}
                      />
                    </Stack>
                  </Box>
                ),
              )}
            </Stack>
          </Panel>

          {/* Hint */}
          <Panel>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <LightbulbRoundedIcon
                sx={{
                  color: '#f5a300',
                }}
              />

              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                }}
              >
                Need a Hint?
              </Typography>
            </Stack>

            <Typography
              sx={{
                mt: 1,
                color: '#344054',
                fontSize: '0.78rem',
                lineHeight: 1.5,
              }}
            >
              Stuck? Get a hint to move forward
              without seeing the full solution.
            </Typography>

            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={1}
              sx={{ mt: 1.4 }}
            >
              <Button
                fullWidth
                variant="outlined"
                startIcon={
                  <LightbulbRoundedIcon />
                }
                sx={{
                  textTransform: 'none',
                  fontWeight: 850,
                  borderRadius: 2,
                }}
              >
                Get Hint
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={
                  <VisibilityRoundedIcon />
                }
                onClick={
                  handleViewSolution
                }
                sx={{
                  color: '#172033',
                  borderColor: '#98a2b3',
                  textTransform: 'none',
                  fontWeight: 850,
                  borderRadius: 2,
                }}
              >
                View Solution
              </Button>
            </Stack>
          </Panel>

          {/* Outcome */}
          <Panel>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <TrackChangesRoundedIcon
                sx={{
                  color: '#563cf0',
                }}
              />

              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                }}
              >
                Learning Outcome
              </Typography>
            </Stack>

            <Stack
              spacing={1.1}
              sx={{ mt: 1.4 }}
            >
              {learningOutcomes.map(
                (outcome) => (
                  <Stack
                    key={outcome}
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                  >
                    <CheckCircleRoundedIcon
                      sx={{
                        mt: '2px',
                        color: '#0daf7d',
                        fontSize: 20,
                        flexShrink: 0,
                      }}
                    />

                    <Typography
                      sx={{
                        color: '#344054',
                        fontSize: '0.77rem',
                        lineHeight: 1.45,
                      }}
                    >
                      {outcome}
                    </Typography>
                  </Stack>
                ),
              )}
            </Stack>
          </Panel>

          {/* Module info */}
          <Panel>
            <Typography
              sx={{
                color: '#172033',
                fontWeight: 900,
                fontSize: '0.9rem',
              }}
            >
              {skillName} – {moduleName}
            </Typography>

            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mt: 1.2 }}
            >
              <Typography
                sx={{
                  color: '#667085',
                  fontSize: '0.72rem',
                }}
              >
                Module Progress
              </Typography>

              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 850,
                  fontSize: '0.72rem',
                }}
              >
                {moduleProgress}%
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={moduleProgress}
              sx={{
                mt: 0.8,
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
          </Panel>
        </Stack>
      </Box>

      {/* Bottom buttons */}
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
          onClick={handleBackToLesson}
          sx={{
            minHeight: 48,
            px: 3,
            borderRadius: 2.2,
            textTransform: 'none',
            fontWeight: 850,
          }}
        >
          Back to Lesson
        </Button>

        <Button
          variant="contained"
          startIcon={
            <CodeRoundedIcon />
          }
          endIcon={
            <ArrowForwardRoundedIcon />
          }
          onClick={handleOpenCodeEditor}
          sx={{
            minHeight: 50,
            minWidth: {
              xs: '100%',
              sm: 290,
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
          Open in Code Editor
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
        Practice progress, hints, test cases and
        execution data are temporary UI values
        until the Skill Practice backend APIs are
        connected.
      </Typography>
    </Box>
  );
};