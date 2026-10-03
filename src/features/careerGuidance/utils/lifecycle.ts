import { ConsultantVerificationStatus as Status } from '../types/enums';
import { guidanceRoutes } from './routes';

export function consultantLifecycle(status?: Status, missingRequirements: readonly string[] = []) {
  const isDraft = status === Status.Draft;
  const isPending = status === Status.Pending;
  const isVerified = status === Status.Verified;
  const isRejected = status === Status.Rejected;
  const isSuspended = status === Status.Suspended;
  const missing = missingRequirements.filter(value => !['CurrentPolicyAcceptance', 'PublicProfileConsent'].includes(value));
  const canSubmit = isDraft && missing.length === 0;
  return {
    isDraft, isPending, isVerified, isRejected, isSuspended, missing, canSubmit,
    canEditOnboarding: isDraft || isRejected,
    canOpenConsultantWorkspace: isVerified,
    displayStatus: isDraft ? (canSubmit ? 'Ready to submit' : 'Draft') : isPending ? 'Under review' : isVerified ? 'Approved' : isRejected ? 'Changes required' : isSuspended ? 'Restricted' : 'Not started',
    title: isDraft ? (canSubmit ? 'Your profile is ready for review' : 'Complete your consultant profile') : isPending ? 'Your consultant application is under review' : isVerified ? 'Your consultant profile is approved' : isRejected ? 'Changes are required before your profile can be approved' : 'Consultant access is restricted',
    entryLabel: isDraft ? 'Continue consultant setup' : isPending ? 'View application status' : isVerified ? 'Consultant Workspace' : isRejected ? 'Update consultant profile' : isSuspended ? 'View consultant status' : 'Become a Consultant',
    destination: isVerified ? guidanceRoutes.owner('profile') : isDraft || status === undefined ? guidanceRoutes.becomeConsultant : guidanceRoutes.consultantOnboardingReview,
  };
}
