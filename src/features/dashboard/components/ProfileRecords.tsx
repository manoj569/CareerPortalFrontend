import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import { Alert, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, IconButton, MenuItem, Paper, Radio, RadioGroup, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';

import { ConfirmActionDialog } from '@/features/admin/components/ConfirmActionDialog';
import { isDashboardApiError } from '@/features/dashboard/api/dashboardApi';
import { EmploymentType } from '@/features/jobs/types/jobModels';
import { useAddPortfolioEducationMutation, useAddPortfolioExperienceMutation, useDeletePortfolioEducationMutation, useDeletePortfolioExperienceMutation, useGetPortfolioEducationQuery, useGetPortfolioExperiencesQuery, useUpdatePortfolioEducationMutation, useUpdatePortfolioExperienceMutation } from '@/features/portfolio/api/portfolioApi';
import type { PortfolioEducation, PortfolioExperience } from '@/features/portfolio/types/portfolioModels';

const emptyEducation = { qualification: '', institution: '', fieldOfStudy: '', startYear: '', endYear: '', grade: '', description: '', courseType: '', isCurrentlyStudying: false, gradingSystem: '' };
const emptyExperience = { jobTitle: '', companyName: '', location: '', employmentType: '', startDate: '', endDate: '', isCurrent: false, description: '', annualSalary: '', skillsUsed: '', noticePeriod: '' };

export const ProfileEducationRecords = () => {
  const query = useGetPortfolioEducationQuery();
  const [add, addState] = useAddPortfolioEducationMutation();
  const [update, updateState] = useUpdatePortfolioEducationMutation();
  const [remove, removeState] = useDeletePortfolioEducationMutation();
  const [editing, setEditing] = useState<PortfolioEducation | null | undefined>(undefined);
  const [values, setValues] = useState(emptyEducation);
  const [deleting, setDeleting] = useState<PortfolioEducation | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const isSaving = addState.isLoading || updateState.isLoading;

  const open = (item: PortfolioEducation | null) => {
    setSaveError(null);
    setEditing(item);
    setValues(item ? {
      qualification: item.qualification,
      institution: item.institution,
      fieldOfStudy: item.fieldOfStudy ?? '',
      startYear: item.startYear?.toString() ?? '',
      endYear: item.endYear?.toString() ?? '',
      grade: item.grade ?? '',
      description: item.description ?? '',
      courseType: item.courseType ?? '',
      isCurrentlyStudying: Boolean(item.isCurrentlyStudying),
      gradingSystem: item.gradingSystem ?? '',
    } : emptyEducation);
  };

  const save = async () => {
    setSaveError(null);
    if (!values.qualification.trim() || !values.institution.trim()) {
      setSaveError('Education level and university / institute are required.');
      return;
    }
    if (values.startYear && values.endYear && Number(values.endYear) < Number(values.startYear)) {
      setSaveError('End year cannot be before start year.');
      return;
    }
    const data = {
      qualification: values.qualification.trim(),
      institution: values.institution.trim(),
      fieldOfStudy: values.fieldOfStudy.trim() || null,
      startYear: values.startYear ? Number(values.startYear) : null,
      endYear: values.isCurrentlyStudying ? null : values.endYear ? Number(values.endYear) : null,
      grade: values.grade.trim() || null,
      description: values.description.trim() || null,
      displayOrder: editing?.displayOrder ?? query.data?.length ?? 0,
      courseType: values.courseType ? values.courseType as Exclude<PortfolioEducation['courseType'], null | undefined> : null,
      isCurrentlyStudying: values.isCurrentlyStudying,
      gradingSystem: values.gradingSystem.trim() || null,
    };
    try {
      if (editing) await update({ id: editing.id, data }).unwrap();
      else await add(data).unwrap();
      await query.refetch();
      setEditing(undefined);
    } catch (error) {
      setSaveError(isDashboardApiError(error) ? error.message : 'Unable to save education. Please try again.');
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteError(null);
    try {
      await remove(deleting.id).unwrap();
      await query.refetch();
      setDeleting(null);
    } catch (error) {
      setDeleteError(isDashboardApiError(error) ? error.message : 'Unable to delete education. Please try again.');
    }
  };

  return (
    <RecordShell
      addLabel="Add education"
      empty="Education helps employers understand your academic background."
      error={query.isError ? 'Education records are temporarily unavailable.' : null}
      hasRecords={Boolean(query.data?.length)}
      loading={query.isLoading}
      onAdd={() => open(null)}
      onRetry={() => void query.refetch()}
      titleIcon={<SchoolOutlinedIcon color="primary" />}
      title="Education"
    >
      {query.data?.map((item) => (
        <Paper key={item.id} sx={{ border: 1, borderColor: 'divider', p: { xs: 1.5, sm: 2 } }}>
          <Stack alignItems="flex-start" direction="row" gap={1.5}>
            <SchoolOutlinedIcon color="primary" sx={{ mt: 0.25 }} />
            <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
              <Typography fontWeight={800}>
                {[item.qualification, item.fieldOfStudy].filter(Boolean).join(' · ')}
              </Typography>
              <Stack alignItems="center" color="text.secondary" direction="row" spacing={0.75}>
                <BusinessOutlinedIcon fontSize="small" />
                <Typography variant="body2">{item.institution}</Typography>
              </Stack>
              {item.startYear ? <Typography color="text.secondary" variant="body2">{item.startYear} – {item.isCurrentlyStudying ? 'Present' : item.endYear ?? 'End year not specified'}</Typography> : null}
              {item.courseType ? <Typography color="text.secondary" variant="body2">{courseTypeLabels[item.courseType]}</Typography> : null}
              {item.gradingSystem || item.grade ? <Typography color="text.secondary" variant="body2">{[item.gradingSystem, item.grade].filter(Boolean).join(' · ')}</Typography> : null}
            </Stack>
            <Stack direction="row">
              <Tooltip title="Edit education">
                <IconButton aria-label="Edit education" onClick={() => open(item)}>
                  <EditOutlinedIcon />
                </IconButton>
              </Tooltip>
              <Button color="error" onClick={() => { setDeleteError(null); setDeleting(item); }}>Delete</Button>
            </Stack>
          </Stack>
        </Paper>
      ))}
      <EducationDialog
        error={saveError}
        isEditing={Boolean(editing)}
        isSaving={isSaving}
        onClose={() => { if (!isSaving) setEditing(undefined); }}
        onSave={() => void save()}
        open={editing !== undefined}
        setValues={setValues}
        values={values}
      />
      <ConfirmActionDialog
        actionLabel="Delete education"
        description={deleting ? `“${deleting.qualification}” at ${deleting.institution} will be permanently removed.` : ''}
        error={deleteError}
        isProcessing={removeState.isLoading}
        onClose={() => { setDeleting(null); setDeleteError(null); }}
        onConfirm={() => void confirmDelete()}
        open={Boolean(deleting)}
        title="Delete education?"
      />
    </RecordShell>
  );
};

export const ProfileEmploymentRecords = ({ fresher }: { fresher: boolean }) => {
  const query = useGetPortfolioExperiencesQuery();
  const [add, addState] = useAddPortfolioExperienceMutation();
  const [update, updateState] = useUpdatePortfolioExperienceMutation();
  const [remove, removeState] = useDeletePortfolioExperienceMutation();
  const [editing, setEditing] = useState<PortfolioExperience | null | undefined>(undefined);
  const [values, setValues] = useState(emptyExperience);
  const [deleting, setDeleting] = useState<PortfolioExperience | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const isSaving = addState.isLoading || updateState.isLoading;

  const open = (item: PortfolioExperience | null) => {
    setSaveError(null);
    setEditing(item);
    setValues(item ? {
      jobTitle: item.jobTitle,
      companyName: item.companyName,
      location: item.location ?? '',
      employmentType: item.employmentType?.toString() ?? '',
      startDate: item.startDate,
      endDate: item.endDate ?? '',
      isCurrent: item.isCurrent,
      description: item.description ?? '',
      annualSalary: item.annualSalary?.toString() ?? '',
      skillsUsed: item.skillsUsed?.join(', ') ?? '',
      noticePeriod: item.noticePeriod ?? '',
    } : emptyExperience);
  };

  const save = async () => {
    setSaveError(null);
    if (!values.companyName.trim() || !values.jobTitle.trim() || !values.employmentType || !values.startDate || (!values.isCurrent && !values.endDate)) {
      setSaveError('Company name, job title, employment type, joining date, and leaving date for previous employment are required.');
      return;
    }
    if (!values.isCurrent && values.startDate > values.endDate) {
      setSaveError('Joining date cannot be after leaving date.');
      return;
    }
    const data = {
      jobTitle: values.jobTitle.trim(),
      companyName: values.companyName.trim(),
      location: editing?.location ?? null,
      employmentType: Number(values.employmentType),
      startDate: values.startDate,
      endDate: values.isCurrent ? null : values.endDate,
      isCurrent: values.isCurrent,
      description: values.description.trim() || null,
      displayOrder: editing?.displayOrder ?? query.data?.length ?? 0,
      annualSalary: values.annualSalary ? Number(values.annualSalary) : null,
      skillsUsed: values.skillsUsed.split(',').map((skill) => skill.trim()).filter(Boolean),
      noticePeriod: values.noticePeriod.trim() || null,
    };
    try {
      if (editing) await update({ id: editing.id, data }).unwrap();
      else await add(data).unwrap();
      await query.refetch();
      setEditing(undefined);
    } catch (error) {
      setSaveError(isDashboardApiError(error) ? error.message : 'Unable to save employment. Please try again.');
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteError(null);
    try {
      await remove(deleting.id).unwrap();
      await query.refetch();
      setDeleting(null);
    } catch (error) {
      setDeleteError(isDashboardApiError(error) ? error.message : 'Unable to delete employment. Please try again.');
    }
  };

  return (
    <RecordShell
      addLabel="Add employment"
      empty={fresher ? 'Employment history is optional for freshers.' : 'Add employment history to complete your experienced candidate profile.'}
      error={query.isError ? 'Employment records are temporarily unavailable.' : null}
      hasRecords={Boolean(query.data?.length)}
      loading={query.isLoading}
      onAdd={() => open(null)}
      onRetry={() => void query.refetch()}
      titleIcon={<WorkOutlineOutlinedIcon color="primary" />}
      title="Employment"
    >
      {query.data?.map((item) => (
        <Paper key={item.id} sx={{ border: 1, borderColor: 'divider', p: { xs: 1.5, sm: 2 } }}>
          <Stack alignItems="flex-start" direction="row" gap={1.5}>
            <WorkOutlineOutlinedIcon color="primary" sx={{ mt: 0.25 }} />
            <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
              <Stack alignItems={{ xs: 'flex-start', sm: 'center' }} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={0.5}>
                <Typography fontWeight={800}>{item.jobTitle}</Typography>
                <Typography color="text.secondary" variant="body2">{formatEmploymentDate(item.startDate)} – {item.isCurrent ? 'Present' : formatEmploymentDate(item.endDate)}</Typography>
              </Stack>
              <Stack alignItems={{ xs: 'flex-start', sm: 'center' }} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={0.5}>
                <Stack alignItems="center" color="text.secondary" direction="row" spacing={0.75}>
                  <BusinessOutlinedIcon fontSize="small" />
                  <Typography variant="body2">{item.companyName}</Typography>
                </Stack>
                <Typography color="text.secondary" variant="body2">{formatEmploymentDuration(item.startDate, item.isCurrent ? null : item.endDate)}</Typography>
              </Stack>
              {item.employmentType ? <Typography color="text.secondary" variant="body2">{employmentTypeLabels[item.employmentType]}</Typography> : null}
              {item.isCurrent ? <Chip label="Current company" size="small" sx={{ alignSelf: 'flex-start' }} /> : null}
              {item.skillsUsed?.length ? <Stack direction="row" flexWrap="wrap" gap={0.75}>{item.skillsUsed.map((skill) => <Chip key={skill} label={skill} size="small" variant="outlined" />)}</Stack> : null}
              {item.description ? <Typography sx={{ whiteSpace: 'pre-wrap' }} variant="body2">{item.description}</Typography> : null}
            </Stack>
            <Stack direction="row">
              <Tooltip title="Edit employment">
                <IconButton aria-label="Edit employment" onClick={() => open(item)}><EditOutlinedIcon /></IconButton>
              </Tooltip>
              <Button color="error" onClick={() => { setDeleteError(null); setDeleting(item); }}>Delete</Button>
            </Stack>
          </Stack>
        </Paper>
      ))}
      <EmploymentDialog
        error={saveError}
        isEditing={Boolean(editing)}
        isSaving={isSaving}
        onClose={() => { if (!isSaving) setEditing(undefined); }}
        onSave={() => void save()}
        open={editing !== undefined}
        setValues={setValues}
        values={values}
      />
      <ConfirmActionDialog
        actionLabel="Delete employment"
        description={deleting ? `“${deleting.jobTitle}” at ${deleting.companyName} will be permanently removed.` : ''}
        error={deleteError}
        isProcessing={removeState.isLoading}
        onClose={() => { setDeleting(null); setDeleteError(null); }}
        onConfirm={() => void confirmDelete()}
        open={Boolean(deleting)}
        title="Delete employment?"
      />
    </RecordShell>
  );
};

const RecordShell = ({ title, titleIcon, loading, error, empty, hasRecords, addLabel, onAdd, onRetry, children }: { title:string; titleIcon:ReactNode; loading:boolean; error:string|null; empty:string; hasRecords:boolean; addLabel:string; onAdd:()=>void; onRetry?:()=>void; children:ReactNode }) => <Paper component="section" sx={{ border: 1, borderColor: 'divider', p: { xs: 2.5, sm: 3 } }}><Stack spacing={2}><Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}><Stack alignItems="center" direction="row" spacing={1}>{titleIcon}<Typography component="h2" variant="h3">{title}</Typography></Stack><Button onClick={onAdd} size="small" startIcon={<AddOutlinedIcon />} variant="outlined">{addLabel}</Button></Stack>{loading ? <Typography role="status">Loading {title.toLowerCase()}…</Typography> : null}{error ? <Alert action={onRetry ? <Button color="inherit" onClick={onRetry}>Retry</Button> : undefined} severity="error">{error}</Alert> : null}{!loading && !error ? <>{!hasRecords ? <Alert severity="info">{empty}</Alert> : null}{children}</> : null}</Stack></Paper>;

const courseTypeLabels = {
  FullTime: 'Full-time',
  PartTime: 'Part-time',
  CorrespondenceDistance: 'Distance learning',
} as const;

const parseProfileDate = (value: string | null): Date | null => {
  if (!value) return null;
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatEmploymentDate = (value: string | null): string => {
  const parsed = parseProfileDate(value);
  return parsed ? new Intl.DateTimeFormat('en-IN', { month: 'short', timeZone: 'UTC', year: 'numeric' }).format(parsed) : 'Date not specified';
};

const formatEmploymentDuration = (startValue: string, endValue: string | null, now = new Date()): string => {
  const start = parseProfileDate(startValue);
  const end = parseProfileDate(endValue) ?? now;
  if (!start || end < start) return 'Duration unavailable';
  const totalMonths = Math.max(0, (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth());
  if (totalMonths === 0) return 'Less than 1 mo';
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return [years ? `${years} ${years === 1 ? 'yr' : 'yrs'}` : null, months ? `${months} mos` : null].filter(Boolean).join(' ');
};

const EducationDialog = ({ open, onClose, onSave, values, setValues, error, isEditing, isSaving }: { open:boolean; onClose:()=>void; onSave:()=>void; values:typeof emptyEducation; setValues:Dispatch<SetStateAction<typeof emptyEducation>>; error:string|null; isEditing:boolean; isSaving:boolean }) => (
  <Dialog aria-describedby="education-dialog-description" fullWidth maxWidth="sm" onClose={isSaving ? undefined : onClose} open={open}>
    <DialogTitle>{isEditing ? 'Edit education' : 'Add education'}</DialogTitle>
    <DialogContent>
      <Typography color="text.secondary" id="education-dialog-description" sx={{ mb: 2 }} variant="body2">
        Add the academic details that are relevant to your candidate profile.
      </Typography>
      <Stack spacing={2}>
        <TextField disabled={isSaving} label="Education level" onChange={(event) => setValues((current) => ({ ...current, qualification: event.target.value }))} required value={values.qualification} />
        <TextField disabled={isSaving} label="University / institute" onChange={(event) => setValues((current) => ({ ...current, institution: event.target.value }))} required value={values.institution} />
        <TextField disabled={isSaving} label="Course / specialization" onChange={(event) => setValues((current) => ({ ...current, fieldOfStudy: event.target.value }))} value={values.fieldOfStudy} />
        <TextField disabled={isSaving} label="Course type" onChange={(event) => setValues((current) => ({ ...current, courseType: event.target.value }))} select value={values.courseType}>
          <MenuItem value="">Not specified</MenuItem>
          {Object.entries(courseTypeLabels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
        </TextField>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField disabled={isSaving} inputProps={{ min: 1900, max: 2100 }} label="Start year" onChange={(event) => setValues((current) => ({ ...current, startYear: event.target.value }))} type="number" value={values.startYear} />
          <TextField disabled={isSaving || values.isCurrentlyStudying} inputProps={{ min: 1900, max: 2100 }} label="End year" onChange={(event) => setValues((current) => ({ ...current, endYear: event.target.value }))} type="number" value={values.endYear} />
        </Stack>
        <FormControlLabel control={<Checkbox checked={values.isCurrentlyStudying} disabled={isSaving} onChange={(event) => setValues((current) => ({ ...current, isCurrentlyStudying: event.target.checked, endYear: event.target.checked ? '' : current.endYear }))} />} label="Currently studying" />
        <TextField disabled={isSaving} label="Grading system" onChange={(event) => setValues((current) => ({ ...current, gradingSystem: event.target.value }))} value={values.gradingSystem} />
        <TextField disabled={isSaving} label="Grade / score" onChange={(event) => setValues((current) => ({ ...current, grade: event.target.value }))} value={values.grade} />
        {error ? <Alert aria-live="assertive" severity="error">{error}</Alert> : null}
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button disabled={isSaving} onClick={onClose}>Cancel</Button>
      <Button disabled={isSaving} onClick={onSave} variant="contained">{isSaving ? 'Saving…' : 'Save education'}</Button>
    </DialogActions>
  </Dialog>
);
const employmentTypeLabels: Partial<Record<EmploymentType, string>> = {
  [EmploymentType.FullTime]: 'Full-time',
  [EmploymentType.Internship]: 'Internship',
};

const EmploymentDialog = ({ open, onClose, onSave, values, setValues, error, isEditing, isSaving }: { open:boolean; onClose:()=>void; onSave:()=>void; values:typeof emptyExperience; setValues:Dispatch<SetStateAction<typeof emptyExperience>>; error:string|null; isEditing:boolean; isSaving:boolean }) => (
  <Dialog aria-describedby="employment-dialog-description" fullWidth maxWidth="sm" onClose={isSaving ? undefined : onClose} open={open}>
    <DialogTitle>{isEditing ? 'Edit employment' : 'Add employment'}</DialogTitle>
    <DialogContent>
      <Typography color="text.secondary" id="employment-dialog-description" sx={{ mb: 2 }} variant="body2">Salary and notice period stay private in your candidate profile.</Typography>
      <Stack spacing={2}>
        <FormControl disabled={isSaving}>
          <FormLabel id="current-company-label">Is this your current company?</FormLabel>
          <RadioGroup aria-labelledby="current-company-label" onChange={(event) => setValues((current) => ({ ...current, isCurrent: event.target.value === 'yes', endDate: event.target.value === 'yes' ? '' : current.endDate }))} row value={values.isCurrent ? 'yes' : 'no'}>
            <FormControlLabel control={<Radio />} label="Yes" value="yes" />
            <FormControlLabel control={<Radio />} label="No" value="no" />
          </RadioGroup>
        </FormControl>
        <TextField disabled={isSaving} label="Employment type" onChange={(event) => setValues((current) => ({ ...current, employmentType: event.target.value }))} required select value={values.employmentType}>
          <MenuItem value="">Select employment type</MenuItem>
          <MenuItem value={EmploymentType.FullTime}>Full-time</MenuItem>
          <MenuItem value={EmploymentType.Internship}>Internship</MenuItem>
        </TextField>
        <TextField disabled={isSaving} label="Company name" onChange={(event) => setValues((current) => ({ ...current, companyName: event.target.value }))} required value={values.companyName} />
        <TextField disabled={isSaving} label="Job title" onChange={(event) => setValues((current) => ({ ...current, jobTitle: event.target.value }))} required value={values.jobTitle} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField disabled={isSaving} InputLabelProps={{ shrink: true }} label="Joining date" onChange={(event) => setValues((current) => ({ ...current, startDate: event.target.value }))} required type="date" value={values.startDate} />
          <TextField disabled={isSaving || values.isCurrent} InputLabelProps={{ shrink: true }} label="Leaving date" onChange={(event) => setValues((current) => ({ ...current, endDate: event.target.value }))} required={!values.isCurrent} type="date" value={values.endDate} />
        </Stack>
        <TextField disabled={isSaving} inputProps={{ min: 0 }} label="Current annual salary — private" onChange={(event) => setValues((current) => ({ ...current, annualSalary: event.target.value }))} type="number" value={values.annualSalary} />
        <TextField disabled={isSaving} label="Skills used" onChange={(event) => setValues((current) => ({ ...current, skillsUsed: event.target.value }))} placeholder="e.g. React, TypeScript, Accessibility" value={values.skillsUsed} />
        <TextField disabled={isSaving} label="Job profile / responsibilities" multiline minRows={3} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))} value={values.description} />
        <TextField disabled={isSaving} label="Notice period — private" onChange={(event) => setValues((current) => ({ ...current, noticePeriod: event.target.value }))} value={values.noticePeriod} />
        {error ? <Alert aria-live="assertive" severity="error">{error}</Alert> : null}
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button disabled={isSaving} onClick={onClose}>Cancel</Button>
      <Button disabled={isSaving} onClick={onSave} variant="contained">{isSaving ? 'Saving…' : 'Save employment'}</Button>
    </DialogActions>
  </Dialog>
);
