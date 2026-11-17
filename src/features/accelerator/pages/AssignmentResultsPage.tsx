import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface EvaluationItem {
  label: string;
  score: number;
  total: number;
}

interface SubmittedSection {
  id: string;
  title: string;
  content: string;
}

const evaluationItems: EvaluationItem[] = [
  {
    label: 'Problem analysis & identification',
    score: 18,
    total: 20,
  },
  {
    label: 'Normalized database design',
    score: 38,
    total: 40,
  },
  {
    label: 'SQL DDL statements',
    score: 18,
    total: 20,
  },
  {
    label: 'Explanation & justification',
    score: 18,
    total: 20,
  },
];

const submittedSections: SubmittedSection[] = [
  {
    id: 'analysis',
    title: 'Problem Analysis',
    content:
      'The original table contains duplicated customer and product information. This can cause update, insertion and deletion anomalies. Customer, order and product data should be separated into related entities.',
  },
  {
    id: 'design',
    title: 'Database Design (3NF)',
    content:
      'Customers(CustomerId, Name, Phone)\nProducts(ProductId, Name, Price)\nOrders(OrderId, CustomerId, OrderDate)\nOrderItems(OrderItemId, OrderId, ProductId, Quantity)',
  },
  {
    id: 'sql',
    title: 'SQL DDL Statements',
    content: `CREATE TABLE Customers (
  CustomerId INT PRIMARY KEY,
  Name VARCHAR(150) NOT NULL,
  Phone VARCHAR(20)
);

CREATE TABLE Products (
  ProductId INT PRIMARY KEY,
  Name VARCHAR(150) NOT NULL,
  Price DECIMAL(12,2) NOT NULL
);

CREATE TABLE Orders (
  OrderId INT PRIMARY KEY,
  CustomerId INT NOT NULL
);

CREATE TABLE OrderItems (
  OrderItemId INT PRIMARY KEY,
  OrderId INT NOT NULL,
  ProductId INT NOT NULL,
  Quantity INT NOT NULL
);`,
  },
  {
    id: 'explanation',
    title: 'Explanation & Justification',
    content:
      'The normalized design separates independent business entities and removes repeated customer and product attributes from order records. This reduces redundancy and improves consistency.',
  },
];

export const AssignmentResultsPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [selectedSection, setSelectedSection] =
    useState<SubmittedSection | null>(null);

  /*
   * TEMPORARY FRONTEND DISPLAY VALUES.
   *
   * Replace these with the real assignment evaluation
   * response during backend integration.
   *
   * Do not treat these values as a successful production
   * evaluation.
   */
  const score = 92;
  const totalMarks = 100;
  const criteriaMet = 4;
  const totalCriteria = 4;
  const evaluationTime = '1 min';

  const navigateToScreen = (screen: string) => {
    const params =
      new URLSearchParams(searchParams);

    params.set('screen', screen);

    setSearchParams(params);
  };

  const handleBack = () => {
    navigateToScreen('assignment');
  };

  const handleContinueToProject = () => {
    navigateToScreen('project');
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
            bgcolor: 'rgba(255,255,255,0.08)',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            width: 160,
            height: 160,
            borderRadius: '50%',
            right: 170,
            bottom: -110,
            bgcolor: 'rgba(255,255,255,0.05)',
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
              bgcolor: 'rgba(255,180,40,0.12)',
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
            color: 'rgba(255,255,255,0.92)',
            fontSize: {
              xs: '0.84rem',
              md: '0.95rem',
            },
          }}
        >
          Your personalized, AI-powered journey from your
          current skills to your next dream role.
        </Typography>
      </Box>

      {/* PAGE HEADER */}

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
            startIcon={<ArrowBackRoundedIcon />}
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
            Back to Assignment
          </Button>

          <Stack
            direction="row"
            spacing={1.2}
            alignItems="center"
            sx={{
              mt: 0.4,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: '#fff4d6',
                color: '#e99c00',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <EmojiEventsRoundedIcon
                sx={{
                  fontSize: 34,
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
                  letterSpacing: '-0.035em',
                }}
              >
                Assignment Results
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  color: '#111a38',
                  fontSize: '1.05rem',
                  fontWeight: 850,
                }}
              >
                Database Normalization – Hands-on Assignment
              </Typography>

              <Typography
                sx={{
                  mt: 0.1,
                  color: '#58657a',
                  fontSize: '0.82rem',
                }}
              >
                Your assignment has been evaluated. Review
                your results and feedback below.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack
          direction="row"
          spacing={0.7}
          sx={{
            p: 0.65,
            border: '1px solid #dce3ee',
            borderRadius: 3,
            bgcolor: '#fff',
          }}
        >
          <ModeButton
            icon={<CodeRoundedIcon />}
            label="Assignment"
            onClick={handleBack}
          />

          <ModeButton
            active
            icon={<BarChartRoundedIcon />}
            label="Results"
          />
        </Stack>
      </Box>

      {/* SCORE + BREAKDOWN */}

      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl: 'minmax(0, 1.35fr) minmax(380px, 0.9fr)',
          },
          gap: 2,
        }}
      >
        {/* SCORE */}

        <Box sx={cardSx}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '210px minmax(0, 1fr)',
              },
              gap: 2,
              alignItems: 'center',
            }}
          >
            <ScoreCircle score={score} />

            <Box>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.8,
                  borderRadius: 2.5,
                  bgcolor: '#e7f9e8',
                  color: '#116d22',
                }}
              >
                <EmojiEventsRoundedIcon />

                <Typography
                  sx={{
                    fontSize: {
                      xs: '1.1rem',
                      md: '1.3rem',
                    },
                    fontWeight: 900,
                  }}
                >
                  Excellent Work! 🎉
                </Typography>
              </Box>

              <Typography
                sx={{
                  mt: 1.3,
                  color: '#24304a',
                  fontSize: '0.86rem',
                  lineHeight: 1.6,
                }}
              >
                You designed a well-normalized database,
                wrote correct SQL DDL, and provided a clear
                explanation.
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(3, 1fr)',
              },
            }}
          >
            <SummaryMetric
              icon={<CheckCircleRoundedIcon />}
              label="Criteria Met"
              value={`${criteriaMet} / ${totalCriteria}`}
              color="#13ad31"
            />

            <SummaryMetric
              icon={<ScheduleRoundedIcon />}
              label="Evaluated In"
              value={evaluationTime}
              color="#1479ec"
              divider
            />

            <SummaryMetric
              icon={<StarBorderRoundedIcon />}
              label="Total Marks"
              value={`${totalMarks}`}
              color="#eea000"
              divider
            />
          </Box>
        </Box>

        {/* EVALUATION */}

        <Box sx={cardSx}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <BarChartRoundedIcon
              sx={{
                color: '#1269e8',
                fontSize: 28,
              }}
            />

            <Typography
              sx={{
                color: '#111a38',
                fontSize: '1.1rem',
                fontWeight: 900,
              }}
            >
              Evaluation Breakdown
            </Typography>
          </Stack>

          <Stack
            spacing={1.3}
            sx={{
              mt: 1.5,
            }}
          >
            {evaluationItems.map((item) => (
              <EvaluationProgress
                key={item.label}
                item={item}
              />
            ))}
          </Stack>
        </Box>
      </Box>

      {/* FEEDBACK + SUBMISSION */}

      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl: 'minmax(0, 1.35fr) minmax(380px, 0.9fr)',
          },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {/* AI FEEDBACK */}

        <Box sx={cardSx}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <PsychologyRoundedIcon
              sx={{
                color: '#8125e8',
                fontSize: 30,
              }}
            />

            <Typography
              sx={{
                color: '#111a38',
                fontSize: '1.1rem',
                fontWeight: 900,
              }}
            >
              AI Feedback & Suggestions
            </Typography>
          </Stack>

          <Box
            sx={{
              mt: 1.3,
              p: 1.4,
              borderRadius: 2.5,
              background:
                'linear-gradient(100deg, #f2fff3 0%, #f2ebff 100%)',
            }}
          >
            <Stack
              direction="row"
              spacing={0.8}
              alignItems="center"
            >
              <CheckCircleRoundedIcon
                sx={{
                  color: '#13ad31',
                }}
              />

              <Typography
                sx={{
                  color: '#126522',
                  fontWeight: 900,
                }}
              >
                What You Did Well
              </Typography>
            </Stack>

            <Box
              component="ul"
              sx={{
                mt: 0.8,
                mb: 0,
                pl: 3,
                color: '#26324a',
                fontSize: '0.78rem',
                lineHeight: 1.65,
              }}
            >
              <li>
                Correctly identified data duplication and
                normalization issues.
              </li>

              <li>
                Designed an appropriate 3NF structure with
                clear relationships.
              </li>

              <li>
                SQL DDL statements are syntactically correct.
              </li>

              <li>
                Provided a concise and logical explanation.
              </li>
            </Box>
          </Box>

          <Box
            sx={{
              mt: 1.3,
              p: 1.4,
              borderRadius: 2.5,
              bgcolor: '#fffaf0',
              border: '1px solid #f5e4b6',
            }}
          >
            <Stack
              direction="row"
              spacing={0.8}
              alignItems="center"
            >
              <LightbulbOutlinedIcon
                sx={{
                  color: '#ed9900',
                }}
              />

              <Typography
                sx={{
                  color: '#bc5a00',
                  fontWeight: 900,
                }}
              >
                Suggestions for Improvement
              </Typography>
            </Stack>

            <Box
              component="ul"
              sx={{
                mt: 0.8,
                mb: 0,
                pl: 3,
                color: '#26324a',
                fontSize: '0.78rem',
                lineHeight: 1.65,
              }}
            >
              <li>
                Include foreign key constraints explicitly in
                the DDL.
              </li>

              <li>
                Add brief justification for each normal form
                (1NF, 2NF, 3NF).
              </li>
            </Box>
          </Box>
        </Box>

        {/* SUBMITTED SOLUTION */}

        <Box sx={cardSx}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <AssignmentOutlinedIcon
              sx={{
                color: '#5125e8',
                fontSize: 28,
              }}
            />

            <Typography
              sx={{
                color: '#111a38',
                fontSize: '1.1rem',
                fontWeight: 900,
              }}
            >
              Your Submitted Solution
            </Typography>
          </Stack>

          <Stack
            divider={<Divider />}
            sx={{
              mt: 1.2,
            }}
          >
            {submittedSections.map((section) => (
              <Stack
                key={section.id}
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  py: 1,
                }}
              >
                <CheckCircleRoundedIcon
                  sx={{
                    color: '#12aa30',
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                />

                <Typography
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    color: '#17213b',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                  }}
                >
                  {section.title}
                </Typography>

                <Button
                  size="small"
                  variant="outlined"
                  startIcon={
                    <VisibilityOutlinedIcon />
                  }
                  onClick={() =>
                    setSelectedSection(section)
                  }
                  sx={{
                    minWidth: 90,
                    borderRadius: 5,
                    textTransform: 'none',
                    fontWeight: 850,
                  }}
                >
                  View
                </Button>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* NEXT STEP */}

      <Box
        sx={{
          mt: 2,
          mb: 2,
          border: '1px solid #b9caff',
          borderRadius: 3,
          p: {
            xs: 1.5,
            md: 2,
          },
          background:
            'linear-gradient(100deg, #f4f8ff 0%, #f9f3ff 100%)',
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'minmax(0, 1fr) auto',
          },
          gap: 2,
          alignItems: 'center',
        }}
      >
        <Stack
          direction="row"
          spacing={1.2}
          alignItems="center"
        >
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              bgcolor: '#efe7ff',
              color: '#7425e8',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <TrackChangesRoundedIcon
              sx={{
                fontSize: 31,
              }}
            />
          </Box>

          <Box>
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
              Next Step: Build a Real Project
            </Typography>

            <Typography
              sx={{
                mt: 0.15,
                color: '#536078',
                fontSize: '0.78rem',
                lineHeight: 1.5,
              }}
            >
              Apply these skills in a guided project and
              create a portfolio-ready solution.
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="contained"
          endIcon={<ArrowForwardRoundedIcon />}
          onClick={handleContinueToProject}
          sx={{
            minWidth: {
              xs: '100%',
              md: 270,
            },
            minHeight: 50,
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 900,
            fontSize: '0.95rem',
            boxShadow: 'none',
            background:
              'linear-gradient(90deg, #1269ef 0%, #075cff 100%)',
          }}
        >
          Continue to Project
        </Button>
      </Box>

      {/* SUBMITTED SECTION DIALOG */}

      <Dialog
        open={selectedSection !== null}
        onClose={() =>
          setSelectedSection(null)
        }
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: '#111a38',
            fontWeight: 900,
          }}
        >
          {selectedSection?.title}
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: '#f7f9fd',
              border: '1px solid #dce3ee',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
              color: '#26324a',
              fontSize: '0.82rem',
              lineHeight: 1.65,
              fontFamily:
                selectedSection?.id === 'sql'
                  ? 'Consolas, "Courier New", monospace'
                  : 'inherit',
            }}
          >
            {selectedSection?.content}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button
            onClick={() =>
              setSelectedSection(null)
            }
            variant="contained"
            sx={{
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 850,
              boxShadow: 'none',
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/* ==========================================
   SCORE
========================================== */

interface ScoreCircleProps {
  score: number;
}

const ScoreCircle = ({
  score,
}: ScoreCircleProps) => (
  <Box
    sx={{
      mx: 'auto',
      width: 175,
      height: 175,
      borderRadius: '50%',
      background: `conic-gradient(
        #12b51f 0% ${score}%,
        #e5ece7 ${score}% 100%
      )`,
      display: 'grid',
      placeItems: 'center',
    }}
  >
    <Box
      sx={{
        width: 142,
        height: 142,
        borderRadius: '50%',
        bgcolor: '#fff',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
      }}
    >
      <Box>
        <Typography
          sx={{
            color: '#10183a',
            fontSize: '2.2rem',
            fontWeight: 950,
            lineHeight: 1,
          }}
        >
          {score}%
        </Typography>

        <Typography
          sx={{
            mt: 0.6,
            color: '#126522',
            fontSize: '0.95rem',
            fontWeight: 900,
          }}
        >
          {score} / 100
        </Typography>
      </Box>
    </Box>
  </Box>
);

/* ==========================================
   SUMMARY METRIC
========================================== */

interface SummaryMetricProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  divider?: boolean;
}

const SummaryMetric = ({
  icon,
  label,
  value,
  color,
  divider = false,
}: SummaryMetricProps) => (
  <Stack
    direction="row"
    spacing={1}
    alignItems="center"
    sx={{
      px: {
        xs: 0,
        sm: 1.5,
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
        color,
        display: 'grid',
        placeItems: 'center',
        '& svg': {
          fontSize: 31,
        },
      }}
    >
      {icon}
    </Box>

    <Box>
      <Typography
        sx={{
          color: '#68748a',
          fontSize: '0.69rem',
          fontWeight: 700,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          color: '#111a38',
          fontSize: '1rem',
          fontWeight: 900,
        }}
      >
        {value}
      </Typography>
    </Box>
  </Stack>
);

/* ==========================================
   EVALUATION PROGRESS
========================================== */

interface EvaluationProgressProps {
  item: EvaluationItem;
}

const EvaluationProgress = ({
  item,
}: EvaluationProgressProps) => {
  const percentage =
    item.total > 0
      ? Math.round(
          (item.score / item.total) * 100,
        )
      : 0;

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        spacing={1}
        sx={{
          mb: 0.45,
        }}
      >
        <Typography
          sx={{
            color: '#17213b',
            fontSize: '0.77rem',
            fontWeight: 800,
          }}
        >
          {item.label}
        </Typography>

        <Typography
          sx={{
            color: '#111a38',
            fontSize: '0.75rem',
            fontWeight: 900,
            whiteSpace: 'nowrap',
          }}
        >
          {item.score} / {item.total} ({percentage}%)
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 10,
          borderRadius: 6,
          bgcolor: '#e4e9f2',
          '& .MuiLinearProgress-bar': {
            borderRadius: 6,
            background:
              'linear-gradient(90deg, #1284ef 0%, #075eea 100%)',
          },
        }}
      />
    </Box>
  );
};

/* ==========================================
   MODE BUTTON
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
      minWidth: 150,
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

const cardSx = {
  border: '1px solid #dce3ee',
  borderRadius: 3,
  bgcolor: '#fff',
  p: {
    xs: 1.5,
    md: 1.8,
  },
};