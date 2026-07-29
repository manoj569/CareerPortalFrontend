import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import type { RefObject } from 'react';

import type { Membership } from '@/features/dashboard/types/dashboardModels';
import type { PaymentOrder } from '../types/paymentModels';
import { formatMinorAmount, formatPaymentDate } from '../utils/paymentFormatting';

interface ApplicationAccessPlanCardProps {
  activeMembership?: Membership;
  isProcessing: boolean;
  onPurchase: () => void;
  order?: PaymentOrder;
  purchaseBlocked?: boolean;
  purchaseButtonRef?: RefObject<HTMLButtonElement | null>;
}

const DEFAULT_PLAN_NAME = 'Portal Membership';
const DEFAULT_AMOUNT_IN_MINOR_UNITS = 9_900;
const DEFAULT_CURRENCY = 'INR';
const DEFAULT_DURATION_DAYS = 30;

export const ApplicationAccessPlanCard = ({
  activeMembership,
  isProcessing,
  onPurchase,
  order,
  purchaseBlocked = false,
  purchaseButtonRef,
}: ApplicationAccessPlanCardProps) => {
  const planName = order?.planName ?? activeMembership?.planName ?? DEFAULT_PLAN_NAME;
  const amount = formatMinorAmount(
    order?.amountInMinorUnits ?? DEFAULT_AMOUNT_IN_MINOR_UNITS,
    order?.currencyCode ?? DEFAULT_CURRENCY,
  );
  const durationDays = order?.durationDays ?? DEFAULT_DURATION_DAYS;
  const expiry = activeMembership?.endsAtUtc ? formatPaymentDate(activeMembership.endsAtUtc) : null;

  return (
    <Card component="section">
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Box>
            <Stack alignItems="center" direction="row" flexWrap="wrap" gap={1}>
              <Typography color="primary.main" fontWeight={700} variant="overline">
                Candidate membership
              </Typography>
              <Chip color="info" label="Razorpay Test Mode" size="small" variant="outlined" />
            </Stack>
            <Typography component="h2" variant="h2">
              {planName}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Apply to eligible published roles across Career Portal while the membership is active.
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography color="text.secondary" variant="body2">
              Membership price
            </Typography>
            <Typography component="p" fontWeight={800} variant="h2">
              {amount}
            </Typography>
            <Typography color="text.secondary">
              {durationDays} days · no automatic renewal
            </Typography>
          </Box>

          <Stack component="ul" spacing={1.25} sx={{ listStyle: 'none', m: 0, p: 0 }}>
            <Stack alignItems="center" component="li" direction="row" spacing={1}>
              <CheckCircleOutlineIcon color="success" fontSize="small" />
              <Typography>Portal-wide Candidate application access</Typography>
            </Stack>
            <Stack alignItems="center" component="li" direction="row" spacing={1}>
              <CheckCircleOutlineIcon color="success" fontSize="small" />
              <Typography>Membership activates only after backend payment confirmation</Typography>
            </Stack>
          </Stack>

          {activeMembership ? (
            <Alert severity="success">
              Membership is active
              {expiry ? ` until ${expiry}` : ''}. No additional payment is needed.
            </Alert>
          ) : (
            <>
              <Typography color="text.secondary" variant="caption">
                The checkout uses the amount, currency, plan, duration, Test Mode Key ID, and order
                reference returned by the backend. Displayed pricing is never submitted by the
                browser.
              </Typography>
              <Button
                aria-label="Pay securely with Razorpay Test Mode"
                disabled={isProcessing || purchaseBlocked}
                fullWidth
                onClick={onPurchase}
                ref={purchaseButtonRef}
                size="large"
                variant="contained"
              >
                {purchaseBlocked
                  ? 'Resolve pending payment first'
                  : isProcessing
                    ? 'Preparing secure checkout…'
                    : `Pay ${amount} securely`}
              </Button>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
