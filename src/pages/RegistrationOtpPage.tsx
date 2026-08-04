import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Alert, Box, Button, Link as MuiLink, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { AuthPageHeader } from '@/features/auth/components/AuthPageHeader';
import { OtpInput } from '@/features/auth/components/OtpInput';
import { useOtpCooldown } from '@/features/auth/hooks/useOtpCooldown';
import {
  getAuthenticationErrorMessage,
  getRetryAfterSeconds,
} from '@/features/auth/services/authErrorMapper';
import { authService } from '@/features/auth/services/authService';
import {
  registrationChallengeStore,
  type RegistrationChallengeState,
} from '@/features/auth/services/registrationChallengeStore';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const isChallengeState = (value: unknown): value is RegistrationChallengeState => {
  if (!value || typeof value !== 'object') return false;
  const state = value as Partial<RegistrationChallengeState>;
  return Boolean(state.challengeId && state.maskedPhoneNumber && state.expiresAtUtc);
};

export const RegistrationOtpPage = () => {
  useDocumentMetadata(
    'Verify your mobile number | Career Portal',
    'Verify your Career Portal registration using the code sent to your mobile number.',
  );
  const location = useLocation();
  const navigate = useNavigate();
  const challenge = useMemo(() => {
    const routeState: unknown = location.state;
    return isChallengeState(routeState) ? routeState : registrationChallengeStore.get();
  }, [location.state]);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { restart, secondsRemaining } = useOtpCooldown(challenge ? 60 : 0);

  useEffect(() => {
    if (!isVerified) return;
    registrationChallengeStore.clear();
    const timer = window.setTimeout(() => {
      void navigate(ROUTES.LOGIN, {
        replace: true,
        state: { message: 'Registration successful. You can now log in.' },
      });
    }, 5_000);
    return () => window.clearTimeout(timer);
  }, [isVerified, navigate]);

  if (!challenge) {
    return (
      <Stack spacing={3}>
        <AuthPageHeader
          description="Your registration verification session is unavailable or has expired."
          title="Verify your mobile number"
        />
        <Alert aria-live="assertive" severity="warning">
          Start registration again so we can send a new verification code. No verification was
          attempted.
        </Alert>
        <Button component={Link} to={ROUTES.REGISTER} variant="contained">
          Back to Register
        </Button>
      </Stack>
    );
  }

  const verify = async () => {
    if (otp.length !== 6 || isVerifying) return;
    setIsVerifying(true);
    setErrorMessage(null);
    setFeedback(null);
    try {
      await authService.verifyRegistrationOtp({ challengeId: challenge.challengeId, otp });
      setIsVerified(true);
      setOtp('');
    } catch (error: unknown) {
      setErrorMessage(getAuthenticationErrorMessage(error));
      const retryAfter = getRetryAfterSeconds(error);
      if (retryAfter) restart(retryAfter);
    } finally {
      setIsVerifying(false);
    }
  };

  const resend = async () => {
    if (secondsRemaining > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage(null);
    setFeedback(null);
    try {
      await authService.resendRegistrationOtp({ challengeId: challenge.challengeId });
      restart(60);
      setOtp('');
      setFeedback('If registration can proceed, a new verification code has been sent.');
    } catch (error: unknown) {
      setErrorMessage(getAuthenticationErrorMessage(error));
      restart(getRetryAfterSeconds(error) ?? 60);
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <Stack alignItems="center" aria-live="polite" spacing={3} textAlign="center">
        <CheckCircleIcon color="success" sx={{ fontSize: 72 }} />
        <Typography component="h1" variant="h1">
          Registration successful
        </Typography>
        <Typography color="text.secondary">
          Your mobile number is verified. Redirecting you to login...
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <AuthPageHeader
        description={`Enter the six-digit code sent to ${challenge.maskedPhoneNumber}.`}
        title="Verify your mobile number"
      />
      {errorMessage ? (
        <Alert aria-live="assertive" id="registration-otp-error" severity="error">
          {errorMessage}
        </Alert>
      ) : null}
      {feedback ? (
        <Alert aria-live="polite" severity="success">
          {feedback}
        </Alert>
      ) : null}
      <Box>
        <OtpInput
          autoFocus
          describedBy={errorMessage ? 'registration-otp-error' : undefined}
          disabled={isVerifying}
          hasError={Boolean(errorMessage)}
          onChange={(value) => {
            setOtp(value);
            setErrorMessage(null);
          }}
          value={otp}
        />
      </Box>
      <Button
        disabled={otp.length !== 6 || isVerifying}
        onClick={() => void verify()}
        variant="contained"
      >
        {isVerifying ? 'Verifying…' : 'Verify mobile number'}
      </Button>
      <Button
        aria-live={secondsRemaining > 0 ? 'polite' : undefined}
        disabled={secondsRemaining > 0 || isResending}
        onClick={() => void resend()}
        variant="text"
      >
        {isResending
          ? 'Sending…'
          : secondsRemaining > 0
            ? `Resend code in ${secondsRemaining}s`
            : 'Resend code'}
      </Button>
      <Typography color="text.secondary" textAlign="center" variant="body2">
        Need to change your details?{' '}
        <MuiLink component={Link} to={ROUTES.REGISTER}>
          Register again
        </MuiLink>
      </Typography>
    </Stack>
  );
};
