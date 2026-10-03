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
import { Link, useLocation } from 'react-router-dom';
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
        description={
          description ?? 'Career guidance from independent professionals.'
        }
        eyebrow="Career Guidance"
        actions={actions}
      />
      {children}
    </Stack>
  );
};

export const TrustNotice = () => (
  <Alert severity="info">{guidancePolicy}</Alert>
);

export const GuidanceLoading = () => (
  <Stack
    aria-label="Loading career guidance"
    role="status"
    spacing={2}
  >
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

export const GuidanceError = ({
  error,
  retry,
}: {
  error: unknown;
  retry: () => unknown;
}) => (
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
}) => (
  <Chip
    size="small"
    variant="outlined"
    label={enumLabel(values, value)}
  />
);

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

export const MetricCards = ({
  metrics,
}: {
  metrics: { label: string; value: ReactNode }[];
}) => (
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

const ConsultantNavigation = () => {
  const location = useLocation();

  const items: Array<{
    label: string;
    path: string;
    active: boolean;
  }> = [
    {
      label: 'Overview',
      path: guidanceRoutes.owner(),
      active:
        location.pathname === guidanceRoutes.owner() ||
        location.pathname === `${guidanceRoutes.owner()}/`,
    },
    {
      label: 'My Offering',
      path: guidanceRoutes.owner('profile'),
      active: [
        guidanceRoutes.owner('profile'),
        guidanceRoutes.owner('services'),
        guidanceRoutes.owner('availability'),
      ].some(
        (path) =>
          location.pathname === path ||
          location.pathname.startsWith(`${path}/`),
      ),
    },
    {
      label: 'Bookings',
      path: guidanceRoutes.owner('bookings'),
      active:
        location.pathname === guidanceRoutes.owner('bookings') ||
        location.pathname.startsWith(
          `${guidanceRoutes.owner('bookings')}/`,
        ) ||
        location.pathname.startsWith(
          `${guidanceRoutes.owner('sessions')}/`,
        ) ||
        location.pathname.startsWith(
          `${guidanceRoutes.owner('disputes')}/`,
        ),
    },
    {
      label: 'Performance',
      path: guidanceRoutes.owner('analytics'),
      active:
        location.pathname === guidanceRoutes.owner('analytics') ||
        location.pathname.startsWith(
          `${guidanceRoutes.owner('analytics')}/`,
        ),
    },
  ];

  return (
    <Box
      component="nav"
      aria-label="Consultant workspace navigation"
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        overflowX: 'auto',
      }}
    >
      <Stack
        direction="row"
        spacing={{ xs: 0.5, sm: 1 }}
        sx={{ minWidth: 'max-content' }}
      >
        {items.map((item) => (
          <Button
            key={item.path}
            component={Link}
            to={item.path}
            aria-current={item.active ? 'page' : undefined}
            sx={{
              position: 'relative',
              minHeight: 48,
              px: { xs: 1.5, sm: 2 },
              borderRadius: 0,
              color: item.active
                ? 'primary.main'
                : 'text.secondary',
              fontWeight: item.active ? 700 : 600,
              textTransform: 'none',
              whiteSpace: 'nowrap',

              '&::after': item.active
                ? {
                    content: '""',
                    position: 'absolute',
                    left: 12,
                    right: 12,
                    bottom: -1,
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                    bgcolor: 'primary.main',
                  }
                : undefined,

              '&:hover': {
                bgcolor: 'action.hover',
                color: 'primary.main',
              },
            }}
          >
            {item.label}
          </Button>
        ))}
      </Stack>
    </Box>
  );
};

export const GuidanceNavigation = ({
  owner = false,
  admin = false,
}: {
  owner?: boolean;
  admin?: boolean;
}) => {
  if (owner) {
    return <ConsultantNavigation />;
  }

  const items: Array<[string, string]> = admin
    ? [
        ['Consultants', guidanceRoutes.admin('consultants')],
        ['Reviews', guidanceRoutes.admin('reviews')],
        ['Disputes', guidanceRoutes.admin('disputes')],
        ['Sessions', guidanceRoutes.admin('sessions')],
        ['Analytics', guidanceRoutes.admin('analytics')],
      ]
    : [
        ['Find a consultant', guidanceRoutes.marketplace],
        ['My bookings', guidanceRoutes.bookings],
        ['Become a consultant', guidanceRoutes.becomeConsultant],
      ];

  return (
    <Stack
      component="nav"
      aria-label="Career guidance navigation"
      direction="row"
      flexWrap="wrap"
      gap={1}
    >
      {items.map(([label, path]) => (
        <Button
          key={path}
          component={Link}
          to={path}
        >
          {label}
        </Button>
      ))}
    </Stack>
  );
};