import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import {
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  type ReactNode,
  useEffect,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

type TestStatus =
  | 'pending'
  | 'passed'
  | 'failed';

type TestCase = {
  id: number;
  title: string;
  status: TestStatus;
};

const initialTestCases: TestCase[] = [
  {
    id: 1,
    title: 'Renders app without errors',
    status: 'pending',
  },
  {
    id: 2,
    title: 'Toggles theme to dark',
    status: 'pending',
  },
  {
    id: 3,
    title: 'Toggles theme back to light',
    status: 'pending',
  },
];

const requirements = [
  'Create a ThemeContext with default "light" theme.',
  'Wrap the app with ThemeProvider.',
  'Add a toggle button to switch between light and dark.',
  'Apply the theme in a component (e.g., background, text color).',
];

const appCode = `import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

export default function App() {
  return (
    <ThemeProvider>
      <div className="app">
        <h1>Theme Switcher Demo</h1>
        <p>
          This is a simple app using Context API.
        </p>

        <ThemeToggle />
      </div>
    </ThemeProvider>
  );
}`;

const contextCode = `import {
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

const toggleCode = `import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      {theme === 'light'
        ? 'Switch to Dark'
        : 'Switch to Light'}
    </button>
  );
}`;

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
      boxShadow:
        '0 4px 16px rgba(15,23,42,0.035)',
    }}
  >
    {children}
  </Box>
);

const TestStatusChip = ({
  status,
}: {
  status: TestStatus;
}) => {
  if (status === 'passed') {
    return (
      <Chip
        size="small"
        label="Passed"
        sx={{
          bgcolor: '#dcf8ea',
          color: '#087a52',
          fontWeight: 850,
          fontSize: '0.64rem',
        }}
      />
    );
  }

  if (status === 'failed') {
    return (
      <Chip
        size="small"
        label="Failed"
        sx={{
          bgcolor: '#ffeaed',
          color: '#c92b45',
          fontWeight: 850,
          fontSize: '0.64rem',
        }}
      />
    );
  }

  return (
    <Chip
      size="small"
      label="Pending"
      sx={{
        bgcolor: '#edf0f5',
        color: '#475467',
        fontWeight: 800,
        fontSize: '0.64rem',
      }}
    />
  );
};

export const SkillPracticeSessionPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [seconds, setSeconds] = useState(34);
  const [activeFile, setActiveFile] =
    useState('App.jsx');
  const [rightTab, setRightTab] = useState(0);
  const [bottomTab, setBottomTab] = useState(0);
  const [hasRun, setHasRun] = useState(false);
  const [testCases, setTestCases] =
    useState<TestCase[]>(initialTestCases);

  /*
   * TEMPORARY FRONTEND PRACTICE SESSION.
   *
   * TODO BACKEND:
   * - Load practice attempt
   * - Persist code
   * - Execute code safely
   * - Evaluate tests
   * - Store hints used
   * - Submit attempt
   * - Return real score/results
   */

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((value) => value + 1);
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const formatTime = (value: number) => {
    const minutes = Math.floor(value / 60);
    const remainingSeconds = value % 60;

    return `${String(minutes).padStart(
      2,
      '0',
    )}:${String(remainingSeconds).padStart(
      2,
      '0',
    )}`;
  };

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

  const handleReset = () => {
    setActiveFile('App.jsx');
    setRightTab(0);
    setBottomTab(0);
    setHasRun(false);
    setTestCases(initialTestCases);
    setSeconds(0);
  };

  const handleRunCode = () => {
    /*
     * UI simulation only.
     *
     * We intentionally do not claim that the
     * React code was actually compiled or run.
     */
    setHasRun(true);
    setBottomTab(0);

    setTestCases([
      {
        id: 1,
        title: 'Renders app without errors',
        status: 'pending',
      },
      {
        id: 2,
        title: 'Toggles theme to dark',
        status: 'pending',
      },
      {
        id: 3,
        title: 'Toggles theme back to light',
        status: 'pending',
      },
    ]);
  };

  const handleSubmit = () => {
    /*
     * S11 - Practice Results.
     *
     * Submission is disabled until real
     * execution/test results exist.
     */
    if (!hasRun) {
      return;
    }

    const params =
      new URLSearchParams(searchParams);

    params.set('type', 'skill');
    params.set(
      'screen',
      'skill-practice-results',
    );
    params.set('module', '1');
    params.set('lesson', '2');
    params.set('problem', '1');

    setSearchParams(params);
  };

  const currentCode = () => {
    if (activeFile === 'ThemeContext.jsx') {
      return contextCode;
    }

    if (activeFile === 'ThemeToggle.jsx') {
      return toggleCode;
    }

    return appCode;
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1600,
        mx: 'auto',
        px: {
          xs: 1.2,
          sm: 1.7,
          lg: 2,
        },
        py: 2,
      }}
    >
      {/* Breadcrumb */}
      <Stack
        direction="row"
        spacing={0.7}
        useFlexGap
        flexWrap="wrap"
        alignItems="center"
        sx={{ mb: 1.4 }}
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
                fontWeight: 700,
                fontSize: '0.73rem',
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
            fontWeight: 900,
            fontSize: '0.73rem',
          }}
        >
          Theme Switcher
        </Typography>
      </Stack>

      {/* Hero */}
      <Box
        sx={{
          borderRadius: 3.5,
          overflow: 'hidden',
          color: '#fff',
          background:
            'linear-gradient(105deg, #30288c 0%, #5434e8 52%, #7138f4 100%)',
          px: {
            xs: 1.7,
            md: 2.4,
          },
          py: 1.7,
        }}
      >
        <Stack
          direction={{
            xs: 'column',
            lg: 'row',
          }}
          justifyContent="space-between"
          alignItems={{
            xs: 'flex-start',
            lg: 'center',
          }}
          spacing={2}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <Box
              sx={{
                width: 70,
                height: 70,
                flexShrink: 0,
                borderRadius: 2.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor:
                  'rgba(255,255,255,0.12)',
                border:
                  '1px solid rgba(255,255,255,0.18)',
              }}
            >
              <CodeRoundedIcon
                sx={{
                  fontSize: 40,
                }}
              />
            </Box>

            <Box>
              <Typography
                component="h1"
                sx={{
                  fontWeight: 950,
                  fontSize: {
                    xs: '1.3rem',
                    md: '1.65rem',
                  },
                  letterSpacing: '-0.025em',
                }}
              >
                Practice Session: Theme Switcher
                (Context API)
              </Typography>

              <Typography
                sx={{
                  mt: 0.35,
                  color:
                    'rgba(255,255,255,0.9)',
                  fontSize: '0.82rem',
                }}
              >
                Build a React app using Context
                API to manage a global theme
                (light/dark).
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={1}
            alignItems={{
              xs: 'flex-start',
              sm: 'center',
            }}
          >
            <Stack spacing={0.5}>
              <Chip
                label="In Progress"
                size="small"
                sx={{
                  bgcolor: '#c8f8df',
                  color: '#087a52',
                  fontWeight: 900,
                }}
              />

              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
              >
                <TimerOutlinedIcon
                  sx={{
                    fontSize: 18,
                  }}
                />

                <Typography
                  sx={{
                    color: '#fff',
                    fontWeight: 850,
                    fontSize: '0.78rem',
                  }}
                >
                  {formatTime(seconds)}
                </Typography>
              </Stack>
            </Stack>

            <Button
              variant="outlined"
              startIcon={
                <RefreshRoundedIcon />
              }
              onClick={handleReset}
              sx={{
                color: '#fff',
                borderColor:
                  'rgba(255,255,255,0.75)',
                textTransform: 'none',
                fontWeight: 850,
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#fff',
                  bgcolor:
                    'rgba(255,255,255,0.08)',
                },
              }}
            >
              Reset
            </Button>

            <Button
              variant="contained"
              endIcon={
                <PlayArrowRoundedIcon />
              }
              onClick={handleRunCode}
              sx={{
                bgcolor: '#fff',
                color: '#5138e8',
                textTransform: 'none',
                fontWeight: 900,
                borderRadius: 2,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#f8f7ff',
                },
              }}
            >
              Run Code
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Workspace */}
      <Box
        sx={{
          mt: 1.5,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl: 'minmax(0, 2fr) minmax(310px, 0.85fr)',
          },
          gap: 1.5,
          alignItems: 'start',
        }}
      >
        {/* LEFT WORKSPACE */}
        <Stack spacing={1.5}>
          <Panel>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: '210px minmax(0, 1fr)',
                },
                minHeight: 440,
              }}
            >
              {/* Files */}
              <Box
                sx={{
                  borderRight: {
                    xs: 'none',
                    md: '1px solid #e3e7ed',
                  },
                  borderBottom: {
                    xs: '1px solid #e3e7ed',
                    md: 'none',
                  },
                }}
              >
                <Typography
                  sx={{
                    px: 1.5,
                    py: 1.2,
                    color: '#563cf0',
                    fontWeight: 900,
                    fontSize: '0.8rem',
                    borderBottom:
                      '2px solid #563cf0',
                    display: 'inline-block',
                  }}
                >
                  Files
                </Typography>

                <Box sx={{ p: 1.2 }}>
                  <FileFolder
                    label="src"
                    level={0}
                  />

                  <FileFolder
                    label="context"
                    level={1}
                  />

                  <FileButton
                    label="ThemeContext.jsx"
                    level={2}
                    active={
                      activeFile ===
                      'ThemeContext.jsx'
                    }
                    onClick={() =>
                      setActiveFile(
                        'ThemeContext.jsx',
                      )
                    }
                  />

                  <FileFolder
                    label="components"
                    level={1}
                  />

                  <FileButton
                    label="Navbar.jsx"
                    level={2}
                    active={false}
                  />

                  <FileButton
                    label="ThemeToggle.jsx"
                    level={2}
                    active={
                      activeFile ===
                      'ThemeToggle.jsx'
                    }
                    onClick={() =>
                      setActiveFile(
                        'ThemeToggle.jsx',
                      )
                    }
                  />

                  <FileButton
                    label="App.jsx"
                    level={1}
                    active={
                      activeFile === 'App.jsx'
                    }
                    onClick={() =>
                      setActiveFile('App.jsx')
                    }
                  />

                  <FileButton
                    label="main.jsx"
                    level={1}
                    active={false}
                  />

                  <FileButton
                    label="package.json"
                    level={0}
                    active={false}
                  />
                </Box>
              </Box>

              {/* Editor */}
              <Box
                sx={{
                  minWidth: 0,
                }}
              >
                {/* Editor tabs */}
                <Stack
                  direction="row"
                  sx={{
                    overflowX: 'auto',
                    bgcolor: '#f8f8fb',
                    borderBottom:
                      '1px solid #e1e5ed',
                  }}
                >
                  {[
                    'App.jsx',
                    'ThemeContext.jsx',
                    'ThemeToggle.jsx',
                  ].map((file) => (
                    <Button
                      key={file}
                      onClick={() =>
                        setActiveFile(file)
                      }
                      startIcon={
                        <CodeRoundedIcon />
                      }
                      sx={{
                        flexShrink: 0,
                        px: 1.5,
                        py: 1,
                        borderRadius: 0,
                        color:
                          activeFile === file
                            ? '#172033'
                            : '#667085',
                        bgcolor:
                          activeFile === file
                            ? '#fff'
                            : 'transparent',
                        borderTop:
                          activeFile === file
                            ? '2px solid #563cf0'
                            : '2px solid transparent',
                        textTransform: 'none',
                        fontWeight: 800,
                        fontSize: '0.7rem',
                      }}
                    >
                      {file}
                    </Button>
                  ))}
                </Stack>

                {/* Code */}
                <Box
                  sx={{
                    minHeight: 390,
                    bgcolor: '#151b27',
                    overflow: 'auto',
                  }}
                >
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 2,
                      minWidth: 650,
                      color: '#e5e7eb',
                      fontFamily:
                        'Consolas, Monaco, monospace',
                      fontSize: '0.78rem',
                      lineHeight: 1.75,
                      whiteSpace: 'pre',
                    }}
                  >
                    {currentCode()}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Panel>

          {/* Tests / output */}
          <Panel>
            <Tabs
              value={bottomTab}
              onChange={(_, value) =>
                setBottomTab(value)
              }
              sx={{
                px: 1,
                minHeight: 46,
                borderBottom:
                  '1px solid #e3e7ed',
                '& .MuiTab-root': {
                  minHeight: 46,
                  textTransform: 'none',
                  fontWeight: 850,
                  fontSize: '0.73rem',
                },
              }}
            >
              <Tab
                icon={
                  <ScienceRoundedIcon />
                }
                iconPosition="start"
                label="Test Cases (3)"
              />

              <Tab
                icon={
                  <PlayArrowRoundedIcon />
                }
                iconPosition="start"
                label="Output"
              />

              <Tab
                icon={
                  <TerminalRoundedIcon />
                }
                iconPosition="start"
                label="Console"
              />
            </Tabs>

            {bottomTab === 0 && (
              <Box
                sx={{
                  p: 1.5,
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: 'minmax(0, 1.4fr) minmax(220px, 0.7fr)',
                  },
                  gap: 1.5,
                }}
              >
                <Stack
                  divider={
                    <Divider
                      flexItem
                      sx={{
                        borderColor: '#edf0f4',
                      }}
                    />
                  }
                >
                  {testCases.map((test) => (
                    <Stack
                      key={test.id}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{
                        py: 0.8,
                      }}
                    >
                      <Box
                        sx={{
                          width: 25,
                          height: 25,
                          borderRadius: '50%',
                          bgcolor: '#edf0f5',
                          display: 'grid',
                          placeItems: 'center',
                          color: '#172033',
                          fontWeight: 850,
                          fontSize: '0.7rem',
                        }}
                      >
                        {test.id}
                      </Box>

                      <Typography
                        sx={{
                          flex: 1,
                          color: '#172033',
                          fontWeight: 700,
                          fontSize: '0.74rem',
                        }}
                      >
                        {test.title}
                      </Typography>

                      <TestStatusChip
                        status={test.status}
                      />
                    </Stack>
                  ))}
                </Stack>

                <Box
                  sx={{
                    minHeight: 130,
                    borderRadius: 2.5,
                    bgcolor: '#f2efff',
                    display: 'grid',
                    placeItems: 'center',
                    p: 2,
                    textAlign: 'center',
                  }}
                >
                  <Box>
                    <ScienceRoundedIcon
                      sx={{
                        color: '#563cf0',
                        fontSize: 40,
                      }}
                    />

                    <Typography
                      sx={{
                        mt: 0.6,
                        color: '#172033',
                        fontWeight: 900,
                        fontSize: '0.8rem',
                      }}
                    >
                      {hasRun
                        ? 'Execution service not connected'
                        : 'Run your code to test'}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.4,
                        color: '#475467',
                        fontSize: '0.68rem',
                        lineHeight: 1.45,
                      }}
                    >
                      {hasRun
                        ? 'Your code was not actually executed. Real test results require the practice execution backend.'
                        : 'Click “Run Code” to execute and check all test cases.'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {bottomTab === 1 && (
              <Box sx={{ p: 2 }}>
                <Typography
                  sx={{
                    color: '#172033',
                    fontWeight: 900,
                  }}
                >
                  Application Output
                </Typography>

                <Typography
                  sx={{
                    mt: 0.8,
                    color: '#667085',
                    fontSize: '0.78rem',
                  }}
                >
                  Runtime preview will appear
                  here after the secure code
                  execution service is connected.
                </Typography>
              </Box>
            )}

            {bottomTab === 2 && (
              <Box
                sx={{
                  m: 1.5,
                  p: 1.5,
                  minHeight: 110,
                  borderRadius: 2,
                  bgcolor: '#111827',
                }}
              >
                <Typography
                  sx={{
                    color: '#d1d5db',
                    fontFamily:
                      'Consolas, Monaco, monospace',
                    fontSize: '0.75rem',
                  }}
                >
                  &gt; Console ready.
                </Typography>
              </Box>
            )}
          </Panel>
        </Stack>

        {/* RIGHT */}
        <Stack spacing={1.5}>
          <Panel>
            <Tabs
              value={rightTab}
              onChange={(_, value) =>
                setRightTab(value)
              }
              variant="fullWidth"
              sx={{
                minHeight: 46,
                borderBottom:
                  '1px solid #e3e7ed',
                '& .MuiTab-root': {
                  minHeight: 46,
                  textTransform: 'none',
                  fontWeight: 850,
                  fontSize: '0.7rem',
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
                  <LightbulbRoundedIcon />
                }
                iconPosition="start"
                label="Hints"
              />

              <Tab
                icon={
                  <DescriptionRoundedIcon />
                }
                iconPosition="start"
                label="Solution"
              />
            </Tabs>

            {rightTab === 0 && (
              <Box sx={{ p: 1.7 }}>
                <Typography
                  sx={{
                    color: '#172033',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                  }}
                >
                  Requirements
                </Typography>

                <Stack
                  spacing={1}
                  sx={{ mt: 1.3 }}
                >
                  {requirements.map(
                    (requirement) => (
                      <Stack
                        key={requirement}
                        direction="row"
                        spacing={0.8}
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
                              '0.73rem',
                            lineHeight:
                              1.45,
                          }}
                        >
                          {requirement}
                        </Typography>
                      </Stack>
                    ),
                  )}
                </Stack>

                <Divider sx={{ my: 1.7 }} />

                <Typography
                  sx={{
                    color: '#172033',
                    fontWeight: 900,
                    fontSize: '0.9rem',
                  }}
                >
                  Expected Output
                </Typography>

                <Box
                  sx={{
                    mt: 1.2,
                    display: 'grid',
                    gridTemplateColumns:
                      '1fr 1fr',
                    gap: 1,
                  }}
                >
                  <ThemePreview
                    dark={false}
                  />

                  <ThemePreview dark />
                </Box>

                <Box
                  sx={{
                    mt: 1.5,
                    p: 1.3,
                    borderRadius: 2,
                    bgcolor: '#fafafa',
                    border:
                      '1px solid #e5e9ef',
                  }}
                >
                  <Typography
                    sx={{
                      color: '#172033',
                      fontWeight: 900,
                      fontSize: '0.78rem',
                    }}
                  >
                    Note
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      color: '#475467',
                      fontSize: '0.7rem',
                      lineHeight: 1.5,
                    }}
                  >
                    Use React Context API. Do
                    not use external state
                    management libraries.
                  </Typography>
                </Box>
              </Box>
            )}

            {rightTab === 1 && (
              <Box sx={{ p: 1.7 }}>
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
                    }}
                  >
                    Hints
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    mt: 1.2,
                    color: '#667085',
                    fontSize: '0.76rem',
                    lineHeight: 1.6,
                  }}
                >
                  Hint content will be loaded
                  according to the learner&apos;s
                  attempt and hint-usage rules.
                  No generated solution is shown
                  here yet.
                </Typography>
              </Box>
            )}

            {rightTab === 2 && (
              <Box sx={{ p: 1.7 }}>
                <Typography
                  sx={{
                    color: '#172033',
                    fontWeight: 900,
                  }}
                >
                  Solution
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: '#667085',
                    fontSize: '0.76rem',
                    lineHeight: 1.6,
                  }}
                >
                  The official solution remains
                  locked until the backend
                  determines that the learner is
                  allowed to view it.
                </Typography>
              </Box>
            )}
          </Panel>
        </Stack>
      </Box>

      {/* Bottom actions */}
      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{
          mt: 2,
        }}
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
            borderRadius: 2.2,
            textTransform: 'none',
            fontWeight: 850,
          }}
        >
          Previous
        </Button>

        <Button
          variant="contained"
          endIcon={
            <CheckCircleRoundedIcon />
          }
          disabled={!hasRun}
          onClick={handleSubmit}
          sx={{
            minHeight: 50,
            minWidth: {
              xs: '100%',
              sm: 250,
            },
            borderRadius: 2.2,
            textTransform: 'none',
            fontWeight: 900,
            boxShadow: 'none',
            background:
              'linear-gradient(90deg, #6134f3, #5138e8)',
          }}
        >
          Submit Solution
        </Button>
      </Stack>

      <Typography
        sx={{
          mt: 1.2,
          textAlign: 'center',
          color: '#98a2b3',
          fontSize: '0.66rem',
        }}
      >
        This is currently a frontend practice
        workspace. Code execution, automated test
        evaluation and solution submission must
        be connected to the real Skill Practice
        backend before production use.
      </Typography>
    </Box>
  );
};

const FileFolder = ({
  label,
  level,
}: {
  label: string;
  level: number;
}) => (
  <Stack
    direction="row"
    spacing={0.7}
    alignItems="center"
    sx={{
      pl: level * 1.5,
      py: 0.55,
    }}
  >
    <FolderRoundedIcon
      sx={{
        color: '#475467',
        fontSize: 18,
      }}
    />

    <Typography
      sx={{
        color: '#172033',
        fontWeight: 800,
        fontSize: '0.7rem',
      }}
    >
      {label}
    </Typography>
  </Stack>
);

const FileButton = ({
  label,
  level,
  active,
  onClick,
}: {
  label: string;
  level: number;
  active: boolean;
  onClick?: () => void;
}) => (
  <Button
    fullWidth
    onClick={onClick}
    startIcon={
      <InsertDriveFileRoundedIcon />
    }
    sx={{
      justifyContent: 'flex-start',
      pl: 1 + level * 1.5,
      py: 0.65,
      borderRadius: 1.3,
      bgcolor: active
        ? '#f0edff'
        : 'transparent',
      color: active
        ? '#5138e8'
        : '#344054',
      textTransform: 'none',
      fontWeight: active ? 900 : 700,
      fontSize: '0.68rem',
      '&:hover': {
        bgcolor: '#f5f3ff',
      },
    }}
  >
    {label}
  </Button>
);

const ThemePreview = ({
  dark,
}: {
  dark: boolean;
}) => (
  <Box
    sx={{
      minHeight: 145,
      p: 1.2,
      borderRadius: 2,
      border: dark
        ? 'none'
        : '1px solid #d9dee8',
      bgcolor: dark
        ? '#172844'
        : '#fff',
      color: dark
        ? '#fff'
        : '#172033',
    }}
  >
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
    >
      {dark ? (
        <DarkModeRoundedIcon
          sx={{
            fontSize: 18,
          }}
        />
      ) : (
        <LightModeRoundedIcon
          sx={{
            color: '#f5a300',
            fontSize: 18,
          }}
        />
      )}

      <Typography
        sx={{
          fontWeight: 800,
          fontSize: '0.65rem',
        }}
      >
        {dark
          ? 'Dark Theme'
          : 'Light Theme'}
      </Typography>
    </Stack>

    <Box
      sx={{
        mt: 1.3,
        textAlign: 'center',
      }}
    >
      <Typography
        sx={{
          fontWeight: 950,
          fontSize: '0.95rem',
        }}
      >
        Theme Demo
      </Typography>

      <Typography
        sx={{
          mt: 0.5,
          fontSize: '0.65rem',
        }}
      >
        This is {dark ? 'dark' : 'light'} mode.
      </Typography>

      <Button
        size="small"
        variant={dark ? 'outlined' : 'contained'}
        sx={{
          mt: 1.2,
          color: dark
            ? '#fff'
            : undefined,
          borderColor: dark
            ? '#fff'
            : undefined,
          textTransform: 'none',
          fontWeight: 800,
          fontSize: '0.62rem',
          boxShadow: 'none',
        }}
      >
        Switch to {dark ? 'Light' : 'Dark'}
      </Button>
    </Box>
  </Box>
);