import { EmploymentType } from '@/features/jobs/types/jobModels';
import { employmentTypeOptions } from '@/features/jobs/constants/jobOptions';
import { ReferralSkillsInput } from '@/features/referrals/components/ReferralSkillsInput';
import { referralSubmissionError } from '@/features/referrals/utils/referralSubmissionError';
import { ReferralUnsavedChanges } from '@/features/referrals/components/ReferralUnsavedChanges';
import { ReferralStepper } from '@/features/referrals/components/ReferralStepper';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import {
  useExtractJobFromUrlMutation,
  useGetReferralCategoryOptionsQuery,
  useSubmitJobReferralMutation,
} from '@/features/referrals/api/referralsApi';
import {
  Difference,
  Impact,
  JobSummary,
  ReferralCard,
  ReferralHero,
  ReferralLayout,
  ReferralTips,
} from '@/features/referrals/components/MarketplaceUI';
import { referralError, validSlots } from '@/features/referrals/types/marketplaceModels';
import { ROUTES } from '@/constants/routes';
const initial = {
  title: '',
  companyName: '',
  employmentType: EmploymentType.FullTime,
  skills: [] as string[],
  minimumExperienceYears: '',
  maximumExperienceYears: '',
  categoryId: '',
  location: '',
  applicationUrl: '',
  description: '',
};
export const ReferAJobPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [validation, setValidation] = useState<Record<string, string>>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const formElement = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (Object.keys(validation).length)
      formElement.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [validation]);
  const allowLeave = useRef(false);
  useEffect(() => {
    heading.current?.focus();
  }, [step]);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const [source, setSource] = useState('');
  const [slots, setSlots] = useState(5);
  const [sharing, setSharing] = useState({
    showLinkedIn: true,
    showEmail: false,
    showPhone: false,
  });
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!allowLeave.current && (dirty || Boolean(source) || slots !== 5 || step > 0)) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, source, slots, step]);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const guard = useRef(false);
  const categories = useGetReferralCategoryOptionsQuery();
  const [extract, extractState] = useExtractJobFromUrlMutation();
  const [submit, submitState] = useSubmitJobReferralMutation();
  const busy = submitting || submitState.isLoading;
  const update = (key: Exclude<keyof typeof initial, 'employmentType' | 'skills'>, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));
  const skills = form.skills;
  const field = (
    key: Exclude<keyof typeof initial, 'employmentType' | 'skills'>,
    label: string,
    required = false,
    type = 'text',
  ) => (
    <TextField
      size="small"
      fullWidth
      required={required}
      label={label}
      type={type}
      error={Boolean(validation[key])}
      helperText={validation[key]}
      value={form[key]}
      onChange={(e) => update(key, e.target.value)}
      slotProps={type === 'number' ? { htmlInput: { min: 0, max: 50 } } : undefined}
    />
  );
  const fetchDetails = async () => {
    setError('');
    setNote('');
    try {
      const result = await extract(source).unwrap();
      if (!result.succeeded) {
        setError(result.failureReason || 'Unable to extract details. Fill the form manually.');
        return;
      }
      setForm((f) => ({
        ...f,
        title: result.title ?? f.title,
        companyName: result.companyName ?? f.companyName,
        location: result.location ?? f.location,
        description: result.description ?? f.description,
        applicationUrl: source,
        minimumExperienceYears:
          result.minimumExperienceYears?.toString() ?? f.minimumExperienceYears,
        maximumExperienceYears:
          result.maximumExperienceYears?.toString() ?? f.maximumExperienceYears,
      }));
      setNote('Job details imported. Review them before submitting.');
    } catch (e) {
      setError(referralError(e));
    }
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (guard.current || extractState.isLoading) return;
    const errors: Record<string, string> = {};
    if (step === 0 || step === 2) {
      for (const key of ['title', 'companyName', 'description', 'categoryId'] as const) {
        if (!form[key].trim()) errors[key] = 'This field is required.';
      }
      for (const key of ['minimumExperienceYears', 'maximumExperienceYears'] as const) {
        if (
          !form[key].trim() ||
          !Number.isInteger(Number(form[key])) ||
          Number(form[key]) < 0 ||
          Number(form[key]) > 50
        )
          errors[key] = 'Enter a whole number between 0 and 50 years.';
      }
      if (Number(form.maximumExperienceYears) < Number(form.minimumExperienceYears))
        errors.maximumExperienceYears =
          'Maximum experience cannot be less than minimum experience.';
      if (!skills.length) errors.skills = 'Add at least one skill.';
      for (const [key, value] of [
        ['source', source],
        ['applicationUrl', form.applicationUrl],
      ] as const) {
        if (value.trim()) {
          try {
            const url = new URL(value);
            if (!['https:', 'http:'].includes(url.protocol)) throw new Error();
          } catch {
            errors[key] = 'Enter a valid HTTP or HTTPS URL.';
          }
        }
      }
    }
    if (!employmentTypeOptions.some((option) => option.value === form.employmentType))
      errors.employmentType = 'Select an employment type.';
    setValidation(errors);
    if (Object.keys(errors).length) {
      if (step === 2) setStep(0);
      setError('Please correct the highlighted job details.');
      return;
    }
    if (step === 0) {
      setError('');
      setStep(1);
      return;
    }
    setError('');
    if (!validSlots(slots)) {
      setError('Referral slots must be a whole number between 1 and 1000.');
      return;
    }
    if (Number(form.maximumExperienceYears) < Number(form.minimumExperienceYears)) {
      setError('Maximum experience cannot be less than minimum experience.');
      return;
    }
    if (!skills.length) {
      setError('Add at least one skill.');
      return;
    }
    if (!Object.values(sharing).some(Boolean)) {
      setError('Select at least one contact method for accepted candidates.');
      return;
    }
    if (step === 1) {
      setStep(2);
      return;
    }
    guard.current = true;
    setSubmitting(true);
    try {
      const result = await submit({
        jobDetails: {
          job: {
            title: form.title.trim(),
            description: form.description.trim(),
            applicationUrl: form.applicationUrl || null,
            employmentType: form.employmentType,
            minimumExperienceYears: Number(form.minimumExperienceYears),
            maximumExperienceYears: Number(form.maximumExperienceYears),
            location: form.location || null,
            skills,
          },
          company: { new: { name: form.companyName.trim() } },
          category: { existingId: form.categoryId },
        },
        sourceUrl: source || null,
        ...sharing,
        referralSlots: slots,
      }).unwrap();
      allowLeave.current = true;
      void navigate(`/dashboard/referrals/${encodeURIComponent(result.id)}/submitted`, {
        state: { submission: result },
      });
    } catch (e) {
      setError(referralSubmissionError(e));
    } finally {
      guard.current = false;
      setSubmitting(false);
    }
  };
  return (
    <ReferralLayout
      aside={
        <>
          <Impact tiles />
          <ReferralCard title="Candidate view preview" tint="#f6faff">
            <Typography fontSize={12} color="text.secondary" mb={2}>
              Your identity and contact details stay private until you accept a request.
            </Typography>
            <JobSummary
              job={{
                jobTitle: form.title || 'Job title',
                companyName: form.companyName || 'Company',
                location: form.location,
              }}
            />
            <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap mt={2}>
              {skills.map((s) => (
                <Chip key={s} size="small" label={s} />
              ))}
            </Stack>
            <Chip
              size="small"
              label="Employee Referrer available"
              sx={{ mt: 2, bgcolor: '#e1f8eb', color: '#11803b' }}
            />
            <Typography fontSize={12} color="primary" mt={1}>
              {validSlots(slots) ? slots : '—'} referral slots
            </Typography>
          </ReferralCard>
          <ReferralTips />
          <Difference />
        </>
      }
    >
      <ReferralUnsavedChanges
        dirty={
          dirty ||
          Boolean(source) ||
          slots !== 5 ||
          !sharing.showLinkedIn ||
          sharing.showEmail ||
          sharing.showPhone
        }
        allowLeave={allowLeave}
        busy={busy}
      />
      <ReferralHero
        trust
        title="Share a Job"
        subtitle="Help qualified candidates discover openings at your company and request a referral from you."
      />
      <ReferralCard>
        <ReferralStepper
          steps={[
            ['Job Details', 'Basic information about the job'],
            ['Referral Preferences', 'Set slots and contact options'],
            ['Review & Submit', 'Review before sending for approval'],
          ]}
          active={step}
        />
      </ReferralCard>
      <Box
        component="form"
        ref={formElement}
        noValidate
        onSubmit={(e) => void handleSubmit(e)}
        sx={{
          '& .MuiInputLabel-root': {
            position: 'static',
            transform: 'none',
            fontSize: 12,
            fontWeight: 700,
            color: '#27344b',
            mb: 0.5,
            maxWidth: '100%',
          },
          '& .MuiOutlinedInput-notchedOutline legend': { display: 'none' },
          '& .MuiOutlinedInput-root': {
            bgcolor: '#fff',
            fontSize: 13,
            minHeight: { xs: 44, sm: 34 },
            borderRadius: 1,
          },
          '& .MuiInputBase-input': { py: { xs: 1.25, sm: 0.8 } },
          '& .MuiInputBase-inputMultiline': { py: 0 },
          '& .MuiButton-root': { fontSize: 12 },
        }}
      >
        <Stack gap={2}>
          <Typography ref={heading} component="h2" tabIndex={-1} fontSize={18} fontWeight={700}>
            Step {step + 1} of 3 —{' '}
            {['Job Details', 'Referral Preferences', 'Review & Submit'][step]}
          </Typography>
          {step === 0 && (
            <ReferralCard title="Job details">
              <Typography fontSize={12} color="text.secondary" mb={2}>
                Add accurate details to help relevant candidates find this opportunity.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} mb={2}>
                <TextField
                  size="small"
                  fullWidth
                  label="Paste the job link (optional)"
                  type="url"
                  error={Boolean(validation.source)}
                  helperText={validation.source}
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />
                <Button
                  variant="outlined"
                  disabled={!source.trim() || extractState.isLoading || busy}
                  onClick={() => void fetchDetails()}
                  sx={{ minWidth: 185 }}
                >
                  {extractState.isLoading ? 'Fetching…' : 'Fetch details from link'}
                </Button>
              </Stack>
              {note && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  {note}
                </Alert>
              )}
              <Box
                sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}
              >
                {field('title', 'Job title', true)}
                {field('companyName', 'Company name', true)}
                <TextField
                  select
                  size="small"
                  label="Employment type"
                  error={Boolean(validation.employmentType)}
                  helperText={validation.employmentType}
                  value={form.employmentType}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      employmentType: Number(e.target.value),
                    }))
                  }
                  required
                >
                  {employmentTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label.replace(' time', '-time')}
                    </MenuItem>
                  ))}
                </TextField>
                <ReferralSkillsInput
                  value={skills}
                  onChange={(values) => {
                    setForm((f) => ({ ...f, skills: values }));
                    setValidation((v) => ({ ...v, skills: values.length ? '' : v.skills || '' }));
                  }}
                  error={validation.skills}
                />
                <Stack direction="row" gap={1}>
                  {field('minimumExperienceYears', 'Minimum experience', true, 'number')}
                  {field('maximumExperienceYears', 'Maximum experience', true, 'number')}
                </Stack>
                <TextField
                  select
                  size="small"
                  required
                  error={Boolean(validation.categoryId)}
                  helperText={validation.categoryId}
                  label="Category"
                  value={form.categoryId}
                  onChange={(e) => update('categoryId', e.target.value)}
                  disabled={categories.isLoading || categories.isError}
                >
                  {categories.data?.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
                {field('location', 'Location')}
                {field('applicationUrl', 'Application URL', false, 'url')}
                <TextField
                  sx={{ gridColumn: '1 / -1' }}
                  error={Boolean(validation.description)}
                  helperText={validation.description}
                  label="Job description"
                  required
                  multiline
                  minRows={3}
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                />
              </Box>
              {categories.error && (
                <Alert
                  severity="error"
                  sx={{ mt: 2 }}
                  action={<Button onClick={() => void categories.refetch()}>Retry</Button>}
                >
                  {referralError(categories.error)}
                </Alert>
              )}
            </ReferralCard>
          )}
          {step === 1 && (
            <ReferralCard title="Referral preferences">
              <Typography fontSize={12} color="text.secondary" mb={2}>
                Tell candidates how many people you’re willing to consider and how accepted
                candidates can contact you.
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1.3fr' },
                  gap: 2,
                }}
              >
                <Box sx={{ bgcolor: '#edf5ff', borderRadius: 1.5, p: 2 }}>
                  <Typography fontSize={14} fontWeight={700}>
                    Referral slots *
                  </Typography>
                  <Typography fontSize={12} color="text.secondary" mb={1.5}>
                    How many candidates can you refer for this opportunity?
                  </Typography>
                  <Stack direction="row" gap={0.5}>
                    <Button
                      aria-label="Decrease referral slots"
                      disabled={slots <= 1 || busy}
                      onClick={() => setSlots((s) => s - 1)}
                    >
                      <RemoveIcon />
                    </Button>
                    <TextField
                      aria-label="Referral slots"
                      size="small"
                      type="number"
                      value={slots}
                      error={!validSlots(slots)}
                      helperText={!validSlots(slots) ? 'Enter 1–1000 whole slots' : undefined}
                      onChange={(e) => setSlots(Number(e.target.value))}
                      slotProps={{
                        htmlInput: { min: 1, max: 1000, 'aria-label': 'Referral slots' },
                      }}
                    />
                    <Button
                      aria-label="Increase referral slots"
                      disabled={slots >= 1000 || busy}
                      onClick={() => setSlots((s) => s + 1)}
                    >
                      <AddIcon />
                    </Button>
                  </Stack>
                  <Typography fontSize={11} color="text.secondary" mt={1}>
                    You can accept up to {validSlots(slots) ? slots : '—'} candidates.
                  </Typography>
                </Box>
                <Box>
                  <Typography fontSize={14} fontWeight={700}>
                    Contact sharing
                  </Typography>
                  <Typography fontSize={12} color="text.secondary">
                    Select how accepted candidates can contact you.
                  </Typography>
                  {(['showLinkedIn', 'showEmail', 'showPhone'] as const).map((key, i) => (
                    <FormControlLabel
                      sx={{ display: 'flex' }}
                      key={key}
                      label={['LinkedIn', 'Email', 'Phone'][i]}
                      control={
                        <Checkbox
                          size="small"
                          checked={sharing[key]}
                          onChange={(e) => setSharing((s) => ({ ...s, [key]: e.target.checked }))}
                        />
                      }
                    />
                  ))}
                  <Typography fontSize={12} color="text.secondary">
                    Contact methods use your profile details.{' '}
                    <Button size="small" onClick={() => void navigate(ROUTES.PORTFOLIO)}>
                      Review your profile
                    </Button>
                  </Typography>
                </Box>
              </Box>
              <Typography fontSize={12} color="text.secondary" mt={2}>
                Your contact details remain private until you accept a candidate’s referral request.
              </Typography>
            </ReferralCard>
          )}
          {step === 2 && (
            <ReferralCard title="Review your shared job">
              <Box
                component="dl"
                sx={{
                  m: 0,
                  overflowWrap: 'anywhere',
                  '& dt': { fontWeight: 700, mt: 1.5 },
                  '& dd': { ml: 0 },
                }}
              >
                {[
                  ['Job title', form.title],
                  ['Company', form.companyName],
                  [
                    'Employment type',
                    employmentTypeOptions
                      .find((option) => option.value === form.employmentType)
                      ?.label.replace(' time', '-time') ?? 'Not selected',
                  ],
                  ['Skills', skills.join(', ')],
                  [
                    'Experience',
                    `${form.minimumExperienceYears}–${form.maximumExperienceYears} years`,
                  ],
                  [
                    'Category',
                    categories.data?.find((c) => c.id === form.categoryId)?.name ?? form.categoryId,
                  ],
                  ['Location', form.location || 'Not provided'],
                  ['Job posting link', source || 'Not provided'],
                  ['Application URL', form.applicationUrl || 'Not provided'],
                  ['Job description', form.description],
                  ['Referral slots', String(slots)],
                  [
                    'Contact preferences',
                    (['showLinkedIn', 'showEmail', 'showPhone'] as const)
                      .flatMap((key, index) =>
                        sharing[key] ? [['LinkedIn', 'Email', 'Phone'][index]] : [],
                      )
                      .join(', '),
                  ],
                ].map(([label, value]) => (
                  <Box key={label}>
                    <Typography component="dt">{label}</Typography>
                    <Typography component="dd" sx={{ whiteSpace: 'pre-wrap' }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Typography mt={2} color="text.secondary">
                Submitting confirms these details and sends the job for approval. Your contact
                details remain private until you accept a request.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} mt={2}>
                <Button
                  disabled={busy}
                  onClick={() => {
                    setError('');
                    setStep(0);
                  }}
                >
                  Edit Details
                </Button>
                <Button
                  disabled={busy}
                  onClick={() => {
                    setError('');
                    setStep(1);
                  }}
                >
                  Edit Preferences
                </Button>
              </Stack>
            </ReferralCard>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction="row" gap={1}>
            {step > 0 && (
              <Button
                disabled={busy}
                onClick={() => {
                  setError('');
                  setStep((s) => s - 1);
                }}
              >
                Back
              </Button>
            )}
            <Button
              fullWidth
              variant="contained"
              type="submit"
              startIcon={step === 2 ? <SendOutlinedIcon /> : undefined}
              disabled={busy || extractState.isLoading || categories.isError}
            >
              {busy ? 'Submitting…' : step === 2 ? 'Submit for Approval' : 'Continue'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </ReferralLayout>
  );
};
