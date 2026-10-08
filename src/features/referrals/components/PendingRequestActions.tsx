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
  onAccepted: () => void;
}) => {
  const [accept, a] = useAcceptReferralRequestMutation();
  const [reject, r] = useRejectReferralRequestMutation();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState('');
  const guard = useRef(false);
  const busy = a.isLoading || r.isLoading;
  const act = async (rejected = false) => {
    if (guard.current) return;
    guard.current = true;
    setError('');
    try {
      await (rejected ? reject(id) : accept(id)).unwrap();
      setConfirm(false);
      if (!rejected) onAccepted();
    } catch (e) {
      setError(referralError(e));
      setConfirm(false);
    } finally {
      guard.current = false;
    }
  };
  return (
    <>
      <Stack direction="row" gap={1}>
        <Button variant="contained" disabled={busy} onClick={() => void act()}>
          {a.isLoading ? 'Accepting…' : 'Accept'}
        </Button>
        <Button variant="outlined" color="error" disabled={busy} onClick={() => setConfirm(true)}>
          Reject
        </Button>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      <Dialog
        open={confirm}
        onClose={() => {
          if (!busy) setConfirm(false);
        }}
        aria-labelledby={`reject-${id}`}
      >
        <DialogTitle id={`reject-${id}`}>Reject this referral request?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The candidate will be informed that you declined this request.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setConfirm(false)}>
            Cancel
          </Button>
          <Button disabled={busy} onClick={() => void act(true)}>
            {r.isLoading ? 'Rejecting…' : 'Yes, reject request'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
