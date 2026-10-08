import { Avatar, Box, Button, Chip, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { buildJobDetailsPath, ROUTES } from '@/constants/routes';
import type { PublicReferralJob } from '../types/referralModels';
import {
  dateLabel,
  requestStatus,
  type ReferralRequestRecord,
  type ReferralQuota,
} from '../types/marketplaceModels';
import { ReferralCard } from './MarketplaceUI';
import {
  getEmploymentTypeLabel,
  getWorkplaceTypeLabel,
} from '@/features/jobs/constants/jobOptions';
import type { EmploymentType, WorkplaceType } from '@/features/jobs/types/jobModels';

export const CandidateJobSummary = ({
  job,
  request,
}: {
  job?: PublicReferralJob;
  request?: ReferralRequestRecord;
}) => {
  const navigate = useNavigate();
  const title = job?.jobTitle ?? request?.jobTitle;
  const company = job?.companyName ?? request?.companyName;
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems={{ sm: 'center' }}>
      <Avatar
        variant="rounded"
        src={job?.companyLogoUrl ?? undefined}
        sx={{ width: 64, height: 64, bgcolor: '#eef5ff', color: 'primary.main', fontWeight: 800 }}
      >
        {company?.slice(0, 1) || 'J'}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontWeight={800} fontSize={16}>
          {title}
        </Typography>
        <Typography fontSize={13}>
          {company}
          {job?.companyIsVerified ? ' · Verified company' : ''}
        </Typography>
        {job && (
          <Typography fontSize={12} color="text.secondary" my={1}>
            {[
              job.location,
              job.workplaceType != null
                ? getWorkplaceTypeLabel(job.workplaceType as WorkplaceType)
                : null,
              job.employmentType != null
                ? getEmploymentTypeLabel(job.employmentType as EmploymentType)
                : null,
              job.minimumExperienceYears != null
                ? `${job.minimumExperienceYears}${job.maximumExperienceYears != null ? `–${job.maximumExperienceYears}` : '+'} years`
                : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Typography>
        )}
        <Stack direction="row" gap={0.75} useFlexGap flexWrap="wrap">
          {job?.skills?.map((skill) => (
            <Chip
              key={skill}
              size="small"
              label={skill}
              sx={{ borderRadius: 1, bgcolor: '#eff4fc' }}
            />
          ))}
        </Stack>
      </Box>
      <Button
        variant="outlined"
        size="small"
        onClick={() =>
          void navigate(
            job?.jobSlug
              ? buildJobDetailsPath(job.jobSlug)
              : `${ROUTES.DASHBOARD_JOBS}?mode=referral`,
          )
        }
      >
        {job?.jobSlug ? 'View Job →' : 'View Referral Jobs →'}
      </Button>
    </Stack>
  );
};

export const CandidateReferralTimeline = ({ request }: { request: ReferralRequestRecord }) => {
  const status = requestStatus(request.status);
  const terminal = status === 'Rejected' || status === 'Expired';
  const steps = [
    { label: 'Request sent', time: request.requestedAtUtc },
    {
      label: terminal ? status : 'Accepted',
      time: terminal ? (request.rejectedAtUtc ?? request.expiredAtUtc) : request.acceptedAtUtc,
    },
    { label: 'Referral submitted', time: request.referralSubmittedAtUtc },
    { label: 'Acknowledged by you', time: request.candidateConfirmedAtUtc },
  ];
  return (
    <Box
      role="list"
      aria-label="Referral history"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4,1fr)' },
        gap: 2,
        py: 2,
      }}
    >
      {steps.map((step, index) => (
        <Stack key={step.label} role="listitem" alignItems="center" textAlign="center" gap={1}>
          <Avatar
            sx={{
              width: 34,
              height: 34,
              fontSize: 15,
              bgcolor: step.time ? (terminal && index === 1 ? '#fee8ec' : '#dff8ed') : '#edf1f7',
              color: step.time ? '#008c52' : '#56647e',
            }}
          >
            {step.time ? '✓' : index + 1}
          </Avatar>
          <Typography fontSize={12} fontWeight={750}>
            {step.label}
          </Typography>
          <Typography fontSize={11} color="text.secondary">
            {step.time ? dateLabel(step.time) : terminal ? 'Not reached' : 'Not recorded'}
          </Typography>
        </Stack>
      ))}
    </Box>
  );
};

export const CandidateQuotaCard = ({ quota }: { quota: ReferralQuota }) => (
  <ReferralCard title="Referral connections" tint="#f1f7ff">
    <Typography fontWeight={750}>
      {quota.acceptedConnections} / {quota.limit} accepted connections ·{' '}
      {quota.remainingConnections} remaining
    </Typography>
    <Typography fontSize={12} color="text.secondary" mt={1}>
      Requests consume zero connections. Successful acceptance consumes one connection.{' '}
      {quota.periodEndUtc ? `Current period ends ${dateLabel(quota.periodEndUtc)} IST.` : ''}
    </Typography>
    {!quota.hasActiveAccess && (
      <Typography fontSize={12} mt={1}>
        Active Referral Access is required. Manage access through Membership.
      </Typography>
    )}
  </ReferralCard>
);

export const CandidateHowItWorks = () => (
  <ReferralCard title="How referral jobs work?">
    <Stack gap={2}>
      {[
        ['Browse referral jobs', 'Find approved opportunities shared by employees.'],
        ['Request a referral', 'The employee decides whether to accept your request.'],
        ['Employee reports submission', 'Acceptance does not confirm submission.'],
        [
          'Acknowledge receipt',
          'Tell us if you receive company instructions. Track this in My Referral Requests.',
        ],
      ].map(([title, text], i) => (
        <Stack key={title} direction="row" gap={1.5}>
          <Avatar
            sx={{ width: 30, height: 30, bgcolor: '#eaf2ff', color: 'primary.main', fontSize: 15 }}
          >
            {i + 1}
          </Avatar>
          <Box>
            <Typography fontSize={13} fontWeight={750}>
              {title}
            </Typography>
            <Typography fontSize={12} color="text.secondary">
              {text}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  </ReferralCard>
);
