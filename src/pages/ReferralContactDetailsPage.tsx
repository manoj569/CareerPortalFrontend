import { Alert, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
// Old job-scoped links cannot establish request ownership or acceptance authorization.
export const ReferralContactDetailsPage = () => {
  const navigate = useNavigate();
  return (
    <Stack gap={2}>
      <Alert severity="info">
        Contact access requires an accepted referral request and active Referral Access. Open your
        request to view authorized contact methods.
      </Alert>
      <Button onClick={() => void navigate('/dashboard/my-referral-requests')}>
        View my referral requests
      </Button>
    </Stack>
  );
};
