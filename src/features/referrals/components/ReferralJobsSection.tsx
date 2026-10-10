import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  useCreateReferralRequestMutation,
  useGetCandidateActivityQuery,
  useGetReferralCatalogueQuery,
  useGetReferralSavedJobsQuery,
} from '../api/marketplaceApi';
import {
  useGetProfileQuery,
  useGetResumeStatusQuery,
  useSaveJobMutation,
  useRemoveSavedJobMutation,
} from '@/features/dashboard/api/dashboardApi';
import type { PublicReferralJob } from '../types/referralModels';
import type { ReferralRequestRecord } from '../types/marketplaceModels';
import { dateLabel, referralError, statusLabel } from '../types/marketplaceModels';
import { useAppSelector } from '@/hooks/reduxHooks';
import { selectCurrentUser } from '@/features/auth/store/authSlice';
import { ROUTES } from '@/constants/routes';
import {
  ReferralCard,
  ReferralFailure,
  ReferralHero,
  ReferralLayout,
  ReferralLoading,
} from './MarketplaceUI';
import {
  CandidateHowItWorks,
  CandidateJobSummary,
  CandidateQuotaCard,
} from './CandidateReferralUI';
import { ReferralJobCard } from './ReferralJobCard';
import { getEmploymentTypeLabel } from '@/features/jobs/constants/jobOptions';

export const ReferralJobsSection = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    experience: '',
    employment: '',
    company: '',
  });
  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      location: '',
      experience: '',
      employment: '',
      company: '',
    });
    setPage(1);
  };
  const [selected, setSelected] = useState<PublicReferralJob | null>(null);
  const [sent, setSent] = useState<{
    job: PublicReferralJob;
    request: ReferralRequestRecord;
  } | null>(null);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const submitting = useRef(false);
  const query = useGetReferralCatalogueQuery(undefined, { refetchOnMountOrArgChange: true });
  const activity = useGetCandidateActivityQuery(undefined, {
    skip: !user,
    refetchOnMountOrArgChange: true,
    pollingInterval: 60000,
  });
  const saved = useGetReferralSavedJobsQuery(undefined, {
    skip: !user,
    refetchOnMountOrArgChange: true,
  });
  const profile = useGetProfileQuery(undefined, { skip: !selected });
  const resume = useGetResumeStatusQuery(undefined, { skip: !selected });
  const [create, state] = useCreateReferralRequestMutation();
  const [save, saveState] = useSaveJobMutation();
  const [remove, removeState] = useRemoveSavedJobMutation();
  const requestsByReferral = useMemo(
    () => new Map(activity.currentData?.items.map((r) => [r.referralId, r])),
    [activity.currentData?.items],
  );
  const existing = (job: PublicReferralJob) => requestsByReferral.get(job.referralId!);
  const quota = activity.currentData?.quota;
  const unavailable = !quota || !quota.hasActiveAccess || quota.remainingConnections <= 0;
  const request = async () => {
    if (
      !selected?.referralId ||
      state.isLoading ||
      submitting.current ||
      !consent ||
      unavailable ||
      existing(selected) ||
      message.trim().length > 2000 ||
      selected.remainingReferralSlots === 0
    )
      return;
    submitting.current = true;
    setError('');
    try {
      const result = await create({
        referralId: selected.referralId,
        candidateMessage: message,
      }).unwrap();
      setSent({ job: selected, request: result });
      setSelected(null);
    } catch (e) {
      setError(referralError(e));
      void query.refetch();
      void activity.refetch();
    } finally {
      submitting.current = false;
    }
  };
  const saveJob = async (job: PublicReferralJob) => {
    if (!user) {
      void navigate(ROUTES.LOGIN);
      return;
    }
    if (saveState.isLoading || removeState.isLoading || !saved.currentData) return;
    setSaveError('');
    try {
      await (
        saved.currentData.some((item) => item.jobId === job.jobId)
          ? remove(job.jobId)
          : save(job.jobId)
      ).unwrap();
      void saved.refetch();
    } catch (e) {
      setSaveError(referralError(e));
    }
  };
  const jobs = query.currentData ?? [];
  const visible = useMemo(
    () =>
      (query.currentData ?? []).filter((job) => {
        const text = [job.jobTitle, job.companyName, ...(job.skills ?? [])].join(' ').toLowerCase();
        const years = filters.experience === '' ? null : Number(filters.experience);
        return (
          text.includes(filters.search.trim().toLowerCase()) &&
          (!filters.category || job.categoryName === filters.category) &&
          (!filters.location || job.location === filters.location) &&
          (!filters.company || job.companyName === filters.company) &&
          (!filters.employment || String(job.employmentType) === filters.employment) &&
          (years == null ||
            ((job.minimumExperienceYears ?? Infinity) <= years &&
              (job.maximumExperienceYears ?? Infinity) >= years))
        );
      }),
    [query.currentData, filters],
  );
  const update = (key: keyof typeof filters, value: string) => {
    setFilters((v) => ({ ...v, [key]: value }));
    setPage(1);
  };
  const openRequest = (job: PublicReferralJob) => {
    if (!user) {
      void navigate(ROUTES.LOGIN, { state: { from: `${ROUTES.DASHBOARD_JOBS}?mode=referral` } });
      return;
    }
    setSelected(job);
    setMessage('');
    setConsent(false);
    setError('');
  };
  const viewRequest = (id: string) =>
    void navigate(`/dashboard/my-referral-requests/${encodeURIComponent(id)}`);
  return (
    <>
      <ReferralLayout
        aside={
          <>
            {quota && <CandidateQuotaCard quota={quota} />}
            <ReferralCard title="Referral Access">
              <Typography fontSize={13}>
                Eligibility and accepted-connection limits come from your current access period.
                Direct application quotas are separate.
              </Typography>
              <Button
                onClick={() => void navigate(`${ROUTES.MEMBERSHIP}?plan=ReferralContactAccess`)}
              >
                Manage Referral Access →
              </Button>
            </ReferralCard>
            <CandidateHowItWorks />
            <ReferralCard title="Tips for requesting a referral" tint="#fffaf0">
              <Stack gap={1}>
                {[
                  'Keep your profile and resume updated',
                  'Write a short, relevant message',
                  'Request roles that match your skills',
                  'Check actual updates in My Referral Requests',
                  'Acknowledge receipt only when you receive company instructions',
                ].map((tip) => (
                  <Typography key={tip} fontSize={12}>
                    ✓ {tip}
                  </Typography>
                ))}
              </Stack>
            </ReferralCard>
          </>
        }
      >
        <ReferralHero
          title="Get Referred. Get Noticed."
          subtitle="Discover employee referral opportunities and track your requests in CareerHarbor."
        />
        <ReferralCard>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            gap={1}
            useFlexGap
            flexWrap="wrap"
          >
            <Typography fontWeight={750}>
              Find Referral Jobs {query.currentData ? `(${jobs.length})` : ''}
            </Typography>
            <Typography fontSize={12}>Sort: Newest</Typography>
            <Button onClick={() => void navigate('/dashboard/my-referral-requests')}>
              My Requests
            </Button>
          </Stack>
          <Stack direction="row" useFlexGap flexWrap="wrap" gap={1} mt={2}>
            <TextField
              size="small"
              label="Search job title, company or skills"
              value={filters.search}
              onChange={(e) => update('search', e.target.value)}
              sx={{ flex: '1 1 260px' }}
            />
            {(['category', 'location', 'employment', 'company'] as const).map((key) => {
              const options = [
                ...new Set(
                  jobs
                    .map((j) =>
                      key === 'category'
                        ? j.categoryName
                        : key === 'location'
                          ? j.location
                          : key === 'company'
                            ? j.companyName
                            : j.employmentType == null
                              ? null
                              : String(j.employmentType),
                    )
                    .filter((v): v is string => !!v),
                ),
              ].sort();
              return (
                <TextField
                  key={key}
                  size="small"
                  select
                  label={key === 'employment' ? 'Job type' : key[0]!.toUpperCase() + key.slice(1)}
                  value={filters[key]}
                  onChange={(e) => update(key, e.target.value)}
                  sx={{ minWidth: 120, flex: '1 1 120px' }}
                >
                  <MenuItem value="">All</MenuItem>
                  {options.map((v) => (
                    <MenuItem key={v} value={v}>
                      {key === 'employment' ? getEmploymentTypeLabel(Number(v)) : v}
                    </MenuItem>
                  ))}
                </TextField>
              );
            })}
            <TextField
              size="small"
              label="Experience (years)"
              type="number"
              value={filters.experience}
              onChange={(e) => update('experience', e.target.value)}
              slotProps={{ htmlInput: { min: 0 } }}
              sx={{ width: 160 }}
            />
            <Button onClick={clearFilters}>Clear Filters</Button>
          </Stack>
          {jobs.some((j) => !j.categoryName) && (
            <Typography fontSize={11} mt={1}>
              Category metadata is unavailable for some opportunities; category filters include only
              known matches.
            </Typography>
          )}
        </ReferralCard>
        {user && activity.error && (
          <ReferralFailure error={activity.error} retry={activity.refetch} />
        )}
        {saved.error && <ReferralFailure error={saved.error} retry={saved.refetch} />}
        {saveError && <Alert severity="error">{saveError}</Alert>}
        {query.isFetching ? (
          <ReferralLoading />
        ) : query.error ? (
          <ReferralFailure error={query.error} retry={query.refetch} />
        ) : query.currentData && !visible.length ? (
          <ReferralCard>
            <Typography>No matching referral jobs found.</Typography>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </ReferralCard>
        ) : query.currentData ? (
          visible.slice((page - 1) * 5, page * 5).map((job) => (
            <ReferralJobCard
              key={job.referralId}
              job={job}
              onSeeDetails={openRequest}
              request={existing(job)}
              onViewRequest={() => {
                const r = existing(job);
                if (r) viewRequest(r.id);
              }}
              busy={!!user && (!activity.currentData || !!activity.error)}
              onSave={() => void saveJob(job)}
              saved={saved.currentData?.some((item) => item.jobId === job.jobId)}
            />
          ))
        ) : null}
        {visible.length > 5 && (
          <Pagination
            count={Math.ceil(visible.length / 5)}
            page={page}
            onChange={(_, v) => setPage(v)}
          />
        )}
      </ReferralLayout>
      <Dialog
        fullWidth
        maxWidth="md"
        open={!!selected}
        onClose={() => {
          if (!state.isLoading) setSelected(null);
        }}
        aria-labelledby="request-dialog-title"
      >
        <DialogTitle id="request-dialog-title">Request Referral</DialogTitle>
        <DialogContent>
          <ReferralLayout
            aside={
              <>
                <ReferralCard title="Referral slots available" tint="#edfcf5">
                  <Typography fontSize={25} fontWeight={800}>
                    {selected?.remainingReferralSlots ?? 'Unavailable'}
                    {selected?.referralSlots != null ? ` / ${selected.referralSlots}` : ''}
                  </Typography>
                  <Typography fontSize={12}>
                    Slots count accepted connections, not requests.
                  </Typography>
                </ReferralCard>
                {quota && <CandidateQuotaCard quota={quota} />}
                <CandidateHowItWorks />
              </>
            }
          >
            {selected && (
              <ReferralCard>
                <CandidateJobSummary job={selected} />
              </ReferralCard>
            )}
            <ReferralCard title="Your profile">
              {profile.isFetching ? (
                <ReferralLoading />
              ) : profile.error ? (
                <ReferralFailure error={profile.error} retry={profile.refetch} />
              ) : (
                <>
                  <Typography fontWeight={750}>
                    {profile.data?.firstName} {profile.data?.lastName}
                  </Typography>
                  <Typography fontSize={12}>{profile.data?.email}</Typography>
                </>
              )}
              <Button onClick={() => void navigate(ROUTES.PROFILE)}>Review profile →</Button>
              <Typography fontSize={12}>
                Resume:{' '}
                {resume.isFetching
                  ? 'Checking…'
                  : resume.error
                    ? 'Status unavailable'
                    : resume.data?.hasResume
                      ? (profile.data?.resume?.fileName ?? 'Uploaded')
                      : 'Not uploaded'}
              </Typography>
              <Typography fontSize={11} color="text.secondary">
                A resume is recommended. The current referral request policy does not require one.
              </Typography>
            </ReferralCard>
            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Message to the referrer (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 2000 } }}
              helperText={`${message.length}/2000`}
            />
            <FormControlLabel
              control={
                <Checkbox checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              }
              label="I consent to sharing my profile and available resume with the employee for this referral request."
            />
            {unavailable && (
              <Alert severity="info">
                {!quota
                  ? 'Checking referral eligibility…'
                  : !quota.hasActiveAccess
                    ? 'Active Referral Access is required to send this request.'
                    : 'Your accepted-connection quota is exhausted for this access period.'}
                <Button
                  onClick={() => void navigate(`${ROUTES.MEMBERSHIP}?plan=ReferralContactAccess`)}
                >
                  Manage access
                </Button>
              </Alert>
            )}
            {error && <Alert severity="error">{error}</Alert>}
          </ReferralLayout>
        </DialogContent>
        <DialogActions>
          <Button disabled={state.isLoading} onClick={() => setSelected(null)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={
              state.isLoading ||
              !consent ||
              unavailable ||
              !!activity.error ||
              !selected?.referralId ||
              selected.referralAvailable === false ||
              selected.remainingReferralSlots === 0 ||
              !!(selected && existing(selected))
            }
            onClick={() => void request()}
          >
            {state.isLoading ? 'Requesting…' : 'Send referral request →'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={!!sent}
        onClose={() => setSent(null)}
        aria-labelledby="referral-sent-title"
      >
        <DialogTitle id="referral-sent-title" sx={{ textAlign: 'center', pt: 4 }}>
          ✓ Referral request sent!
        </DialogTitle>
        <DialogContent>
          <Stack gap={2}>
            <Typography textAlign="center">
              Your request was recorded. The employee has not yet accepted or reported submitting
              this referral.
            </Typography>
            {sent && (
              <>
                <ReferralCard>
                  <CandidateJobSummary job={sent.job} />
                </ReferralCard>
                <Typography fontSize={13}>
                  Requested {dateLabel(sent.request.requestedAtUtc)} ·{' '}
                  {statusLabel(sent.request.status)}
                </Typography>
              </>
            )}
            <CandidateHowItWorks />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSent(null)}>View Referral Jobs</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (sent) void navigate('/dashboard/my-referral-requests');
            }}
          >
            View My Request
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
