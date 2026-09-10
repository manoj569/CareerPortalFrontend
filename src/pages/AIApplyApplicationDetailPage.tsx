import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
/* eslint-disable @typescript-eslint/no-misused-promises */
import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { ErrorState } from '@/components/feedback/ErrorState';

import { buildAIApplyQuestionDetailsPath, ROUTES } from '@/constants/routes';
import { AIApplySectionNavigation } from '@/features/aiApply/components/AIApplySectionNavigation';
import { AIApplyHandoffCard } from '@/features/aiApply/components/AIApplyHandoffCard';
import {
  useCancelAIApplyApplicationMutation,
  useContinueAIApplyApplicationMutation,
  useGetAIApplyApplicationQuery,
  useGetAIApplyQuestionsQuery,
} from '@/features/aiApply/api/aiApplyApi';
import { AIApplyQuestionStatus } from '@/features/aiApply/types/aiApplyModels';
import {
  canCancelAIApplyApplication,
  getAIApplyFailureMessage,
  getAIApplyStatus,
  isActiveAIApplyStatus,
} from '@/features/aiApply/utils/aiApplyStatus';
import { getAIApplyAttentionKind } from '@/features/aiApply/utils/aiApplyActions';

const DateRow = ({ label, value }: { label: string; value: string | null }) =>
  value ? (
    <Stack direction="row" justifyContent="space-between" gap={2}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography>{new Date(value).toLocaleString()}</Typography>
    </Stack>
  ) : null;

export const AIApplyApplicationDetailPage = () => {
  const { id = '' } = useParams();
  const query = useGetAIApplyApplicationQuery(id);
  const questions = useGetAIApplyQuestionsQuery(AIApplyQuestionStatus.Pending);
  const [cancel, cancelState] = useCancelAIApplyApplicationMutation();
  const [continueApplication, continueState] = useContinueAIApplyApplicationMutation();
  const [confirm, setConfirm] = useState(false);
  const [continueError, setContinueError] = useState<string | null>(null);
  const applicationData = query.data;
  const refetch = query.refetch;
  useEffect(() => {
    if (!applicationData || !isActiveAIApplyStatus(applicationData.status)) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) void refetch();
    }, 20000);
    return () => window.clearInterval(timer);
  }, [applicationData, refetch]);
  useEffect(() => {
    const refresh = () => {
      if (!document.hidden) void refetch();
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [refetch]);
  if (query.isLoading) return <PageLoadingIndicator label="Loading application details…" />;
  if (query.isError || !query.data)
    return (
      <ErrorState
        title="Application not found"
        description="This application could not be found or is not available to your account."
        onRetry={query.refetch}
      />
    );
  const application = query.data;
  const pendingQuestion = questions.data?.find((item) => item.applicationId === application.id);
  const attentionKind = getAIApplyAttentionKind(application);
  const display = getAIApplyStatus(application.status);
  const failure = getAIApplyFailureMessage(application.failureKind);
  const handleContinue = async () => {
    setContinueError(null);
    try {
      await continueApplication(application.id).unwrap();
      await Promise.all([query.refetch(), questions.refetch()]);
    } catch (error) {
      await Promise.all([query.refetch(), questions.refetch()]);
      const safeMessage =
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : 'This application could not be continued. Its current status has been refreshed.';
      setContinueError(safeMessage);
    }
  };
  return (
    <Stack spacing={3} sx={{ maxWidth: 900, mx: 'auto', pb: 6 }}>
      <Box>
        <Button component={Link} to={ROUTES.AI_APPLY_APPLICATIONS}>
          Back to applications
        </Button>
        <Typography component="h1" variant="h3">
          {application.jobTitle ?? 'Application details'}
        </Typography>
        {application.companyName ? (
          <Typography color="text.secondary">{application.companyName}</Typography>
        ) : null}
      </Box>
      <AIApplySectionNavigation />
      {application.progressState === 'Submitted' ? (
        <Alert severity="success">
          <Typography fontWeight={850} variant="h5">Application submitted</Typography>
          <Typography>Career Harbor confirmed this submission.</Typography>
          <Typography variant="body2">Method: AI Apply</Typography>
        </Alert>
      ) : null}
      {['login', 'verification', 'review'].includes(attentionKind) && (
        <AIApplyHandoffCard
          application={application}
          continueError={continueError}
          continuing={continueState.isLoading}
          detailed
          onContinue={() => void handleContinue()}
        />
      )}
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
              <Typography variant="h4">Current progress</Typography>
              <Chip
                color={application.progressState === 'Submitted' ? 'success' : 'primary'}
                label={application.progressState}
                variant="outlined"
              />
            </Stack>
            <Alert severity={display.tone === 'default' ? 'info' : display.tone}>
              {display.description}
            </Alert>
            {failure && !['login', 'verification', 'review'].includes(attentionKind) && (
              <Alert severity="warning">{failure}</Alert>
            )}
            {attentionKind === 'expired' && (
              <Alert severity="info">
                This job is no longer accepting applications. No retry is available.
              </Alert>
            )}
            {attentionKind === 'duplicate' && (
              <Alert severity="info">
                Already applied. Career Harbor will not submit this application again.
              </Alert>
            )}
            {application.requiresUserInput && pendingQuestion && (
              <Alert
                severity="warning"
                action={
                  <Button component={Link} to={buildAIApplyQuestionDetailsPath(pendingQuestion.id)}>
                    Answer question
                  </Button>
                }
              >
                Your input is required before this application can continue.
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="h5">Application summary</Typography>
            <DateRow label="Queued at" value={application.scheduledAtUtc} />
            <DateRow label="Started at" value={application.startedAtUtc} />
            <DateRow label="Submitted at" value={application.submittedAtUtc} />
            <DateRow label="Updated at" value={application.updatedAtUtc} />
            <DateRow label="Created at" value={application.createdAtUtc} />
            {application.resumeUsed ? (
              <Stack direction="row" justifyContent="space-between" gap={2}>
                <Typography color="text.secondary">Resume used</Typography>
                <Typography>{application.resumeUsed.fileName}</Typography>
              </Stack>
            ) : null}
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Attempts</Typography>
              <Typography>{application.retryCount + 1}</Typography>
            </Stack>
            {application.matchScore !== null && (
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Match score</Typography>
                <Typography>{application.matchScore}</Typography>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
      {(application.actions
        ? application.actions.canCancel
        : canCancelAIApplyApplication(application.status)) && (
        <Button color="error" variant="outlined" onClick={() => setConfirm(true)}>
          Cancel application
        </Button>
      )}
      <Dialog open={confirm} onClose={() => !cancelState.isLoading && setConfirm(false)}>
        <DialogTitle>Cancel this application?</DialogTitle>
        <DialogContent>
          <Typography>
            Career Harbor will stop processing this application if it has not already been
            submitted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(false)}>Keep application</Button>
          <Button
            color="error"
            variant="contained"
            disabled={cancelState.isLoading}
            onClick={() =>
              void cancel(application.id)
                .unwrap()
                .then(() => setConfirm(false))
            }
          >
            Cancel application
          </Button>
        </DialogActions>
      </Dialog>
      {isActiveAIApplyStatus(application.status) && (
        <Typography aria-live="polite" variant="caption" color="text.secondary">
          This status refreshes automatically while processing is active.
        </Typography>
      )}
    </Stack>
  );
};
