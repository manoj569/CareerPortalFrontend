import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import { Alert, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { ApiRequestError, toApiRequestError } from '@/api/apiError';
import { ROUTES } from '@/constants/routes';
import { authService } from '@/features/auth/services/authService';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

type VerificationState = 'loading' | 'verified' | 'invalid' | 'error';

const isInvalidVerificationLink = (error: ApiRequestError): boolean =>
  error.status === 400 ||
  error.status === 404 ||
  error.status === 410 ||
  [
    'invalid_email_verification',
    'invalid_email_verification_token',
    'expired_email_verification_token',
    'invalid_verification_token',
  ].includes(error.code ?? '');

export const VerifyEmailPage = () => {
  useDocumentMetadata(
    'Verify Your Email | Career Harbor',
    'Complete Career Harbor email verification securely.',
    { canonicalPath: null, noIndex: true },
  );
  const location = useLocation();
  const navigate = useNavigate();
  const [token] = useState(() => new URLSearchParams(location.search).get('token')?.trim() ?? '');
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<VerificationState>(token ? 'loading' : 'invalid');

  useEffect(() => {
    if (!token) return;
    let active = true;

    void Promise.resolve().then(async () => {
      if (!active) return;
      await navigate(ROUTES.VERIFY_EMAIL, { replace: true });
      try {
        await authService.verifyEmail({ token });
        if (active) setState('verified');
      } catch (error: unknown) {
        if (!active) return;
        const apiError = error instanceof ApiRequestError ? error : toApiRequestError(error);
        setState(isInvalidVerificationLink(apiError) ? 'invalid' : 'error');
      }
    });

    return () => {
      active = false;
    };
  }, [attempt, navigate, token]);

  return (
    <Paper sx={{ maxWidth: 640, mx: 'auto', p: { xs: 3, sm: 5 } }}>
      <Stack alignItems="center" spacing={3} textAlign="center">
        <MarkEmailReadOutlinedIcon color="primary" sx={{ fontSize: 64 }} />
        <Typography component="h1" variant="h1">
          Verify your email
        </Typography>

        {state === 'loading' ? (
          <Stack alignItems="center" aria-live="polite" role="status" spacing={2}>
            <CircularProgress aria-label="Verifying email" />
            <Typography>Verifying your email address…</Typography>
          </Stack>
        ) : null}

        {state === 'verified' ? (
          <>
            <Alert severity="success" sx={{ width: '100%' }}>
              Your email has been verified successfully. You can now sign in to Career Harbor.
            </Alert>
            <Button component={Link} to={ROUTES.LOGIN} variant="contained">
              Log in
            </Button>
          </>
        ) : null}

        {state === 'invalid' ? (
          <Alert severity="error" sx={{ width: '100%' }}>
            This email verification link is invalid, expired, or incomplete. Request a new
            verification email before signing in.
          </Alert>
        ) : null}

        {state === 'error' ? (
          <>
            <Alert severity="error" sx={{ width: '100%' }}>
              We could not verify your email because the service could not be reached. Check your
              connection and try again.
            </Alert>
            <Button
              onClick={() => {
                setState('loading');
                setAttempt((value) => value + 1);
              }}
              variant="outlined"
            >
              Try again
            </Button>
          </>
        ) : null}
      </Stack>
    </Paper>
  );
};
