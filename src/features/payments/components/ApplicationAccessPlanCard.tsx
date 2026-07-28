import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Alert, Box, Button, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import type { RefObject } from 'react';

import type { Membership } from '@/features/dashboard/types/dashboardModels';
import type { PaymentOrder } from '../types/paymentModels';
import { formatMinorAmount } from '../utils/paymentFormatting';

interface ApplicationAccessPlanCardProps {
  activeMembership?: Membership;
  companyName?: string;
  isProcessing: boolean;
  onPurchase: () => void;
  order?: PaymentOrder;
  purchaseButtonRef?: RefObject<HTMLButtonElement | null>;
}

export const ApplicationAccessPlanCard = ({
  activeMembership,
  companyName,
  isProcessing,
  onPurchase,
  order,
  purchaseButtonRef,
}: ApplicationAccessPlanCardProps) => (
  <Card component="section">
    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography color="primary.main" fontWeight={700} variant="overline">
            Company application access
          </Typography>
          <Typography component="h2" variant="h2">
            {activeMembership?.planName ?? 'Application access'}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Access eligible published roles at {companyName ?? 'this company'} for the membership
            term configured by Career Portal.
          </Typography>
        </Box>

        <Divider />

        <Stack component="ul" spacing={1.25} sx={{ listStyle: 'none', m: 0, p: 0 }}>
          <Stack alignItems="center" component="li" direction="row" spacing={1}>
            <CheckCircleOutlineIcon color="success" fontSize="small" />
            <Typography>Server-verified access for this company</Typography>
          </Stack>
          <Stack alignItems="center" component="li" direction="row" spacing={1}>
            <CheckCircleOutlineIcon color="success" fontSize="small" />
            <Typography>No automatic renewal</Typography>
          </Stack>
        </Stack>

        {activeMembership ? (
          <Alert severity="success">Access already active. No additional payment is needed.</Alert>
        ) : (
          <>
            <Box>
              <Typography color="text.secondary" variant="body2">
                Final amount
              </Typography>
              <Typography component="p" fontWeight={700} variant="h2">
                {order
                  ? formatMinorAmount(order.amountInMinorUnits, order.currencyCode)
                  : 'Confirmed at checkout'}
              </Typography>
              <Typography color="text.secondary" variant="caption">
                The backend supplies the final amount and currency when it creates the secure order.
              </Typography>
            </Box>
            <Button
              aria-label="Pay securely with Razorpay"
              disabled={isProcessing}
              fullWidth
              onClick={onPurchase}
              ref={purchaseButtonRef}
              size="large"
              variant="contained"
            >
              {isProcessing ? 'Preparing secure checkout…' : 'Pay securely'}
            </Button>
          </>
        )}
      </Stack>
    </CardContent>
  </Card>
);
