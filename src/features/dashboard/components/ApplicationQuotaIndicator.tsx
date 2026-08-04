import { Alert } from '@mui/material';

import { selectCurrentUser } from '@/features/auth/store/authSlice';
import { useAppSelector } from '@/hooks/reduxHooks';
import { UserRole } from '@/types';
import { useGetApplicationQuotaQuery } from '../api/dashboardApi';

export const ApplicationQuotaIndicator = () => {
  const user = useAppSelector(selectCurrentUser);
  const isCandidate = user?.role === UserRole.Candidate;
  const quota = useGetApplicationQuotaQuery(undefined, { skip: !isCandidate });

  if (!isCandidate || !quota.data) return null;

  return (
    <Alert aria-live="polite" severity={quota.data.remainingApplications > 0 ? 'info' : 'warning'}>
      {quota.data.isPremium
        ? `Premium applications: ${quota.data.usedApplications} of ${quota.data.limit} used today`
        : `Free applications: ${quota.data.usedApplications} of ${quota.data.limit} used this month`}
    </Alert>
  );
};
