import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Pagination,
  Stack,
  Tabs,
  Tab,
  TextField,
  Typography,
} from '@mui/material';
import {
  useConfirmReferralReceiptMutation,
  useGetAcceptedContactQuery,
  useGetCandidateRequestQuery,
  useGetCandidateActivityQuery,
  useGetReferralCatalogueQuery,
  useReportReferralNotReceivedMutation,
} from '@/features/referrals/api/marketplaceApi';
import {
  ReferralCard,
  ReferralFailure,
  ReferralHero,
  ReferralLayout,
  ReferralLoading,
  StatusBadge,
} from '@/features/referrals/components/MarketplaceUI';
import {
  CandidateHowItWorks,
  CandidateJobSummary,
  CandidateQuotaCard,
  CandidateReferralTimeline,
} from '@/features/referrals/components/CandidateReferralUI';
import {
  dateLabel,
  referralError,
  requestStatus,
  statusLabel,
  type ReferralRequestStatus,
} from '@/features/referrals/types/marketplaceModels';
import { ROUTES } from '@/constants/routes';

const filters: (ReferralRequestStatus | 'All')[] = [
  'All',
  'Requested',
  'Accepted',
  'Rejected',
  'Expired',
  'ReferralSubmitted',
  'CandidateConfirmed',
];
export const CandidateReferralRequestsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<ReferralRequestStatus | 'All'>('All');
  const [search, setSearch] = useState('');
  const q = useGetCandidateActivityQuery(undefined, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 60000,
  });
  const catalogue = useGetReferralCatalogueQuery(undefined, { refetchOnMountOrArgChange: true });
  const rows = useMemo(
    () =>
      [...(q.currentData?.items ?? [])].sort(
        (a, b) => Date.parse(b.requestedAtUtc) - Date.parse(a.requestedAtUtc),
      ),
    [q.currentData?.items],
  );
  const counts = useMemo(() => {
    const result = new Map<ReferralRequestStatus, number>();
    for (const row of rows) {
      const status = requestStatus(row.status);
      result.set(status, (result.get(status) ?? 0) + 1);
    }
    return result;
  }, [rows]);
  const jobsByReferral = useMemo(
    () => new Map(catalogue.currentData?.map((job) => [job.referralId, job])),
    [catalogue.currentData],
  );
  const visible = useMemo(
    () =>
      rows.filter(
        (r) =>
          (filter === 'All' || requestStatus(r.status) === filter) &&
          [r.jobTitle, r.companyName].join(' ').toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [rows, filter, search],
  );
  return (
    <ReferralLayout
      aside={
        <>
          <ReferralCard title="Your referral activity">
            <Stack gap={1.5}>
              {filters.map((s) => (
                <Stack key={s} direction="row" justifyContent="space-between">
                  <Typography fontSize={13}>
                    {s === 'All' ? 'Requests sent' : statusLabel(s)}
                  </Typography>
                  <Typography fontWeight={750}>
                    {q.currentData ? (s === 'All' ? rows.length : (counts.get(s) ?? 0)) : '—'}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </ReferralCard>
          {q.currentData && <CandidateQuotaCard quota={q.currentData.quota} />}
          <CandidateHowItWorks />
        </>
      }
    >
      <Button
        sx={{ alignSelf: 'flex-start' }}
        onClick={() => void navigate(`${ROUTES.DASHBOARD_JOBS}?mode=referral`)}
      >
        Find Referral Jobs
      </Button>
      <ReferralHero
        title="My Requests"
        subtitle="Track your referral requests and check their status."
      />
      {q.isLoading ? (
        <ReferralLoading />
      ) : q.error ? (
        <ReferralFailure error={q.error} retry={q.refetch} />
      ) : q.currentData ? (
        <>
          <ReferralCard>
            <Tabs
              value={filter}
              variant="scrollable"
              scrollButtons="auto"
              onChange={(_, v: typeof filter) => {
                setFilter(v);
                setPage(1);
              }}
              aria-label="Request status filters"
            >
              {filters.map((s) => (
                <Tab
                  key={s}
                  value={s}
                  label={`${s === 'All' ? 'All' : statusLabel(s)} (${s === 'All' ? rows.length : (counts.get(s) ?? 0)})`}
                />
              ))}
            </Tabs>
            <TextField
              fullWidth
              size="small"
              sx={{ mt: 2 }}
              label="Search your requests"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </ReferralCard>
          {visible.length ? (
            visible.slice((page - 1) * 5, page * 5).map((r) => (
              <ReferralCard key={r.id}>
                <CandidateJobSummary request={r} job={jobsByReferral.get(r.referralId)} />
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={1}
                  useFlexGap
                  flexWrap="wrap"
                  mt={2}
                >
                  <Typography fontSize={12}>Requested {dateLabel(r.requestedAtUtc)}</Typography>
                  <StatusBadge status={requestStatus(r.status)} />
                  <Button
                    variant="outlined"
                    onClick={() =>
                      void navigate(`/dashboard/my-referral-requests/${encodeURIComponent(r.id)}`)
                    }
                  >
                    View Details →
                  </Button>
                </Stack>
                <CandidateReferralTimeline request={r} />
              </ReferralCard>
            ))
          ) : (
            <ReferralCard>
              <Typography>
                {rows.length
                  ? 'No requests match your filters.'
                  : "You haven't requested any referrals yet."}
              </Typography>
              <Button
                onClick={() =>
                  rows.length
                    ? (setSearch(''), setFilter('All'), setPage(1))
                    : void navigate(`${ROUTES.DASHBOARD_JOBS}?mode=referral`)
                }
              >
                {rows.length ? 'Clear Filters' : 'Find Referral Jobs'}
              </Button>
            </ReferralCard>
          )}
          {visible.length > 5 && (
            <Pagination
              page={page}
              count={Math.ceil(visible.length / 5)}
              onChange={(_, v) => setPage(v)}
            />
          )}
        </>
      ) : null}
    </ReferralLayout>
  );
};
const AuthorizedContact = ({ id }: { id: string }) => {
  const q = useGetAcceptedContactQuery(id, { refetchOnMountOrArgChange: true });
  return (
    <ReferralCard title="Authorized contact">
      {q.isFetching ? (
        <ReferralLoading />
      ) : q.error ? (
        <ReferralFailure error={q.error} retry={q.refetch} />
      ) : q.currentData ? (
        <Stack gap={1}>
          <Typography>{q.currentData.referrerLabel}</Typography>
          {q.currentData.email && <Typography>Email: {q.currentData.email}</Typography>}
          {q.currentData.phoneNumber && <Typography>Phone: {q.currentData.phoneNumber}</Typography>}
          {q.currentData.linkedInUrl && (
            <Typography sx={{ overflowWrap: 'anywhere' }}>
              LinkedIn: {q.currentData.linkedInUrl}
            </Typography>
          )}
        </Stack>
      ) : null}
    </ReferralCard>
  );
};
export const CandidateReferralRequestPage = () => {
  const { requestId = '' } = useParams();
  const navigate = useNavigate();
  const q = useGetCandidateRequestQuery(requestId, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 30000,
  });
  const catalogue = useGetReferralCatalogueQuery(undefined, { refetchOnMountOrArgChange: true });
  const [confirm, confirmState] = useConfirmReferralReceiptMutation();
  const [notReceived, notState] = useReportReferralNotReceivedMutation();
  const [modal, setModal] = useState<'confirm' | 'not-received' | null>(null);
  const [error, setError] = useState('');
  const processing = useRef(false);
  const r = q.currentData;
  const status = r ? requestStatus(r.status) : undefined;
  const busy = confirmState.isLoading || notState.isLoading;
  const act = async () => {
    if (busy || processing.current || !modal || status !== 'ReferralSubmitted') return;
    processing.current = true;
    setError('');
    try {
      await (modal === 'confirm' ? confirm(requestId) : notReceived(requestId)).unwrap();
      setModal(null);
      void q.refetch();
    } catch (e) {
      setError(referralError(e));
      setModal(null);
      void q.refetch();
    } finally {
      processing.current = false;
    }
  };
  const job = catalogue.currentData?.find((j) => j.referralId === r?.referralId);
  const confirmed = status === 'CandidateConfirmed';
  const submitted = status === 'ReferralSubmitted';
  return (
    <>
      <ReferralLayout
        aside={
          <>
            {r && (
              <ReferralCard title="Your referral summary">
                <CandidateJobSummary request={r} job={job} />
                <Typography fontSize={12} mt={2}>
                  Requested on {dateLabel(r.requestedAtUtc)}
                </Typography>
              </ReferralCard>
            )}
            <CandidateHowItWorks />
            <ReferralCard title="What happens next?">
              <Typography fontSize={13}>
                {confirmed
                  ? 'Continue with any application instructions you received directly from the company. CareerHarbor records your acknowledgement; the company manages any further process.'
                  : submitted
                    ? 'Check your email or company application portal for instructions. Acknowledge receipt only when you receive them.'
                    : 'The employee decides whether to accept and separately reports referral submission. Follow the actual updates here.'}
              </Typography>
              <Button onClick={() => void navigate('/dashboard/my-referral-requests')}>
                View My Requests →
              </Button>
            </ReferralCard>
          </>
        }
      >
        <Button
          sx={{ alignSelf: 'flex-start' }}
          onClick={() => void navigate('/dashboard/my-referral-requests')}
        >
          ← Back to My Requests
        </Button>
        {q.isLoading ? (
          <ReferralLoading />
        ) : q.error ? (
          <ReferralFailure error={q.error} retry={q.refetch} />
        ) : r ? (
          <>
            <ReferralHero
              success={confirmed}
              title={
                confirmed
                  ? 'Confirmation received — acknowledged by you'
                  : submitted
                    ? 'Referral Submitted'
                    : 'Referral Request Details'
              }
              subtitle={
                confirmed
                  ? 'You indicated that you received referral or application instructions from the company.'
                  : submitted
                    ? 'The employee has marked your referral as submitted. Please check your email or company application portal for further instructions.'
                    : 'Track the status of your referral request and next steps.'
              }
            />
            <Typography fontSize={12}>Request ID: {r.id}</Typography>
            <ReferralCard>
              <CandidateJobSummary request={r} job={job} />
            </ReferralCard>
            <ReferralCard title="Request status">
              <StatusBadge status={status!} />
              <Typography fontSize={13} mt={2}>
                Requested {dateLabel(r.requestedAtUtc)}
              </Typography>
              {status === 'Requested' && (
                <Typography fontSize={13} mt={1}>
                  Awaiting the employee’s decision. Contact details remain private. Expires{' '}
                  {dateLabel(r.expiresAtUtc)}.
                </Typography>
              )}
              {status === 'Expired' && (
                <Typography>This referral request expired before it was accepted.</Typography>
              )}
              {status === 'Rejected' && (
                <Typography>The employee declined this referral request.</Typography>
              )}
              {status === 'Accepted' && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  An employee has accepted your referral request. Referral submission has not yet
                  been confirmed.
                </Alert>
              )}
              {confirmed && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  You indicated that you received referral or application instructions from the
                  company. This is your acknowledgement, not independent company verification.
                </Alert>
              )}
              <CandidateReferralTimeline request={r} />
              {r.notReceivedAtUtc && (
                <Alert severity="info">
                  You reported that you haven’t received referral confirmation yet on{' '}
                  {dateLabel(r.notReceivedAtUtc)}. This request remains Submitted; you can
                  acknowledge receipt later.
                </Alert>
              )}
            </ReferralCard>
            {r.candidateMessage && (
              <ReferralCard title="Your referral message">
                <Typography fontSize={13} sx={{ whiteSpace: 'pre-wrap' }}>
                  {r.candidateMessage}
                </Typography>
              </ReferralCard>
            )}
            {r.canViewContact &&
              ['Accepted', 'ReferralSubmitted', 'CandidateConfirmed'].includes(status!) && (
                <AuthorizedContact id={requestId} />
              )}
            {error && <Alert severity="error">{error}</Alert>}
            {submitted && (
              <ReferralCard
                title="Have you received a referral or application confirmation from the company?"
                tint="#fffaf0"
              >
                <Typography fontSize={13} mb={2}>
                  This could be an email, application link or message on the company’s career
                  portal. Your acknowledgement records what you received; it does not verify an
                  employer application outcome.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                  <Button variant="contained" disabled={busy} onClick={() => setModal('confirm')}>
                    I received confirmation
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={busy || !!r.notReceivedAtUtc}
                    onClick={() => setModal('not-received')}
                  >
                    Not received yet
                  </Button>
                </Stack>
              </ReferralCard>
            )}
          </>
        ) : null}
      </ReferralLayout>
      <Dialog
        open={modal !== null}
        onClose={() => {
          if (!busy) setModal(null);
        }}
        aria-labelledby="receipt-dialog-title"
      >
        <DialogTitle id="receipt-dialog-title">
          {modal === 'confirm' ? 'Confirm receipt?' : 'Report confirmation not received?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {modal === 'confirm'
              ? 'Confirm only if you received the referral/application confirmation. This records your acknowledgement, not independent company verification.'
              : 'This records that you have not received confirmation yet and informs the referrer. Your request remains Submitted and you can acknowledge receipt later.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setModal(null)}>
            Cancel
          </Button>
          <Button disabled={busy} onClick={() => void act()}>
            {busy ? 'Saving…' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
