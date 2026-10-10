import { ReferralStepper } from '@/features/referrals/components/ReferralStepper';
import { useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Autocomplete,
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
  employmentType: 'FullTime',
  skills: '',
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
  const [source, setSource] = useState('');
  const [slots, setSlots] = useState(5);
  const [sharing, setSharing] = useState({
    showLinkedIn: true,
    showEmail: false,
    showPhone: false,
  });
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const guard = useRef(false);
  const categories = useGetReferralCategoryOptionsQuery();
  const [extract, extractState] = useExtractJobFromUrlMutation();
  const [submit, submitState] = useSubmitJobReferralMutation();
  const update = (key: keyof typeof initial, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));
  const skills = [
    ...new Set(
      form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
  const field = (key: keyof typeof initial, label: string, required = false, type = 'text') => (
    <TextField
      size="small"
      fullWidth
      required={required}
      label={label}
      type={type}
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
    if (guard.current) return;
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
    guard.current = true;
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
      void navigate(`/dashboard/referrals/${encodeURIComponent(result.id)}/submitted`, {
        state: { submission: result },
      });
    } catch (e) {
      setError(referralError(e));
    } finally {
      guard.current = false;
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
            ['Submit', 'For approval'],
          ]}
          active={form.title && form.companyName && form.categoryId && skills.length ? 1 : 0}
        />
      </ReferralCard>
      <Box
        component="form"
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
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
              <Button
                variant="outlined"
                disabled={!source.trim() || extractState.isLoading || submitState.isLoading}
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
                value={form.employmentType}
                onChange={(e) => update('employmentType', e.target.value)}
                required
              >
                {[
                  ['FullTime', 'Full-time'],
                  ['PartTime', 'Part-time'],
                  ['Contract', 'Contract'],
                  ['Internship', 'Internship'],
                  ['Freelance', 'Freelance'],
                  ['Temporary', 'Temporary'],
                ].map(([v, l]) => (
                  <MenuItem key={v} value={v}>
                    {l}
                  </MenuItem>
                ))}
              </TextField>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={skills}
                onChange={(_, values) => update('skills', values.join(', '))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Skills"
                    required={!skills.length}
                    placeholder="Add skill and press Enter"
                  />
                )}
              />
              <Stack direction="row" gap={1}>
                {field('minimumExperienceYears', 'Minimum experience', true, 'number')}
                {field('maximumExperienceYears', 'Maximum experience', true, 'number')}
              </Stack>
              <TextField
                select
                size="small"
                required
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
          <ReferralCard title="Referral preferences">
            <Typography fontSize={12} color="text.secondary" mb={2}>
              Tell candidates how many people you’re willing to consider and how accepted candidates
              can contact you.
            </Typography>
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1.3fr' }, gap: 2 }}
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
                    disabled={slots <= 1 || submitState.isLoading}
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
                    slotProps={{ htmlInput: { min: 1, max: 1000, 'aria-label': 'Referral slots' } }}
                  />
                  <Button
                    aria-label="Increase referral slots"
                    disabled={slots >= 1000 || submitState.isLoading}
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
          {error && <Alert severity="error">{error}</Alert>}
          <Button
            fullWidth
            variant="contained"
            type="submit"
            startIcon={<SendOutlinedIcon />}
            disabled={submitState.isLoading || categories.isError || !validSlots(slots)}
          >
            {submitState.isLoading ? 'Submitting…' : 'Submit for approval'}
          </Button>
        </Stack>
      </Box>
    </ReferralLayout>
  );
};
