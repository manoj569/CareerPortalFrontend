import ContactMailOutlinedIcon from '@mui/icons-material/ContactMailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Alert, Button, Link as MuiLink, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useGetApplicationQuotaQuery, useLazyGetRecruiterContactQuery } from '@/features/dashboard/api/dashboardApi';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/store/authSlice';
import { useAppSelector } from '@/hooks/reduxHooks';
import { UserRole } from '@/types';

interface RecruiterContactCardProps {
  jobId: string;
  onUnlockRequired?: () => void;
}

export const RecruiterContactCard = ({ jobId, onUnlockRequired }: RecruiterContactCardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const [loadContact, contactState] = useLazyGetRecruiterContactQuery();
  const [message, setMessage] = useState<string | null>(null);

  // 🚀 1. Fetch the user's quota to check if they are Premium
  const { data: quotaData, isLoading: isQuotaLoading } = useGetApplicationQuotaQuery();

  const unlock = async () => {
    setMessage(null);

    if (!isAuthenticated) {
      void navigate(ROUTES.LOGIN, { state: { from: location } });
      return;
    }

    if (user?.role !== UserRole.Candidate) {
      void navigate(ROUTES.UNAUTHORIZED);
      return;
    }

    // 🚀 2. CHECK IF USER IS PREMIUM
    // If quotaData exists and isPremium is true, they are a premium member!
    const isPremiumMember = quotaData?.isPremium === true;

    // 🚀 3. If NOT premium, trigger the parent modal
    if (!isPremiumMember) {
      if (onUnlockRequired) {
        onUnlockRequired();
        return;
      } else {
        // Fallback if no modal is provided
        void navigate(ROUTES.MEMBERSHIP);
        return;
      }
    }

    // 🚀 4. IF PREMIUM, load the contact details
    const result = await loadContact(jobId);

    if ('error' in result) {
      const status =
        typeof result.error === 'object' && result.error !== null && 'status' in result.error
          ? Number((result.error as { status?: unknown }).status)
          : 0;

      if (status === 404) {
        setMessage('Recruiter contact details are not available for this job yet.');
        return;
      }

      setMessage('We could not load recruiter contact details. Please try again.');
    }
  };

  // Show contact details if data is loaded
  if (contactState.data) {
    const contact = contactState.data;

    return (
      <Paper component="section" sx={{ bgcolor: 'success.50', p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={1}>
          <Stack alignItems="center" direction="row" spacing={1}>
            <ContactMailOutlinedIcon color="success" />
            <Typography component="h2" variant="h3">
              Recruiter contact
            </Typography>
          </Stack>

          <Typography>
            <strong>{contact.contactName}</strong> · {contact.contactRole}
          </Typography>

          <MuiLink href={`mailto:${contact.email}`}>{contact.email}</MuiLink>

          {contact.phoneNumber ? (
            <MuiLink href={`tel:${contact.phoneNumber.replace(/[^\d+]/g, '')}`}>
              {contact.phoneNumber}
            </MuiLink>
          ) : null}
        </Stack>
      </Paper>
    );
  }

  const isAdministrator = isAuthenticated && user?.role !== UserRole.Candidate;

  return (
    <Paper component="section" sx={{ p: { xs: 2.5, md: 3 } }}>
      <Stack spacing={1.5}>
        <Stack alignItems="center" direction="row" spacing={1}>
          <LockOutlinedIcon color="primary" />
          <Typography component="h2" variant="h3">
            Recruiter contact
          </Typography>
        </Stack>

        <Typography color="text.secondary">
          Premium Candidates can securely view the approved recruiter contact for this role.
        </Typography>

        {message ? (
          <Alert aria-live="polite" severity="info">
            {message}
          </Alert>
        ) : null}

        {isAdministrator ? (
          <Alert severity="info">
            Recruiter contacts are available only to Candidate accounts.
          </Alert>
        ) : (
          <Button
            disabled={contactState.isFetching || isQuotaLoading}
            onClick={() => void unlock()}
            sx={{ alignSelf: 'flex-start' }}
            variant="contained"
          >
            {contactState.isFetching || isQuotaLoading ? 'Loading…' : 'Unlock recruiter contact'}
          </Button>
        )}
      </Stack>
    </Paper>
  );
};