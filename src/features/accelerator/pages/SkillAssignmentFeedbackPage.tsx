import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
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

type ReviewTab =
  | 'feedback'
  | 'requirements'
  | 'code'
  | 'suggestions';

const strengths = [
  'Correct use of Context API with a clean provider setup.',
  'All core cart features (add, remove, update, clear) work properly.',
  'Good component structure and separation of concerns.',
];

const improvements = [
  'Add input validation (e.g., quantity ≥ 1).',
  'Handle empty cart state with a better UI.',
  'Add unit tests for cart context and key components.',
];

const requirements = [
  'CartContext (add, remove, update, clear)',
  'CartProvider at app level',
  'ProductList to add items',
  'Cart page with quantity & remove',
  'Cart count in Navbar',
];

const codeReviewItems = [
  {
    title: 'Context structure',
    description:
      'Context responsibilities are separated clearly and the provider is easy to understand.',
    status: 'Good',
  },
  {
    title: 'State updates',
    description:
      'Cart operations are structured cleanly. Add additional guards for invalid quantities.',
    status: 'Good',
  },
  {
    title: 'Component design',
    description:
      'Product and cart UI responsibilities are separated into reusable components.',
    status: 'Good',
  },
];

const suggestions = [
  'Persist cart state using localStorage.',
  'Prevent invalid or negative quantities.',
  'Add loading and empty-cart states.',
  'Add unit tests for CartContext.',
  'Consider useMemo for the context value if the app grows.',
];

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
            xs: 1.6,
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

const SuccessRow = ({
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
        color: '#0caf70',
        fontSize: 20,
        mt: '1px',
        flexShrink: 0,
      }}
    />

    <Typography
      sx={{
        color: '#27314a',
        fontSize: '0.77rem',
        lineHeight: 1.5,
      }}
    >
      {children}
    </Typography>
  </Stack>
);

export const SkillAssignmentFeedbackPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [activeTab, setActiveTab] =
    useState<ReviewTab>('feedback');

  /*
   * TEMPORARY FRONTEND REVIEW DATA.
   *
   * Do not treat the values below as a real
   * assignment evaluation.
   *
   * TODO BACKEND:
   * - Load submitted assignment attempt
   * - Load requirement evaluation
   * - Load code metrics
   * - Load reviewer/AI evaluation
   * - Load final score
   * - Load feedback
   * - Persist module completion
   * - Unlock module assessment
   */

  const score = 92;
  const moduleProgress = 100;
  const linesOfCode = 260;
  const reviewTime = '3 m 42 s';
  const complexity = 'Medium';

  const navigateToScreen = (
    screen: string,
  ) => {
    const params =
      new URLSearchParams(searchParams);

    params.set('type', 'skill');
    params.set('screen', screen);
    params.set('module', '1');

    setSearchParams(params);
  };

  const handleBack = () => {
    navigateToScreen('skill-assignment');
  };

  const handleModuleAssessment = () => {
    /*
     * Reuse the Skill Assessment engine.
     *
     * Later the backend should provide the
     * assessment type/module ID instead of
     * relying only on query parameters.
     */
    const params =
      new URLSearchParams(searchParams);

    params.set('type', 'skill');
    params.set('screen', 'skill-assessment');
    params.set('assessmentType', 'module');
    params.set('module', '1');

    setSearchParams(params);
  };

  const handleViewSubmittedCode = () => {
    /*
     * Do not open a fake GitHub URL.
     *
     * Once the assignment API returns the real
     * submission URL, this button can open it.
     */
    setActiveTab('code');
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
          'Assignment',
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
          Review & Feedback
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
            onClick={handleBack}
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
            Back to Assignment
          </Button>

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
                fontWeight: 950,
                fontSize: '0.88rem',
              }}
            >
              React – State Management
            </Typography>
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ mt: 1.7 }}
          >
            <Typography
              sx={{
                color: '#344054',
                fontSize: '0.75rem',
                fontWeight: 800,
              }}
            >
              Module Progress
            </Typography>

            <Typography
              sx={{
                color: '#172033',
                fontSize: '0.75rem',
                fontWeight: 950,
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
              mb: 2,
              height: 9,
              borderRadius: 99,
              bgcolor: '#e2e7ed',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#0caf70',
                borderRadius: 99,
              },
            }}
          />

          <Stack spacing={0.45}>
            <ModuleStep
              number={1}
              label="Learn (4 lessons)"
              completed
            />

            <ModuleStep
              number={2}
              label="Practice (3 problems)"
              completed
            />

            <ModuleStep
              number={3}
              label="Results"
              completed
            />

            <ModuleStep
              number={4}
              label="Assignment"
              completed
            />

            <ModuleStep
              number={5}
              label="Review & Feedback"
              active
            />
          </Stack>
        </Box>

        {/* MAIN */}
        <Box>
          {/* HERO */}
          <Box
            sx={{
              borderRadius: 3.5,
              overflow: 'hidden',
              color: '#fff',
              background:
                'linear-gradient(105deg, #30288c 0%, #5b35eb 55%, #7d35f2 100%)',
              px: {
                xs: 2,
                md: 2.7,
              },
              py: 2.1,
            }}
          >
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
            >
              <Stack
                direction="row"
                spacing={1.7}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 82,
                    height: 82,
                    flexShrink: 0,
                    borderRadius: 2.5,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor:
                      'rgba(255,255,255,0.12)',
                    border:
                      '1px solid rgba(255,255,255,0.25)',
                  }}
                >
                  <EmojiEventsRoundedIcon
                    sx={{
                      color: '#ffd84a',
                      fontSize: 49,
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
                    Assignment Review & Feedback
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.3,
                      color:
                        'rgba(255,255,255,0.92)',
                      fontSize: {
                        xs: '0.8rem',
                        md: '1rem',
                      },
                    }}
                  >
                    Context API – E-commerce Cart
                  </Typography>
                </Box>
              </Stack>

              <Chip
                icon={
                  <CheckCircleRoundedIcon />
                }
                label="Reviewed"
                sx={{
                  bgcolor: '#c8f8df',
                  color: '#087a52',
                  fontWeight: 950,
                  '& .MuiChip-icon': {
                    color: '#0caf70',
                  },
                }}
              />
            </Stack>
          </Box>

          <Box
            sx={{
              mt: 2,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                xl: 'minmax(0, 1.6fr) minmax(310px, 0.8fr)',
              },
              gap: 2,
              alignItems: 'start',
            }}
          >
            {/* CENTER */}
            <Stack spacing={2}>
              {/* SCORE */}
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
                  <ScoreCircle value={score} />

                  <Box>
                    <Typography
                      sx={{
                        color: '#101828',
                        fontWeight: 950,
                        fontSize: {
                          xs: '1.5rem',
                          md: '1.9rem',
                        },
                      }}
                    >
                      Great Work!
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.55,
                        maxWidth: 620,
                        color: '#344054',
                        fontSize: '0.88rem',
                        lineHeight: 1.55,
                      }}
                    >
                      Your assignment is reviewed
                      and meets most of the
                      requirements. A few
                      improvements can make it
                      production ready.
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
                    gap: 1.1,
                  }}
                >
                  <MetricCard
                    icon={
                      <CheckCircleRoundedIcon />
                    }
                    value="5/5"
                    label="Requirements"
                    green
                  />

                  <MetricCard
                    icon={<CodeRoundedIcon />}
                    value={`${linesOfCode}`}
                    label="Lines of Code"
                  />

                  <MetricCard
                    icon={<TimerOutlinedIcon />}
                    value={reviewTime}
                    label="Review Time"
                  />

                  <MetricCard
                    icon={<SpeedRoundedIcon />}
                    value={complexity}
                    label="Complexity"
                  />
                </Box>
              </Panel>

              {/* REVIEW TABS */}
              <Panel padding={false}>
                <Tabs
                  value={activeTab}
                  onChange={(_, value) =>
                    setActiveTab(value)
                  }
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    px: 1,
                    borderBottom:
                      '1px solid #e3e7ed',
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 850,
                      fontSize: '0.74rem',
                    },
                  }}
                >
                  <Tab
                    value="feedback"
                    label="Feedback"
                  />

                  <Tab
                    value="requirements"
                    label="Requirement Check"
                  />

                  <Tab
                    value="code"
                    label="Code Review"
                  />

                  <Tab
                    value="suggestions"
                    label="Suggestions"
                  />
                </Tabs>

                <Box sx={{ p: 1.7 }}>
                  {activeTab === 'feedback' && (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          md: 'minmax(0, 1.45fr) minmax(230px, 0.7fr)',
                        },
                        gap: 1.5,
                      }}
                    >
                      <Stack spacing={1.5}>
                        {/* GOOD */}
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2.5,
                            bgcolor: '#edfff5',
                            border:
                              '1px solid #c8f1dc',
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <AssignmentTurnedInRoundedIcon
                              sx={{
                                color: '#0caf70',
                              }}
                            />

                            <Typography
                              sx={{
                                color: '#172033',
                                fontWeight: 950,
                                fontSize: '0.92rem',
                              }}
                            >
                              What You Did Well
                            </Typography>
                          </Stack>

                          <Stack
                            spacing={0.8}
                            sx={{ mt: 1.2 }}
                          >
                            {strengths.map(
                              (item) => (
                                <SuccessRow
                                  key={item}
                                >
                                  {item}
                                </SuccessRow>
                              ),
                            )}
                          </Stack>
                        </Box>

                        {/* IMPROVE */}
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2.5,
                            bgcolor: '#fff9e8',
                            border:
                              '1px solid #f4df9d',
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <WarningAmberRoundedIcon
                              sx={{
                                color: '#f5a300',
                              }}
                            />

                            <Typography
                              sx={{
                                color: '#172033',
                                fontWeight: 950,
                                fontSize: '0.92rem',
                              }}
                            >
                              Areas to Improve
                            </Typography>
                          </Stack>

                          <Stack
                            spacing={0.8}
                            sx={{ mt: 1.2 }}
                          >
                            {improvements.map(
                              (item) => (
                                <Stack
                                  key={item}
                                  direction="row"
                                  spacing={1}
                                  alignItems="flex-start"
                                >
                                  <WarningAmberRoundedIcon
                                    sx={{
                                      mt: '1px',
                                      color:
                                        '#f5a300',
                                      fontSize: 19,
                                      flexShrink: 0,
                                    }}
                                  />

                                  <Typography
                                    sx={{
                                      color:
                                        '#27314a',
                                      fontSize:
                                        '0.77rem',
                                      lineHeight:
                                        1.5,
                                    }}
                                  >
                                    {item}
                                  </Typography>
                                </Stack>
                              ),
                            )}
                          </Stack>
                        </Box>
                      </Stack>

                      {/* SUMMARY */}
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2.5,
                          bgcolor: '#fbfcfe',
                          border:
                            '1px solid #dfe4ec',
                        }}
                      >
                        <Typography
                          sx={{
                            color: '#172033',
                            fontWeight: 950,
                            fontSize: '0.95rem',
                          }}
                        >
                          Summary
                        </Typography>

                        <Stack
                          spacing={1.1}
                          sx={{ mt: 1.4 }}
                        >
                          <SummaryRow
                            label="Status"
                            value={
                              <Chip
                                label="Passed"
                                size="small"
                                sx={{
                                  bgcolor:
                                    '#dcf8ea',
                                  color:
                                    '#087a52',
                                  fontWeight:
                                    900,
                                }}
                              />
                            }
                          />

                          <SummaryRow
                            label="Score"
                            value={`${score} / 100`}
                          />

                          <SummaryRow
                            label="Reviewed By"
                            value="AI Reviewer"
                          />

                          <SummaryRow
                            label="Reviewed On"
                            value="18 Nov 2026"
                          />
                        </Stack>

                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<GitHubIcon />}
                          onClick={
                            handleViewSubmittedCode
                          }
                          sx={{
                            mt: 1.7,
                            minHeight: 44,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 850,
                          }}
                        >
                          View Submitted Code
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {activeTab ===
                    'requirements' && (
                    <Stack spacing={1}>
                      <Typography
                        sx={{
                          color: '#172033',
                          fontWeight: 950,
                          fontSize: '1rem',
                        }}
                      >
                        Requirement Evaluation
                      </Typography>

                      {requirements.map(
                        (requirement) => (
                          <Box
                            key={requirement}
                            sx={{
                              p: 1.2,
                              borderRadius: 2,
                              border:
                                '1px solid #e1e6ee',
                              bgcolor: '#fbfcfe',
                            }}
                          >
                            <SuccessRow>
                              {requirement}
                            </SuccessRow>
                          </Box>
                        ),
                      )}
                    </Stack>
                  )}

                  {activeTab === 'code' && (
                    <Stack spacing={1.2}>
                      <Typography
                        sx={{
                          color: '#172033',
                          fontWeight: 950,
                          fontSize: '1rem',
                        }}
                      >
                        Code Review
                      </Typography>
{codeReviewItems.map((item) => (
  <Box
    key={item.title}
    sx={{
      p: 1.4,
      borderRadius: 2,
      border: '1px solid #e1e6ee',
    }}
  >
    <Stack
      direction="row"
      justifyContent="space-between"
      spacing={1}
    >
      <Typography
        sx={{
          color: '#172033',
          fontWeight: 900,
          fontSize: '0.82rem',
        }}
      >
        {item.title}
      </Typography>

      <Chip
        label={item.status}
        size="small"
        sx={{
          bgcolor: '#dcf8ea',
          color: '#087a52',
          fontWeight: 850,
        }}
      />
    </Stack>

    <Typography
      sx={{
        mt: 0.6,
        color: '#667085',
        fontSize: '0.75rem',
        lineHeight: 1.5,
      }}
    >
      {item.description}
    </Typography>
  </Box>
))}

                      <Typography
                        sx={{
                          color: '#98a2b3',
                          fontSize: '0.65rem',
                        }}
                      >
                        The real submitted source
                        code will be displayed here
                        after the assignment API
                        provides the learner&apos;s
                        submission.
                      </Typography>
                    </Stack>
                  )}

                  {activeTab ===
                    'suggestions' && (
                    <Stack spacing={1}>
                      <Typography
                        sx={{
                          color: '#172033',
                          fontWeight: 950,
                          fontSize: '1rem',
                        }}
                      >
                        Recommended Improvements
                      </Typography>

                      {suggestions.map(
                        (suggestion) => (
                          <Stack
                            key={suggestion}
                            direction="row"
                            spacing={1}
                            alignItems="flex-start"
                            sx={{
                              p: 1.1,
                              borderRadius: 2,
                              bgcolor: '#f8f7ff',
                            }}
                          >
                            <RocketLaunchRoundedIcon
                              sx={{
                                color: '#563cf0',
                                fontSize: 20,
                                mt: '1px',
                              }}
                            />

                            <Typography
                              sx={{
                                color: '#344054',
                                fontSize:
                                  '0.77rem',
                                lineHeight: 1.5,
                              }}
                            >
                              {suggestion}
                            </Typography>
                          </Stack>
                        ),
                      )}
                    </Stack>
                  )}
                </Box>
              </Panel>

              <Button
                variant="outlined"
                startIcon={
                  <ArrowBackRoundedIcon />
                }
                onClick={handleBack}
                sx={{
                  width: 'fit-content',
                  minHeight: 48,
                  px: 3,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 850,
                }}
              >
                Back to Assignment
              </Button>
            </Stack>

            {/* RIGHT */}
            <Stack spacing={2}>
              {/* REQUIREMENTS */}
              <Panel>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <AssignmentTurnedInRoundedIcon
                    sx={{
                      color: '#563cf0',
                    }}
                  />

                  <Typography
                    sx={{
                      color: '#172033',
                      fontWeight: 950,
                      fontSize: '1rem',
                    }}
                  >
                    Requirement Checklist
                  </Typography>
                </Stack>

                <Stack
                  spacing={0.9}
                  sx={{ mt: 1.4 }}
                >
                  {requirements.map(
                    (requirement) => (
                      <SuccessRow
                        key={requirement}
                      >
                        {requirement}
                      </SuccessRow>
                    ),
                  )}
                </Stack>
              </Panel>

              {/* REVIEWER NOTE */}
              <Panel>
                <Typography
                  sx={{
                    color: '#563cf0',
                    fontWeight: 950,
                    fontSize: '2rem',
                    lineHeight: 0.8,
                  }}
                >
                  ”
                </Typography>

                <Typography
                  sx={{
                    mt: 0.8,
                    color: '#172033',
                    fontWeight: 950,
                    fontSize: '1rem',
                  }}
                >
                  Reviewer&apos;s Note
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: '#344054',
                    fontSize: '0.78rem',
                    lineHeight: 1.6,
                  }}
                >
                  A solid implementation of
                  Context API for cart management.
                  The code is clean and
                  functional. Address the minor
                  suggestions for a more robust
                  solution.
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: '#98a2b3',
                    fontSize: '0.63rem',
                    lineHeight: 1.4,
                  }}
                >
                  Temporary review copy until the
                  real assignment evaluation
                  service is connected.
                </Typography>
              </Panel>

              {/* NEXT */}
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
                      fontSize: '1rem',
                    }}
                  >
                    Next in Module
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="flex-start"
                  sx={{ mt: 1.2 }}
                >
                  <CheckCircleRoundedIcon
                    sx={{
                      color: '#0caf70',
                      fontSize: 22,
                    }}
                  />

                  <Typography
                    sx={{
                      color: '#344054',
                      fontSize: '0.78rem',
                      lineHeight: 1.5,
                    }}
                  >
                    Complete the module and take
                    the Module Assessment to
                    validate your React State
                    Management skills.
                  </Typography>
                </Stack>

                <Button
                  fullWidth
                  variant="contained"
                  endIcon={
                    <ArrowForwardRoundedIcon />
                  }
                  onClick={
                    handleModuleAssessment
                  }
                  sx={{
                    mt: 1.6,
                    minHeight: 50,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 900,
                    boxShadow: 'none',
                    background:
                      'linear-gradient(90deg, #6734f2, #5138e8)',
                  }}
                >
                  Take Module Assessment
                </Button>
              </Panel>
            </Stack>
          </Box>

          <Typography
            sx={{
              mt: 1.4,
              textAlign: 'center',
              color: '#98a2b3',
              fontSize: '0.65rem',
            }}
          >
            Score, requirement checks, code
            metrics, reviewer information and
            feedback shown here are temporary UI
            values until the assignment evaluation
            backend is connected.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const ScoreCircle = ({
  value,
}: {
  value: number;
}) => (
  <Box
    sx={{
      position: 'relative',
      width: 145,
      height: 145,
      flexShrink: 0,
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: `conic-gradient(
          #0caf70 0% ${value}%,
          #e1e6ed ${value}% 100%
        )`,
      }}
    />

    <Box
      sx={{
        position: 'absolute',
        inset: 13,
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
          fontSize: '1.75rem',
        }}
      >
        {value}
        <Box
          component="span"
          sx={{
            fontSize: '0.85rem',
          }}
        >
          /100
        </Box>
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
      p: 1.25,
      borderRadius: 2.2,
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
            ? '#0caf70'
            : '#563cf0',
          display: 'grid',
          placeItems: 'center',
          '& svg': {
            fontSize: 28,
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
            fontSize: '0.66rem',
          }}
        >
          {label}
        </Typography>
      </Box>
    </Stack>
  </Box>
);

const SummaryRow = ({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    spacing={1}
    alignItems="center"
  >
    <Typography
      sx={{
        color: '#475467',
        fontSize: '0.72rem',
      }}
    >
      {label}:
    </Typography>

    {typeof value === 'string' ? (
      <Typography
        sx={{
          color: '#172033',
          fontWeight: 900,
          fontSize: '0.74rem',
          textAlign: 'right',
        }}
      >
        {value}
      </Typography>
    ) : (
      value
    )}
  </Stack>
);

const ModuleStep = ({
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
      py: 0.85,
      borderRadius: 2,
      bgcolor: active
        ? '#eee9ff'
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
            ? '#e2d9ff'
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
          fontSize: '0.73rem',
        }}
      >
        {label}
      </Typography>

      {completed && (
        <CheckCircleRoundedIcon
          sx={{
            color: '#0caf70',
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