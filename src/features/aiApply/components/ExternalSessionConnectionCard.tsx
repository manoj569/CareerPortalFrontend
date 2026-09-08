/* eslint-disable @typescript-eslint/no-misused-promises */
import LinkOffOutlinedIcon from '@mui/icons-material/LinkOffOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import { Alert, Button, Card, CardContent, Chip, Skeleton, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';

import type { AxiosBaseQueryError } from '@/api/axiosBaseQuery';
import { ConfirmActionDialog } from '@/features/admin/components/ConfirmActionDialog';
import {
  useCancelExternalSessionCaptureMutation,
  useCompleteExternalSessionCaptureMutation,
  useGetExternalSessionQuery,
  useRevokeExternalSessionMutation,
  useStartExternalSessionCaptureMutation,
} from '../api/aiApplyApi';
import { SecureExternalSessionCapture } from './SecureExternalSessionCapture';
import { EXTERNAL_SESSION_INTERACTION_MODE } from '../services/externalSessionCaptureTransport';
import {
  ExternalJobSiteSessionStatus,
  ExternalSessionCaptureStatus,
  type ExternalSessionCapture,
  type ExternalSessionSite,
} from '../types/aiApplyModels';

interface ExternalSessionConnectionCardProps {
  displayName: string;
  site: ExternalSessionSite;
}

const unavailableCodes = new Set([
  'external_session_capture_unavailable',
  'external_sessions_disabled',
  'external_session_capture_disabled',
]);

const safeError = (error: unknown, fallback: string) => {
  const apiError = error as Partial<AxiosBaseQueryError> | undefined;
  if (apiError?.code && unavailableCodes.has(apiError.code)) {
    return 'Secure sign-in connection for this site is not available yet.';
  }
  if (apiError?.status === 429) return 'Too many attempts. Please wait before trying again.';
  if (apiError?.status === 403)
    return 'Your current AI Apply subscription does not allow this action.';
  if (apiError?.code === 'external_session_site_unsupported') {
    return 'This external site is not supported for secure connections.';
  }
  return apiError?.message || fallback;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );

const captureStatusLabel: Record<ExternalSessionCaptureStatus, string> = {
  [ExternalSessionCaptureStatus.Starting]: 'Starting',
  [ExternalSessionCaptureStatus.AwaitingCandidate]: 'Waiting for sign-in',
  [ExternalSessionCaptureStatus.Validating]: 'Validating',
  [ExternalSessionCaptureStatus.Completed]: 'Completed',
  [ExternalSessionCaptureStatus.Failed]: 'Connection failed',
  [ExternalSessionCaptureStatus.Expired]: 'Connection attempt expired',
  [ExternalSessionCaptureStatus.Cancelled]: 'Connection attempt cancelled',
};

export const ExternalSessionConnectionCard = ({
  displayName,
  site,
}: ExternalSessionConnectionCardProps) => {
  const sessionQuery = useGetExternalSessionQuery(site);
  const [startCapture, startState] = useStartExternalSessionCaptureMutation();
  const [cancelCapture, cancelState] = useCancelExternalSessionCaptureMutation();
  const [completeCapture] = useCompleteExternalSessionCaptureMutation();
  const [revoke, revokeState] = useRevokeExternalSessionMutation();
  const [capture, setCapture] = useState<ExternalSessionCapture | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const queryError = sessionQuery.error;
  const queryErrorStatus = queryError && 'status' in queryError ? queryError.status : undefined;
  const notConnected = queryErrorStatus === 404 || (!sessionQuery.data && !sessionQuery.isError);
  const session = sessionQuery.data;
  const reconnect = Boolean(
    session &&
    [
      ExternalJobSiteSessionStatus.RequiresReauthentication,
      ExternalJobSiteSessionStatus.Expired,
      ExternalJobSiteSessionStatus.Invalid,
    ].includes(session.status),
  );
  const connected = session?.status === ExternalJobSiteSessionStatus.Active;

  const begin = async (isReconnect: boolean) => {
    setActionError(null);
    setCapture(null);
    try {
      const result = await startCapture({ site, reconnect: isReconnect }).unwrap();
      setCapture(result);
      if (result.status === ExternalSessionCaptureStatus.Completed) void sessionQuery.refetch();
    } catch (error) {
      setActionError(safeError(error, 'Connection could not be started.'));
    }
  };

  const cancel = async () => {
    if (!capture) return;
    setActionError(null);
    try {
      await cancelCapture({ captureId: capture.captureId, site }).unwrap();
      setCapture(null);
      void sessionQuery.refetch();
    } catch (error) {
      setCapture(null);
      setActionError(safeError(error, 'The connection attempt could not be cancelled.'));
      void sessionQuery.refetch();
    }
  };

  const complete = async () => {
    if (!capture) throw new Error('Capture is unavailable.');
    setActionError(null);
    try {
      const result = await completeCapture({ captureId: capture.captureId, site }).unwrap();
      setCapture(result.capture);
      await sessionQuery.refetch();
      return result.capture;
    } catch (error) {
      setCapture(null);
      setActionError(safeError(error, 'Career Harbor could not confirm the connection.'));
      throw error;
    }
  };

  const disconnect = async () => {
    if (!session) return;
    setActionError(null);
    try {
      await revoke({ sessionId: session.id, site }).unwrap();
      setConfirmOpen(false);
      setCapture(null);
      await sessionQuery.refetch();
      enqueueSnackbar(`${displayName} disconnected.`, { variant: 'success' });
    } catch (error) {
      setActionError(safeError(error, 'The connection could not be revoked.'));
    }
  };

  return (
    <Card component="article" variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack alignItems="center" direction="row" justifyContent="space-between" gap={1}>
            <Stack alignItems="center" direction="row" gap={1}>
              {connected ? (
                <LinkOutlinedIcon color="success" />
              ) : (
                <LinkOffOutlinedIcon color="disabled" />
              )}
              <Typography component="h2" variant="h6">
                {displayName}
              </Typography>
            </Stack>
            {!sessionQuery.isLoading && (
              <Chip
                color={connected ? 'success' : reconnect ? 'warning' : 'default'}
                label={connected ? 'Connected' : reconnect ? 'Reconnect required' : 'Not connected'}
                size="small"
              />
            )}
          </Stack>

          {sessionQuery.isLoading ? (
            <Stack aria-label={`Loading ${displayName} connection`} role="status" spacing={1}>
              <Skeleton width="75%" />
              <Skeleton width="55%" />
            </Stack>
          ) : sessionQuery.isError && !notConnected ? (
            <Alert
              action={
                <Button color="inherit" onClick={() => void sessionQuery.refetch()}>
                  Retry
                </Button>
              }
              severity="error"
            >
              {safeError(sessionQuery.error, 'Connection status could not be loaded.')}
            </Alert>
          ) : connected && session ? (
            <Stack spacing={0.5}>
              <Typography color="text.secondary" variant="body2">
                Expires {formatDate(session.expiresAtUtc)}
              </Typography>
              {session.lastValidatedAtUtc && (
                <Typography color="text.secondary" variant="body2">
                  Last validated {formatDate(session.lastValidatedAtUtc)}
                </Typography>
              )}
            </Stack>
          ) : reconnect ? (
            <Typography color="text.secondary">
              This connection is no longer valid. Reconnect securely to use it again.
            </Typography>
          ) : (
            <Typography color="text.secondary">
              Connect when secure sign-in is supported for this site.
            </Typography>
          )}

          {capture?.interactionAvailable &&
          capture.interactionMode === EXTERNAL_SESSION_INTERACTION_MODE &&
          ![
            ExternalSessionCaptureStatus.Completed,
            ExternalSessionCaptureStatus.Failed,
            ExternalSessionCaptureStatus.Expired,
            ExternalSessionCaptureStatus.Cancelled,
          ].includes(capture.status) ? (
            <SecureExternalSessionCapture
              capture={capture}
              onCancel={cancel}
              onComplete={complete}
            />
          ) : capture ? (
            <Alert severity={capture.interactionAvailable ? 'info' : 'warning'} aria-live="polite">
              <Typography fontWeight={700}>{captureStatusLabel[capture.status]}</Typography>
              {capture.interactionAvailable
                ? 'This secure interaction mode is not supported by this Career Harbor interface.'
                : capture.message ||
                  'Secure sign-in connection for this site is not available yet.'}
            </Alert>
          ) : null}
          {actionError && (
            <Alert severity="error" aria-live="assertive">
              {actionError}
            </Alert>
          )}

          {!sessionQuery.isLoading && (!sessionQuery.isError || notConnected) && (
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              {!connected && (
                <Button
                  disabled={startState.isLoading}
                  onClick={() => begin(reconnect)}
                  variant="contained"
                >
                  {startState.isLoading ? 'Starting…' : reconnect ? 'Reconnect' : 'Connect'}
                </Button>
              )}
              {connected && session?.canRevoke && (
                <Button
                  color="error"
                  disabled={revokeState.isLoading}
                  onClick={() => setConfirmOpen(true)}
                  variant="outlined"
                >
                  Disconnect
                </Button>
              )}
              {capture &&
                ![
                  ExternalSessionCaptureStatus.Completed,
                  ExternalSessionCaptureStatus.Failed,
                  ExternalSessionCaptureStatus.Expired,
                  ExternalSessionCaptureStatus.Cancelled,
                ].includes(capture.status) && (
                  <Button disabled={cancelState.isLoading} onClick={cancel}>
                    {cancelState.isLoading ? 'Cancelling…' : 'Cancel connection attempt'}
                  </Button>
                )}
            </Stack>
          )}
        </Stack>
      </CardContent>
      <ConfirmActionDialog
        actionLabel="Disconnect"
        description={`Career Harbor will revoke the saved ${displayName} session. This does not remove any AI Apply history.`}
        error={revokeState.isError ? actionError : null}
        isProcessing={revokeState.isLoading}
        onClose={() => setConfirmOpen(false)}
        onConfirm={disconnect}
        open={confirmOpen}
        title={`Disconnect ${displayName}?`}
      />
    </Card>
  );
};
