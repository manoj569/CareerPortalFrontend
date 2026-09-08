import { Chip } from '@mui/material';
import type { AIApplyRunStatus } from '../types/aiApplyModels';
import { getAIApplyStatus } from '../utils/aiApplyStatus';
export const AIApplyStatusChip = ({ status }: { status: AIApplyRunStatus }) => {
  const display = getAIApplyStatus(status);
  return <Chip color={display.tone} label={display.label} size="small" />;
};
