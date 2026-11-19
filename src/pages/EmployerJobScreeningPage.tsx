import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DragIndicatorOutlinedIcon from '@mui/icons-material/DragIndicatorOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useJobDraft } from '@/features/employer/jobs/JobDraftContext';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';


export const EmployerJobScreeningPage = () => {
  useDocumentMetadata(
    'Screening & Process | Career Harbor',
    'Configure candidate screening and hiring process for your job opening.',
    {
      canonicalPath: ROUTES.EMPLOYER_JOB_CREATE_SCREENING,
      noIndex: true,
    },
  );

  const navigate = useNavigate();
  const { draft, updateDraft } = useJobDraft();

  const removeStage = (id: number) => {
    updateDraft({
      stages: draft.stages.filter(
        (stage) => stage.id !== id,
      ),
    });
  };

  const addStage = () => {
    const nextId =
      draft.stages.length === 0
        ? 1
        : Math.max(
            ...draft.stages.map(
              (stage) => stage.id,
            ),
          ) + 1;

    updateDraft({
      stages: [
        ...draft.stages,
        {
          id: nextId,
          name: `Hiring Stage ${
            draft.stages.length + 1
          }`,
        },
      ],
    });
  };
  const handleSaveDraft = () => {
    /*
     * UI-only until the Employer Job API contract
     * is connected.
     */
  };

  const handleNext = () => {
    navigate(ROUTES.EMPLOYER_JOB_CREATE_REVIEW);
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
            completed
            number={1}
            title="Job Details"
          />

          <StepLine active />

          <StepItem
            completed
            number={2}
            title="Requirements"
          />

          <StepLine active />

          <StepItem
            active
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
              xl: 'minmax(0, 1fr) minmax(0, 1fr)',
            },
            gap: 2.2,
            alignItems: 'start',
          }}
        >
          {/* LEFT COLUMN */}
          <Stack spacing={2.2}>
            {/* SCREENING CRITERIA */}
            <Paper
              elevation={0}
              sx={cardSx}
            >
              <SectionHeading
                icon={<WorkOutlineOutlinedIcon />}
                title="Screening Criteria"
                subtitle="Define how you want to screen and shortlist candidates."
              />

              <Stack spacing={0.4}>
                <ScreeningCheckbox
                  checked={draft.resumeScreening}
                  description="Review applications based on candidate resumes"
                  label="Resume Screening"
                  onChange={(checked) => updateDraft({ resumeScreening: checked })}
                />

                <ScreeningCheckbox
                  checked={draft.skillsAssessment}
                  description="Evaluate technical or domain skills (e.g., coding, MCQ, etc.)"
                  label="Skills Assessment"
                  onChange={(checked) => updateDraft({ skillsAssessment: checked })}
                />

                <ScreeningCheckbox
                  checked={draft.aptitudeTest}
                  description="Assess logical, analytical and problem-solving abilities"
                  label="Aptitude Test"
                  onChange={(checked) => updateDraft({ aptitudeTest: checked })}
                />

                <ScreeningCheckbox
                  checked={draft.customQuestion}
                  description="Add role-specific questions for candidate shortlisting"
                  label="Custom Screening Question"
                  onChange={(checked) => updateDraft({ customQuestion: checked })}
                />
              </Stack>
            </Paper>

            {/* HIRING PROCESS */}
            <Paper
              elevation={0}
              sx={cardSx}
            >
              <SectionHeading
                icon={<LayersOutlinedIcon />}
                title="Hiring Process"
                subtitle="Define the stages in your hiring process."
              />

              <Stack spacing={1}>
                {draft.stages.map((stage, index) => (
                  <Box
                    key={stage.id}
                    sx={{
                      minHeight: 44,
                      px: 1.1,
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #e0e6ef',
                      borderRadius: 2,
                      bgcolor: '#fff',
                    }}
                  >
                    <DragIndicatorOutlinedIcon
                      sx={{
                        mr: 1,
                        color: '#6d7d94',
                        fontSize: 21,
                        cursor: 'grab',
                      }}
                    />

                    <Box
                      sx={{
                        width: 34,
                        height: 30,
                        mr: 1.4,
                        borderRadius: 5,
                        bgcolor: '#e5edff',
                        color: '#075de7',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 850,
                      }}
                    >
                      {index + 1}
                    </Box>

                    <Typography
                      sx={{
                        flex: 1,
                        fontSize: '0.86rem',
                        fontWeight: 750,
                      }}
                    >
                      {stage.name}
                    </Typography>

                    <IconButton
                      aria-label={`Edit ${stage.name}`}
                      size="small"
                    >
                      <EditOutlinedIcon
                        sx={{
                          fontSize: 19,
                          color: '#243b63',
                        }}
                      />
                    </IconButton>

                    <IconButton
                      aria-label={`Delete ${stage.name}`}
                      onClick={() =>
                        removeStage(stage.id)
                      }
                      size="small"
                    >
                      <DeleteOutlineOutlinedIcon
                        sx={{
                          fontSize: 19,
                          color: '#243b63',
                        }}
                      />
                    </IconButton>
                  </Box>
                ))}
              </Stack>

              <Button
                variant="outlined"
                startIcon={<AddOutlinedIcon />}
                onClick={addStage}
                sx={{
                  mt: 2,
                  minHeight: 40,
                  px: 2,
                  borderRadius: 2,
                  borderColor: '#075de7',
                  color: '#075de7',
                  fontWeight: 800,
                  textTransform: 'none',
                }}
              >
                Add Stage
              </Button>
            </Paper>
          </Stack>

          {/* RIGHT COLUMN */}
          <Stack spacing={2.2}>
            {/* SCREENING SETTINGS */}
            <Paper
              elevation={0}
              sx={cardSx}
            >
              <SectionHeading
                icon={<SettingsOutlinedIcon />}
                title="Screening Settings"
              />

              <FormField
                label="Minimum Screening Score"
                optional
              >
                <TextField
                  fullWidth
                  type="number"
                  value={draft.minimumScore}
                  onChange={(event) => {
                    const value =
                      Number(event.target.value);

                    if (
                      event.target.value === '' ||
                      (value >= 0 && value <= 100)
                    ) {
                      updateDraft({ minimumScore: event.target.value });
                    }
                  }}
                  size="small"
                  sx={inputSx}
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      max: 100,
                    },
                    input: {
                      endAdornment: (
                        <Typography
                          sx={{
                            color: '#243b63',
                            fontWeight: 850,
                          }}
                        >
                          %
                        </Typography>
                      ),
                    },
                  }}
                />
              </FormField>

              <Stack
                spacing={0}
                sx={{
                  mt: 1.6,
                }}
              >
                <SimpleCheckbox
                  checked={draft.autoShortlist}
                  label="Auto-shortlist candidates who meet the minimum score"
                  onChange={(checked) => updateDraft({ autoShortlist: checked })}
                />

                <SimpleCheckbox
                  checked={draft.manualReview}
                  label="Allow manual review for all candidates"
                  onChange={(checked) => updateDraft({ manualReview: checked })}
                />
              </Stack>
            </Paper>

            {/* INTERVIEW DETAILS */}
            <Paper
              elevation={0}
              sx={cardSx}
            >
              <SectionHeading
                icon={<VideocamOutlinedIcon />}
                title="Interview Details"
              />

              <Stack spacing={2}>
                <FormField
                  label="Interview Mode"
                  required
                >
                  <FormControl
                    fullWidth
                    size="small"
                    sx={inputSx}
                  >
                    <Select
                      value={draft.interviewMode}
                      onChange={(event) =>
                        updateDraft({ interviewMode: event.target.value })
                      }
                    >
                      <MenuItem value="Online (Video)">
                        Online (Video)
                      </MenuItem>

                      <MenuItem value="Phone">
                        Phone
                      </MenuItem>

                      <MenuItem value="In-person">
                        In-person
                      </MenuItem>

                      <MenuItem value="Hybrid">
                        Hybrid
                      </MenuItem>
                    </Select>
                  </FormControl>
                </FormField>

                <FormField
                  label="Estimated Time per Interview"
                  required
                >
                  <FormControl
                    fullWidth
                    size="small"
                    sx={inputSx}
                  >
                    <Select
                      value={draft.interviewDuration}
                      onChange={(event) =>
                        updateDraft({ interviewDuration: event.target.value })
                      }
                    >
                      <MenuItem value="15 minutes">
                        15 minutes
                      </MenuItem>

                      <MenuItem value="30 minutes">
                        30 minutes
                      </MenuItem>

                      <MenuItem value="45 minutes">
                        45 minutes
                      </MenuItem>

                      <MenuItem value="60 minutes">
                        60 minutes
                      </MenuItem>

                      <MenuItem value="90 minutes">
                        90 minutes
                      </MenuItem>
                    </Select>
                  </FormControl>
                </FormField>

                <FormField
                  label="Interviewers"
                  optional
                >
                  <TextField
                    fullWidth
                    placeholder="Add interviewer names or roles (e.g., Tech Lead, HR)"
                    value={draft.interviewers}
                    onChange={(event) =>
                      updateDraft({ interviewers: event.target.value })
                    }
                    size="small"
                    sx={inputSx}
                  />
                </FormField>

                <SimpleCheckbox
                  checked={draft.automaticInvite}
                  label="Send interview invite automatically to shortlisted candidates"
                  onChange={(checked) => updateDraft({ automaticInvite: checked })}
                />
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
          startIcon={<ArrowBackOutlinedIcon />}
          onClick={() =>
            navigate(
              ROUTES.EMPLOYER_JOB_CREATE_REQUIREMENTS,
            )
          }
          sx={backButtonSx}
        >
          Back
        </Button>

        <Stack
          direction="row"
          spacing={1.3}
        >
          <Button
            variant="outlined"
            onClick={handleSaveDraft}
            sx={draftButtonSx}
          >
            Save as Draft
          </Button>

          <Button
            variant="contained"
            endIcon={
              <ArrowForwardOutlinedIcon />
            }
            onClick={handleNext}
            sx={nextButtonSx}
          >
            Next: Review & Publish
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

const ScreeningCheckbox = ({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  label: string;
  onChange: (checked: boolean) => void;
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      minHeight: 52,
    }}
  >
    <Checkbox
      checked={checked}
      onChange={(event) =>
        onChange(event.target.checked)
      }
      size="small"
      sx={{
        mt: -0.25,
        mr: 0.8,
        color: '#6d7d94',
        '&.Mui-checked': {
          color: '#075de7',
        },
      }}
    />

    <Box>
      <Typography
        sx={{
          fontSize: '0.86rem',
          fontWeight: 800,
          lineHeight: 1.25,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.25,
          color: '#53627c',
          fontSize: '0.76rem',
          lineHeight: 1.35,
        }}
      >
        {description}
      </Typography>
    </Box>
  </Box>
);

const SimpleCheckbox = ({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) => (
  <FormControlLabel
    control={
      <Checkbox
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        size="small"
        sx={{
          color: '#66758e',
          '&.Mui-checked': {
            color: '#075de7',
          },
        }}
      />
    }
    label={label}
    sx={{
      mr: 0,
      minHeight: 39,
      '& .MuiFormControlLabel-label': {
        color: '#172033',
        fontSize: '0.82rem',
        fontWeight: 650,
      },
    }}
  />
);

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
        fontWeight: 850,
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
  subtitle,
  title,
}: {
  icon: ReactNode;
  subtitle?: string;
  title: string;
}) => (
  <Stack
    direction="row"
    alignItems="flex-start"
    spacing={1.3}
    sx={{
      mb: 2.2,
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
        '& svg': {
          fontSize: 22,
        },
      }}
    >
      {icon}
    </Box>

    <Box>
      <Typography
        sx={{
          fontSize: '1.1rem',
          lineHeight: 1.3,
          fontWeight: 850,
        }}
      >
        {title}
      </Typography>

      {subtitle && (
        <Typography
          sx={{
            mt: 0.3,
            color: '#53627c',
            fontSize: '0.78rem',
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  </Stack>
);

const StepItem = ({
  active = false,
  completed = false,
  number,
  title,
}: {
  active?: boolean;
  completed?: boolean;
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
          : completed
            ? '#075de7'
            : '#34425b',
        border: active
          ? '2px solid #075de7'
          : completed
            ? '2px solid #075de7'
            : '2px solid #aab7c9',
        fontWeight: 850,
      }}
    >
      {completed ? '✓' : number}
    </Box>

    <Typography
      sx={{
        color:
          active || completed
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

const StepLine = ({
  active = false,
}: {
  active?: boolean;
}) => (
  <Box
    sx={{
      flex: 1,
      minWidth: 60,
      mx: 2,
      height: 1.5,
      bgcolor: active
        ? '#075de7'
        : '#bdc8d8',
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

const backButtonSx = {
  minWidth: 105,
  minHeight: 44,
  borderRadius: 2,
  borderColor: '#b9c5d6',
  color: '#172033',
  fontWeight: 800,
  textTransform: 'none',
};

const draftButtonSx = {
  minHeight: 44,
  px: 2.5,
  borderRadius: 2,
  borderColor: '#c7d3e3',
  color: '#075de7',
  fontWeight: 800,
  textTransform: 'none',
};

const nextButtonSx = {
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
};
