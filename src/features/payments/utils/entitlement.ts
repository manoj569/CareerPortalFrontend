import { MembershipStatus, type Membership } from '@/features/dashboard/types/dashboardModels';

export const isMembershipActive = (membership: Membership, now = new Date()): boolean => {
  if (membership.status !== MembershipStatus.Active) return false;
  if (!membership.endsAtUtc) return true;
  const endsAt = new Date(membership.endsAtUtc);
  return !Number.isNaN(endsAt.getTime()) && endsAt > now;
};

export const findActiveMembership = (
  memberships: Membership[] | undefined,
): Membership | undefined => memberships?.find((membership) => isMembershipActive(membership));

// Unknown legacy names must not grant either independent entitlement.
export const membershipPlanCode = (record: {
  planCode?: string | null;
  planName?: string | null;
}): string | undefined => {
  if (record.planCode) return record.planCode;
  if (record.planName === 'Referral Contact Access') return 'ReferralContactAccess';
  if (
    ['Job Application Access', 'Career Harbor Membership', 'Basic'].includes(record.planName ?? '')
  )
    return 'CareerHarborMembership';
  return undefined;
};

export const membershipPlanName = (record: {
  planCode?: string | null;
  planName?: string | null;
}): string => {
  const code = membershipPlanCode(record);
  if (code === 'ReferralContactAccess') return 'Referral Contact Access';
  if (code === 'CareerHarborMembership') return 'Job Application Access';
  return record.planName || record.planCode || 'Membership';
};

export const findActivePlanMembership = (
  memberships: Membership[] | undefined,
  planCode: string | undefined,
): Membership | undefined =>
  planCode
    ? memberships?.find(
        (membership) =>
          membershipPlanCode(membership) === planCode && isMembershipActive(membership),
      )
    : undefined;
