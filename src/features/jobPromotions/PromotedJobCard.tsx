import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { buildDashboardJobDetailsPath } from '@/constants/routes';
import { CompanyLogoFallback } from '@/features/jobs/components/CompanyLogoFallback';
import { employmentTypeOptions, getEmploymentTypeLabel, getWorkplaceTypeLabel, workplaceTypeOptions } from '@/features/jobs/constants/jobOptions';
import { EmploymentType, WorkplaceType } from '@/features/jobs/types/jobModels';
import { formatExperienceRange, formatSalary } from '@/features/jobs/utils/jobFormatting';
import type { EmploymentType as EmploymentTypeValue, WorkplaceType as WorkplaceTypeValue } from '@/features/jobs/types/jobModels';

import { resolveApiAssetUrl } from './assetUrl';
import type { ActiveJobPromotion } from './types';

const safeText = (value: unknown): string | null => typeof value === 'string' ? value.trim() || null : null;
const PromotedJobVisual = ({
  bannerUrl,
  companyName,
  logoUrl,
  title,
}: {
  bannerUrl: string | null;
  companyName: string;
  logoUrl: string | null;
  title: string;
}) => {
  const [bannerFailed, setBannerFailed] = useState(false);
  const showBanner = Boolean(bannerUrl) && !bannerFailed;

  return (
    <Box className="promoted-job-visual" aria-label={showBanner ? 'Promotional job banner' : `${companyName} branding`}>
      {showBanner ? (
        <Box component="img" className="promoted-job-banner" src={bannerUrl!} alt={`${companyName} promotional banner for ${title}`} loading="lazy" onError={() => setBannerFailed(true)} />
      ) : (
        <CompanyLogoFallback companyName={companyName} logoUrl={logoUrl} size={104} sx={{ zIndex: 1 }} />
      )}
    </Box>
  );
};

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
  const banner = resolveApiAssetUrl(safeText(promotion.bannerImageUrl));
  const companyName = safeText(promotion.companyName) ?? 'Company';
  const title = safeText(promotion.title) ?? 'Job opportunity';
  const logoUrl = safeText(promotion.companyLogoUrl);
  const category = safeText(promotion.jobCategory);
  const location = safeText(promotion.location);
  const workplace = enumLabel<WorkplaceTypeValue>(promotion.workplaceType, workplaceTypeOptions, WorkplaceType, getWorkplaceTypeLabel);
  const employment = enumLabel<EmploymentTypeValue>(promotion.employmentType, employmentTypeOptions, EmploymentType, getEmploymentTypeLabel);
  const minExperience = typeof promotion.minimumExperienceYears === 'number' && Number.isFinite(promotion.minimumExperienceYears) ? promotion.minimumExperienceYears : null;
  const maxExperience = typeof promotion.maximumExperienceYears === 'number' && Number.isFinite(promotion.maximumExperienceYears) ? promotion.maximumExperienceYears : null;
  const experience = minExperience === 0 && maxExperience === null ? 'Entry Level' : formatExperienceRange(minExperience, maxExperience);
  const minSalary = typeof promotion.minimumSalary === 'number' && Number.isFinite(promotion.minimumSalary) ? promotion.minimumSalary : null;
  const maxSalary = typeof promotion.maximumSalary === 'number' && Number.isFinite(promotion.maximumSalary) ? promotion.maximumSalary : null;
  const currencyCode = safeText(promotion.currencyCode);
  const salary = (minSalary !== null || maxSalary !== null) && currencyCode ? formatSalary(minSalary, maxSalary, currencyCode) : null;
  const education = safeText(promotion.educationRequirement);
  const skills = Array.isArray(promotion.skills) ? promotion.skills.filter((skill): skill is string => typeof skill === 'string' && Boolean(skill.trim())) : [];
  const details = [location, workplace, employment, experience, salary].filter((value): value is string => Boolean(value));

  return (
    <Card component="article" className="hiring-card promoted-job-card" variant="outlined" sx={{ p: 0, gap: 0, height: '100%', minHeight: 280, overflow: 'hidden', containerType: 'inline-size' }}>
      <Box className="promoted-job-layout">
        <CardContent className="promoted-job-content" sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Chip className="promoted-disclosure" icon={<BoltRoundedIcon />} label="Promoted" size="small" />
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            <CompanyLogoFallback companyName={companyName} logoUrl={logoUrl} size={38} />
            <Typography variant="body2" fontWeight={700} sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>{companyName}</Typography>
          </Stack>
          <Box>
            <Typography component="h3" variant="h6" fontWeight={750} sx={{ overflowWrap: 'anywhere', lineHeight: 1.25 }}>{title}</Typography>
            {category && <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mt: 0.25, overflowWrap: 'anywhere' }}>{category}</Typography>}
          </Box>
          {details.length > 0 && <Typography color="text.secondary" variant="body2" sx={{ overflowWrap: 'anywhere' }}>{details.join(' · ')}</Typography>}
          {education && <Typography color="text.secondary" variant="body2" sx={{ overflowWrap: 'anywhere' }}>{education}</Typography>}
          {skills.length > 0 && <Stack direction="row" flexWrap="wrap" gap={0.5}>{skills.slice(0, 3).map((skill) => <Chip key={skill} size="small" variant="outlined" label={skill} />)}{skills.length > 3 && <Chip size="small" variant="outlined" label={`+${skills.length - 3}`} />}</Stack>}
          <Button variant="contained" endIcon={<ArrowForwardRoundedIcon />} onClick={() => void navigate(buildDashboardJobDetailsPath(promotion.jobSlug))} sx={{ mt: 'auto', alignSelf: 'flex-start', minWidth: { xs: '100%', sm: 190 }, bgcolor: 'primary.main' }}>
            View Opportunity
          </Button>
        </CardContent>
        <PromotedJobVisual key={`${promotion.jobId}:${banner ?? ''}`} bannerUrl={banner} companyName={companyName} logoUrl={logoUrl} title={title} />
      </Box>
    </Card>
  );
};
