import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Radio,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';

type DetailTab = 'evaluation' | 'notes' | 'history' | 'activity';

type Recommendation =
  | 'Strong Hire'
  | 'Hire'
  | 'Hold'
  | 'No Hire';

type ScoreKey =
  | 'technical'
  | 'problem'
  | 'communication'
  | 'culture';

type ScoreItem = {
  key: ScoreKey;
  label: string;
  icon: ReactNode;
  weight: number;
};

const scoreItems: ScoreItem[] = [
  {
    key: 'technical',
    label: 'Technical Skills',
    icon: <CodeOutlinedIcon />,
    weight: 40,
  },
  {
    key: 'problem',
    label: 'Problem Solving',
    icon: <PsychologyOutlinedIcon />,
    weight: 25,
  },
  {
    key: 'communication',
    label: 'Communication',
    icon: <GroupsOutlinedIcon />,
    weight: 20,
  },
  {
    key: 'culture',
    label: 'Cultural Fit',
    icon: <WorkspacePremiumOutlinedIcon />,
    weight: 15,
  },
];

const recommendationOptions: {
  value: Recommendation;
  description: string;
  background: string;
  color: string;
}[] = [
  {
    value: 'Strong Hire',
    description:
      'Highly recommended. Exceeds expectations.',
    background: '#dff7e5',
    color: '#14813a',
  },
  {
    value: 'Hire',
    description: 'Recommended for the role.',
    background: '#e5efff',
    color: '#1261d7',
  },
  {
    value: 'Hold',
    description:
      'Promising, but needs further discussion.',
    background: '#fff0ce',
    color: '#9b6700',
  },
  {
    value: 'No Hire',
    description: 'Not a fit for this role.',
    background: '#ffe3e7',
    color: '#d52b3a',
  },
];

export const EmployerInterviewDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [tab, setTab] =
    useState<DetailTab>('evaluation');

  const [scores, setScores] = useState<
    Record<ScoreKey, number>
  >({
    technical: 4.5,
    problem: 4,
    communication: 4.5,
    culture: 4,
  });

  const [recommendation, setRecommendation] =
    useState<Recommendation>('Strong Hire');

  const [notes, setNotes] = useState(
    'Demonstrated strong technical depth in React, handled problem-solving well, and communicated clearly. Good cultural fit for the team.',
  );

  const [nextStep, setNextStep] =
    useState('offer');

  const [strengths, setStrengths] = useState([
    'Strong React & TypeScript expertise',
    'Good problem-solving approach',
    'Clear communication',
  ]);

  const [concerns, setConcerns] = useState([
    'Limited exposure to system design',
    'Needs more experience with performance tuning',
  ]);

  const overallScore = useMemo(() => {
    return scoreItems.reduce(
      (total, item) =>
        total +
        scores[item.key] *
          (item.weight / 100),
      0,
    );
  }, [scores]);

  const weightedTotal = useMemo(
    () => overallScore,
    [overallScore],
  );

  const updateScore = (
    key: ScoreKey,
    value: number,
  ) => {
    setScores((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const addStrength = () => {
    const value = window.prompt(
      'Enter candidate strength',
    );

    if (!value?.trim()) return;

    setStrengths((current) => [
      ...current,
      value.trim(),
    ]);
  };

  const addConcern = () => {
    const value = window.prompt(
      'Enter area of concern',
    );

    if (!value?.trim()) return;

    setConcerns((current) => [
      ...current,
      value.trim(),
    ]);
  };

  const handleSaveDraft = () => {
    /*
     * Connect to Interview Evaluation API later.
     * Do not simulate persisted backend success here.
     */
  };

  const handleSubmit = () => {
    /*
     * Connect to Interview Evaluation API later.
     * Do not move the candidate automatically until
     * the real backend evaluation endpoint is connected.
     */
  };

  return (
    <Box
      sx={{
        px: { xs: 1.5, md: 2 },
        py: 1.5,
        maxWidth: 1700,
        mx: 'auto',
      }}
    >
      {/* Breadcrumb */}
      <Stack
        direction="row"
        spacing={0.7}
        alignItems="center"
        sx={{ mb: 1.3 }}
      >
        <Typography sx={breadcrumbStyle}>
          CareerHarbor
        </Typography>

        <Typography sx={breadcrumbStyle}>
          /
        </Typography>

        <Button
          onClick={() =>
            navigate('/employer/interviews')
          }
          sx={{
            p: 0,
            minWidth: 0,
            textTransform: 'none',
            fontSize: '0.65rem',
            color: '#0758ce',
          }}
        >
          Interviews
        </Button>

        <Typography sx={breadcrumbStyle}>
          /
        </Typography>

        <Typography
          sx={{
            ...breadcrumbStyle,
            color: '#17233d',
            fontWeight: 900,
          }}
        >
          Interview Detail
        </Typography>
      </Stack>

      {/* Hero */}
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #dddfff',
          borderRadius: '14px',
          px: { xs: 1.8, md: 2.4 },
          py: 1.8,
          background:
            'linear-gradient(110deg,#f7f5ff 0%,#eef3ff 54%,#eee9ff 100%)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: {
              xs: 'flex-start',
              lg: 'center',
            },
            flexDirection: {
              xs: 'column',
              lg: 'row',
            },
            gap: 1.5,
          }}
        >
          <Stack
            direction="row"
            spacing={1.3}
            alignItems="center"
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '11px',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  'linear-gradient(135deg,#2675f5,#7b43ed)',
              }}
            >
              <CalendarMonthOutlinedIcon
                sx={{ fontSize: 27 }}
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: {
                    xs: '1.15rem',
                    md: '1.42rem',
                  },
                  fontWeight: 950,
                  color: '#0f1b39',
                }}
              >
                Interview Detail
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  fontSize: '0.7rem',
                  color: '#425477',
                }}
              >
                Review interview information,
                evaluate the candidate and record
                your recommendation.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={0.7}
            flexWrap="wrap"
            useFlexGap
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() =>
                navigate(
                  '/employer/interviews',
                )
              }
              sx={heroButton}
            >
              Back to Interviews
            </Button>

            <Button
              variant="outlined"
              startIcon={
                <CalendarMonthOutlinedIcon />
              }
              sx={heroButton}
            >
              Reschedule
            </Button>

            <Button
              variant="outlined"
              startIcon={<CancelOutlinedIcon />}
              sx={{
                ...heroButton,
                color: '#b4232e',
              }}
            >
              Cancel Interview
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Main */}
      <Box
        sx={{
          mt: 1.3,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl:
              '280px minmax(0,1fr) 385px',
          },
          gap: 1.2,
          alignItems: 'stretch',
        }}
      >
        <CandidatePanel
          onViewProfile={() =>
            navigate(
              '/employer/candidates/1',
            )
          }
        />

        <Paper
          elevation={0}
          sx={{
            border: '1px solid #dfe6ef',
            borderRadius: '13px',
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, value: DetailTab) =>
              setTab(value)
            }
            sx={tabsStyle}
          >
            <Tab
              value="evaluation"
              label="Evaluation"
            />

            <Tab
              value="notes"
              label="Notes"
            />

            <Tab
              value="history"
              label="Feedback History"
            />

            <Tab
              value="activity"
              label="Activity"
            />
          </Tabs>

          <Box sx={{ p: 1.6 }}>
            {tab === 'evaluation' && (
              <EvaluationTab
                scores={scores}
                overallScore={overallScore}
                weightedTotal={
                  weightedTotal
                }
                onScoreChange={
                  updateScore
                }
                strengths={strengths}
                concerns={concerns}
                onAddStrength={
                  addStrength
                }
                onAddConcern={addConcern}
              />
            )}

            {tab === 'notes' && (
              <NotesTab />
            )}

            {tab === 'history' && (
              <FeedbackHistoryTab />
            )}

            {tab === 'activity' && (
              <ActivityTab />
            )}
          </Box>
        </Paper>

        <RecommendationPanel
          recommendation={recommendation}
          setRecommendation={
            setRecommendation
          }
          notes={notes}
          setNotes={setNotes}
          nextStep={nextStep}
          setNextStep={setNextStep}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmit}
        />
      </Box>

      <Typography
        sx={{
          mt: 0.8,
          fontSize: '0.6rem',
          color: '#7b8799',
        }}
      >
        Interview #{id ?? '1'} evaluation
        data is frontend demo data until the
        Employer Interview API is connected.
      </Typography>
    </Box>
  );
};

/* =========================
   CANDIDATE
========================= */

const CandidatePanel = ({
  onViewProfile,
}: {
  onViewProfile: () => void;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.5,
      border: '1px solid #dfe6ef',
      borderRadius: '13px',
    }}
  >
    <Avatar
      sx={{
        width: 70,
        height: 70,
        bgcolor: '#e9e5ff',
        color: '#6033d4',
        fontSize: '1rem',
        fontWeight: 950,
      }}
    >
      PD
    </Avatar>

    <Typography
      sx={{
        mt: 1,
        fontSize: '1rem',
        fontWeight: 950,
        color: '#17233d',
      }}
    >
      Priya Deshmukh
    </Typography>

    <Typography
      sx={{
        mt: 0.15,
        fontSize: '0.65rem',
        fontWeight: 800,
        color: '#344861',
      }}
    >
      Senior Frontend Developer
    </Typography>

    <Chip
      size="small"
      label="Interview In Progress"
      sx={{
        mt: 0.8,
        height: 25,
        bgcolor: '#e1f7e5',
        color: '#16783a',
        fontSize: '0.54rem',
        fontWeight: 900,
      }}
    />

    <Stack spacing={1} sx={{ mt: 1.5 }}>
      <CandidateContact
        icon={<EmailOutlinedIcon />}
        value="priya.deshmukh@gmail.com"
      />

      <CandidateContact
        icon={<PhoneOutlinedIcon />}
        value="+91 98765 43210"
      />

      <CandidateContact
        icon={<LocationOnOutlinedIcon />}
        value="Pune, Maharashtra"
      />
    </Stack>

    <Divider sx={{ my: 1.4 }} />

    <CandidateInfo
      label="Applied For"
      value="Senior Frontend Developer"
    />

    <CandidateInfo
      label="Application ID"
      value="APP-10456"
    />

    <CandidateInfo
      label="Experience"
      value="5.2 Years"
    />

    <CandidateInfo
      label="Current Company"
      value="TCS"
    />

    <Stack spacing={0.7} sx={{ mt: 1.4 }}>
      <Button
        fullWidth
        variant="outlined"
        startIcon={
          <PersonOutlineOutlinedIcon />
        }
        onClick={onViewProfile}
        sx={panelButton}
      >
        View Full Profile
      </Button>

      <Button
        fullWidth
        variant="outlined"
        startIcon={
          <DownloadOutlinedIcon />
        }
        sx={panelButton}
      >
        Download Resume
      </Button>
    </Stack>
  </Paper>
);

/* =========================
   EVALUATION
========================= */

const EvaluationTab = ({
  scores,
  overallScore,
  weightedTotal,
  onScoreChange,
  strengths,
  concerns,
  onAddStrength,
  onAddConcern,
}: {
  scores: Record<ScoreKey, number>;
  overallScore: number;
  weightedTotal: number;
  onScoreChange: (
    key: ScoreKey,
    score: number,
  ) => void;
  strengths: string[];
  concerns: string[];
  onAddStrength: () => void;
  onAddConcern: () => void;
}) => (
  <Box>
    <SectionHeader
      title="Interview Information"
      action="Edit"
    />

    <Box
      sx={{
        mt: 1,
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(3,1fr)',
        },
      }}
    >
      <InterviewInfo
        icon={
          <CalendarMonthOutlinedIcon />
        }
        label="Date & Time"
        value={
          <>
            Tue, 28 Jan 2025
            <br />
            11:00 AM – 12:00 PM
          </>
        }
      />

      <InterviewInfo
        icon={
          <VideoCameraFrontOutlinedIcon />
        }
        label="Mode"
        value={
          <>
            Google Meet
            <br />
            (Online)
          </>
        }
        border
      />

      <InterviewInfo
        icon={<GroupsOutlinedIcon />}
        label="Interviewers"
        value={
          <>
            Amit Kulkarni (Tech Lead)
            <br />
            Sneha Kapoor (HR)
          </>
        }
        border
      />
    </Box>

    <Divider sx={{ my: 1.5 }} />

    <SectionHeader
      title="Assessment & Screening Summary"
      action="View Details"
    />

    <Box
      sx={{
        mt: 1,
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(3,1fr)',
        },
        gap: 0.8,
      }}
    >
      <SummaryCard
        background="#edfbef"
        iconColor="#16a144"
        icon={<CheckIcon />}
        label="Assessment Score"
        value="78%"
      />

      <SummaryCard
        background="#edf4ff"
        iconColor="#1261d7"
        icon={
          <WorkspacePremiumOutlinedIcon />
        }
        label="Screening Status"
        value="Shortlisted"
      />

      <SummaryCard
        background="#f2efff"
        iconColor="#7138e4"
        icon={<AutoAwesomeIcon />}
        label="AI Match Score"
        value="92%"
      />
    </Box>

    <Divider sx={{ my: 1.5 }} />

    <Typography sx={sectionTitle}>
      Interview Scorecard
    </Typography>

    <Box
      sx={{
        mt: 0.9,
        overflowX: 'auto',
        border: '1px solid #e0e6ee',
        borderRadius: '9px',
      }}
    >
      <Box sx={{ minWidth: 650 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns:
              '1.4fr 1.15fr .65fr .85fr',
            px: 1,
            py: 0.7,
            bgcolor: '#edf2f8',
          }}
        >
          {[
            'Criteria',
            'Rating',
            'Weight',
            'Weighted Score',
          ].map((item) => (
            <Typography
              key={item}
              sx={tableHeader}
            >
              {item}
            </Typography>
          ))}
        </Box>

        {scoreItems.map((item) => (
          <ScoreRow
            key={item.key}
            item={item}
            score={scores[item.key]}
            onChange={(score) =>
              onScoreChange(
                item.key,
                score,
              )
            }
          />
        ))}

        <Box
          sx={{
            px: 1,
            py: 0.8,
            display: 'grid',
            gridTemplateColumns:
              '1.4fr 1.15fr .65fr .85fr',
            bgcolor: '#fff8e8',
          }}
        >
          <Typography
            sx={{
              ...rowText,
              fontWeight: 950,
            }}
          >
            Overall Score
          </Typography>

          <Typography
            sx={{
              ...rowText,
              fontWeight: 950,
            }}
          >
            {overallScore.toFixed(1)} / 5
          </Typography>

          <Box />

          <Typography
            sx={{
              ...rowText,
              fontWeight: 950,
            }}
          >
            {weightedTotal.toFixed(2)} / 5.00
          </Typography>
        </Box>
      </Box>
    </Box>

    <Box
      sx={{
        mt: 1.3,
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: '1fr 1fr',
        },
        gap: 1,
      }}
    >
      <StrengthConcernCard
        title="Key Strengths"
        items={strengths}
        positive
        action="Add Strength"
        onAdd={onAddStrength}
      />

      <StrengthConcernCard
        title="Areas of Concern"
        items={concerns}
        action="Add Concern"
        onAdd={onAddConcern}
      />
    </Box>
  </Box>
);

/* =========================
   NOTES TAB
========================= */

const NotesTab = () => (
  <Box>
    <SectionHeader
      title="Interview Notes"
      action="Add Note"
    />

    <Stack spacing={1} sx={{ mt: 1 }}>
      <NoteCard
        name="Amit Kulkarni"
        role="Technical Interviewer"
        date="28 Jan 2025 · 12:05 PM"
        text="Strong frontend fundamentals. Candidate explained React rendering, state management and component architecture clearly."
      />

      <NoteCard
        name="Sneha Kapoor"
        role="HR"
        date="28 Jan 2025 · 12:12 PM"
        text="Good communication and professional approach. Candidate is interested in product-focused frontend work."
      />
    </Stack>
  </Box>
);

/* =========================
   HISTORY TAB
========================= */

const FeedbackHistoryTab = () => (
  <Box>
    <Typography sx={sectionTitle}>
      Feedback History
    </Typography>

    <Typography
      sx={sectionDescription}
    >
      Previous screening and interview feedback
      for this application.
    </Typography>

    <Stack spacing={1} sx={{ mt: 1.3 }}>
      <HistoryCard
        title="Resume Screening"
        status="Cleared"
        date="23 Jan 2025"
        description="Candidate matched the required React, TypeScript and Redux skills."
      />

      <HistoryCard
        title="Frontend Assessment"
        status="78%"
        date="25 Jan 2025"
        description="Strong performance in React fundamentals and JavaScript problem solving."
      />

      <HistoryCard
        title="Technical Interview"
        status="In Progress"
        date="28 Jan 2025"
        description="Current interview evaluation."
      />
    </Stack>
  </Box>
);

/* =========================
   ACTIVITY TAB
========================= */

const ActivityTab = () => (
  <Box>
    <Typography sx={sectionTitle}>
      Interview Activity
    </Typography>

    <Stack sx={{ mt: 1.2 }}>
      <ActivityItem
        title="Interview started"
        description="Technical interview marked as in progress."
        time="11:02 AM"
      />

      <ActivityItem
        title="Candidate joined meeting"
        description="Priya joined the scheduled Google Meet."
        time="10:58 AM"
      />

      <ActivityItem
        title="Candidate confirmed"
        description="Candidate confirmed interview attendance."
        time="27 Jan · 4:32 PM"
      />

      <ActivityItem
        title="Interview invitation sent"
        description="Interview invitation sent to candidate and interviewers."
        time="26 Jan · 2:10 PM"
        last
      />
    </Stack>
  </Box>
);

/* =========================
   RECOMMENDATION
========================= */

const RecommendationPanel = ({
  recommendation,
  setRecommendation,
  notes,
  setNotes,
  nextStep,
  setNextStep,
  onSaveDraft,
  onSubmit,
}: {
  recommendation: Recommendation;
  setRecommendation: (
    value: Recommendation,
  ) => void;
  notes: string;
  setNotes: (value: string) => void;
  nextStep: string;
  setNextStep: (value: string) => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.4,
      border: '1px solid #dfe6ef',
      borderRadius: '13px',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <Typography
      sx={{
        fontSize: '0.86rem',
        fontWeight: 950,
        color: '#17233d',
      }}
    >
      Hiring Recommendation
    </Typography>

    <Paper
      elevation={0}
      sx={{
        mt: 1,
        overflow: 'hidden',
        border: '1px solid #dfe6ef',
        borderRadius: '9px',
      }}
    >
      {recommendationOptions.map(
        (option, index) => (
          <Box
            key={option.value}
            onClick={() =>
              setRecommendation(
                option.value,
              )
            }
            sx={{
              p: 1,
              display: 'grid',
              gridTemplateColumns:
                '28px 1fr',
              gap: 0.5,
              cursor: 'pointer',
              bgcolor:
                recommendation ===
                option.value
                  ? '#fbfdff'
                  : '#fff',
              borderBottom:
                index ===
                recommendationOptions.length -
                  1
                  ? 'none'
                  : '1px solid #e5eaf1',
            }}
          >
            <Radio
              checked={
                recommendation ===
                option.value
              }
              size="small"
              sx={{ p: 0 }}
            />

            <Box>
              <Chip
                size="small"
                label={option.value}
                sx={{
                  height: 23,
                  bgcolor:
                    option.background,
                  color: option.color,
                  fontSize: '0.56rem',
                  fontWeight: 950,
                }}
              />

              <Typography
                sx={{
                  mt: 0.3,
                  fontSize: '0.56rem',
                  color: '#52627a',
                }}
              >
                {option.description}
              </Typography>
            </Box>
          </Box>
        ),
      )}
    </Paper>

    <Divider sx={{ my: 1.4 }} />

    <Typography sx={sectionTitle}>
      Interviewer's Notes
    </Typography>

    <TextField
      multiline
      minRows={4}
      value={notes}
      onChange={(event) =>
        setNotes(event.target.value)
      }
      inputProps={{
        maxLength: 500,
      }}
      sx={{
        mt: 0.8,

        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
          fontSize: '0.62rem',
          lineHeight: 1.5,
        },
      }}
    />

    <Typography
      sx={{
        mt: 0.3,
        textAlign: 'right',
        fontSize: '0.53rem',
        color: '#64748b',
      }}
    >
      {notes.length} / 500
    </Typography>

    <Divider sx={{ my: 1.4 }} />

    <Typography sx={sectionTitle}>
      Next Steps
    </Typography>

    <Select
      size="small"
      value={nextStep}
      onChange={(event) =>
        setNextStep(event.target.value)
      }
      sx={{
        mt: 0.8,
        height: 38,
        borderRadius: '8px',
        fontSize: '0.62rem',
        fontWeight: 800,
      }}
    >
      <MenuItem value="offer">
        Move to Offer
      </MenuItem>

      <MenuItem value="next">
        Schedule Next Round
      </MenuItem>

      <MenuItem value="hold">
        Keep on Hold
      </MenuItem>

      <MenuItem value="reject">
        Reject Candidate
      </MenuItem>
    </Select>

    <Box sx={{ flex: 1 }} />

    <Divider sx={{ my: 1.4 }} />

    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns:
          '1fr 1.25fr',
        gap: 0.8,
      }}
    >
      <Button
        variant="outlined"
        startIcon={<SaveOutlinedIcon />}
        onClick={onSaveDraft}
        sx={footerButton}
      >
        Save Draft
      </Button>

      <Button
        variant="contained"
        startIcon={<CheckIcon />}
        onClick={onSubmit}
        sx={{
          ...footerButton,
          bgcolor: '#1261e8',
          color: '#fff',
          boxShadow: 'none',

          '&:hover': {
            bgcolor: '#0758ce',
            boxShadow: 'none',
          },
        }}
      >
        Submit Evaluation
      </Button>
    </Box>
  </Paper>
);

/* =========================
   SCORE
========================= */

const ScoreRow = ({
  item,
  score,
  onChange,
}: {
  item: ScoreItem;
  score: number;
  onChange: (score: number) => void;
}) => {
  const weighted =
    score * (item.weight / 100);

  const maximum =
    5 * (item.weight / 100);

  return (
    <Box
      sx={{
        px: 1,
        py: 0.7,
        display: 'grid',
        gridTemplateColumns:
          '1.4fr 1.15fr .65fr .85fr',
        alignItems: 'center',
        borderBottom:
          '1px solid #e8edf3',
      }}
    >
      <Stack
        direction="row"
        spacing={0.7}
        alignItems="center"
      >
        <Box
          sx={{
            color: '#344861',
            display: 'flex',

            '& svg': {
              fontSize: 16,
            },
          }}
        >
          {item.icon}
        </Box>

        <Typography sx={rowText}>
          {item.label}
        </Typography>
      </Stack>

      <RatingStars
        value={score}
        onChange={onChange}
      />

      <Typography sx={rowText}>
        {item.weight}%
      </Typography>

      <Typography sx={rowText}>
        {weighted.toFixed(2)} /{' '}
        {maximum.toFixed(2)}
      </Typography>
    </Box>
  );
};

const RatingStars = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) => (
  <Stack direction="row" spacing={0}>
    {[1, 2, 3, 4, 5].map((star) => (
      <IconButton
        key={star}
        size="small"
        onClick={() =>
          onChange(star)
        }
        sx={{ p: 0.15 }}
      >
        {star <= Math.round(value) ? (
          <StarIcon
            sx={{
              fontSize: 18,
              color: '#f59b16',
            }}
          />
        ) : (
          <StarBorderIcon
            sx={{
              fontSize: 18,
              color: '#aab3c0',
            }}
          />
        )}
      </IconButton>
    ))}
  </Stack>
);

/* =========================
   SMALL COMPONENTS
========================= */

const InterviewInfo = ({
  icon,
  label,
  value,
  border = false,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  border?: boolean;
}) => (
  <Stack
    direction="row"
    spacing={0.9}
    sx={{
      px: 1,
      borderLeft: border
        ? '1px solid #e1e7ef'
        : 'none',
    }}
  >
    <Box
      sx={{
        width: 38,
        height: 38,
        flexShrink: 0,
        borderRadius: '50%',
        bgcolor: '#eef3ff',
        color: '#2159c6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        '& svg': {
          fontSize: 19,
        },
      }}
    >
      {icon}
    </Box>

    <Box>
      <Typography
        sx={{
          fontSize: '0.53rem',
          color: '#64748b',
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.15,
          fontSize: '0.59rem',
          lineHeight: 1.4,
          fontWeight: 850,
          color: '#263750',
        }}
      >
        {value}
      </Typography>
    </Box>
  </Stack>
);

const SummaryCard = ({
  icon,
  label,
  value,
  background,
  iconColor,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  background: string;
  iconColor: string;
}) => (
  <Box
    sx={{
      p: 1,
      bgcolor: background,
      border: '1px solid #e1e7ef',
      borderRadius: '9px',
      display: 'flex',
      gap: 0.8,
      alignItems: 'center',
    }}
  >
    <Box
      sx={{
        width: 37,
        height: 37,
        borderRadius: '50%',
        bgcolor: '#fff',
        color: iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        '& svg': {
          fontSize: 20,
        },
      }}
    >
      {icon}
    </Box>

    <Box>
      <Typography
        sx={{
          fontSize: '0.52rem',
          color: '#52627a',
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.1,
          fontSize: '0.78rem',
          fontWeight: 950,
          color: '#17233d',
        }}
      >
        {value}
      </Typography>
    </Box>
  </Box>
);

const StrengthConcernCard = ({
  title,
  items,
  positive = false,
  action,
  onAdd,
}: {
  title: string;
  items: string[];
  positive?: boolean;
  action: string;
  onAdd: () => void;
}) => (
  <Box>
    <Typography sx={sectionTitle}>
      {title}
    </Typography>

    <Paper
      elevation={0}
      sx={{
        mt: 0.6,
        p: 0.8,
        minHeight: 125,
        border: '1px solid #dfe6ef',
        borderRadius: '9px',
      }}
    >
      <Stack spacing={0.5}>
        {items.map((item) => (
          <Chip
            key={item}
            icon={
              positive ? (
                <CheckIcon />
              ) : (
                <CancelOutlinedIcon />
              )
            }
            label={item}
            sx={{
              width: 'fit-content',
              maxWidth: '100%',
              height: 25,
              bgcolor: positive
                ? '#e2f8e7'
                : '#ffe5e8',
              color: positive
                ? '#16783a'
                : '#c8303d',
              fontSize: '0.52rem',
              fontWeight: 800,

              '& .MuiChip-icon': {
                fontSize: 14,
                color: 'inherit',
              },
            }}
          />
        ))}
      </Stack>

      <Button
        startIcon={<AddIcon />}
        onClick={onAdd}
        sx={{
          mt: 0.4,
          p: 0,
          minWidth: 0,
          textTransform: 'none',
          fontSize: '0.56rem',
          fontWeight: 900,
        }}
      >
        {action}
      </Button>
    </Paper>
  </Box>
);

const CandidateContact = ({
  icon,
  value,
}: {
  icon: ReactNode;
  value: string;
}) => (
  <Stack
    direction="row"
    spacing={0.8}
    alignItems="center"
  >
    <Box
      sx={{
        color: '#344861',
        display: 'flex',

        '& svg': {
          fontSize: 16,
        },
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        fontSize: '0.58rem',
        color: '#263750',
      }}
    >
      {value}
    </Typography>
  </Stack>
);

const CandidateInfo = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <Box
    sx={{
      py: 0.8,
      borderBottom:
        '1px solid #e8edf3',
    }}
  >
    <Typography
      sx={{
        fontSize: '0.53rem',
        color: '#64748b',
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        mt: 0.15,
        fontSize: '0.6rem',
        fontWeight: 850,
        color: '#263750',
      }}
    >
      {value}
    </Typography>
  </Box>
);

const SectionHeader = ({
  title,
  action,
}: {
  title: string;
  action?: string;
}) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
  >
    <Typography sx={sectionTitle}>
      {title}
    </Typography>

    {action && (
      <Button
        startIcon={
          action === 'Edit' ? (
            <EditOutlinedIcon />
          ) : undefined
        }
        sx={{
          p: 0,
          minWidth: 0,
          textTransform: 'none',
          fontSize: '0.56rem',
          fontWeight: 900,

          '& .MuiButton-startIcon': {
            mr: 0.3,
          },

          '& svg': {
            fontSize: 14,
          },
        }}
      >
        {action}
      </Button>
    )}
  </Stack>
);

const NoteCard = ({
  name,
  role,
  date,
  text,
}: {
  name: string;
  role: string;
  date: string;
  text: string;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.2,
      border: '1px solid #e1e7ef',
      borderRadius: '9px',
    }}
  >
    <Stack
      direction="row"
      justifyContent="space-between"
    >
      <Box>
        <Typography sx={rowText}>
          {name}
        </Typography>

        <Typography
          sx={sectionDescription}
        >
          {role}
        </Typography>
      </Box>

      <Typography
        sx={sectionDescription}
      >
        {date}
      </Typography>
    </Stack>

    <Typography
      sx={{
        mt: 0.8,
        fontSize: '0.59rem',
        lineHeight: 1.6,
        color: '#40516b',
      }}
    >
      {text}
    </Typography>
  </Paper>
);

const HistoryCard = ({
  title,
  status,
  date,
  description,
}: {
  title: string;
  status: string;
  date: string;
  description: string;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.1,
      border: '1px solid #e1e7ef',
      borderRadius: '9px',
    }}
  >
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Typography sx={rowText}>
        {title}
      </Typography>

      <Chip
        size="small"
        label={status}
        sx={{
          height: 23,
          bgcolor: '#e9f2ff',
          color: '#0758ce',
          fontSize: '0.52rem',
          fontWeight: 900,
        }}
      />
    </Stack>

    <Typography
      sx={{
        mt: 0.4,
        fontSize: '0.56rem',
        color: '#52627a',
      }}
    >
      {description}
    </Typography>

    <Typography
      sx={{
        mt: 0.6,
        fontSize: '0.52rem',
        color: '#8a96a8',
      }}
    >
      {date}
    </Typography>
  </Paper>
);

const ActivityItem = ({
  title,
  description,
  time,
  last = false,
}: {
  title: string;
  description: string;
  time: string;
  last?: boolean;
}) => (
  <Box
    sx={{
      position: 'relative',
      pl: 3,
      pb: last ? 0 : 2,
    }}
  >
    {!last && (
      <Box
        sx={{
          position: 'absolute',
          left: 8,
          top: 17,
          bottom: 0,
          width: 1,
          bgcolor: '#d8e0eb',
        }}
      />
    )}

    <Box
      sx={{
        position: 'absolute',
        left: 2,
        top: 3,
        width: 13,
        height: 13,
        borderRadius: '50%',
        bgcolor: '#1261e8',
        border: '3px solid #e9f1ff',
      }}
    />

    <Typography sx={rowText}>
      {title}
    </Typography>

    <Typography
      sx={sectionDescription}
    >
      {description}
    </Typography>

    <Typography
      sx={{
        mt: 0.3,
        fontSize: '0.51rem',
        color: '#8a96a8',
      }}
    >
      {time}
    </Typography>
  </Box>
);

const AutoAwesomeIcon = () => (
  <Box
    component="span"
    sx={{
      fontSize: 19,
      fontWeight: 950,
    }}
  >
    ✦
  </Box>
);

/* =========================
   STYLES
========================= */

const breadcrumbStyle = {
  fontSize: '0.65rem',
  color: '#64748b',
};

const sectionTitle = {
  fontSize: '0.78rem',
  fontWeight: 950,
  color: '#17233d',
};

const sectionDescription = {
  mt: 0.15,
  fontSize: '0.54rem',
  color: '#64748b',
};

const tableHeader = {
  fontSize: '0.55rem',
  fontWeight: 950,
  color: '#263750',
};

const rowText = {
  fontSize: '0.58rem',
  fontWeight: 800,
  color: '#263750',
};

const heroButton = {
  minHeight: 38,
  px: 1.4,
  borderRadius: '8px',
  borderColor: '#d3ddec',
  bgcolor: '#fff',
  color: '#17233d',
  textTransform: 'none',
  fontSize: '0.62rem',
  fontWeight: 900,

  '&:hover': {
    bgcolor: '#f8fbff',
    borderColor: '#bdcbe0',
  },

  '& .MuiButton-startIcon svg': {
    fontSize: 17,
  },
};

const panelButton = {
  minHeight: 37,
  borderRadius: '7px',
  borderColor: '#ccd7e5',
  color: '#263750',
  textTransform: 'none',
  fontSize: '0.58rem',
  fontWeight: 900,

  '& .MuiButton-startIcon svg': {
    fontSize: 16,
  },
};

const footerButton = {
  minHeight: 41,
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '0.6rem',
  fontWeight: 900,
};

const tabsStyle = {
  px: 1.2,
  minHeight: 48,
  borderBottom: '1px solid #e3e9f1',

  '& .MuiTab-root': {
    minHeight: 48,
    textTransform: 'none',
    fontSize: '0.62rem',
    fontWeight: 900,
    color: '#263750',
    px: 2,
  },

  '& .Mui-selected': {
    color: '#0758ce !important',
  },

  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: 3,
    bgcolor: '#1261e8',
  },
};

export default EmployerInterviewDetailPage;