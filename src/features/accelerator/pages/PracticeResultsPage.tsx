import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';

import {
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';

import { useSearchParams } from 'react-router-dom';

interface QuestionResult {
  id: number;
  title: string;
  skill: string;
  correct: boolean;
}

interface SkillConfidence {
  name: string;
  value: number;
}

const questionResults: QuestionResult[] = [
  {
    id: 1,
    title: 'Purpose of database normalization',
    skill: 'Normalization',
    correct: true,
  },
  {
    id: 2,
    title: 'Understanding Second Normal Form',
    skill: 'Database Design',
    correct: true,
  },
  {
    id: 3,
    title: 'Identifying duplicated customer data',
    skill: 'Data Modeling',
    correct: true,
  },
  {
    id: 4,
    title: 'Separating Customers and Orders',
    skill: 'Database Design',
    correct: true,
  },
  {
    id: 5,
    title: 'Removing transitive dependencies',
    skill: 'Normalization',
    correct: false,
  },
  {
    id: 6,
    title: 'Recognizing update anomalies',
    skill: 'SQL Fundamentals',
    correct: true,
  },
  {
    id: 7,
    title: 'Representing business entities',
    skill: 'Data Modeling',
    correct: true,
  },
  {
    id: 8,
    title: 'Using foreign keys between entities',
    skill: 'SQL Fundamentals',
    correct: true,
  },
];

const skillConfidence: SkillConfidence[] = [
  {
    name: 'Database Design',
    value: 82,
  },
  {
    name: 'Normalization',
    value: 90,
  },
  {
    name: 'Data Modeling',
    value: 86,
  },
  {
    name: 'SQL Fundamentals',
    value: 88,
  },
];

export const PracticeResultsPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  /*
   * TEMPORARY UI VALUES.
   *
   * During backend integration replace these values with
   * the completed practice session / attempt / evaluation
   * response from the existing Accelerator backend.
   */
  const score = 88;
  const correctAnswers = 7;
  const totalQuestions = 8;
  const needsReview = 1;
  const timeTaken = '11 min';

  const navigateToScreen = (screen: string) => {
    const params = new URLSearchParams(searchParams);

    params.set('screen', screen);

    setSearchParams(params);
  };

  const handleBackToPractice = () => {
    navigateToScreen('practice');
  };

  const handlePracticeAgain = () => {
    navigateToScreen('practice');
  };

  const handleReviewLesson = () => {
    navigateToScreen('learning-module');
  };

  const handleContinueAssignment = () => {
    navigateToScreen('assignment');
  };

  const handleAskAi = () => {
    navigateToScreen('ai-tutor');
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
      {/* ======================================
          HERO
      ======================================= */}

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
            'linear-gradient(115deg, #1158b9 0%, #3449d7 52%, #751fe4 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 290,
            height: 290,
            borderRadius: '50%',
            right: -75,
            top: -160,
            bgcolor: 'rgba(255,255,255,0.08)',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            width: 150,
            height: 150,
            borderRadius: '50%',
            right: 150,
            bottom: -100,
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
              fontWeight: 850,
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
              fontWeight: 750,
            }}
          >
            Premium
          </Box>
        </Stack>

        <Typography
          sx={{
            position: 'relative',
            mt: 0.65,
            maxWidth: 800,
            color: 'rgba(255,255,255,0.9)',
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

      {/* ======================================
          PAGE HEADER
      ======================================= */}

      <Box sx={{ mt: 1.5 }}>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={handleBackToPractice}
          sx={{
            px: 0,
            minWidth: 0,
            textTransform: 'none',
            color: '#17213b',
            fontWeight: 800,
            '&:hover': {
              bgcolor: 'transparent',
              color: '#075fd6',
            },
          }}
        >
          Back to Practice
        </Button>

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
            mt: 0.5,
          }}
        >
          <Stack
            direction="row"
            spacing={1.2}
            alignItems="center"
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                bgcolor: '#ecf8ef',
                color: '#19a63a',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <EmojiEventsRoundedIcon
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
                  letterSpacing: '-0.035em',
                  lineHeight: 1.1,
                }}
              >
                Practice Complete
              </Typography>

              <Typography
                sx={{
                  mt: 0.2,
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
                Great work. Review your results and strengthen
                the areas that need more practice.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={1}
            sx={{
              width: {
                xs: '100%',
                md: 'auto',
              },
            }}
          >
            <Button
              variant="outlined"
              startIcon={<MenuBookRoundedIcon />}
              onClick={handleReviewLesson}
              sx={secondaryButtonSx}
            >
              Review Lesson
            </Button>

            <Button
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              onClick={handlePracticeAgain}
              sx={secondaryButtonSx}
            >
              Practice Again
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* ======================================
          RESULT SUMMARY
      ======================================= */}

      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '360px minmax(0, 1fr)',
          },
          gap: 2,
          alignItems: 'stretch',
        }}
      >
        {/* SCORE */}

        <Box
          sx={{
            border: '1px solid #dce3ee',
            borderRadius: 3,
            bgcolor: '#fff',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            sx={{
              color: '#111a38',
              fontSize: '1.05rem',
              fontWeight: 900,
            }}
          >
            Your Score
          </Typography>

          <ScoreCircle score={score} />

          <Chip
            icon={<TrendingUpRoundedIcon />}
            label="Strong Performance"
            sx={{
              mt: 1,
              bgcolor: '#e9f8ed',
              color: '#147c2e',
              fontWeight: 850,
              '& .MuiChip-icon': {
                color: '#18a93a',
              },
            }}
          />

          <Typography
            sx={{
              mt: 1,
              maxWidth: 280,
              textAlign: 'center',
              color: '#647087',
              fontSize: '0.77rem',
              lineHeight: 1.5,
            }}
          >
            You have a strong understanding of database
            normalization fundamentals.
          </Typography>
        </Box>

        {/* METRICS */}

        <Box
          sx={{
            border: '1px solid #dce3ee',
            borderRadius: 3,
            bgcolor: '#fff',
            p: 2,
          }}
        >
          <Typography
            sx={{
              color: '#111a38',
              fontSize: '1.05rem',
              fontWeight: 900,
            }}
          >
            Session Summary
          </Typography>

          <Box
            sx={{
              mt: 1.4,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(3, 1fr)',
              },
              gap: 1.2,
            }}
          >
            <MetricCard
              icon={<CheckRoundedIcon />}
              label="Correct Answers"
              value={`${correctAnswers} / ${totalQuestions}`}
              iconBackground="#e7f8eb"
              iconColor="#18a93a"
            />

            <MetricCard
              icon={<TrackChangesRoundedIcon />}
              label="Needs Review"
              value={`${needsReview}`}
              iconBackground="#fff2e0"
              iconColor="#ef9200"
            />

            <MetricCard
              icon={<ScheduleRoundedIcon />}
              label="Time Taken"
              value={timeTaken}
              iconBackground="#edf3ff"
              iconColor="#1269e8"
            />
          </Box>

          <Divider sx={{ my: 1.8 }} />

          <Stack
            direction="row"
            spacing={1}
            alignItems="flex-start"
          >
            <CheckCircleRoundedIcon
              sx={{
                color: '#18a93a',
                mt: 0.1,
              }}
            />

            <Box>
              <Typography
                sx={{
                  color: '#111a38',
                  fontSize: '0.85rem',
                  fontWeight: 850,
                }}
              >
                Practice successfully completed
              </Typography>

              <Typography
                sx={{
                  mt: 0.2,
                  color: '#647087',
                  fontSize: '0.76rem',
                  lineHeight: 1.5,
                }}
              >
                Your practice result can contribute to your
                Accelerator learning progress once the backend
                evaluation data is connected.
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* ======================================
          MAIN RESULTS
      ======================================= */}

      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl: 'minmax(0, 1.5fr) 410px',
          },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {/* QUESTION RESULTS */}

        <Box sx={cardSx}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
          >
            <Box>
              <Typography
                sx={{
                  color: '#111a38',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                }}
              >
                Question Results
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  color: '#68748a',
                  fontSize: '0.76rem',
                }}
              >
                Review your answers and identify what needs
                more attention.
              </Typography>
            </Box>

            <Chip
              label={`${correctAnswers} of ${totalQuestions} correct`}
              sx={{
                bgcolor: '#eaf8ee',
                color: '#147c2e',
                fontWeight: 800,
              }}
            />
          </Stack>

          <Stack
            divider={<Divider />}
            sx={{
              mt: 1.3,
            }}
          >
            {questionResults.map((result) => (
              <QuestionResultRow
                key={result.id}
                result={result}
              />
            ))}
          </Stack>
        </Box>

        {/* RIGHT SIDE */}

        <Stack spacing={2}>
          {/* SKILL CONFIDENCE */}

          <Box sx={cardSx}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <TrackChangesRoundedIcon
                sx={{
                  color: '#1269e8',
                  fontSize: 27,
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
                  Skill Confidence
                </Typography>

                <Typography
                  sx={{
                    color: '#68748a',
                    fontSize: '0.72rem',
                  }}
                >
                  Estimated from this practice session
                </Typography>
              </Box>
            </Stack>

            <Stack
              spacing={1.3}
              sx={{
                mt: 1.5,
              }}
            >
              {skillConfidence.map((skill) => (
                <SkillProgress
                  key={skill.name}
                  skill={skill}
                />
              ))}
            </Stack>
          </Box>

          {/* AI FEEDBACK */}

          <Box
            sx={{
              ...cardSx,
              borderColor: '#d9c3ff',
              background:
                'linear-gradient(145deg, #fbf8ff 0%, #f5efff 100%)',
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="flex-start"
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2.2,
                  bgcolor: '#eee3ff',
                  color: '#7226e8',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <AutoAwesomeRoundedIcon />
              </Box>

              <Box>
                <Typography
                  sx={{
                    color: '#111a38',
                    fontSize: '1.05rem',
                    fontWeight: 900,
                  }}
                >
                  AI Feedback
                </Typography>

                <Typography
                  sx={{
                    mt: 0.15,
                    color: '#68748a',
                    fontSize: '0.73rem',
                  }}
                >
                  Personalized practice insight
                </Typography>
              </Box>
            </Stack>

            <Typography
              sx={{
                mt: 1.3,
                color: '#354159',
                fontSize: '0.79rem',
                lineHeight: 1.6,
              }}
            >
              You understand the core normalization concepts
              well. Your strongest areas are identifying data
              duplication and designing relationships between
              entities.
            </Typography>

            <Box
              sx={{
                mt: 1.2,
                p: 1.2,
                borderRadius: 2,
                bgcolor: '#fff',
                border: '1px solid #e7dbfb',
              }}
            >
              <Stack
                direction="row"
                spacing={0.8}
                alignItems="flex-start"
              >
                <LightbulbOutlinedIcon
                  sx={{
                    color: '#ed9800',
                    fontSize: 21,
                  }}
                />

                <Box>
                  <Typography
                    sx={{
                      color: '#111a38',
                      fontSize: '0.78rem',
                      fontWeight: 850,
                    }}
                  >
                    Focus Area
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.2,
                      color: '#58657a',
                      fontSize: '0.74rem',
                      lineHeight: 1.5,
                    }}
                  >
                    Review transitive dependencies and practice
                    converting tables into Third Normal Form
                    (3NF).
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<PsychologyRoundedIcon />}
              onClick={handleAskAi}
              sx={{
                mt: 1.2,
                minHeight: 44,
                borderRadius: 2.5,
                borderColor: '#a979f2',
                color: '#6121d5',
                textTransform: 'none',
                fontWeight: 850,
                '&:hover': {
                  borderColor: '#7624e9',
                  bgcolor: '#faf6ff',
                },
              }}
            >
              Ask AI Tutor About My Results
            </Button>
          </Box>
        </Stack>
      </Box>

      {/* ======================================
          NEXT STEP
      ======================================= */}

      <Box
        sx={{
          mt: 2,
          mb: 2,
          border: '1px solid #cddcff',
          borderRadius: 3,
          p: {
            xs: 1.5,
            md: 2,
          },
          background:
            'linear-gradient(100deg, #f4f8ff 0%, #f9f6ff 100%)',
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
              width: 48,
              height: 48,
              borderRadius: 2.5,
              bgcolor: '#e8efff',
              color: '#1269e8',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <AssignmentOutlinedIcon />
          </Box>

          <Box>
            <Typography
              sx={{
                color: '#111a38',
                fontSize: '1rem',
                fontWeight: 900,
              }}
            >
              Ready for the next step?
            </Typography>

            <Typography
              sx={{
                mt: 0.15,
                color: '#647087',
                fontSize: '0.77rem',
                lineHeight: 1.5,
              }}
            >
              Apply what you learned in a hands-on database
              normalization assignment.
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="contained"
          endIcon={<ArrowForwardRoundedIcon />}
          onClick={handleContinueAssignment}
          sx={{
            minWidth: {
              xs: '100%',
              md: 230,
            },
            minHeight: 48,
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 850,
            boxShadow: 'none',
            background:
              'linear-gradient(90deg, #1269ef 0%, #075cff 100%)',
          }}
        >
          Continue to Assignment
        </Button>
      </Box>
    </Box>
  );
};

/* ==========================================
   SCORE CIRCLE
========================================== */

interface ScoreCircleProps {
  score: number;
}

const ScoreCircle = ({
  score,
}: ScoreCircleProps) => (
  <Box
    sx={{
      mt: 1.4,
      width: 155,
      height: 155,
      borderRadius: '50%',
      background: `conic-gradient(
        #1269ef 0% ${score}%,
        #e7ecf4 ${score}% 100%
      )`,
      display: 'grid',
      placeItems: 'center',
      position: 'relative',
    }}
  >
    <Box
      sx={{
        width: 126,
        height: 126,
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
            color: '#0d1538',
            fontSize: '2rem',
            fontWeight: 950,
            lineHeight: 1,
          }}
        >
          {score}%
        </Typography>

        <Typography
          sx={{
            mt: 0.45,
            color: '#68748a',
            fontSize: '0.72rem',
            fontWeight: 750,
          }}
        >
          Practice Score
        </Typography>
      </Box>
    </Box>
  </Box>
);

/* ==========================================
   METRIC
========================================== */

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconBackground: string;
  iconColor: string;
}

const MetricCard = ({
  icon,
  label,
  value,
  iconBackground,
  iconColor,
}: MetricCardProps) => (
  <Box
    sx={{
      border: '1px solid #e0e6ef',
      borderRadius: 2.5,
      p: 1.4,
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
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: iconBackground,
          color: iconColor,
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
            color: '#6b768a',
            fontSize: '0.7rem',
            fontWeight: 700,
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            mt: 0.05,
            color: '#111a38',
            fontSize: '1.05rem',
            fontWeight: 900,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Stack>
  </Box>
);

/* ==========================================
   QUESTION RESULT
========================================== */

interface QuestionResultRowProps {
  result: QuestionResult;
}

const QuestionResultRow = ({
  result,
}: QuestionResultRowProps) => (
  <Stack
    direction="row"
    spacing={1.1}
    alignItems="center"
    sx={{
      py: 1.15,
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        bgcolor: result.correct
          ? '#e8f8ec'
          : '#fff0f0',
        color: result.correct
          ? '#18a93a'
          : '#ef2525',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      {result.correct ? (
        <CheckRoundedIcon />
      ) : (
        <CloseRoundedIcon />
      )}
    </Box>

    <Box
      sx={{
        flex: 1,
        minWidth: 0,
      }}
    >
      <Typography
        sx={{
          color: '#111a38',
          fontSize: '0.82rem',
          fontWeight: 800,
        }}
      >
        Question {result.id}
      </Typography>

      <Typography
        sx={{
          mt: 0.1,
          color: '#58657a',
          fontSize: '0.75rem',
          lineHeight: 1.4,
        }}
      >
        {result.title}
      </Typography>
    </Box>

    <Chip
      label={result.skill}
      size="small"
      sx={{
        display: {
          xs: 'none',
          sm: 'flex',
        },
        bgcolor: '#edf3ff',
        color: '#24559d',
        fontWeight: 750,
        fontSize: '0.68rem',
      }}
    />

    <Typography
      sx={{
        color: result.correct
          ? '#168432'
          : '#d62323',
        fontSize: '0.75rem',
        fontWeight: 850,
        whiteSpace: 'nowrap',
      }}
    >
      {result.correct ? 'Correct' : 'Review'}
    </Typography>
  </Stack>
);

/* ==========================================
   SKILL PROGRESS
========================================== */

interface SkillProgressProps {
  skill: SkillConfidence;
}

const SkillProgress = ({
  skill,
}: SkillProgressProps) => (
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
          fontWeight: 750,
        }}
      >
        {skill.name}
      </Typography>

      <Typography
        sx={{
          color: '#1269e8',
          fontSize: '0.77rem',
          fontWeight: 900,
        }}
      >
        {skill.value}%
      </Typography>
    </Stack>

    <LinearProgress
      variant="determinate"
      value={skill.value}
      sx={{
        height: 8,
        borderRadius: 5,
        bgcolor: '#e6ebf3',
        '& .MuiLinearProgress-bar': {
          borderRadius: 5,
          background:
            'linear-gradient(90deg, #1269ef 0%, #6246e8 100%)',
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

const secondaryButtonSx = {
  minHeight: 44,
  borderRadius: 2.5,
  borderColor: '#ccd6e5',
  color: '#17213b',
  textTransform: 'none',
  fontWeight: 800,
  '&:hover': {
    borderColor: '#1269e8',
    bgcolor: '#f8fbff',
  },
};