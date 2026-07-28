import { Stack, Typography } from '@mui/material';

interface AuthPageHeaderProps {
  title: string;
  description: string;
}

export const AuthPageHeader = ({ title, description }: AuthPageHeaderProps) => (
  <Stack spacing={1}>
    <Typography component="h1" variant="h2">
      {title}
    </Typography>
    <Typography color="text.secondary">{description}</Typography>
  </Stack>
);
