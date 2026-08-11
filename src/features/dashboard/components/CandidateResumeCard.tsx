import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { Alert, Button, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { forwardRef, useImperativeHandle, useRef, useState, type ChangeEvent } from 'react';

import {
  isDashboardApiError,
  useGetResumeStatusQuery,
  useUploadResumeMutation,
} from '@/features/dashboard/api/dashboardApi';
import {
  ResumeExtractionStatus,
  type ResumeMetadata,
} from '@/features/dashboard/types/dashboardModels';
import { validateResume } from '@/features/dashboard/utils/resumeValidation';

interface CandidateResumeCardProps {
  resume: ResumeMetadata | null;
}

export interface CandidateResumeCardHandle {
  chooseFile: () => void;
}

export const CandidateResumeCard = forwardRef<CandidateResumeCardHandle, CandidateResumeCardProps>(
  ({ resume }, ref) => {
    const fileInput = useRef<HTMLInputElement>(null);
    const resumeStatus = useGetResumeStatusQuery();
    const [uploadResume, uploadState] = useUploadResumeMutation();
    const [error, setError] = useState<string | null>(null);

    const chooseFile = () => fileInput.current?.click();
    useImperativeHandle(ref, () => ({ chooseFile }));

    const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      const validationError = validateResume(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      try {
        await uploadResume(file).unwrap();
        enqueueSnackbar(resume ? 'Resume replaced successfully.' : 'Resume uploaded.', {
          variant: 'success',
        });
      } catch (uploadError: unknown) {
        setError(
          isDashboardApiError(uploadError)
            ? uploadError.message
            : 'Unable to upload your resume. Please try again.',
        );
      }
    };

    return (
      <Paper component="section" sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack spacing={2}>
          <Stack
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={1.5}
          >
            <Stack minWidth={0} spacing={0.5}>
              <Typography component="h2" variant="h3">
                Resume
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Upload a PDF, DOC, or DOCX file up to 5 MB using the secure candidate resume flow.
              </Typography>
            </Stack>
            <Button
              disabled={uploadState.isLoading}
              onClick={chooseFile}
              startIcon={<CloudUploadOutlinedIcon />}
              variant={resume ? 'outlined' : 'contained'}
            >
              {uploadState.isLoading ? 'Uploading…' : resume ? 'Replace resume' : 'Upload resume'}
            </Button>
            <input
              accept=".pdf,.doc,.docx"
              aria-label={resume ? 'Choose replacement resume' : 'Choose resume'}
              hidden
              onChange={(event) => void handleFile(event)}
              ref={fileInput}
              type="file"
            />
          </Stack>

          {error ? (
            <Alert aria-live="assertive" severity="error">
              {error}
            </Alert>
          ) : null}

          {resumeStatus.isLoading ? (
            <Skeleton aria-label="Loading resume status" height={66} variant="rounded" />
          ) : resumeStatus.isError ? (
            <Stack alignItems="flex-start" spacing={1}>
              <Alert severity="error">Resume status is temporarily unavailable.</Alert>
              <Button onClick={() => void resumeStatus.refetch()} size="small" variant="outlined">
                Retry resume status
              </Button>
            </Stack>
          ) : resumeStatus.data?.hasResume || resume ? (
            <Stack spacing={0.5}>
              <Typography fontWeight={800}>{resume?.fileName ?? 'Resume uploaded'}</Typography>
              <Typography
                color={
                  resumeStatus.data?.extractionStatus === ResumeExtractionStatus.Failed
                    ? 'error'
                    : 'text.secondary'
                }
                variant="body2"
              >
                {resumeStatusLabel(resumeStatus.data?.extractionStatus)}
              </Typography>
            </Stack>
          ) : (
            <Typography color="text.secondary">No resume uploaded yet.</Typography>
          )}
        </Stack>
      </Paper>
    );
  },
);

CandidateResumeCard.displayName = 'CandidateResumeCard';

const resumeStatusLabel = (status: ResumeExtractionStatus | undefined): string => {
  switch (status) {
    case ResumeExtractionStatus.Processing:
      return 'Processing';
    case ResumeExtractionStatus.Ready:
      return 'Ready';
    case ResumeExtractionStatus.Failed:
      return 'Failed — your resume is stored, but recommendations could not be prepared.';
    default:
      return 'Stored securely';
  }
};
