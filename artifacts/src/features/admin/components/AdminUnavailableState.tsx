import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import { Alert, Paper, Stack, Typography } from '@mui/material';

interface AdminUnavailableStateProps {
  description: string;
  title: string;
}

export const AdminUnavailableState = ({ description, title }: AdminUnavailableStateProps) => (
  <Paper component="section" sx={{ p: { xs: 3, md: 5 } }}>
    <Stack spacing={2}>
      <BlockOutlinedIcon color="disabled" sx={{ fontSize: 44 }} />
      <Typography component="h1" variant="h1">
        {title}
      </Typography>
      <Typography color="text.secondary" maxWidth={720}>
        {description}
      </Typography>
      <Alert severity="info">
        No administrative data or successful operation is being simulated by this frontend.
      </Alert>
    </Stack>
  </Paper>
);
