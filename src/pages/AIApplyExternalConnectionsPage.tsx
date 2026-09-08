import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import { Alert, Box, Grid, Stack, Typography } from '@mui/material';

import { AIApplySectionNavigation } from '@/features/aiApply/components/AIApplySectionNavigation';
import { ExternalSessionConnectionCard } from '@/features/aiApply/components/ExternalSessionConnectionCard';
import { ExternalSessionSite } from '@/features/aiApply/types/aiApplyModels';

const registeredSites = [
  { displayName: 'Workday', site: ExternalSessionSite.Workday },
  { displayName: 'LinkedIn', site: ExternalSessionSite.LinkedIn },
  { displayName: 'Naukri', site: ExternalSessionSite.Naukri },
  { displayName: 'Indeed', site: ExternalSessionSite.Indeed },
  { displayName: 'Foundit', site: ExternalSessionSite.Foundit },
  { displayName: 'Wellfound', site: ExternalSessionSite.Wellfound },
] as const;

export const AIApplyExternalConnectionsPage = () => (
  <Stack spacing={3} sx={{ maxWidth: 1100, mx: 'auto', pb: 6 }}>
    <Box>
      <Typography component="h1" variant="h3">
        External Site Connections
      </Typography>
      <Typography color="text.secondary">
        Review and revoke external-site sessions used by AI Apply.
      </Typography>
    </Box>
    <AIApplySectionNavigation />
    <Alert icon={<SecurityOutlinedIcon />} severity="info">
      Career Harbor never asks for your external-site password. Authentication happens directly with
      the external site, secure connection may not be supported for every site, and you can revoke a
      connected session here.
    </Alert>
    <Grid container spacing={2}>
      {registeredSites.map((site) => (
        <Grid key={site.site} size={{ xs: 12, md: 6 }}>
          <ExternalSessionConnectionCard {...site} />
        </Grid>
      ))}
    </Grid>
    <Typography color="text.secondary" variant="body2">
      If secure connection is unavailable, you can still complete external-site sign-in or human
      verification from the application handoff screen.
    </Typography>
  </Stack>
);
