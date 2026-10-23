import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, IconButton, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useGetHomeHiringDrivesQuery } from './api';
import { HiringDriveCard, HiringDriveSkeleton } from './HiringDriveCard';
import './hiringDrives.css';

export const HiringDriveAdsSection = ({
  placement = 'home',
}: {
  placement?: 'home' | 'dashboard';
}) => {
  const { data, isLoading, isError, refetch } = useGetHomeHiringDrivesQuery();
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ previous: false, next: false });
  const [activeIndex, setActiveIndex] = useState(0);

  const updateCarousel = useCallback(() => {
    const node = track.current;
    if (!node) return;
    setEdges({
      previous: node.scrollLeft > 2,
      next: node.scrollLeft + node.clientWidth < node.scrollWidth - 2,
    });
    const cards = Array.from(node.children);
    const current = cards.reduce<number>((closest, card, index) => {
      const currentDistance = Math.abs((card as HTMLElement).offsetLeft - node.scrollLeft);
      const closestDistance = Math.abs(
        (cards[closest] as HTMLElement).offsetLeft - node.scrollLeft,
      );
      return currentDistance < closestDistance ? index : closest;
    }, 0);
    setActiveIndex(current);
  }, []);

  useEffect(() => {
    const node = track.current;
    if (!node) return;
    updateCarousel();
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateCarousel);
    observer?.observe(node);
    window.addEventListener('resize', updateCarousel);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateCarousel);
    };
  }, [data, isLoading, updateCarousel]);

  if (isError) {
    return (
      <Alert severity="info" action={<Button onClick={() => void refetch()}>Retry</Button>}>
        Hiring opportunities are temporarily unavailable.
      </Alert>
    );
  }
  if (!isLoading && !data?.length) return null;

  const move = (direction: -1 | 1) => {
    const node = track.current;
    const cards = node ? Array.from(node.children) : [];
    const target = cards[Math.min(Math.max(activeIndex + direction, 0), cards.length - 1)] as
      | HTMLElement
      | undefined;
    if (node && target) {
      node.scrollTo({
        left: target.offsetLeft,
        behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      });
    }
  };

  const className =
    placement === 'home'
      ? 'landing-section landing-container hiring-ads-section'
      : 'hiring-ads-section hiring-ads-dashboard';
  const trackClassName = [
    'hiring-ads-track',
    data?.length === 1 ? 'hiring-ads-track-single' : '',
    data?.length === 2 ? 'hiring-ads-track-double' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      className={className}
      aria-labelledby={`hiring-ads-heading-${placement}`}
      aria-busy={isLoading}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        gap={2}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        sx={{ mb: 2.5 }}
      >
        <div>
          <Typography
            component="h2"
            id={`hiring-ads-heading-${placement}`}
            variant="h5"
            fontWeight={800}
          >
            Hiring Opportunities
          </Typography>
          <Typography color="text.secondary">
            Explore current hiring drives and apply directly with participating companies.
          </Typography>
        </div>
        {edges.previous || edges.next ? (
          <Stack direction="row" gap={0.5}>
            <IconButton
              aria-label="Previous hiring opportunities"
              disabled={!edges.previous}
              onClick={() => move(-1)}
            >
              <ArrowBackRoundedIcon />
            </IconButton>
            <IconButton
              aria-label="Next hiring opportunities"
              disabled={!edges.next}
              onClick={() => move(1)}
            >
              <ArrowForwardRoundedIcon />
            </IconButton>
          </Stack>
        ) : null}
      </Stack>
      <div
        ref={track}
        className={trackClassName}
        onScroll={updateCarousel}
        role="region"
        aria-label="Hiring opportunities carousel"
      >
        {isLoading
          ? Array.from({ length: 2 }, (_, index) => (
              <HiringDriveSkeleton key={index} />
            ))
          : data?.map((drive) => (
              <HiringDriveCard
                key={drive.id}
                drive={drive}
                allowAnonymousApply
                enableViewDetails
              />
            ))}
      </div>
      {data && data.length > 1 ? (
        <Stack
          direction="row"
          justifyContent="center"
          spacing={0.75}
          sx={{ mt: 1.5 }}
          role="group"
          aria-label="Hiring opportunities pages"
        >
          {data.map((drive, index) => (
            <button
              key={drive.id}
              type="button"
              className="hiring-ads-dot"
              aria-label={`Show hiring opportunity ${index + 1}`}
              aria-current={activeIndex === index ? 'true' : undefined}
              onClick={() => {
                const node = track.current;
                const card = node?.children[index] as HTMLElement | undefined;
                if (node && card)
                  node.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
              }}
            />
          ))}
        </Stack>
      ) : null}
    </section>
  );
};
