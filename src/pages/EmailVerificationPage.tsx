import { Alert, Button, Stack } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { ApiRequestError } from '@/api/apiError';
import { ROUTES } from '@/constants/routes';
import { AuthPageHeader } from '@/features/auth/components/AuthPageHeader';
import { ResendVerificationAction } from '@/features/auth/components/ResendVerificationAction';
import {
  getAuthenticationErrorMessage,
  INVALID_VERIFICATION_LINK_MESSAGE,
} from '@/features/auth/services/authErrorMapper';
import { authService } from '@/features/auth/services/authService';

type VerificationState = 'invalid' | 'loading' | 'success' | 'retry';

const isValidEmail = (email: string): boolean =>
  email.length <= 256 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email')?.trim() ?? '';
  const token = searchParams.get('token') ?? '';
  const hasValidParameters = isValidEmail(email) && token.trim().length > 0 && token.length <= 256;
  const [state, setState] = useState<VerificationState>(hasValidParameters ? 'loading' : 'invalid');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasStartedVerification = useRef(false);

  const verifyEmail = useCallback(async () => {
    if (!hasValidParameters) {
      setState('invalid');
      return;
    }

    setState('loading');
    setErrorMessage(null);
    try {
      await authService.verifyEmail({ email, token });
      setState('success');
    } catch (error: unknown) {
      if (
        error instanceof ApiRequestError &&
        (error.code === 'invalid_verification_token' || error.status === 400)
      ) {
        setErrorMessage(INVALID_VERIFICATION_LINK_MESSAGE);
        setState('invalid');
        return;
      }

      setErrorMessage(getAuthenticationErrorMessage(error));
      setState('retry');
    }
  }, [email, hasValidParameters, token]);

  useEffect(() => {
    if (hasStartedVerification.current) return;
    hasStartedVerification.current = true;
    void verifyEmail();
  }, [verifyEmail]);

  return (
    <Stack spacing={3}>
      <AuthPageHeader
        description="Confirming your email address keeps your Career Portal account secure."
        title="Email verification"
      />

      {state === 'loading' ? (
        <Alert aria-live="polite" severity="info">
          Verifying your email…
        </Alert>
      ) : null}

      {state === 'success' ? (
        <>
          <Alert aria-live="polite" severity="success">
            Your email address has been verified. Log in to finish setting up your Candidate
            profile.
          </Alert>
          <Button
            component={Link}
            state={{
              from: { hash: '', pathname: ROUTES.ONBOARDING, search: '' },
              message: 'Email verified. Log in to continue to Candidate onboarding.',
            }}
            to={ROUTES.LOGIN}
            variant="contained"
          >
            Continue to onboarding
          </Button>
        </>
      ) : null}

      {state === 'invalid' ? (
        <>
          <Alert aria-live="assertive" severity="error">
            {errorMessage ?? INVALID_VERIFICATION_LINK_MESSAGE}
          </Alert>
          <ResendVerificationAction email={isValidEmail(email) ? email : undefined} />
        </>
      ) : null}

      {state === 'retry' ? (
        <>
          <Alert aria-live="assertive" severity="error">
            {errorMessage}
          </Alert>
          <Button onClick={() => void verifyEmail()} variant="contained">
            Try verification again
          </Button>
          <ResendVerificationAction email={email} />
        </>
      ) : null}
    </Stack>
  );
};
