import { Stack, Typography } from '@mui/material';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/store/authSlice';
import { useAppSelector } from '@/hooks/reduxHooks';
import { UserRole } from '@/types';
import { useGetApplicationQuotaQuery } from '../api/dashboardApi';

export const ApplicationQuotaIndicator = () => {
  const authenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const query = useGetApplicationQuotaQuery(undefined, { skip: !authenticated || user?.role !== UserRole.Candidate });
  if (!authenticated || user?.role !== UserRole.Candidate || query.isLoading || query.isError || !query.data) return null;
  const { isPremium, usedApplications, remainingApplications, limit } = query.data;
  const noun = remainingApplications === 1 ? 'application' : 'applications';
  const remaining = remainingApplications <= 0 ? (isPremium ? 'Daily application limit reached' : 'Free application limit reached')
    : `${remainingApplications} ${!isPremium && usedApplications === 0 ? 'free ' : ''}${noun} left ${isPremium ? 'today' : 'this month'}`;
  return <Stack spacing={0.25} role="status" sx={{ py: 1 }}>
    <Typography variant="caption" color="text.secondary">{usedApplications} of {limit} {isPremium ? 'applications used today' : 'free applications used'}</Typography>
    <Typography variant="body2" fontWeight={600}>{remaining}</Typography>
  </Stack>;
};
