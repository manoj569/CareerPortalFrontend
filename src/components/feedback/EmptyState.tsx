import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import { Box, Button, Stack, Typography } from '@mui/material';

interface EmptyStateProps {
  actionLabel?: string;
  description: string;
  onAction?: () => void;
  title: string;
}

export const EmptyState = ({ actionLabel, description, onAction, title }: EmptyStateProps) => (
  <Box
    component="section"
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
      <SearchOffOutlinedIcon color="disabled" sx={{ fontSize: 48 }} />
      <Typography component="h2" variant="h3">
        {title}
      </Typography>
      <Typography color="text.secondary" maxWidth={520}>
        {description}
      </Typography>
      {actionLabel && onAction ? (
        <Button onClick={onAction} variant="outlined">
          {actionLabel}
        </Button>
      ) : null}
    </Stack>
  </Box>
);
