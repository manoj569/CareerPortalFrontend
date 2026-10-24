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
const PromotedJobVisual = ({ bannerUrl }: { bannerUrl: string | null }) => {
  const [bannerFailed, setBannerFailed] = useState(false);
  const showBanner = Boolean(bannerUrl) && !bannerFailed;

  if (!showBanner) return null;
  return <Box component="img" className="promoted-job-banner premium-promotion-background" src={bannerUrl!} alt="" aria-hidden="true" loading="lazy" onError={() => setBannerFailed(true)} />;
};

const getFallbackTheme = (jobId: string): 'purple' | 'blue' | 'teal' | 'neutral' => {
  let hash = 0;
  for (const character of jobId) hash = (hash * 31 + character.charCodeAt(0)) | 0;
  return (['purple', 'blue', 'teal', 'neutral'] as const)[Math.abs(hash) % 4] ?? 'purple';
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
  const skills = Array.isArray(promotion.skills) ? promotion.skills.filter((skill): skill is string => typeof skill === 'string').map((skill) => skill.trim()).filter(Boolean) : [];
  const details = [location, workplace, employment, experience, salary].filter((value): value is string => Boolean(value));
  const isFresher = /\bfreshers?\b/i.test(category ?? '') || /\bfreshers?\b/i.test(title);
  const isInternship = /internship/i.test(employment ?? '');
  const displayedDetails = details.filter((detail) => !(isInternship && detail === employment));
  const fallbackTheme = getFallbackTheme(promotion.jobId);

  return (
    <Card component="article" aria-label={`${companyName}: ${title}`} className="hiring-card promoted-job-card premium-promotion-card" data-theme={fallbackTheme} variant="outlined" sx={{ p: 0, gap: 0 }}>
      <PromotedJobVisual key={`${promotion.jobId}:${banner ?? ''}`} bannerUrl={banner} />
      <Box className="promoted-job-layout premium-promotion-content">
        <CardContent className="promoted-job-content" sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Chip className="promoted-disclosure" icon={<BoltRoundedIcon />} label="Promoted" size="small" />
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            <CompanyLogoFallback companyName={companyName} logoUrl={logoUrl} size={38} />
            <Typography className="promoted-company-name" variant="body2" fontWeight={700} sx={{ minWidth: 0 }}>{companyName}</Typography>
          </Stack>
          <Box>
            <Typography className="promoted-job-title" component="h3" variant="h6" fontWeight={750} sx={{ lineHeight: 1.25 }}>{title}</Typography>
            {category && !/^fresher|internship$/i.test(category.trim()) && <Typography className="promoted-job-details" variant="body2" fontWeight={600} color="text.secondary" sx={{ mt: 0.25 }}>{category}</Typography>}
          </Box>
          {(isFresher || isInternship) && <Stack className="promoted-job-badges" direction="row" flexWrap="wrap" gap={0.75}>{isFresher && <Chip size="small" label="Fresher" />}{isInternship && <Chip size="small" label="Internship" />}</Stack>}
          {displayedDetails.length > 0 && <Typography className="promoted-job-details" color="text.secondary" variant="body2">{displayedDetails.join(' · ')}</Typography>}
          {education && <Typography className="promoted-job-details" color="text.secondary" variant="body2">{education}</Typography>}
          {skills.length > 0 && <Stack className="promoted-job-skills" direction="row" flexWrap="wrap" gap={0.5}>{skills.slice(0, 3).map((skill) => <Chip key={skill} size="small" variant="outlined" label={skill} />)}{skills.length > 3 && <Chip size="small" variant="outlined" label={`+${skills.length - 3}`} />}</Stack>}
          <Button className="promoted-job-cta" variant="contained" endIcon={<ArrowForwardRoundedIcon />} onClick={() => void navigate(buildDashboardJobDetailsPath(promotion.jobSlug))} sx={{ mt: 'auto', alignSelf: 'flex-start', width: { xs: '100%', sm: 'auto' }, minWidth: { xs: '100%', sm: 190 }, whiteSpace: 'nowrap', bgcolor: 'primary.main' }}>
            View Opportunity
          </Button>
        </CardContent>
      </Box>
    </Card>
  );
};
