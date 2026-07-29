import {
  Button,
  Card,
  CardActions,
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
import { Link, useSearchParams } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { buildAdminApplicationDetailsPath } from '@/constants/routes';
import {
  useGetAdminApplicationsQuery,
  useGetAdminCategoryOptionsQuery,
  useGetAdminCompanyOptionsQuery,
} from '@/features/admin/api/adminApi';
import {
  AdminApplicationStatus,
  type AdminApplicationQuery,
} from '@/features/admin/types/adminModels';
import { formatAdminDate } from '@/features/admin/utils/adminFormatting';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const PAGE_SIZE = 10;
const statusLabel = (status: AdminApplicationStatus) => AdminApplicationStatus[status];

export const AdminApplicationsPage = () => {
  useDocumentMetadata(
    'Applications | Career Portal',
    'Review Candidate job applications through Administrator APIs.',
  );
  const [params, setParams] = useSearchParams();
  const [keyword, setKeyword] = useState(params.get('keyword') ?? '');
  const debouncedKeyword = useDebouncedValue(keyword, 350);
  const pageNumber = Math.max(1, Number(params.get('page')) || 1);
  const statusValue = Number(params.get('status'));
  const status: AdminApplicationStatus | undefined = Object.values(AdminApplicationStatus).includes(
    statusValue,
  )
    ? statusValue
    : undefined;
  const query: AdminApplicationQuery = {
    categoryId: params.get('categoryId') || undefined,
    companyId: params.get('companyId') || undefined,
    keyword: params.get('keyword') || undefined,
    pageNumber,
    pageSize: PAGE_SIZE,
    status,
    submittedFromUtc: params.get('from') || undefined,
    submittedToUtc: params.get('to') || undefined,
  };
  const applications = useGetAdminApplicationsQuery(query);
  const companies = useGetAdminCompanyOptionsQuery();
  const categories = useGetAdminCategoryOptionsQuery();

  useEffect(() => {
    if ((params.get('keyword') ?? '') === debouncedKeyword.trim()) return;
    const next = new URLSearchParams(params);
    if (debouncedKeyword.trim()) next.set('keyword', debouncedKeyword.trim());
    else next.delete('keyword');
    next.delete('page');
    setParams(next, { replace: true });
  }, [debouncedKeyword, params, setParams]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const actions = (id: string) => (
    <Button component={Link} size="small" to={buildAdminApplicationDetailsPath(id)}>
      Review
    </Button>
  );

  return (
    <Stack spacing={3}>
      <DashboardPageHeader
        description="Search Candidate applications and review backend-managed statuses."
        eyebrow="Administration"
        title="Applications"
      />
      <Paper component="section" sx={{ p: 2.5 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Search applications"
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Candidate, email, or job"
              value={keyword}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="application-status-filter">Status</InputLabel>
              <Select
                label="Status"
                labelId="application-status-filter"
                onChange={(event) => setFilter('status', String(event.target.value))}
                value={status ?? ''}
              >
                <MenuItem value="">All statuses</MenuItem>
                {Object.values(AdminApplicationStatus)
                  .filter((value): value is AdminApplicationStatus => typeof value === 'number')
                  .map((value) => (
                    <MenuItem key={value} value={value}>
                      {statusLabel(value)}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="application-company-filter">Company</InputLabel>
              <Select
                label="Company"
                labelId="application-company-filter"
                onChange={(event) => setFilter('companyId', event.target.value)}
                value={query.companyId ?? ''}
              >
                <MenuItem value="">All companies</MenuItem>
                {companies.data?.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="application-category-filter">Category</InputLabel>
              <Select
                label="Category"
                labelId="application-category-filter"
                onChange={(event) => setFilter('categoryId', event.target.value)}
                value={query.categoryId ?? ''}
              >
                <MenuItem value="">All categories</MenuItem>
                {categories.data?.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              InputLabelProps={{ shrink: true }}
              fullWidth
              label="Submitted from"
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
              label="Submitted to"
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
      {applications.isLoading ? (
        <Stack aria-label="Loading applications" role="status" spacing={2}>
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton height={80} key={index} variant="rounded" />
          ))}
        </Stack>
      ) : applications.isError ? (
        <ErrorState onRetry={() => void applications.refetch()} title="Applications unavailable" />
      ) : applications.data?.items.length ? (
        <>
          <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Table aria-label="Administrator applications">
              <TableHead>
                <TableRow>
                  <TableCell>Candidate</TableCell>
                  <TableCell>Job</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Resume</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.data.items.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <Typography fontWeight={700}>{application.candidateName}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        {application.candidateEmail}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {application.jobTitle}
                      <Typography color="text.secondary" variant="body2">
                        {application.companyName} · {application.categoryName}
                      </Typography>
                    </TableCell>
                    <TableCell>{statusLabel(application.status)}</TableCell>
                    <TableCell>{formatAdminDate(application.submittedAtUtc)}</TableCell>
                    <TableCell>{application.hasResume ? 'Available' : 'None'}</TableCell>
                    <TableCell>{actions(application.id)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
            {applications.data.items.map((application) => (
              <Card component="article" key={application.id}>
                <CardContent>
                  <Typography component="h2" variant="h3">
                    {application.candidateName}
                  </Typography>
                  <Typography>{application.jobTitle}</Typography>
                  <Typography color="text.secondary">
                    {statusLabel(application.status)} ·{' '}
                    {formatAdminDate(application.submittedAtUtc)}
                  </Typography>
                </CardContent>
                <CardActions>{actions(application.id)}</CardActions>
              </Card>
            ))}
          </Stack>
          {applications.data.totalPages > 1 ? (
            <Pagination
              aria-label="Applications pagination"
              count={applications.data.totalPages}
              onChange={(_, page) => setFilter('page', String(page))}
              page={pageNumber}
              sx={{ alignSelf: 'center' }}
            />
          ) : null}
        </>
      ) : (
        <EmptyState
          description="No applications match the current Administrator filters."
          title="No applications found"
        />
      )}
    </Stack>
  );
};
