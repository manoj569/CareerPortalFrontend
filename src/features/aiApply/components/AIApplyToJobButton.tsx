import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  buildAIApplyApplicationDetailsPath,
  ROUTES,
} from '@/constants/routes';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/store/authSlice';
import { useGetProfileQuery } from '@/features/dashboard/api/dashboardApi';
import { useAppSelector } from '@/hooks/reduxHooks';
import { UserRole } from '@/types';
import {
  useLazyGetAIApplyAccessQuery,
  useQueueAIApplyApplicationMutation,
} from '../api/aiApplyApi';

const capabilities = [
  'Open the employer application page',
  'Fill verified profile information',
  'Upload your selected resume',
  'Reuse verified answers',
  'Answer safe application questions',
  'Pause when login, CAPTCHA, MFA, or uncertain information needs you',
];

interface AIApplyToJobButtonProps {
  companyName: string;
  fullWidth?: boolean;
  jobId: string;
  jobTitle: string;
  size?: 'small' | 'medium' | 'large';
}

export const AIApplyToJobButton = ({
  companyName,
  fullWidth = false,
  jobId,
  jobTitle,
  size = 'medium',
}: AIApplyToJobButtonProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const isCandidate = user?.role === UserRole.Candidate;
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkAccess, access] = useLazyGetAIApplyAccessQuery();
  const profile = useGetProfileQuery(undefined, { skip: !open || !isCandidate });
  const [queue, queueState] = useQueueAIApplyApplicationMutation();
  const entitled = Boolean(access.data?.canUseAIApply);

  const openDialog = async () => {
    if (!isAuthenticated) {
      await navigate(ROUTES.LOGIN, { state: { from: location } });
      return;
    }
    if (!isCandidate) return;
    setError(null);
    setOpen(true);
    void checkAccess();
  };

  const start = async () => {
    if (!entitled || queueState.isLoading) return;
    setError(null);
    try {
      const application = await queue({ jobId }).unwrap();
      setOpen(false);
      await navigate(buildAIApplyApplicationDetailsPath(application.id));
    } catch (queueError: unknown) {
      const status =
        queueError && typeof queueError === 'object' && 'status' in queueError
          ? Number(queueError.status)
          : undefined;
      if (status === 403) {
        void checkAccess();
        setError('Your AI Apply access could not be confirmed. View membership plans to continue.');
      } else {
        setError('AI Apply could not start for this job. Please try again.');
      }
    }
  };

  return (
    <>
      <Button
        disabled={user?.role === UserRole.Administrator}
        fullWidth={fullWidth}
        onClick={() => void openDialog()}
        size={size}
        startIcon={<AutoAwesomeOutlinedIcon />}
        sx={{
          background: 'linear-gradient(135deg, #3154D9 0%, #7C3AED 100%)',
          color: 'common.white',
          minHeight: 44,
          '&:hover': { background: 'linear-gradient(135deg, #2846B8 0%, #6D28D9 100%)' },
        }}
        variant="contained"
      >
        AI Apply
      </Button>

      <Dialog
        aria-describedby="ai-apply-dialog-description"
        aria-labelledby="ai-apply-dialog-title"
        fullWidth
        maxWidth="sm"
        onClose={() => !queueState.isLoading && setOpen(false)}
        open={open}
        PaperProps={{ sx: { borderRadius: { xs: '20px 20px 0 0', sm: 3 }, m: { xs: 0, sm: 2 }, position: { xs: 'fixed', sm: 'relative' }, bottom: { xs: 0, sm: 'auto' }, width: { xs: '100%', sm: 'calc(100% - 32px)' } } }}
      >
        {access.isLoading ? (
          <DialogContent>
            <Typography aria-live="polite">Checking AI Apply access…</Typography>
          </DialogContent>
        ) : entitled ? (
          <>
            <DialogTitle id="ai-apply-dialog-title">AI Apply</DialogTitle>
            <DialogContent>
              <Stack spacing={2.25}>
                <Typography id="ai-apply-dialog-description">
                  Let Career Harbor apply to this job for you.
                </Typography>
                <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2 }}>
                  <Typography fontWeight={800}>{jobTitle}</Typography>
                  <Typography color="text.secondary">{companyName}</Typography>
                </Box>
                <Box>
                  <Typography fontWeight={750} sx={{ mb: 1 }}>Career Harbor will:</Typography>
                  <Stack spacing={0.8}>
                    {capabilities.map((item) => (
                      <Stack alignItems="flex-start" direction="row" key={item} spacing={1}>
                        <CheckCircleOutlineIcon color="primary" fontSize="small" />
                        <Typography variant="body2">{item}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
                <Divider />
                <Stack alignItems="flex-start" direction="row" spacing={1}>
                  <SecurityOutlinedIcon color="primary" fontSize="small" />
                  <Typography variant="body2">Career Harbor does not fabricate sensitive information.</Typography>
                </Stack>
                <Box>
                  <Typography color="text.secondary" variant="caption">Resume</Typography>
                  <Typography fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>
                    {profile.data?.resume?.fileName ?? 'Your Career Harbor resume'}
                  </Typography>
                  <Button onClick={() => void navigate(ROUTES.DASHBOARD_JOBS)} size="small">
                    Change resume
                  </Button>
                </Box>
                {error ? <Alert aria-live="assertive" severity="error">{error}</Alert> : null}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ flexDirection: { xs: 'column-reverse', sm: 'row' }, px: 3, pb: 3, '& > :not(style) ~ :not(style)': { ml: { xs: 0, sm: 1 }, mb: { xs: 1, sm: 0 } } }}>
              <Button disabled={queueState.isLoading} fullWidth onClick={() => setOpen(false)}>Cancel</Button>
              <Button disabled={queueState.isLoading} fullWidth onClick={() => void start()} startIcon={<AutoAwesomeOutlinedIcon />} variant="contained">
                {queueState.isLoading ? 'Starting AI Apply…' : 'Start AI Apply'}
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle id="ai-apply-dialog-title">AI Apply requires an active AI Apply plan</DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                <Typography id="ai-apply-dialog-description">
                  Automate applications to suitable jobs using your verified Career Harbor profile.
                </Typography>
                {error ? <Alert aria-live="assertive" severity="error">{error}</Alert> : null}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ flexDirection: { xs: 'column-reverse', sm: 'row' }, px: 3, pb: 3 }}>
              <Button fullWidth onClick={() => setOpen(false)}>Continue manually</Button>
              <Button fullWidth onClick={() => void navigate(ROUTES.MEMBERSHIP)} variant="contained">View membership plans</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};
