import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Card, CardActions, CardContent, Chip, Grid, Paper, Stack, Typography } from '@mui/material';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { useGetConsultantsQuery } from '../api/profilesApi';
import { GuidanceError, GuidanceLoading, GuidanceNavigation, GuidancePage, GuidancePagination, TrustNotice } from '../components/GuidanceUI';
import { GuidanceForm, textValue } from '../components/GuidanceForm';
import { CareerProfessionalType } from '../types';
import { enumLabel, money } from '../utils/presentation';
import { guidanceRoutes } from '../utils/routes';

export const MarketplacePage = () => {
  useDocumentMetadata('Career Guidance | CareerHarbor', 'Find independent professionals for career guidance and interview preparation.');
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const page = Math.max(1, Math.min(1000000, Number(params.get('page')) || 1));
  const query = { pageNumber: page, pageSize: 12, search: params.get('search') || undefined, company: params.get('company') || undefined, role: params.get('role') || undefined, expertise: params.get('expertise') || undefined, language: params.get('language') || undefined, serviceType: params.get('serviceType') || undefined };
  const consultants = useGetConsultantsQuery(query);
  return <GuidancePage title="Find your next step" description="Practical career guidance, interview preparation, and role insights from independent professionals." actions={<Button onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}>Search & filters</Button>}>
    <GuidanceNavigation /><TrustNotice />
    <Paper sx={{ p: 2.5, display: filtersOpen || params.size ? 'block' : { xs: 'none', md: 'block' } }}>
      <GuidanceForm key={params.toString()} initial={Object.fromEntries(params.entries())} fields={[
        { name: 'search', label: 'Search consultants', maxLength: 200 }, { name: 'company', label: 'Company', maxLength: 200 },
        { name: 'role', label: 'Role', maxLength: 160 }, { name: 'expertise', label: 'Expertise', maxLength: 60 },
        { name: 'serviceType', label: 'Service type', maxLength: 60 }, { name: 'language', label: 'Language', maxLength: 60 },
      ]} submitLabel="Search" onSubmit={(values) => { const next = new URLSearchParams(); for (const key of ['search', 'company', 'role', 'expertise', 'serviceType', 'language']) { const value = textValue(values, key); if (value) next.set(key, value); } setParams(next); return Promise.resolve(); }} />
    </Paper>
    {consultants.isLoading ? <GuidanceLoading /> : consultants.isError ? <GuidanceError error={consultants.error} retry={consultants.refetch} /> : !consultants.data?.items.length ? <EmptyState title="No consultants found" description="Try a different company, role, expertise, or language." actionLabel="Clear filters" onAction={() => setParams({})} /> : <>
      <Grid container spacing={3}>{consultants.data.items.map((consultant) => {
        const prices = new Map<string, number>();
        consultant.services.filter((service) => service.isActive).forEach((service) => prices.set(service.currency, Math.min(prices.get(service.currency) ?? Infinity, service.price)));
        return <Grid key={consultant.id} size={{ xs: 12, sm: 6, lg: 4 }}><Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}><CardContent sx={{ flex: 1 }}><Stack spacing={1.5}>
          <Stack direction="row" gap={1} flexWrap="wrap"><Chip label="Verified professional" size="small" color="success" /><Chip size="small" label={enumLabel(CareerProfessionalType, consultant.professionalType)} /></Stack>
          <Typography component="h2" variant="h3">{consultant.displayName}</Typography><Typography>{consultant.professionalHeadline}</Typography>
          <Typography color="text.secondary">{consultant.currentRole}{consultant.companyName ? ` · ${consultant.companyName}` : ''}</Typography>
          <Typography variant="body2">{consultant.expertise.join(' · ')}</Typography><Typography variant="body2">Languages: {consultant.languages.join(', ')}</Typography>
          <Typography>{consultant.averageRating === null ? 'No published ratings yet' : `${consultant.averageRating.toFixed(2)} / 5 · ${consultant.reviewCount} reviews`}</Typography>
          {[...prices].map(([currency, price]) => <Typography key={currency} fontWeight={700}>From {money(price, currency)}</Typography>)}
        </Stack></CardContent><CardActions><Button component={Link} to={guidanceRoutes.profile(consultant.id)} variant="outlined">View profile</Button></CardActions></Card></Grid>;
      })}</Grid><GuidancePagination page={page} count={consultants.data.totalPages} onChange={(nextPage) => { const next = new URLSearchParams(params); next.set('page', String(nextPage)); setParams(next); }} />
    </>}
  </GuidancePage>;
};
