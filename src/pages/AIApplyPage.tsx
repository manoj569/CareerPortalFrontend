import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
/* eslint-disable @typescript-eslint/no-misused-promises */
import { useEffect, useMemo, useState } from 'react';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack, Step, StepButton, Stepper, Switch, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { ErrorState } from '@/components/feedback/ErrorState';

import { EmploymentType, WorkplaceType } from '@/features/jobs/types/jobModels';
import { useConfirmRazorpayPaymentMutation } from '@/features/payments/api/paymentsApi';
import { AIApplySectionNavigation } from '@/features/aiApply/components/AIApplySectionNavigation';
import { useCreateAIApplyCheckoutMutation, useCreateAIApplyRuleMutation, useDeleteAIApplyRuleMutation, useGetAIApplyAccessQuery, useGetAIApplyPlansQuery, useGetAIApplyPreferencesQuery, useGetAIApplyProfileQuery, useGetAIApplyRulesQuery, useGetAIApplySettingsQuery, useSetAIApplyModeMutation, useUpdateAIApplyPreferencesMutation, useUpdateAIApplyProfileMutation, useUpdateAIApplyRuleMutation, useUpdateAIApplySettingsMutation } from '@/features/aiApply/api/aiApplyApi';
import { AIApplyRuleOperator, AIApplyRuleType, type AIApplyAccess, type AIApplyPreferences, type AIApplyRule, type AIApplySettings, type UpdateAIApplyProfileRequest } from '@/features/aiApply/types/aiApplyModels';

const steps = ['Profile', 'Preferences', 'Rules', 'Automation', 'Review'];
const ruleLabels: Record<AIApplyRuleType, string> = { 1: 'Minimum salary', 2: 'Exclude night shift', 3: 'Exclude relocation', 4: 'Exclude previously applied company', 5: 'Required skill', 6: 'Required qualification', 7: 'Custom' };
const operatorLabels: Record<AIApplyRuleOperator, string> = { 1: 'Equals', 2: 'Does not equal', 3: 'At least', 4: 'At most', 5: 'Contains', 6: 'Does not contain' };
const workplaceLabels: Partial<Record<WorkplaceType, string>> = {
  [WorkplaceType.OnSite]: 'On-site',
  [WorkplaceType.Remote]: 'Remote',
  [WorkplaceType.Hybrid]: 'Hybrid',
};

const employmentLabels: Partial<Record<EmploymentType, string>> = {
  [EmploymentType.FullTime]: 'Full-time',
  [EmploymentType.PartTime]: 'Part-time',
  [EmploymentType.Contract]: 'Contract',
  [EmploymentType.Internship]: 'Internship',
  [EmploymentType.Freelance]: 'Freelance',
  [EmploymentType.Temporary]: 'Temporary',
};
const parseList = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);
const errorMessage = (error: unknown) => error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Please try again.';

interface RazorpayResult { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
interface RazorpayOptions { key: string; amount: number; currency: string; name: string; order_id: string; handler: (result: RazorpayResult) => void }
interface RazorpayConstructor { new(options: RazorpayOptions): { open: () => void } }
const loadRazorpay = async (): Promise<RazorpayConstructor> => {
  const existing = (window as Window & { Razorpay?: RazorpayConstructor }).Razorpay;
  if (existing) return existing;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.async = true;
    script.onload = () => resolve(); script.onerror = () => reject(new Error('Secure checkout could not be loaded.'));
    document.head.appendChild(script);
  });
  const loaded = (window as Window & { Razorpay?: RazorpayConstructor }).Razorpay;
  if (!loaded) throw new Error('Secure checkout could not be loaded.');
  return loaded;
};

const SectionCard = ({ children, title, description }: { children: React.ReactNode; title: string; description?: string }) => <Card variant="outlined"><CardContent><Stack spacing={2}><Box><Typography variant="h5">{title}</Typography>{description ? <Typography color="text.secondary">{description}</Typography> : null}</Box>{children}</Stack></CardContent></Card>;

export const AIApplyPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const access = useGetAIApplyAccessQuery();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<'disable' | null>(null);
  const [setApplyMode, modeState] = useSetAIApplyModeMutation();

  if (access.isLoading) return <PageLoadingIndicator label="Loading AI Apply…" />;
  if (access.isError || !access.data) return <ErrorState onRetry={access.refetch} title="AI Apply could not be loaded" />;
  const entitlement = access.data;

  const changeMode = async (action: 'enable' | 'disable' | 'pause' | 'resume') => {
    try { await setApplyMode(action).unwrap(); setMode(null); enqueueSnackbar(action === 'enable' ? 'AI Apply is active' : `AI Apply ${action}d`, { variant: 'success' }); }
    catch (error) { enqueueSnackbar(errorMessage(error), { variant: 'error' }); }
  };

  return <Stack spacing={3} sx={{ maxWidth: 1100, mx: 'auto', pb: 6 }}>
    <Box sx={{ borderRadius: 3, color: 'common.white', p: { xs: 3, md: 4 }, background: 'linear-gradient(135deg, #1d4ed8, #6d28d9)' }}>
      <Stack direction="row" spacing={2} alignItems="center"><AutoAwesomeOutlinedIcon fontSize="large" /><Box><Typography variant="h3" component="h1">AI Apply</Typography><Typography>Let Career Harbor handle repetitive job applications for you.</Typography></Box></Stack>
    </Box>
    <AIApplySectionNavigation />
    <AccessCard access={entitlement} onMode={changeMode} busy={modeState.isLoading} onDisable={() => setMode('disable')} />
    {!entitlement.canUseAIApply ? <Plans /> : <>
      <Alert severity="info">Career Harbor can match suitable jobs, fill supported forms with your saved profile, pause for required input, and track progress. Sensitive or legal answers still require your confirmation.</Alert>
      <Stepper activeStep={step} alternativeLabel sx={{ overflowX: 'auto' }}>{steps.map((label, index) => <Step key={label}><StepButton onClick={() => setStep(index)}>{label}</StepButton></Step>)}</Stepper>
      {step === 0 && <ProfileStep onNext={() => setStep(1)} />}
      {step === 1 && <PreferencesStep onNext={() => setStep(2)} />}
      {step === 2 && <RulesStep onNext={() => setStep(3)} />}
      {step === 3 && <SettingsStep canUseAI={entitlement.canUseAIGeneratedAnswers} onNext={() => setStep(4)} />}
      {step === 4 && <ReviewStep access={entitlement} onEdit={setStep} onEnable={() => changeMode('enable')} busy={modeState.isLoading} />}
    </>}
    <Dialog open={mode === 'disable'} onClose={() => !modeState.isLoading && setMode(null)}><DialogTitle>Disable AI Apply?</DialogTitle><DialogContent><Typography>Your profile, preferences, rules, answers, and history will be preserved.</Typography></DialogContent><DialogActions><Button onClick={() => setMode(null)}>Keep enabled</Button><Button color="error" variant="contained" disabled={modeState.isLoading} onClick={() => changeMode('disable')}>Disable AI Apply</Button></DialogActions></Dialog>
  </Stack>;
};

const AccessCard = ({ access, onMode, busy, onDisable }: { access: AIApplyAccess; onMode: (a: 'pause' | 'resume') => void; busy: boolean; onDisable: () => void }) => {
  const label = access.canUseAIApplyPro ? 'AI Apply Pro' : access.canUseAIApply ? 'AI Apply' : 'No AI Apply plan';
  const status = access.subscriptionExpired ? 'Expired' : !access.subscriptionActive ? 'Inactive' : access.canUseAIApply ? 'Active' : 'Not included';
  return <SectionCard title="Current access"><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}><Stack direction="row" gap={1} flexWrap="wrap"><Chip color="primary" label={label} /><Chip label={status} />{access.canUseAdvancedMatching && <Chip label="Advanced matching" />}{access.canUseAIGeneratedAnswers && <Chip label="AI answer assistance" />}</Stack>{access.expiresAt && <Typography color="text.secondary">Valid until {new Date(access.expiresAt).toLocaleDateString()}</Typography>}</Stack>{access.canUseAIApply && <Stack direction="row" gap={1}>{access.subscriptionActive && <Button disabled={busy} onClick={() => onMode(access.subscriptionStatus && access.tier ? 'pause' : 'pause')} variant="outlined">Pause</Button>}<Button disabled={busy} onClick={() => onMode('resume')} variant="outlined">Resume</Button><Button color="error" disabled={busy} onClick={onDisable}>Disable</Button></Stack>}</SectionCard>;
};

const Plans = () => {
  const plans = useGetAIApplyPlansQuery(); const [checkout, checkoutState] = useCreateAIApplyCheckoutMutation();
  const [confirm] = useConfirmRazorpayPaymentMutation(); const access = useGetAIApplyAccessQuery();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const eligible = (plans.data ?? []).filter((p) => p.canUseAIApply);
  const choose = async (code: string) => { setCheckoutError(null); try { const order = await checkout(code).unwrap(); const Razorpay = await loadRazorpay(); new Razorpay({ key: order.keyId, amount: order.amountInMinorUnits, currency: order.currencyCode, name: order.planName, order_id: order.providerOrderId, handler: (result) => { void confirm({ paymentId: order.paymentId, request: { razorpayOrderId: result.razorpay_order_id, razorpayPaymentId: result.razorpay_payment_id, razorpaySignature: result.razorpay_signature } }).unwrap().then(() => access.refetch()).catch((error: unknown) => setCheckoutError(errorMessage(error))); } }).open(); } catch (error) { setCheckoutError(errorMessage(error)); } };
  return <SectionCard title="Unlock AI Apply" description="Choose an active plan returned by Career Harbor. Checkout pricing is always verified by the backend.">{plans.isLoading ? <PageLoadingIndicator label="Loading plans…" /> : plans.isError ? <ErrorState onRetry={plans.refetch} title="Plans could not be loaded" /> : <Stack direction={{ xs: 'column', md: 'row' }} gap={2}>{eligible.map((plan) => <Card key={plan.planCode} variant="outlined" sx={{ flex: 1, borderColor: plan.canUseAIApplyPro ? 'secondary.main' : 'divider' }}><CardContent><Typography variant="h5">{plan.displayName}</Typography><Typography variant="h3">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: plan.currency, maximumFractionDigits: 0 }).format(plan.price)}</Typography><Typography color="text.secondary">{plan.durationDays} days</Typography><Stack my={2} spacing={1}>{['Automatic job matching', 'Supported-form automation', 'Resume autofill', 'Saved answer memory', 'Application tracking', 'Missing-information alerts'].map((x) => <Typography key={x}><CheckCircleOutlineIcon color="primary" fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />{x}</Typography>)}</Stack><Button fullWidth variant="contained" disabled={checkoutState.isLoading} onClick={() => choose(plan.planCode)}>Choose {plan.displayName}</Button></CardContent></Card>)}</Stack>}{(checkoutState.isError || checkoutError) && <Alert severity="error">{checkoutError ?? errorMessage(checkoutState.error)}</Alert>}</SectionCard>;
};

const ProfileStep = ({ onNext }: { onNext: () => void }) => {
  const query = useGetAIApplyProfileQuery(); const [save, state] = useUpdateAIApplyProfileMutation(); const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState<UpdateAIApplyProfileRequest>({ githubUrl: null, willingToRelocate: null, workAuthorization: null, visaSponsorshipPreference: null });
  useEffect(() => { if (query.data) setForm({ githubUrl: query.data.githubUrl, willingToRelocate: query.data.willingToRelocate, workAuthorization: query.data.workAuthorization, visaSponsorshipPreference: query.data.visaSponsorshipPreference }); }, [query.data]);
  if (query.isLoading) return <PageLoadingIndicator label="Loading application profile…" />; if (!query.data) return <ErrorState onRetry={query.refetch} />;
  const p = query.data; const submit = async () => { try { await save(form).unwrap(); enqueueSnackbar('Profile saved', { variant: 'success' }); onNext(); } catch (e) { enqueueSnackbar(errorMessage(e), { variant: 'error' }); } };
  return <SectionCard title="Application Profile" description="These details will be used when Career Harbor fills supported job applications. Some details are prefilled from your Career Harbor profile."><Stack direction={{ xs: 'column', md: 'row' }} gap={2} flexWrap="wrap">{[[`${p.firstName} ${p.lastName}`, 'Name'], [p.email, 'Email'], [p.phone, 'Phone'], [p.currentLocation, 'Current location'], [p.skills.join(', '), 'Skills'], [p.totalExperience?.toString(), 'Total experience'], [p.linkedInUrl, 'LinkedIn'], [p.portfolioUrl, 'Portfolio'], [p.noticePeriod, 'Notice period'], [p.currentSalary?.toString(), 'Current salary'], [p.expectedSalary?.toString(), 'Expected salary']].map(([value, label]) => <TextField key={label} label={label} value={value ?? ''} disabled sx={{ flex: '1 1 280px' }} />)}</Stack><TextField label="GitHub URL" value={form.githubUrl ?? ''} onChange={(e) => setForm({ ...form, githubUrl: e.target.value || null })} /><FormControl><InputLabel>Willing to relocate</InputLabel><Select label="Willing to relocate" value={form.willingToRelocate === null ? '' : String(form.willingToRelocate)} onChange={(e) => setForm({ ...form, willingToRelocate: e.target.value === '' ? null : e.target.value === 'true' })}><MenuItem value="">Not specified</MenuItem><MenuItem value="true">Yes</MenuItem><MenuItem value="false">No</MenuItem></Select></FormControl><TextField label="Work authorization" value={form.workAuthorization ?? ''} onChange={(e) => setForm({ ...form, workAuthorization: e.target.value || null })} /><TextField label="Visa sponsorship preference" value={form.visaSponsorshipPreference ?? ''} onChange={(e) => setForm({ ...form, visaSponsorshipPreference: e.target.value || null })} /><Button variant="contained" disabled={state.isLoading} onClick={submit}>{state.isLoading ? 'Saving…' : 'Save and continue'}</Button></SectionCard>;
};

const PreferencesStep = ({ onNext }: { onNext: () => void }) => {
  const query = useGetAIApplyPreferencesQuery();
  const [save, state] = useUpdateAIApplyPreferencesMutation();
  const { enqueueSnackbar } = useSnackbar();

  const [form, setForm] = useState<AIApplyPreferences | null>(null);

  useEffect(() => {
    if (query.data) {
      setForm(query.data);
    }
  }, [query.data]);

  if (query.isLoading || !form) {
    return query.isError ? (
      <ErrorState onRetry={query.refetch} />
    ) : (
      <PageLoadingIndicator label="Loading preferences…" />
    );
  }

  const submit = async () => {
    try {
      await save(form).unwrap();

      enqueueSnackbar('Preferences saved', {
        variant: 'success',
      });

      onNext();
    } catch (error) {
      enqueueSnackbar(errorMessage(error), {
        variant: 'error',
      });
    }
  };

  return (
    <SectionCard
      title="Job Preferences"
      description="Tell Career Harbor what kinds of jobs you want AI Apply to consider."
    >
      <TextField
        label="Desired job titles (comma separated)"
        value={form.jobTitles.join(', ')}
        onChange={(event) =>
          setForm({
            ...form,
            jobTitles: parseList(event.target.value),
          })
        }
      />

      <TextField
        label="Skills (comma separated)"
        value={form.skills.join(', ')}
        onChange={(event) =>
          setForm({
            ...form,
            skills: parseList(event.target.value),
          })
        }
      />

      <TextField
        label="Preferred locations (comma separated)"
        value={form.preferredLocations.join(', ')}
        onChange={(event) =>
          setForm({
            ...form,
            preferredLocations: parseList(event.target.value),
          })
        }
      />

      <Select
        multiple
        value={form.workplaceTypes}
        onChange={(event) =>
          setForm({
            ...form,
            workplaceTypes: event.target.value as WorkplaceType[],
          })
        }
        renderValue={(values) =>
          values
            .map((value) => workplaceLabels[value])
            .filter((label): label is string => Boolean(label))
            .join(', ')
        }
      >
        {Object.entries(workplaceLabels).map(([value, label]) => (
          <MenuItem key={value} value={Number(value)}>
            {label}
          </MenuItem>
        ))}
      </Select>

      <Select
        multiple
        value={form.employmentTypes}
        onChange={(event) =>
          setForm({
            ...form,
            employmentTypes: event.target.value as EmploymentType[],
          })
        }
        renderValue={(values) =>
          values
            .map((value) => employmentLabels[value])
            .filter((label): label is string => Boolean(label))
            .join(', ')
        }
      >
        {Object.entries(employmentLabels).map(([value, label]) => (
          <MenuItem key={value} value={Number(value)}>
            {label}
          </MenuItem>
        ))}
      </Select>

      <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
        {(
          [
            'minimumExperience',
            'maximumExperience',
            'minimumSalary',
            'maximumSalary',
          ] as const
        ).map((field) => (
          <TextField
            key={field}
            type="number"
            fullWidth
            label={field.replace(/([A-Z])/g, ' $1')}
            value={form[field] ?? ''}
            onChange={(event) =>
              setForm({
                ...form,
                [field]: event.target.value
                  ? Number(event.target.value)
                  : null,
              })
            }
          />
        ))}
      </Stack>

      <Button
        variant="contained"
        disabled={state.isLoading}
        onClick={submit}
      >
        {state.isLoading ? 'Saving…' : 'Save and continue'}
      </Button>
    </SectionCard>
  );
};

const RulesStep = ({ onNext }: { onNext: () => void }) => {
  const query = useGetAIApplyRulesQuery(); const [create] = useCreateAIApplyRuleMutation(); const [update] = useUpdateAIApplyRuleMutation(); const [remove] = useDeleteAIApplyRuleMutation(); const [editing, setEditing] = useState<AIApplyRule | 'new' | null>(null); const [deleting, setDeleting] = useState<AIApplyRule | null>(null);
  const [draft, setDraft] = useState({ ruleType: AIApplyRuleType.MinimumSalary, operator: AIApplyRuleOperator.GreaterThanOrEqual, value: '', isEnabled: true });
  const open = (rule?: AIApplyRule) => { setEditing(rule ?? 'new'); setDraft(rule ? { ruleType: rule.ruleType, operator: rule.operator, value: rule.value, isEnabled: rule.isEnabled } : { ruleType: AIApplyRuleType.MinimumSalary, operator: AIApplyRuleOperator.GreaterThanOrEqual, value: '', isEnabled: true }); };
  const persist = async () => { if (!draft.value.trim()) return; if (editing === 'new') await create(draft).unwrap(); else if (editing) await update({ id: editing.id, request: draft }).unwrap(); setEditing(null); };
  if (query.isLoading) return <PageLoadingIndicator label="Loading rules…" />; if (query.isError) return <ErrorState onRetry={query.refetch} />;
  return <SectionCard title="Application Rules" description="Rules are checked before Career Harbor queues an application.">{query.data?.length ? query.data.map((r) => <Card key={r.id} variant="outlined"><CardContent><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography fontWeight={700}>{ruleLabels[r.ruleType]}</Typography><Typography color="text.secondary">{operatorLabels[r.operator]} · {r.value}</Typography></Box><Box><Button aria-label={`Edit ${ruleLabels[r.ruleType]}`} onClick={() => open(r)}><EditOutlinedIcon /></Button><Button color="error" aria-label={`Delete ${ruleLabels[r.ruleType]}`} onClick={() => setDeleting(r)}><DeleteOutlineIcon /></Button></Box></Stack></CardContent></Card>) : <Alert severity="info">No custom rules yet. Career Harbor will use your job preferences.</Alert>}<Stack direction="row" gap={1}><Button variant="outlined" onClick={() => open()}>Add rule</Button><Button variant="contained" onClick={onNext}>Continue</Button></Stack><Dialog open={editing !== null} onClose={() => setEditing(null)} fullWidth><DialogTitle>{editing === 'new' ? 'Add rule' : 'Edit rule'}</DialogTitle><DialogContent><Stack spacing={2} mt={1}><Select value={draft.ruleType} onChange={(e) => setDraft({ ...draft, ruleType: Number(e.target.value) })}>{Object.entries(ruleLabels).map(([v, l]) => <MenuItem value={Number(v)} key={v}>{l}</MenuItem>)}</Select><Select value={draft.operator} onChange={(e) => setDraft({ ...draft, operator: Number(e.target.value) })}>{Object.entries(operatorLabels).map(([v, l]) => <MenuItem value={Number(v)} key={v}>{l}</MenuItem>)}</Select><TextField autoFocus label="Value" value={draft.value} onChange={(e) => setDraft({ ...draft, value: e.target.value })} /><FormControlLabel control={<Switch checked={draft.isEnabled} onChange={(_, checked) => setDraft({ ...draft, isEnabled: checked })} />} label="Rule enabled" /></Stack></DialogContent><DialogActions><Button onClick={() => setEditing(null)}>Cancel</Button><Button variant="contained" disabled={!draft.value.trim()} onClick={persist}>Save rule</Button></DialogActions></Dialog><Dialog open={Boolean(deleting)} onClose={() => setDeleting(null)}><DialogTitle>Remove this rule?</DialogTitle><DialogActions><Button onClick={() => setDeleting(null)}>Cancel</Button><Button color="error" onClick={async () => { if (deleting) await remove(deleting.id); setDeleting(null); }}>Remove</Button></DialogActions></Dialog></SectionCard>;
};

const SettingsStep = ({ canUseAI, onNext }: { canUseAI: boolean; onNext: () => void }) => {
  const query = useGetAIApplySettingsQuery(); const [save, state] = useUpdateAIApplySettingsMutation(); const [form, setForm] = useState<AIApplySettings | null>(null); const { enqueueSnackbar } = useSnackbar(); useEffect(() => { if (query.data) setForm(query.data); }, [query.data]);
  if (query.isLoading || !form) return query.isError ? <ErrorState onRetry={query.refetch} /> : <PageLoadingIndicator label="Loading automation settings…" />;
  const submit = async () => { try { const request = { enabled: form.enabled, preferredStartTime: form.preferredStartTime, timezone: form.timezone, preferredDays: form.preferredDays, autoResumeApplications: form.autoResumeApplications, allowAIGeneratedAnswers: form.allowAIGeneratedAnswers, requireConfirmationBeforeSubmit: form.requireConfirmationBeforeSubmit }; await save(request).unwrap(); enqueueSnackbar('Automation settings saved', { variant: 'success' }); onNext(); } catch (e) { enqueueSnackbar(errorMessage(e), { variant: 'error' }); } };
  return <SectionCard title="Automation Settings"><TextField label="Preferred start time" type="time" value={form.preferredStartTime?.slice(0, 5) ?? ''} onChange={(e) => setForm({ ...form, preferredStartTime: e.target.value || null })} InputLabelProps={{ shrink: true }} /><TextField label="Timezone" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} /><FormControlLabel control={<Switch checked={form.autoResumeApplications} onChange={(_, v) => setForm({ ...form, autoResumeApplications: v })} />} label="Automatically resume eligible applications" /><FormControlLabel control={<Switch disabled={!canUseAI} checked={form.allowAIGeneratedAnswers && canUseAI} onChange={(_, v) => setForm({ ...form, allowAIGeneratedAnswers: v })} />} label="Allow AI-generated answer suggestions" /><FormControlLabel control={<Switch checked={form.requireConfirmationBeforeSubmit} onChange={(_, v) => setForm({ ...form, requireConfirmationBeforeSubmit: v })} />} label="Review before final submission" /><Alert severity="info">Career Harbor will ask before answering sensitive or legal questions such as work authorization, sponsorship, declarations, and protected demographic information.</Alert><Button variant="contained" disabled={state.isLoading} onClick={submit}>{state.isLoading ? 'Saving…' : 'Save and continue'}</Button></SectionCard>;
};

const ReviewStep = ({ access, onEdit, onEnable, busy }: { access: { canUseAIApplyPro: boolean }; onEdit: (n: number) => void; onEnable: () => void; busy: boolean }) => {
  const profile = useGetAIApplyProfileQuery(); const preferences = useGetAIApplyPreferencesQuery(); const rules = useGetAIApplyRulesQuery(); const settings = useGetAIApplySettingsQuery();
  const rows = useMemo(() => [['Profile', `${profile.data?.firstName ?? ''} ${profile.data?.lastName ?? ''}`, 0], ['Preferences', `${preferences.data?.jobTitles.length ?? 0} titles, ${preferences.data?.skills.length ?? 0} skills`, 1], ['Rules', `${rules.data?.length ?? 0} custom rules`, 2], ['Automation', settings.data?.requireConfirmationBeforeSubmit ? 'Review before submit' : 'Automatic submission permitted', 3], ['Current plan', access.canUseAIApplyPro ? 'AI Apply Pro' : 'AI Apply', -1]] as const, [access, preferences.data, profile.data, rules.data, settings.data]);
  return <SectionCard title="Review & Enable AI Apply" description="Check your setup before enabling automation.">{rows.map(([name, detail, index]) => <Box key={name}><Stack direction="row" justifyContent="space-between"><Box><Typography fontWeight={700}>{name}</Typography><Typography color="text.secondary">{detail}</Typography></Box>{index >= 0 && <Button onClick={() => onEdit(index)}>Edit</Button>}</Stack><Divider sx={{ mt: 2 }} /></Box>)}<Button size="large" variant="contained" disabled={busy} onClick={onEnable}>{busy ? <CircularProgress size={22} /> : 'Enable AI Apply'}</Button></SectionCard>;
};
