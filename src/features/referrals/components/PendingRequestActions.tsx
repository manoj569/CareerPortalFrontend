import { useRef, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from '@mui/material';
import {
  useAcceptReferralRequestMutation,
  useRejectReferralRequestMutation,
} from '../api/marketplaceApi';
import { referralError } from '../types/marketplaceModels';
export const PendingRequestActions = ({
  id,
  onAccepted,
}: {
  id: string;
  onAccepted: (message: string) => void;
}) => {
  const [accept, a] = useAcceptReferralRequestMutation();
  const [reject, r] = useRejectReferralRequestMutation();
  const [confirm, setConfirm] = useState<'accept' | 'reject' | null>(null);
  const [error, setError] = useState('');
  const guard = useRef(false);
  const busy = a.isLoading || r.isLoading;
  const act = async (rejected = false) => {
    if (guard.current) return;
    guard.current = true;
    setError('');
    try {
      await (rejected ? reject(id) : accept(id)).unwrap();
      setConfirm(null);
      onAccepted(
        rejected
          ? 'Referral request rejected.'
          : 'Referral request accepted. Submission is a separate step.',
      );
    } catch (e) {
      setError(referralError(e));
      setConfirm(null);
    } finally {
      guard.current = false;
    }
  };
  return (
    <>
      <Stack direction="row" gap={1}>
        <Button variant="contained" disabled={busy} onClick={() => setConfirm('accept')}>
          {a.isLoading ? 'Accepting…' : 'Accept'}
        </Button>
        <Button
          variant="outlined"
          color="error"
          disabled={busy}
          onClick={() => setConfirm('reject')}
        >
          Reject
        </Button>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      <Dialog
        open={confirm !== null}
        onClose={() => {
          if (!busy) setConfirm(null);
        }}
        aria-labelledby={`reject-${id}`}
      >
        <DialogTitle id={`reject-${id}`}>
          {confirm === 'reject' ? 'Reject this referral request?' : 'Accept this referral request?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirm === 'reject'
              ? 'Confirm that you want to decline this request.'
              : 'Acceptance consumes one referral connection and shares your selected contact methods. Submission is a separate step.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setConfirm(null)}>
            Cancel
          </Button>
          <Button disabled={busy} onClick={() => void act(confirm === 'reject')}>
            {busy
              ? 'Saving…'
              : confirm === 'reject'
                ? 'Yes, reject request'
                : 'Yes, accept request'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
