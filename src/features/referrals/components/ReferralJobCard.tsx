import { Box, Button, ButtonBase, Chip, Paper, Stack, Typography } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import type { PublicReferralJob } from '../types/referralModels';
import type { ReferralRequestRecord } from '../types/marketplaceModels';
import { dateLabel, statusLabel } from '../types/marketplaceModels';
import { getWorkplaceTypeLabel } from '@/features/jobs/constants/jobOptions';
import type { WorkplaceType } from '@/features/jobs/types/jobModels';
import { CompanyLogoFallback } from '@/features/jobs/components/CompanyLogoFallback';

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
  request,
  onViewRequest,
  onSave,
  saved = false,
}: {
  job: PublicReferralJob;
  onSeeDetails: (job: PublicReferralJob) => void;
  busy?: boolean;
  request?: ReferralRequestRecord;
  onViewRequest?: () => void;
  onSave?: () => void;
  saved?: boolean;
}) => {
  const experience = referralExperience(job.minimumExperienceYears, job.maximumExperienceYears);
  const employment =
    job.employmentType == null ? null : employmentLabels[String(job.employmentType)];
  return (
    <Paper
      component="article"
      variant="outlined"
      sx={{
        p: { xs: 2, md: 2.25 },
        minHeight: { md: 150 },
        borderColor: '#e6eaf1',
        borderRadius: 1.5,
        boxShadow: '0 2px 8px rgba(25, 45, 80, 0.025)',
        display: 'grid',
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          md: 'minmax(0, 2fr) minmax(0, 1fr) minmax(145px, .75fr)',
        },
        alignItems: 'center',
        gap: 3,
        color: '#101b3c',
      }}
    >
      <Stack direction="row" spacing={2} sx={{ minWidth: 0 }}>
        <CompanyLogoFallback
          variant="rounded"
          companyName={job.companyName}
          logoUrl={job.companyLogoUrl}
          size={62}
          fallback={<WorkOutlineIcon />}
          sx={{
            width: 62,
            height: 62,
            bgcolor: '#f7f9fe',
            color: 'primary.main',
            border: '1px solid #e5e8ee',
            fontWeight: 700,
            '& img': { objectFit: 'contain', p: 0.75 },
          }}
        />
        <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
          <Typography component="h3" sx={{ fontSize: 16, fontWeight: 750, lineHeight: 1.4 }}>
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
                {job.workplaceType != null &&
                  ` (${getWorkplaceTypeLabel(job.workplaceType as WorkplaceType)})`}
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
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
          {job.referrerLabel || 'Employee Referrer'}
        </Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          Contact details are private until acceptance.
        </Typography>
        {request ? (
          <Box sx={{ bgcolor: '#eef5ff', p: 1.5, borderRadius: 1 }}>
            <Typography fontSize={13} fontWeight={750} color="primary">
              {statusLabel(request.status)}
            </Typography>
            <Typography fontSize={11}>Requested {dateLabel(request.requestedAtUtc)}</Typography>
            <Button size="small" onClick={onViewRequest}>
              View request status →
            </Button>
          </Box>
        ) : (
          job.remainingReferralSlots != null && (
            <Typography sx={{ fontSize: 12 }}>
              {job.remainingReferralSlots} referral slots remaining
            </Typography>
          )
        )}
      </Stack>
      <Stack gap={1}>
        <ButtonBase
          aria-label={request ? 'View referral request' : 'Request Referral'}
          disabled={
            busy ||
            (!request && (job.referralAvailable === false || job.remainingReferralSlots === 0))
          }
          onClick={() => (request ? onViewRequest?.() : onSeeDetails(job))}
          sx={{
            bgcolor: '#eff4ff',
            color: '#064ebc',
            borderRadius: 1.5,
            minHeight: 40,
            p: 1,
            gap: 1.75,
            flexDirection: 'row',
            justifyContent: 'center',
            textAlign: 'center',
            width: '100%',
            '&:hover': { bgcolor: '#e5edff' },
            '&.Mui-focusVisible': { outline: '2px solid', outlineOffset: 2 },
          }}
        >
          <ArrowForwardIcon />
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
              {request ? 'View request' : 'Request Referral'}
            </Typography>
          </Box>
        </ButtonBase>
        {onSave && (
          <Button size="small" disabled={busy} onClick={onSave}>
            {saved ? 'Saved · Remove' : 'Save job'}
          </Button>
        )}
      </Stack>
    </Paper>
  );
};
