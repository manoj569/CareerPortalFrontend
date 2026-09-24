import { Avatar, Box, ButtonBase, Chip, Paper, Stack, Typography } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import type { PublicReferralJob } from '../types/referralModels';

const initials = (name: string | null | undefined) =>
  name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

const referralExperience = (minimum?: number | null, maximum?: number | null) => {
  if (minimum === 0 && maximum === 0) return 'Fresher';
  if (minimum != null && maximum != null)
    return minimum === maximum ? `${minimum} years` : `${minimum}–${maximum} years`;
  if (minimum != null) return `${minimum}+ years`;
  if (maximum != null) return `Up to ${maximum} years`;
  return null;
};

const employmentLabels: Record<string, string> = {
  1: 'Full-time',
  FullTime: 'Full-time',
  2: 'Part-time',
  PartTime: 'Part-time',
  3: 'Contract',
  Contract: 'Contract',
  4: 'Internship',
  Internship: 'Internship',
  5: 'Freelance',
  Freelance: 'Freelance',
  6: 'Temporary',
  Temporary: 'Temporary',
};

export const ReferralJobCard = ({
  job,
  onSeeDetails,
  busy = false,
}: {
  job: PublicReferralJob;
  onSeeDetails: (job: PublicReferralJob) => void;
  busy?: boolean;
}) => {
  const experience = referralExperience(job.minimumExperienceYears, job.maximumExperienceYears);
  const employment =
    job.employmentType == null ? null : employmentLabels[String(job.employmentType)];
  const unlocked = job.canViewReferrerContact === true;
  const roleLine = [job.referrerCurrentRole, job.referrerCompanyName].filter(Boolean).join(' at ');
  const tenure = job.referrerCompletedYearsAtCompany;
  const start = job.referrerCompanyStartDate ? new Date(job.referrerCompanyStartDate) : null;
  return (
    <Paper
      component="article"
      variant="outlined"
      sx={{
        p: { xs: 2.5, md: 3 },
        minHeight: { md: 190 },
        borderColor: '#e6eaf1',
        borderRadius: 1.5,
        boxShadow: '0 2px 8px rgba(25, 45, 80, 0.025)',
        display: 'grid',
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          md: 'minmax(0, 1.6fr) minmax(0, 1fr) minmax(210px, .95fr)',
        },
        alignItems: 'center',
        gap: 3,
        color: '#101b3c',
      }}
    >
      <Stack direction="row" spacing={2} sx={{ minWidth: 0 }}>
        <Avatar
          variant="rounded"
          src={job.companyLogoUrl ?? undefined}
          alt={job.companyName ?? 'Company'}
          sx={{
            width: 72,
            height: 72,
            bgcolor: '#f7f9fe',
            color: 'primary.main',
            border: '1px solid #e5e8ee',
            fontWeight: 700,
            '& img': { objectFit: 'contain', p: 0.75 },
          }}
        >
          {initials(job.companyName) || <WorkOutlineIcon />}
        </Avatar>
        <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
          <Typography component="h3" sx={{ fontSize: 19, fontWeight: 750, lineHeight: 1.4 }}>
            {job.jobTitle}
          </Typography>
          {job.companyName && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{job.companyName}</Typography>
              {job.companyIsVerified === true && (
                <VerifiedIcon
                  aria-label="Verified company"
                  sx={{ color: 'primary.main', fontSize: 18 }}
                />
              )}
            </Stack>
          )}
          <Stack
            direction="row"
            useFlexGap
            flexWrap="wrap"
            gap={1.25}
            sx={{
              my: 1.5,
              color: '#4c5b75',
              '& > span': {
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: 13,
              },
              '& svg': { fontSize: 17 },
            }}
          >
            {job.location && (
              <Box component="span">
                <LocationOnOutlinedIcon />
                {job.location}
              </Box>
            )}
            {employment && (
              <Box component="span">
                <WorkOutlineIcon />
                {employment}
              </Box>
            )}
            {experience && (
              <Box component="span">
                <SignalCellularAltIcon />
                {experience}
              </Box>
            )}
          </Stack>
          <Stack direction="row" useFlexGap flexWrap="wrap" gap={0.75}>
            {job.skills?.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                size="small"
                sx={{
                  bgcolor: '#eff4fc',
                  borderRadius: 0.75,
                  height: 'auto',
                  minHeight: 28,
                  maxWidth: '100%',
                  '& .MuiChip-label': { px: 1.25, py: 0.5, fontSize: 12.5, whiteSpace: 'normal' },
                }}
              />
            ))}
          </Stack>
        </Box>
      </Stack>
      <Stack spacing={1.75} sx={{ minWidth: 0 }}>
        {job.referralAvailable === true && (
          <Chip
            icon={<GroupsIcon />}
            label="Employee referral available"
            size="small"
            sx={{
              alignSelf: 'flex-start',
              bgcolor: '#e2f3e5',
              color: '#175524',
              height: 'auto',
              minHeight: 28,
              maxWidth: '100%',
              '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 },
              fontSize: 13,
              fontWeight: 600,
              '& .MuiChip-icon': { color: '#25803a', fontSize: 19 },
            }}
          />
        )}
        {(job.referrerName || roleLine || tenure != null) && (
          <Stack direction="row" spacing={1.75} alignItems="center">
            <Avatar
              src={job.referrerProfileImageUrl ?? undefined}
              alt={job.referrerName ?? 'Referrer'}
              sx={{ width: 48, height: 48, bgcolor: '#e8eef8', color: '#435b83', fontSize: 14 }}
            >
              {initials(job.referrerName)}
            </Avatar>
            <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
              {job.referrerName && (
                <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                  Referred by {job.referrerName}
                </Typography>
              )}
              {roleLine && (
                <Typography sx={{ fontSize: 13, color: '#4c5b75' }}>{roleLine}</Typography>
              )}
              {tenure != null && (
                <Typography sx={{ fontSize: 12.5, color: '#4c5b75' }}>
                  {tenure} {tenure === 1 ? 'year' : 'years'} at the company · Self-reported
                </Typography>
              )}
              {tenure == null && start && !Number.isNaN(start.getTime()) && (
                <Typography sx={{ fontSize: 12.5, color: '#4c5b75' }}>
                  Since{' '}
                  {start.toLocaleDateString('en', {
                    month: 'short',
                    year: 'numeric',
                    timeZone: 'UTC',
                  })}{' '}
                  · Self-reported
                </Typography>
              )}
            </Box>
          </Stack>
        )}
      </Stack>
      <ButtonBase
        disabled={busy}
        onClick={() => onSeeDetails(job)}
        sx={{
          bgcolor: '#eff4ff',
          color: '#064ebc',
          borderRadius: 1.5,
          minHeight: 138,
          p: 2.5,
          gap: 1.75,
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
          '&:hover': { bgcolor: '#e5edff' },
          '&.Mui-focusVisible': { outline: '2px solid', outlineOffset: 2 },
        }}
      >
        {unlocked ? <ArrowForwardIcon /> : <LockOutlinedIcon sx={{ fontSize: 34 }} />}
        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>View referrer details</Typography>
          <Typography sx={{ fontSize: 13, mt: 0.5, color: '#334468' }}>
            {unlocked ? 'Contact access available' : 'Unlock with Referral Contact Access'}
          </Typography>
        </Box>
      </ButtonBase>
    </Paper>
  );
};
