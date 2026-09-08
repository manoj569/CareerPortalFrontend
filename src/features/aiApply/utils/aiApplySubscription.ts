import type { AIApplyAccess, MembershipPlan } from '../types/aiApplyModels';

export const AI_APPLY_EXPIRING_SOON_DAYS = 5;
export const isAIApplyPlan = (plan: MembershipPlan) => plan.canUseAIApply;
export const isExpiringSoon = (access: AIApplyAccess, now = Date.now()) =>
  Boolean(
    access.subscriptionActive &&
    access.expiresAt &&
    Date.parse(access.expiresAt) > now &&
    Date.parse(access.expiresAt) - now <= AI_APPLY_EXPIRING_SOON_DAYS * 86400000,
  );
export const getPlanActionLabel = (plan: MembershipPlan, access: AIApplyAccess) => {
  if (access.planCode === plan.planCode) return `Renew ${plan.displayName}`;
  if (access.planCode === 'AIApply' && plan.canUseAIApplyPro) return 'Upgrade to AI Apply Pro';
  return `Choose ${plan.displayName}`;
};
