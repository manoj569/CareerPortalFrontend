import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import {
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';

type FeatureSlide = {
  eyebrow: string;
  title: string;
  description: string;
  buttonLabel: string;
  path: string;
  image: string;
  imageAlt: string;
  background: string;
  accent: string;
};

const AUTO_ROTATE_MS = 6000;

const slides: FeatureSlide[] = [
  {
    eyebrow: 'Career Guidance',
    title: 'Get expert career guidance',
    description:
      'Connect with industry professionals for practical guidance on interviews, career planning and your next move.',
    buttonLabel: 'Explore Career Guidance',
    path: ROUTES.CAREER_GUIDANCE,
    image: '/images/dashboard/career-guidance.png',
    imageAlt: 'Career guidance with an industry professional',
    background:
      'linear-gradient(120deg, #eef4ff 0%, #f2efff 52%, #e7f1ff 100%)',
    accent: '#4f46e5',
  },
  {
    eyebrow: 'Opportunities',
    title: 'Find your next opportunity',
    description:
      'Explore Career Harbor jobs and discover opportunities that match your skills, experience and career goals.',
    buttonLabel: 'Browse Jobs',
    path: ROUTES.DASHBOARD_JOBS,
    image: '/images/dashboard/browse-jobs.png',
    imageAlt: 'Candidate searching for job opportunities',
    background:
      'linear-gradient(120deg, #eef6ff 0%, #f5f9ff 52%, #eaf5ff 100%)',
    accent: '#2563eb',
  },
  {
    eyebrow: 'Community',
    title: 'Know about an open role?',
    description:
      'Share a job opportunity with the Career Harbor community and help other candidates discover relevant openings.',
    buttonLabel: 'Refer a Job',
    path: ROUTES.REFER_A_JOB,
    image: '/images/dashboard/refer-job.png',
    imageAlt: 'Professional sharing a job referral with the community',
    background:
      'linear-gradient(120deg, #effcf5 0%, #f2fff8 52%, #e5faef 100%)',
    accent: '#15803d',
  },
  {
    eyebrow: 'Interview Insights',
    title: 'Prepare smarter for interviews',
    description:
      'Learn from candidate-shared interview experiences, common rounds, questions and preparation insights.',
    buttonLabel: 'Explore Interview Insights',
    path: ROUTES.INTERVIEW_INSIGHTS,
    image: '/images/dashboard/interview-insights.png',
    imageAlt: 'Candidate preparing for a professional interview',
    background:
      'linear-gradient(120deg, #f4f1ff 0%, #f7f5ff 52%, #ebe8ff 100%)',
    accent: '#7c3aed',
  },
  {
    eyebrow: 'Portfolio',
    title: 'Showcase your professional profile',
    description:
      'Build a professional portfolio that brings together your skills, experience, education and projects.',
    buttonLabel: 'Build Your Portfolio',
    path: ROUTES.PORTFOLIO,
    image: '/images/dashboard/portfolio.png',
    imageAlt: 'Candidate building a professional portfolio',
    background:
      'linear-gradient(120deg, #eef6ff 0%, #f5f9ff 52%, #e7f2ff 100%)',
    accent: '#2563eb',
  },
];

export const DashboardFeatureCarousel = () => {
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeSlide = slides[activeIndex];

  useEffect(() => {
    if (prefersReducedMotion || isPaused) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTO_ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, prefersReducedMotion]);

  if (!activeSlide) {
    return null;
  }

  const goPrevious = () => {
    setActiveIndex(
      (current) => (current - 1 + slides.length) % slides.length,
    );
  };

  const goNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  return (
    <Box
      aria-label="Career Harbor features"
      component="section"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
      onFocus={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      sx={{
        background: activeSlide.background,
        border: '1px solid',
        borderColor: 'rgba(148, 163, 184, 0.24)',
        borderRadius: 4,
        minHeight: { xs: 390, md: 310 },
        overflow: 'hidden',
        position: 'relative',
        transition: prefersReducedMotion
          ? 'none'
          : 'background 400ms ease',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'minmax(0, 0.95fr) minmax(420px, 1.05fr)',
          },
          minHeight: 'inherit',
          position: 'relative',
        }}
      >
        <Stack
          justifyContent="center"
          spacing={2}
          sx={{
            maxWidth: 680,
            pb: { xs: 8, md: 6 },
            pl: { xs: 3, sm: 4, md: 5 },
            pr: { xs: 3, md: 1 },
            pt: { xs: 4, md: 4 },
            position: 'relative',
            zIndex: 2,
          }}
        >
          <Typography
            sx={{
              color: activeSlide.accent,
              fontSize: '.76rem',
              fontWeight: 800,
              letterSpacing: '.12em',
              textTransform: 'uppercase',
            }}
          >
            {activeSlide.eyebrow}
          </Typography>

          <Typography
            component="h2"
            sx={{
              color: '#0f172a',
              fontSize: {
                xs: '1.8rem',
                sm: '2.1rem',
                md: '2.35rem',
              },
              fontWeight: 800,
              letterSpacing: '-.035em',
              lineHeight: 1.1,
            }}
          >
            {activeSlide.title}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              fontSize: {
                xs: '.96rem',
                md: '1rem',
              },
              lineHeight: 1.65,
              maxWidth: 610,
            }}
          >
            {activeSlide.description}
          </Typography>

          <Button
            component={Link}
            size="large"
            sx={{
              alignSelf: 'flex-start',
              bgcolor: activeSlide.accent,
              borderRadius: 2.5,
              boxShadow: 'none',
              minHeight: 46,
              px: 2.5,
              textTransform: 'none',
              '&:hover': {
                bgcolor: activeSlide.accent,
                boxShadow: '0 8px 20px rgba(15,23,42,.12)',
                filter: 'brightness(.95)',
              },
            }}
            to={activeSlide.path}
            variant="contained"
          >
            {activeSlide.buttonLabel}
          </Button>
        </Stack>

        <Box
          component={Link}
          aria-label={`Open ${activeSlide.title}`}
          to={activeSlide.path}
          sx={{
            alignItems: 'center',
            display: { xs: 'none', md: 'flex' },
            justifyContent: 'flex-end',
            minHeight: 310,
            overflow: 'hidden',
            position: 'relative',
            textDecoration: 'none',
          }}
        >
          <Box
            alt={activeSlide.imageAlt}
            component="img"
            src={activeSlide.image}
            sx={{
              display: 'block',
              height: '100%',
              maxHeight: 310,
              objectFit: 'cover',
              objectPosition: 'center right',
              transition: prefersReducedMotion
                ? 'none'
                : 'transform 300ms ease',
              width: '100%',
              '&:hover': {
                transform: 'scale(1.015)',
              },
            }}
          />

          <Box
            sx={{
              background:
                'linear-gradient(90deg, rgba(245,248,255,1) 0%, rgba(245,248,255,.72) 35%, rgba(245,248,255,0) 100%)',
              bottom: 0,
              left: 0,
              pointerEvents: 'none',
              position: 'absolute',
              top: 0,
              width: { md: 100, lg: 135 },
            }}
          />
        </Box>
      </Box>

      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        sx={{
          bottom: { xs: 14, md: 18 },
          left: { xs: 18, md: 28 },
          pointerEvents: 'none',
          position: 'absolute',
          right: { xs: 18, md: 28 },
          zIndex: 4,
        }}
      >
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ pointerEvents: 'auto' }}
        >
          {slides.map((slide, index) => (
            <Box
              aria-label={`Show ${slide.eyebrow}`}
              component="button"
              key={slide.title}
              onClick={() => setActiveIndex(index)}
              sx={{
                bgcolor:
                  index === activeIndex
                    ? activeSlide.accent
                    : 'rgba(100,116,139,.30)',
                border: 0,
                borderRadius: 999,
                cursor: 'pointer',
                height: 8,
                p: 0,
                transition: prefersReducedMotion
                  ? 'none'
                  : 'width 200ms ease',
                width: index === activeIndex ? 24 : 8,
              }}
              type="button"
            />
          ))}
        </Stack>

        <Stack
          direction="row"
          spacing={0.75}
          sx={{ pointerEvents: 'auto' }}
        >
          <IconButton
            aria-label="Previous feature"
            onClick={goPrevious}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,.90)',
              border: '1px solid rgba(148,163,184,.25)',
              boxShadow: '0 4px 12px rgba(15,23,42,.06)',
              '&:hover': {
                bgcolor: 'common.white',
              },
            }}
          >
            <ArrowBackIosNewRoundedIcon sx={{ fontSize: 15 }} />
          </IconButton>

          <IconButton
            aria-label="Next feature"
            onClick={goNext}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,.90)',
              border: '1px solid rgba(148,163,184,.25)',
              boxShadow: '0 4px 12px rgba(15,23,42,.06)',
              '&:hover': {
                bgcolor: 'common.white',
              },
            }}
          >
            <ArrowForwardIosRoundedIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
};