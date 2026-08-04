import { Box, Button, Link as MuiLink, Paper, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { ApiRequestError } from '@/api/apiError';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingIndicator } from '@/components/feedback/LoadingIndicator';
import { ROUTES } from '@/constants/routes';
import { legalService } from '@/features/legal/services/legalService';
import type { LegalDocumentResponse } from '@/features/legal/types/legalModels';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

interface LegalDocumentPageProps {
  kind: 'terms' | 'privacy';
}

const formatEffectiveDate = (value: string): string => {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.valueOf())
    ? value
    : new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(parsed);
};

const LegalDocumentPage = ({ kind }: LegalDocumentPageProps) => {
  const expectedTitle = kind === 'terms' ? 'Terms of Use' : 'Privacy Policy';
  useDocumentMetadata(
    `${expectedTitle} | Career Portal`,
    `Read the Career Portal ${expectedTitle}.`,
  );
  const [document, setDocument] = useState<LegalDocumentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  const retry = useCallback(() => setRequestVersion((current) => current + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setErrorMessage(null);
    const request =
      kind === 'terms'
        ? legalService.getTermsOfUse(controller.signal)
        : legalService.getPrivacyPolicy(controller.signal);
    void request
      .then(setDocument)
      .catch((error: unknown) => {
        if (error instanceof ApiRequestError && error.code === 'request_cancelled') return;
        setErrorMessage('We could not load this legal document. Please try again.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [kind, requestVersion]);

  if (isLoading) return <LoadingIndicator label={`Loading ${expectedTitle.toLowerCase()}…`} />;
  if (errorMessage) {
    return <ErrorState description={errorMessage} headingLevel="h1" onRetry={retry} />;
  }
  if (!document?.content.trim()) {
    return (
      <EmptyState
        description="This document is not available right now."
        title={`${expectedTitle} unavailable`}
      />
    );
  }

  return (
    <Stack spacing={3}>
      <Box component="header">
        <Typography component="h1" variant="h1">
          {document.title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Version {document.version} · Effective {formatEffectiveDate(document.effectiveDate)}
        </Typography>
      </Box>
      <Paper component="article" sx={{ p: { xs: 3, sm: 5 } }}>
        <Typography sx={{ whiteSpace: 'pre-line' }}>{document.content}</Typography>
      </Paper>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button component={Link} to={ROUTES.REGISTER} variant="contained">
          Back to Register
        </Button>
        <MuiLink alignSelf="center" component={Link} to={ROUTES.LOGIN}>
          Go to Login
        </MuiLink>
      </Stack>
    </Stack>
  );
};

export const TermsOfUsePage = () => <LegalDocumentPage kind="terms" />;
export const PrivacyPolicyPage = () => <LegalDocumentPage kind="privacy" />;
