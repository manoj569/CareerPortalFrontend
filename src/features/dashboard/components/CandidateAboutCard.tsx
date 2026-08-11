import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { useForm } from 'react-hook-form';

import { applyApiValidationErrors } from '@/api/formErrors';
import {
  isDashboardApiError,
  useUpdateCandidateAboutMutation,
} from '@/features/dashboard/api/dashboardApi';
import type { UserProfile } from '@/features/dashboard/types/dashboardModels';
import {
  candidateAboutSchema,
  type CandidateAboutFormValues,
} from '@/features/dashboard/validation/dashboardSchemas';

interface CandidateAboutCardProps {
  profile: UserProfile;
}

export interface CandidateAboutCardHandle {
  openEditor: () => void;
}

export const CandidateAboutCard = forwardRef<CandidateAboutCardHandle, CandidateAboutCardProps>(
  ({ profile }, ref) => {
    const [open, setOpen] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [updateAbout, updateState] = useUpdateCandidateAboutMutation();
    const {
      formState: { errors },
      handleSubmit,
      register,
      reset,
      setError,
      watch,
    } = useForm<CandidateAboutFormValues>({
      defaultValues: { profileSummary: '', resumeHeadline: '' },
      mode: 'onTouched',
      resolver: yupResolver(candidateAboutSchema),
    });

    const openEditor = () => {
      reset({
        profileSummary: profile.bio ?? '',
        resumeHeadline: profile.headline ?? '',
      });
      setServerError(null);
      setOpen(true);
    };

    useImperativeHandle(ref, () => ({ openEditor }));

    const closeEditor = () => {
      if (!updateState.isLoading) setOpen(false);
    };

    const submit = async (values: CandidateAboutFormValues) => {
      setServerError(null);
      try {
        await updateAbout({
          profileSummary: values.profileSummary.trim() || null,
          resumeHeadline: values.resumeHeadline.trim() || null,
        }).unwrap();
        setOpen(false);
        enqueueSnackbar('Headline and summary updated.', { variant: 'success' });
      } catch (error: unknown) {
        const hasFieldErrors = applyApiValidationErrors<CandidateAboutFormValues>(
          error,
          ['resumeHeadline', 'profileSummary'],
          setError,
        );
        setServerError(
          hasFieldErrors
            ? 'Review the highlighted fields and try again.'
            : isDashboardApiError(error)
              ? error.message
              : 'Unable to update your headline and summary. Please try again.',
        );
      }
    };

    const resumeHeadline = watch('resumeHeadline');
    const profileSummary = watch('profileSummary');

    return (
      <>
        <Paper component="section" sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack spacing={2}>
            <Stack
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              spacing={1.5}
            >
              <Typography component="h2" variant="h3">
                About
              </Typography>
              <Button onClick={openEditor} variant="outlined">
                Edit headline and summary
              </Button>
            </Stack>
            <Stack spacing={0.75}>
              <Typography fontWeight={700} variant="body2">
                Resume headline
              </Typography>
              <Typography color={profile.headline ? 'text.primary' : 'text.secondary'}>
                {profile.headline ?? 'Add a concise headline that describes your professional focus.'}
              </Typography>
            </Stack>
            <Stack spacing={0.75}>
              <Typography fontWeight={700} variant="body2">
                Profile summary
              </Typography>
              <Typography
                color={profile.bio ? 'text.primary' : 'text.secondary'}
                sx={{ whiteSpace: 'pre-wrap' }}
              >
                {profile.bio ?? 'Add a summary of your experience, strengths, and career direction.'}
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        <Dialog fullWidth maxWidth="sm" onClose={closeEditor} open={open}>
          <DialogTitle>Edit headline and summary</DialogTitle>
          <DialogContent>
            <Stack
              component="form"
              id="candidate-about-form"
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
                disabled={updateState.isLoading}
                error={Boolean(errors.resumeHeadline)}
                fullWidth
                helperText={errors.resumeHeadline?.message}
                label="Resume headline"
                slotProps={{ htmlInput: { maxLength: 180 } }}
                {...register('resumeHeadline')}
              />
              <Typography aria-live="polite" color="text.secondary" textAlign="right" variant="caption">
                {resumeHeadline.length}/180
              </Typography>
              <TextField
                disabled={updateState.isLoading}
                error={Boolean(errors.profileSummary)}
                fullWidth
                helperText={errors.profileSummary?.message}
                label="Profile summary"
                minRows={6}
                multiline
                slotProps={{ htmlInput: { maxLength: 2000 } }}
                {...register('profileSummary')}
              />
              <Typography aria-live="polite" color="text.secondary" textAlign="right" variant="caption">
                {profileSummary.length}/2000
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button disabled={updateState.isLoading} onClick={closeEditor}>
              Cancel
            </Button>
            <Button
              disabled={updateState.isLoading}
              form="candidate-about-form"
              type="submit"
              variant="contained"
            >
              {updateState.isLoading ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  },
);

CandidateAboutCard.displayName = 'CandidateAboutCard';
