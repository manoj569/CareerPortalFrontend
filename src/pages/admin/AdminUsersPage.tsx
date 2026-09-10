import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import { Alert, Box, Button, Card, CardContent, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { buildAdminUserDetailsPath } from '@/constants/routes';
import { useGetAdminRecentUsersQuery } from '@/features/admin/api/adminApi';
import { AdminUserStatusBadge } from '@/features/admin/components/AdminStatusBadge';
import { UserStatus } from '@/features/admin/types/adminModels';
import { formatAdminDate, getAdminUserStatusLabel } from '@/features/admin/utils/adminFormatting';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const isUserStatus = (value: number): value is UserStatus =>
  Object.values(UserStatus).includes(value);

export const AdminUsersPage = () => {
  useDocumentMetadata(
    'Recent users | Career Portal',
    'Review the recent user reporting data available to administrators.',
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const users = useGetAdminRecentUsersQuery(100);
  const search = searchParams.get('search') ?? '';
  const statusValue = Number(searchParams.get('status'));
  const status = isUserStatus(statusValue) ? statusValue : undefined;

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return (users.data ?? []).filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        user.id.toLowerCase().includes(normalizedSearch);
      return matchesSearch && (!status || user.status === status);
    });
  }, [search, status, users.data]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        description="Read-only recent-user reporting from the administrator dashboard endpoint."
        eyebrow="Administration"
        title="Users"
      />
      <Alert severity="warning">
        The backend does not expose an administrator user list, pagination, role data, entitlement
        state, details, or account actions. This view is limited to the 100 most recent users and
        filters only those displayed records.
      </Alert>

      <Paper component="section" sx={{ p: 2.5 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              label="Filter displayed users"
              onChange={(event) => setFilter('search', event.target.value)}
              placeholder="Name, email, or user ID"
              value={search}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="user-status-filter-label">Account status</InputLabel>
              <Select
                label="Account status"
                labelId="user-status-filter-label"
                onChange={(event) => setFilter('status', String(event.target.value))}
                value={status ?? ''}
              >
                <MenuItem value="">All displayed statuses</MenuItem>
                {Object.values(UserStatus)
                  .filter((value): value is UserStatus => typeof value === 'number')
                  .map((value) => (
                    <MenuItem key={value} value={value}>
                      {getAdminUserStatusLabel(value)}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {users.isLoading ? <PageLoadingIndicator label="Loading recent users" /> : users.isError ? (
        <ErrorState onRetry={() => void users.refetch()} title="Recent users unavailable" />
      ) : filteredUsers.length ? (
        <>
          <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Table aria-label="Recent administrator user report">
              <caption className="sr-only">
                Recent users including account status, registration, and login dates
              </caption>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Email verification</TableCell>
                  <TableCell>Registered</TableCell>
                  <TableCell>Last login</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Typography fontWeight={700}>
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography
                        color="text.secondary"
                        sx={{ overflowWrap: 'anywhere' }}
                        variant="body2"
                      >
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <AdminUserStatusBadge status={user.status} />
                    </TableCell>
                    <TableCell>{user.emailConfirmed ? 'Confirmed' : 'Not confirmed'}</TableCell>
                    <TableCell>{formatAdminDate(user.createdAtUtc)}</TableCell>
                    <TableCell>{formatAdminDate(user.lastLoginAtUtc)}</TableCell>
                    <TableCell>
                      <Button component={Link} size="small" to={buildAdminUserDetailsPath(user.id)}>
                        Capability details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
            {filteredUsers.map((user) => (
              <Card component="article" key={user.id}>
                <CardContent>
                  <Stack spacing={1.25}>
                    <Stack
                      alignItems="center"
                      direction="row"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Box minWidth={0}>
                        <Typography fontWeight={700}>
                          {user.firstName} {user.lastName}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          sx={{ overflowWrap: 'anywhere' }}
                          variant="body2"
                        >
                          {user.email}
                        </Typography>
                      </Box>
                      <AdminUserStatusBadge status={user.status} />
                    </Stack>
                    <Typography color="text.secondary" variant="body2">
                      Registered {formatAdminDate(user.createdAtUtc)}
                    </Typography>
                    <Button
                      component={Link}
                      sx={{ alignSelf: 'flex-start' }}
                      to={buildAdminUserDetailsPath(user.id)}
                    >
                      Capability details
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </>
      ) : (
        <EmptyState
          actionLabel="Clear filters"
          description="No displayed recent-user records match these local filters."
          onAction={() => setSearchParams(new URLSearchParams())}
          title="No users found"
        />
      )}
    </Stack>
  );
};
