import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface AssignmentTask {
  number: number;
  text: string;
  marks: number;
}

interface EvaluationCriterion {
  label: string;
  marks: number;
}

const assignmentTasks: AssignmentTask[] = [
  {
    number: 1,
    text: 'Analyze the given table and identify the normalization issues.',
    marks: 20,
  },
  {
    number: 2,
    text: 'Design a normalized database up to 3NF and show the final table structure.',
    marks: 40,
  },
  {
    number: 3,
    text: 'Write SQL DDL statements to create the normalized tables.',
    marks: 20,
  },
  {
    number: 4,
    text: 'Write a short explanation of your design and how it removes redundancy.',
    marks: 20,
  },
];

const evaluationCriteria: EvaluationCriterion[] = [
  {
    label: 'Problem analysis & identification',
    marks: 20,
  },
  {
    label: 'Normalized database design',
    marks: 40,
  },
  {
    label: 'SQL DDL statements',
    marks: 20,
  },
  {
    label: 'Explanation & justification',
    marks: 20,
  },
];

export const HandsOnAssignmentPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  /*
   * TEMPORARY FRONTEND STATE.
   *
   * Later replace the assignment content, submission,
   * attempt status and AI evaluation with the existing
   * Accelerator backend assignment/project APIs.
   */
  const [analysis, setAnalysis] = useState('');
  const [databaseDesign, setDatabaseDesign] =
    useState('');
  const [sqlSolution, setSqlSolution] =
    useState('');
  const [explanation, setExplanation] =
    useState('');

  const [showWorkspace, setShowWorkspace] =
    useState(false);

  const navigateToScreen = (screen: string) => {
    const params =
      new URLSearchParams(searchParams);

    params.set('screen', screen);

    setSearchParams(params);
  };

  const handleBack = () => {
    navigateToScreen('practice-results');
  };

  const handlePractice = () => {
    navigateToScreen('practice');
  };

  const handleAssessment = () => {
    navigateToScreen('module-assessment');
  };

  const handleAskAi = () => {
    navigateToScreen('ai-tutor');
  };

  const handleReviewLesson = () => {
    navigateToScreen('learning-module');
  };

  const handleSubmit = () => {
    /*
     * UI-only for now.
     *
     * Do not fake a successful backend submission here.
     * During API integration this will call the real
     * assignment submission endpoint and only navigate
     * after the server confirms success.
     */
    const params =
      new URLSearchParams(searchParams);

    params.set(
      'screen',
      'assignment-results',
    );

    setSearchParams(params);
  };

  const hasSubmission =
    analysis.trim().length > 0 &&
    databaseDesign.trim().length > 0 &&
    sqlSolution.trim().length > 0 &&
    explanation.trim().length > 0;

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
            'linear-gradient(115deg, #075fbd 0%, #3944df 52%, #7d13e9 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 280,
            height: 280,
            borderRadius: '50%',
            right: -60,
            top: -165,
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
              fontWeight: 900,
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
              fontWeight: 800,
            }}
          >
            Premium
          </Box>
        </Stack>

        <Typography
          sx={{
            position: 'relative',
            mt: 0.6,
            maxWidth: 850,
            color:
              'rgba(255,255,255,0.92)',
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

      {/* HEADER */}

      <Box
        sx={{
          mt: 1.5,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg:
              'minmax(0, 1fr) auto',
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
              color: '#17213b',
              textTransform: 'none',
              fontWeight: 850,
              '&:hover': {
                bgcolor: 'transparent',
                color: '#075fd6',
              },
            }}
          >
            Back to Practice Results
          </Button>

          <Stack
            direction="row"
            spacing={1.2}
            alignItems="center"
            sx={{ mt: 0.4 }}
          >
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                bgcolor: '#fff5dc',
                color: '#ef9d00',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <AssignmentTurnedInRoundedIcon
                sx={{
                  fontSize: 31,
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
                Hands-on Assignment
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  color: '#111a38',
                  fontSize: '1.05rem',
                  fontWeight: 850,
                }}
              >
                Database Normalization
              </Typography>

              <Typography
                sx={{
                  mt: 0.1,
                  color: '#58657a',
                  fontSize: '0.82rem',
                }}
              >
                Apply your learning in a
                real-world task and get
                AI-powered feedback.
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* MODE NAV */}

        <Stack
          direction="row"
          spacing={0.7}
          sx={{
            p: 0.65,
            border:
              '1px solid #dce3ee',
            borderRadius: 3,
            bgcolor: '#fff',
            overflowX: 'auto',
          }}
        >
          <ModeButton
            icon={<CodeRoundedIcon />}
            label="Practice"
            onClick={handlePractice}
          />

          <ModeButton
            active
            icon={
              <AssignmentTurnedInRoundedIcon />
            }
            label="Assignment"
          />

          <ModeButton
            icon={
              <EmojiEventsOutlinedIcon />
            }
            label="Assessment"
            onClick={handleAssessment}
          />
        </Stack>
      </Box>

      {/* MAIN GRID */}

      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl:
              'minmax(0, 1.55fr) 410px',
          },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {/* LEFT */}

        <Stack spacing={2}>
          {/* ASSIGNMENT META */}

          <Box sx={cardSx}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(3, 1fr)',
                },
              }}
            >
              <MetaItem
                icon={
                  <StorageRoundedIcon />
                }
                title="Assignment Type"
                value="Hands-on (Design & SQL)"
                color="#7b2be8"
              />

              <MetaItem
                icon={
                  <ScheduleRoundedIcon />
                }
                title="Estimated Time"
                value="30–45 min"
                color="#1684ed"
                divider
              />

              <MetaItem
                icon={
                  <StarBorderRoundedIcon />
                }
                title="Total Marks"
                value="100"
                color="#eea000"
                divider
              />
            </Box>
          </Box>

          {/* ASSIGNMENT */}

          <Box sx={cardSx}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <TaskAltRoundedIcon
                sx={{
                  color: '#7624e9',
                }}
              />

              <Typography
                sx={{
                  color: '#111a38',
                  fontSize: {
                    xs: '1rem',
                    md: '1.15rem',
                  },
                  fontWeight: 900,
                }}
              >
                Assignment: Normalize a Sales
                Database
              </Typography>
            </Stack>

            {/* PROBLEM */}

            <Box
              sx={{
                mt: 1.3,
                borderRadius: 2.5,
                p: 1.4,
                background:
                  'linear-gradient(100deg, #edf4ff 0%, #dfeaff 100%)',
              }}
            >
              <Stack
                direction="row"
                spacing={0.8}
                alignItems="center"
              >
                <DescriptionOutlinedIcon
                  sx={{
                    color: '#1269e8',
                  }}
                />

                <Typography
                  sx={{
                    color: '#111a38',
                    fontWeight: 900,
                  }}
                >
                  Problem Statement
                </Typography>
              </Stack>

              <Typography
                sx={{
                  mt: 0.6,
                  color: '#263653',
                  fontSize: '0.8rem',
                  lineHeight: 1.55,
                }}
              >
                A retail company stores order,
                customer, and product details in
                a single table. The current
                design has data duplication and
                does not follow normalization
                principles.
              </Typography>
            </Box>

            {/* TASKS */}

            <Box sx={{ mt: 1.4 }}>
              <Stack
                direction="row"
                spacing={0.8}
                alignItems="center"
              >
                <TaskAltRoundedIcon
                  sx={{
                    color: '#7a28e8',
                    fontSize: 22,
                  }}
                />

                <Typography
                  sx={{
                    color: '#111a38',
                    fontWeight: 900,
                  }}
                >
                  Your Tasks
                </Typography>
              </Stack>

              <Stack
                spacing={0.85}
                sx={{ mt: 1 }}
              >
                {assignmentTasks.map(
                  (task) => (
                    <TaskRow
                      key={task.number}
                      task={task}
                    />
                  ),
                )}
              </Stack>
            </Box>

            {/* GIVEN DATA */}

            <Accordion
              defaultExpanded
              disableGutters
              elevation={0}
              sx={{
                mt: 1.5,
                border:
                  '1px solid #dbe3ef',
                borderRadius:
                  '12px !important',
                overflow: 'hidden',
                '&:before': {
                  display: 'none',
                },
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreRoundedIcon />
                }
                sx={{
                  minHeight: 48,
                  '& .MuiAccordionSummary-content':
                    {
                      my: 1,
                    },
                }}
              >
                <Stack
                  direction="row"
                  spacing={0.8}
                  alignItems="center"
                >
                  <DataObjectRoundedIcon
                    sx={{
                      color: '#1269e8',
                    }}
                  />

                  <Typography
                    sx={{
                      color: '#111a38',
                      fontWeight: 900,
                    }}
                  >
                    Given Data
                  </Typography>
                </Stack>
              </AccordionSummary>

              <AccordionDetails
                sx={{
                  pt: 0,
                }}
              >
                <GivenDataTable />
              </AccordionDetails>
            </Accordion>

            {/* WORK AREA */}

            <Divider sx={{ my: 1.8 }} />

            {!showWorkspace ? (
              <Box
                sx={{
                  border:
                    '1px dashed #aebbd0',
                  borderRadius: 2.5,
                  p: 2,
                  textAlign: 'center',
                  bgcolor: '#fafcff',
                }}
              >
                <CodeRoundedIcon
                  sx={{
                    color: '#1269e8',
                    fontSize: 34,
                  }}
                />

                <Typography
                  sx={{
                    mt: 0.5,
                    color: '#111a38',
                    fontWeight: 900,
                  }}
                >
                  Ready to solve the assignment?
                </Typography>

                <Typography
                  sx={{
                    mt: 0.3,
                    color: '#647087',
                    fontSize: '0.76rem',
                  }}
                >
                  Open the workspace and complete
                  all four sections before
                  submitting.
                </Typography>

                <Button
                  variant="contained"
                  onClick={() =>
                    setShowWorkspace(true)
                  }
                  sx={{
                    mt: 1.2,
                    px: 3,
                    minHeight: 44,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    fontWeight: 850,
                    boxShadow: 'none',
                  }}
                >
                  Start Assignment
                </Button>
              </Box>
            ) : (
              <Stack spacing={1.4}>
                <Typography
                  sx={{
                    color: '#111a38',
                    fontSize: '1rem',
                    fontWeight: 900,
                  }}
                >
                  Your Solution
                </Typography>

                <SolutionField
                  label="1. Problem Analysis"
                  placeholder="Identify duplication, update anomalies, insertion/deletion anomalies and normalization issues..."
                  value={analysis}
                  onChange={setAnalysis}
                />

                <SolutionField
                  label="2. Normalized Database Design"
                  placeholder="Describe your Customers, Products, Orders, OrderItems and other required tables..."
                  value={databaseDesign}
                  onChange={
                    setDatabaseDesign
                  }
                />

                <SolutionField
                  label="3. SQL DDL"
                  placeholder={`CREATE TABLE Customers (\n  CustomerId INT PRIMARY KEY,\n  ...\n);`}
                  value={sqlSolution}
                  onChange={setSqlSolution}
                  monospace
                  rows={8}
                />

                <SolutionField
                  label="4. Explanation & Justification"
                  placeholder="Explain why your design follows normalization principles and how it reduces redundancy..."
                  value={explanation}
                  onChange={setExplanation}
                />
              </Stack>
            )}
          </Box>
        </Stack>

        {/* RIGHT */}

        <Stack spacing={2}>
          {/* SUBMISSION */}

          <Box sx={cardSx}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <UploadRoundedIcon
                sx={{
                  color: '#8b28ec',
                  fontSize: 29,
                }}
              />

              <Typography
                sx={{
                  color: '#111a38',
                  fontSize: '1.05rem',
                  fontWeight: 900,
                }}
              >
                Submission
              </Typography>
            </Stack>

            <Typography
              sx={{
                mt: 0.8,
                color: '#455168',
                fontSize: '0.78rem',
                lineHeight: 1.5,
              }}
            >
              Submit your solution and get AI
              feedback with a score and detailed
              suggestions.
            </Typography>

            <Button
              fullWidth
              variant="contained"
              startIcon={
                <UploadRoundedIcon />
              }
              disabled={!hasSubmission}
              onClick={handleSubmit}
              sx={{
                mt: 1.3,
                minHeight: 48,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 900,
                boxShadow: 'none',
                background:
                  'linear-gradient(90deg, #1269ef 0%, #075cff 100%)',
              }}
            >
              Submit Assignment
            </Button>

            <Typography
              sx={{
                mt: 0.8,
                color: '#68748a',
                fontSize: '0.7rem',
                textAlign: 'center',
              }}
            >
              Complete all solution sections
              before submitting.
            </Typography>
          </Box>

          {/* CRITERIA */}

          <Box sx={cardSx}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <TaskAltRoundedIcon
                sx={{
                  color: '#1269e8',
                  fontSize: 28,
                }}
              />

              <Typography
                sx={{
                  color: '#111a38',
                  fontSize: '1.05rem',
                  fontWeight: 900,
                }}
              >
                Evaluation Criteria
              </Typography>
            </Stack>

            <Stack
              divider={<Divider />}
              sx={{
                mt: 1,
              }}
            >
              {evaluationCriteria.map(
                (criterion) => (
                  <Stack
                    key={criterion.label}
                    direction="row"
                    spacing={0.8}
                    alignItems="center"
                    sx={{
                      py: 0.8,
                    }}
                  >
                    <CheckCircleRoundedIcon
                      sx={{
                        color: '#18a93a',
                        fontSize: 21,
                      }}
                    />

                    <Typography
                      sx={{
                        flex: 1,
                        color: '#26324a',
                        fontSize: '0.76rem',
                        fontWeight: 650,
                      }}
                    >
                      {criterion.label}
                    </Typography>

                    <Typography
                      sx={{
                        color: '#111a38',
                        fontSize: '0.73rem',
                        fontWeight: 850,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {criterion.marks} marks
                    </Typography>
                  </Stack>
                ),
              )}
            </Stack>
          </Box>

          {/* HELP */}

          <Box
            sx={{
              ...cardSx,
              borderColor: '#d9b9ff',
              background:
                'linear-gradient(145deg, #fbf7ff 0%, #f7efff 100%)',
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="flex-start"
            >
              <PsychologyRoundedIcon
                sx={{
                  color: '#8528e9',
                  fontSize: 30,
                }}
              />

              <Box>
                <Typography
                  sx={{
                    color: '#111a38',
                    fontSize: '1.05rem',
                    fontWeight: 900,
                  }}
                >
                  Need Help?
                </Typography>

                <Typography
                  sx={{
                    mt: 0.2,
                    color: '#536078',
                    fontSize: '0.76rem',
                    lineHeight: 1.5,
                  }}
                >
                  Stuck on the assignment? Get
                  guidance from AI Tutor or
                  revisit the lesson.
                </Typography>
              </Box>
            </Stack>

            <Box
              sx={{
                mt: 1.3,
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                  xl: '1fr',
                },
                gap: 1,
              }}
            >
              <Button
                variant="outlined"
                startIcon={
                  <AutoAwesomeRoundedIcon />
                }
                onClick={handleAskAi}
                sx={helpButtonSx}
              >
                Ask AI Tutor
              </Button>

              <Button
                variant="outlined"
                startIcon={
                  <MenuBookRoundedIcon />
                }
                onClick={
                  handleReviewLesson
                }
                sx={helpButtonSx}
              >
                Review Lesson
              </Button>
            </Box>

            <Stack
              direction="row"
              spacing={0.7}
              alignItems="flex-start"
              sx={{
                mt: 1.2,
                p: 1,
                borderRadius: 2,
                bgcolor:
                  'rgba(255,255,255,0.7)',
              }}
            >
              <LightbulbOutlinedIcon
                sx={{
                  color: '#ed9900',
                  fontSize: 19,
                }}
              />

              <Typography
                sx={{
                  color: '#59657b',
                  fontSize: '0.7rem',
                  lineHeight: 1.45,
                }}
              >
                AI Tutor should guide the
                candidate without directly
                completing the assignment for
                them.
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

/* ==========================================
   COMPONENTS
========================================== */

interface ModeButtonProps {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const ModeButton = ({
  active = false,
  icon,
  label,
  onClick,
}: ModeButtonProps) => (
  <Button
    startIcon={icon}
    onClick={onClick}
    sx={{
      minWidth: 135,
      minHeight: 48,
      borderRadius: 2.5,
      textTransform: 'none',
      fontWeight: 850,
      color: active
        ? '#fff'
        : '#17213b',
      bgcolor: active
        ? '#4b37e8'
        : '#f7f8fc',
      '&:hover': {
        bgcolor: active
          ? '#3d2ed0'
          : '#eef2f8',
      },
    }}
  >
    {label}
  </Button>
);

interface MetaItemProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
  divider?: boolean;
}

const MetaItem = ({
  icon,
  title,
  value,
  color,
  divider = false,
}: MetaItemProps) => (
  <Stack
    direction="row"
    spacing={1}
    alignItems="center"
    sx={{
      px: {
        xs: 0,
        sm: 1.3,
      },
      py: {
        xs: 1,
        sm: 0.3,
      },
      borderLeft: {
        xs: 'none',
        sm: divider
          ? '1px solid #dce3ee'
          : 'none',
      },
      borderTop: {
        xs: divider
          ? '1px solid #dce3ee'
          : 'none',
        sm: 'none',
      },
    }}
  >
    <Box
      sx={{
        width: 42,
        height: 42,
        borderRadius: '50%',
        bgcolor: `${color}12`,
        color,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>

    <Box>
      <Typography
        sx={{
          color: '#5f6b80',
          fontSize: '0.7rem',
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 0.05,
          color: '#111a38',
          fontSize: '0.83rem',
          fontWeight: 900,
        }}
      >
        {value}
      </Typography>
    </Box>
  </Stack>
);

interface TaskRowProps {
  task: AssignmentTask;
}

const TaskRow = ({
  task,
}: TaskRowProps) => (
  <Stack
    direction="row"
    spacing={0.9}
    alignItems="flex-start"
  >
    <Box
      sx={{
        width: 26,
        height: 26,
        borderRadius: '50%',
        bgcolor: '#e9edff',
        color: '#293fe3',
        display: 'grid',
        placeItems: 'center',
        fontSize: '0.72rem',
        fontWeight: 900,
        flexShrink: 0,
      }}
    >
      {task.number}
    </Box>

    <Typography
      sx={{
        flex: 1,
        color: '#26324a',
        fontSize: '0.78rem',
        lineHeight: 1.55,
      }}
    >
      {task.text}{' '}
      <Box
        component="span"
        sx={{
          color: '#111a38',
          fontWeight: 850,
        }}
      >
        ({task.marks} marks)
      </Box>
    </Typography>
  </Stack>
);

const GivenDataTable = () => (
  <Box
    sx={{
      overflowX: 'auto',
      border:
        '1px solid #d6e0ee',
      borderRadius: 1.5,
    }}
  >
    <Box
      component="table"
      sx={{
        width: '100%',
        minWidth: 620,
        borderCollapse: 'collapse',
        fontSize: '0.73rem',

        '& th, & td': {
          px: 1,
          py: 0.65,
          textAlign: 'left',
          borderRight:
            '1px solid #dce4ef',
          borderBottom:
            '1px solid #dce4ef',
        },

        '& th': {
          bgcolor: '#e7effc',
          color: '#111a38',
          fontWeight: 900,
        },

        '& td': {
          color: '#26324a',
        },
      }}
    >
      <thead>
        <tr>
          <th>OrderId</th>
          <th>CustomerName</th>
          <th>CustomerPhone</th>
          <th>ProductName</th>
          <th>ProductPrice</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td>101</td>
          <td>Amit Sharma</td>
          <td>9876543210</td>
          <td>Laptop</td>
          <td>65000</td>
        </tr>

        <tr>
          <td>102</td>
          <td>Amit Sharma</td>
          <td>9876543210</td>
          <td>Mouse</td>
          <td>1200</td>
        </tr>

        <tr>
          <td>103</td>
          <td>Priya Deshmukh</td>
          <td>9866123456</td>
          <td>Keyboard</td>
          <td>2500</td>
        </tr>
      </tbody>
    </Box>
  </Box>
);

interface SolutionFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  monospace?: boolean;
  rows?: number;
}

const SolutionField = ({
  label,
  placeholder,
  value,
  onChange,
  monospace = false,
  rows = 5,
}: SolutionFieldProps) => (
  <Box>
    <Typography
      sx={{
        mb: 0.55,
        color: '#111a38',
        fontSize: '0.78rem',
        fontWeight: 850,
      }}
    >
      {label}
    </Typography>

    <TextField
      fullWidth
      multiline
      minRows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(event) =>
        onChange(event.target.value)
      }
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2.5,
          bgcolor: monospace
            ? '#f8faff'
            : '#fff',
          alignItems: 'flex-start',
        },
        '& textarea': {
          fontSize: '0.78rem',
          lineHeight: 1.55,
          fontFamily: monospace
            ? 'Consolas, "Courier New", monospace'
            : 'inherit',
        },
      }}
    />
  </Box>
);

const cardSx = {
  border: '1px solid #dce3ee',
  borderRadius: 3,
  bgcolor: '#fff',
  p: {
    xs: 1.5,
    md: 1.8,
  },
};

const helpButtonSx = {
  minHeight: 44,
  borderRadius: 2.5,
  borderColor: '#9d60ef',
  color: '#5420c5',
  textTransform: 'none',
  fontWeight: 850,
  '&:hover': {
    borderColor: '#7624e9',
    bgcolor: '#faf6ff',
  },
};