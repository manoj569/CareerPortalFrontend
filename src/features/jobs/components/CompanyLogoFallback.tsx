import { Avatar, type AvatarProps } from '@mui/material';
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

export const CompanyLogoFallback = ({
  companyName,
  logoUrl,
  ...props
}: CompanyLogoFallbackProps) => (
  <CompanyLogoImage
    key={JSON.stringify([companyName, logoUrl])}
    companyName={companyName}
    logoUrl={logoUrl?.trim() || undefined}
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

  return (
    <Avatar
      variant={variant}
      role={showImage ? undefined : 'img'}
      aria-label={showImage ? undefined : `${name} initials`}
      sx={[
        { bgcolor: 'primary.main', fontWeight: 700, height: size, width: size },
        ...(isStyleArray(styles) ? styles : [styles]),
      ]}
    >
      {/* Avatar's src preloads eagerly. A native image keeps loading truly lazy. */}
      {showImage ? (
        <img
          src={logoUrl ?? undefined}
          alt={`${name} logo`}
          loading="lazy"
          decoding="async"
          width={size}
          height={size}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={() => setFailed(true)}
        />
      ) : (
        initials || fallback
      )}
    </Avatar>
  );
};
