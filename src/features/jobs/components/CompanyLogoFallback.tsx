import { Avatar, Box, type AvatarProps } from '@mui/material';
import { useState, type ReactNode } from 'react';

type LogoStyles = NonNullable<AvatarProps['sx']>;
const isStyleArray = (styles: LogoStyles): styles is Extract<LogoStyles, readonly unknown[]> =>
  Array.isArray(styles);

interface CompanyLogoFallbackProps {
  companyName?: string | null;
  logoUrl?: string | null;
  size?: number;
  variant?: AvatarProps['variant'];
  sx?: AvatarProps['sx'];
  fallback?: ReactNode;
}

const safeLogoUrl = (value?: string | null): string | undefined => {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  // Preserve supplied HTTP(S) and root-relative assets; never resolve by company name.
  if (!trimmed.startsWith('/') && !/^https?:\/\//i.test(trimmed)) return undefined;
  try {
    const url = new URL(trimmed, window.location.origin);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return undefined;
    return trimmed;
  } catch {
    return undefined;
  }
};

export const CompanyLogoFallback = ({
  companyName,
  logoUrl,
  ...props
}: CompanyLogoFallbackProps) => (
  <CompanyLogoImage
    key={JSON.stringify([companyName, logoUrl])}
    companyName={companyName}
    logoUrl={safeLogoUrl(logoUrl)}
    {...props}
  />
);

const CompanyLogoImage = ({
  companyName,
  logoUrl,
  size = 52,
  variant,
  sx = [],
  fallback = 'CP',
}: CompanyLogoFallbackProps) => {
  const [failed, setFailed] = useState(false);
  const name = companyName?.trim().replace(/\s+/g, ' ') || 'Company';
  const initials = companyName
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
  const showImage = Boolean(logoUrl) && !failed;
  const styles = sx ?? [];

  if (showImage) return (
    <Box sx={[
      { height: size, width: size, flexShrink: 0 },
      ...(isStyleArray(styles) ? styles : [styles]),
      // Caller avatar styles belong to initials, not the company's artwork.
      { bgcolor: 'transparent', borderRadius: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', overflow: 'hidden', maxWidth: '100%' },
    ]}>
      <img
        src={logoUrl ?? undefined}
        alt={`${name} logo`}
        loading="lazy"
        decoding="async"
        width={size}
        height={size}
        style={{ width: '100%', height: '100%', maxWidth: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block' }}
        onError={() => setFailed(true)}
      />
    </Box>
  );

  return (
    <Avatar
      variant={variant}
      role="img"
      aria-label={`${name} initials`}
      sx={[
        { bgcolor: 'primary.main', fontWeight: 700, height: size, width: size },
        ...(isStyleArray(styles) ? styles : [styles]),
      ]}
    >
      {initials || fallback}
    </Avatar>
  );
};
