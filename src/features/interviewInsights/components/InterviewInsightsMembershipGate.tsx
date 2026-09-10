import { Box } from '@mui/material';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import { ROUTES } from '@/constants/routes';
import { useGetMembershipsQuery } from '@/features/dashboard/api/dashboardApi';
import { findActiveMembership } from '@/features/payments/utils/entitlement';
import { InterviewInsightsPage } from '@/pages/InterviewInsightsPage';
import {
  getSafeCandidateDashboardReturnPath,
  interviewInsightsMembershipPath,
} from '../utils/membershipAccess';
import { InterviewInsightsMembershipDialog } from './InterviewInsightsMembershipDialog';

interface InsightsLocationState {
  from?: unknown;
}

export const InterviewInsightsMembershipGate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const memberships = useGetMembershipsQuery();
  const [membershipRequired, setMembershipRequired] = useState(false);
  const activeMembership = findActiveMembership(memberships.data);
  const cancelPath = useMemo(
    () =>
      getSafeCandidateDashboardReturnPath(
        (location.state as InsightsLocationState | null)?.from,
        ROUTES.DASHBOARD,
      ),
    [location.state],
  );

  if (memberships.isLoading || memberships.isUninitialized) return <PageLoadingIndicator label="Checking membership access…" />;

  if (memberships.isError || !memberships.data) {
    return (
      <Box sx={{ py: 4 }} aria-live="polite">
        <ErrorState
          description="We could not confirm your membership access. Try again before opening Interview Insights."
          onRetry={() => void memberships.refetch()}
          title="Membership status unavailable"
        />
      </Box>
    );
  }

  const locked = !activeMembership || membershipRequired;

  return (
    <>
      {locked ? null : (
        <InterviewInsightsPage onMembershipRequired={() => setMembershipRequired(true)} />
      )}
      <InterviewInsightsMembershipDialog
        onCancel={() => void navigate(cancelPath, { replace: true })}
        onGetMembership={() => void navigate(interviewInsightsMembershipPath)}
        open={locked}
      />
      <Box
        aria-live="assertive"
        sx={{ position: 'absolute', height: 1, overflow: 'hidden', width: 1 }}
      >
        {membershipRequired ? 'Your membership access needs to be renewed.' : ''}
      </Box>
    </>
  );
};
