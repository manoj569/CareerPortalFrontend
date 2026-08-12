export const getSafePortfolioUrl = (value: string | null | undefined): string | null => {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
};

export const publicPortfolioUrl = (slug: string): string =>
  `https://careerharbor.in/p/${encodeURIComponent(slug)}`;
