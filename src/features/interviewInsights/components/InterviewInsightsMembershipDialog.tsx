import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

const benefits = [
  'Company-wise interview experiences',
  'Technical, HR, coding and managerial round preparation',
  'Questions, tips and helpful community feedback',
];

interface InterviewInsightsMembershipDialogProps {
  onCancel: () => void;
  onGetMembership: () => void;
  open: boolean;
}

export const InterviewInsightsMembershipDialog = ({
  onCancel,
  onGetMembership,
  open,
}: InterviewInsightsMembershipDialogProps) => (
  <Dialog
    aria-describedby="interview-insights-membership-description"
    aria-labelledby="interview-insights-membership-title"
    fullWidth
    maxWidth="sm"
    onClose={(_, reason) => {
      if (reason === 'escapeKeyDown' || reason === 'backdropClick') onCancel();
    }}
    open={open}
    slotProps={{
      paper: {
        sx: {
          borderRadius: { xs: '20px 20px 0 0', sm: 3 },
          boxShadow: '0 24px 70px rgba(33, 43, 79, 0.22)',
          m: { xs: 0, sm: 4 },
          maxWidth: { xs: '100%', sm: 560 },
          position: { xs: 'absolute', sm: 'relative' },
          bottom: { xs: 0, sm: 'auto' },
          width: { xs: '100%', sm: 'calc(100% - 64px)' },
        },
      },
    }}
  >
    <DialogContent sx={{ p: { xs: 3, sm: 4 }, pb: { xs: 2, sm: 2 } }}>
      <IconButton
        aria-label="Close membership offer"
        onClick={onCancel}
        sx={{ position: 'absolute', right: 12, top: 12 }}
      >
        <CloseIcon />
      </IconButton>
      <Stack spacing={2.5}>
        <Box
          sx={{
            alignItems: 'center',
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            borderRadius: '50%',
            color: 'common.white',
            display: 'flex',
            height: 58,
            justifyContent: 'center',
            width: 58,
          }}
        >
          <LockOutlinedIcon aria-hidden fontSize="large" />
        </Box>
        <Box>
          <Typography component="h1" id="interview-insights-membership-title" variant="h2">
            Unlock Interview Insights
          </Typography>
          <Typography
            color="text.secondary"
            id="interview-insights-membership-description"
            sx={{ mt: 1 }}
          >
            Prepare with real candidate experiences before your interview.
          </Typography>
        </Box>
        <Stack component="ul" spacing={1.25} sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {benefits.map((benefit) => (
            <Stack component="li" direction="row" key={benefit} spacing={1.25}>
              <CheckCircleIcon aria-hidden color="primary" fontSize="small" sx={{ mt: 0.25 }} />
              <Typography>{benefit}</Typography>
            </Stack>
          ))}
        </Stack>
        <Box sx={{ bgcolor: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: 2, p: 2 }}>
          <Typography fontWeight={800}>Career Harbor Membership</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            ₹99 · Valid for 30 days · No auto-renewal
          </Typography>
        </Box>
      </Stack>
    </DialogContent>
    <DialogActions
      sx={{ alignItems: 'stretch', flexDirection: 'column', px: { xs: 3, sm: 4 }, pb: 3 }}
    >
      <Button fullWidth onClick={onGetMembership} size="large" variant="contained">
        Get membership — ₹99
      </Button>
      <Button fullWidth onClick={onCancel} size="large" variant="text">
        Not now
      </Button>
      <Typography color="text.secondary" sx={{ pt: 0.5, textAlign: 'center' }} variant="caption">
        No job, interview, recruiter response, or selection is guaranteed.
      </Typography>
    </DialogActions>
  </Dialog>
);
