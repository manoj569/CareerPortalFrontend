import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Pagination,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import { ROUTES } from '@/constants/routes';
import { useAppSelector } from '@/hooks/reduxHooks';
import { selectCurrentUser } from '@/features/auth/store/authSlice';
import { useGetPublicReferralJobsQuery, useLazyUnlockReferralContactQuery } from '../api/referralsApi';
import type { PublicReferralJob, ReferrerContactDetails } from '../types/referralModels';

const PAGE_SIZE = 12;

const ReferralJobCard = ({
  job,
  onSeeDetails,
}: {
  job: PublicReferralJob;
  onSeeDetails: (job: PublicReferralJob) => void;
}) => (
  <Paper sx={{ p: 2.5 }} variant="outlined">
    <Stack spacing={1.5}>
      <Box>
        <Typography component="h3" fontWeight={700} variant="subtitle1">
          {job.jobTitle}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {job.companyName}
          {job.location ? ` · ${job.location}` : ''}
        </Typography>
      </Box>
      <Chip label={`Referred by ${job.referrerName}`} size="small" sx={{ alignSelf: 'flex-start' }} variant="outlined" />
      {typeof job.matchScore === 'number' ? (
        <Chip
          color={job.matchScore >= 85 ? 'success' : job.matchScore >= 65 ? 'info' : 'warning'}
          label={`${job.matchScore}% resume match`}
          size="small"
          sx={{ alignSelf: 'flex-start' }}
          variant="outlined"
        />
      ) : null}
      <Button
        fullWidth
        onClick={() => onSeeDetails(job)}
        startIcon={<LockOutlinedIcon fontSize="small" />}
        variant="contained"
      >
        See referrer details
      </Button>
    </Stack>
  </Paper>
);

const ContactRow = ({ icon, value }: { icon: React.ReactNode; value: string }) => (
  <Stack alignItems="center" direction="row" spacing={1}>
    {icon}
    <Typography variant="body2">{value}</Typography>
  </Stack>
);

export const ReferralJobsSection = () => {
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);
  const [page, setPage] = useState(1);
  const { data, isError, isLoading, refetch } = useGetPublicReferralJobsQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
  });

  const [triggerUnlock, unlockState] = useLazyUnlockReferralContactQuery();
  const [selectedJob, setSelectedJob] = useState<PublicReferralJob | null>(null);
  const [contact, setContact] = useState<ReferrerContactDetails | null>(null);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const handleSeeDetails = async (job: PublicReferralJob) => {
    setSelectedJob(job);
    setContact(null);
    setUnlockError(null);

    if (!currentUser) {
      void navigate(ROUTES.LOGIN, { state: { from: ROUTES.DASHBOARD_JOBS } });
      return;
    }

    const result = await triggerUnlock(job.jobId).unwrap().catch(() => null);
    if (!result) {
      setUnlockError('Something went wrong. Please try again.');
      return;
    }

    if (result.status === 'LoginRequired') {
      void navigate(ROUTES.LOGIN, { state: { from: ROUTES.DASHBOARD_JOBS } });
      return;
    }
    if (result.status === 'MembershipRequired') {
      setUnlockError(result.message);
      return;
    }
    setContact(result.contact);
  };

  if (isLoading) return <PageLoadingIndicator label="Loading referral jobs" />;
  if (isError) return <ErrorState onRetry={() => void refetch()} title="Referral jobs unavailable" />;
  if (!data?.items.length) {
    return (
      <EmptyState
        description="Ask a friend to refer you a job, or check back soon."
        title="No referral jobs yet"
      />
    );
  }

  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        {data.items.map((job) => (
          <Grid key={job.jobId} size={{ xs: 12, sm: 6, md: 4 }}>
            <ReferralJobCard job={job} onSeeDetails={(selected) => void handleSeeDetails(selected)} />
          </Grid>
        ))}
      </Grid>

      {data.totalPages > 1 ? (
        <Pagination
          count={data.totalPages}
          onChange={(_, value) => setPage(value)}
          page={page}
          sx={{ alignSelf: 'center' }}
        />
      ) : null}

      <Dialog onClose={() => setSelectedJob(null)} open={selectedJob !== null}>
        <DialogTitle>{selectedJob?.jobTitle}</DialogTitle>
        <DialogContent>
          {unlockState.isFetching ? (
            <Typography color="text.secondary" variant="body2">
              Checking access…
            </Typography>
          ) : unlockError ? (
            <Stack spacing={2}>
              <Alert severity="info">{unlockError}</Alert>
              <Button
                onClick={() => void navigate(ROUTES.MEMBERSHIP)}
                startIcon={<WorkspacePremiumOutlinedIcon />}
                variant="contained"
              >
                Subscribe — ₹299/month
              </Button>
            </Stack>
          ) : contact ? (
            <Stack spacing={1.5} sx={{ pt: 1 }}>
              <Typography fontWeight={700}>{contact.referrerName}</Typography>
              {contact.linkedInUrl ? (
                <ContactRow icon={<LinkedInIcon color="primary" fontSize="small" />} value={contact.linkedInUrl} />
              ) : null}
              {contact.email ? (
                <ContactRow icon={<EmailOutlinedIcon fontSize="small" />} value={contact.email} />
              ) : null}
              {contact.phoneNumber ? (
                <ContactRow icon={<PhoneOutlinedIcon fontSize="small" />} value={contact.phoneNumber} />
              ) : null}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedJob(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
