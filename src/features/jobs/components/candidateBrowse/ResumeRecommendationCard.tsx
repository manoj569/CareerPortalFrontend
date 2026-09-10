import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Alert, Box, Button, Chip, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import type { ChangeEventHandler, RefObject } from 'react';

import { ResumeExtractionStatus } from '@/features/dashboard/types/dashboardModels';
import {
  RESUME_UPLOAD_HELP_TEXT,
  sanitizeResumeFileName,
} from '@/features/dashboard/utils/resumeValidation';

interface ResumeRecommendationCardProps {
  error: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  fileName?: string;
  hasResume: boolean;
  isDownloading: boolean;
  isRefreshing: boolean;
  isUploading: boolean;
  lastUpdatedUtc?: string;
  onDownload: () => void;
  onFileChange: ChangeEventHandler<HTMLInputElement>;
  onRefresh: () => void;
  onUpload: () => void;
  status?: ResumeExtractionStatus;
}

export const ResumeRecommendationCard = ({
  error,
  fileInputRef,
  fileName,
  hasResume,
  isDownloading,
  isRefreshing,
  isUploading,
  lastUpdatedUtc,
  onDownload,
  onFileChange,
  onRefresh,
  onUpload,
  status,
}: ResumeRecommendationCardProps) => {
  const isProcessing = status === ResumeExtractionStatus.Processing;
  const isReady = status === ResumeExtractionStatus.Ready;
  const isFailed = status === ResumeExtractionStatus.Failed;
  const displayFileName = fileName ? sanitizeResumeFileName(fileName, '') : '';
  const updatedDate = lastUpdatedUtc ? new Date(lastUpdatedUtc) : null;
  const lastUpdated = updatedDate && !Number.isNaN(updatedDate.valueOf())
    ? updatedDate.toLocaleString()
    : null;

  return (
    <Paper component="section" sx={{ overflow: 'hidden', p: { xs: 2, sm: 2.5 } }}>
      <Stack alignItems={{ xs: 'stretch', xl: 'center' }} direction={{ xs: 'column', xl: 'row' }} justifyContent="space-between" spacing={2}>
        <Box minWidth={0}>
          <Stack alignItems="center" direction="row" flexWrap="wrap" gap={1}>
            <Typography component="h2" variant="h3">Resume-powered recommendations</Typography>
            {isReady ? (
              <Chip
                color="success"
                icon={<CheckCircleOutlineIcon />}
                label="Ready"
                size="small"
                sx={{ bgcolor: 'success.50', fontWeight: 800 }}
                variant="outlined"
              />
            ) : null}
          </Stack>
          {!hasResume ? (
            <Stack spacing={0.5} sx={{ mt: 0.75 }}>
              <Typography color="text.secondary">
                Upload your resume to get personalized job matches.
              </Typography>
              <Typography color="text.secondary" variant="caption">
                {RESUME_UPLOAD_HELP_TEXT}
              </Typography>
            </Stack>
          ) : (
            <>
              {displayFileName ? (
                <Typography noWrap sx={{ mt: 0.75 }} title={displayFileName}>
                  {displayFileName}
                </Typography>
              ) : null}
              <Typography color={isFailed ? 'error' : 'text.secondary'} variant="body2">
                {isProcessing ? 'Analyzing resume…' : isReady ? 'Resume analyzed' : isFailed ? 'Your resume is stored, but recommendations could not be prepared.' : 'Preparing recommendations'}
              </Typography>
              {lastUpdated ? <Typography color="text.secondary" variant="caption">Updated {lastUpdated}</Typography> : null}
              {isReady ? <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">Jobs below are ranked using your skills, experience and preferences.</Typography> : null}
            </>
          )}
          {error ? <Alert aria-live="assertive" severity="error" sx={{ mt: 1 }}>{error}</Alert> : null}
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap" gap={1} sx={{ flexShrink: 0 }}>
          {hasResume && isReady ? <Button disabled={isDownloading} onClick={onDownload} startIcon={<DownloadOutlinedIcon />} variant="outlined">{isDownloading ? 'Downloading…' : 'Download resume'}</Button> : null}
          <Button disabled={isUploading} onClick={onUpload} startIcon={<CloudUploadOutlinedIcon />} variant={hasResume ? 'outlined' : 'contained'}>
            {isUploading ? 'Uploading…' : hasResume ? 'Update resume' : 'Upload resume'}
          </Button>
          {hasResume ? (
            <Button
              disabled={isProcessing || isRefreshing}
              onClick={onRefresh}
              startIcon={<RefreshIcon />}
              variant="outlined"
            >
              {isRefreshing ? 'Refreshing…' : isFailed ? 'Retry status' : 'Refresh matches'}
            </Button>
          ) : null}
        </Stack>
      </Stack>
      {isProcessing || isUploading ? <LinearProgress aria-label={isUploading ? 'Uploading resume' : 'Analyzing resume'} sx={{ mt: 2 }} /> : null}
      <input accept=".pdf,.doc,.docx" aria-label="Choose resume" hidden onChange={onFileChange} ref={fileInputRef} type="file" />
    </Paper>
  );
};
