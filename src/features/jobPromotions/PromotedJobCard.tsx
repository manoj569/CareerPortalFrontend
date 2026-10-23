import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Button, Card, CardActions, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildDashboardJobDetailsPath } from '@/constants/routes';
import { CompanyLogoFallback } from '@/features/jobs/components/CompanyLogoFallback';
import { employmentTypeOptions, getEmploymentTypeLabel, getWorkplaceTypeLabel, workplaceTypeOptions } from '@/features/jobs/constants/jobOptions';
import { EmploymentType, WorkplaceType } from '@/features/jobs/types/jobModels';
import { formatExperienceRange, formatSalary } from '@/features/jobs/utils/jobFormatting';
import { resolveApiAssetUrl } from './assetUrl';
import type { ActiveJobPromotion } from './types';
import type { EmploymentType as EmploymentTypeValue, WorkplaceType as WorkplaceTypeValue } from '@/features/jobs/types/jobModels';

const safeText = (value: unknown): string | null => typeof value === 'string' ? value.trim() || null : null;
const enumLabel = <T extends number>(value: unknown, options: readonly { value: T; label: string }[], enumNames: Record<string, string | number>, labeler: (value: T) => string): string | null => {
  if (typeof value === 'number' && Number.isInteger(value) && options.some((option) => option.value === value)) return labeler(value as T);
  const text = safeText(value);
  if (!text) return null;
  const normalized = text.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ').toLowerCase().replace(/[\s-]/g, '');
  const match = options.find((option) => option.label.toLowerCase().replace(/[\s-]/g, '') === normalized)
    ?? options.find((option) => String(enumNames[option.value]).toLowerCase().replace(/[\s_-]/g, '') === normalized);
  return match ? labeler(match.value) : text;
};

export const PromotedJobCard = ({ promotion }: { promotion: ActiveJobPromotion }) => {
  const navigate = useNavigate();
  const [bannerFailed, setBannerFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const banner = bannerFailed ? null : resolveApiAssetUrl(safeText(promotion.bannerImageUrl));
  const minExperience = typeof promotion.minimumExperienceYears === 'number' && Number.isFinite(promotion.minimumExperienceYears) ? promotion.minimumExperienceYears : null;
  const maxExperience = typeof promotion.maximumExperienceYears === 'number' && Number.isFinite(promotion.maximumExperienceYears) ? promotion.maximumExperienceYears : null;
  const experience = minExperience === 0 && maxExperience === null
    ? 'Entry Level'
    : formatExperienceRange(minExperience, maxExperience);
  const minimumSalary = typeof promotion.minimumSalary === 'number' && Number.isFinite(promotion.minimumSalary) ? promotion.minimumSalary : null;
  const maximumSalary = typeof promotion.maximumSalary === 'number' && Number.isFinite(promotion.maximumSalary) ? promotion.maximumSalary : null;
  const currencyCode = safeText(promotion.currencyCode);
  const salary = (minimumSalary !== null || maximumSalary !== null) && currencyCode
    ? formatSalary(minimumSalary, maximumSalary, currencyCode)
    : null;
  const category = safeText(promotion.jobCategory);
  const workplace = enumLabel<WorkplaceTypeValue>(promotion.workplaceType, workplaceTypeOptions, WorkplaceType, getWorkplaceTypeLabel);
  const employment = enumLabel<EmploymentTypeValue>(promotion.employmentType, employmentTypeOptions, EmploymentType, getEmploymentTypeLabel);
  const location = safeText(promotion.location);
  const companyName = safeText(promotion.companyName) ?? 'Company';
  const title = safeText(promotion.title) ?? 'Job opportunity';
  const details = [location, workplace, employment, experience, salary].filter((value): value is string => Boolean(value));
  const education = safeText(promotion.educationRequirement);
  const skills = Array.isArray(promotion.skills) ? promotion.skills.filter((skill): skill is string => typeof skill === 'string' && Boolean(skill.trim())) : [];
  const logoUrl = safeText(promotion.companyLogoUrl);

  return (
    <Card component="article" className="hiring-card promoted-job-card" variant="outlined" sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {banner ? (
        <Box component="img" src={banner} alt={`${companyName} and ${title}`} loading="lazy" onError={() => setBannerFailed(true)} sx={{ width: '100%', height: 132, objectFit: 'cover', bgcolor: 'grey.100' }} />
      ) : logoUrl && !logoFailed ? (
        <Box sx={{ height: 132, display: 'grid', placeItems: 'center', bgcolor: 'grey.50', p: 2 }}>
          <Box component="img" src={logoUrl} alt={`${companyName} logo`} onError={() => setLogoFailed(true)} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </Box>
      ) : (
        <Box sx={{ height: 132, display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Typography variant="h6" fontWeight={800}>CareerHarbor</Typography>
        </Box>
      )}
      <CardContent sx={{ flex: 1, width: '100%', boxSizing: 'border-box' }}>
        <Stack spacing={1.25}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CompanyLogoFallback companyName={companyName} logoUrl={logoUrl} size={38} />
            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ flex: 1 }}>{companyName}</Typography>
            {category && <Chip size="small" color="primary" variant="outlined" label={category} />}
          </Stack>
          <Typography component="h3" variant="h6" fontWeight={750} sx={{ overflowWrap: 'anywhere' }}>{title}</Typography>
          {details.length > 0 && <Typography color="text.secondary" variant="body2" sx={{ minHeight: 40, overflowWrap: 'anywhere' }}>{details.join(' · ')}</Typography>}
          {education && <Typography color="text.secondary" variant="body2" sx={{ overflowWrap: 'anywhere' }}>{education}</Typography>}
          {skills.length > 0 && <Stack direction="row" flexWrap="wrap" gap={0.5}>{skills.slice(0, 3).map((skill) => <Chip key={skill} size="small" label={skill} />)}{skills.length > 3 && <Chip size="small" variant="outlined" label={`+${skills.length - 3}`} />}</Stack>}
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button fullWidth variant="contained" endIcon={<ArrowForwardIcon />} onClick={() => void navigate(buildDashboardJobDetailsPath(promotion.jobSlug))}>View Details</Button>
      </CardActions>
    </Card>
  );
};
