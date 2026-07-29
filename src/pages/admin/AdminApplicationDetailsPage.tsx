import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import {
  Alert,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import {
  downloadAdminApplicationResume,
  isAdminApiError,
  useGetAdminApplicationQuery,
  useUpdateAdminApplicationStatusMutation,
} from '@/features/admin/api/adminApi';
import {
  AdminApplicationStatus,
  type AdminApplicationDetail,
} from '@/features/admin/types/adminModels';
import { formatAdminDate } from '@/features/admin/utils/adminFormatting';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { isGuid } from '@/features/payments/utils/paymentReturnUrl';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const allowedTransitions = [
  AdminApplicationStatus.Reviewed,
  AdminApplicationStatus.Shortlisted,
  AdminApplicationStatus.Rejected,
];

export const AdminApplicationDetailsPage = () => {
  const { applicationId = '' } = useParams<{ applicationId: string }>();
  useDocumentMetadata(
    'Application review | Career Portal',
    'Review a Candidate application as an Administrator.',
  );
  const application = useGetAdminApplicationQuery(applicationId, {
    skip: !isGuid(applicationId),
  });
  const [selectedStatus, setSelectedStatus] = useState<AdminApplicationStatus | null>(null);
  const [internalNote, setInternalNote] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [isDownloadingResume, setIsDownloadingResume] = useState(false);
  const [updateStatus, updateState] = useUpdateAdminApplicationStatusMutation();

  if (application.isLoading) {
    return (
      <Skeleton
        aria-label="Loading application review"
        height={700}
        role="status"
        variant="rounded"
      />
    );
  }
  if (!isGuid(applicationId) || application.isError || !application.data) {
    return (
      <ErrorState
        headingLevel="h1"
        onRetry={() => void application.refetch()}
        title="Application unavailable"
      />
    );
  }

  const data: AdminApplicationDetail = application.data;
  const finalOrWithdrawn =
    data.status === AdminApplicationStatus.Rejected ||
    data.status === AdminApplicationStatus.Withdrawn;

  const submitStatus = async () => {
    if (!selectedStatus || updateState.isLoading || finalOrWithdrawn) return;
    setActionError(null);
    try {
      await updateStatus({
        applicationId,
        request: {
          internalNote: internalNote.trim() || null,
          status: selectedStatus,
        },
      }).unwrap();
      enqueueSnackbar('Application status updated successfully.', { variant: 'success' });
      setInternalNote('');
      setSelectedStatus(null);
    } catch (error: unknown) {
      setActionError(
        isAdminApiError(error) && error.status === 409
          ? 'This application changed or reached a final/withdrawn state. Refresh before taking another action.'
          : isAdminApiError(error)
            ? error.message
            : 'The application status could not be updated.',
      );
    }
  };

  const download = async () => {
    setIsDownloadingResume(true);
    try {
      const blob = await downloadAdminApplicationResume(applicationId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = data.resumeFileName ?? 'candidate-resume';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setActionError('The secure resume download could not be completed.');
    } finally {
      setIsDownloadingResume(false);
    }
  };

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        actions={
          data.hasResume ? (
            <Button
              disabled={isDownloadingResume}
              onClick={() => void download()}
              startIcon={<DownloadOutlinedIcon />}
              variant="outlined"
            >
              {isDownloadingResume ? 'Downloading…' : 'Download resume'}
            </Button>
          ) : null
        }
        description={`${data.job.title} · ${data.job.companyName}`}
        eyebrow="Application review"
        title={`${data.candidate.firstName} ${data.candidate.lastName}`}
      />
      {actionError ? (
        <Alert aria-live="assertive" severity="error">
          {actionError}
        </Alert>
      ) : null}
      {finalOrWithdrawn ? (
        <Alert severity="warning">
          This application is {AdminApplicationStatus[data.status].toLowerCase()} and no further
          review actions are available.
        </Alert>
      ) : null}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={3}>
            <Paper component="section" sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Typography component="h2" variant="h3">
                  Candidate profile
                </Typography>
                <Typography>{data.candidate.email}</Typography>
                <Typography>{data.candidate.headline ?? 'No headline provided.'}</Typography>
                <Typography color="text.secondary">
                  {data.candidate.location ?? 'Location not provided'}
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {data.candidate.skills.map((skill) => (
                    <Chip key={skill} label={skill} size="small" />
                  ))}
                </Stack>
                <Typography sx={{ whiteSpace: 'pre-line' }}>
                  {data.candidate.bio ?? 'No biography provided.'}
                </Typography>
              </Stack>
            </Paper>
            <Paper component="section" sx={{ p: 3 }}>
              <Typography component="h2" sx={{ mb: 2 }} variant="h3">
                Cover letter
              </Typography>
              <Typography sx={{ whiteSpace: 'pre-line' }}>
                {data.coverLetter ?? 'No cover letter was submitted.'}
              </Typography>
            </Paper>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper component="aside" sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography component="h2" variant="h3">
                Review decision
              </Typography>
              <Typography>
                Current status: <strong>{AdminApplicationStatus[data.status]}</strong>
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {allowedTransitions.map((status) => (
                  <Button
                    disabled={finalOrWithdrawn}
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    variant={selectedStatus === status ? 'contained' : 'outlined'}
                  >
                    {AdminApplicationStatus[status]}
                  </Button>
                ))}
              </Stack>
              <TextField
                disabled={finalOrWithdrawn}
                helperText={`${internalNote.length} / 2,000 · Private Administrator note; never shown to Candidates.`}
                inputProps={{ maxLength: 2000 }}
                label="Internal note"
                minRows={4}
                multiline
                onChange={(event) => setInternalNote(event.target.value)}
                value={internalNote}
              />
              <Button
                disabled={!selectedStatus || updateState.isLoading || finalOrWithdrawn}
                onClick={() => void submitStatus()}
                variant="contained"
              >
                {updateState.isLoading ? 'Updating…' : 'Update status'}
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      <Paper component="section" sx={{ p: 3 }}>
        <Typography component="h2" sx={{ mb: 2 }} variant="h3">
          Status history
        </Typography>
        <Stack divider={<Divider flexItem />} spacing={2}>
          {data.statusHistory.length ? (
            data.statusHistory.map((history) => (
              <Stack key={history.id} spacing={0.5}>
                <Typography fontWeight={700}>
                  {AdminApplicationStatus[history.newStatus]} · {history.actorName}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {formatAdminDate(history.changedAtUtc)}
                </Typography>
                {history.internalNote ? (
                  <Alert severity="info">
                    <strong>Private internal note:</strong> {history.internalNote}
                  </Alert>
                ) : null}
              </Stack>
            ))
          ) : (
            <Typography color="text.secondary">No status changes have been recorded.</Typography>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};
