import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
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

const initialSkills = [
  'React',
  'TypeScript',
  'JavaScript',
  'SQL',
];

const initialMustHave = [
  'Strong problem-solving skills',
  'Experience with React ecosystem',
  'Good understanding of web fundamentals',
];

const initialNiceToHave = [
  'Familiarity with CI/CD',
  'Experience with cloud platforms (AWS, GCP)',
  'Open source contributions',
];

export const EmployerJobRequirementsPage = () => {
  useDocumentMetadata(
    'Job Requirements | Career Harbor',
    'Define the skills, experience, education and eligibility requirements for your job opening.',
    {
      canonicalPath:
        ROUTES.EMPLOYER_JOB_CREATE_REQUIREMENTS,
      noIndex: true,
    },
  );

  const navigate = useNavigate();

  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] =
    useState<string[]>(initialSkills);

  const [minimumExperience, setMinimumExperience] =
    useState('1');
  const [maximumExperience, setMaximumExperience] =
    useState('3');

  const [education, setEducation] = useState(
    "Bachelor's Degree (B.E./B.Tech)",
  );

  const [
    preferredQualifications,
    setPreferredQualifications,
  ] = useState('');

  const [mustHaveInput, setMustHaveInput] =
    useState('');
  const [mustHave, setMustHave] =
    useState<string[]>(initialMustHave);

  const [niceToHaveInput, setNiceToHaveInput] =
    useState('');
  const [niceToHave, setNiceToHave] =
    useState<string[]>(initialNiceToHave);

  const [openIndianCandidates, setOpenIndianCandidates] =
    useState(true);

  const [
    openInternationalCandidates,
    setOpenInternationalCandidates,
  ] = useState(false);

  const [willingToRelocate, setWillingToRelocate] =
    useState(false);

  const [immediateJoiners, setImmediateJoiners] =
    useState(false);

  const [noticePeriod30Days, setNoticePeriod30Days] =
    useState(false);

  const addTag = (
    value: string,
    current: string[],
    setter: React.Dispatch<
      React.SetStateAction<string[]>
    >,
    clear: () => void,
  ) => {
    const normalized = value.trim();

    if (!normalized || current.includes(normalized)) {
      return;
    }

    setter((items) => [...items, normalized]);
    clear();
  };

const handleTagKeyDown = (
  event: KeyboardEvent<HTMLDivElement>,
  callback: () => void,
) => {
  if (event.key !== 'Enter') {
    return;
  }

  event.preventDefault();
  callback();
};

  const canContinue =
    skills.length > 0 &&
    minimumExperience.length > 0 &&
    maximumExperience.length > 0 &&
    education.length > 0 &&
    mustHave.length > 0;

  const handleSaveDraft = () => {
    /*
     * UI-only until the Employer Job API contract
     * is connected.
     */
  };

  const handleNext = () => {
    /*
     * Step 3 route will be connected when
     * Screening & Process is created.
     */
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
            Post a new job opening and reach top talent
            on Career Harbor.
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
            active
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

      {/* MAIN CONTENT */}
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
          {/* LEFT */}
          <Paper
            elevation={0}
            sx={cardSx}
          >
            <SectionHeading
              icon={<WorkOutlineOutlinedIcon />}
              title="Job Requirements"
              subtitle="Define the required skills, experience, education and other criteria for this role."
            />

            <Stack spacing={3}>
              {/* REQUIRED SKILLS */}
              <FormField
                label="Required Skills"
                required
              >
                <TextField
                  fullWidth
                  placeholder="Add a skill (e.g., React, Node.js) and press Enter..."
                  value={skillInput}
                  onChange={(event) =>
                    setSkillInput(event.target.value)
                  }
                  onKeyDown={(event) =>
                    handleTagKeyDown(event, () =>
                      addTag(
                        skillInput,
                        skills,
                        setSkills,
                        () => setSkillInput(''),
                      ),
                    )
                  }
                  size="small"
                  sx={inputSx}
                />

                <TagList
                  items={skills}
                  onDelete={(value) =>
                    setSkills((current) =>
                      current.filter(
                        (item) => item !== value,
                      ),
                    )
                  }
                />
              </FormField>

              {/* EXPERIENCE */}
              <FormField
                label="Experience (Years)"
                required
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: '1fr 1fr',
                    },
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography sx={subLabelSx}>
                      Minimum
                    </Typography>

                    <FormControl
                      fullWidth
                      size="small"
                      sx={inputSx}
                    >
                      <Select
                        value={minimumExperience}
                        onChange={(event) =>
                          setMinimumExperience(
                            event.target.value,
                          )
                        }
                      >
                        <MenuItem value="0">
                          Fresher
                        </MenuItem>

                        <MenuItem value="1">
                          1 year
                        </MenuItem>

                        <MenuItem value="2">
                          2 years
                        </MenuItem>

                        <MenuItem value="3">
                          3 years
                        </MenuItem>

                        <MenuItem value="4">
                          4 years
                        </MenuItem>

                        <MenuItem value="5">
                          5 years
                        </MenuItem>

                        <MenuItem value="6">
                          6+ years
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <Typography sx={subLabelSx}>
                      Maximum
                    </Typography>

                    <FormControl
                      fullWidth
                      size="small"
                      sx={inputSx}
                    >
                      <Select
                        value={maximumExperience}
                        onChange={(event) =>
                          setMaximumExperience(
                            event.target.value,
                          )
                        }
                      >
                        <MenuItem value="1">
                          1 year
                        </MenuItem>

                        <MenuItem value="2">
                          2 years
                        </MenuItem>

                        <MenuItem value="3">
                          3 years
                        </MenuItem>

                        <MenuItem value="4">
                          4 years
                        </MenuItem>

                        <MenuItem value="5">
                          5 years
                        </MenuItem>

                        <MenuItem value="6">
                          6 years
                        </MenuItem>

                        <MenuItem value="8">
                          8 years
                        </MenuItem>

                        <MenuItem value="10">
                          10+ years
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </FormField>

              {/* EDUCATION */}
              <FormField
                label="Education / Qualification"
                required
              >
                <FormControl
                  fullWidth
                  size="small"
                  sx={inputSx}
                >
                  <Select
                    value={education}
                    onChange={(event) =>
                      setEducation(event.target.value)
                    }
                  >
                    <MenuItem value="Any Graduate">
                      Any Graduate
                    </MenuItem>

                    <MenuItem value="Bachelor's Degree (B.E./B.Tech)">
                      Bachelor&apos;s Degree
                      (B.E./B.Tech)
                    </MenuItem>

                    <MenuItem value="BCA / B.Sc Computer Science">
                      BCA / B.Sc Computer Science
                    </MenuItem>

                    <MenuItem value="MCA / M.Sc Computer Science">
                      MCA / M.Sc Computer Science
                    </MenuItem>

                    <MenuItem value="Master's Degree">
                      Master&apos;s Degree
                    </MenuItem>

                    <MenuItem value="MBA">
                      MBA
                    </MenuItem>

                    <MenuItem value="Diploma">
                      Diploma
                    </MenuItem>

                    <MenuItem value="Other">
                      Other
                    </MenuItem>
                  </Select>
                </FormControl>
              </FormField>

              {/* PREFERRED QUALIFICATIONS */}
              <FormField
                label="Preferred Qualifications"
                optional
              >
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  maxRows={6}
                  placeholder="e.g., Postgraduate degree, relevant certifications, specific domain experience..."
                  value={preferredQualifications}
                  onChange={(event) =>
                    setPreferredQualifications(
                      event.target.value.slice(
                        0,
                        500,
                      ),
                    )
                  }
                  sx={{
                    ...inputSx,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#fff',
                    },
                  }}
                />

                <Typography
                  sx={{
                    mt: 0.6,
                    textAlign: 'right',
                    color: '#53627c',
                    fontSize: '0.75rem',
                  }}
                >
                  {preferredQualifications.length} / 500
                </Typography>
              </FormField>
            </Stack>
          </Paper>

          {/* RIGHT */}
          <Stack spacing={2.2}>
            {/* MUST HAVE */}
            <Paper
              elevation={0}
              sx={cardSx}
            >
              <SectionHeading
                icon={<CheckBoxOutlinedIcon />}
                title="Must-Have Requirements"
                required
              />

              <TextField
                fullWidth
                placeholder="Add a requirement and press Enter..."
                value={mustHaveInput}
                onChange={(event) =>
                  setMustHaveInput(
                    event.target.value,
                  )
                }
                onKeyDown={(event) =>
                  handleTagKeyDown(event, () =>
                    addTag(
                      mustHaveInput,
                      mustHave,
                      setMustHave,
                      () => setMustHaveInput(''),
                    ),
                  )
                }
                size="small"
                sx={inputSx}
              />

              <TagList
                items={mustHave}
                onDelete={(value) =>
                  setMustHave((current) =>
                    current.filter(
                      (item) => item !== value,
                    ),
                  )
                }
              />
            </Paper>

            {/* NICE TO HAVE */}
            <Paper
              elevation={0}
              sx={cardSx}
            >
              <SectionHeading
                icon={<AutoAwesomeOutlinedIcon />}
                title="Nice-to-Have Requirements"
                optional
              />

              <TextField
                fullWidth
                placeholder="Add a requirement and press Enter..."
                value={niceToHaveInput}
                onChange={(event) =>
                  setNiceToHaveInput(
                    event.target.value,
                  )
                }
                onKeyDown={(event) =>
                  handleTagKeyDown(event, () =>
                    addTag(
                      niceToHaveInput,
                      niceToHave,
                      setNiceToHave,
                      () =>
                        setNiceToHaveInput(''),
                    ),
                  )
                }
                size="small"
                sx={inputSx}
              />

              <TagList
                items={niceToHave}
                onDelete={(value) =>
                  setNiceToHave((current) =>
                    current.filter(
                      (item) => item !== value,
                    ),
                  )
                }
              />
            </Paper>

            {/* ELIGIBILITY */}
            <Paper
              elevation={0}
              sx={cardSx}
            >
              <SectionHeading
                icon={<GroupsOutlinedIcon />}
                title="Candidate Eligibility & Preferences"
              />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: '1fr 1fr',
                  },
                  gap: {
                    xs: 2,
                    md: 4,
                  },
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      mb: 0.7,
                      fontSize: '0.82rem',
                      fontWeight: 850,
                    }}
                  >
                    Employment Eligibility
                  </Typography>

                  <Stack spacing={0}>
                    <PreferenceCheckbox
                      checked={
                        openIndianCandidates
                      }
                      label="Open to Indian candidates"
                      onChange={
                        setOpenIndianCandidates
                      }
                    />

                    <PreferenceCheckbox
                      checked={
                        openInternationalCandidates
                      }
                      label="Open to remote international candidates"
                      onChange={
                        setOpenInternationalCandidates
                      }
                    />
                  </Stack>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      mb: 0.7,
                      fontSize: '0.82rem',
                      fontWeight: 850,
                    }}
                  >
                    Other Preferences
                    <Box
                      component="span"
                      sx={{
                        ml: 0.4,
                        color: '#65738a',
                        fontWeight: 600,
                      }}
                    >
                      (Optional)
                    </Box>
                  </Typography>

                  <Stack spacing={0}>
                    <PreferenceCheckbox
                      checked={willingToRelocate}
                      label="Willing to relocate"
                      onChange={
                        setWillingToRelocate
                      }
                    />

                    <PreferenceCheckbox
                      checked={immediateJoiners}
                      label="Immediate joiners preferred"
                      onChange={
                        setImmediateJoiners
                      }
                    />

                    <PreferenceCheckbox
                      checked={noticePeriod30Days}
                      label="Notice period up to 30 days"
                      onChange={
                        setNoticePeriod30Days
                      }
                    />
                  </Stack>
                </Box>
              </Box>
            </Paper>
          </Stack>
        </Box>
      </Box>

      {/* BOTTOM BAR */}
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
              ROUTES.EMPLOYER_JOB_CREATE,
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
            disabled={!canContinue}
            endIcon={
              <ArrowForwardOutlinedIcon />
            }
            onClick={handleNext}
            sx={nextButtonSx}
          >
            Next: Screening & Process
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
  optional = false,
  required = false,
  subtitle,
  title,
}: {
  icon: ReactNode;
  optional?: boolean;
  required?: boolean;
  subtitle?: string;
  title: string;
}) => (
  <Stack
    direction="row"
    alignItems="flex-start"
    spacing={1.3}
    sx={{
      mb: 2.3,
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

        {required && (
          <Box
            component="span"
            sx={{
              ml: 0.4,
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
              ml: 0.5,
              color: '#65738a',
              fontSize: '0.9rem',
              fontWeight: 650,
            }}
          >
            (Optional)
          </Box>
        )}
      </Typography>

      {subtitle && (
        <Typography
          sx={{
            mt: 0.35,
            color: '#53627c',
            fontSize: '0.78rem',
            lineHeight: 1.45,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  </Stack>
);

const TagList = ({
  items,
  onDelete,
}: {
  items: string[];
  onDelete: (value: string) => void;
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      gap={0.9}
      sx={{
        mt: 1.2,
      }}
    >
      {items.map((item) => (
        <Chip
          key={item}
          label={item}
          onDelete={() => onDelete(item)}
          sx={tagSx}
        />
      ))}
    </Stack>
  );
};

const PreferenceCheckbox = ({
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
      minHeight: 34,
      alignItems: 'center',
      '& .MuiFormControlLabel-label': {
        color: '#172033',
        fontSize: '0.82rem',
        fontWeight: 600,
      },
    }}
  />
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

const subLabelSx = {
  mb: 0.65,
  color: '#34425b',
  fontSize: '0.79rem',
  fontWeight: 650,
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