import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { type ReactNode, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type Deliverable = {
  id: number;
  label: string;
  completed: boolean;
};

const requirements = [
  'Create CartContext (cart items, add, remove, update quantity, clear cart).',
  'Use CartProvider at the app level.',
  'Build ProductList to add items to cart.',
  'Build Cart page to view, update quantity, and remove items.',
  'Show cart count in Navbar (e.g., Cart (3)).',
];

const initialDeliverables: Deliverable[] = [
  {
    id: 1,
    label: 'Source code (GitHub link or ZIP)',
    completed: true,
  },
  {
    id: 2,
    label: 'Live demo URL (Vercel/Netlify/Render)',
    completed: false,
  },
  {
    id: 3,
    label: 'README with setup & features',
    completed: false,
  },
  {
    id: 4,
    label: 'Short demo (≤ 2 minutes, optional)',
    completed: false,
  },
];

const evaluationCriteria = [
  {
    label: 'Functionality (meets requirements)',
    score: '40%',
  },
  {
    label: 'Code quality & structure',
    score: '20%',
  },
  {
    label: 'Correct use of Context API',
    score: '20%',
  },
  {
    label: 'UI / User experience',
    score: '10%',
  },
  {
    label: 'README & documentation',
    score: '10%',
  },
];

const tips = [
  'Keep the code clean and component-driven.',
  'Use descriptive component and context names.',
  'Add basic validation and edge case handling.',
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
        xs: 1.6,
        md: 2,
      },
      boxShadow:
        '0 4px 16px rgba(15,23,42,0.035)',
    }}
  >
    {children}
  </Box>
);

const SectionTitle = ({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) => (
  <Stack
    direction="row"
    spacing={1}
    alignItems="center"
  >
    <Box
      sx={{
        color: '#563cf0',
        display: 'grid',
        placeItems: 'center',
        '& svg': {
          fontSize: 25,
        },
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        color: '#172033',
        fontWeight: 950,
        fontSize: '1.05rem',
      }}
    >
      {children}
    </Typography>
  </Stack>
);

const CheckRow = ({
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
        lineHeight: 1.5,
      }}
    >
      {children}
    </Typography>
  </Stack>
);

export const SkillHandsOnAssignmentPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [deliverables, setDeliverables] =
    useState<Deliverable[]>(initialDeliverables);

  /*
   * TEMPORARY FRONTEND ASSIGNMENT DATA.
   *
   * TODO BACKEND:
   * - Load assignment by skill/module
   * - Load learner assignment attempt
   * - Persist draft
   * - Upload ZIP / project files
   * - Validate GitHub/demo URLs
   * - Submit assignment
   * - Store submittedAt
   * - Evaluate assignment
   * - Generate feedback
   */

  const moduleProgress = 50;
  const assignmentProgress = 60;

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

  const handleBackToModule = () => {
    navigateToScreen('skill-learning-module');
  };

  const handleBackToResults = () => {
    navigateToScreen('skill-practice-results');
  };

  const handleToggleDeliverable = (
    id: number,
  ) => {
    setDeliverables((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed,
            }
          : item,
      ),
    );
  };

  const handleSaveDraft = () => {
    /*
     * Frontend UI only.
     * Do not claim persistence until a real
     * assignment draft endpoint exists.
     */
  };

  const handleSubmitAssignment = () => {
    /*
     * S13 will be Assignment Review / Feedback.
     *
     * We only navigate for the UI flow.
     * Real production submission must first call
     * the backend and receive a successful
     * assignment submission response.
     */
    navigateToScreen(
      'skill-assignment-feedback',
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
          Assignment
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
        {/* LEFT NAVIGATION */}
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
            onClick={handleBackToModule}
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
            Back to Module
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
                fontSize: '0.9rem',
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
                bgcolor: '#0eaf75',
                borderRadius: 99,
              },
            }}
          />

          <Stack spacing={0.5}>
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
              active
            />

            <ModuleStep
              number={5}
              label="Review & Feedback"
            />
          </Stack>
        </Box>

        {/* CONTENT */}
        <Box>
          {/* HERO */}
          <Box
            sx={{
              borderRadius: 3.5,
              overflow: 'hidden',
              color: '#fff',
              background:
                'linear-gradient(105deg, #30288c 0%, #5935ea 55%, #7b38ef 100%)',
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
                    width: 80,
                    height: 80,
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
                  <AssignmentRoundedIcon
                    sx={{
                      fontSize: 47,
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
                    Hands-on Assignment
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.3,
                      color:
                        'rgba(255,255,255,0.9)',
                      fontSize: {
                        xs: '0.8rem',
                        md: '0.95rem',
                      },
                    }}
                  >
                    Build a mini project to apply
                    everything from this module.
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction={{
                  xs: 'row',
                  md: 'column',
                }}
                spacing={1}
                alignItems={{
                  xs: 'center',
                  md: 'flex-start',
                }}
                useFlexGap
                flexWrap="wrap"
              >
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
                  spacing={0.7}
                  alignItems="center"
                >
                  <CalendarMonthRoundedIcon
                    sx={{
                      fontSize: 20,
                    }}
                  />

                  <Typography
                    sx={{
                      color: '#fff',
                      fontWeight: 850,
                      fontSize: '0.78rem',
                    }}
                  >
                    Due in 3 Days
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Box>

          <Box
            sx={{
              mt: 2,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                xl: 'minmax(0, 1.55fr) minmax(310px, 0.9fr)',
              },
              gap: 2,
              alignItems: 'start',
            }}
          >
            {/* LEFT */}
            <Stack spacing={2}>
              <Panel>
                <Typography
                  sx={{
                    color: '#172033',
                    fontWeight: 950,
                    fontSize: '1.1rem',
                  }}
                >
                  Assignment Details
                </Typography>

                <Divider sx={{ my: 1.2 }} />

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
                >
                  <Typography
                    sx={{
                      color: '#101828',
                      fontWeight: 950,
                      fontSize: {
                        xs: '1.05rem',
                        md: '1.25rem',
                      },
                    }}
                  >
                    Assignment: Context API –
                    E-commerce Cart
                  </Typography>

                  <Chip
                    label="Medium"
                    size="small"
                    sx={{
                      bgcolor: '#eee7ff',
                      color: '#6738df',
                      fontWeight: 900,
                    }}
                  />
                </Stack>

                <Typography
                  sx={{
                    mt: 0.8,
                    color: '#344054',
                    fontSize: '0.82rem',
                    lineHeight: 1.55,
                  }}
                >
                  Build a small e-commerce cart
                  using Context API to manage
                  global cart state (add, remove,
                  update quantity) across multiple
                  components.
                </Typography>

                {/* Requirements */}
                <Box
                  sx={{
                    mt: 2,
                    p: 1.5,
                    borderRadius: 2.5,
                    border:
                      '1px solid #dfe4ec',
                    bgcolor: '#fbfcfe',
                  }}
                >
                  <SectionTitle
                    icon={
                      <TaskAltRoundedIcon />
                    }
                  >
                    Requirements
                  </SectionTitle>

                  <Stack
                    spacing={0.75}
                    sx={{ mt: 1.3 }}
                  >
                    {requirements.map(
                      (requirement) => (
                        <CheckRow
                          key={requirement}
                        >
                          {requirement}
                        </CheckRow>
                      ),
                    )}
                  </Stack>
                </Box>

                {/* Expected Outcome */}
                <Box
                  sx={{
                    mt: 1.5,
                    p: 1.5,
                    borderRadius: 2.5,
                    border:
                      '1px solid #dfe4ec',
                    bgcolor: '#fbfcfe',
                  }}
                >
                  <SectionTitle
                    icon={
                      <ShoppingCartRoundedIcon />
                    }
                  >
                    Expected Outcome
                  </SectionTitle>

                  <Box
                    sx={{
                      mt: 1.3,
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(3, 1fr)',
                      },
                      gap: 1.2,
                    }}
                  >
                    <OutcomeCard
                      title="Product List"
                      type="products"
                    />

                    <OutcomeCard
                      title="Navbar (Cart Count)"
                      type="navbar"
                    />

                    <OutcomeCard
                      title="Cart Page"
                      type="cart"
                    />
                  </Box>
                </Box>
              </Panel>

              {/* Tips */}
              <Box
                sx={{
                  p: 1.7,
                  borderRadius: 3,
                  border:
                    '1px solid #ddd6fe',
                  background:
                    'linear-gradient(100deg, #fffdf8 0%, #f4efff 100%)',
                }}
              >
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
                      color: '#563cf0',
                      fontWeight: 950,
                      fontSize: '1rem',
                    }}
                  >
                    Tips for a Great Submission
                  </Typography>
                </Stack>

                <Stack
                  spacing={0.7}
                  sx={{ mt: 1 }}
                >
                  {tips.map((tip) => (
                    <CheckRow key={tip}>
                      {tip}
                    </CheckRow>
                  ))}
                </Stack>
              </Box>
            </Stack>

            {/* RIGHT */}
            <Stack spacing={2}>
              {/* Progress */}
              <Panel>
                <SectionTitle
                  icon={
                    <EmojiEventsRoundedIcon />
                  }
                >
                  Assignment Progress
                </SectionTitle>

                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mt: 1.5 }}
                >
                  <ProgressCircle
                    value={assignmentProgress}
                  />

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        color: '#172033',
                        fontWeight: 900,
                        fontSize: '0.82rem',
                      }}
                    >
                      3 of 5 Requirements
                      Completed
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={assignmentProgress}
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
              </Panel>

              {/* Deliverables */}
              <Panel>
                <SectionTitle
                  icon={
                    <AssignmentRoundedIcon />
                  }
                >
                  Deliverables
                </SectionTitle>

                <Stack
                  spacing={0.2}
                  sx={{ mt: 1.1 }}
                >
                  {deliverables.map(
                    (item) => (
                      <Stack
                        key={item.id}
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                      >
                        <Checkbox
                          checked={
                            item.completed
                          }
                          onChange={() =>
                            handleToggleDeliverable(
                              item.id,
                            )
                          }
                          size="small"
                          sx={{
                            color: '#98a2b3',
                            '&.Mui-checked': {
                              color: '#0eaf75',
                            },
                          }}
                        />

                        <Typography
                          sx={{
                            color: '#27314a',
                            fontSize: '0.76rem',
                            lineHeight: 1.4,
                          }}
                        >
                          {item.label}
                        </Typography>
                      </Stack>
                    ),
                  )}
                </Stack>
              </Panel>

              {/* Evaluation */}
              <Panel>
                <SectionTitle
                  icon={
                    <TaskAltRoundedIcon />
                  }
                >
                  Evaluation Criteria (Total: 100)
                </SectionTitle>

                <Stack
                  spacing={0}
                  sx={{ mt: 1.2 }}
                >
                  {evaluationCriteria.map(
                    (item, index) => (
                      <Box
                        key={item.label}
                        sx={{
                          py: 0.9,
                          borderBottom:
                            index !==
                            evaluationCriteria.length -
                              1
                              ? '1px solid #e8ebf0'
                              : 'none',
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          <CheckCircleRoundedIcon
                            sx={{
                              color:
                                '#0eaf75',
                              fontSize: 20,
                            }}
                          />

                          <Typography
                            sx={{
                              flex: 1,
                              color:
                                '#27314a',
                              fontSize:
                                '0.75rem',
                            }}
                          >
                            {item.label}
                          </Typography>

                          <Typography
                            sx={{
                              color:
                                '#172033',
                              fontWeight: 900,
                              fontSize:
                                '0.75rem',
                            }}
                          >
                            {item.score}
                          </Typography>
                        </Stack>
                      </Box>
                    ),
                  )}
                </Stack>
              </Panel>
            </Stack>
          </Box>

          {/* Actions */}
          <Stack
            direction={{
              xs: 'column',
              md: 'row',
            }}
            justifyContent="space-between"
            spacing={1.2}
            sx={{
              mt: 2,
              pt: 1.5,
              borderTop:
                '1px solid #e4e8ef',
            }}
          >
            <Button
              variant="outlined"
              startIcon={
                <ArrowBackRoundedIcon />
              }
              onClick={handleBackToResults}
              sx={{
                minHeight: 48,
                px: 3,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 850,
              }}
            >
              Back to Results
            </Button>

            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={1.2}
            >
              <Button
                variant="outlined"
                startIcon={<SaveRoundedIcon />}
                onClick={handleSaveDraft}
                sx={{
                  minHeight: 48,
                  px: 3,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 850,
                }}
              >
                Save Draft
              </Button>

              <Button
                variant="contained"
                endIcon={
                  <ArrowForwardRoundedIcon />
                }
                onClick={
                  handleSubmitAssignment
                }
                sx={{
                  minHeight: 50,
                  minWidth: {
                    xs: '100%',
                    sm: 250,
                  },
                  px: 3,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 900,
                  boxShadow: 'none',
                  background:
                    'linear-gradient(90deg, #6734f2, #4f38e8)',
                }}
              >
                Submit Assignment
              </Button>
            </Stack>
          </Stack>

          <Typography
            sx={{
              mt: 1.2,
              textAlign: 'center',
              color: '#98a2b3',
              fontSize: '0.65rem',
            }}
          >
            Assignment progress, deadline,
            deliverables and completion state are
            temporary UI values until the Skill
            Assignment backend APIs are connected.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

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

const ProgressCircle = ({
  value,
}: {
  value: number;
}) => (
  <Box
    sx={{
      position: 'relative',
      width: 105,
      height: 105,
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
          #e1e6ed ${value}% 100%
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
          color: '#0aaa70',
          fontWeight: 950,
          fontSize: '1.45rem',
        }}
      >
        {value}%
      </Typography>
    </Box>
  </Box>
);

const OutcomeCard = ({
  title,
  type,
}: {
  title: string;
  type: 'products' | 'navbar' | 'cart';
}) => (
  <Box
    sx={{
      overflow: 'hidden',
      borderRadius: 2.2,
      border: '1px solid #dfe4ec',
      bgcolor: '#fff',
      minHeight: 160,
    }}
  >
    <Box
      sx={{
        py: 0.7,
        px: 1,
        textAlign: 'center',
        bgcolor: '#f0edff',
      }}
    >
      <Typography
        sx={{
          color: '#172033',
          fontWeight: 900,
          fontSize: '0.7rem',
        }}
      >
        {title}
      </Typography>
    </Box>

    {type === 'products' && (
      <Box sx={{ p: 1 }}>
        <Typography
          sx={{
            color: '#172033',
            fontWeight: 900,
            fontSize: '0.7rem',
          }}
        >
          Products
        </Typography>

        <Box
          sx={{
            mt: 0.8,
            p: 0.8,
            borderRadius: 1.5,
            border: '1px solid #e4e7ec',
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <Box
              sx={{
                width: 54,
                height: 44,
                borderRadius: 1,
                bgcolor: '#f2f4f7',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <ShoppingCartRoundedIcon
                sx={{
                  color: '#98a2b3',
                }}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 800,
                  fontSize: '0.62rem',
                }}
              >
                Sneaker
              </Typography>

              <Typography
                sx={{
                  color: '#344054',
                  fontSize: '0.6rem',
                }}
              >
                ₹1,999
              </Typography>
            </Box>
          </Stack>

          <Button
            fullWidth
            size="small"
            variant="contained"
            sx={{
              mt: 0.8,
              minHeight: 27,
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.58rem',
              boxShadow: 'none',
              bgcolor: '#6538ef',
            }}
          >
            Add to Cart
          </Button>
        </Box>
      </Box>
    )}

    {type === 'navbar' && (
      <Box
        sx={{
          p: 1,
        }}
      >
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
        >
          <Box
            sx={{
              width: 17,
              height: 17,
              borderRadius: '50%',
              border:
                '3px solid #6538ef',
            }}
          />

          <Typography
            sx={{
              color: '#172033',
              fontWeight: 900,
              fontSize: '0.63rem',
            }}
          >
            CareerHarbor
          </Typography>
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: 2.5 }}
        >
          <Typography
            sx={{
              color: '#344054',
              fontSize: '0.58rem',
            }}
          >
            Home
          </Typography>

          <Typography
            sx={{
              color: '#344054',
              fontSize: '0.58rem',
            }}
          >
            Products
          </Typography>

          <Chip
            label="Cart (3)"
            size="small"
            sx={{
              bgcolor: '#eee8ff',
              color: '#6538ef',
              fontWeight: 900,
              fontSize: '0.56rem',
            }}
          />
        </Stack>
      </Box>
    )}

    {type === 'cart' && (
      <Box sx={{ p: 1 }}>
        <Typography
          sx={{
            color: '#172033',
            fontWeight: 900,
            fontSize: '0.65rem',
          }}
        >
          Your Cart (3)
        </Typography>

        <Box
          sx={{
            mt: 1,
            p: 0.8,
            borderRadius: 1.4,
            border: '1px solid #e4e7ec',
          }}
        >
          <Stack
            direction="row"
            spacing={0.7}
            alignItems="center"
          >
            <Box
              sx={{
                width: 45,
                height: 42,
                bgcolor: '#f2f4f7',
                borderRadius: 1,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <ShoppingCartRoundedIcon
                sx={{
                  fontSize: 19,
                  color: '#98a2b3',
                }}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  color: '#172033',
                  fontWeight: 850,
                  fontSize: '0.58rem',
                }}
              >
                Sneaker
              </Typography>

              <Typography
                sx={{
                  color: '#344054',
                  fontSize: '0.56rem',
                }}
              >
                ₹1,999
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            justifyContent="center"
            spacing={1}
            sx={{ mt: 0.8 }}
          >
            <Typography>-</Typography>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: '0.65rem',
              }}
            >
              2
            </Typography>
            <Typography>+</Typography>
          </Stack>
        </Box>
      </Box>
    )}
  </Box>
);