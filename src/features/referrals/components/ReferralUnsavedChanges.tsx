import { useContext, type MutableRefObject } from 'react';
import { UNSAFE_DataRouterContext, useBlocker } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
const NavigationWarning = ({
  dirty,
  allowLeave,
  busy,
}: {
  dirty: boolean;
  allowLeave: MutableRefObject<boolean>;
  busy: boolean;
}) => {
  const blocker = useBlocker(() => dirty && !allowLeave.current);
  return (
    <Dialog
      open={blocker.state === 'blocked'}
      onClose={() => blocker.state === 'blocked' && blocker.reset()}
      aria-labelledby="unsaved-referral-title"
    >
      <DialogTitle id="unsaved-referral-title">Leave this shared job?</DialogTitle>
      <DialogContent>
        Your unsaved changes will be lost.{busy ? ' A submission is still pending.' : ''}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => blocker.state === 'blocked' && blocker.reset()}>Keep editing</Button>
        <Button disabled={busy} onClick={() => blocker.state === 'blocked' && blocker.proceed()}>
          Leave page
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export const ReferralUnsavedChanges = (props: {
  dirty: boolean;
  allowLeave: MutableRefObject<boolean>;
  busy: boolean;
}) => {
  const context = useContext(UNSAFE_DataRouterContext);
  return context ? <NavigationWarning {...props} /> : null;
};
