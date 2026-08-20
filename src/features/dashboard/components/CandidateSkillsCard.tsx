import { yupResolver } from '@hookform/resolvers/yup';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { applyApiValidationErrors } from '@/api/formErrors';
import { ConfirmActionDialog } from '@/features/admin/components/ConfirmActionDialog';
import {
  isDashboardApiError,
  useAddCandidateSkillMutation,
  useDeleteCandidateSkillMutation,
  useGetCandidateSkillsQuery,
  useUpdateCandidateSkillMutation,
} from '@/features/dashboard/api/dashboardApi';
import type {
  CandidateSkill,
  UpsertCandidateSkillRequest,
} from '@/features/dashboard/types/dashboardModels';
import {
  candidateSkillSchema,
  type CandidateSkillFormValues,
} from '@/features/dashboard/validation/dashboardSchemas';

const proficiencyOptions = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;

export interface CandidateSkillsCardHandle {
  focusSection: () => void;
}

export const CandidateSkillsCard = forwardRef<CandidateSkillsCardHandle>((_, ref) => {
  const skills = useGetCandidateSkillsQuery();
  const [addSkill, addState] = useAddCandidateSkillMutation();
  const [updateSkill, updateState] = useUpdateCandidateSkillMutation();
  const [deleteSkill, deleteState] = useDeleteCandidateSkillMutation();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<CandidateSkill | null>(null);
  const [deletingSkill, setDeletingSkill] = useState<CandidateSkill | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const addButtonId = 'candidate-add-skill';
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<CandidateSkillFormValues>({
    defaultValues: { name: '', proficiency: '', yearsOfExperience: '' },
    mode: 'onTouched',
    resolver: yupResolver(candidateSkillSchema),
  });

  const openEditor = (skill: CandidateSkill | null) => {
    setEditingSkill(skill);
    setServerError(null);
    reset({
      name: skill?.name ?? '',
      proficiency: skill?.proficiency ?? '',
      yearsOfExperience: skill?.yearsOfExperience?.toString() ?? '',
    });
    setEditorOpen(true);
  };

  useImperativeHandle(ref, () => ({
    focusSection: () => {
      document.getElementById(addButtonId)?.focus();
      document.getElementById(addButtonId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  }));

  const submit = async (values: CandidateSkillFormValues) => {
    setServerError(null);
    const data: UpsertCandidateSkillRequest = {
      name: values.name.trim(),
      proficiency: values.proficiency || null,
      yearsOfExperience: values.yearsOfExperience ? Number(values.yearsOfExperience) : null,
    };
    try {
      if (editingSkill) await updateSkill({ data, skillId: editingSkill.id }).unwrap();
      else await addSkill(data).unwrap();
      setEditorOpen(false);
      enqueueSnackbar(editingSkill ? 'Skill updated.' : 'Skill added.', { variant: 'success' });
    } catch (error: unknown) {
      const hasFieldErrors = applyApiValidationErrors<CandidateSkillFormValues>(
        error,
        ['name', 'proficiency', 'yearsOfExperience'],
        setError,
      );
      setServerError(
        hasFieldErrors
          ? 'Review the highlighted skill fields and try again.'
          : isDashboardApiError(error)
            ? error.message
            : 'Unable to save this skill. Please try again.',
      );
    }
  };

  const confirmDelete = async () => {
    if (!deletingSkill) return;
    setDeleteError(null);
    try {
      await deleteSkill(deletingSkill.id).unwrap();
      setDeletingSkill(null);
      enqueueSnackbar('Skill deleted.', { variant: 'success' });
    } catch (error: unknown) {
      setDeleteError(
        isDashboardApiError(error) ? error.message : 'Unable to delete this skill. Please try again.',
      );
    }
  };

  const isSaving = addState.isLoading || updateState.isLoading;

  return (
    <>
      <Paper
        component="section"
        id="candidate-profile-skills"
        sx={{ border: 1, borderColor: 'divider', height: '100%', p: { xs: 2.5, sm: 3 } }}
      >
        <Stack spacing={2.5}>
          <Stack
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={1.5}
          >
            <BoxHeading />
            <Button
              disabled={isSaving}
              id={addButtonId}
              onClick={() => openEditor(null)}
              startIcon={<AddOutlinedIcon />}
              variant="contained"
            >
              Add skill
            </Button>
          </Stack>

          {skills.isLoading ? (
            <Stack aria-label="Loading key skills" role="status" spacing={1.5}>
              <Skeleton height={86} variant="rounded" />
              <Skeleton height={86} variant="rounded" />
            </Stack>
          ) : skills.isError ? (
            <Stack alignItems="flex-start" spacing={1.5}>
              <Alert severity="error">Your key skills could not be loaded.</Alert>
              <Button onClick={() => void skills.refetch()} variant="outlined">
                Retry skills
              </Button>
            </Stack>
          ) : !skills.data?.length ? (
            <Stack alignItems="flex-start" spacing={1.5}>
              <Typography color="text.secondary">
                Add skills to help employers understand your strengths.
              </Typography>
              <Button disabled={isSaving} onClick={() => openEditor(null)} variant="outlined">
                Add your first skill
              </Button>
            </Stack>
          ) : (
            <Stack component="ul" direction="row" flexWrap="wrap" gap={1.25} sx={{ listStyle: 'none', m: 0, p: 0 }}>
              {skills.data.map((skill) => (
                <Stack
                  alignItems="center"
                  component="li"
                  direction="row"
                  key={skill.id}
                  spacing={0.25}
                  sx={{ bgcolor: 'action.hover', border: 1, borderColor: 'divider', borderRadius: 5, pl: 0.5, pr: 0.25 }}
                >
                  <Chip
                    label={skill.name}
                    title={[skill.proficiency, formatYears(skill.yearsOfExperience)].filter(Boolean).join(' · ') || undefined}
                    sx={{ bgcolor: 'transparent', fontWeight: 750 }}
                  />
                  <Tooltip title={`Edit ${skill.name}`}>
                    <Button aria-label={`Edit ${skill.name}`} onClick={() => openEditor(skill)} size="small" sx={{ minWidth: 44, px: 0 }}>
                      <EditOutlinedIcon fontSize="small" />
                    </Button>
                  </Tooltip>
                  <Tooltip title={`Delete ${skill.name}`}>
                    <Button aria-label={`Delete ${skill.name}`} color="error" onClick={() => setDeletingSkill(skill)} size="small" sx={{ minWidth: 44, px: 0 }}>
                      <DeleteOutlineIcon fontSize="small" />
                    </Button>
                  </Tooltip>
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>

      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={() => !isSaving && setEditorOpen(false)}
        open={editorOpen}
      >
        <DialogTitle>{editingSkill ? `Edit ${editingSkill.name}` : 'Add skill'}</DialogTitle>
        <DialogContent>
          <Stack
            component="form"
            id="candidate-skill-form"
            noValidate
            onSubmit={(event) => void handleSubmit(submit)(event)}
            spacing={2.5}
            sx={{ pt: 1 }}
          >
            {serverError ? (
              <Alert aria-live="assertive" severity="error">
                {serverError}
              </Alert>
            ) : null}
            <TextField
              autoFocus
              disabled={isSaving}
              error={Boolean(errors.name)}
              fullWidth
              helperText={errors.name?.message}
              label="Skill name"
              required
              slotProps={{ htmlInput: { maxLength: 100 } }}
              {...register('name')}
            />
            <Controller
              control={control}
              name="proficiency"
              render={({ field }) => (
                <FormControl error={Boolean(errors.proficiency)} fullWidth>
                  <InputLabel id="skill-proficiency-label">Proficiency</InputLabel>
                  <Select
                    {...field}
                    disabled={isSaving}
                    label="Proficiency"
                    labelId="skill-proficiency-label"
                  >
                    <MenuItem value="">Not specified</MenuItem>
                    {proficiencyOptions.map((value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{errors.proficiency?.message ?? 'Optional'}</FormHelperText>
                </FormControl>
              )}
            />
            <TextField
              disabled={isSaving}
              error={Boolean(errors.yearsOfExperience)}
              fullWidth
              helperText={errors.yearsOfExperience?.message ?? 'Optional · between 0 and 50'}
              label="Years of experience"
              slotProps={{ htmlInput: { max: 50, min: 0, step: 0.1 } }}
              type="number"
              {...register('yearsOfExperience')}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={isSaving} onClick={() => setEditorOpen(false)}>
            Cancel
          </Button>
          <Button disabled={isSaving} form="candidate-skill-form" type="submit" variant="contained">
            {isSaving ? 'Saving…' : editingSkill ? 'Save skill' : 'Add skill'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmActionDialog
        actionLabel="Delete skill"
        description={
          deletingSkill ? `Delete ${deletingSkill.name} from your key skills?` : 'Delete this skill?'
        }
        error={deleteError}
        isProcessing={deleteState.isLoading}
        onClose={() => {
          if (!deleteState.isLoading) setDeletingSkill(null);
        }}
        onConfirm={() => void confirmDelete()}
        open={Boolean(deletingSkill)}
        title={deletingSkill ? `Delete ${deletingSkill.name}?` : 'Delete skill?'}
      />
    </>
  );
});

CandidateSkillsCard.displayName = 'CandidateSkillsCard';

const BoxHeading = () => (
  <Stack spacing={0.5}>
    <Stack alignItems="center" direction="row" spacing={1}>
      <PsychologyOutlinedIcon color="primary" />
      <Typography component="h2" variant="h3">
        Key skills
      </Typography>
    </Stack>
    <Typography color="text.secondary" variant="body2">
      Keep a structured list of the skills most relevant to your career.
    </Typography>
  </Stack>
);

const formatYears = (years: number | null): string | null => {
  if (years === null) return null;
  return `${years} ${years === 1 ? 'year' : 'years'} experience`;
};
