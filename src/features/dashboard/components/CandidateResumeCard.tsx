import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { forwardRef, useImperativeHandle, useRef, useState, type ChangeEvent } from 'react';

import {
  downloadCandidateResume,
  isDashboardApiError,
  useGetResumeStatusQuery,
  useUploadResumeMutation,
} from '@/features/dashboard/api/dashboardApi';
import {
  ResumeExtractionStatus,
  type ResumeMetadata,
} from '@/features/dashboard/types/dashboardModels';
import { formatDashboardDate } from '@/features/dashboard/utils/dashboardFormatting';
import {
  RESUME_UPLOAD_HELP_TEXT,
  sanitizeResumeFileName,
  validateResume,
} from '@/features/dashboard/utils/resumeValidation';

interface CandidateResumeCardProps {
  resume: ResumeMetadata | null;
  onResumeUpdated?: (resume: ResumeMetadata) => void;
}

export interface CandidateResumeCardHandle {
  chooseFile: () => void;
}

export const CandidateResumeCard = forwardRef<CandidateResumeCardHandle, CandidateResumeCardProps>(
  ({ resume, onResumeUpdated }, ref) => {
    const fileInput = useRef<HTMLInputElement>(null);
    const resumeStatus = useGetResumeStatusQuery();
    const [uploadResume, uploadState] = useUploadResumeMutation();
    const [error, setError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const status = resumeStatus.data?.extractionStatus;
    const hasResume = Boolean(resumeStatus.data?.hasResume || resume);
    const isProcessing = status === ResumeExtractionStatus.Processing;
    const isReady = status === ResumeExtractionStatus.Ready;
    const isFailed = status === ResumeExtractionStatus.Failed;
    const displayFileName = sanitizeResumeFileName(resume?.fileName);
    const isBusy = uploadState.isLoading || isDownloading || isProcessing;

    const chooseFile = () => {
      if (!isBusy) fileInput.current?.click();
    };
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
        const uploadedResume = await uploadResume(file).unwrap();
        onResumeUpdated?.(uploadedResume);
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

    const download = async () => {
      if (!resume || isDownloading) return;
      setError(null);
      setIsDownloading(true);
      let objectUrl: string | null = null;
      try {
        const blob = await downloadCandidateResume();
        objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = sanitizeResumeFileName(resume.fileName, 'resume.pdf');
        anchor.click();
        enqueueSnackbar('Resume download started.', { variant: 'success' });
      } catch (downloadError: unknown) {
        setError(
          isDashboardApiError(downloadError)
            ? downloadError.message
            : 'Unable to download your resume. Please try again.',
        );
      } finally {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        setIsDownloading(false);
      }
    };

    return (
      <Paper
        component="section"
        id="candidate-profile-resume"
        sx={{ border: 1, borderColor: 'divider', height: '100%', p: { xs: 2.5, sm: 3 } }}
      >
        <Stack spacing={2}>
          <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
            <Stack alignItems="center" direction="row" spacing={1}>
              <DescriptionOutlinedIcon color="primary" />
              <Typography component="h2" variant="h3">Resume</Typography>
            </Stack>
            {hasResume && !resumeStatus.isLoading ? (
              <Chip color={isFailed ? 'error' : isReady ? 'success' : 'default'} label={resumeStatusLabel(status)} size="small" variant="outlined" />
            ) : null}
          </Stack>

          {error ? <Alert aria-live="assertive" severity="error">{error}</Alert> : null}

          {resumeStatus.isLoading ? (
            <Skeleton aria-label="Loading resume status" height={92} variant="rounded" />
          ) : resumeStatus.isError ? (
            <Stack alignItems="flex-start" spacing={1}>
              <Alert severity="error">Resume status is temporarily unavailable.</Alert>
              <Button onClick={() => void resumeStatus.refetch()} size="small" variant="outlined">Retry resume status</Button>
            </Stack>
          ) : hasResume ? (
            <Stack spacing={1}>
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={800} sx={{ overflowWrap: 'anywhere' }}>{displayFileName}</Typography>
                {resume?.uploadedAtUtc ? (
                  <Typography color="text.secondary" variant="body2">
                    Uploaded {formatDashboardDate(resume.uploadedAtUtc) ?? 'date unavailable'}
                  </Typography>
                ) : null}
              </Box>
              {isProcessing ? (
                <>
                  <Typography color="text.secondary" variant="body2">Your resume is being prepared for recommendations.</Typography>
                  <LinearProgress aria-label="Processing resume" />
                </>
              ) : null}
              {isFailed ? (
                <Alert severity="warning">Your resume is stored, but recommendations could not be prepared. You can upload an updated file.</Alert>
              ) : null}
              <Stack direction={{ xs: 'column', sm: 'row', lg: 'column' }} spacing={1}>
                {isReady && resume ? (
                  <Button disabled={isDownloading} onClick={() => void download()} startIcon={<CloudDownloadOutlinedIcon />} variant="contained">
                    {isDownloading ? 'Downloading…' : 'Download'}
                  </Button>
                ) : null}
                <Button disabled={isBusy} onClick={chooseFile} startIcon={<CloudUploadOutlinedIcon />} variant={isReady ? 'outlined' : 'contained'}>
                  {uploadState.isLoading ? 'Uploading…' : 'Update resume'}
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Stack alignItems="flex-start" spacing={1.25}>
              <Typography color="text.secondary">Add a resume to your private candidate profile.</Typography>
              <Typography color="text.secondary" variant="caption">{RESUME_UPLOAD_HELP_TEXT}</Typography>
              <Button disabled={uploadState.isLoading} onClick={chooseFile} startIcon={<CloudUploadOutlinedIcon />} variant="contained">
                {uploadState.isLoading ? 'Uploading…' : 'Upload resume'}
              </Button>
            </Stack>
          )}

          <input
            accept=".pdf,.doc,.docx"
            aria-label={resume ? 'Choose replacement resume' : 'Choose resume'}
            hidden
            onChange={(event) => void handleFile(event)}
            ref={fileInput}
            type="file"
          />
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
      return 'Failed';
    default:
      return 'Stored';
  }
};
