import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Chip, Grid, Paper, Rating, Stack, Typography } from '@mui/material';
import { useGetConsultantQuery } from '../api/profilesApi';
import { useGetPublicCareerReviewsQuery } from '../api/trustApi';
import { GuidanceError, GuidanceLoading, GuidancePage, GuidancePagination, TrustNotice } from '../components/GuidanceUI';
import { CareerProfessionalType } from '../types';
import { enumLabel, money } from '../utils/presentation';
import { guidanceRoutes } from '../utils/routes';
import { isGuid } from '@/features/payments/utils/paymentReturnUrl';

export const ConsultantPublicPage = () => {
  const { consultantId = '' } = useParams();
  const [page, setPage] = useState(1);
  const profile = useGetConsultantQuery(consultantId, { skip: !isGuid(consultantId) });
  const reviews = useGetPublicCareerReviewsQuery({ consultantId, pageNumber: page, pageSize: 10 }, { skip: !isGuid(consultantId) });
  if (profile.isLoading) return <GuidanceLoading />;
  if (!profile.data || profile.isError) return <GuidanceError error={profile.error} retry={() => { if (isGuid(consultantId)) void profile.refetch(); }} />;
  const consultant = profile.data;
  return <GuidancePage title={consultant.displayName} description={consultant.professionalHeadline} actions={<Button component={Link} to={guidanceRoutes.marketplace}>All consultants</Button>}>
    <TrustNotice />
    <Paper sx={{ p: 3 }}><Stack spacing={2}><Stack direction="row" gap={1} flexWrap="wrap"><Chip label="Verified professional" color="success" /><Chip label={enumLabel(CareerProfessionalType, consultant.professionalType)} /></Stack>
      <Typography>{consultant.currentRole} · {consultant.companyName} · {consultant.yearsOfExperience} years of experience</Typography>
      <Typography sx={{ whiteSpace: 'pre-wrap' }}>{consultant.bio}</Typography><Typography>Expertise: {consultant.expertise.join(', ')}</Typography><Typography>Languages: {consultant.languages.join(', ')}</Typography>
      <Typography>{consultant.averageRating === null ? 'No published ratings yet' : `${consultant.averageRating.toFixed(2)} / 5 · ${consultant.reviewCount} published reviews`}</Typography>
    </Stack></Paper>
    <Typography component="h2" variant="h2">Guidance services</Typography>
    {!consultant.services.length && <Typography>No services are available yet.</Typography>}
    <Grid container spacing={2}>{consultant.services.filter((service) => service.isActive).map((service) => <Grid key={service.id} size={{ xs: 12, md: 6 }}><Paper sx={{ p: 3, height: '100%' }}><Stack spacing={2}><Typography component="h3" variant="h3">{service.title}</Typography><Typography sx={{ whiteSpace: 'pre-wrap' }}>{service.description}</Typography><Typography>{service.durationMinutes} minutes · {money(service.price, service.currency)}</Typography><Button component={Link} to={guidanceRoutes.book(consultantId, service.id)} disabled={!consultant.isAcceptingBookings} variant="contained">{consultant.isAcceptingBookings ? 'Book session' : 'Not accepting bookings'}</Button></Stack></Paper></Grid>)}</Grid>
    <Typography component="h2" variant="h2">Published reviews</Typography>
    {reviews.isLoading ? <GuidanceLoading /> : reviews.isError ? <GuidanceError error={reviews.error} retry={reviews.refetch} /> : <Stack spacing={2}>{reviews.data?.items.length ? reviews.data.items.map((review) => <Paper key={review.id} sx={{ p: 2.5 }}><Typography fontWeight={700}>{review.candidateDisplayName}</Typography><Rating readOnly value={review.rating} /><Typography component="h3" variant="h3">{review.title}</Typography><Typography sx={{ whiteSpace: 'pre-wrap' }}>{review.comment}</Typography></Paper>) : <Typography>No published reviews yet.</Typography>}<GuidancePagination page={page} count={reviews.data?.totalPages ?? 0} onChange={setPage} /></Stack>}
  </GuidancePage>;
};
