import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, IconButton, Paper, Stack, Typography, useMediaQuery } from '@mui/material';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import { useGetHomeHiringDrivesQuery } from '@/features/hiringDrives/api';
import { HiringDriveCard, HiringDriveSkeleton } from '@/features/hiringDrives/HiringDriveCard';
import type { HiringDrive } from '@/features/hiringDrives/types';
import { useGetActiveJobPromotionsQuery } from './api';
import { PromotedJobCard } from './PromotedJobCard';
import type { ActiveJobPromotion } from './types';
import '@/features/hiringDrives/hiringDrives.css';

type Opportunity = { kind: 'drive'; drive: HiringDrive } | { kind: 'job'; job: ActiveJobPromotion };
const EMPTY_DRIVES: HiringDrive[] = [];

export const HiringOpportunitiesSection = () => {
  const drivesQuery = useGetHomeHiringDrivesQuery();
  const promotionsQuery = useGetActiveJobPromotionsQuery();
  const drives = drivesQuery.data;
  const drivesList = drives ?? EMPTY_DRIVES;
  const jobs = useMemo(() => {
    const internalJobIds = new Set(drivesList.flatMap((drive) => drive.destination.type === 'internalJob' ? [drive.destination.jobId] : []));
    return (promotionsQuery.data ?? []).filter((job) => !internalJobIds.has(job.jobId));
  }, [drivesList, promotionsQuery.data]);
  const items: Opportunity[] = useMemo(() => [...drivesList.map((drive) => ({ kind: 'drive' as const, drive })), ...jobs.map((job) => ({ kind: 'job' as const, job }))], [drivesList, jobs]);
  const isMobile = useMediaQuery('(max-width:767px)');
  const itemsPerView = isMobile ? 1 : 2;
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [hidden, setHidden] = useState(document.visibilityState === 'hidden');
  const [reduced, setReduced] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

  useEffect(() => {
    const visibility = () => setHidden(document.visibilityState === 'hidden');
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const motion = () => setReduced(media?.matches ?? false);
    document.addEventListener('visibilitychange', visibility);
    media?.addEventListener?.('change', motion);
    return () => { document.removeEventListener('visibilitychange', visibility); media?.removeEventListener?.('change', motion); };
  }, []);

  const goTo = useCallback((targetIndex: number) => {
    if (!items.length) return;
    const next = (targetIndex + items.length) % items.length;
    setIndex(next);
    const node = track.current;
    const card = node?.children[next] as HTMLElement | undefined;
    if (node && card) node.scrollTo({ left: card.offsetLeft, behavior: reduced ? 'instant' : 'smooth' });
  }, [items.length, reduced]);

  const onBlur = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocus(false);
  }, []);

  const onScroll = useCallback(() => {
    const node = track.current;
    if (!node?.children.length) return;
    const cards = Array.from(node.children) as HTMLElement[];
    const nearest = cards.reduce((best, card, current) => {
      const currentDistance = Math.abs(card.offsetLeft - node.scrollLeft);
      return currentDistance < best.distance ? { index: current, distance: currentDistance } : best;
    }, { index: 0, distance: Number.POSITIVE_INFINITY });
    setIndex(nearest.index);
  }, []);

  useEffect(() => {
    if (items.length < 2 || hover || focus || hidden || reduced) return;
    const timer = window.setInterval(() => goTo(index + 1), 3000);
    return () => window.clearInterval(timer);
  }, [focus, goTo, hidden, index, items.length, reduced, hover]);

  const drivesFailed = drivesQuery.isError;
  const promotionsFailed = promotionsQuery.isError;
  const isLoading = drivesQuery.isLoading || promotionsQuery.isLoading;
  if (!isLoading && !items.length) return (
    <section className="hiring-ads-section hiring-ads-dashboard" aria-labelledby="dashboard-hiring-opportunities">
      <Stack spacing={1.5}>
        <div className="hiring-ads-heading">
          <span className="hiring-ads-heading-icon"><BoltRoundedIcon /></span>
          <div>
          <Typography component="h2" id="dashboard-hiring-opportunities" variant="h5" fontWeight={800}>Hiring Opportunities</Typography>
          <Typography color="text.secondary">Featured opportunities and promoted roles selected for you.</Typography>
          </div>
        </div>
        {drivesFailed || promotionsFailed ? (
          <Alert severity="info" action={<Stack direction="row" flexWrap="wrap"><Button onClick={() => void drivesQuery.refetch()}>Retry drives</Button><Button onClick={() => void promotionsQuery.refetch()}>Retry promoted jobs</Button></Stack>}>
            Hiring opportunities are temporarily unavailable.
          </Alert>
        ) : (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
            <Typography color="text.secondary">No opportunities are available right now. Explore jobs to find your next role.</Typography>
            <Button component={Link} to={ROUTES.DASHBOARD_JOBS} variant="outlined">Browse jobs</Button>
          </Paper>
        )}
      </Stack>
    </section>
  );

  const trackClass = ['hiring-ads-track', items.length === 1 ? 'hiring-ads-track-single' : '', items.length === 2 && !isMobile ? 'hiring-ads-track-double' : ''].filter(Boolean).join(' ');
  return <section className="hiring-ads-section hiring-ads-dashboard" aria-labelledby="dashboard-hiring-opportunities" aria-busy={isLoading}>
    <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mb: 1.75 }}>
      <div className="hiring-ads-heading"><span className="hiring-ads-heading-icon"><BoltRoundedIcon /></span><div><Typography component="h2" id="dashboard-hiring-opportunities" variant="h5" fontWeight={800}>Hiring Opportunities</Typography><Typography color="text.secondary">Top opportunities from leading companies, handpicked for you.</Typography></div></div>
      <Stack direction="row" gap={0.75} alignItems="center">
        <Button component={Link} to={ROUTES.DASHBOARD_JOBS} endIcon={<ArrowForwardRoundedIcon />} sx={{ fontWeight: 700, minHeight: 42 }}>View all</Button>
        {items.length > 1 && <><IconButton className="hiring-ads-control" aria-label="Previous hiring opportunity" onClick={() => goTo(index - 1)}><ArrowBackRoundedIcon /></IconButton><IconButton className="hiring-ads-control" aria-label="Next hiring opportunity" onClick={() => goTo(index + 1)}><ArrowForwardRoundedIcon /></IconButton></>}
      </Stack>
    </Stack>
    {(drivesFailed || promotionsFailed) && <Alert severity="info" sx={{ mb: 2 }}>{drivesFailed ? 'Hiring Drives are temporarily unavailable. ' : ''}{promotionsFailed ? 'Promoted jobs are temporarily unavailable.' : ''}</Alert>}
    <div ref={track} className={trackClass} role="region" aria-roledescription="carousel" aria-label="Hiring opportunities carousel" aria-live="off" aria-orientation="horizontal" data-items-per-view={itemsPerView} data-active-index={index} style={isMobile ? { display: 'flex', width: '100%', maxWidth: '100%', minWidth: 0 } : undefined} onScroll={onScroll} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setFocus(true)} onBlur={onBlur}>
      {isLoading && !items.length
        ? Array.from({ length: 2 }, (_, i) => (
          <div className="hiring-opportunity-slide" key={`skeleton-${i}`} data-slide-index={i} style={isMobile ? { flex: '0 0 100%', width: '100%', maxWidth: '100%', minWidth: 0 } : undefined}>
            <HiringDriveSkeleton />
          </div>
        ))
        : items.map((item, itemIndex) => (
          <div
            className="hiring-opportunity-slide"
            key={item.kind === 'drive' ? `drive-${item.drive.id}` : `job-${item.job.jobId}`}
            data-slide-index={itemIndex}
            style={isMobile ? { flex: '0 0 100%', width: '100%', maxWidth: '100%', minWidth: 0 } : undefined}
          >
            {item.kind === 'drive'
              ? <HiringDriveCard drive={item.drive} allowAnonymousApply enableViewDetails />
              : <PromotedJobCard promotion={item.job} />}
          </div>
        ))}
    </div>
    {items.length > 1 && <Stack direction="row" justifyContent="center" spacing={0.75} sx={{ mt: 1.5 }} role="group" aria-label="Hiring opportunities pages">{items.map((item, i) => <button key={item.kind === 'drive' ? `drive-${item.drive.id}` : `job-${item.job.jobId}`} type="button" className="hiring-ads-dot" aria-label={`Show hiring opportunity ${i + 1}`} aria-current={index === i ? 'true' : undefined} onClick={() => goTo(i)} />)}</Stack>}
  </section>;
};
