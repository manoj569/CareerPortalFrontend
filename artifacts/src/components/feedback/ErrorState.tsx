import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Box, Button, Stack, Typography } from '@mui/material';

interface ErrorStateProps {
  description?: string;
  headingLevel?: 'h1' | 'h2';
  onRetry: () => void;
  title?: string;
}

export const ErrorState = ({
  description = 'We could not load this information. Check your connection and try again.',
  headingLevel = 'h2',
  onRetry,
  title = 'Something went wrong',
}: ErrorStateProps) => (
  <Box
    component="section"
    role="alert"
    sx={{
      bgcolor: 'background.paper',
      border: 1,
      borderColor: 'divider',
      borderRadius: 2,
      p: { xs: 4, sm: 6 },
      textAlign: 'center',
    }}
  >
    <Stack alignItems="center" spacing={2}>
      <ErrorOutlineIcon color="error" sx={{ fontSize: 44 }} />
      <Typography component={headingLevel} variant="h3">
        {title}
      </Typography>
      <Typography color="text.secondary" maxWidth={520}>
        {description}
      </Typography>
      <Button onClick={onRetry} variant="contained">
        Try again
      </Button>
    </Stack>
  </Box>
);
