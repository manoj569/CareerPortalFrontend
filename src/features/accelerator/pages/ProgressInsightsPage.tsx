import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';

import {
  Box,
  Button,
  Chip,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';

import { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

/*
 * C22 - PROGRESS & INSIGHTS
 *
 * IMPORTANT:
 * All statistics below are temporary presentation data
 * used to match the approved UI.
 *
 * Production integration must replace them with actual:
 * - learning progress
 * - readiness history
 * - assessment history
 * - activity duration
 * - recent activities
 * - AI insights
 * - skill improvements
 */

interface SummaryCard {
  id: string;
  value: string;
  label: string;
  change: string;
  icon: ReactNode;
  color: string;
  background: string;
}

interface ActivityItem {
  id: string;
  label: string;
  hours: string;
  percentage: number;
  color: string;
}

interface RecentActivity {
  id: string;
  text: ReactNode;
  date: string;
  icon: ReactNode;
  color: string;
  background: string;
}

interface InsightItem {
  id: string;
  text: string;
  icon: ReactNode;
  color: string;
}

const summaryCards: SummaryCard[] = [
  {
    id: 'readiness',
    value: '82%',
    label: 'Career Readiness',
    change: '+12% vs last 30 days',
    icon: <TrackChangesRoundedIcon />,
    color: '#12ad2b',
    background: '#e1f9e6',
  },
  {
    id: 'learning',
    value: '68%',
    label: 'Learning Progress',
    change: '+20% vs last 30 days',
    icon: <MenuBookRoundedIcon />,
    color: '#8122eb',
    background: '#f0e3ff',
  },
  {
    id: 'skills',
    value: '12',
    label: 'Skills Improved',
    change: '+4 new skills',
    icon: <EmojiEventsRoundedIcon />,
    color: '#087ce8',
    background: '#e1f1ff',
  },
  {
    id: 'assessments',
    value: '6',
    label: 'Assessments Taken',
    change: '+2 vs last 30 days',
    icon: <AssessmentRoundedIcon />,
    color: '#f47a00',
    background: '#fff0dd',
  },
];

const activityBreakdown: ActivityItem[] = [
  {
    id: 'learning',
    label: 'Learning Modules',
    hours: '10.5 h',
    percentage: 43,
    color: '#8737eb',
  },
  {
    id: 'practice',
    label: 'Practice & Assessments',
    hours: '6.0 h',
    percentage: 24,
    color: '#1686ed',
  },
  {
    id: 'interviews',
    label: 'Mock Interviews',
    hours: '4.0 h',
    percentage: 16,
    color: '#18b941',
  },
  {
    id: 'tutor',
    label: 'AI Tutor & Practice',
    hours: '2.5 h',
    percentage: 10,
    color: '#ff920f',
  },
  {
    id: 'others',
    label: 'Others',
    hours: '1.5 h',
    percentage: 6,
    color: '#d7dff0',
  },
];

const recentActivities: RecentActivity[] = [
  {
    id: 'sql-course',
    text: (
      <>
        <strong>Completed:</strong> Advanced SQL & Query Optimization
      </>
    ),
    date: 'Nov 17',
    icon: <CheckCircleRoundedIcon />,
    color: '#14b73a',
    background: '#e6faeb',
  },
  {
    id: 'sql-test',
    text: (
      <>
        <strong>Scored 90%</strong> in SQL Test
      </>
    ),
    date: 'Nov 15',
    icon: <CodeRoundedIcon />,
    color: '#7621e8',
    background: '#f1e7ff',
  },
  {
    id: 'mock-interview',
    text: (
      <>
        <strong>Completed:</strong> Mock Interview (Round 3)
      </>
    ),
    date: 'Nov 13',
    icon: <PsychologyRoundedIcon />,
    color: '#087bea',
    background: '#e5f2ff',
  },
  {
    id: 'database',
    text: (
      <>
        <strong>Finished:</strong> Database Design & Best Practices
      </>
    ),
    date: 'Nov 11',
    icon: <MenuBookRoundedIcon />,
    color: '#5f25e5',
    background: '#eee9ff',
  },
];

const insights: InsightItem[] = [
  {
    id: 'readiness',
    text:
      "You're on track to reach 90%+ readiness in ~7–10 days.",
    icon: <TrackChangesRoundedIcon />,
    color: '#721de8',
  },
  {
    id: 'system-design',
    text:
      'Focus more on System Design (currently 68%) to boost overall score.',
    icon: <BarChartRoundedIcon />,
    color: '#721de8',
  },
  {
    id: 'interviews',
    text:
      'Take 2–3 more mock interviews to improve interview confidence.',
    icon: <RocketLaunchRoundedIcon />,
    color: '#f04425',
  },
];

/*
 * Temporary chart history.
 * Replace with real API history later.
 */
const readinessHistory = [
  { label: 'Oct 18', score: 62 },
  { label: 'Oct 25', score: 67 },
  { label: 'Nov 1', score: 73 },
  { label: 'Nov 8', score: 76 },
  { label: 'Nov 15', score: 79 },
  { label: 'Nov 17', score: 82 },
];

export const ProgressInsightsPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const navigateToScreen = (
    screen: string,
  ) => {
    const params =
      new URLSearchParams(searchParams);

    params.set('screen', screen);
    setSearchParams(params);
  };

  const handleBack = () => {
    navigateToScreen('skill-passport');
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
      {/* =========================================
          HERO
      ========================================= */}

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
            xs: 2.2,
            md: 2.6,
          },
          color: '#fff',
          background:
            'linear-gradient(110deg, #075fc5 0%, #4137e7 52%, #8c00f5 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 280,
            height: 280,
            borderRadius: '50%',
            right: -70,
            top: -180,
            bgcolor:
              'rgba(255,255,255,0.08)',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            right: 35,
            bottom: -8,
            opacity: 0.2,
          }}
        >
          <BarChartRoundedIcon
            sx={{
              fontSize: 105,
            }}
          />
        </Box>

        <Stack
          direction="row"
          spacing={1}
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

          <Chip
            label="👑 Premium"
            size="small"
            sx={{
              bgcolor:
                'rgba(255,171,40,0.25)',
              color: '#ffe49b',
              border:
                '1px solid rgba(255,200,70,0.7)',
              fontWeight: 900,
            }}
          />
        </Stack>

        <Typography
          sx={{
            position: 'relative',
            mt: 0.45,
            color:
              'rgba(255,255,255,0.92)',
            fontSize: {
              xs: '0.82rem',
              md: '0.94rem',
            },
          }}
        >
          Your personalized, AI-powered
          journey from your current skills
          to your next dream role.
        </Typography>
      </Box>

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <Box
        sx={{
          mt: 1.1,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'minmax(0,1fr) auto',
          },
          gap: 1.2,
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
            Back to Skill Passport
          </Button>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              mt: 0.15,
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: '#f0e4ff',
                color: '#751ee8',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <BarChartRoundedIcon
                sx={{
                  fontSize: 38,
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
                Progress & Insights
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  color: '#536078',
                  fontSize: '0.82rem',
                }}
              >
                Track your learning progress,
                readiness improvement, and
                personalized insights.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Select
          value="30"
          size="small"
          startAdornment={
            <EventRoundedIcon
              sx={{
                mr: 1,
                color: '#5520c9',
              }}
            />
          }
          sx={{
            minWidth: 205,
            height: 47,
            borderRadius: 2.3,
            color: '#17213b',
            fontWeight: 850,
            bgcolor: '#fff',
          }}
        >
          <MenuItem value="7">
            Last 7 Days
          </MenuItem>

          <MenuItem value="30">
            Last 30 Days
          </MenuItem>

          <MenuItem value="90">
            Last 90 Days
          </MenuItem>
        </Select>
      </Box>

      {/* =========================================
          SUMMARY CARDS
      ========================================= */}

      <Box
        sx={{
          mt: 1.5,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2,1fr)',
            xl: 'repeat(4,1fr)',
          },
          gap: 1.3,
        }}
      >
        {summaryCards.map((card) => (
          <SummaryMetricCard
            key={card.id}
            card={card}
          />
        ))}
      </Box>

      {/* =========================================
          CHARTS
      ========================================= */}

      <Box
        sx={{
          mt: 1.4,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl:
              'minmax(0,1.05fr) minmax(420px,.95fr)',
          },
          gap: 1.4,
        }}
      >
        {/* READINESS CHART */}

        <Box sx={cardSx}>
          <SectionTitle
            icon={
              <BarChartRoundedIcon />
            }
            title="Readiness Progress"
          />

          <ReadinessChart />
        </Box>

        {/* ACTIVITY BREAKDOWN */}

        <Box sx={cardSx}>
          <SectionTitle
            icon={
              <AutoAwesomeRoundedIcon />
            }
            title="Activity Breakdown"
          />

          <Box
            sx={{
              mt: 1.3,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm:
                  '210px minmax(0,1fr)',
              },
              gap: 1.6,
              alignItems: 'center',
            }}
          >
            <ActivityDonut />

            <Stack spacing={0.9}>
              {activityBreakdown.map(
                (activity) => (
                  <ActivityLegendRow
                    key={activity.id}
                    activity={activity}
                  />
                ),
              )}
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* =========================================
          BOTTOM GRID
      ========================================= */}

      <Box
        sx={{
          mt: 1.4,
          mb: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl:
              'minmax(0,.95fr) minmax(0,1.05fr)',
          },
          gap: 1.4,
        }}
      >
        {/* RECENT ACTIVITIES */}

        <Box sx={cardSx}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            <SectionTitle
              icon={
                <ScheduleRoundedIcon />
              }
              title="Recent Activities"
            />

            <Button
              onClick={() =>
                navigateToScreen(
                  'active-learning',
                )
              }
              sx={{
                minWidth: 0,
                color: '#701be8',
                textTransform: 'none',
                fontWeight: 900,
              }}
            >
              View All
            </Button>
          </Stack>

          <Stack
            spacing={0.5}
            sx={{
              mt: 1,
            }}
          >
            {recentActivities.map(
              (activity) => (
                <RecentActivityRow
                  key={activity.id}
                  activity={activity}
                />
              ),
            )}
          </Stack>
        </Box>

        {/* AI INSIGHTS */}

        <Box sx={cardSx}>
          <SectionTitle
            icon={
              <AutoAwesomeRoundedIcon />
            }
            title="AI Insights & Next Actions"
          />

          <Stack
            spacing={0.75}
            sx={{
              mt: 1,
            }}
          >
            {insights.map((insight) => (
              <InsightRow
                key={insight.id}
                insight={insight}
              />
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

/* =========================================
   SUMMARY CARD
========================================= */

const SummaryMetricCard = ({
  card,
}: {
  card: SummaryCard;
}) => (
  <Box
    sx={{
      ...cardSx,
      minHeight: 125,
      display: 'grid',
      gridTemplateColumns:
        '60px minmax(0,1fr)',
      gap: 1,
      alignItems: 'center',
    }}
  >
    <Box
      sx={{
        width: 58,
        height: 58,
        borderRadius: '50%',
        bgcolor: card.background,
        color: card.color,
        display: 'grid',
        placeItems: 'center',
        '& svg': {
          fontSize: 34,
        },
      }}
    >
      {card.icon}
    </Box>

    <Box>
      <Typography
        sx={{
          color: '#0c1537',
          fontSize: '1.9rem',
          lineHeight: 1,
          fontWeight: 900,
        }}
      >
        {card.value}
      </Typography>

      <Typography
        sx={{
          mt: 0.3,
          color: '#111a38',
          fontSize: '0.78rem',
          fontWeight: 900,
        }}
      >
        {card.label}
      </Typography>

      <Typography
        sx={{
          mt: 0.45,
          color: '#079126',
          fontSize: '0.7rem',
          fontWeight: 850,
        }}
      >
        ↑ {card.change}
      </Typography>
    </Box>
  </Box>
);

/* =========================================
   READINESS CHART
========================================= */

const ReadinessChart = () => {
  const width = 600;
  const height = 215;

  const left = 55;
  const right = 20;
  const top = 22;
  const bottom = 45;

  const chartWidth =
    width - left - right;

  const chartHeight =
    height - top - bottom;

  const minScore = 40;
  const maxScore = 100;

  const getX = (index: number) =>
    left +
    (index /
      (readinessHistory.length - 1)) *
      chartWidth;

  const getY = (score: number) =>
    top +
    ((maxScore - score) /
      (maxScore - minScore)) *
      chartHeight;

  const linePoints =
    readinessHistory
      .map(
        (item, index) =>
          `${getX(index)},${getY(
            item.score,
          )}`,
      )
      .join(' ');

  const areaPoints = [
    `${getX(0)},${top + chartHeight}`,
    ...readinessHistory.map(
      (item, index) =>
        `${getX(index)},${getY(
          item.score,
        )}`,
    ),
    `${getX(
      readinessHistory.length - 1,
    )},${top + chartHeight}`,
  ].join(' ');

  const gridScores = [
    100,
    90,
    80,
    70,
    60,
    50,
    40,
  ];

  return (
    <Box
      sx={{
        mt: 0.8,
        width: '100%',
        overflowX: 'auto',
      }}
    >
      <Box
        component="svg"
        viewBox={`0 0 ${width} ${height}`}
        sx={{
          width: '100%',
          minWidth: 520,
          display: 'block',
        }}
      >
        <defs>
          <linearGradient
            id="readinessArea"
            x1="0"
            x2="0"
            y1="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#8122ed"
              stopOpacity="0.22"
            />

            <stop
              offset="100%"
              stopColor="#8122ed"
              stopOpacity="0.02"
            />
          </linearGradient>
        </defs>

        {gridScores.map((score) => {
          const y = getY(score);

          return (
            <g key={score}>
              <line
                x1={left}
                y1={y}
                x2={width - right}
                y2={y}
                stroke="#e2e6ef"
                strokeWidth="1"
              />

              <text
                x={left - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#243052"
              >
                {score}%
              </text>
            </g>
          );
        })}

        <polygon
          points={areaPoints}
          fill="url(#readinessArea)"
        />

        <polyline
          points={linePoints}
          fill="none"
          stroke="#7319ee"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {readinessHistory.map(
          (item, index) => {
            const x = getX(index);
            const y = getY(item.score);

            return (
              <g key={item.label}>
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="#fff"
                  stroke="#7319ee"
                  strokeWidth="3"
                />

                <text
                  x={x}
                  y={height - 17}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#243052"
                >
                  {item.label}
                </text>
              </g>
            );
          },
        )}

        <g>
          <rect
            x={getX(0) - 19}
            y={getY(62) - 39}
            width="42"
            height="27"
            rx="7"
            fill="#6812e9"
          />

          <text
            x={getX(0) + 2}
            y={getY(62) - 21}
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill="#fff"
          >
            62%
          </text>
        </g>

        <g>
          <rect
            x={
              getX(
                readinessHistory.length -
                  1,
              ) - 21
            }
            y={getY(82) - 39}
            width="46"
            height="27"
            rx="7"
            fill="#6812e9"
          />

          <text
            x={
              getX(
                readinessHistory.length -
                  1,
              ) + 2
            }
            y={getY(82) - 21}
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill="#fff"
          >
            82%
          </text>
        </g>
      </Box>
    </Box>
  );
};

/* =========================================
   ACTIVITY DONUT
========================================= */

const ActivityDonut = () => (
  <Box
    sx={{
      width: 190,
      height: 190,
      mx: 'auto',
      position: 'relative',
      borderRadius: '50%',
      background:
        'conic-gradient(' +
        '#8737eb 0% 43%, ' +
        '#1686ed 43% 67%, ' +
        '#18b941 67% 83%, ' +
        '#ff920f 83% 93%, ' +
        '#d7dff0 93% 100%)',
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        inset: 29,
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
            fontSize: '2rem',
            lineHeight: 1,
            fontWeight: 900,
          }}
        >
          24.5
        </Typography>

        <Typography
          sx={{
            mt: 0.2,
            color: '#111a38',
            fontSize: '0.76rem',
            fontWeight: 900,
          }}
        >
          Hours
        </Typography>

        <Typography
          sx={{
            color: '#536078',
            fontSize: '0.64rem',
          }}
        >
          (Last 30 Days)
        </Typography>
      </Box>
    </Box>
  </Box>
);

/* =========================================
   ACTIVITY LEGEND
========================================= */

const ActivityLegendRow = ({
  activity,
}: {
  activity: ActivityItem;
}) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns:
        '16px minmax(150px,1fr) 65px 45px',
      gap: 0.6,
      alignItems: 'center',
    }}
  >
    <Box
      sx={{
        width: 13,
        height: 13,
        borderRadius: '50%',
        bgcolor: activity.color,
      }}
    />

    <Typography
      sx={{
        color: '#111a38',
        fontSize: '0.7rem',
        fontWeight: 700,
      }}
    >
      {activity.label}
    </Typography>

    <Typography
      sx={{
        color: '#111a38',
        fontSize: '0.7rem',
        fontWeight: 900,
        textAlign: 'right',
      }}
    >
      {activity.hours}
    </Typography>

    <Typography
      sx={{
        color: '#111a38',
        fontSize: '0.7rem',
        fontWeight: 900,
        textAlign: 'right',
      }}
    >
      {activity.percentage}%
    </Typography>
  </Box>
);

/* =========================================
   RECENT ACTIVITY
========================================= */

const RecentActivityRow = ({
  activity,
}: {
  activity: RecentActivity;
}) => (
  <Box
    sx={{
      px: 0.8,
      py: 0.6,
      borderRadius: 1.8,
      border:
        '1px solid #e3e7ef',
      display: 'grid',
      gridTemplateColumns:
        '38px minmax(0,1fr) auto',
      gap: 0.7,
      alignItems: 'center',
    }}
  >
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        bgcolor: activity.background,
        color: activity.color,
        display: 'grid',
        placeItems: 'center',
        '& svg': {
          fontSize: 20,
        },
      }}
    >
      {activity.icon}
    </Box>

    <Typography
      component="div"
      sx={{
        color: '#111a38',
        fontSize: '0.7rem',
      }}
    >
      {activity.text}
    </Typography>

    <Typography
      sx={{
        color: '#26324f',
        fontSize: '0.66rem',
        whiteSpace: 'nowrap',
      }}
    >
      {activity.date}
    </Typography>
  </Box>
);

/* =========================================
   INSIGHT
========================================= */

const InsightRow = ({
  insight,
}: {
  insight: InsightItem;
}) => (
  <Box
    sx={{
      px: 1,
      py: 0.8,
      borderRadius: 2,
      bgcolor: '#f7efff',
      border:
        '1px solid #ead8ff',
      display: 'grid',
      gridTemplateColumns:
        '38px minmax(0,1fr)',
      gap: 0.7,
      alignItems: 'center',
    }}
  >
    <Box
      sx={{
        color: insight.color,
        display: 'grid',
        placeItems: 'center',
        '& svg': {
          fontSize: 26,
        },
      }}
    >
      {insight.icon}
    </Box>

    <Typography
      sx={{
        color: '#111a38',
        fontSize: '0.73rem',
        lineHeight: 1.4,
      }}
    >
      {insight.text}
    </Typography>
  </Box>
);

/* =========================================
   SECTION TITLE
========================================= */

const SectionTitle = ({
  icon,
  title,
}: {
  icon: ReactNode;
  title: string;
}) => (
  <Stack
    direction="row"
    spacing={0.65}
    alignItems="center"
  >
    <Box
      sx={{
        color: '#731ce8',
        display: 'grid',
        placeItems: 'center',
        '& svg': {
          fontSize: 24,
        },
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        color: '#111a38',
        fontSize: '0.96rem',
        fontWeight: 900,
      }}
    >
      {title}
    </Typography>
  </Stack>
);

const cardSx = {
  border: '1px solid #dce3ee',
  borderRadius: 3,
  bgcolor: '#fff',
  p: {
    xs: 1.4,
    md: 1.6,
  },
  boxShadow:
    '0 4px 14px rgba(24,35,64,0.04)',
};