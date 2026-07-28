import dayjs from 'dayjs';

import type { PublicJobDetails } from '../types/jobModels';

export const formatJobDate = (value: string | null): string | null => {
  if (!value) return null;
  const date = dayjs(value);
  return date.isValid() ? date.format('D MMM YYYY') : null;
};

export const formatSalary = (
  minimumSalary: number | null,
  maximumSalary: number | null,
  currencyCode: string,
): string => {
  if (minimumSalary === null && maximumSalary === null) return 'Salary not disclosed';

  const formatValue = (value: number): string => {
    try {
      return new Intl.NumberFormat(undefined, {
        currency: currencyCode || 'USD',
        maximumFractionDigits: 0,
        notation: value >= 100_000 ? 'compact' : 'standard',
        style: 'currency',
      }).format(value);
    } catch {
      return `${currencyCode} ${value.toLocaleString()}`.trim();
    }
  };

  if (minimumSalary !== null && maximumSalary !== null) {
    return `${formatValue(minimumSalary)} – ${formatValue(maximumSalary)}`;
  }
  if (minimumSalary !== null) return `From ${formatValue(minimumSalary)}`;
  return `Up to ${formatValue(maximumSalary as number)}`;
};

export const isJobExpired = (job: Pick<PublicJobDetails, 'expiresAtUtc'>): boolean =>
  Boolean(job.expiresAtUtc && dayjs(job.expiresAtUtc).isBefore(dayjs()));
