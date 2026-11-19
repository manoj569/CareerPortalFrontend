import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import { useJobDraft } from '@/features/employer/jobs/JobDraftContext';
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  type KeyboardEvent,
  type ReactNode,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';


export const EmployerCreateJobPage = () => {
  useDocumentMetadata(
    'Create Job | Career Harbor',
    'Create a new job opening on Career Harbor.',
    {
      canonicalPath: ROUTES.EMPLOYER_JOB_CREATE,
      noIndex: true,
    },
  );

  const navigate = useNavigate();
  const { draft, updateDraft } = useJobDraft();

  const [responsibilityInput, setResponsibilityInput] =
    useState('');
  const [skillInput, setSkillInput] = useState('');

  const addResponsibility = () => {
    const value = responsibilityInput.trim();

    if (
      !value ||
      draft.responsibilities.includes(value)
    ) {
      return;
    }

    updateDraft({
      responsibilities: [
        ...draft.responsibilities,
        value,
      ],
    });

    setResponsibilityInput('');
  };

  const handleResponsibilityKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    addResponsibility();
  };

  const removeResponsibility = (value: string) => {
    updateDraft({
      responsibilities:
        draft.responsibilities.filter(
          (item) => item !== value,
        ),
    });
  };

  const addSkill = () => {
    const value = skillInput.trim();

    if (!value || draft.skills.includes(value)) {
      return;
    }

    updateDraft({
      skills: [...draft.skills, value],
    });

    setSkillInput('');
  };

  const handleSkillKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    addSkill();
  };

  const removeSkill = (value: string) => {
    updateDraft({
      skills: draft.skills.filter(
        (skill) => skill !== value,
      ),
    });
  };

  const canContinue =
    draft.jobTitle.trim().length > 0 &&
    draft.jobType.length > 0 &&
    draft.workMode.length > 0 &&
    draft.experienceLevel.length > 0 &&
    draft.location.trim().length > 0 &&
    draft.openings.trim().length > 0 &&
    draft.description.trim().length > 0 &&
    draft.responsibilities.length > 0;
  const handleSaveDraft = () => {
    /*
     * UI-only until the employer job-create backend contract
     * is connected.
     */
  };

  const handleNext = () => {
  navigate(ROUTES.EMPLOYER_JOB_CREATE_REQUIREMENTS);
};

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f5f8fd',
        color: '#101828',
      }}
    >
      {/* HEADER */}
      <Box
        component="header"
        sx={{
          minHeight: 74,
          px: {
            xs: 2,
            md: 3.5,
          },
          display: 'flex',
          alignItems: 'center',
          bgcolor: '#fff',
          borderBottom: '1px solid #e4e9f2',
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              fontSize: {
                xs: '1.3rem',
                md: '1.45rem',
              },
              fontWeight: 850,
              lineHeight: 1.15,
            }}
          >
            Create Job
          </Typography>

          <Typography
            sx={{
              mt: 0.45,
              color: '#53627c',
              fontSize: '0.88rem',
            }}
          >
            Post a new job opening and reach top talent on Career Harbor.
          </Typography>
        </Box>
      </Box>

      {/* STEPPER */}
      <Box
        sx={{
          px: {
            xs: 2,
            md: 3.5,
          },
          pt: 2.7,
          pb: 2.3,
          overflowX: 'auto',
        }}
      >
        <Box
          sx={{
            maxWidth: 1050,
            mx: 'auto',
            minWidth: 760,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <StepItem
            active
            number={1}
            title="Job Details"
          />

          <StepLine />

          <StepItem
            number={2}
            title="Requirements"
          />

          <StepLine />

          <StepItem
            number={3}
            title="Screening & Process"
          />

          <StepLine />

          <StepItem
            number={4}
            title="Review & Publish"
          />
        </Box>
      </Box>

      {/* CONTENT */}
      <Box
        component="main"
        sx={{
          px: {
            xs: 2,
            md: 3.5,
          },
          pb: 11,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              xl: 'minmax(0, 1.55fr) minmax(360px, 1fr)',
            },
            gap: 2.2,
            alignItems: 'start',
          }}
        >
          {/* LEFT CARD */}
          <Paper sx={cardSx} elevation={0}>
            <SectionHeading
              icon={<WorkOutlineOutlinedIcon />}
              title="Job Details"
            />

            <Stack spacing={2.25}>
              <FormField label="Job Title" required>
                <TextField
                  fullWidth
                  placeholder="e.g., Software Engineer"
                  value={draft.jobTitle}
                  onChange={(event) =>
                    updateDraft({ jobTitle: event.target.value })
                  }
                  size="small"
                  sx={inputSx}
                />
              </FormField>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: 'repeat(3, 1fr)',
                  },
                  gap: 2,
                }}
              >
                <FormField label="Job Type" required>
                  <FormControl
                    fullWidth
                    size="small"
                    sx={inputSx}
                  >
                    <Select
                      displayEmpty
                      value={draft.jobType}
                      onChange={(event) =>
                        updateDraft({ jobType: event.target.value })
                      }
                    >
                      <MenuItem disabled value="">
                        Select job type
                      </MenuItem>

                      <MenuItem value="Full-time">
                        Full-time
                      </MenuItem>

                      <MenuItem value="Part-time">
                        Part-time
                      </MenuItem>

                      <MenuItem value="Contract">
                        Contract
                      </MenuItem>

                      <MenuItem value="Internship">
                        Internship
                      </MenuItem>
                    </Select>
                  </FormControl>
                </FormField>

                <FormField label="Work Mode" required>
                  <FormControl
                    fullWidth
                    size="small"
                    sx={inputSx}
                  >
                    <Select
                      displayEmpty
                      value={draft.workMode}
                      onChange={(event) =>
                        updateDraft({ workMode: event.target.value })
                      }
                    >
                      <MenuItem disabled value="">
                        Select work mode
                      </MenuItem>

                      <MenuItem value="On-site">
                        On-site
                      </MenuItem>

                      <MenuItem value="Hybrid">
                        Hybrid
                      </MenuItem>

                      <MenuItem value="Remote">
                        Remote
                      </MenuItem>
                    </Select>
                  </FormControl>
                </FormField>

                <FormField
                  label="Experience Level"
                  required
                >
                  <FormControl
                    fullWidth
                    size="small"
                    sx={inputSx}
                  >
                    <Select
                      displayEmpty
                      value={draft.experienceLevel}
                      onChange={(event) =>
                        updateDraft({ experienceLevel: event.target.value })
                      }
                    >
                      <MenuItem disabled value="">
                        Select experience level
                      </MenuItem>

                      <MenuItem value="Fresher">
                        Fresher
                      </MenuItem>

                      <MenuItem value="0-1 years">
                        0-1 years
                      </MenuItem>

                      <MenuItem value="1-3 years">
                        1-3 years
                      </MenuItem>

                      <MenuItem value="3-5 years">
                        3-5 years
                      </MenuItem>

                      <MenuItem value="5-8 years">
                        5-8 years
                      </MenuItem>

                      <MenuItem value="8+ years">
                        8+ years
                      </MenuItem>
                    </Select>
                  </FormControl>
                </FormField>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: '1.25fr 1fr',
                  },
                  gap: 2,
                }}
              >
                <FormField label="Location" required>
                  <TextField
                    fullWidth
                    placeholder="e.g., Pune, India"
                    value={draft.location}
                    onChange={(event) =>
                      updateDraft({ location: event.target.value })
                    }
                    size="small"
                    sx={inputSx}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <LocationOnOutlinedIcon
                            sx={{
                              mr: 1,
                              fontSize: 19,
                              color: '#53627c',
                            }}
                          />
                        ),
                      },
                    }}
                  />
                </FormField>

                <FormField
                  label="Number of Openings"
                  required
                >
                  <TextField
                    fullWidth
                    placeholder="e.g., 2"
                    type="number"
                    value={draft.openings}
                    onChange={(event) =>
                      updateDraft({ openings: event.target.value })
                    }
                    size="small"
                    sx={inputSx}
                    slotProps={{
                      htmlInput: {
                        min: 1,
                      },
                    }}
                  />
                </FormField>
              </Box>

              <FormField
                label="Job Description"
                required
              >
                <Box
                  sx={{
                    border: '1px solid #d3ddea',
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: '#fff',
                    '&:focus-within': {
                      borderColor: '#075de7',
                      boxShadow:
                        '0 0 0 1px #075de7',
                    },
                  }}
                >
                  {/* VISUAL TOOLBAR */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.2}
                    sx={{
                      minHeight: 42,
                      px: 1.2,
                      borderBottom:
                        '1px solid #e4e9f1',
                    }}
                  >
                    <ToolbarButton label="B" />

                    <ToolbarButton
                      italic
                      label="I"
                    />

                    <ToolbarButton
                      underline
                      label="U"
                    />

                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{
                        mx: '8px !important',
                        my: 1,
                      }}
                    />

                    <ToolbarButton label="•" />
                    <ToolbarButton label="≡" />

                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{
                        mx: '8px !important',
                        my: 1,
                      }}
                    />

                    <IconButton size="small">
                      <LinkOutlinedIcon
                        sx={{ fontSize: 19 }}
                      />
                    </IconButton>
                  </Stack>

                  <TextField
                    fullWidth
                    multiline
                    minRows={5}
                    maxRows={8}
                    placeholder="Describe the role, responsibilities and what a successful candidate will do..."
                    value={draft.description}
                    onChange={(event) =>
                      updateDraft({ description: event.target.value.slice(0, 5000) })
                    }
                    variant="standard"
                    slotProps={{
                      input: {
                        disableUnderline: true,
                      },
                    }}
                    sx={{
                      px: 1.8,
                      pt: 1,
                      '& textarea': {
                        fontSize: '0.88rem',
                        lineHeight: 1.55,
                      },
                    }}
                  />

                  <Typography
                    sx={{
                      px: 1.8,
                      pb: 1,
                      textAlign: 'right',
                      color: '#53627c',
                      fontSize: '0.75rem',
                    }}
                  >
                    {draft.description.length} / 5000
                  </Typography>
                </Box>
              </FormField>

              <FormField
                label="Key Responsibilities"
                required
              >
                <TextField
                  fullWidth
                  placeholder="Add a responsibility and press Enter..."
                  value={responsibilityInput}
                  onChange={(event) =>
                    setResponsibilityInput(
                      event.target.value,
                    )
                  }
                  onKeyDown={
                    handleResponsibilityKeyDown
                  }
                  size="small"
                  sx={inputSx}
                />

                {draft.responsibilities.length > 0 && (
                  <Stack
                    direction="row"
                    flexWrap="wrap"
                    gap={1}
                    sx={{ mt: 1.2 }}
                  >
                    {draft.responsibilities.map(
                      (responsibility) => (
                        <Chip
                          key={responsibility}
                          label={responsibility}
                          onDelete={() =>
                            removeResponsibility(
                              responsibility,
                            )
                          }
                          sx={tagSx}
                        />
                      ),
                    )}
                  </Stack>
                )}
              </FormField>
            </Stack>
          </Paper>

          {/* RIGHT COLUMN */}
          <Stack spacing={2.2}>
            {/* COMPANY */}
            <Paper sx={cardSx} elevation={0}>
              <SectionHeading
                icon={<BusinessOutlinedIcon />}
                title="Company & Visibility"
              />

              <FormField label="Company" required>
                <FormControl
                  fullWidth
                  size="small"
                  sx={inputSx}
                >
                  <Select
                    value={draft.company}
                    onChange={(event) =>
                      updateDraft({ company: event.target.value })
                    }
                    startAdornment={
                      <BusinessOutlinedIcon
                        sx={{
                          mr: 1,
                          color: '#075de7',
                          fontSize: 20,
                        }}
                      />
                    }
                  >
                    <MenuItem value="TechNova Solutions">
                      TechNova Solutions
                    </MenuItem>
                  </Select>
                </FormControl>
              </FormField>

              <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{
                  mt: 2.3,
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    flexShrink: 0,
                    borderRadius: 2,
                    bgcolor: '#e9f1ff',
                    color: '#075de7',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <VisibilityIcon />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: '0.88rem',
                      fontWeight: 800,
                    }}
                  >
                    Make this job public
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.2,
                      color: '#53627c',
                      fontSize: '0.78rem',
                    }}
                  >
                    Visible to all candidates on Career Harbor
                  </Typography>
                </Box>

                <Switch
                  checked={draft.isPublic}
                  onChange={(event) =>
                    updateDraft({ isPublic: event.target.checked })
                  }
                  color="primary"
                />
              </Stack>
            </Paper>

            {/* HIGHLIGHTS */}
            <Paper sx={cardSx} elevation={0}>
              <SectionHeading
                icon={<WorkOutlineOutlinedIcon />}
                title="Job Highlights"
              />

              <Stack spacing={2.1}>
                <FormField
                  label="Salary Range"
                  optional
                >
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns:
                        '1fr 1fr',
                      gap: 1.5,
                    }}
                  >
                    <TextField
                      fullWidth
                      type="number"
                      placeholder="Min"
                      value={draft.salaryMin}
                      onChange={(event) =>
                        updateDraft({ salaryMin: event.target.value })
                      }
                      size="small"
                      sx={inputSx}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <Typography
                              sx={{
                                mr: 1,
                                color: '#34425b',
                                fontWeight: 700,
                              }}
                            >
                              ₹
                            </Typography>
                          ),
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      type="number"
                      placeholder="Max"
                      value={draft.salaryMax}
                      onChange={(event) =>
                        updateDraft({ salaryMax: event.target.value })
                      }
                      size="small"
                      sx={inputSx}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <Typography
                              sx={{
                                mr: 1,
                                color: '#34425b',
                                fontWeight: 700,
                              }}
                            >
                              ₹
                            </Typography>
                          ),
                        },
                      }}
                    />
                  </Box>
                </FormField>

                <FormField label="Skills" optional>
                  <TextField
                    fullWidth
                    placeholder="Add skills (e.g., React, JavaScript, SQL)"
                    value={skillInput}
                    onChange={(event) =>
                      setSkillInput(
                        event.target.value,
                      )
                    }
                    onKeyDown={handleSkillKeyDown}
                    size="small"
                    sx={inputSx}
                  />

                  {draft.skills.length > 0 && (
                    <Stack
                      direction="row"
                      flexWrap="wrap"
                      gap={0.8}
                      sx={{ mt: 1.1 }}
                    >
                      {draft.skills.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          onDelete={() =>
                            removeSkill(skill)
                          }
                          sx={tagSx}
                        />
                      ))}
                    </Stack>
                  )}
                </FormField>

                <FormField
                  label="Application Deadline"
                  optional
                >
                  <TextField
                    fullWidth
                    type="date"
                    value={draft.deadline}
                    onChange={(event) =>
                      updateDraft({ deadline: event.target.value })
                    }
                    size="small"
                    sx={inputSx}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <CalendarMonthOutlinedIcon
                            sx={{
                              mr: 1,
                              fontSize: 19,
                              color: '#53627c',
                            }}
                          />
                        ),
                      },
                      htmlInput: {
                        'aria-label':
                          'Application deadline',
                      },
                    }}
                  />
                </FormField>
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Box>

      {/* BOTTOM ACTION BAR */}
      <Box
        sx={{
          position: 'fixed',
          left: {
            xs: 0,
            lg: '260px',
          },
          right: 0,
          bottom: 0,
          zIndex: 1100,
          minHeight: 76,
          px: {
            xs: 2,
            md: 3.5,
          },
          py: 1.4,
          bgcolor: 'rgba(255,255,255,.97)',
          borderTop: '1px solid #dfe5ee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={() =>
            navigate(ROUTES.EMPLOYER_JOBS)
          }
          sx={{
            minWidth: 105,
            minHeight: 44,
            borderRadius: 2,
            borderColor: '#b9c5d6',
            color: '#172033',
            fontWeight: 800,
            textTransform: 'none',
          }}
        >
          Cancel
        </Button>

        <Stack
          direction="row"
          spacing={1.3}
        >
          <Button
            variant="outlined"
            onClick={handleSaveDraft}
            sx={{
              minHeight: 44,
              px: 2.5,
              borderRadius: 2,
              borderColor: '#c7d3e3',
              color: '#075de7',
              fontWeight: 800,
              textTransform: 'none',
            }}
          >
            Save as Draft
          </Button>

          <Button
            variant="contained"
            disabled={!canContinue}
            endIcon={
              <ArrowForwardOutlinedIcon />
            }
            onClick={handleNext}
            sx={{
              minHeight: 44,
              px: 2.5,
              borderRadius: 2,
              bgcolor: '#075de7',
              boxShadow: 'none',
              fontWeight: 800,
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#064fc4',
                boxShadow: 'none',
              },
            }}
          >
            Next: Requirements
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

const FormField = ({
  children,
  label,
  optional = false,
  required = false,
}: {
  children: ReactNode;
  label: string;
  optional?: boolean;
  required?: boolean;
}) => (
  <Box>
    <Typography
      sx={{
        mb: 0.75,
        fontSize: '0.82rem',
        fontWeight: 800,
      }}
    >
      {label}

      {required && (
        <Box
          component="span"
          sx={{
            ml: 0.35,
            color: '#e53935',
          }}
        >
          *
        </Box>
      )}

      {optional && (
        <Box
          component="span"
          sx={{
            ml: 0.45,
            color: '#65738a',
            fontWeight: 600,
          }}
        >
          (Optional)
        </Box>
      )}
    </Typography>

    {children}
  </Box>
);

const SectionHeading = ({
  icon,
  title,
}: {
  icon: ReactNode;
  title: string;
}) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={1.3}
    sx={{
      mb: 2.3,
    }}
  >
    <Box
      sx={{
        width: 42,
        height: 42,
        borderRadius: 2,
        bgcolor: '#e9f1ff',
        color: '#075de7',
        display: 'grid',
        placeItems: 'center',
        '& svg': {
          fontSize: 22,
        },
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        fontSize: '1.15rem',
        fontWeight: 850,
      }}
    >
      {title}
    </Typography>
  </Stack>
);

const StepItem = ({
  active = false,
  number,
  title,
}: {
  active?: boolean;
  number: number;
  title: string;
}) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={1}
    sx={{
      flexShrink: 0,
    }}
  >
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        bgcolor: active
          ? '#075de7'
          : '#f5f8fd',
        color: active
          ? '#fff'
          : '#34425b',
        border: active
          ? '2px solid #075de7'
          : '2px solid #aab7c9',
        fontWeight: 850,
      }}
    >
      {number}
    </Box>

    <Typography
      sx={{
        color: active
          ? '#075de7'
          : '#34425b',
        fontSize: '0.88rem',
        fontWeight: 800,
        whiteSpace: 'nowrap',
      }}
    >
      {title}
    </Typography>
  </Stack>
);

const StepLine = () => (
  <Box
    sx={{
      flex: 1,
      minWidth: 60,
      mx: 2,
      height: 1.5,
      bgcolor: '#bdc8d8',
    }}
  />
);

const ToolbarButton = ({
  italic = false,
  label,
  underline = false,
}: {
  italic?: boolean;
  label: string;
  underline?: boolean;
}) => (
  <IconButton
    size="small"
    sx={{
      width: 32,
      height: 32,
      fontWeight: 850,
      fontStyle: italic
        ? 'italic'
        : 'normal',
      textDecoration: underline
        ? 'underline'
        : 'none',
      color: '#172033',
    }}
  >
    {label}
  </IconButton>
);

const VisibilityIcon = () => (
  <Box
    sx={{
      width: 18,
      height: 18,
      border: '2px solid currentColor',
      borderRadius: '50% 50% 45% 45%',
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        width: 5,
        height: 5,
        borderRadius: '50%',
        bgcolor: 'currentColor',
        top: '50%',
        left: '50%',
        transform:
          'translate(-50%, -50%)',
      },
    }}
  />
);

const cardSx = {
  p: {
    xs: 2,
    md: 2.5,
  },
  border: '1px solid #e0e6ef',
  borderRadius: 3,
  bgcolor: '#fff',
  boxShadow:
    '0 4px 15px rgba(15,23,42,.04)',
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 44,
    borderRadius: 2,
    bgcolor: '#fff',
  },
};

const tagSx = {
  height: 31,
  bgcolor: '#eaf1ff',
  color: '#173c78',
  fontSize: '0.75rem',
  fontWeight: 700,
  '& .MuiChip-deleteIcon': {
    color: '#5d7191',
    fontSize: 17,
    '&:hover': {
      color: '#173c78',
    },
  },
};
