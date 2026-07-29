import {
  Alert,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useGetAdminAuditLogsQuery } from '@/features/admin/api/adminApi';
import { AuditAction } from '@/features/admin/types/adminModels';
import { formatAdminDate } from '@/features/admin/utils/adminFormatting';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const PAGE_SIZE = 20;

export const AdminAuditLogsPage = () => {
  useDocumentMetadata(
    'Audit logs | Career Portal',
    'Read append-only Career Portal Administrator audit logs.',
  );
  const [params, setParams] = useSearchParams();
  const [correlationId, setCorrelationId] = useState(params.get('correlationId') ?? '');
  const debouncedCorrelationId = useDebouncedValue(correlationId, 350);
  const pageNumber = Math.max(1, Number(params.get('page')) || 1);
  const actionValue = Number(params.get('action'));
  const action: AuditAction | undefined = Object.values(AuditAction).includes(actionValue)
    ? actionValue
    : undefined;
  const logs = useGetAdminAuditLogsQuery({
    action,
    correlationId: params.get('correlationId') || undefined,
    entityId: params.get('entityId') || undefined,
    entityType: params.get('entityType') || undefined,
    fromUtc: params.get('from') || undefined,
    pageNumber,
    pageSize: PAGE_SIZE,
    toUtc: params.get('to') || undefined,
  });

  useEffect(() => {
    if ((params.get('correlationId') ?? '') === debouncedCorrelationId.trim()) return;
    const next = new URLSearchParams(params);
    if (debouncedCorrelationId.trim()) next.set('correlationId', debouncedCorrelationId.trim());
    else next.delete('correlationId');
    next.delete('page');
    setParams(next, { replace: true });
  }, [debouncedCorrelationId, params, setParams]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        description="Append-only security and administrative activity. Audit records cannot be edited or deleted."
        eyebrow="Administration"
        title="Audit logs"
      />
      <Alert severity="info">
        This screen is strictly read-only. Metadata is displayed exactly as recorded by the backend.
      </Alert>
      <Paper component="section" sx={{ p: 2.5 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Correlation ID"
              onChange={(event) => setCorrelationId(event.target.value)}
              value={correlationId}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="audit-action-filter">Action</InputLabel>
              <Select
                label="Action"
                labelId="audit-action-filter"
                onChange={(event) => setFilter('action', String(event.target.value))}
                value={action ?? ''}
              >
                <MenuItem value="">All actions</MenuItem>
                {Object.values(AuditAction)
                  .filter((value): value is AuditAction => typeof value === 'number')
                  .map((value) => (
                    <MenuItem key={value} value={value}>
                      {AuditAction[value]}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Entity type"
              onChange={(event) => setFilter('entityType', event.target.value.trim())}
              value={params.get('entityType') ?? ''}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Entity ID"
              onChange={(event) => setFilter('entityId', event.target.value.trim())}
              value={params.get('entityId') ?? ''}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              InputLabelProps={{ shrink: true }}
              fullWidth
              label="From"
              onChange={(event) =>
                setFilter(
                  'from',
                  event.target.value ? new Date(event.target.value).toISOString() : '',
                )
              }
              type="date"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              InputLabelProps={{ shrink: true }}
              fullWidth
              label="To"
              onChange={(event) =>
                setFilter(
                  'to',
                  event.target.value ? new Date(event.target.value).toISOString() : '',
                )
              }
              type="date"
            />
          </Grid>
        </Grid>
      </Paper>
      {logs.isLoading ? (
        <Stack aria-label="Loading audit logs" role="status" spacing={2}>
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton height={76} key={index} variant="rounded" />
          ))}
        </Stack>
      ) : logs.isError ? (
        <ErrorState onRetry={() => void logs.refetch()} title="Audit logs unavailable" />
      ) : logs.data?.items.length ? (
        <>
          <TableContainer component={Paper} sx={{ display: { xs: 'none', lg: 'block' } }}>
            <Table aria-label="Administrator audit logs">
              <TableHead>
                <TableRow>
                  <TableCell>Occurred</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Entity</TableCell>
                  <TableCell>Actor</TableCell>
                  <TableCell>Correlation ID</TableCell>
                  <TableCell>Metadata</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.data.items.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatAdminDate(log.occurredAtUtc)}</TableCell>
                    <TableCell>{AuditAction[log.action]}</TableCell>
                    <TableCell>
                      {log.entityType}
                      <Typography color="text.secondary" variant="body2">
                        {log.entityId}
                      </Typography>
                    </TableCell>
                    <TableCell>{log.actorRole ?? 'System'}</TableCell>
                    <TableCell sx={{ overflowWrap: 'anywhere' }}>
                      {log.correlationId ?? 'Not recorded'}
                    </TableCell>
                    <TableCell>
                      {Object.entries(log.metadata)
                        .map(([key, value]) => `${key}: ${value ?? 'null'}`)
                        .join(' · ') || 'None'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack spacing={2} sx={{ display: { xs: 'flex', lg: 'none' } }}>
            {logs.data.items.map((log) => (
              <Card component="article" key={log.id}>
                <CardContent>
                  <Typography component="h2" variant="h3">
                    {AuditAction[log.action]}
                  </Typography>
                  <Typography>
                    {log.entityType} · {log.entityId}
                  </Typography>
                  <Typography color="text.secondary">
                    {formatAdminDate(log.occurredAtUtc)} · {log.actorRole ?? 'System'}
                  </Typography>
                  <Typography color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                    Correlation: {log.correlationId ?? 'Not recorded'}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
          {logs.data.totalPages > 1 ? (
            <Pagination
              aria-label="Audit logs pagination"
              count={logs.data.totalPages}
              onChange={(_, page) => setFilter('page', String(page))}
              page={pageNumber}
              sx={{ alignSelf: 'center' }}
            />
          ) : null}
        </>
      ) : (
        <EmptyState
          description="No audit records match the current filters."
          title="No audit logs found"
        />
      )}
    </Stack>
  );
};
