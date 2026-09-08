import { Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { buildAIApplyApplicationDetailsPath } from '@/constants/routes';
import type { AIApplyApplication } from '../types/aiApplyModels';
export const AIApplyApplicationCard = ({ application }: { application: AIApplyApplication }) => (
  <Card variant="outlined">
    <CardContent>
      <Stack spacing={1}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
          <Stack spacing={0.25}>
            <Typography fontWeight={700}>{application.jobTitle ?? 'Job application'}</Typography>
            {application.companyName ? (
              <Typography color="text.secondary">{application.companyName}</Typography>
            ) : null}
          </Stack>
          <Chip
            color={application.progressState === 'Submitted' ? 'success' : 'default'}
            label={application.progressState}
            size="small"
          />
        </Stack>
        <Stack alignItems="center" direction="row" spacing={1}>
          <Typography color="text.secondary" variant="body2">
            {application.progressState === 'Submitted' && application.submittedAtUtc
              ? `Submitted ${new Date(application.submittedAtUtc).toLocaleString()}`
              : `Updated ${new Date(application.updatedAtUtc ?? application.scheduledAtUtc).toLocaleString()}`}
          </Typography>
        </Stack>
        <Button
          component={Link}
          to={buildAIApplyApplicationDetailsPath(application.id)}
          sx={{ alignSelf: 'flex-start' }}
        >
          View details
        </Button>
      </Stack>
    </CardContent>
  </Card>
);
