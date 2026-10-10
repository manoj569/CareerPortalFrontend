import { dateLabel } from '@/features/referrals/types/marketplaceModels';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material';
import { apiClient } from '@/api/apiClient';
import {
  useAcceptReferralRequestMutation,
  useGetOwnedOpportunitiesQuery,
  useGetReferrerRequestQuery,
  useMarkReferralSubmittedMutation,
  useRejectReferralRequestMutation,
} from '@/features/referrals/api/marketplaceApi';
import {
  ApprovalBadge,
  CandidateSummary,
  Difference,
  JobSummary,
  ReferralCard,
  ReferralFailure,
  ReferralHero,
  ReferralLayout,
  ReferralLoading,
  ReferralTips,
  StatusBadge,
} from '@/features/referrals/components/MarketplaceUI';
import {
  approvalStatus,
  opportunityPath,
  referralError,
  requestPath,
  requestStatus,
} from '@/features/referrals/types/marketplaceModels';
import type { JobReferralSubmission } from '@/features/referrals/types/referralModels';
import { OpportunityCapacity } from '@/features/referrals/components/OpportunityCapacity';
export const ReferralSubmissionSuccessPage = () => {
  const { referralId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const jobs = useGetOwnedOpportunitiesQuery(undefined, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 60000,
  });
  const submitted = (location.state as { submission?: JobReferralSubmission } | null)?.submission;
  const job =
    jobs.currentData?.find((j) => j.id === referralId) ??
    (submitted?.id === referralId ? submitted : undefined);
  if (!job)
    return jobs.error ? (
      <ReferralFailure error={jobs.error} retry={jobs.refetch} />
    ) : jobs.isLoading ? (
      <ReferralLoading />
    ) : (
      <Alert severity="error">This opportunity is unavailable.</Alert>
    );
  const status = approvalStatus(job.approvalStatus);
  return (
    <ReferralLayout
      aside={
        <>
          <ReferralCard title="Submission status">
            <ApprovalBadge value={job.approvalStatus} />
            <Typography mt={2} fontSize={13}>
              Submitted on {dateLabel(job.createdAtUtc)}
            </Typography>
            <Typography fontSize={13} color="text.secondary" mt={1}>
              This is CareerHarbor’s opportunity review.
            </Typography>
            {job.rejectionReason && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {job.rejectionReason}
              </Alert>
            )}
          </ReferralCard>
          <ReferralTips />
          <Difference />
        </>
      }
    >
      <ReferralHero
        success={status !== 'Rejected'}
        title={
          status === 'Pending'
            ? 'Referral opportunity submitted successfully!'
            : status === 'Approved'
              ? 'Referral opportunity approved'
              : 'Referral opportunity not approved'
        }
        subtitle={
          status === 'Pending'
            ? 'We’ve received your referral opportunity and it will be reviewed before it’s published.'
            : status === 'Approved'
              ? 'Candidates can discover this opportunity and request a referral.'
              : 'Review the reason supplied by the CareerHarbor team.'
        }
      />
      <ReferralCard title="What happens next?">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(4,minmax(0,1fr))' },
            gap: 2,
          }}
        >
          {[
            ['Under review', 'Our team reviews the job for quality and compliance.'],
            ['Get approved', 'You’ll be notified once it’s approved.'],
            ['Candidates can request', 'After approval, candidates can send referral requests.'],
            [
              'You choose who to refer',
              'Review requests and accept candidates you’re comfortable referring.',
            ],
          ].map(([t, s], i) => (
            <Box key={t}>
              <Typography color="primary" fontWeight={750}>
                {i + 1}. {t}
              </Typography>
              <Typography fontSize={12} color="text.secondary" mt={1}>
                {s}
              </Typography>
            </Box>
          ))}
        </Box>
      </ReferralCard>
      <ReferralCard title="Submitted job details">
        <JobSummary job={job} />
        <Typography fontSize={13} mt={2}>
          Submitted {dateLabel(job.createdAtUtc)}
        </Typography>
      </ReferralCard>
      <ReferralCard title="Referral preferences">
        <OpportunityCapacity job={job} />
        <Typography fontSize={13} mt={2}>
          Selected contact sharing:{' '}
          {[
            job.showLinkedIn ? 'LinkedIn' : null,
            job.showEmail ? 'Email' : null,
            job.showPhone ? 'Phone' : null,
          ]
            .filter(Boolean)
            .join(', ')}
        </Typography>
        <Typography fontSize={12} color="text.secondary" mt={1}>
          Your contact details remain private until you accept a candidate’s referral request.
        </Typography>
      </ReferralCard>
      <ReferralCard title="Next actions">
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
          <Button variant="outlined" onClick={() => void navigate('/dashboard/referrals')}>
            View My Shared Jobs
          </Button>
          <Button
            variant="outlined"
            disabled={status !== 'Approved'}
            onClick={() => void navigate(opportunityPath(job.id))}
          >
            Manage requests →
          </Button>
          <Button variant="outlined" onClick={() => void navigate('/dashboard/refer-a-job')}>
            Share another job →
          </Button>
        </Stack>
      </ReferralCard>
    </ReferralLayout>
  );
};
export const ReferrerRequestDetailPage = () => {
  const { requestId = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const completion = location.pathname.endsWith('/complete');
  const success = location.pathname.endsWith('/submitted');
  const query = useGetReferrerRequestQuery(requestId, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 30000,
  });
  const jobs = useGetOwnedOpportunitiesQuery(undefined, { refetchOnMountOrArgChange: true });
  const [accept, acceptState] = useAcceptReferralRequestMutation();
  const [reject, rejectState] = useRejectReferralRequestMutation();
  const [mark, markState] = useMarkReferralSubmittedMutation();
  const [modal, setModal] = useState<'accept' | 'reject' | 'submit' | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const guard = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const record = query.currentData;
  const status = record ? requestStatus(record.request.status) : undefined;
  const job = jobs.currentData?.find((j) => j.id === record?.request.referralId);
  const busy = acceptState.isLoading || rejectState.isLoading || markState.isLoading;
  const mutate = async (action: 'accept' | 'reject' | 'submit') => {
    if (guard.current) return;
    guard.current = true;
    setError('');
    setNotice('');
    try {
      await (
        action === 'accept'
          ? accept(requestId)
          : action === 'reject'
            ? reject(requestId)
            : mark(requestId)
      ).unwrap();
      setModal(null);
      setNotice(
        action === 'accept'
          ? 'Referral request accepted. Submission is a separate step.'
          : action === 'reject'
            ? 'Referral request rejected.'
            : 'Referral marked as submitted.',
      );
      void query.refetch();
      void jobs.refetch();
    } catch (e) {
      setError(referralError(e));
      void query.refetch();
      void jobs.refetch();
      setModal(null);
    } finally {
      guard.current = false;
    }
  };
  const download = async () => {
    if (downloading) return;
    setDownloading(true);
    setError('');
    try {
      const result = await apiClient.get<Blob>(
        `/referrer/referral-requests/${encodeURIComponent(requestId)}/resume`,
        { responseType: 'blob' },
      );
      if (!mounted.current) return;
      const url = URL.createObjectURL(result.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'candidate-resume';
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      if (mounted.current) setError(referralError(e));
    } finally {
      if (mounted.current) setDownloading(false);
    }
  };
  if (query.isLoading || (!record && query.isFetching)) return <ReferralLoading />;
  if (query.error) return <ReferralFailure error={query.error} retry={query.refetch} />;
  if (!record) return <Alert severity="error">This request is unavailable.</Alert>;
  const isSubmitted = status === 'ReferralSubmitted' || status === 'CandidateConfirmed';
  return (
    <ReferralLayout
      aside={
        <>
          <ReferralCard title="Candidate summary">
            <CandidateSummary record={record} />
            <Box mt={2}>
              <StatusBadge status={status!} />
            </Box>
            {record.request.acceptedAtUtc && (
              <Typography fontSize={12} mt={1}>
                Accepted by you · {dateLabel(record.request.acceptedAtUtc)}
              </Typography>
            )}
          </ReferralCard>
          <ReferralCard title="Job summary">
            <JobSummary
              job={
                job ?? {
                  jobTitle: record.request.jobTitle,
                  companyName: record.request.companyName,
                  location: null,
                }
              }
            />
            {job && (
              <Box mt={2}>
                <OpportunityCapacity job={job} />
              </Box>
            )}
          </ReferralCard>
          <ReferralTips review />
          <Difference />
        </>
      }
    >
      <Button
        sx={{ alignSelf: 'flex-start' }}
        onClick={() => void navigate(opportunityPath(record.request.referralId))}
      >
        ← Back to referral requests
      </Button>
      <ReferralHero
        illustration={completion ? 'complete' : undefined}
        success={(success && isSubmitted) || (status === 'Accepted' && !completion)}
        title={
          status === 'CandidateConfirmed'
            ? 'Candidate confirmed receipt'
            : isSubmitted
              ? 'Referral marked as submitted'
              : completion && status === 'Accepted'
                ? `Complete referral for ${record.candidate.displayName}`
                : status === 'Accepted'
                  ? 'Referral request accepted'
                  : `Review ${record.candidate.displayName}’s referral request`
        }
        subtitle={
          status === 'CandidateConfirmed'
            ? 'The candidate confirmed receiving the referral/application confirmation.'
            : isSubmitted
              ? `You confirmed that you submitted ${record.candidate.displayName} for ${record.request.jobTitle} through your company’s referral process.`
              : status === 'Accepted'
                ? 'Submit the candidate through your company’s employee referral process, then confirm it here.'
                : 'Review the authorized candidate details before deciding whether to refer.'
        }
      />
      {notice && (
        <Alert severity="success" role="status">
          {notice}
        </Alert>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {record.request.notReceivedAtUtc && (
        <Alert severity="info">
          Candidate reported that they haven’t received referral confirmation yet.
        </Alert>
      )}
      {status === 'Expired' && (
        <Alert severity="info">This referral request expired before it was accepted.</Alert>
      )}
      {status === 'Rejected' && (
        <Alert severity="info">
          This referral request was rejected.
          {record.rejectionReason ? ` ${record.rejectionReason}` : ''}
        </Alert>
      )}
      {isSubmitted && (
        <Alert severity="success">
          {status === 'CandidateConfirmed'
            ? 'Candidate confirmed receiving the referral/application confirmation.'
            : 'The candidate can confirm whether they received the referral/application confirmation.'}
        </Alert>
      )}
      {completion && status === 'Accepted' && (
        <ReferralCard>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
            {[
              '1. Review candidate',
              '2. Complete company referral',
              '3. Confirm on CareerHarbor',
            ].map((t) => (
              <Typography fontWeight={650} fontSize={12} key={t}>
                {t}
              </Typography>
            ))}
          </Stack>
        </ReferralCard>
      )}
      <ReferralCard title="Candidate information">
        <CandidateSummary record={record} />
        <Typography fontSize={13} mt={2}>
          Current company: {record.candidate.currentCompany || 'Not provided'}
        </Typography>
        {record.request.candidateMessage && (
          <Box mt={2}>
            <Typography fontSize={13} fontWeight={700}>
              Candidate message
            </Typography>
            <Typography fontSize={13} color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
              {record.request.candidateMessage}
            </Typography>
          </Box>
        )}
        {record.candidate.resumeAvailable && status !== 'Rejected' && status !== 'Expired' ? (
          <Button
            sx={{ mt: 2 }}
            variant="outlined"
            disabled={downloading}
            onClick={() => void download()}
          >
            {downloading ? 'Downloading…' : 'Download authorized resume'}
          </Button>
        ) : (
          <Typography fontSize={12} color="text.secondary" mt={2}>
            Resume unavailable.
          </Typography>
        )}
      </ReferralCard>
      <ReferralCard title="Job information">
        <JobSummary
          job={
            job ?? {
              jobTitle: record.request.jobTitle,
              companyName: record.request.companyName,
              location: null,
            }
          }
        />
        {jobs.error && (
          <Box mt={2}>
            <ReferralFailure error={jobs.error} retry={jobs.refetch} />
          </Box>
        )}
      </ReferralCard>
      {status === 'Requested' && (
        <ReferralCard>
          <Typography fontSize={12} color="text.secondary" mb={2}>
            Acceptance creates an authorized connection and consumes one of the candidate’s referral
            connections. Complete the actual referral using your company’s process.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
            <Button variant="contained" disabled={busy} onClick={() => setModal('accept')}>
              {acceptState.isLoading ? 'Accepting…' : 'Accept request'}
            </Button>
            <Button
              variant="outlined"
              color="error"
              disabled={busy}
              onClick={() => setModal('reject')}
            >
              Reject request
            </Button>
          </Stack>
        </ReferralCard>
      )}
      {status === 'Accepted' && !completion && (
        <Button
          variant="contained"
          onClick={() => void navigate(`${requestPath(requestId)}/complete`)}
        >
          Continue to referral submission →
        </Button>
      )}
      {completion && status === 'Accepted' && (
        <>
          <ReferralCard title="Complete the company referral">
            <Typography fontSize={13}>
              Use your company’s employee referral portal or process to submit this candidate.
              CareerHarbor records your confirmation and does not submit the candidate to the
              employer.
            </Typography>
          </ReferralCard>
          <ReferralCard title="Before you confirm">
            <Stack>
              <FormControlLabel
                control={
                  <Checkbox checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
                }
                label="I submitted this candidate using my company’s referral process."
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={understood}
                    onChange={(e) => setUnderstood(e.target.checked)}
                  />
                }
                label="I understand CareerHarbor does not control the employer’s hiring process."
              />
            </Stack>
            <Button
              fullWidth
              variant="contained"
              disabled={!confirmed || !understood || busy}
              onClick={() => setModal('submit')}
            >
              I submitted the referral
            </Button>
          </ReferralCard>
        </>
      )}
      {isSubmitted && (
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
          <Button
            variant="outlined"
            onClick={() => void navigate(opportunityPath(record.request.referralId))}
          >
            Back to referral requests
          </Button>
          <Button variant="contained" onClick={() => void navigate('/dashboard/referrals')}>
            View my referrals
          </Button>
        </Stack>
      )}
      <Dialog
        open={modal !== null}
        onClose={() => {
          if (!busy) setModal(null);
        }}
        aria-labelledby="referral-confirm-title"
        aria-describedby="referral-confirm-copy"
      >
        <DialogTitle id="referral-confirm-title">
          {modal === 'accept'
            ? 'Accept this referral request?'
            : modal === 'reject'
              ? 'Reject this referral request?'
              : 'Confirm referral submission?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="referral-confirm-copy">
            {modal === 'accept'
              ? 'Acceptance consumes one referral connection and shares your selected contact methods. Submission is a separate step.'
              : modal === 'reject'
                ? 'Confirm that you want to decline this request.'
                : 'You should confirm only after you have actually submitted this candidate through your company’s referral process.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setModal(null)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={busy}
            onClick={() =>
              void mutate(modal === 'accept' ? 'accept' : modal === 'reject' ? 'reject' : 'submit')
            }
          >
            {busy
              ? 'Saving…'
              : modal === 'accept'
                ? 'Yes, accept request'
                : modal === 'reject'
                  ? 'Yes, reject request'
                  : 'Yes, mark as referred'}
          </Button>
        </DialogActions>
      </Dialog>
    </ReferralLayout>
  );
};
