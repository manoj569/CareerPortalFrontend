import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  FormControl,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Skeleton,
  Snackbar,
  Tooltip,
} from '@mui/material';
import { useEffect, useState, type FormEvent } from 'react';

import { useAppSelector } from '@/hooks/reduxHooks';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { selectCurrentUser } from '@/features/auth/store/authSlice';
import {
  useExtractJobFromUrlMutation,
  useGetMyReferralsQuery,
  useGetReferralCategoryOptionsQuery,
  useSubmitJobReferralMutation,
} from '@/features/referrals/api/referralsApi';
import { useGetProfileQuery } from '@/features/dashboard/api/dashboardApi';
import { EmploymentType, ExperienceLevel, WorkplaceType } from '@/features/jobs/types/jobModels';

const emptyForm = {
  companyName: '',
  description: '',
  location: '',
  maximumSalary: '',
  minimumSalary: '',
  title: '',
  employmentType: '', workplaceType: '', experienceLevel: '', categoryId: '', newCategoryName: '', expiresAt: '', currencyCode: 'INR', applicationUrl: '',
};

const statusColor: Record<string, 'default' | 'success' | 'error' | 'warning'> = {
  Approved: 'success',
  Pending: 'warning',
  Rejected: 'error',
};

export const ReferAJobPage = () => {
  useDocumentMetadata('Refer a job | Career Portal', 'Refer a job to your network — free, one time.');

  const currentUser = useAppSelector(selectCurrentUser);
  const [url, setUrl] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [showLinkedIn, setShowLinkedIn] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [extractNote, setExtractNote] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [phone, setPhone] = useState('');
  const [referrerRole, setReferrerRole] = useState('');
  const [personalNote, setPersonalNote] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const [extractFromUrl, extractState] = useExtractJobFromUrlMutation();
  const [submitReferral, submitState] = useSubmitJobReferralMutation();
  const myReferrals = useGetMyReferralsQuery();
  const profile = useGetProfileQuery();
  const categories = useGetReferralCategoryOptionsQuery();
  useEffect(() => { if (currentUser?.email) setEmail(currentUser.email); }, [currentUser?.email]);
  useEffect(() => { if (profile.data?.linkedInUrl) setLinkedinUrl(profile.data.linkedInUrl); }, [profile.data?.linkedInUrl]);

  const update = (key: keyof typeof emptyForm, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const handleExtract = async () => {
    if (!url.trim()) return;
    setExtractNote(null);
    const result = await extractFromUrl(url.trim()).unwrap().catch((error: { data?: { failureReason?: string }; message?: string }) => { const reason = error?.data?.failureReason ?? error?.message ?? 'Could not extract details. Please fill the form manually.'; setExtractNote(reason); setToast(reason); return null; });
    if (!result || !result.succeeded) {
      setExtractNote(result?.failureReason ?? 'Could not extract details. Please fill the form manually.');
      setToast(result?.failureReason ?? 'Could not extract details. Please fill the form manually.');
      return;
    }
    setForm({
      companyName: result.companyName ?? '',
      description: result.description ?? '',
      location: result.location ?? '',
      maximumSalary: result.maximumSalary != null ? String(result.maximumSalary) : '',
      minimumSalary: result.minimumSalary != null ? String(result.minimumSalary) : '',
      title: result.title ?? '',
      employmentType: '', workplaceType: '', experienceLevel: '', categoryId: '', newCategoryName: '', expiresAt: '', currencyCode: 'INR', applicationUrl: url.trim(),
    });
    setToast('Job details imported!');
  };

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setSubmitError(null);
    const requiredFields: Array<[keyof typeof form, string]> = [
      ['title', 'title'],
      ['companyName', 'company'],
      ['employmentType', 'employment type'],
      ['workplaceType', 'workplace type'],
      ['experienceLevel', 'experience level'],
      ['expiresAt', 'expiration date'],
    ];
    // Select controls can be hydrated with non-string enum values; normalize before trimming.
    const missing = requiredFields
      .filter(([key]) => String(form[key] ?? '').trim() === '')
      .map(([, label]) => label);
    const categoryId = String(form.categoryId ?? '').trim();
    const newCategoryName = String(form.newCategoryName ?? '').trim();
    if ((!categoryId || categoryId === '__new') && !newCategoryName) missing.push('category');
    if (!String(form.applicationUrl ?? '').trim() && !String(form.description ?? '').trim() && !url.trim()) missing.push('description');
    if (showLinkedIn && linkedinUrl.trim() && !linkedinUrl.trim().startsWith('https://')) missing.push('LinkedIn URL');
    if (showEmail && (!/^\S+@\S+\.\S+$/.test(email.trim()))) missing.push('contact email');
    if (missing.length || (form.expiresAt && new Date(`${form.expiresAt}T00:00:00`).getTime() <= Date.now())) {
      const message = missing.length ? `Please complete required fields: ${missing.join(', ')}.` : 'Expiration date must be in the future.';
      setSubmitError(message);
      setToast(message);
      return;
    }
    if (!showLinkedIn && !showEmail && !showPhone) {
      const message = 'Choose at least one contact field to share with job seekers.';
      setSubmitError(message);
      setToast(message);
      return;
    }

    const payload = {
      jobDetails: {
        category: categoryId && categoryId !== '__new' ? { existingId: categoryId, new: null } : { existingId: null, new: { name: newCategoryName, slug: newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), description: '', displayOrder: 0 } },
        company: { new: { name: form.companyName.trim() } },
        job: {
          description: form.description.trim() || undefined,
          location: form.location.trim() || undefined,
          maximumSalary: form.maximumSalary ? Number(form.maximumSalary) : undefined,
          minimumSalary: form.minimumSalary ? Number(form.minimumSalary) : undefined,
          title: form.title.trim(),
          employmentType: form.employmentType || null, workplaceType: form.workplaceType || null, experienceLevel: form.experienceLevel || null,
          currencyCode: form.currencyCode, applicationUrl: form.applicationUrl.trim() || null, expiresAtUtc: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59Z`).toISOString() : null,
        },
        recruiterContact: { showLinkedIn, showEmail, showPhone, overrideLinkedInUrl: showLinkedIn ? linkedinUrl.trim() || null : null, overrideEmail: showEmail ? email.trim() || null : null, overridePhoneNumber: showPhone ? phone.trim() || null : null, referrerRole: referrerRole.trim() || null, personalNote: personalNote.trim() || null },
      },
      showEmail,
      showLinkedIn,
      showPhone,
      sourceUrl: url.trim() || undefined,
      overrideLinkedInUrl: showLinkedIn ? linkedinUrl.trim() || null : null,
      overrideEmail: showEmail ? email.trim() || null : null,
      overridePhoneNumber: showPhone ? phone.trim() || null : null,
      referrerRole: referrerRole.trim() || null, personalNote: personalNote.trim() || null,
    };
    console.log('Submitting payload:', payload);
    let result: unknown = null;
    try {
      result = await submitReferral(payload).unwrap();
    } catch (error) {
      const typedError = error as { message?: string };
      setSubmitError(typedError.message ?? 'Could not submit your referral. Please try again.');
    }

    if (result) {
      setSubmitted(true);
      setForm(emptyForm);
      setUrl('');
      setToast('Referral submitted for approval.');
    }
  };

  return (
    <Box>
      <Typography component="h1" fontWeight={700} variant="h4">
        Refer a job
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }} variant="body1">
        Free for you. Job seekers pay to unlock your contact details — you choose exactly what to share.
      </Typography>

      {submitted ? (
        <Alert onClose={() => setSubmitted(false)} severity="success" sx={{ mb: 3 }}>
          Referral submitted — it'll go live once an admin approves it.
        </Alert>
      ) : null}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper component="form" noValidate onSubmit={(event) => void handleSubmit(event)} sx={{ p: 3 }} variant="outlined">
            <Stack spacing={2.5}>
              <Stack spacing={1}>
                <Typography fontWeight={700} variant="subtitle1">
                  1. Paste the job link (optional)
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    fullWidth
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://company.com/careers/frontend-developer"
                    size="small"
                    value={url}
                  />
                  <Button
                    disabled={!url.trim() || extractState.isLoading}
                    onClick={() => void handleExtract()}
                    startIcon={<AutoAwesomeOutlinedIcon />}
                    sx={{ whiteSpace: 'nowrap' }}
                    variant="outlined"
                  >
                    {extractState.isLoading ? 'Fetching…' : 'Fetch details'}
                  </Button>
                </Stack>
                {extractNote ? <Alert severity="info">{extractNote}</Alert> : null}
              </Stack>

              <Divider />

              <Typography fontWeight={700} variant="subtitle1">
                2. Review job details
              </Typography>

              <TextField
                label="Job title"
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                required
                value={form.title}
              />
              <TextField
                label="Company name"
                onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))}
                required
                value={form.companyName}
              />
              <FormControl fullWidth><TextField label="Employment type" onChange={(event) => update('employmentType', event.target.value)} required select value={form.employmentType}>{[[EmploymentType.FullTime,'Full-time'],[EmploymentType.PartTime,'Part-time'],[EmploymentType.Contract,'Contract'],[EmploymentType.Internship,'Internship']].map(([value,label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField></FormControl>
              <FormControl fullWidth><TextField label="Workplace type" onChange={(event) => update('workplaceType', event.target.value)} required select value={form.workplaceType}>{[[WorkplaceType.Remote,'Remote'],[WorkplaceType.Hybrid,'Hybrid'],[WorkplaceType.OnSite,'On-site']].map(([value,label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField></FormControl>
              <FormControl fullWidth><TextField label="Experience level" onChange={(event) => update('experienceLevel', event.target.value)} required select value={form.experienceLevel}>{[[ExperienceLevel.Entry,'Entry'],[ExperienceLevel.Mid,'Mid'],[ExperienceLevel.Senior,'Senior']].map(([value,label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField></FormControl>
              <FormControl fullWidth><TextField disabled={categories.isLoading} label="Category" onChange={(event) => update('categoryId', event.target.value)} required select value={form.categoryId}>{<MenuItem value="">{categories.isLoading ? 'Loading categories…' : 'Select a category'}</MenuItem>}{(categories.data ?? []).map((category) => <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>)}<MenuItem value="__new">New category…</MenuItem></TextField>{categories.isError ? <Alert action={<Button color="inherit" onClick={() => void categories.refetch()}>Retry</Button>} severity="warning" sx={{ mt: 1 }}>Categories could not be loaded. You can create a new category.</Alert> : null}</FormControl>
              {form.categoryId === '__new' ? <TextField label="New category name" onChange={(event) => update('newCategoryName', event.target.value)} required value={form.newCategoryName} /> : null}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><TextField fullWidth label="Expiration date" onChange={(event) => update('expiresAt', event.target.value)} required type="date" InputLabelProps={{ shrink: true }} value={form.expiresAt} /><TextField fullWidth label="Currency" onChange={(event) => update('currencyCode', event.target.value)} select value={form.currencyCode}>{['INR','USD','EUR','GBP','AUD','CAD','SGD'].map((code) => <MenuItem key={code} value={code}>{code}</MenuItem>)}</TextField></Stack>
              <TextField
                label="Location"
                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                value={form.location}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="Minimum salary"
                  onChange={(event) => setForm((current) => ({ ...current, minimumSalary: event.target.value }))}
                  type="number"
                  value={form.minimumSalary}
                />
                <TextField
                  fullWidth
                  label="Maximum salary"
                  onChange={(event) => setForm((current) => ({ ...current, maximumSalary: event.target.value }))}
                  type="number"
                  value={form.maximumSalary}
                />
              </Stack>
              <TextField
                label="Description"
                minRows={4}
                multiline
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                value={form.description}
                helperText={url.trim() ? 'Optional because a job URL was fetched.' : 'Required when submitting without a fetched job URL.'}
              />
              <TextField label="Application URL" onChange={(event) => update('applicationUrl', event.target.value)} placeholder="https://company.com/apply" type="url" value={form.applicationUrl} />

              <Divider />

              <Typography fontWeight={700} variant="subtitle1">
                3. Choose what to share
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Only paying subscribers can see this, and only for this job.
              </Typography>
              <Stack spacing={1.5}>{[[showLinkedIn,setShowLinkedIn,'LinkedIn'],[showEmail,setShowEmail,'Email'],[showPhone,setShowPhone,'Phone']].map(([checked,setter,label]) => <Paper key={label as string} sx={{ p: 1.5 }} variant="outlined"><Stack direction="row" alignItems="center"><FormControlLabel control={<Checkbox checked={checked as boolean} onChange={(_, value) => (setter as (value: boolean) => void)(value)} />} label={label as string} />{label === 'LinkedIn' ? <Tooltip title="Sharing your LinkedIn lets the applicant see your profile and know you're a real person."><InfoOutlinedIcon fontSize="small" /></Tooltip> : null}{label === 'Email' ? <Tooltip title="Sharing your email allows candidates to reach out to you directly for a referral."><InfoOutlinedIcon fontSize="small" /></Tooltip> : null}</Stack>{checked && label === 'LinkedIn' ? <TextField fullWidth label="LinkedIn Profile URL" onChange={(event) => setLinkedinUrl(event.target.value)} placeholder="https://www.linkedin.com/in/your-profile" value={linkedinUrl} /> : null}{checked && label === 'Email' ? <TextField fullWidth label="Contact email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} /> : null}{checked && label === 'Phone' ? <TextField fullWidth label="Phone Number" onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" value={phone} /> : null}</Paper>)}</Stack>
              <TextField label="Your role at this company" onChange={(event) => setReferrerRole(event.target.value)} placeholder="Senior Software Engineer" value={referrerRole} />
              <TextField label="Personal note (optional)" minRows={3} multiline onChange={(event) => setPersonalNote(event.target.value)} placeholder="Happy to refer you if your React and .NET skills are strong!" value={personalNote} />

              {submitError ? <Alert severity="error">{submitError}</Alert> : null}

              <Button
                disabled={submitState.isLoading}
                size="large"
                type="submit"
                variant="contained"
              >
                {submitState.isLoading ? 'Submitting…' : 'Submit for approval'}
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3 }} variant="outlined">
            <Typography fontWeight={700} sx={{ mb: 2 }} variant="subtitle1">
              Your submissions
            </Typography>
            {myReferrals.isLoading ? (
              <Stack spacing={1}><Skeleton height={28} variant="rounded" /><Skeleton height={28} variant="rounded" /><Skeleton height={28} variant="rounded" /></Stack>
            ) : !myReferrals.data?.length ? (
              <Typography color="text.secondary" variant="body2">
                No referrals yet. Paste a link above to submit your first job!
              </Typography>
            ) : (
              <Stack divider={<Divider />} spacing={1.5}>
                {myReferrals.data.map((referral) => (
                  <Stack key={referral.id} spacing={0.5}>
                    <Stack alignItems="center" direction="row" justifyContent="space-between">
                      <Typography fontWeight={600} variant="body2">
                        {referral.jobTitle}
                      </Typography>
                      <Chip
                        color={statusColor[referral.approvalStatus] ?? 'default'}
                        label={referral.approvalStatus}
                        size="small"
                      />
                    </Stack>
                    {referral.rejectionReason ? (
                      <Typography color="error.main" variant="caption">
                        {referral.rejectionReason}
                      </Typography>
                    ) : null}
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
      <Snackbar autoHideDuration={4000} message={toast} onClose={() => setToast(null)} open={Boolean(toast)} />
    </Box>
  );
};
