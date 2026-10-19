import { formatAdminDate } from './adminFormatting';
import type { JobSource, SaveJobSourceRequest } from '../types/jobSourceModels';
import { AtsType } from '../types/jobSourceModels';

export const EMPLOYER_DIRECT_ATS_IDENTIFIER = 'employer-direct';
export const isEmployerDirectSource = (source: Pick<JobSource, 'atsType' | 'atsIdentifier'>) =>
  source.atsType === AtsType.Custom && source.atsIdentifier === EMPLOYER_DIRECT_ATS_IDENTIFIER;
export const atsTypeLabel = (type: AtsType, identifier?: string | null) =>
  type === AtsType.Custom && identifier === EMPLOYER_DIRECT_ATS_IDENTIFIER
    ? 'Any Career Website'
    : type === AtsType.Custom
      ? 'Custom'
      : AtsType[type];

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
  autoPublishEnabled: source.autoPublishEnabled ?? false,
  scanIntervalMinutes: source.scanIntervalMinutes,
});
