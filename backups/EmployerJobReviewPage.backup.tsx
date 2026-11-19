import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const skills = ['React', 'TypeScript', 'JavaScript', 'SQL'];

const hiringStages = [
  'Resume Screening',
  'Technical Assessment',
  'Interview',
  'Final Selection',
];

export const EmployerJobReviewPage = () => {
  useDocumentMetadata(
    'Review & Publish Job | Career Harbor',
    'Review your job details before publishing the opening on Career Harbor.',
    {
      canonicalPath: ROUTES.EMPLOYER_JOB_CREATE_REVIEW,
      noIndex: true,
    },
  );

  const navigate = useNavigate();

  const handleSaveDraft = () => {
    /*
     * UI-only until the real Employer Job API
     * contract is connected.
     */
  };

  const handlePublish = () => {
    /*
     * IMPORTANT:
     * Do not simulate a successful publish here.
     *
     * This will call the real Employer Job API after
     * the complete four-step draft is connected to
     * backend job creation.
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
      {/* PAGE HEADER */}
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
            completed
            number={3}
            title="Screening & Process"
          />

          <StepLine active />

          <StepItem
            active
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
          pb: 12,
        }}
      >
        {/* REVIEW HEADER */}
        <Paper
          elevation={0}
          sx={{
            ...cardSx,
            mb: 2.2,
            display: 'flex',
            flexDirection: {
              xs: 'column',
              lg: 'row',
            },
            alignItems: {
              xs: 'stretch',
              lg: 'center',
            },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.4}
          >
            <SectionIcon>
              <BusinessCenterOutlinedIcon />
            </SectionIcon>

            <Box>
              <Typography
                sx={{
                  fontSize: '1.2rem',
                  fontWeight: 850,
                }}
              >
                Review Job Details
              </Typography>

              <Typography
                sx={{
                  mt: 0.3,
                  color: '#53627c',
                  fontSize: '0.82rem',
                }}
              >
                Review all the information below before publishing your job.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={1.1}
          >
            <EditButton
              label="Edit Job Details"
              onClick={() =>
                navigate(ROUTES.EMPLOYER_JOB_CREATE)
              }
            />

            <EditButton
              label="Edit Requirements"
              onClick={() =>
                navigate(
                  ROUTES.EMPLOYER_JOB_CREATE_REQUIREMENTS,
                )
              }
            />

            <EditButton
              label="Edit Screening"
              onClick={() =>
                navigate(
                  ROUTES.EMPLOYER_JOB_CREATE_SCREENING,
                )
              }
            />
          </Stack>
        </Paper>

        {/* REVIEW GRID */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              xl: 'minmax(0, 1fr) minmax(0, 1fr)',
            },
            gap: 2.2,
            alignItems: 'stretch',
          }}
        >
          {/* JOB DETAILS */}
          <Paper
            elevation={0}
            sx={cardSx}
          >
            <SectionHeading
              icon={<BusinessCenterOutlinedIcon />}
              title="Job Details"
            />

            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={1.2}
              alignItems={{
                xs: 'flex-start',
                sm: 'center',
              }}
              sx={{
                mb: 1.6,
              }}
            >
              <Typography
                sx={{
                  fontSize: '1.12rem',
                  fontWeight: 850,
                }}
              >
                Software Engineer (Frontend)
              </Typography>

              <Chip
                label="Full-time"
                size="small"
                sx={{
                  height: 27,
                  bgcolor: '#ddf7e6',
                  color: '#07852f',
                  fontWeight: 800,
                }}
              />
            </Stack>

            <ReviewRow
              label="Department"
              value="Engineering"
            />

            <ReviewRow
              label="Work Mode"
              value="Hybrid (2–3 days in office)"
            />

            <ReviewRow
              label="Location"
              value="Bengaluru, Karnataka"
            />

            <ReviewRow
              label="Job Type"
              value="Full-time"
            />

            <ReviewRow
              label="Openings"
              value="3"
            />

            <ReviewRow
              label="Salary Range"
              value="₹12,00,000 – ₹18,00,000 per annum"
            />

            <ReviewRow
              label="Application Deadline"
              value="Mar 31, 2025"
            />

            <Box
              sx={{
                pt: 1.4,
              }}
            >
              <Typography
                sx={{
                  mb: 0.5,
                  fontSize: '0.92rem',
                  fontWeight: 850,
                }}
              >
                Job Description
              </Typography>

              <Typography
                sx={{
                  color: '#253653',
                  fontSize: '0.84rem',
                  lineHeight: 1.55,
                }}
              >
                We are looking for a Frontend Software Engineer to build
                scalable and user-friendly web applications. You will work
                closely with product, design and backend teams to deliver
                high-quality features.
              </Typography>
            </Box>
          </Paper>

          {/* RIGHT COLUMN */}
          <Stack spacing={2.2}>
            {/* REQUIREMENTS */}
            <Paper
              elevation={0}
              sx={cardSx}
            >
              <SectionHeading
                icon={<TrackChangesOutlinedIcon />}
                title="Requirements"
              />

              <Stack
                direction="row"
                flexWrap="wrap"
                gap={0.8}
                sx={{
                  mb: 2,
                }}
              >
                {skills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    sx={{
                      height: 31,
                      bgcolor: '#e8efff',
                      color: '#15398a',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                    }}
                  />
                ))}
              </Stack>

              <SummaryLine
                label="Experience:"
                value="1–3 years"
              />

              <SummaryLine
                label="Education:"
                value="Bachelor's Degree (B.E./B.Tech)"
              />

              <SummaryLine
                label="Must-Have:"
                value="Strong problem-solving, React ecosystem, Web fundamentals"
              />

              <SummaryLine
                label="Nice-to-Have:"
                value="CI/CD, Cloud platforms (AWS, GCP), Open source contributions"
              />
            </Paper>

            {/* SCREENING */}
            <Paper
              elevation={0}
              sx={cardSx}
            >
              <SectionHeading
                icon={<LayersOutlinedIcon />}
                title="Screening & Hiring Process"
              />

              <Box
                sx={{
                  display: 'flex',
                  alignItems: {
                    xs: 'flex-start',
                    md: 'center',
                  },
                  flexDirection: {
                    xs: 'column',
                    md: 'row',
                  },
                  gap: {
                    xs: 1,
                    md: 2,
                  },
                  mb: 2.2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.83rem',
                    fontWeight: 850,
                  }}
                >
                  Screening Criteria:
                </Typography>

                <CheckText>
                  Resume Screening
                </CheckText>

                <CheckText>
                  Skills Assessment
                </CheckText>
              </Box>

              <Typography
                sx={{
                  mb: 1.5,
                  fontSize: '0.83rem',
                  fontWeight: 850,
                }}
              >
                Hiring Stages:
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    md: 'repeat(4, 1fr)',
                  },
                  gap: {
                    xs: 2,
                    md: 1,
                  },
                  mb: 2.4,
                }}
              >
                {hiringStages.map((stage, index) => (
                  <Box
                    key={stage}
                    sx={{
                      position: 'relative',
                      textAlign: 'center',
                    }}
                  >
                    {index < hiringStages.length - 1 && (
                      <Box
                        sx={{
                          display: {
                            xs: 'none',
                            md: 'block',
                          },
                          position: 'absolute',
                          top: 16,
                          left: '65%',
                          width: '70%',
                          height: 1.5,
                          bgcolor: '#c6d2e3',
                        }}
                      />
                    )}

                    <Box
                      sx={{
                        position: 'relative',
                        zIndex: 1,
                        width: 34,
                        height: 34,
                        mx: 'auto',
                        mb: 0.7,
                        borderRadius: '50%',
                        bgcolor: '#e6edff',
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
                        px: 0.5,
                        fontSize: '0.76rem',
                        lineHeight: 1.25,
                        fontWeight: 750,
                      }}
                    >
                      {stage}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={{
                  xs: 0.7,
                  sm: 2,
                }}
              >
                <SummaryLine
                  label="Interview Mode:"
                  value="Online (Video)"
                />

                <Box
                  sx={{
                    display: {
                      xs: 'none',
                      sm: 'block',
                    },
                    width: '1px',
                    bgcolor: '#ccd5e2',
                  }}
                />

                <SummaryLine
                  label="Duration:"
                  value="45 minutes"
                />
              </Stack>
            </Paper>
          </Stack>
        </Box>

        {/* READY TO PUBLISH */}
        <Paper
          elevation={0}
          sx={{
            mt: 2.2,
            p: 1.8,
            border: '1px solid #58d69a',
            borderRadius: 3,
            bgcolor: '#edfff7',
            boxShadow: 'none',
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                flexShrink: 0,
                borderRadius: '50%',
                bgcolor: '#09a766',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <CheckOutlinedIcon />
            </Box>

            <Box>
              <Typography
                sx={{
                  color: '#10281e',
                  fontSize: '1rem',
                  fontWeight: 850,
                }}
              >
                Ready to Publish?
              </Typography>

              <Typography
                sx={{
                  mt: 0.2,
                  color: '#344b42',
                  fontSize: '0.8rem',
                }}
              >
                Your job looks good! You can publish it now to start receiving
                applications.
              </Typography>
            </Box>
          </Stack>
        </Paper>
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
              ROUTES.EMPLOYER_JOB_CREATE_SCREENING,
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
            startIcon={<RocketLaunchOutlinedIcon />}
            onClick={handlePublish}
            sx={publishButtonSx}
          >
            Publish Job
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

const ReviewRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <Box
    sx={{
      minHeight: 37,
      py: 0.65,
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: '180px 1fr',
      },
      gap: {
        xs: 0.2,
        sm: 1,
      },
      borderBottom: '1px solid #d9e1ec',
    }}
  >
    <Typography
      sx={{
        color: '#243653',
        fontSize: '0.82rem',
        fontWeight: 750,
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        color: '#101828',
        fontSize: '0.82rem',
        fontWeight: 650,
      }}
    >
      {value}
    </Typography>
  </Box>
);

const SummaryLine = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <Stack
    direction={{
      xs: 'column',
      sm: 'row',
    }}
    spacing={{
      xs: 0.2,
      sm: 1,
    }}
    sx={{
      mb: 0.65,
    }}
  >
    <Typography
      sx={{
        minWidth: 105,
        fontSize: '0.81rem',
        fontWeight: 850,
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        color: '#263650',
        fontSize: '0.81rem',
        fontWeight: 600,
      }}
    >
      {value}
    </Typography>
  </Stack>
);

const CheckText = ({
  children,
}: {
  children: ReactNode;
}) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={0.6}
  >
    <CheckOutlinedIcon
      sx={{
        color: '#075de7',
        fontSize: 20,
        fontWeight: 850,
      }}
    />

    <Typography
      sx={{
        fontSize: '0.81rem',
        fontWeight: 650,
      }}
    >
      {children}
    </Typography>
  </Stack>
);

const EditButton = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => (
  <Button
    variant="outlined"
    startIcon={<EditOutlinedIcon />}
    onClick={onClick}
    sx={{
      minHeight: 41,
      px: 1.8,
      borderRadius: 2,
      borderColor: '#c3d0e4',
      color: '#075de7',
      fontSize: '0.79rem',
      fontWeight: 800,
      textTransform: 'none',
      whiteSpace: 'nowrap',
      '&:hover': {
        borderColor: '#075de7',
        bgcolor: '#f6f9ff',
      },
    }}
  >
    {label}
  </Button>
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
    spacing={1.2}
    sx={{
      mb: 2,
    }}
  >
    <SectionIcon>{icon}</SectionIcon>

    <Typography
      sx={{
        fontSize: '1.08rem',
        fontWeight: 850,
      }}
    >
      {title}
    </Typography>
  </Stack>
);

const SectionIcon = ({
  children,
}: {
  children: ReactNode;
}) => (
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
    {children}
  </Box>
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
      {completed ? (
        <CheckOutlinedIcon
          sx={{
            fontSize: 20,
          }}
        />
      ) : (
        number
      )}
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
  boxShadow: '0 4px 15px rgba(15,23,42,.04)',
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

const publishButtonSx = {
  minHeight: 44,
  px: 2.8,
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