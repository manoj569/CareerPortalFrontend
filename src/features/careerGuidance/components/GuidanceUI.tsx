import type { ReactNode } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { guidanceErrorMessage } from '../utils/errors';
import { enumLabel, guidancePolicy } from '../utils/presentation';
import { guidanceRoutes } from '../utils/routes';

export const GuidancePage = ({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) => {
  const isAdminPage = window.location.pathname.startsWith('/admin/');
  useDocumentMetadata(
    isAdminPage
      ? `${title} | Career Guidance Admin | Career Harbor`
      : `${title} | Career Guidance | Career Harbor`,
    description ?? 'Career guidance from independent professionals.',
  );

  return (
    <Stack spacing={3} sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
      <DashboardPageHeader
        title={title}
        description={description ?? 'Career guidance from independent professionals.'}
        eyebrow="Career Guidance"
        actions={actions}
      />
      {children}
    </Stack>
  );
};

export const TrustNotice = () => <Alert severity="info">{guidancePolicy}</Alert>;
export const GuidanceLoading = () => (
  <Stack aria-label="Loading career guidance" role="status" spacing={2}>
    <Skeleton height={70} />
    <Grid container spacing={2}>
      {[1, 2, 3].map((key) => (
        <Grid key={key} size={{ xs: 12, md: 4 }}>
          <Skeleton variant="rounded" height={200} />
        </Grid>
      ))}
    </Grid>
  </Stack>
);
export const GuidanceError = ({ error, retry }: { error: unknown; retry: () => unknown }) => (
  <ErrorState
    description={guidanceErrorMessage(error)}
    onRetry={() => {
      void retry();
    }}
  />
);
export const StatusChip = ({
  values,
  value,
}: {
  values: Record<number, string>;
  value: number;
}) => <Chip size="small" variant="outlined" label={enumLabel(values, value)} />;
export const GuidancePagination = ({
  page,
  count,
  onChange,
}: {
  page: number;
  count: number;
  onChange: (page: number) => void;
}) =>
  count > 1 ? (
    <Box display="flex" justifyContent="center">
      <Pagination
        page={page}
        count={count}
        siblingCount={0}
        onChange={(_, value) => onChange(value)}
      />
    </Box>
  ) : null;
export const MetricCards = ({ metrics }: { metrics: { label: string; value: ReactNode }[] }) => (
  <Grid container spacing={2}>
    {metrics.map((metric) => (
      <Grid key={metric.label} size={{ xs: 6, md: 3 }}>
        <Paper sx={{ p: 2.5, height: '100%' }}>
          <Typography color="text.secondary" variant="body2">
            {metric.label}
          </Typography>
          <Typography variant="h3" sx={{ mt: 1 }}>
            {metric.value}
          </Typography>
        </Paper>
      </Grid>
    ))}
  </Grid>
);
export const GuidanceNavigation = ({
  owner = false,
  admin = false,
}: {
  owner?: boolean;
  admin?: boolean;
}) => (
  <Stack
    component="nav"
    aria-label="Career guidance navigation"
    direction="row"
    flexWrap="wrap"
    gap={1}
  >
    {(admin
      ? [
          ['Consultants', guidanceRoutes.admin('consultants')],
          ['Reviews', guidanceRoutes.admin('reviews')],
          ['Disputes', guidanceRoutes.admin('disputes')],
          ['Sessions', guidanceRoutes.admin('sessions')],
          ['Analytics', guidanceRoutes.admin('analytics')],
        ]
      : owner
        ? [
            ['Overview', guidanceRoutes.owner()],
            ['Profile', guidanceRoutes.owner('profile')],
            ['Services', guidanceRoutes.owner('services')],
            ['Availability', guidanceRoutes.owner('availability')],
            ['Bookings', guidanceRoutes.owner('bookings')],
            ['Disputes', guidanceRoutes.owner('disputes')],
            ['Analytics', guidanceRoutes.owner('analytics')],
          ]
        : [
            ['Find a consultant', guidanceRoutes.marketplace],
            ['My bookings', guidanceRoutes.bookings],
            ['Become a consultant', guidanceRoutes.becomeConsultant],
          ]
    ).map(([label, path]) => (
      <Button key={path} component={Link} to={path!}>
        {label}
      </Button>
    ))}
  </Stack>
);
