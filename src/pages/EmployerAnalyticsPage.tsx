import { useState } from 'react';
import type { ReactNode } from 'react';

import {
  Box,
  Button,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';

import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';

type FunnelItem = {
  label: string;
  value: string;
  percent: string;
  width: number;
  background: string;
};

type SourceItem = {
  label: string;
  value: number;
  color: string;
};

type TrendItem = {
  date: string;
  hires: number;
  offers: number;
};

const funnel: FunnelItem[] = [
  {
    label: 'Applied',
    value: '12,486',
    percent: '100%',
    width: 100,
    background: 'linear-gradient(90deg,#9d54ed,#8540e8)',
  },
  {
    label: 'Screened',
    value: '7,493',
    percent: '60%',
    width: 78,
    background: 'linear-gradient(90deg,#2c8df1,#3988e8)',
  },
  {
    label: 'Interviewed',
    value: '2,846',
    percent: '23%',
    width: 58,
    background: 'linear-gradient(90deg,#37c6df,#47cfe2)',
  },
  {
    label: 'Offered',
    value: '684',
    percent: '5.5%',
    width: 39,
    background: 'linear-gradient(90deg,#f5a82d,#ffbd4c)',
  },
  {
    label: 'Hired',
    value: '428',
    percent: '3.4%',
    width: 22,
    background: 'linear-gradient(90deg,#3cc667,#57d579)',
  },
];

const trends: TrendItem[] = [
  { date: 'Oct 20', hires: 10, offers: 25 },
  { date: 'Oct 25', hires: 18, offers: 36 },
  { date: 'Oct 30', hires: 17, offers: 43 },
  { date: 'Nov 4', hires: 22, offers: 41 },
  { date: 'Nov 9', hires: 34, offers: 56 },
  { date: 'Nov 14', hires: 28, offers: 45 },
  { date: 'Nov 19', hires: 40, offers: 58 },
];

const sources: SourceItem[] = [
  { label: 'CareerHarbor', value: 34, color: '#2c83ed' },
  { label: 'Naukri', value: 22, color: '#8749e8' },
  { label: 'LinkedIn', value: 18, color: '#4bc879' },
  { label: 'Referrals', value: 14, color: '#ffab2f' },
  { label: 'Other', value: 12, color: '#e84ab9' },
];

const roles = [
  {
    role: 'Frontend Developer',
    applied: '3,420',
    hired: 142,
    conversion: '4.2%',
  },
  {
    role: '.NET Developer',
    applied: '2,890',
    hired: 118,
    conversion: '4.1%',
  },
  {
    role: 'Product Manager (APM)',
    applied: '1,204',
    hired: 48,
    conversion: '4.0%',
  },
  {
    role: 'Backend Developer',
    applied: '1,986',
    hired: 82,
    conversion: '4.1%',
  },
  {
    role: 'Full Stack Developer',
    applied: '1,676',
    hired: 78,
    conversion: '4.7%',
  },
];

const timeToHire = [
  { label: 'Frontend\nDev', value: 14.6 },
  { label: '.NET\nDev', value: 16.8 },
  { label: 'PM\n(APM)', value: 21.2 },
  { label: 'Backend\nDev', value: 18.4 },
  { label: 'Full Stack\nDev', value: 15.1 },
];

export const EmployerAnalyticsPage = () => {
  const [period, setPeriod] = useState('30');

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
        <Typography sx={breadcrumbStyle}>CareerHarbor</Typography>
        <Typography sx={breadcrumbStyle}>/</Typography>

        <Typography
          sx={{
            ...breadcrumbStyle,
            color: '#17233d',
            fontWeight: 900,
          }}
        >
          Analytics
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
            'linear-gradient(110deg, #f7f5ff 0%, #eef3ff 54%, #eee9ff 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 250,
            height: 250,
            borderRadius: '50%',
            right: 70,
            top: -185,
            border: '38px solid rgba(91,75,255,0.05)',
          }}
        />

        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', lg: 'center' },
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 1.5,
          }}
        >
          <Stack direction="row" spacing={1.3} alignItems="center">
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
                  'linear-gradient(135deg, #2675f5 0%, #7b43ed 100%)',
              }}
            >
              <AnalyticsOutlinedIcon sx={{ fontSize: 27 }} />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: { xs: '1.15rem', md: '1.42rem' },
                  fontWeight: 950,
                  color: '#0f1b39',
                }}
              >
                Analytics
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  fontSize: '0.73rem',
                  color: '#425477',
                }}
              >
                Track hiring performance, candidate funnel and key recruitment
                metrics.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={0.7}
            flexWrap="wrap"
            useFlexGap
          >
            <Select
              size="small"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              startAdornment={
                <CalendarMonthOutlinedIcon
                  sx={{
                    mr: 0.7,
                    fontSize: 17,
                    color: '#0758ce',
                  }}
                />
              }
              sx={{
                ...heroSelect,
                minWidth: 145,
              }}
            >
              <MenuItem value="7">Last 7 Days</MenuItem>
              <MenuItem value="30">Last 30 Days</MenuItem>
              <MenuItem value="90">Last 90 Days</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>

            <Button
              variant="outlined"
              startIcon={<DownloadOutlinedIcon />}
              sx={heroButton}
            >
              Export Report
            </Button>

            <Button
              variant="outlined"
              startIcon={<GridViewOutlinedIcon />}
              sx={heroButton}
            >
              Custom Dashboard
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* KPI cards */}
      <Paper
        elevation={0}
        sx={{
          mt: 1.4,
          p: 1.5,
          border: '1px solid #e0e7ef',
          borderRadius: '13px',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              lg: 'repeat(5, 1fr)',
            },
          }}
        >
          <Metric
            icon={<GroupsOutlinedIcon />}
            value="12,486"
            label="Total Candidates"
            change="+18%"
            positive
            iconBg="#eee7ff"
            iconColor="#6d35e3"
          />

          <Metric
            icon={<PersonAddAltOutlinedIcon />}
            value="428"
            label="Total Hires"
            change="+12%"
            positive
            iconBg="#e7f0ff"
            iconColor="#1261d7"
            border
          />

          <Metric
            icon={<ScheduleOutlinedIcon />}
            value="16.8 Days"
            label="Avg. Time to Hire"
            change="-22%"
            positive
            iconBg="#fff0dd"
            iconColor="#e36a00"
            border
          />

          <Metric
            icon={<FilterAltOutlinedIcon />}
            value="56%"
            label="Offer Acceptance"
            change="+6%"
            positive
            iconBg="#eee7ff"
            iconColor="#7436e5"
            border
          />

          <Metric
            icon={<TrackChangesOutlinedIcon />}
            value="92%"
            label="Screening Accuracy"
            change="+4%"
            positive
            iconBg="#eee7ff"
            iconColor="#7436e5"
            border
          />
        </Box>
      </Paper>

      {/* First analytics row */}
      <Box
        sx={{
          mt: 1.2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl: '1fr 1.08fr .96fr',
          },
          gap: 1.2,
        }}
      >
        <AnalyticsCard title="Hiring Funnel">
          <HiringFunnel />
        </AnalyticsCard>

        <AnalyticsCard
          title="Hires Trend"
          action={
            <Stack direction="row" spacing={1.5}>
              <LegendDot color="#1678e8" label="Hires" />
              <LegendDot color="#8848ec" label="Offers" />
            </Stack>
          }
        >
          <TrendChart />
        </AnalyticsCard>

        <AnalyticsCard title="Source Performance">
          <SourcePerformance />
        </AnalyticsCard>
      </Box>

      {/* Second analytics row */}
      <Box
        sx={{
          mt: 1.2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl: '1fr 1.08fr .96fr',
          },
          gap: 1.2,
        }}
      >
        <AnalyticsCard
          title="Role-wise Hiring"
          action={
            <Button
              sx={{
                p: 0,
                minWidth: 0,
                textTransform: 'none',
                fontSize: '0.6rem',
                fontWeight: 900,
              }}
            >
              View All →
            </Button>
          }
        >
          <RoleTable />
        </AnalyticsCard>

        <AnalyticsCard title="Time to Hire (Days)">
          <TimeToHireChart />
        </AnalyticsCard>

        <AnalyticsCard
          title="Key Insights"
          titleIcon={
            <AutoAwesomeOutlinedIcon
              sx={{
                fontSize: 20,
                color: '#7436e5',
              }}
            />
          }
        >
          <KeyInsights />
        </AnalyticsCard>
      </Box>

      <Typography
        sx={{
          mt: 0.8,
          fontSize: '0.61rem',
          color: '#7b8799',
        }}
      >
        Analytics shown on this screen are frontend demo data until the
        Employer Analytics API is connected.
      </Typography>
    </Box>
  );
};

const HiringFunnel = () => (
  <Stack spacing={0.75} sx={{ pt: 0.4 }}>
    {funnel.map((item) => (
      <Box
        key={item.label}
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 100px 105px',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            height: 37,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              width: `${item.width}%`,
              height: 32,
              borderRadius: '5px 5px 10px 10px',
              background: item.background,
              boxShadow: '0 4px 10px rgba(77,77,160,.08)',
            }}
          />
        </Box>

        <Typography
          sx={{
            fontSize: '0.65rem',
            fontWeight: 850,
            color: '#293954',
          }}
        >
          {item.label}
        </Typography>

        <Typography
          sx={{
            fontSize: '0.64rem',
            fontWeight: 950,
            color: '#17233d',
            textAlign: 'right',
          }}
        >
          {item.value} ({item.percent})
        </Typography>
      </Box>
    ))}
  </Stack>
);

const TrendChart = () => {
  const max = 70;

  const points = (
    key: 'hires' | 'offers',
    width: number,
    height: number,
  ) =>
    trends
      .map((item, index) => {
        const x =
          12 +
          (index / (trends.length - 1)) *
            (width - 24);

        const y =
          height -
          22 -
          (item[key] / max) *
            (height - 44);

        return `${x},${y}`;
      })
      .join(' ');

  return (
    <Box sx={{ pt: 0.5 }}>
      <Box
        sx={{
          height: 210,
          position: 'relative',
          borderLeft: '1px solid #dce4ef',
          borderBottom: '1px solid #dce4ef',
          background:
            'repeating-linear-gradient(to bottom, transparent 0, transparent 41px, #e8edf4 42px)',
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 500 210"
          preserveAspectRatio="none"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <polyline
            points={points('offers', 500, 210)}
            fill="none"
            stroke="#8848ec"
            strokeWidth="3"
          />

          <polyline
            points={points('hires', 500, 210)}
            fill="none"
            stroke="#1678e8"
            strokeWidth="3"
          />

          {trends.map((item, index) => {
            const x =
              12 +
              (index / (trends.length - 1)) *
                476;

            const hiresY =
              188 -
              (item.hires / 70) * 166;

            const offersY =
              188 -
              (item.offers / 70) * 166;

            return (
              <g key={item.date}>
                <circle
                  cx={x}
                  cy={hiresY}
                  r="5"
                  fill="#fff"
                  stroke="#1678e8"
                  strokeWidth="3"
                />

                <circle
                  cx={x}
                  cy={offersY}
                  r="5"
                  fill="#fff"
                  stroke="#8848ec"
                  strokeWidth="3"
                />
              </g>
            );
          })}
        </Box>
      </Box>

      <Box
        sx={{
          mt: 0.6,
          display: 'grid',
          gridTemplateColumns: `repeat(${trends.length},1fr)`,
        }}
      >
        {trends.map((item) => (
          <Typography
            key={item.date}
            sx={{
              textAlign: 'center',
              fontSize: '0.53rem',
              color: '#52627a',
            }}
          >
            {item.date}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

const SourcePerformance = () => {
  const gradient = `conic-gradient(
    #2c83ed 0% 34%,
    #8749e8 34% 56%,
    #4bc879 56% 74%,
    #ffab2f 74% 88%,
    #e84ab9 88% 100%
  )`;

  return (
    <Box
      sx={{
        pt: 1.2,
        display: 'grid',
        gridTemplateColumns: '145px 1fr',
        gap: 2,
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          width: 145,
          height: 145,
          borderRadius: '50%',
          background: gradient,
          position: 'relative',

          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 30,
            bgcolor: '#fff',
            borderRadius: '50%',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 950,
              color: '#17233d',
            }}
          >
            12,486
          </Typography>

          <Typography
            sx={{
              fontSize: '0.58rem',
              fontWeight: 800,
              color: '#344861',
            }}
          >
            Candidates
          </Typography>
        </Box>
      </Box>

      <Stack spacing={1}>
        {sources.map((source) => (
          <Stack
            key={source.label}
            direction="row"
            alignItems="center"
            spacing={0.8}
          >
            <Box
              sx={{
                width: 11,
                height: 11,
                borderRadius: '3px',
                bgcolor: source.color,
              }}
            />

            <Typography
              sx={{
                flex: 1,
                fontSize: '0.62rem',
                color: '#263750',
                fontWeight: 800,
              }}
            >
              {source.label}
            </Typography>

            <Typography
              sx={{
                fontSize: '0.62rem',
                fontWeight: 950,
                color: '#17233d',
              }}
            >
              {source.value}%
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

const RoleTable = () => (
  <Box sx={{ mt: 0.3 }}>
    <Box
      sx={{
        px: 1,
        py: 0.7,
        display: 'grid',
        gridTemplateColumns: '1.7fr .7fr .6fr .75fr',
        bgcolor: '#f3f6fa',
        borderRadius: '6px',
      }}
    >
      {['Role', 'Applied', 'Hired', 'Conversion'].map(
        (heading) => (
          <Typography
            key={heading}
            sx={{
              fontSize: '0.57rem',
              fontWeight: 950,
              color: '#263750',
            }}
          >
            {heading}
          </Typography>
        ),
      )}
    </Box>

    {roles.map((item) => (
      <Box
        key={item.role}
        sx={{
          px: 1,
          py: 0.72,
          display: 'grid',
          gridTemplateColumns: '1.7fr .7fr .6fr .75fr',
          borderBottom: '1px solid #e8edf3',
        }}
      >
        <Typography sx={tableText}>
          {item.role}
        </Typography>

        <Typography sx={tableText}>
          {item.applied}
        </Typography>

        <Typography sx={tableText}>
          {item.hired}
        </Typography>

        <Typography sx={tableText}>
          {item.conversion}
        </Typography>
      </Box>
    ))}
  </Box>
);

const TimeToHireChart = () => (
  <Box
    sx={{
      height: 215,
      pt: 1,
      display: 'flex',
      alignItems: 'flex-end',
      gap: 1.5,
      borderBottom: '1px solid #dce4ef',
      background:
        'repeating-linear-gradient(to bottom, transparent 0, transparent 41px, #e8edf4 42px)',
    }}
  >
    {timeToHire.map((item) => (
      <Box
        key={item.label}
        sx={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Typography
          sx={{
            mb: 0.4,
            fontSize: '0.62rem',
            fontWeight: 950,
            color: '#17233d',
          }}
        >
          {item.value}
        </Typography>

        <Box
          sx={{
            width: '70%',
            maxWidth: 58,
            height: `${(item.value / 30) * 150}px`,
            minHeight: 25,
            borderRadius: '5px 5px 0 0',
            background:
              'linear-gradient(180deg,#c9aff6,#ae8aea)',
          }}
        />

        <Typography
          sx={{
            height: 34,
            pt: 0.5,
            whiteSpace: 'pre-line',
            textAlign: 'center',
            fontSize: '0.51rem',
            lineHeight: 1.1,
            fontWeight: 800,
            color: '#344861',
          }}
        >
          {item.label}
        </Typography>
      </Box>
    ))}
  </Box>
);

const KeyInsights = () => (
  <Stack spacing={1.35} sx={{ pt: 0.8 }}>
    <Insight
      icon={<TrendingUpOutlinedIcon />}
      color="#16a13a"
      text="Hires increased by 12% vs. previous 30 days."
    />

    <Insight
      icon={<TrendingUpOutlinedIcon />}
      color="#16a13a"
      text="Screening accuracy is 92% (+4%)."
    />

    <Insight
      icon={<TrendingDownOutlinedIcon />}
      color="#e32d25"
      text="Avg. time to hire reduced to 16.8 days (-22%)."
    />

    <Insight
      icon={<TrendingUpOutlinedIcon />}
      color="#16a13a"
      text="Referrals have the highest conversion (6.8%)."
    />

    <Insight
      icon={<TrackChangesOutlinedIcon />}
      color="#7436e5"
      text="Focus on APM role — higher time to hire (21.2 days)."
    />
  </Stack>
);

const Insight = ({
  icon,
  color,
  text,
}: {
  icon: ReactNode;
  color: string;
  text: string;
}) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Box
      sx={{
        color,
        display: 'flex',

        '& svg': {
          fontSize: 20,
        },
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        fontSize: '0.62rem',
        lineHeight: 1.45,
        fontWeight: 800,
        color: '#263750',
      }}
    >
      {text}
    </Typography>
  </Stack>
);

const AnalyticsCard = ({
  title,
  titleIcon,
  action,
  children,
}: {
  title: string;
  titleIcon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.5,
      minHeight: 290,
      border: '1px solid #e0e7ef',
      borderRadius: '13px',
    }}
  >
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={1}
    >
      <Stack direction="row" spacing={0.6} alignItems="center">
        {titleIcon}

        <Typography
          sx={{
            fontSize: '0.88rem',
            fontWeight: 950,
            color: '#17233d',
          }}
        >
          {title}
        </Typography>
      </Stack>

      {action}
    </Stack>

    {children}
  </Paper>
);

const LegendDot = ({
  color,
  label,
}: {
  color: string;
  label: string;
}) => (
  <Stack direction="row" spacing={0.45} alignItems="center">
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        bgcolor: color,
      }}
    />

    <Typography
      sx={{
        fontSize: '0.56rem',
        fontWeight: 800,
        color: '#344861',
      }}
    >
      {label}
    </Typography>
  </Stack>
);

const Metric = ({
  icon,
  value,
  label,
  change,
  positive,
  iconBg,
  iconColor,
  border = false,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  change: string;
  positive: boolean;
  iconBg: string;
  iconColor: string;
  border?: boolean;
}) => (
  <Box
    sx={{
      px: 1.5,
      minHeight: 78,
      display: 'flex',
      alignItems: 'center',
      gap: 1.1,
      borderLeft: {
        xs: 'none',
        lg: border ? '1px solid #e2e8f0' : 'none',
      },
    }}
  >
    <Box
      sx={{
        width: 45,
        height: 45,
        flexShrink: 0,
        borderRadius: '50%',
        bgcolor: iconBg,
        color: iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

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
          fontSize: '1rem',
          lineHeight: 1.1,
          fontWeight: 950,
          color: '#101b38',
        }}
      >
        {value}
      </Typography>

      <Typography
        sx={{
          mt: 0.25,
          fontSize: '0.62rem',
          color: '#344a6c',
        }}
      >
        {label}
      </Typography>

      <Stack
        direction="row"
        spacing={0.25}
        alignItems="center"
        sx={{ mt: 0.3 }}
      >
        {positive ? (
          <TrendingUpOutlinedIcon
            sx={{
              fontSize: 14,
              color: '#15933d',
            }}
          />
        ) : (
          <TrendingDownOutlinedIcon
            sx={{
              fontSize: 14,
              color: '#df342b',
            }}
          />
        )}

        <Typography
          sx={{
            fontSize: '0.56rem',
            fontWeight: 900,
            color: positive ? '#15933d' : '#df342b',
          }}
        >
          {change}
        </Typography>
      </Stack>
    </Box>
  </Box>
);

const breadcrumbStyle = {
  fontSize: '0.65rem',
  color: '#64748b',
};

const heroButton = {
  minHeight: 38,
  px: 1.5,
  borderRadius: '8px',
  borderColor: '#d3ddec',
  bgcolor: '#fff',
  color: '#17233d',
  textTransform: 'none',
  fontSize: '0.67rem',
  fontWeight: 900,

  '&:hover': {
    bgcolor: '#f8fbff',
    borderColor: '#bdcbe0',
  },

  '& .MuiButton-startIcon svg': {
    fontSize: 18,
  },
};

const heroSelect = {
  height: 38,
  borderRadius: '8px',
  bgcolor: '#fff',
  fontSize: '0.67rem',
  fontWeight: 900,
  color: '#17233d',

  '& fieldset': {
    borderColor: '#d3ddec',
  },
};

const tableText = {
  fontSize: '0.59rem',
  fontWeight: 800,
  color: '#263750',
};

export default EmployerAnalyticsPage;