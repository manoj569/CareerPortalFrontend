import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { Alert, Button, Snackbar } from '@mui/material';
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
  label?: string;
  loadApplicationUrl?: () => Promise<string | null | undefined>;
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
  label = 'Apply on company site',
  loadApplicationUrl,
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
  const safeApplicationUrl = getSafeExternalUrl(applicationUrl);
  const isAdministrator = user?.role === UserRole.Administrator;
  const isPending = isResolvingUrl || submitState.isLoading;

  const apply = async () => {
    if (!isAuthenticated) {
      await navigate(ROUTES.LOGIN, { state: { from: location } });
      return;
    }

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
      let destinationUrl = safeApplicationUrl;
      if (!destinationUrl && loadApplicationUrl) {
        setIsResolvingUrl(true);
        destinationUrl = getSafeExternalUrl(await loadApplicationUrl());
        setIsResolvingUrl(false);
      }

      if (!destinationUrl) {
        setFeedback({
          message: 'Application link is unavailable for this job.',
          severity: 'error',
        });
        return;
      }

      await submitApplication({ coverLetter: null, jobId }).unwrap();
      window.open(destinationUrl, '_blank', 'noopener,noreferrer');
      setFeedback({ message: APPLICATION_OPENED_MESSAGE, severity: 'info' });
    } catch (error: unknown) {
      setIsResolvingUrl(false);
      const failure = getApplicationFailure(error);
      if (failure.kind === 'membership') {
        await navigate(buildMembershipPath(jobSlug));
        return;
      }
      setFeedback({ message: failure.message, severity: 'error' });
    }
  };

  return (
    <>
      <Button
        aria-describedby={ariaDescribedBy}
        disabled={(!safeApplicationUrl && !loadApplicationUrl) || isAdministrator || isPending}
        endIcon={<OpenInNewOutlinedIcon />}
        onClick={() => void apply()}
        size={size}
        variant="contained"
      >
        {isPending ? 'Processing application…' : label}
      </Button>
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
