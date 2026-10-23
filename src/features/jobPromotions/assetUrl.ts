import { environment } from '@/config/environment';

export const resolveApiAssetUrl = (value: string | null | undefined): string | null => {
  if (!value?.trim()) return null;
  try {
    const trimmed = value.trim();
    const url = trimmed.startsWith('/')
      ? new URL(trimmed, new URL(environment.apiBaseUrl).origin)
      : new URL(trimmed, `${environment.apiBaseUrl}/`);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
};
