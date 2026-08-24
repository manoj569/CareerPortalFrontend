import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Alert, Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useGetMembershipsQuery } from '@/features/dashboard/api/dashboardApi';
import {
  isPaymentsApiError,
  useCreatePhonePeCheckoutMutation,
} from '@/features/payments/api/paymentsApi';
import { beginPhonePeRedirect } from '@/features/payments/services/phonePeCheckout';
import { findActiveMembership } from '@/features/payments/utils/entitlement';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const benefits = [
  '30 days access',
  'Interview Insights access',
  'Apply to jobs access',
  'No auto-renewal',
];

const safeCheckoutError = (error: unknown): string => {
  if (isPaymentsApiError(error) && error.status === 409) {
    return 'A membership or payment is already in progress. Refresh your membership status before trying again.';
  }
  if (isPaymentsApiError(error) && (error.status === 401 || error.status === 403)) {
    return 'Your signed-in Candidate session is required to create checkout.';
  }
  return 'We could not create a secure PhonePe checkout. No membership was activated. Please try again.';
};

export const PaymentPage = () => {
  useDocumentMetadata(
    'Career Harbor Membership',
    'Purchase a 30-day Career Harbor membership through secure PhonePe checkout.',
  );
  const memberships = useGetMembershipsQuery();
  const activeMembership = findActiveMembership(memberships.data);
  const [createCheckout, createState] = useCreatePhonePeCheckoutMutation();
  const [error, setError] = useState<string | null>(null);
  const purchaseButtonRef = useRef<HTMLButtonElement>(null);

  const handleCheckout = async () => {
    if (createState.isLoading || activeMembership) return;
    setError(null);
    try {
      const checkout = await createCheckout().unwrap();
      if (!beginPhonePeRedirect(checkout)) {
        setError('The secure PhonePe destination could not be verified. Please try again.');
        window.requestAnimationFrame(() => purchaseButtonRef.current?.focus());
      }
    } catch (checkoutError: unknown) {
      setError(safeCheckoutError(checkoutError));
      window.requestAnimationFrame(() => purchaseButtonRef.current?.focus());
    }
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 920, mx: 'auto' }}>
      <Box>
        <Typography color="primary.main" fontWeight={800} variant="overline">
          Simple, secure access
        </Typography>
        <Typography component="h1" variant="h1">
          Career Harbor Membership
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Prepare confidently and apply to opportunities with 30 days of candidate access.
        </Typography>
      </Box>

      {error ? (
        <Alert
          action={
            <Button
              color="inherit"
              disabled={createState.isLoading}
              onClick={() => void handleCheckout()}
            >
              Retry
            </Button>
          }
          aria-live="assertive"
          severity="error"
        >
          {error}
        </Alert>
      ) : null}

      {activeMembership ? (
        <Alert
          action={
            <Button color="inherit" component={Link} to={ROUTES.INTERVIEW_INSIGHTS}>
              Explore insights
            </Button>
          }
          severity="success"
        >
          Your Career Harbor membership is active.
        </Alert>
      ) : null}

      <Card
        sx={{
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F6F7FF 100%)',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          boxShadow: '0 18px 45px rgba(41, 56, 126, 0.12)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Stack spacing={3}>
            <Stack
              alignItems="flex-start"
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Chip color="primary" label="30-day plan" size="small" />
                <Typography component="h2" sx={{ mt: 1.5 }} variant="h2">
                  Career Harbor Membership
                </Typography>
              </Box>
              <Box textAlign={{ xs: 'left', sm: 'right' }}>
                <Typography component="p" fontWeight={900} variant="h1">
                  ₹99
                </Typography>
                <Typography color="text.secondary">INR · one-time payment</Typography>
              </Box>
            </Stack>

            <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', m: 0, p: 0 }}>
              {benefits.map((benefit) => (
                <Stack component="li" direction="row" key={benefit} spacing={1.25}>
                  <CheckCircleIcon aria-hidden color="primary" fontSize="small" />
                  <Typography>{benefit}</Typography>
                </Stack>
              ))}
            </Stack>

            <Box sx={{ bgcolor: '#EEF4FF', borderRadius: 2, p: 2 }}>
              <Stack alignItems="center" direction="row" spacing={1}>
                <LockOutlinedIcon aria-hidden color="primary" fontSize="small" />
                <Typography color="text.secondary" variant="body2">
                  You will be redirected to PhonePe to complete payment.
                </Typography>
              </Stack>
            </Box>

            <Button
              disabled={createState.isLoading || Boolean(activeMembership)}
              onClick={() => void handleCheckout()}
              ref={purchaseButtonRef}
              size="large"
              variant="contained"
            >
              {createState.isLoading ? 'Creating secure checkout…' : 'Continue to PhonePe'}
            </Button>
            <Button component={Link} to={ROUTES.PAYMENTS} variant="text">
              View payment history
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Typography color="text.secondary" textAlign="center" variant="caption">
        No job, interview, recruiter response, or selection is guaranteed.
      </Typography>
    </Stack>
  );
};
