import { getSafeExternalUrl } from '@/utils/safeExternalUrl';
import type { HiringDriveInput } from './types';
const limits = {
  title: 200,
  subtitle: 300,
  description: 10000,
  badgeText: 60,
  imageUrl: 2048,
  locationText: 200,
  experienceText: 100,
  applyUrl: 2048,
} as const;
export const validateHiringDrive = (value: HiringDriveInput): string | null => {
  if (!value.title.trim()) return 'Title is required.';
  if (value.title.length > limits.title) return 'Title must be 200 characters or fewer.';
  for (const [field, max] of Object.entries(limits)) {
    const text = value[field as keyof typeof limits];
    if (typeof text === 'string' && text.length > max)
      return `${field} must be ${max} characters or fewer.`;
  }
  if (
    value.badgeType &&
    !(['hiring', 'walkIn', 'openings', 'featured'] as const).includes(value.badgeType)
  )
    return 'Select a valid badge type.';
  if (value.applyUrl && !httpsUrl(value.applyUrl)) return 'Apply URL must be a valid HTTPS URL.';
  if (value.imageUrl && !httpsUrl(value.imageUrl)) return 'Image URL must be a valid HTTPS URL.';
  if (!value.jobId && !value.applyUrl) return 'Select a CareerHarbor job or provide an apply URL.';
  if (!Number.isInteger(value.displayOrder) || (value.displayOrder ?? 0) < 0)
    return 'Display order must be a non-negative integer.';
  const start = Date.parse(value.startAtUtc);
  if (!Number.isFinite(start)) return 'Enter a valid start date.';
  if (value.endAtUtc) {
    const end = Date.parse(value.endAtUtc);
    if (!Number.isFinite(end) || end <= start) return 'End date must be after start date.';
  }
  return null;
};
const httpsUrl = (value: string) => getSafeExternalUrl(value)?.startsWith('https://') ?? false;
