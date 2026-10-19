import { useRef, useState, type FormEvent } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useUpdateReferralContactMutation } from '../api/referralsApi';
import type { JobReferralSubmission } from '../types/referralModels';
import { referralError } from '../types/marketplaceModels';
import {
  contactPayload,
  hasContactMethod,
  restoreContacts,
  validateContacts,
} from '../utils/referralContacts';
import { ReferralContactFields, type ContactErrors } from './ReferralContactFields';

/** Only mount from the owner's authenticated submissions, never public job data. */
export function ReferralContactEditor({ job }: { job: JobReferralSubmission }) {
  const [open, setOpen] = useState(false);
  const [contacts, setContacts] = useState(() => restoreContacts(job));
  const [errors, setErrors] = useState<ContactErrors>({});
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [update, state] = useUpdateReferralContactMutation();
  const guard = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (guard.current) return;
    const nextErrors = validateContacts(contacts);
    setErrors(nextErrors);
    setError('');
    if (Object.keys(nextErrors).length) {
      // Errors render before focus is moved to the first invalid input.
      requestAnimationFrame(() =>
        form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    if (!hasContactMethod(contacts)) {
      setError('Select at least one contact method for accepted candidates.');
      return;
    }
    guard.current = true;
    try {
      const result = await update({ id: job.id, body: contactPayload(contacts) }).unwrap();
      setContacts(restoreContacts(result));
      setSaved(true);
      setOpen(false);
    } catch (reason) {
      setError(referralError(reason));
    } finally {
      guard.current = false;
    }
  };
  return (
    <>
      <Button
        variant="outlined"
        onClick={() => {
          setContacts(restoreContacts(job));
          setErrors({});
          setError('');
          setSaved(false);
          setOpen(true);
        }}
      >
        Edit contact preferences
      </Button>
      {saved && <Typography role="status">Contact preferences saved.</Typography>}
      <Dialog
        open={open}
        fullWidth
        maxWidth="sm"
        aria-labelledby={`contact-editor-${job.id}`}
        onClose={() => {
          if (!guard.current) setOpen(false);
        }}
      >
        <DialogTitle id={`contact-editor-${job.id}`}>Edit contact preferences</DialogTitle>
        <form
          ref={form}
          noValidate
          onSubmit={(event) => void save(event)}
          aria-labelledby={`contact-editor-${job.id}`}
        >
          <DialogContent>
            <Typography>
              {job.jobTitle} · {job.companyName}
            </Typography>
            <ReferralContactFields
              value={contacts}
              errors={errors}
              disabled={state.isLoading}
              onChange={(value) => {
                setContacts(value);
                setErrors({});
              }}
            />
            <Typography fontSize={12} color="text.secondary" mt={2}>
              Your contact details remain private until you accept a candidate's referral request.
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button disabled={state.isLoading} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={state.isLoading}>
              {state.isLoading ? 'Saving…' : 'Save contact preferences'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
