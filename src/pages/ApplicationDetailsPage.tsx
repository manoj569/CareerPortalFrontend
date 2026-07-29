import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { buildJobDetailsPath, ROUTES } from '@/constants/routes';
import {
  isDashboardApiError,
  useGetApplicationQuery,
  useWithdrawApplicationMutation,
} from '@/features/dashboard/api/dashboardApi';
import { ApplicationStatusChip } from '@/features/dashboard/components/ApplicationStatusChip';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import {
  canWithdrawApplication,
  formatDashboardDate,
} from '@/features/dashboard/utils/dashboardFormatting';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const ApplicationDetailsPage = () => {
  const { applicationId = '' } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const application = useGetApplicationQuery(applicationId, { skip: !applicationId });
  const [withdrawApplication, withdrawState] = useWithdrawApplicationMutation();
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  useDocumentMetadata(
    application.data
      ? `${application.data.jobTitle} application | Career Portal`
      : 'Application details | Career Portal',
    'Review the status and submitted information for your job application.',
  );

  const handleWithdraw = async () => {
    if (!application.data || !canWithdrawApplication(application.data.status)) return;
    setWithdrawError(null);
    try {
      await withdrawApplication(application.data.id).unwrap();
      setConfirmWithdraw(false);
      enqueueSnackbar('Application withdrawn.', { variant: 'success' });
    } catch (error: unknown) {
      setWithdrawError(
        isDashboardApiError(error)
          ? error.message
          : 'Unable to withdraw this application. Please try again.',
      );
    }
  };

  if (application.isLoading) {
    return (
      <Stack aria-label="Loading application details" role="status" spacing={3}>
        <Skeleton height={76} variant="rounded" />
        <Skeleton height={360} variant="rounded" />
      </Stack>
    );
  }

  if (
    application.isError &&
    isDashboardApiError(application.error) &&
    application.error.status === 404
  ) {
    return (
      <EmptyState
        actionLabel="View applications"
        description="This application does not exist or is not associated with your account."
        onAction={() => void navigate(ROUTES.APPLICATIONS)}
        title="Application not found"
      />
    );
  }

  if (application.isError || !application.data) {
    return <ErrorState headingLevel="h1" onRetry={() => void application.refetch()} />;
  }

  const item = application.data;
  const canWithdraw = canWithdrawApplication(item.status);

  return (
    <Stack spacing={4}>
      <Button
        component={Link}
        startIcon={<ArrowBackIcon />}
        sx={{ alignSelf: 'flex-start' }}
        to={ROUTES.APPLICATIONS}
      >
        Back to applications
      </Button>

      <DashboardPageHeader
        actions={<ApplicationStatusChip status={item.status} />}
        description={`${item.companyName} · submitted ${
          formatDashboardDate(item.submittedAtUtc) ?? 'date unavailable'
        }`}
        eyebrow="Application details"
        title={item.jobTitle}
      />

      {withdrawError ? (
        <Alert aria-live="assertive" severity="error">
          {withdrawError}
        </Alert>
      ) : null}

      <Paper component="section" sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Stack spacing={0.5}>
            <Typography component="h2" variant="h3">
              Submitted information
            </Typography>
            <Typography color="text.secondary">
              Resume: {item.resumeFileName ?? 'No resume was attached'}
            </Typography>
          </Stack>
          <Divider />
          <Stack spacing={1}>
            <Typography component="h2" variant="h3">
              Cover letter
            </Typography>
            <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
              {item.coverLetter ?? 'No cover letter was included.'}
            </Typography>
          </Stack>
          {item.withdrawnAtUtc ? (
            <Alert severity="info">
              Withdrawn {formatDashboardDate(item.withdrawnAtUtc) ?? 'date unavailable'}
            </Alert>
          ) : null}
          <Stack alignItems="flex-start" direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button component={Link} to={buildJobDetailsPath(item.jobSlug)} variant="outlined">
              View public job
            </Button>
            {canWithdraw ? (
              <Button
                color="error"
                disabled={withdrawState.isLoading}
                onClick={() => setConfirmWithdraw(true)}
              >
                Withdraw application
              </Button>
            ) : (
              <Typography color="text.secondary" variant="body2">
                Only Submitted applications can be withdrawn.
              </Typography>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Dialog
        aria-describedby="withdraw-application-description"
        aria-labelledby="withdraw-application-title"
        onClose={() => !withdrawState.isLoading && setConfirmWithdraw(false)}
        open={confirmWithdraw}
      >
        <DialogTitle id="withdraw-application-title">Withdraw application?</DialogTitle>
        <DialogContent>
          <Typography id="withdraw-application-description">
            This action cannot be reversed. The employer will see the application as withdrawn.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button disabled={withdrawState.isLoading} onClick={() => setConfirmWithdraw(false)}>
            Keep application
          </Button>
          <Button
            color="error"
            disabled={withdrawState.isLoading}
            onClick={() => void handleWithdraw()}
            variant="contained"
          >
            {withdrawState.isLoading ? 'Withdrawing…' : 'Confirm withdrawal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
