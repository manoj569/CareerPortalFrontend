import { dateLabel } from '@/features/referrals/types/marketplaceModels';
import { PendingRequestActions } from '@/features/referrals/components/PendingRequestActions';
import { OpportunityCapacity } from '@/features/referrals/components/OpportunityCapacity';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Pagination,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {
  useGetOwnedOpportunitiesQuery,
  useGetReferrerInboxQuery,
  useGetReferralMetricsQuery,
} from '@/features/referrals/api/marketplaceApi';
import {
  ApprovalBadge,
  CandidateSummary,
  Difference,
  Impact,
  JobSummary,
  Metrics,
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
  requestPath,
  requestStatus,
  statusLabel,
  type ReferrerRequestRecord,
} from '@/features/referrals/types/marketplaceModels';

const useFresh = { pollingInterval: 60000, refetchOnMountOrArgChange: true };
export const AllReferralsPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const jobs = useGetOwnedOpportunitiesQuery(undefined, useFresh);
  const inbox = useGetReferrerInboxQuery(undefined, useFresh);
  const metrics = useGetReferralMetricsQuery(undefined, useFresh);
  const filtered = (jobs.currentData ?? [])
    .filter(
      (j) =>
        (tab === 'All' || approvalStatus(j.approvalStatus) === tab) &&
        `${j.jobTitle} ${j.companyName} ${j.location ?? ''}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) => Date.parse(b.createdAtUtc) - Date.parse(a.createdAtUtc));
  return (
    <ReferralLayout
      aside={
        <>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => void navigate('/dashboard/refer-a-job')}
            sx={{ minHeight: 48 }}
          >
            Share a new job opportunity
          </Button>
          <Impact />
          <ReferralTips />
          <Difference />
        </>
      }
    >
      <ReferralHero
        title="My Referral Jobs"
        subtitle="Manage the opportunities you’ve shared and track referral requests."
      />
      <ReferralCard tint="#f2f8ff">
        {metrics.isLoading ? (
          <ReferralLoading />
        ) : metrics.error ? (
          <ReferralFailure error={metrics.error} retry={metrics.refetch} />
        ) : metrics.data ? (
          <Metrics metrics={metrics.data} />
        ) : null}
      </ReferralCard>
      <ReferralCard>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ md: 'center' }}
          gap={1}
          justifyContent="space-between"
        >
          <Tabs
            value={tab}
            variant="scrollable"
            scrollButtons="auto"
            onChange={(_, v: string) => {
              setTab(v);
              setPage(1);
            }}
          >
            {[
              ['All', 'All'],
              ['Approved', 'Active'],
              ['Pending', 'Pending approval'],
              ['Rejected', 'Rejected'],
            ].map(([v, l]) => (
              <Tab key={v} value={v} label={l} sx={{ textTransform: 'none', minWidth: 70 }} />
            ))}
          </Tabs>
          <TextField
            size="small"
            label="Search title, company, location"
            sx={{ maxWidth: { md: 280 } }}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Typography fontSize={12} color="text.secondary">
            Newest first
          </Typography>
        </Stack>
      </ReferralCard>
      {jobs.isLoading ? (
        <ReferralLoading />
      ) : jobs.error ? (
        <ReferralFailure error={jobs.error} retry={jobs.refetch} />
      ) : !filtered.length ? (
        <ReferralCard>
          <Typography fontWeight={700}>
            {search || tab !== 'All'
              ? 'No opportunities match this filter.'
              : 'No referral opportunities yet.'}
          </Typography>
          <Button onClick={() => void navigate('/dashboard/refer-a-job')}>
            Share a job opportunity
          </Button>
        </ReferralCard>
      ) : (
        filtered.slice((page - 1) * 5, page * 5).map((job) => {
          const rows = inbox.currentData?.filter((r) => r.request.referralId === job.id);
          return (
            <ReferralCard key={job.id}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', xl: 'minmax(0,1.2fr) minmax(240px,1fr) auto' },
                  gap: 2,
                  alignItems: 'center',
                }}
              >
                <Box>
                  <JobSummary job={job} />
                  <Stack direction="row" justifyContent="space-between" gap={1} mt={1.5}>
                    <ApprovalBadge value={job.approvalStatus} />
                    <Typography fontSize={11} color="text.secondary">
                      Posted {dateLabel(job.createdAtUtc)}
                    </Typography>
                  </Stack>
                </Box>
                <Box>
                  <Stack direction="row" flexWrap="wrap" useFlexGap gap={2} mb={1.5}>
                    {[
                      ['Requests', rows?.length],
                      ['Submitted', rows?.filter((r) => r.request.referralSubmittedAtUtc).length],
                      ['Confirmed', rows?.filter((r) => r.request.candidateConfirmedAtUtc).length],
                    ].map(([l, v]) => (
                      <Box key={l}>
                        <Typography fontWeight={750}>
                          {inbox.isLoading ? '…' : inbox.error ? 'Unavailable' : v}
                        </Typography>
                        <Typography fontSize={11} color="text.secondary">
                          {l}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                  <OpportunityCapacity job={job} />
                </Box>
                <Button
                  variant="outlined"
                  disabled={approvalStatus(job.approvalStatus) === 'Pending'}
                  onClick={() =>
                    void navigate(
                      approvalStatus(job.approvalStatus) === 'Approved'
                        ? opportunityPath(job.id)
                        : `/dashboard/referrals/${encodeURIComponent(job.id)}/submitted`,
                    )
                  }
                >
                  {approvalStatus(job.approvalStatus) === 'Approved'
                    ? 'View requests →'
                    : 'View details →'}
                </Button>
              </Box>
            </ReferralCard>
          );
        })
      )}
      {inbox.error && <ReferralFailure error={inbox.error} retry={inbox.refetch} />}{' '}
      {filtered.length > 5 && (
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography fontSize={12}>
            Showing {(page - 1) * 5 + 1}–{Math.min(page * 5, filtered.length)} of {filtered.length}
          </Typography>
          <Pagination
            count={Math.ceil(filtered.length / 5)}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
          />
        </Stack>
      )}
    </ReferralLayout>
  );
};
export const ReferralRequestsPage = () => {
  const { referralId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('All');
  const [page, setPage] = useState(1);
  const jobs = useGetOwnedOpportunitiesQuery(undefined, useFresh);
  const inbox = useGetReferrerInboxQuery(undefined, useFresh);
  const job = jobs.currentData?.find((j) => j.id === referralId);
  const rows = (inbox.currentData ?? []).filter(
    (r) => !referralId || r.request.referralId === referralId,
  );
  const filtered = rows.filter((r) => tab === 'All' || requestStatus(r.request.status) === tab);
  return (
    <ReferralLayout
      aside={
        <>
          {job && (
            <ReferralCard title="Job summary">
              <JobSummary job={job} />
              <Box mt={2}>
                <OpportunityCapacity job={job} />
              </Box>
            </ReferralCard>
          )}
          <ReferralTips review />
          <Impact />
          <Difference />
        </>
      }
    >
      <ReferralHero
        title={referralId ? 'Referral requests for job' : 'Referral requests'}
        subtitle={
          job
            ? `${job.jobTitle} · ${job.companyName}`
            : 'Review candidates and choose who you’re comfortable referring.'
        }
      />
      {job && (
        <ReferralCard>
          <JobSummary job={job} />
          <Box mt={1}>
            <ApprovalBadge value={job.approvalStatus} />
          </Box>
        </ReferralCard>
      )}
      {inbox.isLoading ? (
        <ReferralLoading />
      ) : inbox.error ? (
        <ReferralFailure error={inbox.error} retry={inbox.refetch} />
      ) : jobs.error ? (
        <ReferralFailure error={jobs.error} retry={jobs.refetch} />
      ) : referralId && jobs.isLoading ? (
        <ReferralLoading />
      ) : referralId && !job ? (
        <Alert severity="error">This referral opportunity is unavailable.</Alert>
      ) : (
        <>
          <ReferralCard>
            <Stack direction="row" gap={3} flexWrap="wrap" useFlexGap>
              {[
                ['Total requests', rows.length],
                ['Accepted', rows.filter((r) => r.request.acceptedAtUtc).length],
                ['Submitted', rows.filter((r) => r.request.referralSubmittedAtUtc).length],
                ['Confirmed', rows.filter((r) => r.request.candidateConfirmedAtUtc).length],
              ].map(([l, v]) => (
                <Box key={l}>
                  <Typography fontSize={22} fontWeight={750}>
                    {v}
                  </Typography>
                  <Typography fontSize={12} color="text.secondary">
                    {l}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </ReferralCard>
          <ReferralCard>
            <Tabs
              value={tab}
              variant="scrollable"
              scrollButtons="auto"
              onChange={(_, v: string) => {
                setTab(v);
                setPage(1);
              }}
            >
              {[
                'All',
                'Requested',
                'Accepted',
                'ReferralSubmitted',
                'CandidateConfirmed',
                'Rejected',
                'Expired',
              ].map((v) => (
                <Tab
                  key={v}
                  value={v}
                  label={v === 'All' ? 'All' : statusLabel(v as Parameters<typeof statusLabel>[0])}
                  sx={{ textTransform: 'none' }}
                />
              ))}
            </Tabs>
          </ReferralCard>
          {!filtered.length ? (
            <ReferralCard>
              <Typography fontWeight={750}>
                {rows.length ? 'No requests match this filter.' : 'No requests yet.'}
              </Typography>
              <Typography color="text.secondary" fontSize={13}>
                When candidates request a referral, they’ll appear here.
              </Typography>
            </ReferralCard>
          ) : (
            filtered
              .slice((page - 1) * 10, page * 10)
              .map((record) => (
                <RequestRow
                  key={record.request.id}
                  record={record}
                  onView={() => void navigate(requestPath(record.request.id))}
                />
              ))
          )}
          {filtered.length > 10 && (
            <Pagination
              count={Math.ceil(filtered.length / 10)}
              page={page}
              onChange={(_, v) => setPage(v)}
            />
          )}
        </>
      )}
    </ReferralLayout>
  );
};
const RequestRow = ({ record, onView }: { record: ReferrerRequestRecord; onView: () => void }) => (
  <ReferralCard>
    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2}>
      <CandidateSummary record={record} />
      <Stack alignItems={{ md: 'flex-end' }} gap={1}>
        <StatusBadge status={requestStatus(record.request.status)} />
        <Typography fontSize={11} color="text.secondary">
          Requested {dateLabel(record.request.requestedAtUtc)}
        </Typography>
        <Button variant="outlined" onClick={onView}>
          {requestStatus(record.request.status) === 'Accepted'
            ? 'Mark as referred'
            : 'View profile & resume'}{' '}
          →
        </Button>
        {requestStatus(record.request.status) === 'Requested' && (
          <PendingRequestActions id={record.request.id} onAccepted={onView} />
        )}
      </Stack>
    </Stack>
    {record.request.candidateMessage && (
      <Typography fontSize={13} color="text.secondary" mt={2} sx={{ whiteSpace: 'pre-wrap' }}>
        {record.request.candidateMessage}
      </Typography>
    )}
    {record.request.notReceivedAtUtc && (
      <Alert severity="info" sx={{ mt: 2 }}>
        Candidate reported that they haven’t received referral confirmation yet.
      </Alert>
    )}
  </ReferralCard>
);
