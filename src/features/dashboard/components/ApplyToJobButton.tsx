import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/store/authSlice';
import { buildMembershipPath } from '@/features/payments/utils/paymentReturnUrl';
import { useAppSelector } from '@/hooks/reduxHooks';
import { UserRole } from '@/types';
import { getSafeExternalUrl } from '@/utils/safeExternalUrl';
import { useGetApplicationQuotaQuery, useSubmitApplicationMutation } from '../api/dashboardApi';
import {
  getApplicationFailure,
  PREMIUM_DAILY_LIMIT_MESSAGE,
} from '../utils/applicationError';

const APPLICATION_OPENED_MESSAGE = 'Opening the employer’s official application page in a new tab.';

interface ApplyToJobButtonProps {
  applicationUrl: string | null | undefined;
  ariaDescribedBy?: string;
  jobId: string;
  jobSlug: string;
  companyName?: string;
  jobTitle?: string;
  label?: string;
  loadApplicationUrl?: () => Promise<string | null | undefined>;
  onApplied?: (jobId: string) => void;
  size?: 'medium' | 'large' | 'small';
}

interface Feedback {
  message: string;
  severity: 'error' | 'info';
}

export const ApplyToJobButton = ({
  applicationUrl,
  ariaDescribedBy,
  jobId,
  jobSlug,
  companyName,
  jobTitle,
  label = 'Apply on company site',
  loadApplicationUrl,
  onApplied,
  size = 'large',
}: ApplyToJobButtonProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const [submitApplication, submitState] = useSubmitApplicationMutation();
  const quota = useGetApplicationQuotaQuery(undefined, {
    skip: !isAuthenticated || user?.role !== UserRole.Candidate,
  });
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const safeApplicationUrl = getSafeExternalUrl(applicationUrl);
  const isAdministrator = user?.role === UserRole.Administrator;
  const isPending = isResolvingUrl || submitState.isLoading;

  const requestApply = async () => {
    if (!isAuthenticated) {
      await navigate(ROUTES.LOGIN, { state: { from: location } });
      return;
    }

    if (isAdministrator || isPending) return;

    setConfirmOpen(true);
  };

  const apply = async () => {
    if (isAdministrator || isPending) return;

    setFeedback(null);
    if (quota.data && quota.data.remainingApplications <= 0) {
      if (quota.data.isPremium) {
        setFeedback({ message: PREMIUM_DAILY_LIMIT_MESSAGE, severity: 'error' });
      } else {
        await navigate(buildMembershipPath(jobSlug));
      }
      return;
    }

    try {
      let rawDestinationUrl = applicationUrl;
      if (!rawDestinationUrl && loadApplicationUrl) {
        setIsResolvingUrl(true);
        rawDestinationUrl = await loadApplicationUrl();
        setIsResolvingUrl(false);
      }

      const destinationUrl = getSafeExternalUrl(rawDestinationUrl);
      if (rawDestinationUrl?.trim() && !destinationUrl) {
        setFeedback({
          message: 'Application link is unavailable for this job.',
          severity: 'error',
        });
        return;
      }

      await submitApplication({
        applicationMethod: destinationUrl ? 'External' : 'Portal',
        jobId,
      }).unwrap();
      setIsApplied(true);
      setConfirmOpen(false);
      onApplied?.(jobId);
      if (destinationUrl) {
        window.open(destinationUrl, '_blank', 'noopener,noreferrer');
        setFeedback({ message: APPLICATION_OPENED_MESSAGE, severity: 'info' });
      } else {
        setFeedback({
          message: 'Application submitted. This job is now in Applied jobs.',
          severity: 'info',
        });
      }
    } catch (error: unknown) {
      setIsResolvingUrl(false);
      const failure = getApplicationFailure(error);
      if (failure.kind === 'membership') {
        await navigate(buildMembershipPath(jobSlug));
        return;
      }
      if (failure.kind === 'duplicate') {
        setIsApplied(true);
        onApplied?.(jobId);
        setFeedback({ message: failure.message, severity: 'info' });
        return;
      }
      setFeedback({ message: failure.message, severity: 'error' });
    }
  };

  return (
    <>
      <Button
        aria-describedby={ariaDescribedBy}
        disabled={isAdministrator || isPending || isApplied}
        endIcon={isApplied ? <CheckOutlinedIcon /> : safeApplicationUrl ? <OpenInNewOutlinedIcon /> : undefined}
        onClick={() => void requestApply()}
        size={size}
        variant="contained"
      >
        {isApplied ? 'Applied' : isPending ? 'Processing application…' : label}
      </Button>
      <Dialog
        aria-describedby="manual-apply-description"
        aria-labelledby="manual-apply-title"
        fullWidth
        maxWidth="sm"
        onClose={() => !isPending && setConfirmOpen(false)}
        open={confirmOpen}
        PaperProps={{ sx: { borderRadius: { xs: '20px 20px 0 0', sm: 3 }, bottom: { xs: 0, sm: 'auto' }, m: { xs: 0, sm: 2 }, position: { xs: 'fixed', sm: 'relative' }, width: { xs: '100%', sm: 'calc(100% - 32px)' } } }}
      >
        <DialogTitle id="manual-apply-title">Apply on company website</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Stack spacing={0.25}>
              <Typography color="text.secondary" variant="caption">Job</Typography>
              <Typography fontWeight={750}>{jobTitle ?? 'Selected job'}</Typography>
              <Typography color="text.secondary" variant="caption" sx={{ mt: 1 }}>Company</Typography>
              <Typography fontWeight={750}>{companyName ?? 'Employer'}</Typography>
            </Stack>
            <Typography id="manual-apply-description">
              You&apos;ll continue to the employer&apos;s application website.
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Career Harbor can track this application where supported.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ flexDirection: { xs: 'column-reverse', sm: 'row' }, px: 3, pb: 3 }}>
          <Button disabled={isPending} fullWidth onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button disabled={isPending} fullWidth onClick={() => void apply()} variant="contained">
            {isPending ? 'Opening…' : 'Continue to company website'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        autoHideDuration={10_000}
        onClose={() => setFeedback(null)}
        open={Boolean(feedback)}
      >
        <Alert
          aria-live={feedback?.severity === 'error' ? 'assertive' : 'polite'}
          onClose={() => setFeedback(null)}
          severity={feedback?.severity ?? 'info'}
          variant="filled"
        >
          {feedback?.message}
        </Alert>
      </Snackbar>
    </>
  );
};
