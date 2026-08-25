import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SearchIcon from '@mui/icons-material/Search';
import ViewQuiltOutlinedIcon from '@mui/icons-material/ViewQuiltOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import {
  Box,
  Button,
  Card,
  CardContent,
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
import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { buildJobDetailsPath, ROUTES } from '@/constants/routes';
import { PUBLIC_PAGE_CONTAINER_MAX_WIDTH, PUBLIC_PAGE_GUTTER } from '@/constants/publicLayout';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/store/authSlice';
import {
  useGetFeaturedJobsQuery,
  useGetLatestJobsQuery,
  useGetPopularCompaniesQuery,
} from '@/features/jobs/api/jobsApi';
import { JobCardSkeleton } from '@/features/jobs/components/JobCardSkeleton';
import { CompanyLogoFallback } from '@/features/jobs/components/CompanyLogoFallback';
import { experienceLevelOptions, getExperienceLevelLabel, getWorkplaceTypeLabel } from '@/features/jobs/constants/jobOptions';
import type { PopularCompany, PublicJobSummary } from '@/features/jobs/types/jobModels';
import { emptyJobSearchState, serializeJobSearchState } from '@/features/jobs/utils/jobSearchParams';
import { VERIFIED_PUBLIC_PORTFOLIO_DEMO_URL } from '@/features/portfolio/constants/portfolioDemo';
import { useAppSelector } from '@/hooks/reduxHooks';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { useStructuredData } from '@/hooks/useStructuredData';
import { UserRole } from '@/types';

const featurePanels = [
  {
    description: 'Search active roles by keyword, company, category, location, work mode, employment type, and experience level.',
    icon: <SearchIcon />,
    label: 'Job search',
    title: 'A focused search built around real job details',
  },
  {
    description: 'Keep your candidate information and resume ready, then receive resume-based recommendations when processing is complete.',
    icon: <UploadFileOutlinedIcon />,
    label: 'Profile & resume',
    title: 'Your career information, kept in one secure workspace',
  },
  {
    description: 'Bookmark opportunities you want to revisit without losing your place in the search.',
    icon: <BookmarkBorderOutlinedIcon />,
    label: 'Saved jobs',
    title: 'Build a shortlist at your own pace',
  },
  {
    description: 'Apply to selected roles and review submitted applications and their current status from your dashboard.',
    icon: <DescriptionOutlinedIcon />,
    label: 'Applications',
    title: 'Keep your active job search organised',
  },
] as const;

const companyShowcase: PopularCompany[] = [
  'TCS', 'Infosys', 'Accenture', 'Cognizant', 'Capgemini', 'Wipro', 'HCLTech', 'IBM',
  'Deloitte', 'Amazon', 'Microsoft', 'Oracle', 'SAP', 'Adobe', 'Cisco', 'JPMorgan Chase',
  'Mastercard', 'Visa', 'PhonePe', 'Razorpay', 'Flipkart',
].map((name) => ({ activeJobCount: 0, id: `showcase-${name}`, industry: null, isVerified: false, location: null, logoUrl: null, name, slug: name.toLowerCase().replace(/\s+/g, '-') }));

const wideSectionStyles = { left: 'calc((100% - 100vw) / 2)', position: 'relative' as const, width: '100vw' };
const wideContainerStyles = { maxWidth: PUBLIC_PAGE_CONTAINER_MAX_WIDTH, paddingInline: `${PUBLIC_PAGE_GUTTER} !important` };

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
  const [featureTab, setFeatureTab] = useState(0);
  const currentJobs = jobTab === 0 ? featured : latest;
  const selectedFeature = featurePanels[featureTab] ?? featurePanels[0];
  const candidateHome = user?.role === UserRole.Administrator ? ROUTES.ADMIN : ROUTES.DASHBOARD_JOBS;
  const isCandidate = isAuthenticated && user?.role === UserRole.Candidate;
  const portfolioCtaPath = isCandidate
    ? ROUTES.PORTFOLIO
    : isAuthenticated
      ? ROUTES.ADMIN
      : ROUTES.REGISTER;
  const portfolioCtaState = isAuthenticated
    ? undefined
    : { from: { pathname: ROUTES.PORTFOLIO } };
  const portfolioCtaLabel = isAuthenticated && !isCandidate ? 'Open administration' : 'Create portfolio';

  const submitSearch = () => {
    const params = serializeJobSearchState({
      ...emptyJobSearchState(),
      experienceLevel: experienceLevel ? Number(experienceLevel) : undefined,
      location: location.trim(),
      search: search.trim(),
    });
    void navigate(`${ROUTES.JOBS}${params.size ? `?${params.toString()}` : ''}`);
  };

  return (
    <Stack spacing={0}>
      <Box component="section" sx={{ bgcolor: '#f4f8ff', backgroundImage: 'radial-gradient(circle at 78% 20%, rgba(37,99,235,.12), transparent 28%), radial-gradient(circle, rgba(37,99,235,.08) 1px, transparent 1px)', backgroundSize: 'auto, 28px 28px', left: 'calc((100% - 100vw) / 2)', overflow: 'hidden', position: 'relative', width: '100vw' }}>
        <Container maxWidth={false} sx={wideContainerStyles}>
          <Grid alignItems="center" container spacing={{ xs: 5, md: 3, lg: 5 }} sx={{ minHeight: { xs: 'auto', md: 660, lg: 700 }, py: { xs: 5, md: 3 } }}>
            <Grid size={{ xs: 12, md: 5.5 }}>
              <Chip label="Opportunities for every career stage" color="primary" size="small" sx={{ bgcolor: 'rgba(37,99,235,.1)', fontWeight: 800, mb: 2.5 }} variant="outlined" />
              <Typography component="h1" sx={{ color: '#0b1739', fontSize: { xs: '2.75rem', sm: '3.8rem', md: '4rem', lg: '4.6rem' }, fontWeight: 800, letterSpacing: '-0.052em', lineHeight: 0.99, maxWidth: 700 }}>
                Find the right<br />opportunity.<br /><Box component="span" color="primary.main">Build your career.</Box>
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: { xs: '1.05rem', lg: '1.16rem' }, lineHeight: 1.65, maxWidth: 650, mt: 2.75 }}>
                Discover relevant jobs and turn your skills, projects and experience into a professional portfolio you can share anywhere.
              </Typography>
              <HeroSearch experienceLevel={experienceLevel} location={location} onExperienceChange={setExperienceLevel} onLocationChange={setLocation} onSearchChange={setSearch} onSubmit={submitSearch} search={search} />
              <Stack alignItems={{ xs: 'stretch', sm: 'center' }} direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2.25 }}>
                <Button component={Link} endIcon={<ArrowForwardIcon />} size="large" sx={{ '&:hover': { boxShadow: 5, transform: 'translateY(-2px)' }, minHeight: 50, px: 3, transition: 'transform 160ms ease, box-shadow 160ms ease' }} to={ROUTES.JOBS} variant="contained">Browse jobs</Button>
                <Button component={Link} endIcon={<ArrowForwardIcon />} size="large" state={portfolioCtaState} sx={{ '&:hover': { bgcolor: 'rgba(37,99,235,.07)', transform: 'translateX(2px)' }, minHeight: 50, px: 2, transition: 'transform 160ms ease' }} to={portfolioCtaPath} variant="text">
                  {portfolioCtaLabel}
                </Button>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6.5 }}>
              <CareerVisual />
            </Grid>
          </Grid>
          <CompanyMarquee companies={companies} />
        </Container>
      </Box>

      <PortfolioFeatureSection
        ctaLabel={portfolioCtaLabel === 'Create portfolio' ? 'Create your portfolio' : portfolioCtaLabel}
        ctaPath={portfolioCtaPath}
        ctaState={portfolioCtaState}
      />

      <Box aria-labelledby="interview-insights-home-heading" component="section" sx={{ ...wideSectionStyles, bgcolor: 'common.white' }}>
        <Container maxWidth={false} sx={{ ...wideContainerStyles, py: { xs: 7, md: 10 } }}>
          <Box sx={{ maxWidth: 820 }}><Typography color="primary.main" fontWeight={850} letterSpacing=".12em" variant="overline">Career preparation</Typography><Typography component="h2" id="interview-insights-home-heading" sx={{ color: '#0b1739', fontSize: { xs: '2.25rem', md: '3.2rem' }, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1.08, mt: 1 }}>Prepare smarter for your next interview</Typography><Typography color="text.secondary" sx={{ fontSize: { xs: '1rem', md: '1.12rem' }, lineHeight: 1.75, mt: 2 }}>Explore candidate-shared interview rounds, common questions, preparation tips, and real experiences by company and role.</Typography></Box>
          <Grid container spacing={2.5} sx={{ mt: 3 }}>{[
            ['Real interview experiences', 'Learn from candidate-shared experiences by company and role.'],
            ['Round-by-round preparation', 'Prepare for technical, HR, coding, and managerial rounds.'],
            ['Help future candidates', 'Share useful questions and tips with the candidate community.'],
          ].map(([title, description]) => <Grid key={title} size={{ xs: 12, md: 4 }}><Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}><CardContent sx={{ p: 3 }}><CheckCircleOutlineIcon color="primary" /><Typography component="h3" sx={{ mt: 2 }} variant="h3">{title}</Typography><Typography color="text.secondary" sx={{ lineHeight: 1.7, mt: 1 }}>{description}</Typography></CardContent></Card></Grid>)}</Grid>
          <Stack alignItems={{ xs: 'stretch', sm: 'center' }} direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
            {user?.role !== UserRole.Administrator ? <Button component={Link} endIcon={<ArrowForwardIcon />} state={isCandidate ? undefined : { from: { pathname: ROUTES.INTERVIEW_INSIGHTS } }} to={isCandidate ? ROUTES.INTERVIEW_INSIGHTS : ROUTES.LOGIN} variant="contained">Explore interview insights</Button> : null}
            <Typography color="text.secondary" variant="body2">Interview Insights requires an active Career Harbor membership.</Typography>
          </Stack>
        </Container>
      </Box>

      <Box aria-labelledby="opportunities-heading" component="section" sx={{ bgcolor: 'common.white', left: 'calc((100% - 100vw) / 2)', position: 'relative', width: '100vw' }}>
        <Container maxWidth={false} sx={{ ...wideContainerStyles, pb: { xs: 6, md: 8 }, pt: { xs: 6, md: 9 } }}>
          <Box sx={{ mx: 'auto', maxWidth: 820, textAlign: 'center' }}>
            <Typography color="primary.main" fontWeight={850} letterSpacing=".12em" variant="overline">Live opportunities</Typography>
            <Typography component="h2" id="opportunities-heading" sx={{ color: '#0b1739', fontSize: { xs: '2.25rem', sm: '2.8rem', md: '3.2rem' }, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1.08, mt: 1 }}>Opportunities for every stage of your career</Typography>
            <Typography color="text.secondary" sx={{ fontSize: { xs: '1rem', md: '1.13rem' }, lineHeight: 1.7, mt: 2 }}>Explore featured and recently published roles from the live Career Harbor job catalogue.</Typography>
          </Box>
          <Paper elevation={0} sx={{ bgcolor: '#f5f8fc', border: '1px solid rgba(15,23,42,.08)', borderRadius: { xs: 3, md: 4 }, minHeight: { md: 510 }, mt: { xs: 4, md: 5 }, overflow: 'hidden', p: { xs: 2, sm: 3, md: 5 } }}>
            <Tabs aria-label="Job collections" onChange={(_, value: number) => setJobTab(value)} sx={{ '& .MuiTab-root': { borderRadius: 2.5, color: '#334155', fontWeight: 800, minHeight: 44, px: { xs: 2, sm: 3 }, textTransform: 'none' }, '& .Mui-selected': { bgcolor: '#e6f0ff', color: 'primary.main' }, '& .MuiTabs-indicator': { display: 'none' }, minHeight: 44 }} value={jobTab} variant="scrollable"><Tab label="Featured Jobs" /><Tab label="Latest Jobs" /></Tabs>
            <Grid alignItems="stretch" container spacing={{ xs: 4, md: 5, lg: 7 }} sx={{ mt: { xs: 2, md: 3 } }}>
              <Grid size={{ xs: 12, md: 4.5 }}>
                <Stack justifyContent="center" sx={{ height: '100%', maxWidth: 430, py: { md: 3 } }}>
                  <Box alignItems="center" display="flex" justifyContent="center" sx={{ bgcolor: '#e6f0ff', borderRadius: 3, color: 'primary.main', height: 52, mb: 2.5, width: 52 }}><BusinessCenterOutlinedIcon /></Box>
                  <Typography component="h3" sx={{ color: '#0b1739', fontSize: { xs: '1.75rem', md: '2.15rem' }, fontWeight: 800, letterSpacing: '-.035em' }}>{jobTab === 0 ? 'Featured opportunities' : 'Recently published jobs'}</Typography>
                  <Typography color="text.secondary" sx={{ fontSize: '1.05rem', lineHeight: 1.75, mt: 1.5 }}>{jobTab === 0 ? 'Discover highlighted openings from companies currently hiring.' : 'See new opportunities added to Career Harbor.'}</Typography>
                  <Button component={Link} endIcon={<ArrowForwardIcon />} sx={{ alignSelf: 'flex-start', mt: 2.5, px: 0 }} to={ROUTES.JOBS}>{jobTab === 0 ? 'Browse all jobs' : 'Browse latest jobs'}</Button>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 7.5 }}>
                <JobCollection jobs={currentJobs} />
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      <Box aria-labelledby="how-heading" component="section" sx={{ ...wideSectionStyles, bgcolor: '#f6f8fb' }}>
        <Container maxWidth={false} sx={{ ...wideContainerStyles, pb: { xs: 3, md: 4 }, pt: { xs: 6, md: 8 } }}>
          <SectionHeading eyebrow="A clearer job search" id="how-heading" title="From discovery to application in four simple steps" description="Career Harbor keeps the practical parts of your job search connected." />
          <Grid container spacing={2.5} sx={{ '&::before': { bgcolor: 'rgba(37,99,235,.18)', content: '""', display: { xs: 'none', lg: 'block' }, height: 2, left: '10%', position: 'absolute', right: '10%', top: 47 }, mt: { xs: 3, md: 4 }, position: 'relative' }}>{([
          ['01', 'Discover', 'Search and filter published jobs that fit your goals.', <SearchIcon />],
          ['02', 'Create your profile', 'Keep your candidate information and preferences current.', <PersonOutlineIcon />],
          ['03', 'Prepare your resume', 'Upload or replace your resume securely from Browse Jobs.', <UploadFileOutlinedIcon />],
          ['04', 'Apply and track', 'Submit applications and review their current status.', <DescriptionOutlinedIcon />],
          ] as const).map(([number, title, description, icon]) => <Grid key={number} size={{ xs: 12, sm: 6, lg: 3 }} sx={{ position: 'relative', zIndex: 1 }}><Card elevation={0} sx={{ '&:hover': { borderColor: 'rgba(37,99,235,.28)', boxShadow: '0 18px 36px rgba(23,49,97,.09)', transform: 'translateY(-4px)' }, border: '1px solid rgba(15,23,42,.08)', borderRadius: 3, height: '100%', transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease' }}><CardContent sx={{ p: 3 }}><Stack spacing={2}><Stack alignItems="center" direction="row" justifyContent="space-between"><Box alignItems="center" color="primary.main" display="flex" justifyContent="center" sx={{ bgcolor: '#e8f1ff', borderRadius: 2.5, height: 44, width: 44 }}>{icon}</Box><Typography color="text.disabled" fontWeight={800}>{number}</Typography></Stack><Typography component="h3" variant="h3">{title}</Typography><Typography color="text.secondary">{description}</Typography></Stack></CardContent></Card></Grid>)}</Grid>
        </Container>
      </Box>

      <Box sx={{ ...wideSectionStyles, bgcolor: '#f6f8fb' }}>
        <Container maxWidth={false} sx={{ ...wideContainerStyles, pb: { xs: 5, md: 4.5 }, pt: { xs: 3, md: 4 } }}>
          <Paper component="section" elevation={0} sx={{ backgroundImage: 'radial-gradient(circle at 88% 20%, rgba(96,165,250,.17), transparent 32%)', bgcolor: 'primary.dark', borderRadius: { xs: 3, md: 4 }, boxShadow: '0 24px 60px rgba(15,23,42,.18)', color: 'common.white', overflow: 'hidden', p: { xs: 2.5, sm: 4, md: 6 } }}>
            <Grid alignItems="center" container spacing={{ xs: 4, md: 6, lg: 8 }}>
          <Grid size={{ xs: 12, md: 4.5 }}><Typography color="primary.light" fontWeight={800} variant="overline">Candidate workspace</Typography><Typography component="h2" sx={{ fontSize: { xs: '2rem', md: 'clamp(2.4rem, 3vw, 3rem)' }, letterSpacing: '-.035em', lineHeight: 1.08, mt: 1 }}>Keep your job search in one place</Typography><Typography sx={{ color: 'rgba(255,255,255,.75)', lineHeight: 1.7, mt: 2 }}>Use the tools already available today—from finding roles to keeping track of applications.</Typography></Grid>
          <Grid size={{ xs: 12, md: 7.5 }}><Box sx={{ bgcolor: 'rgba(255,255,255,.055)', border: '1px solid rgba(255,255,255,.13)', borderRadius: 3, p: { xs: 1, sm: 1.5 } }}><Tabs aria-label="Candidate features" onChange={(_, value: number) => setFeatureTab(value)} sx={{ '& .MuiTab-root': { borderRadius: 2, color: 'rgba(255,255,255,.72)', fontWeight: 750, minHeight: 44, textTransform: 'none' }, '& .Mui-selected': { bgcolor: 'rgba(255,255,255,.12)', color: 'white !important' }, '& .MuiTabs-indicator': { display: 'none' } }} value={featureTab} variant="scrollable">{featurePanels.map((feature) => <Tab key={feature.label} label={feature.label} />)}</Tabs><Box sx={{ bgcolor: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 2.5, mt: 1.5, minHeight: { md: 250 }, p: { xs: 2.5, sm: 3.5 } }}><Box alignItems="center" color="primary.light" display="flex" justifyContent="center" sx={{ bgcolor: 'rgba(96,165,250,.14)', borderRadius: 2.5, height: 48, width: 48 }}>{selectedFeature.icon}</Box><Typography component="h3" sx={{ fontSize: '1.5rem', fontWeight: 800, mt: 2 }}>{selectedFeature.title}</Typography><Typography sx={{ color: 'rgba(255,255,255,.76)', lineHeight: 1.7, mt: 1 }}>{selectedFeature.description}</Typography><Button color="inherit" component={Link} endIcon={<ArrowForwardIcon />} sx={{ mt: 2 }} to={isAuthenticated ? candidateHome : ROUTES.REGISTER}>{isAuthenticated ? 'Open workspace' : 'Create an account'}</Button></Box></Box></Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      <Box aria-labelledby="why-heading" component="section" sx={{ ...wideSectionStyles, bgcolor: 'common.white' }}>
        <Container maxWidth={false} sx={{ ...wideContainerStyles, pb: { xs: 3, md: 4 }, pt: { xs: 6, md: 6 } }}>
        <SectionHeading eyebrow="Why Career Harbor" id="why-heading" title="Practical tools for a focused job search" description="No inflated claims—just a clear place to discover, save, apply, and stay organised." />
        <Grid container spacing={{ xs: 3, md: 4, lg: 5 }} sx={{ mt: { xs: 3, md: 4 } }}>{[
          ['Focused discovery', 'Find active opportunities with useful filters instead of scrolling through unrelated listings.', <SearchIcon />],
          ['Resume-ready profile', 'Keep your candidate information and resume available when opportunities appear.', <UploadFileOutlinedIcon />],
          ['One connected workspace', 'Saved jobs, applications, status history, and membership access stay together.', <DescriptionOutlinedIcon />],
        ].map(([title, description, icon]) => <Grid key={title as string} size={{ xs: 12, md: 4 }}><Box sx={{ borderTop: '1px solid rgba(15,23,42,.12)', pt: 2.5 }}><Box alignItems="center" color="primary.main" display="flex" justifyContent="center" sx={{ bgcolor: '#eef5ff', borderRadius: 2.5, height: 46, mb: 2.25, width: 46 }}>{icon}</Box><Typography component="h3" variant="h3">{title}</Typography><Typography color="text.secondary" sx={{ lineHeight: 1.7, mt: 1 }}>{description}</Typography></Box></Grid>)}</Grid>
        </Container>
      </Box>

      <Box sx={{ ...wideSectionStyles, bgcolor: 'common.white' }}>
      <Container maxWidth={false} sx={{ ...wideContainerStyles, pt: { xs: 4, md: 5 } }}>
      <Paper component="section" elevation={0} sx={{ backgroundImage: 'radial-gradient(circle at 18% 20%, rgba(255,255,255,.16), transparent 24%), radial-gradient(circle at 82% 80%, rgba(255,255,255,.12), transparent 22%)', bgcolor: 'primary.main', borderRadius: { xs: 3, md: 4 }, color: 'common.white', p: { xs: 3.5, sm: 5, md: 6 }, textAlign: 'center' }}>
        <WorkOutlineIcon sx={{ fontSize: 42 }} />
        <Typography component="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, mt: 2 }}>Your next opportunity could be one search away.</Typography>
        <Typography sx={{ color: 'rgba(255,255,255,.8)', mx: 'auto', mt: 1.5, maxWidth: 650 }}>Explore the latest active jobs or create your candidate account to save opportunities and manage applications.</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="center" spacing={1.5} sx={{ mt: 3 }}><Button component={Link} sx={{ bgcolor: 'common.white', color: 'primary.dark', '&:hover': { bgcolor: 'grey.100' } }} to={ROUTES.JOBS} variant="contained">Explore jobs</Button>{!isAuthenticated ? <Button color="inherit" component={Link} to={ROUTES.REGISTER} variant="outlined">Create account</Button> : null}</Stack>
      </Paper>
      </Container>
      </Box>
    </Stack>
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

const PortfolioFeatureSection = ({
  ctaLabel,
  ctaPath,
  ctaState,
}: PortfolioFeatureSectionProps) => (
  <Box
    aria-labelledby="portfolio-feature-heading"
    component="section"
    sx={{ ...wideSectionStyles, bgcolor: '#f8fbff' }}
  >
    <Container
      maxWidth={false}
      sx={{ ...wideContainerStyles, py: { xs: 7, md: 10 } }}
    >
      <Grid alignItems="center" container spacing={{ xs: 5, md: 7, lg: 10 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography color="primary.main" fontWeight={850} letterSpacing=".12em" variant="overline">
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
            Showcase your skills, projects, experience, education and certifications in a
            portfolio designed to be shared with recruiters and professional connections.
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
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6, mt: 0.5 }} variant="body2">
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

      <Box sx={{ borderTop: '1px solid rgba(15,23,42,.1)', mt: { xs: 6, md: 8 }, pt: { xs: 5, md: 6 } }}>
        <Typography component="h3" sx={{ color: '#0b1739', fontSize: { xs: '1.75rem', md: '2.2rem' }, fontWeight: 800, textAlign: 'center' }}>
          Create your portfolio in three steps
        </Typography>
        <Grid component="ol" container spacing={2.5} sx={{ listStyle: 'none', mt: 2, p: 0 }}>
          {portfolioSteps.map((step, index) => (
            <Grid component="li" key={step.title} size={{ xs: 12, md: 4 }}>
              <Paper elevation={0} sx={{ bgcolor: 'common.white', height: '100%', p: 3 }}>
                <Typography aria-hidden="true" color="primary.main" fontWeight={900}>
                  {String(index + 1).padStart(2, '0')}
                </Typography>
                <Typography component="h4" sx={{ color: '#0b1739', fontSize: '1.2rem', fontWeight: 800, mt: 1 }}>
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
          <Typography component="p" sx={{ fontSize: { xs: '1.35rem', sm: '1.65rem' }, fontWeight: 850 }}>
            Aarav Mehta
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,.72)' }}>Full Stack Developer</Typography>
        </Box>
      </Stack>
      <Paper elevation={0} sx={{ bgcolor: 'rgba(255,255,255,.97)', border: 0, mt: 3, p: { xs: 2, sm: 2.5 } }}>
        <Typography color="#0b1739" fontWeight={850}>Skills</Typography>
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.25 }}>
          {['React', 'ASP.NET Core', 'PostgreSQL'].map((skill) => (
            <Chip color="primary" key={skill} label={skill} size="small" variant="outlined" />
          ))}
        </Stack>
        <Box sx={{ borderTop: '1px solid rgba(15,23,42,.09)', mt: 2.5, pt: 2.25 }}>
          <Stack alignItems="center" direction="row" spacing={1}>
            <DevicesOutlinedIcon color="primary" fontSize="small" />
            <Typography color="#0b1739" fontWeight={850}>Featured project</Typography>
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
        <Chip label="Illustrative preview" size="small" sx={{ bgcolor: 'rgba(255,255,255,.12)', color: 'common.white' }} />
      </Stack>
    </Box>
  </Paper>
);

const JobCollection = ({ jobs }: { jobs: { data?: { items: PublicJobSummary[] }; isError: boolean; isLoading: boolean } }) => {
  if (jobs.isLoading) return <Grid aria-label="Loading homepage jobs" container role="status" spacing={2}>{Array.from({ length: 2 }, (_, index) => <Grid key={index} size={{ xs: 12, sm: 6 }}><JobCardSkeleton /></Grid>)}</Grid>;
  if (jobs.isError || !jobs.data?.items.length) return <JobCollectionUnavailable />;

  return <Grid container spacing={2}>{jobs.data.items.slice(0, 2).map((job) => <Grid key={job.id} size={{ xs: 12, sm: 6 }}><DiscoveryJobCard job={job} /></Grid>)}</Grid>;
};

const DiscoveryJobCard = ({ job }: { job: PublicJobSummary }) => {
  const experience = job.minimumExperienceYears !== null || job.maximumExperienceYears !== null
    ? `${job.minimumExperienceYears ?? 0}${job.maximumExperienceYears !== null ? `–${job.maximumExperienceYears}` : '+'} years`
    : getExperienceLevelLabel(job.experienceLevel);

  return (
    <Paper component="article" elevation={0} sx={{ '&:hover': { borderColor: 'rgba(37,99,235,.35)', boxShadow: '0 20px 42px rgba(23,49,97,.12)', transform: 'translateY(-3px)' }, border: '1px solid rgba(15,23,42,.09)', borderRadius: 3.5, boxShadow: '0 10px 28px rgba(23,49,97,.07)', display: 'flex', flexDirection: 'column', height: '100%', p: { xs: 2.25, md: 2.75 }, transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease' }}>
      <Stack alignItems="center" direction="row" spacing={1.5}><CompanyLogoFallback companyName={job.companyName} logoUrl={job.companyLogoUrl} size={42} /><Typography color="#334155" fontSize=".88rem" fontWeight={800}>{job.companyName}</Typography></Stack>
      <Typography component="h4" sx={{ color: '#0b1739', fontSize: { xs: '1.2rem', md: '1.32rem' }, fontWeight: 800, lineHeight: 1.3, mt: 2 }}>{job.title}</Typography>
      <Stack color="text.secondary" direction="row" flexWrap="wrap" gap={.75} sx={{ mt: 1.5 }}>
        {job.location ? <Typography fontSize=".82rem">{job.location}</Typography> : null}
        {job.location ? <Typography aria-hidden fontSize=".82rem">·</Typography> : null}
        <Typography fontSize=".82rem">{getWorkplaceTypeLabel(job.workplaceType)}</Typography>
        <Typography aria-hidden fontSize=".82rem">·</Typography>
        <Typography fontSize=".82rem">{experience}</Typography>
      </Stack>
      {job.categoryName ? <Typography color="primary.main" fontSize=".78rem" fontWeight={800} sx={{ bgcolor: '#eff6ff', borderRadius: 5, mt: 2, px: 1.25, py: .65, width: 'fit-content' }}>{job.categoryName}</Typography> : null}
      <Button aria-label={`View details for ${job.title} at ${job.companyName}`} component={Link} endIcon={<ArrowForwardIcon />} sx={{ alignSelf: 'flex-end', mt: 'auto', pb: 0, pt: 2.5, px: 0 }} to={buildJobDetailsPath(job.slug)}>View job</Button>
    </Paper>
  );
};

const JobCollectionUnavailable = () => <Box alignItems="center" display="flex" flexDirection="column" justifyContent="center" minHeight={{ xs: 300, md: 350 }} sx={{ bgcolor: 'rgba(255,255,255,.72)', border: '1px dashed rgba(37,99,235,.22)', borderRadius: 4, p: 4, textAlign: 'center' }}><Box alignItems="center" display="flex" justifyContent="center" sx={{ bgcolor: '#e6f0ff', borderRadius: '50%', color: 'primary.main', height: 64, width: 64 }}><BusinessCenterOutlinedIcon fontSize="large" /></Box><Typography component="h3" sx={{ color: '#0b1739', fontSize: '1.4rem', fontWeight: 800, mt: 2 }}>Jobs are temporarily unavailable</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>You can still explore all active opportunities.</Typography><Button component={Link} endIcon={<ArrowForwardIcon />} sx={{ mt: 2 }} to={ROUTES.JOBS}>Browse all jobs</Button></Box>;

interface HeroSearchProps {
  experienceLevel: string;
  location: string;
  onExperienceChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSubmit: () => void;
  search: string;
}

const HeroSearch = ({ experienceLevel, location, onExperienceChange, onLocationChange, onSearchChange, onSubmit, search }: HeroSearchProps) => (
  <Paper component="form" elevation={0} onSubmit={(event) => { event.preventDefault(); onSubmit(); }} sx={{ bgcolor: 'rgba(255,255,255,.95)', border: '1px solid rgba(37,99,235,.16)', borderRadius: 3, boxShadow: '0 14px 40px rgba(23,49,97,.09)', mt: 3, p: 1 }}>
    <Grid alignItems="center" container spacing={1}>
      <Grid size={{ xs: 12, sm: 6, lg: 4.5 }}><TextField fullWidth label="Job title, skill, or company" onChange={(event) => onSearchChange(event.target.value)} placeholder="e.g. Software Engineer" size="small" slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }} value={search} /></Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3.5 }}><TextField fullWidth label="Location" onChange={(event) => onLocationChange(event.target.value)} placeholder="e.g. Pune" size="small" slotProps={{ input: { startAdornment: <InputAdornment position="start"><LocationOnOutlinedIcon fontSize="small" /></InputAdornment> } }} value={location} /></Grid>
      <Grid size={{ xs: 12, sm: 7, lg: 2.5 }}><FormControl fullWidth size="small"><InputLabel id="home-experience-label">Experience</InputLabel><Select label="Experience" labelId="home-experience-label" onChange={(event) => onExperienceChange(String(event.target.value))} value={experienceLevel}><MenuItem value="">Any</MenuItem>{experienceLevelOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</Select></FormControl></Grid>
      <Grid size={{ xs: 12, sm: 5, lg: 1.5 }}><Button aria-label="Search Jobs" fullWidth size="large" sx={{ minHeight: 40, minWidth: { lg: 52 }, px: { lg: 0 } }} type="submit" variant="contained"><ArrowForwardIcon /></Button></Grid>
    </Grid>
  </Paper>
);

const CareerVisual = () => (
  <Box aria-label="Illustration of Career Harbor candidate tools" role="img" sx={{ '@keyframes cardReveal': { '0%, 8%': { opacity: 0, transform: 'translateY(12px)' }, '22%, 88%': { opacity: 1, transform: 'translateY(0)' }, '100%': { opacity: .96, transform: 'translateY(-2px)' } }, '@keyframes portraitFloat': { '0%, 100%': { transform: 'translateX(-50%) translateY(0)' }, '50%': { transform: 'translateX(-50%) translateY(-4px)' } }, '@keyframes rotateBack': { to: { transform: 'translate(-50%, -50%) rotate(-360deg)' } }, '@keyframes rotateForward': { to: { transform: 'translate(-50%, -50%) rotate(360deg)' } }, aspectRatio: '1 / 1', maxWidth: 650, mx: 'auto', position: 'relative', width: '100%' }}>
    <Box aria-hidden sx={{ background: 'radial-gradient(circle, rgba(255,255,255,.95) 0 38%, rgba(219,234,254,.7) 39% 52%, transparent 53%)', borderRadius: '50%', inset: '7%', position: 'absolute' }} />
    <RadialRing animation="rotateForward 36s linear infinite" borderColor="rgba(37,99,235,.42) transparent rgba(96,165,250,.3) rgba(37,99,235,.16)" inset="8%" width={2} />
    <RadialRing animation="rotateBack 29s linear infinite" borderColor="transparent rgba(14,165,233,.34) rgba(37,99,235,.22) transparent" inset="16%" width={4} />
    <RadialRing animation="rotateForward 24s linear infinite" borderColor="rgba(99,102,241,.28) rgba(37,99,235,.16) transparent rgba(37,99,235,.35)" inset="24%" width={2} />
    <Box alt="Fictional professional representing a Career Harbor job seeker" component="img" src="/images/career-professional.webp" sx={{ '@media (prefers-reduced-motion: reduce)': { animation: 'none' }, animation: 'portraitFloat 7s ease-in-out infinite', bottom: '5%', filter: 'drop-shadow(0 20px 24px rgba(23,49,97,.18))', height: '83%', left: '50%', objectFit: 'contain', objectPosition: 'center bottom', position: 'absolute', transform: 'translateX(-50%)', width: '62%', zIndex: 2 }} />
    <ProductCard delay=".7s" position={{ left: { xs: '0%', sm: '1%' }, top: { xs: '8%', sm: '25%' } }} title="Resume Match"><Typography color="success.main" fontSize=".75rem" fontWeight={800}>Strong match</Typography><Typography color="#0b1739" fontSize=".8rem" fontWeight={800} mt={.6}>.NET Developer</Typography><Typography color="text.secondary" fontSize=".72rem">Pune</Typography></ProductCard>
    <ProductCard delay="2.1s" position={{ right: { xs: '0%', sm: '1%' }, top: { xs: '17%', sm: '19%' } }} title="Latest Opportunities"><Typography color="primary.main" fontSize=".8rem" fontWeight={800}>3 new roles</Typography><Typography color="text.secondary" fontSize=".72rem">matching your search</Typography></ProductCard>
    <ProductCard delay="3.5s" position={{ bottom: { xs: '3%', sm: '17%' }, right: { xs: '0%', sm: '0%' } }} title="Application Tracker"><Stack spacing={.25}><TrackerRow label="Applied" value="✓" /><TrackerRow label="In review" value="●" /><TrackerRow label="Next update" value="—" /></Stack></ProductCard>
  </Box>
);

const RadialRing = ({ animation, borderColor, inset, width }: { animation: string; borderColor: string; inset: string; width: number }) => <Box aria-hidden sx={{ '@media (prefers-reduced-motion: reduce)': { animation: 'none' }, animation, borderColor, borderRadius: '50%', borderStyle: 'solid', borderWidth: width, height: `calc(100% - ${inset} - ${inset})`, left: '50%', position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)', width: `calc(100% - ${inset} - ${inset})` }} />;

const ProductCard = ({ children, delay, position, title }: { children: ReactNode; delay: string; position: Record<string, unknown>; title: string }) => <Paper elevation={0} sx={{ ...position, '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 1 }, animation: `cardReveal 8s ease ${delay} infinite both`, bgcolor: 'rgba(255,255,255,.96)', border: '1px solid rgba(37,99,235,.14)', borderRadius: 2.5, boxShadow: '0 15px 34px rgba(23,49,97,.14)', minWidth: { xs: 132, sm: 158 }, p: { xs: 1.2, sm: 1.5 }, position: 'absolute', zIndex: 3 }}><Typography color="#0b1739" fontSize={{ xs: '.72rem', sm: '.8rem' }} fontWeight={850} mb={.6}>{title}</Typography>{children}</Paper>;

const TrackerRow = ({ label, value }: { label: string; value: string }) => <Stack direction="row" justifyContent="space-between" spacing={2}><Typography color="text.secondary" fontSize=".68rem">{label}</Typography><Typography color="primary.main" fontSize=".68rem" fontWeight={900}>{value}</Typography></Stack>;

const CompanyMarquee = ({ companies }: { companies: { data?: PopularCompany[]; isError: boolean; isLoading: boolean } }) => {
  const companyItems = companies.data?.length ? companies.data : companyShowcase;
  const repeatedCompanies = [...companyItems, ...companyItems];

  return (
    <Box aria-labelledby="company-strip-heading" sx={{ borderTop: '1px solid rgba(37,99,235,.12)', pb: { xs: 3, md: 4 }, pt: 3 }}>
      <Typography color="text.secondary" fontWeight={700} id="company-strip-heading" textAlign="center">Explore opportunities from leading companies</Typography>
      {companyItems.length ? (
        <Box tabIndex={0} sx={{ '&:focus-within .company-marquee-track, &:hover .company-marquee-track': { animationPlayState: 'paused' }, '&::after, &::before': { content: '""', height: '100%', pointerEvents: 'none', position: 'absolute', top: 0, width: { xs: 30, md: 90 }, zIndex: 2 }, '&::after': { background: 'linear-gradient(90deg, transparent, #f4f8ff)', right: 0 }, '&::before': { background: 'linear-gradient(90deg, #f4f8ff, transparent)', left: 0 }, mt: 2.5, overflow: 'hidden', position: 'relative' }}>
          <Stack className="company-marquee-track" direction="row" sx={{ '@keyframes companyMarquee': { to: { transform: 'translateX(-50%)' } }, '@media (prefers-reduced-motion: reduce)': { animation: 'none', overflowX: 'auto', transform: 'none', width: 'max-content' }, animation: 'companyMarquee 32s linear infinite', width: 'max-content' }}>
            {repeatedCompanies.map((company, index) => <Box component={Link} key={`${company.id}-${index}`} to={`${ROUTES.JOBS}?companyName=${encodeURIComponent(company.name)}`} sx={{ '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main', outlineOffset: -3 }, '&:hover': { opacity: 1, transform: 'scale(1.03)' }, alignItems: 'center', color: '#334155', display: 'flex', flex: { xs: '0 0 165px', sm: '0 0 205px' }, gap: 1.25, justifyContent: 'center', minHeight: 64, opacity: .7, px: 2.5, textDecoration: 'none', transition: 'opacity 160ms ease, transform 160ms ease' }}>{company.logoUrl ? <CompanyLogoFallback companyName={company.name} logoUrl={company.logoUrl} size={38} /> : null}<Typography fontSize={{ xs: '.94rem', md: '1.02rem' }} fontWeight={850} letterSpacing="-.02em" noWrap>{company.name}</Typography></Box>)}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};

const SectionHeading = ({ description, eyebrow, id, title }: { description: string; eyebrow: string; id: string; title: string }) => (
  <Box maxWidth={800}>
    <Typography color="primary.main" fontWeight={850} letterSpacing=".11em" variant="overline">{eyebrow}</Typography>
    <Typography component="h2" id={id} sx={{ color: '#0b1739', fontSize: { xs: '2.15rem', md: 'clamp(2.65rem, 3.4vw, 3.2rem)' }, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.08, mt: 0.75 }}>{title}</Typography>
    <Typography color="text.secondary" sx={{ fontSize: { xs: '1rem', md: '1.08rem' }, lineHeight: 1.7, mt: 1.5 }}>{description}</Typography>
  </Box>
);
