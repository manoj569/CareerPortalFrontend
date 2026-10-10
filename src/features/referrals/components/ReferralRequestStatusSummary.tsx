import { Typography } from '@mui/material';
import { dateLabel, requestStatus, type ReferralRequestRecord } from '../types/marketplaceModels';
const explanations = {
  Requested: 'Awaiting the employee’s decision. Contact details remain private.',
  Accepted:
    'The employee accepted your request. The referral has not yet been reported as submitted.',
  Rejected: 'The employee declined this referral request.',
  Expired: 'This request expired before it was accepted.',
  ReferralSubmitted:
    'The employee reports submitting the referral. This does not confirm employer receipt. Acknowledge only when you receive instructions.',
  CandidateConfirmed:
    'You acknowledged receiving instructions. This is not independent employer verification.',
};
export const ReferralRequestStatusSummary = ({ request }: { request: ReferralRequestRecord }) => {
  const status = requestStatus(request.status);
  const updated = {
    Requested: request.requestedAtUtc,
    Accepted: request.acceptedAtUtc,
    Rejected: request.rejectedAtUtc,
    Expired: request.expiredAtUtc,
    ReferralSubmitted: request.referralSubmittedAtUtc,
    CandidateConfirmed: request.candidateConfirmedAtUtc,
  }[status];
  return (
    <>
      <Typography mt={1} fontSize={13} color="text.secondary">
        {explanations[status]}
      </Typography>
      {updated && (
        <Typography mt={1} fontSize={12}>
          Last status update: {dateLabel(updated)}
        </Typography>
      )}
    </>
  );
};
