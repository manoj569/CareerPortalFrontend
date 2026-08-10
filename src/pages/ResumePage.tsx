import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useRef, useState, type ChangeEvent } from 'react';

import { ErrorState } from '@/components/feedback/ErrorState';
import {
  downloadCandidateResume,
  isDashboardApiError,
  useDeleteResumeMutation,
  useGetProfileQuery,
  useUploadResumeMutation,
} from '@/features/dashboard/api/dashboardApi';
import { DashboardPageHeader } from '@/features/dashboard/components/DashboardPageHeader';
import { formatDashboardDate } from '@/features/dashboard/utils/dashboardFormatting';
import { isAllowedResumeExtension, validateResume } from '@/features/dashboard/utils/resumeValidation';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const formatFileSize = (sizeBytes: number): string =>
  sizeBytes < 1024 * 1024
    ? `${Math.max(1, Math.round(sizeBytes / 1024))} KB`
    : `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;

const safeDownloadName = (value: string): string => {
  const extension = value.slice(value.lastIndexOf('.')).toLowerCase();
  return isAllowedResumeExtension(value) ? `resume${extension}` : 'resume.pdf';
};

export const ResumePage = () => {
  useDocumentMetadata(
    'Resume | Career Portal',
    'Securely upload and manage the resume attached to your candidate profile.',
  );
  const fileInput = useRef<HTMLInputElement>(null);
  const profile = useGetProfileQuery();
  const [uploadResume, uploadState] = useUploadResumeMutation();
  const [deleteResume, deleteState] = useDeleteResumeMutation();
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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
      enqueueSnackbar(profile.data?.resume ? 'Resume replaced successfully.' : 'Resume uploaded.', {
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

  const handleDownload = async () => {
    if (!profile.data?.resume) return;
    setError(null);
    setIsDownloading(true);
    try {
      const blob = await downloadCandidateResume();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = safeDownloadName(profile.data.resume.fileName);
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (downloadError: unknown) {
      setError(
        isDashboardApiError(downloadError)
          ? downloadError.message
          : 'Unable to download your resume. Please try again.',
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    try {
      await deleteResume().unwrap();
      setConfirmDelete(false);
      enqueueSnackbar('Resume deleted.', { variant: 'success' });
    } catch (deleteError: unknown) {
      setError(
        isDashboardApiError(deleteError)
          ? deleteError.message
          : 'Unable to delete your resume. Please try again.',
      );
    }
  };

  if (profile.isLoading) {
    return (
      <Stack aria-label="Loading resume" role="status" spacing={3}>
        <Skeleton height={76} variant="rounded" />
        <Skeleton height={280} variant="rounded" />
      </Stack>
    );
  }

  if (profile.isError || !profile.data) {
    return <ErrorState headingLevel="h1" onRetry={() => void profile.refetch()} />;
  }

  const resume = profile.data.resume;
  const isWorking = uploadState.isLoading || isDownloading || deleteState.isLoading;

  return (
    <Stack spacing={4}>
      <DashboardPageHeader
        description="Your resume is stored securely and copied to new applications when you submit them."
        eyebrow="Candidate profile"
        title="Resume"
      />

      {error ? (
        <Alert aria-live="assertive" severity="error">
          {error}
        </Alert>
      ) : null}

      <Paper component="section" sx={{ p: { xs: 3, md: 4 } }}>
        <Stack alignItems="flex-start" spacing={2.5}>
          {resume ? (
            <>
              <Stack spacing={0.5}>
                <Typography component="h2" variant="h3">
                  Current resume
                </Typography>
                <Typography fontWeight={700}>{resume.fileName}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {formatFileSize(resume.sizeBytes)} · uploaded{' '}
                  {formatDashboardDate(resume.uploadedAtUtc) ?? 'date unavailable'}
                </Typography>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  disabled={isWorking}
                  onClick={() => void handleDownload()}
                  startIcon={<CloudDownloadOutlinedIcon />}
                  variant="contained"
                >
                  {isDownloading ? 'Downloading…' : 'Download resume'}
                </Button>
                <Button
                  component="label"
                  disabled={isWorking}
                  startIcon={<CloudUploadOutlinedIcon />}
                  variant="outlined"
                >
                  {uploadState.isLoading ? 'Replacing…' : 'Replace resume'}
                  <input
                    ref={fileInput}
                    accept=".pdf,.doc,.docx"
                    aria-label="Choose replacement resume"
                    hidden
                    onChange={(event) => void handleFile(event)}
                    type="file"
                  />
                </Button>
                <Button
                  color="error"
                  disabled={isWorking}
                  onClick={() => setConfirmDelete(true)}
                  startIcon={<DeleteOutlineIcon />}
                >
                  Delete
                </Button>
              </Stack>
            </>
          ) : (
            <>
              <Stack spacing={0.75}>
                <Typography component="h2" variant="h3">
                  No resume uploaded
                </Typography>
                <Typography color="text.secondary">
                  Add a PDF, DOC, or DOCX resume up to 5 MB. The server validates its file signature
                  before storing it.
                </Typography>
              </Stack>
              <Button
                component="label"
                disabled={isWorking}
                startIcon={<CloudUploadOutlinedIcon />}
                variant="contained"
              >
                {uploadState.isLoading ? 'Uploading…' : 'Upload resume'}
                <input
                  accept=".pdf,.doc,.docx"
                  aria-label="Choose resume"
                  hidden
                  onChange={(event) => void handleFile(event)}
                  type="file"
                />
              </Button>
            </>
          )}
        </Stack>
      </Paper>

      <Dialog
        aria-describedby="delete-resume-description"
        aria-labelledby="delete-resume-title"
        onClose={() => !deleteState.isLoading && setConfirmDelete(false)}
        open={confirmDelete}
      >
        <DialogTitle id="delete-resume-title">Delete resume?</DialogTitle>
        <DialogContent>
          <Typography id="delete-resume-description">
            This removes the resume from your profile. Resume copies already attached to submitted
            applications are retained by the backend.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button disabled={deleteState.isLoading} onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button
            color="error"
            disabled={deleteState.isLoading}
            onClick={() => void handleDelete()}
            variant="contained"
          >
            {deleteState.isLoading ? 'Deleting…' : 'Delete resume'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
