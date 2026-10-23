import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Chip, Paper, Skeleton, Stack, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useLocation, useNavigate } from 'react-router-dom';
import { buildJobDetailsPath, ROUTES } from '@/constants/routes';
import { selectIsAuthenticated } from '@/features/auth/store/authSlice';
import { CompanyLogoFallback } from '@/features/jobs/components/CompanyLogoFallback';
import { useAppSelector } from '@/hooks/reduxHooks';
import { getSafeExternalUrl } from '@/utils/safeExternalUrl';
import { useClickHiringDriveMutation, useRecordHiringImpressionsMutation } from './api';
import type { HiringDrive } from './types';

// Shared across Home/list remounts for the lifetime of this page session.
const seen = new Set<string>();
let impressionsUnavailable = false;
export const HiringDriveCard = ({ drive }: { drive: HiringDrive }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [click, clickState] = useClickHiringDriveMutation();
  const [record] = useRecordHiringImpressionsMutation();
  const root = useRef<HTMLElement>(null);
  const pending = useRef(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (
      !root.current ||
      !('IntersectionObserver' in window) ||
      seen.has(drive.id) ||
      impressionsUnavailable
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          !entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5) ||
          seen.has(drive.id) ||
          impressionsUnavailable
        )
          return;
        seen.add(drive.id);
        observer.disconnect();
        void record([drive.id])
          .unwrap()
          .catch((failure: { status?: number }) => {
            if (failure.status === 404 || failure.status === 405) impressionsUnavailable = true;
          });
      },
      { threshold: 0.5 },
    );
    observer.observe(root.current);
    return () => observer.disconnect();
  }, [drive.id, record]);
  const apply = async () => {
    if (!isAuthenticated) {
      void navigate(ROUTES.LOGIN, { state: { from: location } });
      return;
    }
    if (pending.current) return;
    pending.current = true;
    setError('');
    try {
      const destination = await click(drive.id).unwrap();
      if (
        destination.destinationType === 'internalJob' &&
        destination.jobId?.trim() &&
        destination.jobSlug?.trim()
      ) {
        void navigate(buildJobDetailsPath(destination.jobSlug));
        return;
      } else if (destination.destinationType === 'external') {
        const url = getSafeExternalUrl(destination.url);
        if (!url?.startsWith('https://')) throw new Error('Invalid destination');
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.append(link);
        link.click();
        link.remove();
      } else {
        throw new Error('Unavailable destination');
      }
    } catch {
      setError('Unable to open this opportunity. Please try again.');
    } finally {
      pending.current = false;
    }
  };
  const image = getSafeExternalUrl(drive.imageUrl);
  return (
    <Paper component="article" ref={root} variant="outlined" className="hiring-card">
      <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
        <CompanyLogoFallback
          companyName={drive.company?.name ?? 'Company'}
          logoUrl={drive.company?.logoUrl}
          size={40}
        />
        <Typography fontWeight={700} sx={{ flex: 1, overflowWrap: 'anywhere' }}>
          {drive.company?.name ?? 'Company'}
        </Typography>
        {drive.badgeText && (
          <Chip size="small" color="primary" variant="outlined" label={drive.badgeText} />
        )}
      </Stack>
      <Typography component="h3" variant="h6" sx={{ overflowWrap: 'anywhere' }}>
        {drive.title}
      </Typography>
      {drive.subtitle && <Typography color="text.secondary">{drive.subtitle}</Typography>}
      {image && (
        <img
          className="hiring-image"
          src={image}
          alt={`${drive.company?.name ?? 'Company'} hiring campaign`}
          loading="lazy"
        />
      )}
      <Stack direction="row" gap={1.5} flexWrap="wrap" sx={{ mt: 'auto', pt: 2 }}>
        {drive.experienceText && (
          <Typography variant="body2">Experience: {drive.experienceText}</Typography>
        )}
        {drive.locationText && (
          <Typography variant="body2">Location: {drive.locationText}</Typography>
        )}
      </Stack>
      {drive.isSponsored && (
        <Typography variant="caption" color="text.secondary">
          Sponsored
        </Typography>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      <Button
        variant="contained"
        disabled={clickState.isLoading}
        aria-label={`Apply now for ${drive.title}`}
        onClick={() => void apply()}
        endIcon={<ArrowForwardIcon />}
      >
        {clickState.isLoading ? 'Opening�' : 'Apply Now'}
      </Button>
    </Paper>
  );
};
export const HiringDriveSkeleton = () => (
  <Paper className="hiring-card" variant="outlined" aria-label="Loading hiring opportunity">
    <Skeleton variant="rounded" width={48} height={40} />
    <Skeleton height={32} />
    <Skeleton />
    <Skeleton variant="rounded" height={120} />
    <Skeleton height={40} />
  </Paper>
);
