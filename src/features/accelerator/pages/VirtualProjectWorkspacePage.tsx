import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';

import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';

import {
  ChangeEvent,
  SyntheticEvent,
  useMemo,
  useState,
} from 'react';

import { useSearchParams } from 'react-router-dom';

type WorkTab =
  | 'diagram'
  | 'tables'
  | 'notes';

interface Milestone {
  id: number;
  title: string;
  description: string;
}

interface Deliverable {
  id: string;
  label: string;
}

const milestones: Milestone[] = [
  {
    id: 1,
    title: 'Project Overview',
    description:
      'Understand the problem, goals and deliverables.',
  },
  {
    id: 2,
    title: 'Database Design',
    description:
      'Design ER diagram and normalized tables.',
  },
  {
    id: 3,
    title: 'Database Implementation',
    description:
      'Write SQL DDL to create tables with constraints.',
  },
  {
    id: 4,
    title: 'Queries & Analysis',
    description:
      'Write business queries and validate results.',
  },
  {
    id: 5,
    title: 'Project Submission',
    description:
      'Submit your work and get AI review & feedback.',
  },
];

const deliverables: Deliverable[] = [
  {
    id: 'diagram',
    label: 'ER Diagram',
  },
  {
    id: 'tables',
    label: 'Normalized Table Design (3NF)',
  },
  {
    id: 'ddl',
    label: 'SQL DDL Script',
  },
  {
    id: 'queries',
    label: 'Business Queries (≥ 5)',
  },
  {
    id: 'report',
    label: 'Project Report / Explanation',
  },
];

export const VirtualProjectWorkspacePage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  /*
   * FRONTEND-ONLY PROJECT WORKSPACE.
   *
   * These values are temporary UI state.
   * During backend integration replace them with the
   * existing Accelerator Phase 4 virtual-project APIs.
   *
   * Do not treat local completion state as a real
   * persisted project submission.
   */
  const [activeMilestone, setActiveMilestone] =
    useState(2);

  const [completedMilestones, setCompletedMilestones] =
    useState<number[]>([1]);

  const [workTab, setWorkTab] =
    useState<WorkTab>('diagram');

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [tableDesign, setTableDesign] =
    useState('');

  const [notes, setNotes] =
    useState('');

  const [taskOneComplete, setTaskOneComplete] =
    useState(true);

  const [taskTwoComplete, setTaskTwoComplete] =
    useState(false);

  const navigateToScreen = (screen: string) => {
    const params =
      new URLSearchParams(searchParams);

    params.set('screen', screen);

    setSearchParams(params);
  };

  const handleBack = () => {
    navigateToScreen('assignment-results');
  };

  const handleAiTutor = () => {
    navigateToScreen('ai-tutor');
  };

  const handleResources = () => {
    navigateToScreen('project-resources');
  };

  const handleWorkTabChange = (
    _event: SyntheticEvent,
    value: WorkTab,
  ) => {
    setWorkTab(value);
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
      return;
    }

    setSelectedFile(file);
    setTaskOneComplete(true);
  };

  const handleSaveDraft = () => {
    /*
     * UI-only.
     * Real draft persistence will use the Phase 4 API.
     */
  };

  const handleCompleteMilestone = () => {
    if (
      !completedMilestones.includes(
        activeMilestone,
      )
    ) {
      setCompletedMilestones(
        (previous) => [
          ...previous,
          activeMilestone,
        ],
      );
    }

    if (activeMilestone < milestones.length) {
      setActiveMilestone(
        activeMilestone + 1,
      );
    }
  };

  const completedCount =
    completedMilestones.length;

  const progress =
    Math.round(
      (completedCount /
        milestones.length) *
        100,
    );

  const completedDeliverables =
    useMemo(
      () =>
        new Set<string>([
          ...(selectedFile ||
          completedMilestones.includes(2)
            ? ['diagram']
            : []),
          ...(completedMilestones.includes(2)
            ? ['tables']
            : []),
          ...(completedMilestones.includes(3)
            ? ['ddl']
            : []),
          ...(completedMilestones.includes(4)
            ? ['queries']
            : []),
          ...(completedMilestones.includes(5)
            ? ['report']
            : []),
        ]),
      [
        selectedFile,
        completedMilestones,
      ],
    );

  const currentMilestone =
    milestones.find(
      (milestone) =>
        milestone.id === activeMilestone,
    ) ?? milestones[0];

  if (!currentMilestone) {
    return null;
  }

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
            lg: 'minmax(0, 1fr) auto',
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
            Back to Assignment Results
          </Button>

          <Stack
            direction="row"
            spacing={1.2}
            alignItems="center"
            sx={{
              mt: 0.5,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: '#fff4dc',
                color: '#e99100',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <CodeRoundedIcon
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
                Virtual Project Workspace
              </Typography>

              <Typography
                sx={{
                  mt: 0.2,
                  color: '#58657a',
                  fontSize: '0.82rem',
                }}
              >
                Build a real-world project,
                apply your skills, and create a
                portfolio-ready solution.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack
          direction="row"
          spacing={0.6}
          sx={{
            p: 0.65,
            border:
              '1px solid #dce3ee',
            borderRadius: 3,
            bgcolor: '#fff',
            overflowX: 'auto',
          }}
        >
          <WorkspaceButton
            active
            icon={<CodeRoundedIcon />}
            label="Project"
          />

          <WorkspaceButton
            icon={
              <PsychologyRoundedIcon />
            }
            label="AI Tutor"
            onClick={handleAiTutor}
          />

          <WorkspaceButton
            icon={
              <MenuBookRoundedIcon />
            }
            label="Resources"
            onClick={handleResources}
          />
        </Stack>
      </Box>

      {/* PROJECT OVERVIEW */}

      <Box
        sx={{
          ...cardSx,
          mt: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg:
              'minmax(0, 1fr) auto',
          },
          gap: 2,
          alignItems: 'center',
        }}
      >
        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          spacing={1.5}
          alignItems={{
            xs: 'flex-start',
            sm: 'center',
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 100,
              borderRadius: 2.5,
              flexShrink: 0,
              background:
                'linear-gradient(145deg, #075fc4 0%, #2d22bb 100%)',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
            }}
          >
            <StorageRoundedIcon
              sx={{
                fontSize: 55,
              }}
            />
          </Box>

          <Box>
            <Typography
              sx={{
                color: '#111a38',
                fontSize: '1.1rem',
                fontWeight: 900,
              }}
            >
              Project: Sales Management System
            </Typography>

            <Stack
              direction="row"
              spacing={0.7}
              useFlexGap
              flexWrap="wrap"
              sx={{
                mt: 0.6,
              }}
            >
              {[
                'Database',
                'SQL',
                'Normalization',
                'SQL Queries',
              ].map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  size="small"
                  sx={{
                    bgcolor: '#edf1ff',
                    color: '#28369b',
                    fontWeight: 800,
                    fontSize: '0.68rem',
                  }}
                />
              ))}
            </Stack>

            <Typography
              sx={{
                mt: 0.7,
                color: '#334057',
                fontSize: '0.78rem',
                lineHeight: 1.5,
              }}
            >
              Design and build a normalized
              database for a retail sales system
              with tables, relationships, and
              business queries.
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(3, auto)',
            },
          }}
        >
          <ProjectMeta
            icon={
              <BarChartRoundedIcon />
            }
            label="Difficulty"
            value="Intermediate"
            color="#8426e8"
          />

          <ProjectMeta
            icon={
              <ScheduleRoundedIcon />
            }
            label="Estimated Time"
            value="2–3 hrs"
            color="#1479ec"
            divider
          />

          <ProjectMeta
            icon={
              <StarBorderRoundedIcon />
            }
            label="Portfolio"
            value="Add to Portfolio"
            color="#e99b00"
            divider
          />
        </Box>
      </Box>

      {/* WORKSPACE */}

      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl:
              '285px minmax(0, 1fr) 335px',
          },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {/* ROADMAP */}

        <Box sx={cardSx}>
          <Stack
            direction="row"
            spacing={0.8}
            alignItems="center"
          >
            <TaskAltRoundedIcon
              sx={{
                color: '#1269e8',
              }}
            />

            <Typography
              sx={{
                color: '#111a38',
                fontSize: '1.05rem',
                fontWeight: 900,
              }}
            >
              Project Roadmap
            </Typography>
          </Stack>

          <Stack
            sx={{
              mt: 1.4,
            }}
          >
            {milestones.map(
              (milestone) => (
                <MilestoneRow
                  key={milestone.id}
                  milestone={milestone}
                  active={
                    milestone.id ===
                    activeMilestone
                  }
                  completed={completedMilestones.includes(
                    milestone.id,
                  )}
                  onClick={() =>
                    setActiveMilestone(
                      milestone.id,
                    )
                  }
                />
              ),
            )}
          </Stack>
        </Box>

        {/* ACTIVE MILESTONE */}

        <Box sx={cardSx}>
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
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <DataObjectRoundedIcon
                sx={{
                  color: '#8a26eb',
                  fontSize: 31,
                }}
              />

              <Box>
                <Typography
                  sx={{
                    color: '#111a38',
                    fontSize: '1.15rem',
                    fontWeight: 900,
                  }}
                >
                  {currentMilestone.id}.{' '}
                  {currentMilestone.title}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.1,
                    color: '#536078',
                    fontSize: '0.77rem',
                  }}
                >
                  {currentMilestone.description}
                </Typography>
              </Box>
            </Stack>

            <Chip
              icon={
                <CheckCircleRoundedIcon />
              }
              label={
                completedMilestones.includes(
                  currentMilestone.id,
                )
                  ? 'Completed'
                  : 'In Progress'
              }
              sx={{
                bgcolor:
                  completedMilestones.includes(
                    currentMilestone.id,
                  )
                    ? '#e6f8e9'
                    : '#ebf7e8',
                color: '#16802f',
                fontWeight: 850,
                '& .MuiChip-icon': {
                  color: '#18a93a',
                },
              }}
            />
          </Stack>

          {/* TASKS */}

          <Box
            sx={{
              mt: 1.4,
              border:
                '1px solid #dce3ee',
              borderRadius: 2.5,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                px: 1.2,
                py: 0.8,
                bgcolor: '#f4f6fb',
              }}
            >
              <Typography
                sx={{
                  color: '#111a38',
                  fontSize: '0.8rem',
                  fontWeight: 900,
                }}
              >
                Tasks in this Milestone (2)
              </Typography>
            </Box>

            <Stack
              sx={{
                px: 1,
                py: 0.6,
              }}
            >
              <TaskCheckbox
                checked={taskOneComplete}
                onChange={
                  setTaskOneComplete
                }
                label="Create an ER diagram with entities, attributes and relationships."
              />

              <TaskCheckbox
                checked={taskTwoComplete}
                onChange={
                  setTaskTwoComplete
                }
                label="List all tables with primary keys, foreign keys and brief descriptions."
              />
            </Stack>
          </Box>

          {/* YOUR WORK */}

          <Typography
            sx={{
              mt: 1.5,
              mb: 0.6,
              color: '#111a38',
              fontSize: '1rem',
              fontWeight: 900,
            }}
          >
            Your Work
          </Typography>

          <Tabs
            value={workTab}
            onChange={handleWorkTabChange}
            variant="fullWidth"
            sx={{
              minHeight: 42,
              border:
                '1px solid #d9e1ed',
              borderRadius: 2.5,
              bgcolor: '#f8f9fc',
              p: 0.35,
              '& .MuiTabs-indicator': {
                display: 'none',
              },
              '& .MuiTab-root': {
                minHeight: 38,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 850,
                color: '#28334b',
              },
              '& .Mui-selected': {
                bgcolor: '#5c2fe8',
                color:
                  '#fff !important',
              },
            }}
          >
            <Tab
              value="diagram"
              icon={
                <DataObjectRoundedIcon />
              }
              iconPosition="start"
              label="ER Diagram"
            />

            <Tab
              value="tables"
              icon={
                <TableChartOutlinedIcon />
              }
              iconPosition="start"
              label="Table Design"
            />

            <Tab
              value="notes"
              icon={
                <DescriptionOutlinedIcon />
              }
              iconPosition="start"
              label="Notes"
            />
          </Tabs>

          <Box sx={{ mt: 1.2 }}>
            {workTab === 'diagram' && (
              <DiagramWorkspace
                selectedFile={
                  selectedFile
                }
                onFileChange={
                  handleFileChange
                }
              />
            )}

            {workTab === 'tables' && (
              <TextField
                fullWidth
                multiline
                minRows={11}
                value={tableDesign}
                onChange={(event) =>
                  setTableDesign(
                    event.target.value,
                  )
                }
                placeholder={`Customers
- CustomerId (PK)
- Name
- Phone

Orders
- OrderId (PK)
- CustomerId (FK)
- OrderDate`}
                sx={textFieldSx}
              />
            )}

            {workTab === 'notes' && (
              <TextField
                fullWidth
                multiline
                minRows={11}
                value={notes}
                onChange={(event) =>
                  setNotes(
                    event.target.value,
                  )
                }
                placeholder="Add project notes, assumptions, design decisions or questions..."
                sx={textFieldSx}
              />
            )}
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            justifyContent="space-between"
            spacing={1}
          >
            <Button
              variant="outlined"
              startIcon={
                <SaveOutlinedIcon />
              }
              onClick={handleSaveDraft}
              sx={secondaryButtonSx}
            >
              Save Draft
            </Button>

            <Button
              variant="contained"
              endIcon={
                <ArrowForwardRoundedIcon />
              }
              onClick={
                handleCompleteMilestone
              }
              sx={{
                minWidth: 220,
                minHeight: 46,
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 900,
                boxShadow: 'none',
                background:
                  'linear-gradient(90deg, #1269ef 0%, #075cff 100%)',
              }}
            >
              {activeMilestone ===
              milestones.length
                ? 'Finish Project'
                : 'Mark as Complete'}
            </Button>
          </Stack>
        </Box>

        {/* RIGHT SIDE */}

        <Stack spacing={2}>
          {/* PROGRESS */}

          <Box sx={cardSx}>
            <Stack
              direction="row"
              spacing={0.8}
              alignItems="center"
            >
              <BarChartRoundedIcon
                sx={{
                  color: '#1269e8',
                }}
              />

              <Typography
                sx={{
                  color: '#111a38',
                  fontSize: '1.05rem',
                  fontWeight: 900,
                }}
              >
                Project Progress
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                mt: 1.2,
              }}
            >
              <ProgressCircle
                progress={progress}
              />

              <Box>
                <Typography
                  sx={{
                    color: '#111a38',
                    fontSize: '0.8rem',
                    fontWeight: 850,
                  }}
                >
                  {completedCount} of{' '}
                  {milestones.length} milestones
                  completed
                </Typography>

                <Typography
                  sx={{
                    mt: 0.25,
                    color: '#68748a',
                    fontSize: '0.7rem',
                  }}
                >
                  Keep going — your project will
                  become portfolio evidence.
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* DELIVERABLES */}

          <Box sx={cardSx}>
            <Stack
              direction="row"
              spacing={0.8}
              alignItems="center"
            >
              <DescriptionOutlinedIcon
                sx={{
                  color: '#7a25e8',
                }}
              />

              <Typography
                sx={{
                  color: '#111a38',
                  fontSize: '1.05rem',
                  fontWeight: 900,
                }}
              >
                Deliverables
              </Typography>
            </Stack>

            <Stack
              spacing={0.7}
              sx={{
                mt: 1,
              }}
            >
              {deliverables.map(
                (deliverable) => {
                  const completed =
                    completedDeliverables.has(
                      deliverable.id,
                    );

                  return (
                    <Stack
                      key={
                        deliverable.id
                      }
                      direction="row"
                      spacing={0.8}
                      alignItems="center"
                    >
                      {completed ? (
                        <CheckCircleRoundedIcon
                          sx={{
                            color:
                              '#17aa35',
                            fontSize: 21,
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 19,
                            height: 19,
                            border:
                              '1.5px solid #9aa7bb',
                            borderRadius: 0.7,
                          }}
                        />
                      )}

                      <Typography
                        sx={{
                          color:
                            '#26324a',
                          fontSize:
                            '0.75rem',
                          fontWeight:
                            completed
                              ? 750
                              : 600,
                        }}
                      >
                        {deliverable.label}
                      </Typography>
                    </Stack>
                  );
                },
              )}
            </Stack>
          </Box>

          {/* AI GUIDANCE */}

          <Box
            sx={{
              ...cardSx,
              borderColor: '#d8b8ff',
              background:
                'linear-gradient(145deg, #fbf7ff 0%, #f6efff 100%)',
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="flex-start"
            >
              <PsychologyRoundedIcon
                sx={{
                  color: '#8425e8',
                  fontSize: 31,
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
                  Need Guidance?
                </Typography>

                <Typography
                  sx={{
                    mt: 0.25,
                    color: '#536078',
                    fontSize: '0.76rem',
                    lineHeight: 1.5,
                  }}
                >
                  Get step-by-step help from AI
                  Tutor while working on the
                  project.
                </Typography>
              </Box>
            </Stack>

            <Button
              fullWidth
              variant="outlined"
              startIcon={
                <AutoAwesomeRoundedIcon />
              }
              onClick={handleAiTutor}
              sx={{
                mt: 1.3,
                minHeight: 44,
                borderRadius: 3,
                borderColor: '#8c39ec',
                color: '#5e1ed1',
                textTransform: 'none',
                fontWeight: 900,
              }}
            >
              Ask AI Tutor
            </Button>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

/* ==========================================
   MILESTONE
========================================== */

interface MilestoneRowProps {
  milestone: Milestone;
  active: boolean;
  completed: boolean;
  onClick: () => void;
}

const MilestoneRow = ({
  milestone,
  active,
  completed,
  onClick,
}: MilestoneRowProps) => (
  <Box
    onClick={onClick}
    sx={{
      position: 'relative',
      display: 'grid',
      gridTemplateColumns:
        '36px minmax(0, 1fr)',
      gap: 0.8,
      cursor: 'pointer',
      pb: 1.1,
    }}
  >
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {milestone.id <
        milestones.length && (
        <Box
          sx={{
            position: 'absolute',
            top: 29,
            bottom: -15,
            width: 2,
            bgcolor: '#d6ddea',
          }}
        />
      )}

      <Box
        sx={{
          zIndex: 1,
          width: 26,
          height: 26,
          borderRadius: '50%',
          bgcolor: completed
            ? '#16ad32'
            : active
              ? '#1269ef'
              : '#fff',
          border: completed || active
            ? 'none'
            : '2px solid #aeb8c8',
          color: '#fff',
          display: 'grid',
          placeItems: 'center',
          fontSize: '0.72rem',
          fontWeight: 900,
        }}
      >
        {completed ? (
          <CheckCircleRoundedIcon
            sx={{
              fontSize: 19,
            }}
          />
        ) : (
          milestone.id
        )}
      </Box>
    </Box>

    <Box
      sx={{
        p: 0.9,
        borderRadius: 2,
        bgcolor: completed
          ? '#ebf8ed'
          : active
            ? '#edf3ff'
            : 'transparent',
      }}
    >
      <Typography
        sx={{
          color: '#111a38',
          fontSize: '0.78rem',
          fontWeight: 900,
        }}
      >
        {milestone.id}. {milestone.title}
      </Typography>

      <Typography
        sx={{
          mt: 0.15,
          color: '#536078',
          fontSize: '0.68rem',
          lineHeight: 1.35,
        }}
      >
        {milestone.description}
      </Typography>
    </Box>
  </Box>
);

/* ==========================================
   TASK
========================================== */

interface TaskCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

const TaskCheckbox = ({
  checked,
  onChange,
  label,
}: TaskCheckboxProps) => (
  <Stack
    direction="row"
    spacing={0.6}
    alignItems="center"
  >
    <Checkbox
      size="small"
      checked={checked}
      onChange={(event) =>
        onChange(event.target.checked)
      }
      sx={{
        p: 0.4,
      }}
    />

    <Typography
      sx={{
        color: '#26324a',
        fontSize: '0.75rem',
        lineHeight: 1.4,
      }}
    >
      {label}
    </Typography>
  </Stack>
);

/* ==========================================
   DIAGRAM WORKSPACE
========================================== */

interface DiagramWorkspaceProps {
  selectedFile: File | null;
  onFileChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
}

const DiagramWorkspace = ({
  selectedFile,
  onFileChange,
}: DiagramWorkspaceProps) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        md: '0.8fr 1.2fr',
      },
      gap: 1.2,
    }}
  >
    <Box
      sx={{
        minHeight: 200,
        border:
          '1.5px dashed #8ca2c4',
        borderRadius: 2.5,
        p: 2,
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        bgcolor: '#fbfcff',
      }}
    >
      <Box>
        <UploadFileRoundedIcon
          sx={{
            color: '#1269e8',
            fontSize: 38,
          }}
        />

        <Typography
          sx={{
            mt: 0.5,
            color: '#111a38',
            fontSize: '0.82rem',
            fontWeight: 900,
          }}
        >
          Upload ER Diagram
        </Typography>

        <Typography
          sx={{
            mt: 0.25,
            color: '#68748a',
            fontSize: '0.68rem',
          }}
        >
          PNG, JPG or PDF, up to 10 MB
        </Typography>

        <Button
          component="label"
          variant="outlined"
          sx={{
            mt: 1,
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 850,
          }}
        >
          Choose File

          <input
            hidden
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={onFileChange}
          />
        </Button>

        {selectedFile && (
          <Typography
            sx={{
              mt: 0.8,
              maxWidth: 220,
              color: '#16802f',
              fontSize: '0.68rem',
              fontWeight: 750,
              overflowWrap: 'anywhere',
            }}
          >
            {selectedFile.name}
          </Typography>
        )}
      </Box>
    </Box>

    <Box
      sx={{
        minHeight: 200,
        border:
          '1px solid #dce3ee',
        borderRadius: 2.5,
        p: 1.5,
        bgcolor: '#f8faff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Typography
        sx={{
          color: '#111a38',
          fontSize: '0.75rem',
          fontWeight: 900,
          textAlign: 'center',
          mb: 1,
        }}
      >
        Example Relationship Structure
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm:
              'repeat(3, minmax(0, 1fr))',
          },
          gap: 0.7,
          alignItems: 'center',
        }}
      >
        <EntityBox
          title="Customer"
          fields={[
            'CustomerId (PK)',
            'Name',
            'Phone',
          ]}
        />

        <EntityBox
          title="Orders"
          fields={[
            'OrderId (PK)',
            'CustomerId (FK)',
            'OrderDate',
          ]}
        />

        <EntityBox
          title="OrderItems"
          fields={[
            'OrderItemId (PK)',
            'OrderId (FK)',
            'ProductId (FK)',
          ]}
        />
      </Box>

      <Box
        sx={{
          mt: 0.7,
          maxWidth: 180,
          mx: 'auto',
        }}
      >
        <EntityBox
          title="Product"
          fields={[
            'ProductId (PK)',
            'Name',
            'Price',
          ]}
        />
      </Box>
    </Box>
  </Box>
);

/* ==========================================
   ENTITY
========================================== */

interface EntityBoxProps {
  title: string;
  fields: string[];
}

const EntityBox = ({
  title,
  fields,
}: EntityBoxProps) => (
  <Box
    sx={{
      border: '1px solid #78849b',
      borderRadius: 1.2,
      overflow: 'hidden',
      bgcolor: '#fff',
    }}
  >
    <Typography
      sx={{
        px: 0.6,
        py: 0.35,
        bgcolor: '#e9edff',
        color: '#111a38',
        textAlign: 'center',
        fontSize: '0.63rem',
        fontWeight: 900,
      }}
    >
      {title}
    </Typography>

    <Box sx={{ p: 0.55 }}>
      {fields.map((field) => (
        <Typography
          key={field}
          sx={{
            color: '#354159',
            fontSize: '0.57rem',
            lineHeight: 1.45,
          }}
        >
          {field}
        </Typography>
      ))}
    </Box>
  </Box>
);

/* ==========================================
   PROGRESS
========================================== */

interface ProgressCircleProps {
  progress: number;
}

const ProgressCircle = ({
  progress,
}: ProgressCircleProps) => (
  <Box
    sx={{
      width: 90,
      height: 90,
      borderRadius: '50%',
      background: `conic-gradient(
        #15aa2f 0% ${progress}%,
        #e5e9ef ${progress}% 100%
      )`,
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
    }}
  >
    <Box
      sx={{
        width: 70,
        height: 70,
        borderRadius: '50%',
        bgcolor: '#fff',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Typography
        sx={{
          color: '#111a38',
          fontSize: '1.15rem',
          fontWeight: 950,
        }}
      >
        {progress}%
      </Typography>
    </Box>
  </Box>
);

/* ==========================================
   PROJECT META
========================================== */

interface ProjectMetaProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  divider?: boolean;
}

const ProjectMeta = ({
  icon,
  label,
  value,
  color,
  divider = false,
}: ProjectMetaProps) => (
  <Stack
    direction="row"
    spacing={0.8}
    alignItems="center"
    sx={{
      px: 1.5,
      py: {
        xs: 0.8,
        sm: 0,
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
        color,
        '& svg': {
          fontSize: 30,
        },
      }}
    >
      {icon}
    </Box>

    <Box>
      <Typography
        sx={{
          color: '#68748a',
          fontSize: '0.66rem',
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          color:
            label === 'Portfolio'
              ? '#16802f'
              : '#111a38',
          fontSize: '0.77rem',
          fontWeight: 900,
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </Typography>
    </Box>
  </Stack>
);

/* ==========================================
   WORKSPACE BUTTON
========================================== */

interface WorkspaceButtonProps {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const WorkspaceButton = ({
  active = false,
  icon,
  label,
  onClick,
}: WorkspaceButtonProps) => (
  <Button
    startIcon={icon}
    onClick={onClick}
    sx={{
      minWidth: 140,
      minHeight: 46,
      borderRadius: 2.3,
      textTransform: 'none',
      fontWeight: 850,
      color: active
        ? '#fff'
        : '#17213b',
      bgcolor: active
        ? '#5b2ce8'
        : '#f7f8fc',
      '&:hover': {
        bgcolor: active
          ? '#4c22d5'
          : '#edf1f7',
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
    xs: 1.5,
    md: 1.8,
  },
};

const secondaryButtonSx = {
  minHeight: 44,
  borderRadius: 2.5,
  borderColor: '#7855e8',
  color: '#4e25ca',
  textTransform: 'none',
  fontWeight: 850,
};

const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2.5,
    bgcolor: '#fbfcff',
    alignItems: 'flex-start',
  },
  '& textarea': {
    fontSize: '0.78rem',
    lineHeight: 1.55,
    fontFamily:
      'Consolas, "Courier New", monospace',
  },
};