import { HiringDrivesSection } from '@/features/hiringDrives/HiringDrivesSection';
import { SHOW_HOME_CAREER_GUIDANCE } from '@/constants/homeVisibility';
import {
  LandingFeatures,
  LandingHeroVisual,
  ReferralFeature,
  InsightsPreview,
  GuidanceFeature,
  LandingCommunity,
  FinalCareerCTA,
} from './home/LandingSections';
import './home/landing.css';
import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SearchIcon from '@mui/icons-material/Search';
import ViewQuiltOutlinedIcon from '@mui/icons-material/ViewQuiltOutlined';
import {
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { buildJobDetailsPath, ROUTES } from '@/constants/routes';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/store/authSlice';
import {
  useGetFeaturedJobsQuery,
  useGetLatestJobsQuery,
  useGetPopularCompaniesQuery,
} from '@/features/jobs/api/jobsApi';

import { CompanyLogoFallback } from '@/features/jobs/components/CompanyLogoFallback';
import {
  experienceLevelOptions,
  getExperienceLevelLabel,
  getWorkplaceTypeLabel,
} from '@/features/jobs/constants/jobOptions';
import type { PopularCompany, PublicJobSummary } from '@/features/jobs/types/jobModels';
import {
  emptyJobSearchState,
  serializeJobSearchState,
} from '@/features/jobs/utils/jobSearchParams';
import { VERIFIED_PUBLIC_PORTFOLIO_DEMO_URL } from '@/features/portfolio/constants/portfolioDemo';
import { useAppSelector } from '@/hooks/reduxHooks';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { useStructuredData } from '@/hooks/useStructuredData';
import { UserRole } from '@/types';

const wideSectionStyles = { width: '100%' };
const wideContainerStyles = {
  maxWidth: 'none',
  paddingInline: 'clamp(20px, 5vw, 96px) !important',
};

const homeStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      alternateName: 'Career Portal',
      name: 'Career Harbor',
      url: 'https://careerharbor.in/',
    },
    {
      '@type': 'Organization',
      logo: 'https://careerharbor.in/favicon.svg',
      name: 'Career Harbor',
      url: 'https://careerharbor.in/',
    },
  ],
};

export const HomePage = () => {
  useDocumentMetadata(
    'Career Harbor | Find Jobs and Build Your Career',
    'Discover job opportunities and create a professional portfolio to showcase your skills, projects and experience with Career Harbor.',
    { canonicalPath: ROUTES.HOME, noIndex: false },
  );
  useStructuredData('career-harbor-home-structured-data', homeStructuredData);
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const featured = useGetFeaturedJobsQuery({ pageSize: 6 });
  const latest = useGetLatestJobsQuery({ pageSize: 6 });
  const companies = useGetPopularCompaniesQuery({ limit: 8 });
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [jobTab, setJobTab] = useState(0);
  const currentJobs = jobTab === 0 ? featured : latest;
  const isCandidate = isAuthenticated && user?.role === UserRole.Candidate;
  const portfolioCtaPath = isCandidate
    ? ROUTES.PORTFOLIO
    : isAuthenticated
      ? ROUTES.ADMIN
      : ROUTES.REGISTER;
  const portfolioCtaState = isAuthenticated ? undefined : { from: { pathname: ROUTES.PORTFOLIO } };
  const portfolioCtaLabel =
    isAuthenticated && !isCandidate ? 'Open administration' : 'Create portfolio';

  const submitSearch = () => {
    const params = serializeJobSearchState({
      ...emptyJobSearchState(),
      experienceLevel: experienceLevel ? Number(experienceLevel) : undefined,
      location: location.trim(),
      search: search.trim(),
    });
    void navigate(`${ROUTES.JOBS}${params.size ? `?${params.toString()}` : ''}`);
  };

  const insightsPath = isCandidate ? ROUTES.INTERVIEW_INSIGHTS : ROUTES.LOGIN;
  const insightsState = isCandidate ? undefined : { from: { pathname: ROUTES.INTERVIEW_INSIGHTS } };
  return (
    <Box className="career-landing">
      <section className="landing-hero">
        <div className="landing-container hero-grid">
          <div className="hero-copy">
            <Chip
              label="Your complete career growth platform"
              size="small"
              sx={{ bgcolor: '#fff0de', color: '#754914', mb: 2, fontWeight: 700 }}
            />
            <Typography component="h1">
              Find opportunities.
              <br />
              <span>Get referred.</span>
              <br />
              <span>Get prepared.</span> <em>Grow faster.</em>
            </Typography>
            <p className="hero-description">
              Jobs, employee referrals, real interview experiences,{SHOW_HOME_CAREER_GUIDANCE ? ' career guidance and a' : ' and a'}
              professional portfolio — all in one place.
            </p>
            <HeroSearch
              experienceLevel={experienceLevel}
              location={location}
              onExperienceChange={setExperienceLevel}
              onLocationChange={setLocation}
              onSearchChange={setSearch}
              onSubmit={submitSearch}
              search={search}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
              <Button
                component={Link}
                endIcon={<ArrowForwardIcon />}
                to={ROUTES.JOBS}
                variant="contained"
                size="large"
              >
                Browse jobs
              </Button>
              <Button
                component={Link}
                endIcon={<ArrowForwardIcon />}
                state={portfolioCtaState}
                to={portfolioCtaPath}
                variant="outlined"
                size="large"
              >
                {portfolioCtaLabel}
              </Button>
            </Stack>
            <div className="hero-trust">
              {['Active opportunities', 'Employee referrals', 'Career support'].map((text) => (
                <span key={text}>
                  <CheckCircleOutlineIcon />
                  {text}
                </span>
              ))}
            </div>
          </div>
          <LandingHeroVisual company={companies.data?.at(0)?.name} />
        </div>
      </section>
      <HiringDrivesSection />
      <div className="landing-container">
        <CompanyMarquee companies={companies} />
      </div>
      <LandingFeatures portfolioPath={portfolioCtaPath} portfolioState={portfolioCtaState} />
      <ReferralFeature />
      <section className="landing-section landing-container split-feature">
        <div>
          <SectionHeading
            eyebrow="Career preparation"
            id="interview-insights-home-heading"
            title="Prepare smarter for your next interview"
            description="Explore candidate-shared interview rounds, common questions, preparation tips, and real experiences by company and role."
          />
          <div className="feature-points">
            {[
              'Candidate-shared experiences',
              'Interview rounds and questions',
              'Preparation tips by company and role',
            ].map((text) => (
              <p key={text}>
                <CheckCircleOutlineIcon />
                {text}
              </p>
            ))}
          </div>
          {user?.role !== UserRole.Administrator && (
            <Button
              component={Link}
              endIcon={<ArrowForwardIcon />}
              state={insightsState}
              to={insightsPath}
              variant="contained"
            >
              Explore interview insights
            </Button>
          )}
          <Typography color="text.secondary" variant="body2" sx={{ mt: 2 }}>
            Interview Insights requires an active Career Harbor membership.
          </Typography>
        </div>
        <InsightsPreview />
      </section>
      <PortfolioFeatureSection
        ctaLabel={
          portfolioCtaLabel === 'Create portfolio' ? 'Create your portfolio' : portfolioCtaLabel
        }
        ctaPath={portfolioCtaPath}
        ctaState={portfolioCtaState}
      />
      <section className="landing-section landing-container">
        <SectionHeading
          eyebrow="How it works"
          id="how-heading"
          title="Your next opportunity in four simple steps"
          description="Discover, prepare and take your next step with Career Harbor."
        />
        <div className="career-timeline">
          {(
            [
              [
                '01',
                'Discover',
                'Search and filter opportunities that match your goals.',
                <SearchIcon />,
              ],
              [
                '02',
                'Create your profile',
                'Add your details, skills, preferences and resume.',
                <PersonOutlineIcon />,
              ],
              [
                '03',
                'Prepare better',
                SHOW_HOME_CAREER_GUIDANCE ? 'Use Interview Insights, referrals and Career Guidance.' : 'Use Interview Insights and referrals.',
                <DescriptionOutlinedIcon />,
              ],
              [
                '04',
                'Apply and track',
                'Apply for opportunities and track your applications.',
                <ArrowForwardIcon />,
              ],
            ] as const
          ).map(([number, title, description, icon]) => (
            <div key={number}>
              <div className="timeline-node">
                <span>{number}</span>
                {icon}
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>
      <section
        className="landing-section landing-container"
        aria-labelledby="opportunities-heading"
      >
        <div className="section-title-row">
          <SectionHeading
            eyebrow="Live opportunities"
            id="opportunities-heading"
            title="Featured jobs for you"
            description="Explore featured and recently published roles from the live Career Harbor job catalogue."
          />
          <Button
            component={Link}
            to={ROUTES.JOBS}
            endIcon={<ArrowForwardIcon />}
            variant="outlined"
          >
            View all jobs
          </Button>
        </div>
        <Tabs
          aria-label="Job collections"
          value={jobTab}
          onChange={(_, value: number) => setJobTab(value)}
          sx={{ mb: 3, mt: 3 }}
        >
          <Tab label="Featured Jobs" />
          <Tab label="Latest Jobs" />
        </Tabs>
        <JobCollection jobs={currentJobs} />
      </section>
      {SHOW_HOME_CAREER_GUIDANCE && <GuidanceFeature />}
      <LandingCommunity />
      <FinalCareerCTA />
    </Box>
  );
};

const portfolioBenefits = [
  {
    description: 'Choose a presentation that fits your career.',
    icon: <ViewQuiltOutlinedIcon />,
    title: 'Professional templates',
  },
  {
    description: 'Share your public Career Harbor portfolio anywhere.',
    icon: <LinkOutlinedIcon />,
    title: 'One shareable link',
  },
  {
    description: 'Present projects, experience, skills and certifications together.',
    icon: <CheckCircleOutlineIcon />,
    title: 'Career evidence',
  },
  {
    description: 'Preview first and publish or unpublish when you choose.',
    icon: <LockOutlinedIcon />,
    title: 'Privacy controls',
  },
] as const;

const portfolioSteps = [
  {
    description: 'Add your headline, summary, skills and resume.',
    title: 'Complete your profile',
  },
  {
    description: 'Add projects, experience, education and professional links.',
    title: 'Build your portfolio',
  },
  {
    description: 'Review your portfolio and share your public link.',
    title: 'Preview and publish',
  },
] as const;

interface PortfolioFeatureSectionProps {
  ctaLabel: string;
  ctaPath: string;
  ctaState?: { from: { pathname: string } };
}

const PortfolioFeatureSection = ({ ctaLabel, ctaPath, ctaState }: PortfolioFeatureSectionProps) => (
  <Box
    aria-labelledby="portfolio-feature-heading"
    component="section"
    sx={{ ...wideSectionStyles, bgcolor: '#f8fbff' }}
  >
    <Container maxWidth={false} sx={{ ...wideContainerStyles, py: { xs: 7, md: 10 } }}>
      <Grid alignItems="center" container spacing={{ xs: 5, md: 7, lg: 10 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography
            color="primary.main"
            fontWeight={850}
            letterSpacing=".12em"
            variant="overline"
          >
            Career portfolio
          </Typography>
          <Typography
            component="h2"
            id="portfolio-feature-heading"
            sx={{
              color: '#0b1739',
              fontSize: { xs: '2.25rem', sm: '2.8rem', md: '3.2rem' },
              fontWeight: 800,
              letterSpacing: '-.04em',
              lineHeight: 1.08,
              mt: 1,
            }}
          >
            Your career, presented through one professional link
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ fontSize: { xs: '1rem', md: '1.12rem' }, lineHeight: 1.75, mt: 2 }}
          >
            Showcase your skills, projects, experience, education and certifications in a portfolio
            designed to be shared with recruiters and professional connections.
          </Typography>
          <Grid component="ul" container spacing={2.5} sx={{ listStyle: 'none', mt: 2, p: 0 }}>
            {portfolioBenefits.map((benefit) => (
              <Grid component="li" key={benefit.title} size={{ xs: 12, sm: 6 }}>
                <Stack alignItems="flex-start" direction="row" spacing={1.5}>
                  <Box
                    aria-hidden="true"
                    sx={{
                      alignItems: 'center',
                      bgcolor: '#e8f1ff',
                      borderRadius: 2,
                      color: 'primary.main',
                      display: 'flex',
                      flex: '0 0 auto',
                      height: 42,
                      justifyContent: 'center',
                      width: 42,
                    }}
                  >
                    {benefit.icon}
                  </Box>
                  <Box>
                    <Typography component="h3" fontSize="1rem" fontWeight={800}>
                      {benefit.title}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      sx={{ lineHeight: 1.6, mt: 0.5 }}
                      variant="body2"
                    >
                      {benefit.description}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PortfolioDemoPreview />
        </Grid>
      </Grid>

      <Box
        sx={{
          borderTop: '1px solid rgba(15,23,42,.1)',
          mt: { xs: 6, md: 8 },
          pt: { xs: 5, md: 6 },
        }}
      >
        <Typography
          component="h3"
          sx={{
            color: '#0b1739',
            fontSize: { xs: '1.75rem', md: '2.2rem' },
            fontWeight: 800,
            textAlign: 'center',
          }}
        >
          Create your portfolio in three steps
        </Typography>
        <Grid component="ol" container spacing={2.5} sx={{ listStyle: 'none', mt: 2, p: 0 }}>
          {portfolioSteps.map((step, index) => (
            <Grid component="li" key={step.title} size={{ xs: 12, md: 4 }}>
              <Paper elevation={0} sx={{ bgcolor: 'common.white', height: '100%', p: 3 }}>
                <Typography aria-hidden="true" color="primary.main" fontWeight={900}>
                  {String(index + 1).padStart(2, '0')}
                </Typography>
                <Typography
                  component="h3"
                  sx={{ color: '#0b1739', fontSize: '1.2rem', fontWeight: 800, mt: 1 }}
                >
                  <Box component="span" className="sr-only">
                    Step {index + 1}:{' '}
                  </Box>
                  {step.title}
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.65, mt: 1 }}>
                  {step.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Stack alignItems="center" spacing={1.5} sx={{ mt: 4 }}>
          <Button
            component={Link}
            endIcon={<ArrowForwardIcon />}
            size="large"
            state={ctaState}
            to={ctaPath}
            variant="contained"
          >
            {ctaLabel}
          </Button>
          {VERIFIED_PUBLIC_PORTFOLIO_DEMO_URL ? (
            <Button component="a" href={VERIFIED_PUBLIC_PORTFOLIO_DEMO_URL} variant="text">
              View example portfolio
            </Button>
          ) : null}
        </Stack>
      </Box>
    </Container>
  </Box>
);

const PortfolioDemoPreview = () => (
  <Paper
    aria-label="Illustrative Career Harbor portfolio preview for a fictional full stack developer"
    role="img"
    sx={{
      background: 'linear-gradient(145deg, #0b1739 0%, #143979 100%)',
      border: '1px solid rgba(37,99,235,.2)',
      borderRadius: { xs: 3, sm: 4 },
      boxShadow: '0 28px 65px rgba(23,49,97,.2)',
      color: 'common.white',
      overflow: 'hidden',
      p: { xs: 2, sm: 3 },
    }}
  >
    <Box aria-hidden="true">
      <Stack alignItems="center" direction="row" spacing={2}>
        <Box
          sx={{
            alignItems: 'center',
            background: 'linear-gradient(145deg, #60a5fa, #2563eb)',
            border: '3px solid rgba(255,255,255,.7)',
            borderRadius: '50%',
            display: 'flex',
            flex: '0 0 auto',
            fontSize: '1.1rem',
            fontWeight: 900,
            height: 64,
            justifyContent: 'center',
            width: 64,
          }}
        >
          AM
        </Box>
        <Box>
          <Typography
            component="p"
            sx={{ fontSize: { xs: '1.35rem', sm: '1.65rem' }, fontWeight: 850 }}
          >
            Aarav Mehta
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,.72)' }}>Full Stack Developer</Typography>
        </Box>
      </Stack>
      <Paper
        elevation={0}
        sx={{ bgcolor: 'rgba(255,255,255,.97)', border: 0, mt: 3, p: { xs: 2, sm: 2.5 } }}
      >
        <Typography color="#0b1739" fontWeight={850}>
          Skills
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.25 }}>
          {['React', 'ASP.NET Core', 'PostgreSQL'].map((skill) => (
            <Chip color="primary" key={skill} label={skill} size="small" variant="outlined" />
          ))}
        </Stack>
        <Box sx={{ borderTop: '1px solid rgba(15,23,42,.09)', mt: 2.5, pt: 2.25 }}>
          <Stack alignItems="center" direction="row" spacing={1}>
            <DevicesOutlinedIcon color="primary" fontSize="small" />
            <Typography color="#0b1739" fontWeight={850}>
              Featured project
            </Typography>
          </Stack>
          <Typography color="#0b1739" fontWeight={750} sx={{ mt: 1.25 }}>
            Job Application Tracker
          </Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.6, mt: 0.5 }} variant="body2">
            A practical workspace for organizing job applications and follow-up activity.
          </Typography>
        </Box>
      </Paper>
      <Stack alignItems="center" direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
        <Typography sx={{ color: 'rgba(255,255,255,.7)' }} variant="caption">
          careerharbor.in/p/your-name
        </Typography>
        <Chip
          label="Illustrative preview"
          size="small"
          sx={{ bgcolor: 'rgba(255,255,255,.12)', color: 'common.white' }}
        />
      </Stack>
    </Box>
  </Paper>
);

const JobCollection = ({
  jobs,
}: {
  jobs: { data?: { items: PublicJobSummary[] }; isError: boolean; isLoading: boolean };
}) => {
  if (jobs.isLoading) return <PageLoadingIndicator label="Loading homepage jobs" />;
  if (jobs.isError) return <JobCollectionUnavailable />;
  if (!jobs.data?.items.length)
    return (
      <Typography color="text.secondary">
        No jobs in this collection right now. Try another collection or browse all jobs.
      </Typography>
    );

  return (
    <Grid container spacing={2}>
      {jobs.data.items.slice(0, 4).map((job) => (
        <Grid key={job.id} size={{ xs: 12, sm: 6, lg: 3 }}>
          <DiscoveryJobCard job={job} />
        </Grid>
      ))}
    </Grid>
  );
};

const DiscoveryJobCard = ({ job }: { job: PublicJobSummary }) => {
  const experience =
    job.minimumExperienceYears !== null || job.maximumExperienceYears !== null
      ? `${job.minimumExperienceYears ?? 0}${job.maximumExperienceYears !== null ? `–${job.maximumExperienceYears}` : '+'} years`
      : getExperienceLevelLabel(job.experienceLevel);

  return (
    <Paper
      component="article"
      elevation={0}
      sx={{
        '&:hover': {
          borderColor: 'rgba(37,99,235,.35)',
          boxShadow: '0 20px 42px rgba(23,49,97,.12)',
          transform: 'translateY(-3px)',
        },
        border: '1px solid rgba(15,23,42,.09)',
        borderRadius: 3.5,
        boxShadow: '0 10px 28px rgba(23,49,97,.07)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        p: { xs: 2.25, md: 2.75 },
        transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
      }}
    >
      <Stack alignItems="center" direction="row" spacing={1.5}>
        <CompanyLogoFallback companyName={job.companyName} logoUrl={job.companyLogoUrl} size={42} />
        <Typography color="#334155" fontSize=".88rem" fontWeight={800}>
          {job.companyName}
        </Typography>
      </Stack>
      <Typography
        component="h3"
        sx={{
          color: '#0b1739',
          fontSize: { xs: '1.2rem', md: '1.32rem' },
          fontWeight: 800,
          lineHeight: 1.3,
          mt: 2,
        }}
      >
        {job.title}
      </Typography>
      <Stack color="text.secondary" direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1.5 }}>
        {job.location ? <Typography fontSize=".82rem">{job.location}</Typography> : null}
        {job.location ? (
          <Typography aria-hidden fontSize=".82rem">
            ·
          </Typography>
        ) : null}
        <Typography fontSize=".82rem">{getWorkplaceTypeLabel(job.workplaceType)}</Typography>
        <Typography aria-hidden fontSize=".82rem">
          ·
        </Typography>
        <Typography fontSize=".82rem">{experience}</Typography>
      </Stack>
      {job.categoryName ? (
        <Typography
          color="primary.main"
          fontSize=".78rem"
          fontWeight={800}
          sx={{
            bgcolor: '#eff6ff',
            borderRadius: 5,
            mt: 2,
            px: 1.25,
            py: 0.65,
            width: 'fit-content',
          }}
        >
          {job.categoryName}
        </Typography>
      ) : null}
      <Button
        aria-label={`View details for ${job.title} at ${job.companyName}`}
        component={Link}
        endIcon={<ArrowForwardIcon />}
        sx={{ alignSelf: 'flex-end', mt: 'auto', pb: 0, pt: 2.5, px: 0 }}
        to={buildJobDetailsPath(job.slug)}
      >
        View job
      </Button>
    </Paper>
  );
};

const JobCollectionUnavailable = () => (
  <Box
    alignItems="center"
    display="flex"
    flexDirection="column"
    justifyContent="center"
    minHeight={{ xs: 300, md: 350 }}
    sx={{
      bgcolor: 'rgba(255,255,255,.72)',
      border: '1px dashed rgba(37,99,235,.22)',
      borderRadius: 4,
      p: 4,
      textAlign: 'center',
    }}
  >
    <Box
      alignItems="center"
      display="flex"
      justifyContent="center"
      sx={{ bgcolor: '#e6f0ff', borderRadius: '50%', color: 'primary.main', height: 64, width: 64 }}
    >
      <BusinessCenterOutlinedIcon fontSize="large" />
    </Box>
    <Typography
      component="h3"
      sx={{ color: '#0b1739', fontSize: '1.4rem', fontWeight: 800, mt: 2 }}
    >
      Jobs are temporarily unavailable
    </Typography>
    <Typography color="text.secondary" sx={{ mt: 1 }}>
      You can still explore all active opportunities.
    </Typography>
    <Button component={Link} endIcon={<ArrowForwardIcon />} sx={{ mt: 2 }} to={ROUTES.JOBS}>
      Browse all jobs
    </Button>
  </Box>
);

interface HeroSearchProps {
  experienceLevel: string;
  location: string;
  onExperienceChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSubmit: () => void;
  search: string;
}

const HeroSearch = ({
  experienceLevel,
  location,
  onExperienceChange,
  onLocationChange,
  onSearchChange,
  onSubmit,
  search,
}: HeroSearchProps) => (
  <Paper
    component="form"
    elevation={0}
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit();
    }}
    sx={{
      bgcolor: 'rgba(255,255,255,.95)',
      border: '1px solid rgba(37,99,235,.16)',
      borderRadius: 3,
      boxShadow: '0 14px 40px rgba(23,49,97,.09)',
      mt: 3,
      p: 1,
    }}
  >
    <Grid alignItems="center" container spacing={1}>
      <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
        <TextField
          fullWidth
          label="Job title, skill, or company"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="e.g. Software Engineer"
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          value={search}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <TextField
          fullWidth
          label="Location"
          onChange={(event) => onLocationChange(event.target.value)}
          placeholder="e.g. Pune"
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          value={location}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 7, lg: 3.5 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="home-experience-label">Experience</InputLabel>
          <Select
            label="Experience"
            labelId="home-experience-label"
            onChange={(event) => onExperienceChange(String(event.target.value))}
            value={experienceLevel}
          >
            <MenuItem value="">Any</MenuItem>
            {experienceLevelOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 5, lg: 1.5 }}>
        <Button
          aria-label="Search Jobs"
          fullWidth
          size="large"
          sx={{ minHeight: 40, minWidth: { lg: 52 }, px: { lg: 0 } }}
          type="submit"
          variant="contained"
        >
          <ArrowForwardIcon />
        </Button>
      </Grid>
    </Grid>
  </Paper>
);

const CompanyMarquee = ({
  companies,
}: {
  companies: { data?: PopularCompany[]; isError: boolean; isLoading: boolean };
}) => {
  const usableCompanies = companies.data?.filter((company) => company.name.trim()) ?? [];
  return (
    <section className="company-strip" aria-label="Companies with opportunities">
      <Typography color="text.secondary" textAlign="center">
        Explore opportunities from leading companies
      </Typography>
      {companies.isLoading ? (
        <Typography textAlign="center">Loading companies…</Typography>
      ) : usableCompanies.length ? (
        <div className="company-scroll">
          <div className="company-track">
            {[false, true].map((duplicate) => (
              <div
                className="company-group"
                key={String(duplicate)}
                aria-hidden={duplicate || undefined}
              >
                {usableCompanies.map((company) => (
                  <Link
                    key={company.id}
                    tabIndex={duplicate ? -1 : undefined}
                    to={`${ROUTES.JOBS}?companyName=${encodeURIComponent(company.name)}`}
                  >
                    <CompanyLogoFallback
                      companyName={company.name}
                      logoUrl={company.logoUrl}
                      size={36}
                    />
                    <strong>{company.name}</strong>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Typography color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
          Explore the job catalogue to discover hiring companies.
        </Typography>
      )}
    </section>
  );
};

const SectionHeading = ({
  description,
  eyebrow,
  id,
  title,
}: {
  description: string;
  eyebrow: string;
  id: string;
  title: string;
}) => (
  <Box maxWidth={800}>
    <Typography color="primary.main" fontWeight={850} letterSpacing=".11em" variant="overline">
      {eyebrow}
    </Typography>
    <Typography
      component="h2"
      id={id}
      sx={{
        color: '#0b1739',
        fontSize: { xs: '2.15rem', md: 'clamp(2.65rem, 3.4vw, 3.2rem)' },
        fontWeight: 800,
        letterSpacing: '-0.04em',
        lineHeight: 1.08,
        mt: 0.75,
      }}
    >
      {title}
    </Typography>
    <Typography
      color="text.secondary"
      sx={{ fontSize: { xs: '1rem', md: '1.08rem' }, lineHeight: 1.7, mt: 1.5 }}
    >
      {description}
    </Typography>
  </Box>
);
