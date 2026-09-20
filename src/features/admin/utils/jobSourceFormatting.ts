import { formatAdminDate } from './adminFormatting';
import type { JobSource, SaveJobSourceRequest } from '../types/jobSourceModels';

export const hasSourceError = (source: JobSource) =>
  Boolean(source.lastError) || source.consecutiveFailures > 0;
export const formatScanInterval = (minutes: number) =>
  minutes % 60 === 0
    ? `Every ${minutes / 60} ${minutes === 60 ? 'hour' : 'hours'}`
    : `Every ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;

export const formatSourceDate = (value: string | null) => {
  if (!value) return 'Never';
  // DateTime values without a serialized kind still represent UTC in this API.
  return formatAdminDate(/(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? value : `${value}Z`);
};

export const sourceRequest = (source: JobSource): SaveJobSourceRequest => ({
  companyId: source.companyId,
  careerPageUrl: source.careerPageUrl,
  atsType: source.atsType,
  atsIdentifier: source.atsIdentifier,
  isActive: source.isActive,
  scanIntervalMinutes: source.scanIntervalMinutes,
});
