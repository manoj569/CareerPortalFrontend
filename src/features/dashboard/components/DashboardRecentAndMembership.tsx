import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { Alert, Box, Button, Chip, Grid, Link as MuiLink, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { ROUTES, buildApplicationDetailsPath } from '@/constants/routes';
import { ApplicationStatusChip } from '@/features/dashboard/components/ApplicationStatusChip';
import { CompanyLogoFallback } from '@/features/jobs/components/CompanyLogoFallback';
import type { ApplicationsPage, Membership } from '@/features/dashboard/types/dashboardModels';
import { formatDashboardDate, getMembershipStatusLabel } from '@/features/dashboard/utils/dashboardFormatting';
import { isMembershipActive } from '@/features/payments/utils/entitlement';

interface DashboardRecentAndMembershipProps {
  applications?: ApplicationsPage;
  applicationsLoading: boolean;
  applicationsError: boolean;
  onRetryApplications: () => void;
  memberships?: Membership[];
  membershipsLoading: boolean;
  membershipsError: boolean;
  onRetryMemberships: () => void;
}

const PanelLoading = () => <Stack spacing={1.5}>{Array.from({ length: 2 }, (_, index) => <Box key={index}><Skeleton width="55%" /><Skeleton width="80%" /></Box>)}</Stack>;

export const DashboardRecentAndMembership = ({ applications, applicationsLoading, applicationsError, onRetryApplications, memberships, membershipsLoading, membershipsError, onRetryMemberships }: DashboardRecentAndMembershipProps) => (
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, lg: 7 }}>
      <Paper component="section" aria-labelledby="dashboard-recent-applications" variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2.5, height: '100%', borderColor: '#dce5f5', boxShadow: '0 3px 12px rgba(37,76,145,.055)' }}>
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 2, bgcolor: '#e9f1ff', color: 'primary.main' }}><DescriptionOutlinedIcon /></Box>
            <Box>
              <Typography component="h2" id="dashboard-recent-applications" variant="h6" fontWeight={800}>Recent applications</Typography>
              <Typography variant="body2" color="text.secondary">Track your latest applications.</Typography>
            </Box>
            </Stack>
            <MuiLink component={Link} to={ROUTES.APPLICATIONS} underline="hover" fontWeight={700} sx={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>View all</MuiLink>
          </Stack>

          {applicationsLoading ? <PanelLoading /> : applicationsError ? <Alert severity="info" action={<Button onClick={onRetryApplications}>Retry</Button>}>Applications are temporarily unavailable.</Alert> : applications?.items.length ? applications.items.slice(0, 5).map((application) => (
            <Box key={application.id} sx={{ display: 'grid', gridTemplateColumns: '38px minmax(0, 1fr) auto', gap: 1.25, alignItems: 'center', borderTop: 1, borderColor: 'divider', pt: 1.25 }}>
              <CompanyLogoFallback companyName={application.companyName} size={34} />
              <Box sx={{ minWidth: 0 }}>
                <MuiLink component={Link} to={buildApplicationDetailsPath(application.id)} underline="hover" fontWeight={700} sx={{ display: 'block', overflowWrap: 'anywhere' }}>{application.jobTitle}</MuiLink>
                <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{application.companyName}{application.location ? ` · ${application.location}` : ''}</Typography>
              </Box>
              <Stack alignItems="flex-end" spacing={0.5}><ApplicationStatusChip status={application.status} /><Typography variant="caption" color="text.secondary">{formatDashboardDate(application.submittedAtUtc) ?? 'Date unavailable'}</Typography></Stack>
            </Box>
          )) : (
            <Stack alignItems="flex-start" spacing={1} sx={{ borderTop: 1, borderColor: 'divider', pt: 1.5 }}>
              <Typography color="text.secondary" variant="body2">No applications have been recorded yet.</Typography>
              <Button component={Link} to={ROUTES.DASHBOARD_JOBS} variant="outlined">Browse jobs</Button>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Grid>

    <Grid size={{ xs: 12, lg: 5 }}>
      <Paper component="section" aria-labelledby="dashboard-membership-access" variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2.5, height: '100%', borderColor: '#dce5f5', boxShadow: '0 3px 12px rgba(37,76,145,.055)' }}>
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: '50%', bgcolor: '#fff0df', color: '#d97500' }}><WorkspacePremiumOutlinedIcon aria-hidden="true" /></Box>
              <Box>
                <Typography component="h2" id="dashboard-membership-access" variant="h6" fontWeight={800}>Membership access</Typography>
                <Typography variant="body2" color="text.secondary">Your current plan and access status.</Typography>
              </Box>
            </Stack>
            <Button component={Link} to={ROUTES.MEMBERSHIP} variant="outlined" sx={{ minHeight: 40, px: 2 }}>Manage plan</Button>
          </Stack>

          {membershipsLoading ? <PanelLoading /> : membershipsError ? <Alert severity="info" action={<Button onClick={onRetryMemberships}>Retry</Button>}>Membership information is temporarily unavailable.</Alert> : memberships?.length ? memberships.map((membership) => {
            const active = isMembershipActive(membership);
            return <Box key={membership.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, alignItems: 'flex-start', borderTop: 1, borderColor: 'divider', pt: 1.25 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>{membership.planName}</Typography>
                <Typography variant="body2" color="text.secondary">{membership.endsAtUtc ? `Ends ${formatDashboardDate(membership.endsAtUtc) ?? 'date unavailable'}` : 'No end date'}</Typography>
              </Box>
              <Chip size="small" color={active ? 'success' : 'default'} variant={active ? 'filled' : 'outlined'} label={getMembershipStatusLabel(membership.status)} />
            </Box>;
          }) : (
            <Stack spacing={1} sx={{ borderTop: 1, borderColor: 'divider', pt: 1.5 }}>
              <Typography color="text.secondary" variant="body2">You do not currently have a membership plan.</Typography>
              <Button component={Link} to={ROUTES.MEMBERSHIP} variant="outlined" sx={{ alignSelf: 'flex-start' }}>Explore plans</Button>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Grid>
  </Grid>
);
