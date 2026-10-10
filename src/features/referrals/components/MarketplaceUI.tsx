import type { ReactNode } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useGetReferralMetricsQuery } from '../api/marketplaceApi';
import {
  approvalStatus,
  referralError,
  statusLabel,
  type ReferralMetrics,
  type ReferrerRequestRecord,
} from '../types/marketplaceModels';
import type { JobReferralSubmission } from '../types/referralModels';
const cardSx = {
  border: '1px solid #e3eaf4',
  borderRadius: 1.5,
  boxShadow: '0 2px 4px #18345b03',
  p: 2.25,
  minWidth: 0,
};
export const ReferralCard = ({
  title,
  children,
  tint,
}: {
  title?: string;
  children: ReactNode;
  tint?: string;
}) => (
  <Paper elevation={0} sx={{ ...cardSx, bgcolor: tint || '#fff' }}>
    {title && (
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
        <WorkOutlineIcon color="primary" />
        <Typography component="h2" fontSize={16} fontWeight={750}>
          {title}
        </Typography>
      </Stack>
    )}
    {children}
  </Paper>
);
export const ReferralLayout = ({ children, aside }: { children: ReactNode; aside: ReactNode }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: 'minmax(0,1fr)', lg: 'minmax(0,2.3fr) minmax(300px,1fr)' },
      gap: 2,
      width: '100%',
      color: '#101b36',
      '& .MuiButton-root': { textTransform: 'none' },
      '& .MuiButton-root.Mui-focusVisible': { outline: '2px solid #0061f5', outlineOffset: 3 },
      '& .MuiTypography-root': { overflowWrap: 'anywhere' },
    }}
  >
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      {children}
    </Stack>
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      {aside}
    </Stack>
  </Box>
);
export const ReferralHero = ({
  title,
  subtitle,
  success = false,
  trust = false,
  illustration,
}: {
  title: string;
  subtitle: string;
  success?: boolean;
  trust?: boolean;
  illustration?: 'share' | 'success' | 'complete';
}) => (
  <Paper
    elevation={0}
    sx={{
      ...cardSx,
      background: success
        ? 'linear-gradient(110deg,#edfcf6,#eff9ff)'
        : 'linear-gradient(110deg,#edf7ff,#e9f4ff)',
      borderColor: '#cce3ff',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      minHeight: 112,
      overflow: 'hidden',
    }}
  >
    <Avatar sx={{ width: 56, height: 56, bgcolor: success ? '#20c780' : 'primary.main' }}>
      {success ? (
        <CheckCircleIcon sx={{ fontSize: 36 }} />
      ) : (
        <GroupsOutlinedIcon sx={{ fontSize: 32 }} />
      )}
    </Avatar>
    <Box sx={{ flex: 1 }}>
      <Typography component="h1" fontSize={{ xs: 22, md: 27 }} fontWeight={800} lineHeight={1.2}>
        {title}
      </Typography>
      <Typography fontSize={14} color="text.secondary" mt={0.75}>
        {subtitle}
      </Typography>
      {trust && (
        <Stack direction="row" flexWrap="wrap" useFlexGap gap={2} mt={1.5}>
          {[
            'You decide who to refer',
            'Your contact details stay private',
            'Help talented people grow',
          ].map((t) => (
            <Typography key={t} fontSize={11} color="text.secondary">
              ✓ {t}
            </Typography>
          ))}
        </Stack>
      )}
    </Box>
    <Box
      component="img"
      src={'/images/referrals/' + (illustration || (success ? 'success' : 'share')) + '.png'}
      alt=""
      aria-hidden="true"
      sx={{
        display: { xs: 'none', xl: 'block' },
        width: success ? 230 : 190,
        height: 100,
        objectFit: 'contain',
        alignSelf: 'flex-end',
        flexShrink: 0,
        mr: -1,
        mb: -2.25,
      }}
    />
  </Paper>
);
export const ReferralLoading = () => (
  <Stack role="status" aria-label="Loading referrals" gap={2}>
    {[1, 2, 3].map((i) => (
      <Skeleton key={i} variant="rounded" height={110} />
    ))}
  </Stack>
);
export const ReferralFailure = ({ error, retry }: { error: unknown; retry: () => unknown }) => (
  <Alert
    severity="error"
    action={
      <Button color="inherit" onClick={() => retry()}>
        Retry
      </Button>
    }
  >
    {referralError(error)}
  </Alert>
);
export const StatusBadge = ({ status }: { status: string | number }) => {
  const label =
    typeof status === 'number'
      ? statusLabel(status)
      : ['Pending', 'Approved'].includes(status)
        ? status === 'Pending'
          ? 'Pending approval'
          : status
        : statusLabel(status as Parameters<typeof statusLabel>[0]);
  return (
    <Chip
      size="small"
      label={label || status}
      sx={{
        borderRadius: 1,
        fontWeight: 650,
        bgcolor: ['Approved', 'Accepted', 'Confirmed'].includes(label)
          ? '#e3f8ed'
          : label === 'Rejected'
            ? '#fff0f0'
            : '#edf4ff',
        color: ['Approved', 'Accepted', 'Confirmed'].includes(label)
          ? '#087d3b'
          : label === 'Rejected'
            ? '#b42318'
            : '#0055ef',
      }}
    />
  );
};
const metricFields = [
  ['jobsPosted', 'Jobs shared'],
  ['requestsReceived', 'Total requests'],
  ['requestsAccepted', 'Candidates accepted'],
  ['referralsSubmitted', 'Referrals submitted'],
  ['candidateConfirmedReferrals', 'Candidates confirmed'],
] as const;
export const Metrics = ({
  metrics,
  compact = false,
  tiles = false,
}: {
  metrics: ReferralMetrics;
  compact?: boolean;
  tiles?: boolean;
}) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: tiles
        ? 'repeat(2,minmax(0,1fr))'
        : compact
          ? '1fr'
          : { xs: 'repeat(2,minmax(0,1fr))', md: 'repeat(5,minmax(0,1fr))' },
      gap: 1.2,
    }}
  >
    {metricFields.map(([key, label], i) => (
      <Stack
        key={key}
        direction="row"
        alignItems="center"
        gap={1.25}
        sx={{
          bgcolor: compact && !tiles ? 'transparent' : '#ffffffa8',
          borderRadius: 1.5,
          p: compact ? 1 : 1.5,
        }}
      >
        <Avatar
          variant="rounded"
          sx={{
            width: 38,
            height: 38,
            bgcolor: ['#e6f2ff', '#f3eaff', '#e2f9ef', '#fff4e5', '#ffe8ee'][i],
            color: ['#0063ff', '#8b36dc', '#12a361', '#f99c16', '#fa1746'][i],
          }}
        >
          <GroupsOutlinedIcon />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography
            fontWeight={750}
            fontSize={compact ? 15 : 22}
            title={
              key === 'candidateConfirmedReferrals'
                ? 'Candidates who confirmed receiving the referral/application confirmation.'
                : undefined
            }
          >
            {metrics[key]}
          </Typography>
          <Typography fontSize={12} color="text.secondary">
            {label}
          </Typography>
        </Box>
      </Stack>
    ))}
  </Box>
);
export const Impact = ({ tiles = false }: { tiles?: boolean }) => {
  const q = useGetReferralMetricsQuery(undefined, {
    pollingInterval: 60000,
    refetchOnMountOrArgChange: true,
  });
  return (
    <ReferralCard title="Your referral impact">
      {q.isLoading ? (
        <Skeleton height={200} />
      ) : q.error ? (
        <ReferralFailure error={q.error} retry={q.refetch} />
      ) : q.data ? (
        <Metrics metrics={q.data} compact tiles={tiles} />
      ) : null}
    </ReferralCard>
  );
};
export const ReferralTips = ({ review = false }: { review?: boolean }) => (
  <ReferralCard tint="#fffcf3">
    <Stack direction="row" gap={1} alignItems="center" mb={1.5}>
      <LightbulbOutlinedIcon sx={{ color: '#ffa500' }} />
      <Typography component="h2" fontSize={16} fontWeight={750}>
        {review ? 'Tips for reviewing requests' : 'Tips for better referrals'}
      </Typography>
    </Stack>
    <Stack gap={1.2}>
      {(review
        ? [
            'Review the candidate’s experience and skills',
            'Download the authorized resume when available',
            'Accept only candidates you’re comfortable referring',
            'Complete the referral through your company’s process',
          ]
        : [
            'Share genuine and relevant opportunities',
            'Add accurate job details and required skills',
            'Choose realistic referral slots',
            'Review candidate profiles carefully',
            'Confirm only after you submit the referral',
          ]
      ).map((t) => (
        <Stack key={t} direction="row" gap={1}>
          <CheckCircleIcon color="primary" sx={{ fontSize: 17, mt: 0.25 }} />
          <Typography fontSize={12.5}>{t}</Typography>
        </Stack>
      ))}
    </Stack>
  </ReferralCard>
);
export const Difference = () => (
  <ReferralCard tint="#effcf6">
    <Stack direction="row" gap={1} alignItems="center">
      <FavoriteIcon sx={{ color: '#ff2348' }} />
      <Typography component="h2" fontSize={16} fontWeight={750}>
        Make a difference
      </Typography>
    </Stack>
    <Typography fontSize={13} mt={1} color="text.secondary">
      Help talented people find opportunities at your company. Your contact details stay private
      until you accept a request.
    </Typography>
  </ReferralCard>
);
export const JobSummary = ({
  job,
}: {
  job: Pick<JobReferralSubmission, 'jobTitle' | 'companyName' | 'location'>;
}) => (
  <Stack direction="row" gap={2} alignItems="center">
    <Avatar
      variant="rounded"
      sx={{
        width: 64,
        height: 64,
        bgcolor: '#eef6ff',
        color: '#0743ba',
        fontSize: 25,
        fontWeight: 750,
      }}
    >
      {job.companyName?.charAt(0)}
    </Avatar>
    <Box>
      <Typography fontWeight={750}>{job.jobTitle}</Typography>
      <Typography fontSize={13} color="text.secondary">
        {job.companyName}
      </Typography>
      {job.location && (
        <Typography fontSize={12} color="text.secondary" mt={0.5}>
          {job.location}
        </Typography>
      )}
    </Box>
  </Stack>
);
export const CandidateSummary = ({ record }: { record: ReferrerRequestRecord }) => (
  <Stack direction="row" gap={2} alignItems="center">
    <Avatar
      variant="rounded"
      sx={{ width: 64, height: 64, bgcolor: '#f5edff', color: '#680bd5', fontWeight: 750 }}
    >
      {record.candidate.displayName
        .split(' ')
        .slice(0, 2)
        .map((s) => s[0])
        .join('')}
    </Avatar>
    <Box sx={{ minWidth: 0 }}>
      <Typography fontWeight={750}>{record.candidate.displayName}</Typography>
      <Typography fontSize={13} color="text.secondary">
        {[
          record.candidate.yearsOfExperience != null
            ? `${record.candidate.yearsOfExperience} years experience`
            : null,
          record.candidate.location,
          record.candidate.availability,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Typography>
      <Stack direction="row" flexWrap="wrap" useFlexGap gap={0.75} mt={1}>
        {record.candidate.skills.map((s) => (
          <Chip
            size="small"
            key={s}
            label={s}
            sx={{ borderRadius: 1, bgcolor: '#eef5ff', color: '#0055ed' }}
          />
        ))}
      </Stack>
    </Box>
  </Stack>
);
export const ApprovalBadge = ({ value }: { value: string | number }) => (
  <Chip
    size="small"
    label={
      { Pending: 'Pending Approval', Approved: 'Active', Rejected: 'Rejected' }[
        approvalStatus(value)
      ]
    }
    color={
      approvalStatus(value) === 'Approved'
        ? 'success'
        : approvalStatus(value) === 'Rejected'
          ? 'error'
          : 'primary'
    }
    variant="outlined"
  />
);
