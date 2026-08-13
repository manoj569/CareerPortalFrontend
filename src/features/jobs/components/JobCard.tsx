import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { buildJobDetailsPath } from '@/constants/routes';
import {
  getCompanyTypeLabel,
  getEmploymentTypeLabel,
  getExperienceLevelLabel,
  getWorkplaceTypeLabel,
} from '../constants/jobOptions';
import type { PublicJobSummary } from '../types/jobModels';
import { formatExperienceRange, formatJobDate, formatSalary } from '../utils/jobFormatting';
import { CompanyLogoFallback } from './CompanyLogoFallback';

interface JobCardProps {
  additionalAction?: ReactNode;
  compact?: boolean;
  job: PublicJobSummary;
  returnPath?: string;
  returnSearch?: string;
  secondaryAction?: ReactNode;
  showExtendedDetails?: boolean;
  viewActionLabel?: string;
}

export const JobCard = ({
  additionalAction,
  compact = false,
  job,
  returnPath,
  returnSearch = '',
  secondaryAction,
  showExtendedDetails = false,
  viewActionLabel = 'View details',
}: JobCardProps) => {
  const publishedDate = formatJobDate(job.publishedAtUtc);
  const expiryDate = formatJobDate(job.expiresAtUtc);
  const experienceRange = formatExperienceRange(
    job.minimumExperienceYears,
    job.maximumExperienceYears,
  );

  return (
    <Card component="article" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardContent sx={{ flex: 1, p: compact ? { xs: 2, sm: 2.25 } : 3 }}>
        <Stack spacing={compact ? 1.5 : 2.25}>
          <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={2}>
            <CompanyLogoFallback companyName={job.companyName} logoUrl={job.companyLogoUrl} />
            {job.isFeatured ? <Chip color="primary" label="Featured" size="small" /> : null}
          </Stack>
          <Box>
            <Typography component="h2" sx={{ overflowWrap: 'anywhere' }} variant="h3">
              {job.title}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {job.companyName}
              {showExtendedDetails && job.companyType
                ? ` · ${getCompanyTypeLabel(job.companyType)}`
                : ''}
            </Typography>
          </Box>
          <Stack color="text.secondary" spacing={1}>
            {job.location ? (
              <Stack alignItems="center" direction="row" spacing={1}>
                <LocationOnOutlinedIcon fontSize="small" />
                <Typography variant="body2">{job.location}</Typography>
              </Stack>
            ) : null}
            <Stack alignItems="center" direction="row" spacing={1}>
              <WorkOutlineIcon fontSize="small" />
              <Typography variant="body2">
                {getEmploymentTypeLabel(job.employmentType)} ·{' '}
                {getWorkplaceTypeLabel(job.workplaceType)} ·{' '}
                {showExtendedDetails && experienceRange
                  ? experienceRange
                  : getExperienceLevelLabel(job.experienceLevel)}
              </Typography>
            </Stack>
            <Stack alignItems="center" direction="row" spacing={1}>
              <PaymentsOutlinedIcon fontSize="small" />
              <Typography variant="body2">
                {formatSalary(job.minimumSalary, job.maximumSalary, job.currencyCode)}
              </Typography>
            </Stack>
            {publishedDate ? (
              <Stack alignItems="center" direction="row" spacing={1}>
                <AccessTimeOutlinedIcon fontSize="small" />
                <Typography variant="body2">
                  Posted {publishedDate}
                  {expiryDate ? ` · Closes ${expiryDate}` : ''}
                </Typography>
              </Stack>
            ) : null}
          </Stack>
          <Chip label={job.categoryName} size="small" sx={{ alignSelf: 'flex-start' }} />
          {showExtendedDetails ? (
            <Stack direction="row" flexWrap="wrap" gap={0.75}>
              {job.department ? (
                <Chip label={job.department} size="small" variant="outlined" />
              ) : null}
              {job.roleCategory ? (
                <Chip label={job.roleCategory} size="small" variant="outlined" />
              ) : null}
              {job.industry ? <Chip label={job.industry} size="small" variant="outlined" /> : null}
              {job.internshipDurationMonths ? (
                <Chip
                  label={`${job.internshipDurationMonths} month internship${job.isFlexibleDuration ? ' · flexible' : ''}`}
                  size="small"
                  variant="outlined"
                />
              ) : job.isFlexibleDuration ? (
                <Chip label="Flexible internship duration" size="small" variant="outlined" />
              ) : null}
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
      <CardActions
        sx={{
          flexWrap: 'wrap',
          px: compact ? { xs: 2, sm: 2.25 } : 3,
          pb: compact ? { xs: 2, sm: 2.25 } : 3,
          pt: 0,
        }}
      >
        <Button
          aria-label={`${viewActionLabel} for ${job.title} at ${job.companyName}`}
          component={Link}
          state={{ jobsPath: returnPath, jobsSearch: returnSearch }}
          to={buildJobDetailsPath(job.slug)}
          variant="outlined"
        >
          {viewActionLabel}
        </Button>
        {secondaryAction}
        {additionalAction}
      </CardActions>
    </Card>
  );
};
