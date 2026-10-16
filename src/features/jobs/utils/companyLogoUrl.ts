export const safeCompanyLogoUrl = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed || (!trimmed.startsWith('/') && !/^https?:\/\//i.test(trimmed))) return undefined;
  try {
    const url = new URL(trimmed, window.location.origin);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password)
      return undefined;
    return trimmed;
  } catch {
    return undefined;
  }
};
