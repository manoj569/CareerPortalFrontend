import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Pagination,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAppSelector } from '@/hooks/reduxHooks';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/store/authSlice';
import type { PaginatedResponse } from '@/types';
import { SupportButton } from './SupportButton';
import {
  supportApi,
  supportCategories,
  supportError,
  supportRoutes,
  supportStatusLabels,
  ticketPath,
  type SupportTicket,
} from './supportApi';

const date = (value: string) => new Date(value).toLocaleString();
export function MySupportTicketsPage() {
  const { ticketNumber } = useParams();
  const location = useLocation();
  const authenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{
    owner: string;
    page?: PaginatedResponse<SupportTicket>;
    ticket?: SupportTicket;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    setResult(null);
    setError(null);
    setLoading(true);
    if (!authenticated || !user) return () => controller.abort();
    const owner = user.id;
    const load = async () => {
      try {
        const response = ticketNumber
          ? { ticket: await supportApi.detail(ticketNumber, controller.signal) }
          : { page: await supportApi.list(page, controller.signal) };
        if (!controller.signal.aborted) setResult({ owner, ...response });
      } catch (failure: unknown) {
        if (!controller.signal.aborted) setError(supportError(failure));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [authenticated, user, ticketNumber, page, retry, location.key]);
  if (!authenticated) return null;
  const data = result?.owner === user?.id ? result : null;
  return (
    <Stack spacing={3} sx={{ minWidth: 0 }}>
      <Typography variant="h4" component="h1">
        {ticketNumber ? 'Support Request Details' : 'My Support Requests'}
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <SupportButton />
        {ticketNumber && (
          <Button component={Link} to={supportRoutes.tickets}>
            Back to My Tickets
          </Button>
        )}
      </Stack>
      {loading && <CircularProgress aria-label="Loading support requests" />}
      {error && (
        <Alert
          severity="error"
          action={<Button onClick={() => setRetry((value) => value + 1)}>Retry</Button>}
        >
          {error}
        </Alert>
      )}
      {!loading && data?.ticket && (
        <TicketDetails key={`${user?.id}:${data.ticket.ticketNumber}`} ticket={data.ticket} />
      )}
      {!loading && data?.page && (
        <>
          {!data.page.items.length && <Typography>You have no support requests yet.</Typography>}
          {data.page.items.map((ticket) => (
            <Paper key={ticket.ticketNumber} sx={{ p: { xs: 2, sm: 3 }, minWidth: 0 }}>
              <Stack spacing={1}>
                <Typography
                  component={Link}
                  to={ticketPath(ticket.ticketNumber)}
                  fontWeight={700}
                  sx={{ overflowWrap: 'anywhere' }}
                >
                  {ticket.ticketNumber}
                </Typography>
                <Typography sx={{ overflowWrap: 'anywhere' }}>{ticket.subject}</Typography>
                <Typography color="text.secondary">
                  {supportCategories[ticket.category]} • {date(ticket.createdAtUtc)}
                </Typography>
                <Chip label={supportStatusLabels[ticket.status]} sx={{ alignSelf: 'flex-start' }} />
              </Stack>
            </Paper>
          ))}
          {data.page.totalPages > 1 && (
            <Pagination
              count={data.page.totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              size="small"
              siblingCount={0}
              sx={{ '& ul': { flexWrap: 'wrap' } }}
            />
          )}
        </>
      )}
    </Stack>
  );
}

function TicketDetails({ ticket }: { ticket: SupportTicket }) {
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  useEffect(() => {
    if (!requested) return;
    const controller = new AbortController();
    let objectUrl: string | undefined;
    setLoading(true);
    setError(null);
    void supportApi
      .screenshot(ticket.ticketNumber, controller.signal)
      .then((blob) => {
        if (controller.signal.aborted) return;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(blob.type))
          throw new Error('Unsupported screenshot');
        objectUrl = URL.createObjectURL(blob);
        setImage(objectUrl);
      })
      .catch((failure: unknown) => {
        if (!controller.signal.aborted) {
          setError(supportError(failure));
          setRequested(false);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [requested, ticket.ticketNumber]);
  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, minWidth: 0 }}>
      <Stack spacing={2} sx={{ overflowWrap: 'anywhere' }}>
        <Typography fontWeight={800}>{ticket.ticketNumber}</Typography>
        <Typography>Problem Type: {supportCategories[ticket.category]}</Typography>
        <Typography component="h2" variant="h6">
          {ticket.subject}
        </Typography>
        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{ticket.description}</Typography>
        <Chip label={supportStatusLabels[ticket.status]} sx={{ alignSelf: 'flex-start' }} />
        <Typography>Created: {date(ticket.createdAtUtc)}</Typography>
        {ticket.updatedAtUtc && <Typography>Updated: {date(ticket.updatedAtUtc)}</Typography>}
        {ticket.resolvedAtUtc && <Typography>Resolved: {date(ticket.resolvedAtUtc)}</Typography>}
        {ticket.hasScreenshot && (
          <Button disabled={loading || !!image} onClick={() => setRequested(true)}>
            View Screenshot
          </Button>
        )}
        {loading && <CircularProgress aria-label="Loading screenshot" />}
        {error && <Alert severity="error">{error}</Alert>}
        {image && (
          <img
            src={image}
            alt="Support request screenshot"
            style={{ maxWidth: '100%', height: 'auto', alignSelf: 'flex-start' }}
          />
        )}
      </Stack>
    </Paper>
  );
}
