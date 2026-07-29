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
