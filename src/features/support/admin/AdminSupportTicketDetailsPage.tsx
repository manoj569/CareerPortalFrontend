import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Chip, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import { ErrorState } from '@/components/feedback/ErrorState';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { formatAdminDate } from '@/features/admin/utils/adminFormatting';
import { useAppSelector } from '@/hooks/reduxHooks';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/store/authSlice';
import { UserRole } from '@/types';
import { supportCategories, supportStatusLabels, type SupportStatus } from '../supportApi';
import {
  adminSupportError,
  adminSupportRoutes,
  getAdminSupportScreenshot,
  useGetAdminSupportTicketQuery,
  useUpdateAdminSupportNotesMutation,
  useUpdateAdminSupportStatusMutation,
  type AdminSupportTicket,
} from './adminSupportApi';

export function AdminSupportTicketDetailsPage() {
  const { id = '' } = useParams();
  const user = useAppSelector(selectCurrentUser);
  const authenticated = useAppSelector(selectIsAuthenticated);
  const allowed = authenticated && user?.role === UserRole.Administrator;
  const validId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const ticket = useGetAdminSupportTicketQuery(id, { skip: !allowed || !validId });
  if (!allowed) return null;
  return (
    <Stack spacing={3} sx={{ minWidth: 0 }}>
      <DashboardPageHeader
        eyebrow="Administration"
        title="Support Request Details"
        description="Investigate this request and update its status or internal notes."
      />
      <Button component={Link} to={adminSupportRoutes.list} sx={{ alignSelf: 'flex-start' }}>
        Back to Support Tickets
      </Button>
      {!validId ? (
        <Alert severity="error">This support request could not be found.</Alert>
      ) : ticket.isLoading ? (
        <PageLoadingIndicator label="Loading support request" />
      ) : ticket.isError ? (
        <ErrorState
          title="Support request unavailable"
          description={adminSupportError(ticket.error)}
          onRetry={() => {
            void ticket.refetch();
          }}
        />
      ) : (
        ticket.currentData && (
          <TicketEditor
            key={`${user?.id}:${ticket.currentData.id}`}
            ticket={ticket.currentData}
            reload={() => {
              void ticket.refetch();
            }}
          />
        )
      )}
    </Stack>
  );
}

function TicketEditor({ ticket, reload }: { ticket: AdminSupportTicket; reload: () => void }) {
  const [status, setStatus] = useState<SupportStatus>(ticket.status);
  useEffect(() => {
    setStatus(ticket.status);
  }, [ticket.status]);
  const [notes, setNotes] = useState(ticket.adminNotes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState<'status' | 'notes' | null>(null);
  const inFlight = useRef(false);
  const [updateStatus] = useUpdateAdminSupportStatusMutation();
  const [updateNotes] = useUpdateAdminSupportNotesMutation();
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  async function save(kind: 'status' | 'notes') {
    if (inFlight.current) return;
    if (kind === 'notes' && notes.length > 5000) {
      setError('Internal notes must be 5,000 characters or fewer.');
      return;
    }
    inFlight.current = true;
    setSaving(kind);
    setError(null);
    setSuccess(null);
    try {
      const result =
        kind === 'status'
          ? await updateStatus({ id: ticket.id, status }).unwrap()
          : await updateNotes({ id: ticket.id, adminNotes: notes.trim() || null }).unwrap();
      if (!alive.current) return;
      // Display server-owned status, notes and timestamps; list caches are invalidated by the mutation.
      setStatus(result.status);
      if (kind === 'notes') setNotes(result.adminNotes ?? '');
      setSuccess(kind === 'status' ? 'Ticket status updated.' : 'Internal notes saved.');
    } catch (failure: unknown) {
      if (alive.current) {
        setError(adminSupportError(failure));
        if (kind === 'status') setStatus(ticket.status);
      }
    } finally {
      inFlight.current = false;
      if (alive.current) setSaving(null);
    }
  }
  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2, sm: 3 }, minWidth: 0 }}>
        <Stack spacing={2} sx={{ overflowWrap: 'anywhere' }}>
          <Typography variant="h6" component="h2">
            {ticket.ticketNumber}
          </Typography>
          <Chip label={supportStatusLabels[ticket.status]} sx={{ alignSelf: 'flex-start' }} />
          <Typography>Category: {supportCategories[ticket.category]}</Typography>
          <Typography>Name: {ticket.name}</Typography>
          <Typography>Email: {ticket.email}</Typography>
          <Typography>{ticket.userId ? 'Registered User' : 'Guest User'}</Typography>
          <Typography component="h3" variant="h6">
            {ticket.subject}
          </Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{ticket.description}</Typography>
          <Typography>Created: {formatAdminDate(ticket.createdAtUtc)}</Typography>
          {ticket.updatedAtUtc && (
            <Typography>Updated: {formatAdminDate(ticket.updatedAtUtc)}</Typography>
          )}
          {ticket.resolvedAtUtc && (
            <Typography>Resolved: {formatAdminDate(ticket.resolvedAtUtc)}</Typography>
          )}
          {ticket.hasScreenshot && <Screenshot key={ticket.id} id={ticket.id} />}
        </Stack>
      </Paper>
      {error && (
        <Alert
          severity="error"
          action={
            <Button disabled={!!saving} onClick={reload}>
              Reload latest ticket
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      {success && <Alert severity="success">{success}</Alert>}
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">
            Status management
          </Typography>
          <Typography variant="body2">
            Current status: {supportStatusLabels[ticket.status]}
          </Typography>
          <TextField
            select
            fullWidth
            label="Status"
            disabled={!!saving}
            value={status}
            onChange={(event) => {
              const value = event.target.value;
              if (Object.keys(supportStatusLabels).includes(value))
                setStatus(value as SupportStatus);
              setSuccess(null);
            }}
          >
            {Object.entries(supportStatusLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <Button
            type="button"
            variant="contained"
            disabled={!!saving || status === ticket.status}
            onClick={() => {
              void save('status');
            }}
            sx={{ alignSelf: 'flex-start' }}
          >
            {saving === 'status' ? 'Updating...' : 'Update Status'}
          </Button>
        </Stack>
      </Paper>
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">
            Internal Admin Notes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visible only to administrators. These notes are not shown to the requester.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Internal Admin Notes"
            value={notes}
            disabled={!!saving}
            onChange={(event) => {
              setNotes(event.target.value);
              setSuccess(null);
            }}
            slotProps={{ htmlInput: { maxLength: 5000 } }}
            error={notes.length > 5000}
            helperText={`${notes.length}/5000 characters`}
          />
          <Button
            type="button"
            variant="contained"
            disabled={!!saving || notes.length > 5000 || notes === (ticket.adminNotes ?? '')}
            onClick={() => {
              void save('notes');
            }}
            sx={{ alignSelf: 'flex-start' }}
          >
            {saving === 'notes' ? 'Saving...' : 'Save Notes'}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}

function Screenshot({ id }: { id: string }) {
  const [requested, setRequested] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!requested) return;
    const controller = new AbortController();
    let url: string | undefined;
    setLoading(true);
    setError(null);
    void getAdminSupportScreenshot(id, controller.signal)
      .then((blob) => {
        if (controller.signal.aborted) return;
        if (!['image/png', 'image/jpeg', 'image/webp'].includes(blob.type))
          throw new Error('Unsupported image type');
        url = URL.createObjectURL(blob);
        setImage(url);
      })
      .catch((failure: unknown) => {
        if (!controller.signal.aborted) {
          setError(adminSupportError(failure));
          setRequested(false);
          setLoading(false);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => {
      controller.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [id, requested]);
  return (
    <Stack spacing={2}>
      <Button
        type="button"
        disabled={loading || !!image}
        onClick={() => setRequested(true)}
        sx={{ alignSelf: 'flex-start' }}
      >
        View Screenshot
      </Button>
      {loading && <PageLoadingIndicator label="Loading screenshot" />}
      {error && <Alert severity="error">{error}</Alert>}
      {image && (
        <img
          src={image}
          alt="Support ticket screenshot"
          style={{ maxWidth: '100%', height: 'auto', alignSelf: 'flex-start' }}
        />
      )}
    </Stack>
  );
}
