import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Alert, Box, Button, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import { buildDashboardHiringDriveDetailsPath, buildDashboardJobDetailsPath, ROUTES } from '@/constants/routes';
import { selectIsAuthenticated } from '@/features/auth/store/authSlice';
import { CompanyLogoFallback } from '@/features/jobs/components/CompanyLogoFallback';
import { useClickHiringDriveMutation, useGetHiringDriveByIdQuery } from '@/features/hiringDrives/api';
import type { HiringDestination } from '@/features/hiringDrives/types';
import { useAppSelector } from '@/hooks/reduxHooks';
import { getSafeExternalUrl } from '@/utils/safeExternalUrl';

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' }).format(date);
};

export const HiringDriveDetailsPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data: drive, isLoading, isError, refetch } = useGetHiringDriveByIdQuery(id, { skip: !id });
  const [click, clickState] = useClickHiringDriveMutation();
  const pending = useRef(false);
  const [applyError, setApplyError] = useState('');
  const dashboardContext = location.pathname.startsWith('/dashboard/');
  const backPath = dashboardContext ? '/dashboard' : '/';

  const apply = async () => {
    if (!isAuthenticated) {
      void navigate(ROUTES.LOGIN, { state: { from: { pathname: buildDashboardHiringDriveDetailsPath(id) } } });
      return;
    }
    if (pending.current) return;
    pending.current = true;
    setApplyError('');
    try {
      const destination: HiringDestination = await click(id).unwrap();
      if (destination.destinationType === 'internalJob' && destination.jobSlug?.trim()) {
        void navigate(buildDashboardJobDetailsPath(destination.jobSlug));
      } else if (destination.destinationType === 'external') {
        const url = getSafeExternalUrl(destination.url);
        if (!url?.startsWith('https://')) throw new Error('Invalid destination');
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('Unavailable destination');
      }
    } catch {
      setApplyError('Unable to open this opportunity. Please try again.');
    } finally {
      pending.current = false;
    }
  };

  if (isLoading) return <PageLoadingIndicator label="Loading hiring opportunity" />;
  if (isError) return <Alert severity="error" action={<Button onClick={() => void refetch()}>Retry</Button>}>Unable to load this hiring opportunity.</Alert>;
  if (!drive) return <Box sx={{ maxWidth: 960, mx: 'auto', p: { xs: 2, md: 4 } }}><Typography component="h1" variant="h4">Hiring opportunity unavailable</Typography><Typography sx={{ my: 2 }} color="text.secondary">This campaign may have ended or the link may be incorrect.</Typography><Button component={Link} to={backPath} startIcon={<ArrowBackIcon />}>Back</Button></Box>;

  const image = getSafeExternalUrl(drive.imageUrl);
  const dates = [drive.startAtUtc ? `Starts ${formatDate(drive.startAtUtc) ?? ''}` : null, drive.endAtUtc ? `Ends ${formatDate(drive.endAtUtc) ?? ''}` : null].filter(Boolean);
  const highlights = [
    drive.experienceText ? ['Experience', drive.experienceText] : null,
    drive.locationText ? ['Location', drive.locationText] : null,
    drive.badgeText ? ['Badge', drive.badgeText] : null,
    drive.startAtUtc ? ['Campaign starts', formatDate(drive.startAtUtc)] : null,
    drive.endAtUtc ? ['Campaign ends', formatDate(drive.endAtUtc)] : null,
    drive.isSponsored ? ['Promotion', 'Sponsored'] : null,
  ].filter((item): item is [string, string] => Boolean(item?.[1]));

  return <Box sx={{ maxWidth: 1080, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 2, md: 4 } }}>
    <Button component={Link} to={backPath} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>Back</Button>
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Stack spacing={2.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={2}>
          <CompanyLogoFallback companyName={drive.company?.name ?? 'Company'} logoUrl={drive.company?.logoUrl} size={64} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography component="p" color="text.secondary">{drive.company?.name ?? 'Company'}</Typography>
            <Typography component="h1" variant="h4" fontWeight={800} sx={{ overflowWrap: 'anywhere' }}>{drive.title}</Typography>
            {drive.subtitle && <Typography color="text.secondary">{drive.subtitle}</Typography>}
          </Box>
          {drive.badgeText && <Chip color="primary" variant="outlined" label={drive.badgeText} />}
        </Stack>
        {dates.length > 0 && <Typography color="text.secondary">{dates.join(' · ')}</Typography>}
        {image && <Box component="img" src={image} alt={`${drive.company?.name ?? 'Company'} hiring campaign`} sx={{ display: 'block', width: '100%', maxHeight: { xs: 220, sm: 320 }, objectFit: 'cover', borderRadius: 1 }} />}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button variant="contained" endIcon={<ArrowForwardIcon />} disabled={clickState.isLoading} onClick={() => void apply()}>{clickState.isLoading ? 'Opening…' : 'Apply Now'}</Button>
          {dashboardContext && <Button component={Link} to={buildDashboardHiringDriveDetailsPath(drive.id)} disabled>Candidate workspace</Button>}
        </Stack>
        {applyError && <Alert severity="error">{applyError}</Alert>}
      </Stack>
    </Paper>
    <Stack spacing={3} sx={{ mt: 3, maxWidth: 860 }}>
      {drive.description && <Paper component="section" variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}><Typography component="h2" variant="h5" fontWeight={700} sx={{ mb: 1.5 }}>About the opportunity</Typography><Stack spacing={1.5}>{drive.description.split(/\r?\n\s*\r?\n/).map((paragraph, index) => paragraph.trim() ? <Typography key={index} color="text.secondary" sx={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>{paragraph.trim()}</Typography> : null)}</Stack></Paper>}
      {highlights.length > 0 && <Paper component="section" variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}><Typography component="h2" variant="h5" fontWeight={700} sx={{ mb: 2 }}>Campaign details</Typography><Stack divider={<Divider flexItem />} spacing={1.5}>{highlights.map(([label, value]) => <Stack key={label} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={0.5}><Typography color="text.secondary">{label}</Typography><Typography fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>{value}</Typography></Stack>)}</Stack></Paper>}
      {drive.company?.name && <Paper component="section" variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}><Typography component="h2" variant="h5" fontWeight={700} sx={{ mb: 2 }}>About the company</Typography><Stack direction="row" spacing={1.5} alignItems="center"><CompanyLogoFallback companyName={drive.company.name} logoUrl={drive.company.logoUrl} size={48} /><Typography fontWeight={700}>{drive.company.name}</Typography></Stack></Paper>}
    </Stack>
  </Box>;
};
