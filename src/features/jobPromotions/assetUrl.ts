import { environment } from '@/config/environment';

export const resolveApiAssetUrl = (
  value: string | null | undefined,
  apiBaseUrl = environment.apiBaseUrl,
): string | null => {
  if (!value?.trim()) return null;
  try {
    const trimmed = value.trim();
    const apiBase = new URL(apiBaseUrl);
    const isAbsoluteHttpUrl = /^https?:\/\//i.test(trimmed);
    const normalizedRelativePath = trimmed.replace(/^api\//i, 'api/');
    const url = isAbsoluteHttpUrl
      ? new URL(trimmed)
      : trimmed.startsWith('//')
        ? null
        : trimmed.startsWith('/')
          ? new URL(trimmed, apiBase.origin)
          : normalizedRelativePath.startsWith('api/')
            ? new URL(`/${normalizedRelativePath}`, apiBase.origin)
            : new URL(trimmed, `${apiBaseUrl}/`);
    if (!url) return null;
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    return isAbsoluteHttpUrl ? trimmed : url.toString();
  } catch {
    return null;
  }
};
