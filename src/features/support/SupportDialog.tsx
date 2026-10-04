import { useRef, useState, type FormEvent } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/hooks/reduxHooks';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/store/authSlice';
import {
  screenshotError,
  supportApi,
  supportCategories,
  supportError,
  supportRoutes,
  type SupportCategory,
} from './supportApi';

interface Props {
  open: boolean;
  onClose: () => void;
  initialCategory?: SupportCategory;
}
type Field = 'Name' | 'Email' | 'Category' | 'Subject' | 'Description' | 'Screenshot';

// The trigger mounts a new instance for each opening, so a dismissed form never leaks into another context.
export function SupportDialog({ open, onClose, initialCategory }: Props) {
  const authenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const [name, setName] = useState(
    authenticated ? [user?.firstName, user?.lastName].filter(Boolean).join(' ') : '',
  );
  const [email, setEmail] = useState(authenticated ? (user?.email ?? '') : '');
  const [category, setCategory] = useState<SupportCategory | ''>(initialCategory ?? '');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);
  const inFlight = useRef(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (inFlight.current || ticket) return;
    const next: Partial<Record<Field, string>> = {};
    if (!authenticated && (!name.trim() || name.length > 201))
      next.Name = 'Enter your name (up to 201 characters).';
    if (!authenticated && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.length > 256))
      next.Email = 'Enter a valid email address.';
    if (!category) next.Category = 'Select a problem type.';
    if (!subject.trim() || subject.length > 200)
      next.Subject = 'Enter a subject (up to 200 characters).';
    if (!description.trim() || description.length > 5000)
      next.Description = 'Describe your problem (up to 5000 characters).';
    if (screenshot) {
      const message = screenshotError(screenshot);
      if (message) next.Screenshot = message;
    }
    setErrors(next);
    setError(null);
    if (Object.keys(next).length) return;
    inFlight.current = true;
    setSubmitting(true);
    const data = new FormData();
    if (!authenticated) {
      data.append('Name', name.trim());
      data.append('Email', email.trim());
    }
    data.append('Category', category);
    data.append('Subject', subject.trim());
    data.append('Description', description.trim());
    if (screenshot) data.append('Screenshot', screenshot);
    try {
      setTicket((await supportApi.create(data)).ticketNumber);
    } catch (failure: unknown) {
      setError(supportError(failure));
      if (
        failure &&
        typeof failure === 'object' &&
        'errors' in failure &&
        failure.errors &&
        typeof failure.errors === 'object'
      ) {
        const fields: Partial<Record<Field, string>> = {};
        for (const field of [
          'Name',
          'Email',
          'Category',
          'Subject',
          'Description',
          'Screenshot',
        ] as const) {
          if (
            Object.keys(failure.errors).some(
              (key) => key.split('.').pop()?.toLowerCase() === field.toLowerCase(),
            )
          )
            fields[field] = 'Please check this field.';
        }
        setErrors(fields);
      }
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }
  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="support-title"
      slotProps={{
        paper: {
          sx: { m: { xs: 1, sm: 3 }, width: { xs: 'calc(100% - 16px)', sm: '100%' }, minWidth: 0 },
        },
      }}
    >
      <DialogTitle id="support-title">
        {ticket ? 'Support request submitted' : 'Need help?'}
      </DialogTitle>
      {ticket ? (
        <>
          <DialogContent>
            <Stack spacing={2}>
              <Alert severity="success">
                Your request has been received. Please save this ticket number for reference.
              </Alert>
              <Typography>Ticket Number</Typography>
              <Typography fontWeight={800} sx={{ overflowWrap: 'anywhere' }}>
                {ticket}
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            {authenticated && (
              <Button component={Link} to={supportRoutes.tickets} onClick={onClose}>
                View My Tickets
              </Button>
            )}
            <Button onClick={onClose}>Done</Button>
          </DialogActions>
        </>
      ) : (
        <form
          onSubmit={(event) => {
            void submit(event);
          }}
          noValidate
        >
          <DialogContent>
            <Stack spacing={2}>
              {error && (
                <Alert severity="error" role="alert">
                  {error}
                </Alert>
              )}
              <TextField
                select
                label="Problem Type"
                required
                value={category}
                disabled={submitting}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value in supportCategories) setCategory(value as SupportCategory);
                }}
                error={!!errors.Category}
                helperText={errors.Category}
              >
                {Object.entries(supportCategories).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Name"
                required={!authenticated}
                value={name}
                disabled={submitting}
                slotProps={{ input: { readOnly: authenticated }, htmlInput: { maxLength: 201 } }}
                onChange={(event) => setName(event.target.value)}
                error={!!errors.Name}
                helperText={errors.Name}
                autoComplete="name"
              />
              <TextField
                label="Email"
                type="email"
                required={!authenticated}
                value={email}
                disabled={submitting}
                slotProps={{ input: { readOnly: authenticated }, htmlInput: { maxLength: 256 } }}
                onChange={(event) => setEmail(event.target.value)}
                error={!!errors.Email}
                helperText={errors.Email}
                autoComplete="email"
              />
              {authenticated && (
                <Typography variant="caption" color="text.secondary">
                  This request will use your account's stored name and email.
                </Typography>
              )}
              <TextField
                label="Subject"
                required
                value={subject}
                disabled={submitting}
                onChange={(event) => setSubject(event.target.value)}
                slotProps={{ htmlInput: { maxLength: 200 } }}
                error={!!errors.Subject}
                helperText={errors.Subject}
              />
              <TextField
                label="Description"
                required
                multiline
                minRows={4}
                value={description}
                disabled={submitting}
                onChange={(event) => setDescription(event.target.value)}
                slotProps={{ htmlInput: { maxLength: 5000 } }}
                error={!!errors.Description}
                helperText={errors.Description}
              />
              <Typography variant="body2">Screenshot (optional)</Typography>
              <Button component="label" disabled={submitting} variant="outlined">
                Attach Screenshot
                <input
                  type="file"
                  aria-label="Attach Screenshot"
                  accept=".jpg,.jpeg,.png,.webp"
                  hidden
                  disabled={submitting}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = '';
                    if (!file) return;
                    const message = screenshotError(file);
                    setErrors((previous) => ({ ...previous, Screenshot: message ?? undefined }));
                    if (!message) setScreenshot(file);
                  }}
                />
              </Button>
              <Typography variant="caption" color="text.secondary">
                PNG, JPG or WebP • Max 5 MB
              </Typography>
              {errors.Screenshot && <Alert severity="error">{errors.Screenshot}</Alert>}
              {screenshot && (
                <Stack spacing={1}>
                  <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                    {screenshot.name} ({(screenshot.size / 1024).toFixed(1)} KB)
                  </Typography>
                  <Button
                    disabled={submitting}
                    onClick={() => {
                      setScreenshot(null);
                      setErrors((previous) => ({ ...previous, Screenshot: undefined }));
                    }}
                  >
                    Remove screenshot
                  </Button>
                </Stack>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Button type="button" disabled={submitting} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} variant="contained">
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
}
