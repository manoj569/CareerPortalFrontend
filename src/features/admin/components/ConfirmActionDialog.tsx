import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

interface ConfirmActionDialogProps {
  actionLabel: string;
  description: string;
  error?: string | null;
  isProcessing?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
}

export const ConfirmActionDialog = ({
  actionLabel,
  description,
  error,
  isProcessing = false,
  onClose,
  onConfirm,
  open,
  title,
}: ConfirmActionDialogProps) => (
  <Dialog
    aria-describedby="confirm-action-description"
    fullWidth
    maxWidth="sm"
    onClose={isProcessing ? undefined : onClose}
    open={open}
  >
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <p id="confirm-action-description">{description}</p>
      {error ? (
        <Alert aria-live="assertive" severity="error">
          {error}
        </Alert>
      ) : null}
    </DialogContent>
    <DialogActions>
      <Button disabled={isProcessing} onClick={onClose}>
        Cancel
      </Button>
      <Button color="error" disabled={isProcessing} onClick={onConfirm} variant="contained">
        {isProcessing ? 'Working…' : actionLabel}
      </Button>
    </DialogActions>
  </Dialog>
);
