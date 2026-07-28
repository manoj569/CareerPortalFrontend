import { Avatar } from '@mui/material';

interface CompanyLogoFallbackProps {
  companyName: string;
  logoUrl: string | null;
  size?: number;
}

export const CompanyLogoFallback = ({
  companyName,
  logoUrl,
  size = 52,
}: CompanyLogoFallbackProps) => {
  const initials = companyName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <Avatar
      alt={`${companyName} logo`}
      imgProps={{ loading: 'lazy' }}
      src={logoUrl || undefined}
      sx={{ bgcolor: 'primary.main', fontWeight: 700, height: size, width: size }}
    >
      {initials || 'CP'}
    </Avatar>
  );
};
