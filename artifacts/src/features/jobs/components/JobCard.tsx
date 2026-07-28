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
  getEmploymentTypeLabel,
  getExperienceLevelLabel,
  getWorkplaceTypeLabel,
} from '../constants/jobOptions';
import type { PublicJobSummary } from '../types/jobModels';
import { formatJobDate, formatSalary } from '../utils/jobFormatting';
import { CompanyLogoFallback } from './CompanyLogoFallback';

interface JobCardProps {
  job: PublicJobSummary;
  returnSearch?: string;
  secondaryAction?: ReactNode;
}

export const JobCard = ({ job, returnSearch = '', secondaryAction }: JobCardProps) => {
  const publishedDate = formatJobDate(job.publishedAtUtc);
  const expiryDate = formatJobDate(job.expiresAtUtc);

  return (
    <Card component="article" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardContent sx={{ flex: 1, p: 3 }}>
        <Stack spacing={2.25}>
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
                {getExperienceLevelLabel(job.experienceLevel)}
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
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
        <Button
          aria-label={`View details for ${job.title} at ${job.companyName}`}
          component={Link}
          state={{ jobsSearch: returnSearch }}
          to={buildJobDetailsPath(job.slug)}
          variant="outlined"
        >
          View details
        </Button>
        {secondaryAction}
      </CardActions>
    </Card>
  );
};
