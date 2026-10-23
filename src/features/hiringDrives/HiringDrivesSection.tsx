import { useEffect, useRef, useState } from 'react';
import { Alert, Button, IconButton, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link } from 'react-router-dom';
import { useGetHiringDrivesQuery } from './api';
import { HiringDriveCard, HiringDriveSkeleton } from './HiringDriveCard';
import './hiringDrives.css';

export const HiringDrivesSection = ({ all = false }: { all?: boolean }) => {
  const { data, isLoading, isError, refetch } = useGetHiringDrivesQuery();
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ previous: false, next: false });
  const updateEdges = () => {
    const node = track.current;
    if (node)
      setEdges({
        previous: node.scrollLeft > 2,
        next: node.scrollLeft + node.clientWidth < node.scrollWidth - 2,
      });
  };
  useEffect(() => {
    const node = track.current;
    if (!node || all) return;
    updateEdges();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateEdges);
    observer?.observe(node);
    window.addEventListener('resize', updateEdges);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateEdges);
    };
  }, [data, isLoading, all]);
  if (isError)
    return all ? (
      <Alert severity="info" action={<Button onClick={() => void refetch()}>Retry</Button>}>
        Hiring drives are temporarily unavailable.
      </Alert>
    ) : null;
  if (!isLoading && !data?.length)
    return all ? <Typography>No active hiring drives right now.</Typography> : null;
  const move = (direction: number) => {
    const node = track.current;
    node?.scrollBy({
      left: direction * node.clientWidth,
      behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  };
  return (
    <section
      className="landing-section landing-container hiring-section"
      aria-labelledby="hiring-heading"
      aria-busy={isLoading}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        gap={2}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        sx={{ mb: 3 }}
      >
        <div>
          <Typography
            component={all ? 'h1' : 'h2'}
            id="hiring-heading"
            variant="h4"
            fontWeight={800}
          >
            Top Hiring Opportunities
          </Typography>
          <Typography color="text.secondary">
            Don't miss these latest openings from leading companies.
          </Typography>
        </div>
        {!all && (
          <Button component={Link} to="/hiring-drives" endIcon={<ArrowForwardIcon />}>
            View all hiring drives
          </Button>
        )}
      </Stack>
      <div ref={track} className={all ? 'hiring-grid' : 'hiring-track'} onScroll={updateEdges}>
        {isLoading
          ? Array.from({ length: 4 }, (_, i) => <HiringDriveSkeleton key={i} />)
          : data?.map((drive) => <HiringDriveCard key={drive.id} drive={drive} />)}
      </div>
      {!all && (edges.previous || edges.next) && (
        <Stack direction="row" justifyContent="flex-end" gap={1} sx={{ mt: 2 }}>
          <IconButton
            aria-label="Previous hiring opportunities"
            disabled={!edges.previous}
            onClick={() => move(-1)}
          >
            <ArrowBackIcon />
          </IconButton>
          <IconButton
            aria-label="Next hiring opportunities"
            disabled={!edges.next}
            onClick={() => move(1)}
          >
            <ArrowForwardIcon />
          </IconButton>
        </Stack>
      )}
    </section>
  );
};
