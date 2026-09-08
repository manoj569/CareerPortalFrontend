import { Chip } from '@mui/material';
import { AdminAIApplySiteHealth } from '../types/adminAIApplyModels';
import type { AdminAIApplyRunStatus } from '../types/adminAIApplyModels';
import { runStatusColor, runStatusLabel, siteHealthLabel } from '../utils/adminAIApplyStatus';

export const AdminAIApplyStatusChip = ({ status }: { status: AdminAIApplyRunStatus }) => (
  <Chip
    color={runStatusColor(status)}
    label={runStatusLabel(status)}
    size="small"
    variant="outlined"
  />
);

export const AdminAIApplySiteHealthChip = ({ health }: { health: AdminAIApplySiteHealth }) => (
  <Chip
    color={
      health === AdminAIApplySiteHealth.Healthy
        ? 'success'
        : health === AdminAIApplySiteHealth.Failing
          ? 'error'
          : health === AdminAIApplySiteHealth.Degraded
            ? 'warning'
            : 'default'
    }
    label={siteHealthLabel(health)}
    size="small"
    variant="outlined"
  />
);
