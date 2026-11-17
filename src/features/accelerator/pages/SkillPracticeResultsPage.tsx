import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
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

type ResultTab =
  | 'tests'
  | 'submission'
  | 'solution'
  | 'feedback';

type TestResult = {
  id: number;
  title: string;
  details: string;
};

const testResults: TestResult[] = [
  {
    id: 1,
    title: 'Renders app without errors',
    details: 'App loads successfully.',
  },
  {
    id: 2,
    title: 'Toggles theme to dark',
    details: 'Theme changes to dark mode.',
  },
  {
    id: 3,
    title: 'Toggles theme back to light',
    details: 'Theme changes to light mode.',
  },
];

const codeOverview = [
  'Used Context API for global state.',
  'Implemented a ThemeProvider and custom hook.',
  'Created the theme toggle button.',
  'Applied theme across components.',
];

const performancePoints = [
  'All requirements met',
  'Clean and functional code',
  'Test cases passed',
  'Good use of Context API',
];

const nextSteps = [
  'Continue to the next practice problem.',
  'Try a medium-level Context API challenge.',
  'Add advanced features such as persisting the theme.',
];

const submittedCode = `import {
  createContext,
  useContext,
  useState,
} from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme((current) =>
      current === 'light' ? 'dark' : 'light',
    );
  };

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}`;

const Panel = ({
  children,
  padding = true,
}: {
  children: ReactNode;
  padding?: boolean;
}) => (
  <Box
    sx={{
      bgcolor: '#fff',
      border: '1px solid #e1e6ee',
      borderRadius: 3,
      p: padding
        ? {
            xs: 1.7,
            md: 2,
          }
        : 0,
      boxShadow:
        '0 4px 16px rgba(15,23,42,0.035)',
    }}
  >
    {children}
  </Box>
);

const SuccessPoint = ({
  children,
}: {
  children: ReactNode;
}) => (
  <Stack
    direction="row"
    spacing={1}
    alignItems="flex-start"
  >
    <CheckCircleRoundedIcon
      sx={{
        mt: '1px',
        color: '#0eaf75',
        fontSize: 20,
        flexShrink: 0,
      }}
    />

    <Typography
      sx={{
        color: '#27314a',
        fontSize: '0.78rem',
        lineHeight: 1.45,
      }}
    >
      {children}
    </Typography>
  </Stack>
);

export const SkillPracticeResultsPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [activeTab, setActiveTab] =
    useState<ResultTab>('tests');

  /*
   * TEMPORARY FRONTEND RESULT DATA.
   *
   * IMPORTANT:
   * S10 currently does not have a real secure
   * code-execution backend.
   *
   * These result values are UI placeholders
   * matching the approved design only.
   *
   * TODO BACKEND:
   * - Load actual submitted attempt
   * - Load real test results
   * - Load score
   * - Load execution time
   * - Load code metrics
   * - Generate/store feedback
   * - Persist completion/progress
   */

  const score = 100;
  const passedTests = 3;
  const totalTests = 3;
  const executionTime = '2 m 34 s';
  const linesOfCode = 132;
  const difficulty = 'Easy';

  const handleBackToPractice = () => {
    const params =
      new URLSearchParams(searchParams);

    params.set('type', 'skill');
    params.set('screen', 'skill-practice');
    params.set('module', '1');
    params.set('lesson', '2');
    params.delete('problem');

    setSearchParams(params);
  };

  const handleNextProblem = () => {
    /*
     * Return to the practice screen and select
     * problem 2.
     *
     * S9 can later read this "problem" parameter
     * to highlight/open the selected challenge.
     */
    const params =
      new URLSearchParams(searchParams);

    params.set('type', 'skill');
    params.set('screen', 'skill-practice');
    params.set('module', '1');
    params.set('lesson', '2');
    params.set('problem', '2');

    setSearchParams(params);
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
          'React',
          'Module 1',
          'Practice',
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
                fontSize: '0.74rem',
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
            fontSize: '0.74rem',
            fontWeight: 900,
          }}
        >
          Results
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '230px minmax(0, 1fr)',
          },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {/* LEFT SIDEBAR */}
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
            startIcon={<ArrowBackRoundedIcon />}
            onClick={handleBackToPractice}
            sx={{
              px: 0,
              mb: 2,
              color: '#344054',
              textTransform: 'none',
              fontWeight: 850,
              '&:hover': {
                bgcolor: 'transparent',
                color: '#563cf0',
              },
            }}
          >
            Back to Practice
          </Button>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <CodeRoundedIcon
              sx={{
                color: '#563cf0',
              }}
            />

            <Typography
              sx={{
                color: '#172033',
                fontWeight: 900,
                fontSize: '0.86rem',
              }}
            >
              React – State Management
            </Typography>
          </Stack>

          <Stack spacing={0.5}>
            <SidebarStep
              number={1}
              label="Problem"
              completed
            />

            <SidebarStep
              number={2}
              label="Code Editor"
              completed
            />

            <SidebarStep
              number={3}
              label="Test Cases"
              completed
            />

            <SidebarStep
              number={4}
              label="Submit & Results"
              active
            />
          </Stack>

          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 2.5,
              bgcolor: '#fff',
              border: '1px solid #e1e6ee',
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 900,
                  fontSize: '0.76rem',
                }}
              >
                Practice Progress
              </Typography>

              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 950,
                  fontSize: '0.76rem',
                }}
              >
                3/3
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={100}
              sx={{
                mt: 1.1,
                height: 9,
                borderRadius: 99,
                bgcolor: '#e2e7ed',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#0eaf75',
                  borderRadius: 99,
                },
              }}
            />
          </Box>
        </Box>

        {/* MAIN */}
        <Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                xl: 'minmax(0, 1.7fr) minmax(310px, 0.9fr)',
              },
              gap: 2,
              alignItems: 'start',
            }}
          >
            {/* CENTER */}
            <Stack spacing={2}>
              {/* HERO */}
              <Box
                sx={{
                  borderRadius: 3.5,
                  overflow: 'hidden',
                  color: '#fff',
                  background:
                    'linear-gradient(105deg, #30288c 0%, #5734e9 55%, #7c3aed 100%)',
                  px: {
                    xs: 2,
                    md: 2.7,
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
                  alignItems={{
                    xs: 'flex-start',
                    sm: 'center',
                  }}
                  spacing={2}
                >
                  <Stack
                    direction="row"
                    spacing={1.7}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        flexShrink: 0,
                        borderRadius: 2.5,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor:
                          'rgba(255,255,255,0.13)',
                        border:
                          '1px solid rgba(255,255,255,0.3)',
                      }}
                    >
                      <EmojiEventsRoundedIcon
                        sx={{
                          color: '#ffd84c',
                          fontSize: 48,
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography
                        component="h1"
                        sx={{
                          fontWeight: 950,
                          fontSize: {
                            xs: '1.5rem',
                            md: '2rem',
                          },
                          letterSpacing: '-0.03em',
                        }}
                      >
                        Practice Results
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.25,
                          color:
                            'rgba(255,255,255,0.9)',
                          fontSize: {
                            xs: '0.82rem',
                            md: '1rem',
                          },
                        }}
                      >
                        Theme Switcher (Context API)
                      </Typography>
                    </Box>
                  </Stack>

                  <Chip
                    icon={
                      <CheckCircleRoundedIcon />
                    }
                    label="Completed"
                    sx={{
                      bgcolor: '#c9f8df',
                      color: '#087a52',
                      fontWeight: 900,
                      '& .MuiChip-icon': {
                        color: '#0eaf75',
                      },
                    }}
                  />
                </Stack>
              </Box>

              {/* MAIN SCORE */}
              <Panel>
                <Stack
                  direction={{
                    xs: 'column',
                    md: 'row',
                  }}
                  spacing={2.5}
                  alignItems={{
                    xs: 'flex-start',
                    md: 'center',
                  }}
                >
                  <ScoreCircle
                    value={score}
                    size={140}
                  />

                  <Box>
                    <Typography
                      sx={{
                        color: '#101828',
                        fontWeight: 950,
                        fontSize: {
                          xs: '1.45rem',
                          md: '1.8rem',
                        },
                      }}
                    >
                      All Test Cases Passed!
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        color: '#344054',
                        fontSize: '0.9rem',
                        lineHeight: 1.5,
                      }}
                    >
                      Great job! You&apos;ve
                      successfully implemented the
                      Theme Switcher using Context
                      API.
                    </Typography>
                  </Box>
                </Stack>

                <Box
                  sx={{
                    mt: 2,
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr 1fr',
                      md: 'repeat(4, 1fr)',
                    },
                    gap: 1.2,
                  }}
                >
                  <MetricCard
                    icon={
                      <CheckCircleRoundedIcon />
                    }
                    value={`${passedTests}/${totalTests}`}
                    label="Test Cases"
                    green
                  />

                  <MetricCard
                    icon={<TimerOutlinedIcon />}
                    value={executionTime}
                    label="Execution Time"
                  />

                  <MetricCard
                    icon={<CodeRoundedIcon />}
                    value={`${linesOfCode}`}
                    label="Lines of Code"
                  />

                  <MetricCard
                    icon={<SpeedRoundedIcon />}
                    value={difficulty}
                    label="Difficulty"
                  />
                </Box>
              </Panel>

              {/* RESULTS TABS */}
              <Panel padding={false}>
                <Tabs
                  value={activeTab}
                  onChange={(_, value) =>
                    setActiveTab(value)
                  }
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    px: 1.3,
                    borderBottom:
                      '1px solid #e4e8ef',
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 850,
                      fontSize: '0.75rem',
                    },
                  }}
                >
                  <Tab
                    value="tests"
                    label="Test Case Results"
                  />

                  <Tab
                    value="submission"
                    label="Your Submission"
                  />

                  <Tab
                    value="solution"
                    label="Solution"
                  />

                  <Tab
                    value="feedback"
                    label="Feedback"
                  />
                </Tabs>

                <Box sx={{ p: 1.7 }}>
                  {activeTab === 'tests' && (
                    <>
                      <Box
                        sx={{
                          overflowX: 'auto',
                          border:
                            '1px solid #dde3eb',
                          borderRadius: 2,
                        }}
                      >
                        <Box
                          sx={{
                            minWidth: 650,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns:
                                '45px 1.4fr 120px 1.4fr',
                              px: 1.3,
                              py: 1,
                              bgcolor: '#f3f5f8',
                              borderBottom:
                                '1px solid #dfe4eb',
                            }}
                          >
                            {[
                              '#',
                              'Test Case',
                              'Status',
                              'Details',
                            ].map((heading) => (
                              <Typography
                                key={heading}
                                sx={{
                                  color: '#172033',
                                  fontWeight: 900,
                                  fontSize: '0.7rem',
                                }}
                              >
                                {heading}
                              </Typography>
                            ))}
                          </Box>

                          {testResults.map(
                            (test) => (
                              <Box
                                key={test.id}
                                sx={{
                                  display: 'grid',
                                  gridTemplateColumns:
                                    '45px 1.4fr 120px 1.4fr',
                                  px: 1.3,
                                  py: 0.85,
                                  alignItems: 'center',
                                  borderBottom:
                                    test.id !==
                                    testResults.length
                                      ? '1px solid #e6e9ef'
                                      : 'none',
                                }}
                              >
                                <Typography
                                  sx={{
                                    color: '#172033',
                                    fontWeight: 800,
                                    fontSize: '0.72rem',
                                  }}
                                >
                                  {test.id}
                                </Typography>

                                <Typography
                                  sx={{
                                    color: '#172033',
                                    fontSize: '0.72rem',
                                  }}
                                >
                                  {test.title}
                                </Typography>

                                <Chip
                                  icon={
                                    <CheckCircleRoundedIcon />
                                  }
                                  label="Passed"
                                  size="small"
                                  sx={{
                                    width: 'fit-content',
                                    bgcolor: '#dcf8ea',
                                    color: '#087a52',
                                    fontWeight: 850,
                                    fontSize: '0.65rem',
                                    '& .MuiChip-icon': {
                                      color: '#0eaf75',
                                    },
                                  }}
                                />

                                <Typography
                                  sx={{
                                    color: '#344054',
                                    fontSize: '0.7rem',
                                  }}
                                >
                                  {test.details}
                                </Typography>
                              </Box>
                            ),
                          )}
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          mt: 1.5,
                          p: 1.5,
                          borderRadius: 2.3,
                          border:
                            '1px solid #dde3eb',
                          bgcolor: '#fbfcfe',
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          <CodeRoundedIcon
                            sx={{
                              color: '#563cf0',
                            }}
                          />

                          <Typography
                            sx={{
                              color: '#172033',
                              fontWeight: 900,
                              fontSize: '0.9rem',
                            }}
                          >
                            Code Overview
                          </Typography>
                        </Stack>

                        <Stack
                          spacing={0.8}
                          sx={{ mt: 1.2 }}
                        >
                          {codeOverview.map(
                            (item) => (
                              <SuccessPoint key={item}>
                                {item}
                              </SuccessPoint>
                            ),
                          )}
                        </Stack>
                      </Box>
                    </>
                  )}

                  {activeTab === 'submission' && (
                    <Box>
                      <Typography
                        sx={{
                          color: '#172033',
                          fontWeight: 900,
                          fontSize: '0.95rem',
                        }}
                      >
                        Your Submitted Code
                      </Typography>

                      <Box
                        component="pre"
                        sx={{
                          mt: 1.2,
                          mb: 0,
                          p: 1.7,
                          borderRadius: 2,
                          bgcolor: '#111827',
                          color: '#e5e7eb',
                          overflowX: 'auto',
                          fontFamily:
                            'Consolas, Monaco, monospace',
                          fontSize: '0.72rem',
                          lineHeight: 1.65,
                        }}
                      >
                        {submittedCode}
                      </Box>
                    </Box>
                  )}

                  {activeTab === 'solution' && (
                    <Box>
                      <Typography
                        sx={{
                          color: '#172033',
                          fontWeight: 900,
                          fontSize: '0.95rem',
                        }}
                      >
                        Recommended Solution
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.8,
                          color: '#667085',
                          fontSize: '0.78rem',
                          lineHeight: 1.6,
                        }}
                      >
                        The official solution
                        should be loaded from the
                        backend after the attempt
                        is completed. It is not
                        hard-coded here to avoid
                        creating a fake solution
                        source.
                      </Typography>
                    </Box>
                  )}

                  {activeTab === 'feedback' && (
                    <Box>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <LightbulbRoundedIcon
                          sx={{
                            color: '#563cf0',
                          }}
                        />

                        <Typography
                          sx={{
                            color: '#172033',
                            fontWeight: 900,
                          }}
                        >
                          Practice Feedback
                        </Typography>
                      </Stack>

                      <Typography
                        sx={{
                          mt: 1,
                          color: '#667085',
                          fontSize: '0.78rem',
                          lineHeight: 1.6,
                        }}
                      >
                        Detailed AI feedback will
                        be generated from the real
                        submitted code and test
                        results after the practice
                        evaluation backend is
                        connected.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Panel>

              {/* BOTTOM ACTIONS */}
              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                justifyContent="space-between"
                spacing={1.2}
              >
                <Button
                  variant="outlined"
                  startIcon={
                    <ArrowBackRoundedIcon />
                  }
                  onClick={handleBackToPractice}
                  sx={{
                    minHeight: 48,
                    px: 3,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 850,
                  }}
                >
                  Back to Practice
                </Button>

                <Button
                  variant="contained"
                  endIcon={
                    <ArrowForwardRoundedIcon />
                  }
                  onClick={handleNextProblem}
                  sx={{
                    minHeight: 50,
                    minWidth: {
                      xs: '100%',
                      sm: 260,
                    },
                    px: 3,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 900,
                    boxShadow: 'none',
                    background:
                      'linear-gradient(90deg, #6134f3, #5138e8)',
                  }}
                >
                  Continue to Next Problem
                </Button>
              </Stack>
            </Stack>

            {/* RIGHT SIDEBAR */}
            <Stack spacing={2}>
              <Panel>
                <Typography
                  sx={{
                    color: '#172033',
                    fontWeight: 950,
                    fontSize: '1.15rem',
                  }}
                >
                  Your Performance
                </Typography>

                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mt: 1.5 }}
                >
                  <ScoreCircle
                    value={score}
                    size={115}
                  />

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        color: '#172033',
                        fontSize: '1.05rem',
                      }}
                    >
                      Score:{' '}
                      <Box
                        component="span"
                        sx={{
                          fontWeight: 950,
                        }}
                      >
                        {score}
                      </Box>
                      /100
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={score}
                      sx={{
                        mt: 1.2,
                        height: 9,
                        borderRadius: 99,
                        bgcolor: '#e2e7ed',
                        '& .MuiLinearProgress-bar':
                          {
                            bgcolor: '#0eaf75',
                            borderRadius: 99,
                          },
                      }}
                    />
                  </Box>
                </Stack>

                <Stack
                  spacing={0.9}
                  sx={{ mt: 1.6 }}
                >
                  {performancePoints.map(
                    (item) => (
                      <SuccessPoint key={item}>
                        {item}
                      </SuccessPoint>
                    ),
                  )}
                </Stack>
              </Panel>

              <Panel>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <LightbulbRoundedIcon
                    sx={{
                      color: '#563cf0',
                    }}
                  />

                  <Typography
                    sx={{
                      color: '#172033',
                      fontWeight: 950,
                      fontSize: '1.1rem',
                    }}
                  >
                    AI Feedback ✨
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    mt: 1.3,
                    p: 1.5,
                    borderRadius: 2.3,
                    bgcolor: '#f1edff',
                  }}
                >
                  <Typography
                    sx={{
                      color: '#27314a',
                      fontSize: '0.78rem',
                      lineHeight: 1.55,
                    }}
                  >
                    Excellent! You correctly used
                    Context API, followed a clean
                    structure, and implemented the
                    theme toggle properly.
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    mt: 1,
                    color: '#98a2b3',
                    fontSize: '0.62rem',
                    lineHeight: 1.4,
                  }}
                >
                  Temporary UI feedback. Replace
                  with feedback generated from the
                  real evaluated submission.
                </Typography>
              </Panel>

              <Panel>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <RocketLaunchRoundedIcon
                    sx={{
                      color: '#563cf0',
                    }}
                  />

                  <Typography
                    sx={{
                      color: '#172033',
                      fontWeight: 950,
                      fontSize: '1.1rem',
                    }}
                  >
                    Next Steps
                  </Typography>
                </Stack>

                <Stack
                  spacing={1}
                  sx={{ mt: 1.4 }}
                >
                  {nextSteps.map((item) => (
                    <SuccessPoint key={item}>
                      {item}
                    </SuccessPoint>
                  ))}
                </Stack>
              </Panel>
            </Stack>
          </Box>

          <Typography
            sx={{
              mt: 1.5,
              textAlign: 'center',
              color: '#98a2b3',
              fontSize: '0.65rem',
            }}
          >
            Score, test results, execution time,
            code metrics and AI feedback shown on
            this screen are temporary UI values
            until the secure practice evaluation
            backend is connected.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const ScoreCircle = ({
  value,
  size,
}: {
  value: number;
  size: number;
}) => (
  <Box
    sx={{
      position: 'relative',
      width: size,
      height: size,
      flexShrink: 0,
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: `conic-gradient(
          #0eaf75 0% ${value}%,
          #e2e7ed ${value}% 100%
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
          color: '#08a568',
          fontWeight: 950,
          fontSize:
            size >= 130
              ? '1.7rem'
              : '1.35rem',
        }}
      >
        {value}%
      </Typography>
    </Box>
  </Box>
);

const MetricCard = ({
  icon,
  value,
  label,
  green = false,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  green?: boolean;
}) => (
  <Box
    sx={{
      p: 1.3,
      borderRadius: 2.3,
      border: '1px solid #dfe4ec',
      bgcolor: '#fbfcfe',
    }}
  >
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
    >
      <Box
        sx={{
          color: green
            ? '#0eaf75'
            : '#563cf0',
          display: 'grid',
          placeItems: 'center',
          '& svg': {
            fontSize: 29,
          },
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          sx={{
            color: '#172033',
            fontWeight: 950,
            fontSize: '0.95rem',
          }}
        >
          {value}
        </Typography>

        <Typography
          sx={{
            color: '#667085',
            fontSize: '0.67rem',
          }}
        >
          {label}
        </Typography>
      </Box>
    </Stack>
  </Box>
);

const SidebarStep = ({
  number,
  label,
  completed = false,
  active = false,
}: {
  number: number;
  label: string;
  completed?: boolean;
  active?: boolean;
}) => (
  <Box
    sx={{
      px: 1,
      py: 0.9,
      borderRadius: 2,
      bgcolor: active
        ? '#eeeaff'
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
          width: 30,
          height: 30,
          flexShrink: 0,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: active
            ? '#ddd5ff'
            : completed
              ? '#dff8ea'
              : '#edf0f5',
          color: active
            ? '#563cf0'
            : completed
              ? '#087a52'
              : '#475467',
          fontWeight: 900,
          fontSize: '0.75rem',
        }}
      >
        {number}
      </Box>

      <Typography
        sx={{
          flex: 1,
          color: active
            ? '#563cf0'
            : '#172033',
          fontWeight: active
            ? 900
            : 750,
          fontSize: '0.74rem',
        }}
      >
        {label}
      </Typography>

      {completed && (
        <CheckCircleRoundedIcon
          sx={{
            color: '#0eaf75',
            fontSize: 20,
          }}
        />
      )}

      {active && (
        <PlayArrowRoundedIcon
          sx={{
            color: '#563cf0',
            fontSize: 19,
          }}
        />
      )}
    </Stack>
  </Box>
);