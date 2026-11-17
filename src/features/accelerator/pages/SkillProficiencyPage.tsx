import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import MilitaryTechRoundedIcon from '@mui/icons-material/MilitaryTechRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

const skillsGained = [
  'Manage global state with Context API',
  'Create and use a Context Provider',
  'Build reusable, state-driven components',
  'Implement e-commerce cart operations',
  'Apply best practices for state management',
];

const moduleHighlights = [
  {
    icon: <MenuBookRoundedIcon />,
    label: 'Lessons Completed',
    value: '4 / 4',
    progress: 100,
  },
  {
    icon: <CodeRoundedIcon />,
    label: 'Practice Problems',
    value: '3 / 3',
    progress: 100,
  },
  {
    icon: <AssignmentRoundedIcon />,
    label: 'Assignment',
    value: '1 / 1',
    progress: 100,
  },
  {
    icon: <PsychologyRoundedIcon />,
    label: 'Module Assessment',
    value: '1 / 1',
    progress: 100,
  },
];

const scoreItems = [
  {
    icon: <PsychologyRoundedIcon />,
    label: 'Assessment',
    value: '90/100',
  },
  {
    icon: <CodeRoundedIcon />,
    label: 'Practice (Avg.)',
    value: '94/100',
  },
  {
    icon: <AssignmentRoundedIcon />,
    label: 'Assignment',
    value: '92/100',
  },
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

export const SkillProficiencyPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  /*
   * TEMPORARY FRONTEND PROFICIENCY DATA.
   *
   * TODO BACKEND:
   * - Load completed module
   * - Load real assessment score
   * - Load practice average
   * - Load assignment score
   * - Calculate overall proficiency
   * - Persist proficiency level
   * - Generate Skill Passport entry
   * - Generate/return real certificate
   * - Unlock next module
   */

  const overallScore = 92;
  const moduleProgress = 100;

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
    navigateToScreen(
      'skill-assignment-feedback',
    );
  };

  const handleNextModule = () => {
    /*
     * Return to learning module with module 2.
     *
     * Later backend should determine which
     * module is unlocked instead of hardcoding.
     */
    const params =
      new URLSearchParams(searchParams);

    params.set('type', 'skill');
    params.set(
      'screen',
      'skill-learning-module',
    );
    params.set('module', '2');
    params.delete('lesson');
    params.delete('problem');
    params.delete('assessmentType');

    setSearchParams(params);
  };

  const handleDownloadCertificate = () => {
    /*
     * Intentionally no fake certificate.
     *
     * When backend returns a real certificate
     * URL/file, connect download here.
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
          Skill Proficiency
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
            startIcon={
              <ArrowBackRoundedIcon />
            }
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
            Back to Review
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
              completed
            />

            <ModuleStep
              number={6}
              label="Skill Proficiency"
              active
            />
          </Stack>
        </Box>

        {/* MAIN */}
        <Box>
          {/* HERO */}
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 3.5,
              color: '#fff',
              background:
                'linear-gradient(105deg, #30288c 0%, #6034ee 55%, #7e34f4 100%)',
              px: {
                xs: 2,
                md: 2.7,
              },
              py: 2.1,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                width: 220,
                height: 220,
                right: -70,
                top: -100,
                borderRadius: '50%',
                bgcolor:
                  'rgba(255,255,255,0.08)',
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
                    width: 82,
                    height: 82,
                    flexShrink: 0,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor:
                      'rgba(255,255,255,0.14)',
                    border:
                      '1px solid rgba(255,255,255,0.28)',
                  }}
                >
                  <MilitaryTechRoundedIcon
                    sx={{
                      color: '#ffd84a',
                      fontSize: 53,
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
                    Skill Proficiency / Skill
                    Passport
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.3,
                      color:
                        'rgba(255,255,255,0.92)',
                      fontSize: {
                        xs: '0.8rem',
                        md: '0.95rem',
                      },
                    }}
                  >
                    Your mastery summary for this
                    module.
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction={{
                  xs: 'row',
                  sm: 'row',
                }}
                spacing={1}
                alignItems="center"
                useFlexGap
                flexWrap="wrap"
              >
                <Chip
                  icon={
                    <CheckCircleRoundedIcon />
                  }
                  label="Module Completed"
                  sx={{
                    bgcolor: '#c9f8df',
                    color: '#087a52',
                    fontWeight: 950,
                    '& .MuiChip-icon': {
                      color: '#0caf70',
                    },
                  }}
                />

                <Box
                  sx={{
                    minWidth: 120,
                    px: 1.5,
                    py: 1,
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor:
                      'rgba(26,20,112,0.55)',
                    border:
                      '1px solid rgba(255,255,255,0.25)',
                  }}
                >
                  <AutoAwesomeRoundedIcon
                    sx={{
                      color: '#43e8ff',
                      fontSize: 30,
                    }}
                  />

                  <Typography
                    sx={{
                      mt: 0.2,
                      fontWeight: 950,
                      fontSize: '0.68rem',
                    }}
                  >
                    SKILL PASSPORT
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Box>

          {/* PROFICIENCY SUMMARY */}
          <Panel>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  xl: 'minmax(0, 1.25fr) minmax(350px, 0.8fr)',
                },
                gap: 2.5,
                alignItems: 'center',
              }}
            >
              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={2.5}
                alignItems={{
                  xs: 'center',
                  sm: 'center',
                }}
              >
                <ProficiencyBadge />

                <Box
                  sx={{
                    flex: 1,
                    textAlign: {
                      xs: 'center',
                      sm: 'left',
                    },
                  }}
                >
                  <Typography
                    sx={{
                      color: '#101828',
                      fontWeight: 950,
                      fontSize: {
                        xs: '1.3rem',
                        md: '1.55rem',
                      },
                    }}
                  >
                    React – State Management
                  </Typography>

                  <Chip
                    label="Proficiency Level: Proficient"
                    sx={{
                      mt: 1,
                      bgcolor: '#d6fbe6',
                      color: '#079455',
                      fontWeight: 950,
                    }}
                  />

                  <Typography
                    sx={{
                      mt: 1.2,
                      maxWidth: 590,
                      color: '#344054',
                      fontSize: '0.82rem',
                      lineHeight: 1.55,
                    }}
                  >
                    You&apos;ve demonstrated a
                    strong understanding of state
                    management in React, including
                    Context API, by completing the
                    module, practice and
                    assignment.
                  </Typography>
                </Box>
              </Stack>

              <Box
                sx={{
                  pl: {
                    xs: 0,
                    xl: 2.5,
                  },
                  borderLeft: {
                    xs: 'none',
                    xl: '1px solid #dfe4ec',
                  },
                }}
              >
                <Typography
                  sx={{
                    color: '#172033',
                    fontWeight: 950,
                    fontSize: '1.05rem',
                  }}
                >
                  Overall Module Score
                </Typography>

                <Stack
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={2}
                  alignItems="center"
                  sx={{ mt: 1.3 }}
                >
                  <ScoreCircle
                    value={overallScore}
                  />

                  <Stack
                    spacing={0.8}
                    sx={{
                      width: '100%',
                    }}
                  >
                    {scoreItems.map(
                      (item) => (
                        <ScoreRow
                          key={item.label}
                          {...item}
                        />
                      ),
                    )}
                  </Stack>
                </Stack>
              </Box>
            </Box>
          </Panel>

          {/* MIDDLE */}
          <Box
            sx={{
              mt: 2,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                xl: '1fr 1fr',
              },
              gap: 2,
            }}
          >
            {/* HIGHLIGHTS */}
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
                    fontWeight: 950,
                    fontSize: '1.05rem',
                  }}
                >
                  Module Highlights
                </Typography>
              </Stack>

              <Stack
                spacing={1.25}
                sx={{ mt: 1.5 }}
              >
                {moduleHighlights.map(
                  (item) => (
                    <Stack
                      key={item.label}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          width: 30,
                          color: '#563cf0',
                          display: 'grid',
                          placeItems: 'center',
                          '& svg': {
                            fontSize: 21,
                          },
                        }}
                      >
                        {item.icon}
                      </Box>

                      <Typography
                        sx={{
                          width: {
                            xs: 120,
                            sm: 155,
                          },
                          color: '#27314a',
                          fontWeight: 750,
                          fontSize: '0.76rem',
                        }}
                      >
                        {item.label}
                      </Typography>

                      <LinearProgress
                        variant="determinate"
                        value={item.progress}
                        sx={{
                          flex: 1,
                          minWidth: 70,
                          height: 9,
                          borderRadius: 99,
                          bgcolor: '#e2e7ed',
                          '& .MuiLinearProgress-bar':
                            {
                              bgcolor:
                                '#0caf70',
                              borderRadius: 99,
                            },
                        }}
                      />

                      <Typography
                        sx={{
                          minWidth: 40,
                          textAlign: 'right',
                          color: '#172033',
                          fontWeight: 950,
                          fontSize: '0.75rem',
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Stack>
                  ),
                )}
              </Stack>
            </Panel>

            {/* SKILLS */}
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
                    fontSize: '1.05rem',
                  }}
                >
                  Skills Gained
                </Typography>
              </Stack>

              <Stack
                spacing={0.85}
                sx={{ mt: 1.5 }}
              >
                {skillsGained.map((skill) => (
                  <Stack
                    key={skill}
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                  >
                    <CheckCircleRoundedIcon
                      sx={{
                        color: '#0caf70',
                        fontSize: 20,
                        mt: '1px',
                      }}
                    />

                    <Typography
                      sx={{
                        color: '#27314a',
                        fontSize: '0.77rem',
                        lineHeight: 1.45,
                      }}
                    >
                      {skill}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Panel>
          </Box>

          {/* BOTTOM */}
          <Box
            sx={{
              mt: 2,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                xl: '0.85fr 1.15fr',
              },
              gap: 2,
            }}
          >
            {/* ACHIEVEMENTS */}
            <Panel>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <EmojiEventsRoundedIcon
                  sx={{
                    color: '#f5a300',
                  }}
                />

                <Typography
                  sx={{
                    color: '#172033',
                    fontWeight: 950,
                    fontSize: '1.05rem',
                  }}
                >
                  Achievements
                </Typography>
              </Stack>

              <Box
                sx={{
                  mt: 1.5,
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(3, 1fr)',
                  },
                  gap: 1,
                }}
              >
                <AchievementCard
                  icon={
                    <MenuBookRoundedIcon />
                  }
                  title="Module Completer"
                  tone="purple"
                />

                <AchievementCard
                  icon={<CodeRoundedIcon />}
                  title="Practice Champion"
                  tone="green"
                />

                <AchievementCard
                  icon={
                    <WorkspacePremiumRoundedIcon />
                  }
                  title="Assignment Achiever"
                  tone="gold"
                />
              </Box>
            </Panel>

            {/* CERTIFICATE */}
            <Panel>
              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={2}
                alignItems="center"
              >
                <Box sx={{ flex: 1 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <WorkspacePremiumRoundedIcon
                      sx={{
                        color: '#563cf0',
                      }}
                    />

                    <Typography
                      sx={{
                        color: '#172033',
                        fontWeight: 950,
                        fontSize: '1.05rem',
                      }}
                    >
                      Completion Certificate
                    </Typography>
                  </Stack>

                  <Typography
                    sx={{
                      mt: 1.2,
                      color: '#172033',
                      fontWeight: 900,
                      fontSize: '0.88rem',
                    }}
                  >
                    React – State Management
                    Module Certificate
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      color: '#475467',
                      fontSize: '0.75rem',
                      lineHeight: 1.5,
                    }}
                  >
                    Awarded for successfully
                    completing the module with a
                    score of {overallScore}/100.
                  </Typography>

                  <Button
                    variant="contained"
                    startIcon={
                      <DownloadRoundedIcon />
                    }
                    onClick={
                      handleDownloadCertificate
                    }
                    sx={{
                      mt: 1.4,
                      minHeight: 43,
                      px: 2.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 900,
                      boxShadow: 'none',
                      background:
                        'linear-gradient(90deg, #6734f2, #5138e8)',
                    }}
                  >
                    Download Certificate
                  </Button>
                </Box>

                <CertificatePreview />
              </Stack>
            </Panel>
          </Box>

          {/* ACTIONS */}
          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
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
              onClick={handleBack}
              sx={{
                minHeight: 48,
                px: 3,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 850,
              }}
            >
              Back to Review & Feedback
            </Button>

            <Button
              variant="contained"
              endIcon={
                <ArrowForwardRoundedIcon />
              }
              onClick={handleNextModule}
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
                  'linear-gradient(90deg, #6734f2, #5138e8)',
              }}
            >
              Continue to Next Module
            </Button>
          </Stack>

          <Typography
            sx={{
              mt: 1.2,
              textAlign: 'center',
              color: '#98a2b3',
              fontSize: '0.64rem',
            }}
          >
            Proficiency level, scores,
            achievements and certificate shown
            here are temporary UI values until
            the Skill Passport and proficiency
            backend services are connected.
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
          fontSize: '0.72rem',
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
        <WorkspacePremiumRoundedIcon
          sx={{
            color: '#563cf0',
            fontSize: 20,
          }}
        />
      )}
    </Stack>
  </Box>
);

const ScoreCircle = ({
  value,
}: {
  value: number;
}) => (
  <Box
    sx={{
      position: 'relative',
      width: 125,
      height: 125,
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
          #dff3e9 ${value}% 100%
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
          color: '#172033',
          fontWeight: 950,
          fontSize: '1.45rem',
        }}
      >
        {value}
        <Box
          component="span"
          sx={{
            fontSize: '0.72rem',
          }}
        >
          /100
        </Box>
      </Typography>
    </Box>
  </Box>
);

const ScoreRow = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) => (
  <Stack
    direction="row"
    spacing={1}
    alignItems="center"
    sx={{
      px: 1.1,
      py: 0.85,
      borderRadius: 2,
      border: '1px solid #e3e7ed',
      bgcolor: '#fbfcfe',
    }}
  >
    <Box
      sx={{
        color: '#563cf0',
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
        color: '#27314a',
        fontWeight: 750,
        fontSize: '0.72rem',
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        color: '#172033',
        fontWeight: 950,
        fontSize: '0.74rem',
      }}
    >
      {value}
    </Typography>
  </Stack>
);

const ProficiencyBadge = () => (
  <Box
    sx={{
      width: 190,
      flexShrink: 0,
      textAlign: 'center',
    }}
  >
    <Box
      sx={{
        width: 135,
        height: 135,
        mx: 'auto',
        position: 'relative',
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        background:
          'linear-gradient(145deg, #3526aa, #6940f5)',
        border: '7px solid #d6ccff',
        boxShadow:
          '0 8px 22px rgba(86,60,240,0.22)',
      }}
    >
      <AutoAwesomeRoundedIcon
        sx={{
          color: '#42e9ff',
          fontSize: 73,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: -18,
          left: '50%',
          transform: 'translateX(-50%)',
          px: 2.1,
          py: 0.6,
          minWidth: 135,
          borderRadius: 1,
          bgcolor: '#6d27e8',
          color: '#fff',
          fontWeight: 950,
          fontSize: '0.9rem',
          boxShadow:
            '0 5px 12px rgba(67,36,165,0.25)',
        }}
      >
        Proficient
      </Box>
    </Box>
  </Box>
);

const AchievementCard = ({
  icon,
  title,
  tone,
}: {
  icon: ReactNode;
  title: string;
  tone: 'purple' | 'green' | 'gold';
}) => {
  const background =
    tone === 'green'
      ? '#e4faed'
      : tone === 'gold'
        ? '#fff4cf'
        : '#eee9ff';

  const color =
    tone === 'green'
      ? '#0caf70'
      : tone === 'gold'
        ? '#f3a000'
        : '#6734f2';

  return (
    <Box
      sx={{
        p: 1.3,
        minHeight: 140,
        borderRadius: 2.5,
        border: '1px solid #e1e6ee',
        textAlign: 'center',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Box>
        <Box
          sx={{
            width: 60,
            height: 60,
            mx: 'auto',
            borderRadius: 2,
            bgcolor: background,
            color,
            display: 'grid',
            placeItems: 'center',
            '& svg': {
              fontSize: 36,
            },
          }}
        >
          {icon}
        </Box>

        <Typography
          sx={{
            mt: 1,
            color: '#172033',
            fontWeight: 950,
            fontSize: '0.72rem',
            lineHeight: 1.25,
          }}
        >
          {title}
        </Typography>
      </Box>
    </Box>
  );
};

const CertificatePreview = () => (
  <Box
    sx={{
      width: {
        xs: '100%',
        sm: 220,
      },
      maxWidth: 240,
      minHeight: 145,
      p: 1,
      borderRadius: 2,
      bgcolor: '#f7f4ff',
      border: '6px solid #d8ceff',
      boxShadow:
        '0 8px 20px rgba(86,60,240,0.13)',
      textAlign: 'center',
    }}
  >
    <Typography
      sx={{
        color: '#172033',
        fontWeight: 950,
        fontSize: '0.67rem',
      }}
    >
      CareerHarbor
    </Typography>

    <Typography
      sx={{
        mt: 0.4,
        color: '#563cf0',
        fontWeight: 900,
        fontSize: '0.58rem',
      }}
    >
      Certificate of Completion
    </Typography>

    <SchoolRoundedIcon
      sx={{
        mt: 1,
        color: '#10b9e7',
        fontSize: 34,
      }}
    />

    <Box
      sx={{
        width: '75%',
        height: 1,
        mx: 'auto',
        mt: 0.8,
        bgcolor: '#d7dce4',
      }}
    />

    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-end"
      sx={{ mt: 1 }}
    >
      <Box
        sx={{
          width: 70,
          height: 5,
          borderBottom:
            '1px solid #344054',
        }}
      />

      <WorkspacePremiumRoundedIcon
        sx={{
          color: '#f3a000',
          fontSize: 29,
        }}
      />
    </Stack>
  </Box>
);