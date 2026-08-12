import { Button, Skeleton, Stack, Typography } from '@mui/material';
import { Link, useParams } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useGetPublicPortfolioQuery } from '@/features/portfolio/api/portfolioApi';
import { PortfolioRenderer } from '@/features/portfolio/components/PortfolioRenderer';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const PublicPortfolioPage = () => {
  const { slug = '' } = useParams();
  const portfolio = useGetPublicPortfolioQuery(slug, { skip: !slug.trim() });
  const unavailable = !slug.trim() || portfolio.isError;
  const title = portfolio.data ? `${portfolio.data.candidate.displayName} Portfolio | Career Harbor` : 'Portfolio unavailable | Career Harbor';
  const description = portfolio.data?.candidate.resumeHeadline ?? portfolio.data?.candidate.profileSummary?.slice(0, 155) ?? 'View a professional Career Harbor candidate portfolio.';
  useDocumentMetadata(title, description, { canonicalPath: portfolio.data ? `/p/${encodeURIComponent(portfolio.data.slug)}` : null, noIndex: unavailable });

  if (portfolio.isLoading) return <Stack aria-label="Loading portfolio" role="status" spacing={2} sx={{ maxWidth: 1040, mx: 'auto', p: 4 }}><Skeleton height={120} variant="rounded" /><Skeleton height={420} variant="rounded" /></Stack>;
  if (unavailable || !portfolio.data) return <Stack alignItems="center" component="main" spacing={2} sx={{ maxWidth: 620, mx: 'auto', px: 3, py: 12, textAlign: 'center' }}><Typography component="h1" variant="h2">Portfolio unavailable</Typography><Typography color="text.secondary">This portfolio may be unpublished, or the link may be incorrect.</Typography><Button component={Link} to={ROUTES.HOME} variant="contained">Go to Career Harbor home</Button></Stack>;
  return <PortfolioRenderer portfolio={portfolio.data} />;
};
