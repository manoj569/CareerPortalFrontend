import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Button, Card, CardActions, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildDashboardJobDetailsPath } from '@/constants/routes';
import { CompanyLogoFallback } from '@/features/jobs/components/CompanyLogoFallback';
import { formatExperienceRange, formatSalary } from '@/features/jobs/utils/jobFormatting';
import { resolveApiAssetUrl } from './assetUrl';
import type { ActiveJobPromotion } from './types';

export const PromotedJobCard = ({ promotion }: { promotion: ActiveJobPromotion }) => {
  const navigate = useNavigate();
  const [bannerFailed, setBannerFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const banner = bannerFailed ? null : resolveApiAssetUrl(promotion.bannerImageUrl);
  const experience = promotion.minimumExperienceYears === 0 && promotion.maximumExperienceYears === null
    ? 'Entry Level'
    : formatExperienceRange(promotion.minimumExperienceYears, promotion.maximumExperienceYears);
  const salary = (promotion.minimumSalary !== null || promotion.maximumSalary !== null) && promotion.currencyCode
    ? formatSalary(promotion.minimumSalary, promotion.maximumSalary, promotion.currencyCode)
    : null;
  const category = promotion.jobCategory?.trim() || null;
  const workplace = promotion.workplaceType?.trim() || null;
  const employment = promotion.employmentType?.trim() || null;
  const details = [promotion.location, workplace, employment, experience, salary]
    .filter((value): value is string => Boolean(value?.trim()));

  return (
    <Card component="article" className="hiring-card promoted-job-card" variant="outlined" sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {banner ? (
        <Box component="img" src={banner} alt={`${promotion.companyName} and ${promotion.title}`} loading="lazy" onError={() => setBannerFailed(true)} sx={{ width: '100%', height: 132, objectFit: 'cover', bgcolor: 'grey.100' }} />
      ) : promotion.companyLogoUrl && !logoFailed ? (
        <Box sx={{ height: 132, display: 'grid', placeItems: 'center', bgcolor: 'grey.50', p: 2 }}>
          <Box component="img" src={promotion.companyLogoUrl} alt={`${promotion.companyName} logo`} onError={() => setLogoFailed(true)} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </Box>
      ) : (
        <Box sx={{ height: 132, display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Typography variant="h6" fontWeight={800}>CareerHarbor</Typography>
        </Box>
      )}
      <CardContent sx={{ flex: 1, width: '100%', boxSizing: 'border-box' }}>
        <Stack spacing={1.25}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CompanyLogoFallback companyName={promotion.companyName} logoUrl={promotion.companyLogoUrl} size={38} />
            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ flex: 1 }}>{promotion.companyName}</Typography>
            {category && <Chip size="small" color="primary" variant="outlined" label={category} />}
          </Stack>
          <Typography component="h3" variant="h6" fontWeight={750} sx={{ overflowWrap: 'anywhere' }}>{promotion.title}</Typography>
          {details.length > 0 && <Typography color="text.secondary" variant="body2" sx={{ minHeight: 40, overflowWrap: 'anywhere' }}>{details.join(' · ')}</Typography>}
          {promotion.educationRequirement && <Typography color="text.secondary" variant="body2" sx={{ overflowWrap: 'anywhere' }}>{promotion.educationRequirement}</Typography>}
          {promotion.skills?.length > 0 && <Stack direction="row" flexWrap="wrap" gap={0.5}>{promotion.skills.slice(0, 3).map((skill) => <Chip key={skill} size="small" label={skill} />)}{promotion.skills.length > 3 && <Chip size="small" variant="outlined" label={`+${promotion.skills.length - 3}`} />}</Stack>}
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button fullWidth variant="contained" endIcon={<ArrowForwardIcon />} onClick={() => void navigate(buildDashboardJobDetailsPath(promotion.jobSlug))}>View Details</Button>
      </CardActions>
    </Card>
  );
};
