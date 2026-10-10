import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetMembershipsQuery } from '@/features/dashboard/api/dashboardApi';
import { findActiveMembership } from '@/features/payments/utils/entitlement';
import { InterviewInsightsPage } from '@/pages/InterviewInsightsPage';
import { interviewInsightsMembershipPath } from '../utils/membershipAccess';
import { InterviewInsightsMembershipDialog } from './InterviewInsightsMembershipDialog';

export const InterviewInsightsMembershipGate = () => {
  const navigate = useNavigate();
  const memberships = useGetMembershipsQuery();
  const [membershipRequired, setMembershipRequired] = useState(false);
  const activeMembership = findActiveMembership(memberships.data);
  const requireMembership = useCallback(() => setMembershipRequired(true), []);
  return (
    <>
      <InterviewInsightsPage canReadDetails={memberships.isLoading || memberships.isUninitialized || memberships.isError || Boolean(activeMembership)} onMembershipRequired={requireMembership} />
      <InterviewInsightsMembershipDialog
        onCancel={() => setMembershipRequired(false)}
        onGetMembership={() => void navigate(interviewInsightsMembershipPath)}
        open={membershipRequired}
      />
    </>
  );
};
