import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { buildAIApplyApplicationDetailsPath } from '@/constants/routes';
import type { AIApplyApplication } from '../types/aiApplyModels';
import { AIApplyStatusChip } from './AIApplyStatusChip';
export const AIApplyApplicationCard = ({ application }: { application: AIApplyApplication }) => (
  <Card variant="outlined">
    <CardContent>
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between">
          <Typography fontWeight={700}>Application {application.jobId.slice(0, 8)}</Typography>
          <AIApplyStatusChip status={application.status} />
        </Stack>
        <Typography color="text.secondary">
          Queued {new Date(application.scheduledAtUtc).toLocaleString()}
        </Typography>
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
