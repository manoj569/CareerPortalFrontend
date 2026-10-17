import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState, type MouseEvent } from 'react';

import type { CareerHarborPointsBalance } from '../types/interviewInsightModels';
import { CareerHarborPointsCard, POINT_EARNING_GUIDE } from './CareerHarborPointsCard';

const formatPoints = (value: number) => new Intl.NumberFormat('en-IN').format(value);

export const CareerHarborPointsIndicator = ({
  balance,
}: {
  balance?: CareerHarborPointsBalance | null;
}) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  if (!balance) return null;
  const open = (event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget);

  return (
    <>
      <Tooltip title="View CareerHarbor Points">
        <Button
          aria-controls={anchor ? 'careerharbor-points-popover' : undefined}
          aria-expanded={Boolean(anchor)}
          aria-haspopup="dialog"
          onClick={open}
          startIcon={<WorkspacePremiumOutlinedIcon />}
          sx={{
            display: { xs: 'none', md: 'inline-flex' },
            minWidth: 0,
            mr: 0.5,
            whiteSpace: 'nowrap',
          }}
          variant="text"
        >
          {formatPoints(balance.totalPoints)} pts
        </Button>
      </Tooltip>
      <Popover
        anchorEl={anchor}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        id="careerharbor-points-popover"
        onClose={() => setAnchor(null)}
        open={Boolean(anchor)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <Box
          aria-label="CareerHarbor Points details"
          role="dialog"
          sx={{ p: 2, width: { xs: 'min(340px, calc(100vw - 32px))', sm: 360 } }}
        >
          <CareerHarborPointsCard balance={balance} compact />
          <Typography color="text.secondary" sx={{ mt: 1.5 }} variant="caption">
            How to earn points
          </Typography>
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            {POINT_EARNING_GUIDE.map(([label, value]) => (
              <Stack direction="row" justifyContent="space-between" key={label} spacing={1}>
                <Typography variant="body2">{label}</Typography>
                <Typography color="primary" fontWeight={700} variant="body2">
                  {value}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Popover>
    </>
  );
};

export const CareerGuidanceComingSoonDialog = ({
  balance,
  open,
  onClose,
}: {
  balance?: CareerHarborPointsBalance | null;
  open: boolean;
  onClose: () => void;
}) => (
  <Dialog
    aria-labelledby="career-guidance-coming-soon-title"
    onClose={onClose}
    open={open}
    maxWidth="sm"
    fullWidth
  >
    <DialogTitle id="career-guidance-coming-soon-title">Become a CareerHarbor Mentor</DialogTitle>
    <DialogContent>
      <Typography color="primary" fontWeight={750} variant="overline">
        Career Guidance · Coming soon
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Help candidates with your experience and build your reputation.
      </Typography>
      {balance ? (
        <CareerHarborPointsCard balance={balance} compact />
      ) : (
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
          <Typography fontWeight={700}>Earn CareerHarbor Points by helping candidates.</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Reach 3,000 points to become eligible for Mentor onboarding.
          </Typography>
        </Box>
      )}
      <Typography fontWeight={700} sx={{ mt: 2 }} variant="subtitle2">
        Earn points by
      </Typography>
      <Stack spacing={0.75} sx={{ mt: 1 }}>
        {POINT_EARNING_GUIDE.map(([label, value]) => (
          <Stack direction="row" justifyContent="space-between" key={label} spacing={2}>
            <Typography variant="body2">{label}</Typography>
            <Typography color="primary" fontWeight={700} variant="body2">
              {value}
            </Typography>
          </Stack>
        ))}
      </Stack>
      <Typography color="text.secondary" sx={{ mt: 2 }} variant="body2">
        Reaching the threshold unlocks eligibility. Mentor verification and approval will still be
        required.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button autoFocus onClick={onClose} variant="contained">
        Got it
      </Button>
    </DialogActions>
  </Dialog>
);
