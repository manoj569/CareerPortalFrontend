import { useState, type FormEvent } from 'react';
import {
  Button,
  Chip,
  Grid,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { formatAdminDate } from '@/features/admin/utils/adminFormatting';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { useAppSelector } from '@/hooks/reduxHooks';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/store/authSlice';
import { UserRole } from '@/types';
import {
  supportCategories,
  supportStatusLabels,
  type SupportCategory,
  type SupportStatus,
} from '../supportApi';
import {
  adminSupportError,
  adminSupportPath,
  useGetAdminSupportTicketsQuery,
  type AdminSupportQuery,
} from './adminSupportApi';

function category(value: string | null): SupportCategory | undefined {
  return value && Object.keys(supportCategories).includes(value)
    ? (value as SupportCategory)
    : undefined;
}
function status(value: string | null): SupportStatus | undefined {
  return value && Object.keys(supportStatusLabels).includes(value)
    ? (value as SupportStatus)
    : undefined;
}
function utc(value: string | null): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : undefined;
}

export function AdminSupportTicketsPage() {
  useDocumentMetadata('Support Tickets | Career Harbor', 'Manage Career Harbor support requests.');
  const [params, setParams] = useSearchParams();
  const user = useAppSelector(selectCurrentUser);
  const authenticated = useAppSelector(selectIsAuthenticated);
  const pageValue = Number(params.get('page') ?? '1');
  const page =
    Number.isInteger(pageValue) && pageValue >= 1 && pageValue <= 1_000_000 ? pageValue : 1;
  const query: AdminSupportQuery = {
    PageNumber: page,
    PageSize: 20,
    Status: status(params.get('status')),
    Category: category(params.get('category')),
    Email: params.get('email')?.trim() || undefined,
    TicketNumber: params.get('ticket')?.trim() || undefined,
    FromUtc: utc(params.get('from')),
    ToUtc: utc(params.get('to')),
  };
  const invalidRange = !!(
    (params.get('from') && !query.FromUtc) ||
    (params.get('to') && !query.ToUtc) ||
    (query.FromUtc && query.ToUtc && query.FromUtc >= query.ToUtc)
  );
  const tickets = useGetAdminSupportTicketsQuery(query, {
    skip: !authenticated || user?.role !== UserRole.Administrator || invalidRange,
  });
  const activeFilters = ['status', 'category', 'email', 'ticket', 'from', 'to'].some(
    (key) => !!params.get(key),
  );
  const setStatus = (value: SupportStatus | '') => {
    const next = new URLSearchParams(params);
    if (value) next.set('status', value);
    else next.delete('status');
    next.delete('page');
    setParams(next);
  };
  if (!authenticated || user?.role !== UserRole.Administrator) return null;
  return (
    <Stack spacing={3} sx={{ minWidth: 0 }}>
      <DashboardPageHeader
        eyebrow="Administration"
        title="Support Tickets"
        description="Review guest and registered-user support requests."
      />
      <ToggleButtonGroup
        exclusive
        value={query.Status ?? ''}
        onChange={(_, value: unknown) => {
          if (
            typeof value === 'string' &&
            (value === '' || Object.keys(supportStatusLabels).includes(value))
          )
            setStatus(value as SupportStatus | '');
        }}
        aria-label="Filter support requests by status"
        sx={{ flexWrap: 'wrap' }}
      >
        <ToggleButton value="">All</ToggleButton>
        {Object.entries(supportStatusLabels).map(([value, label]) => (
          <ToggleButton key={value} value={value}>
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Filters
        key={params.toString()}
        params={params}
        apply={(next) => setParams(next)}
        clear={() => setParams({})}
      />
      {invalidRange ? (
        <Typography role="alert" color="error">
          Created before must be later than Created from.
        </Typography>
      ) : tickets.isLoading || tickets.isFetching ? (
        <PageLoadingIndicator label="Loading support tickets" />
      ) : tickets.isError ? (
        <ErrorState
          title="Support tickets unavailable"
          description={adminSupportError(tickets.error)}
          onRetry={() => {
            void tickets.refetch();
          }}
        />
      ) : (
        tickets.currentData && (
          <>
            <Typography variant="body2" color="text.secondary">
              {tickets.currentData.totalCount} support requests
              {activeFilters ? ' matching these filters' : ''}
            </Typography>
            {!tickets.currentData.items.length ? (
              <EmptyState
                title={
                  activeFilters
                    ? 'No support requests match these filters.'
                    : 'No support requests found.'
                }
                description="New requests will appear here once submitted."
              />
            ) : (
              <TableContainer component={Paper}>
                <Table aria-label="Support tickets" sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                      {[
                        'Ticket Number',
                        'User / Guest',
                        'Email',
                        'Category',
                        'Subject',
                        'Status',
                        'Created',
                        'Action',
                      ].map((label) => (
                        <TableCell key={label}>{label}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tickets.currentData.items.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell sx={{ maxWidth: 200, overflowWrap: 'anywhere' }}>
                          <Link to={adminSupportPath(ticket.id)}>{ticket.ticketNumber}</Link>
                        </TableCell>
                        <TableCell>
                          <Typography>{ticket.name}</Typography>
                          <Typography color="text.secondary" variant="caption">
                            {ticket.userId ? 'Registered User' : 'Guest User'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200, overflowWrap: 'anywhere' }}>
                          {ticket.email}
                        </TableCell>
                        <TableCell>{supportCategories[ticket.category]}</TableCell>
                        <TableCell sx={{ maxWidth: 250, overflowWrap: 'anywhere' }}>
                          {ticket.subject}
                        </TableCell>
                        <TableCell>
                          <Chip label={supportStatusLabels[ticket.status]} size="small" />
                        </TableCell>
                        <TableCell>{formatAdminDate(ticket.createdAtUtc)}</TableCell>
                        <TableCell>
                          <Button
                            component={Link}
                            to={adminSupportPath(ticket.id)}
                            aria-label={`View ${ticket.ticketNumber}`}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {tickets.currentData.totalPages > 1 && (
              <Pagination
                count={tickets.currentData.totalPages}
                page={page}
                siblingCount={0}
                onChange={(_, value) => {
                  const next = new URLSearchParams(params);
                  next.set('page', String(value));
                  setParams(next);
                }}
              />
            )}
          </>
        )
      )}
    </Stack>
  );
}

function Filters({
  params,
  apply,
  clear,
}: {
  params: URLSearchParams;
  apply: (params: URLSearchParams) => void;
  clear: () => void;
}) {
  const [draft, setDraft] = useState({
    category: category(params.get('category')) ?? '',
    email: params.get('email') ?? '',
    ticket: params.get('ticket') ?? '',
    from: params.get('from') ?? '',
    to: params.get('to') ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (
      (draft.from && !utc(draft.from)) ||
      (draft.to && !utc(draft.to)) ||
      (draft.from && draft.to && new Date(draft.from) >= new Date(draft.to))
    ) {
      setError('Enter a valid date range. Created before must be later than Created from.');
      return;
    }
    setError(null);
    const next = new URLSearchParams(params);
    next.delete('page');
    for (const [key, value] of Object.entries(draft)) {
      if (value.trim()) next.set(key, value.trim());
      else next.delete(key);
    }
    apply(next);
  }
  return (
    <Paper component="form" onSubmit={submit} sx={{ p: 2.5 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            select
            label="Category"
            value={draft.category}
            onChange={(event) => setDraft({ ...draft, category: event.target.value })}
          >
            <MenuItem value="">All categories</MenuItem>
            {Object.entries(supportCategories).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            type="email"
            label="Email (exact match)"
            value={draft.email}
            onChange={(event) => setDraft({ ...draft, email: event.target.value })}
            slotProps={{ htmlInput: { maxLength: 256 } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            label="Ticket Number (exact match)"
            value={draft.ticket}
            onChange={(event) => setDraft({ ...draft, ticket: event.target.value })}
            slotProps={{ htmlInput: { maxLength: 40 } }}
          />
        </Grid>
        {(['from', 'to'] as const).map((key) => (
          <Grid key={key} size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="datetime-local"
              label={key === 'from' ? 'Created from' : 'Created before'}
              value={draft[key]}
              onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
        ))}
        <Grid size={12}>
          <Typography variant="caption" color="text.secondary">
            Dates use your local timezone. “Created before” excludes that time.
          </Typography>
          {error && (
            <Typography role="alert" color="error">
              {error}
            </Typography>
          )}
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button type="submit" variant="contained">
              Apply Filters
            </Button>
            <Button type="button" onClick={clear}>
              Clear Filters
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
