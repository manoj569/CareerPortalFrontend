import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useMemo, useState } from 'react';

import {
  downloadAdminImportTemplate,
  isAdminApiError,
  useCommitAdminCompaniesImportMutation,
  useCommitAdminJobsImportMutation,
  usePreviewAdminCompaniesImportMutation,
  usePreviewAdminJobsImportMutation,
} from '@/features/admin/api/adminApi';
import type { AdminCsvImportKind, AdminCsvImportResult } from '@/features/admin/types/adminModels';

const MAXIMUM_CSV_SIZE_BYTES = 5 * 1024 * 1024;

const copyByKind: Record<
  AdminCsvImportKind,
  { entityLabel: string; fileName: string; title: string }
> = {
  companies: {
    entityLabel: 'companies',
    fileName: 'companies-template.csv',
    title: 'Import companies CSV',
  },
  jobs: {
    entityLabel: 'jobs',
    fileName: 'jobs-template.csv',
    title: 'Import jobs CSV',
  },
};

const validateCsvFile = (file: File): string | null => {
  if (!file.name.toLowerCase().endsWith('.csv')) return 'Select a file with a .csv extension.';
  if (file.size === 0) return 'The CSV file is empty.';
  if (file.size > MAXIMUM_CSV_SIZE_BYTES) return 'The CSV file must be 5 MB or smaller.';
  return null;
};

interface AdminCsvImportDialogProps {
  kind: AdminCsvImportKind;
  onClose: () => void;
  open: boolean;
}

export const AdminCsvImportDialog = ({ kind, onClose, open }: AdminCsvImportDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [preview, setPreview] = useState<AdminCsvImportResult | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewCompanies, previewCompaniesState] = usePreviewAdminCompaniesImportMutation();
  const [commitCompanies, commitCompaniesState] = useCommitAdminCompaniesImportMutation();
  const [previewJobs, previewJobsState] = usePreviewAdminJobsImportMutation();
  const [commitJobs, commitJobsState] = useCommitAdminJobsImportMutation();
  const copy = copyByKind[kind];
  const isPreviewing =
    kind === 'companies' ? previewCompaniesState.isLoading : previewJobsState.isLoading;
  const isCommitting =
    kind === 'companies' ? commitCompaniesState.isLoading : commitJobsState.isLoading;
  const isBusy = isPreviewing || isCommitting || isDownloading;
  const errorRows = useMemo(
    () => preview?.rows.filter((row) => row.errors.length > 0) ?? [],
    [preview],
  );

  const reset = () => {
    setSelectedFile(null);
    setFileError(null);
    setRequestError(null);
    setPreview(null);
  };

  const closeDialog = () => {
    if (isBusy) return;
    reset();
    onClose();
  };

  const selectFile = (file: File | undefined) => {
    setPreview(null);
    setRequestError(null);
    if (!file) {
      setSelectedFile(null);
      setFileError(null);
      return;
    }

    const validationError = validateCsvFile(file);
    setFileError(validationError);
    setSelectedFile(validationError ? null : file);
  };

  const previewFile = async () => {
    if (!selectedFile || isBusy) return;
    setRequestError(null);
    try {
      const result =
        kind === 'companies'
          ? await previewCompanies(selectedFile).unwrap()
          : await previewJobs(selectedFile).unwrap();
      setPreview(result);
    } catch (error: unknown) {
      setPreview(null);
      setRequestError(
        isAdminApiError(error)
          ? error.message
          : 'The CSV preview could not be completed. Please try again.',
      );
    }
  };

  const commitFile = async () => {
    if (!selectedFile || !preview?.canCommit || preview.invalidRows > 0 || isBusy) return;

    setRequestError(null);
    try {
      const result =
        kind === 'companies'
          ? await commitCompanies(selectedFile).unwrap()
          : await commitJobs(selectedFile).unwrap();
      enqueueSnackbar(
        `CSV import complete: ${result.importedRows} imported, ${result.skippedRows} skipped.`,
        { variant: 'success' },
      );
      reset();
      onClose();
    } catch (error: unknown) {
      setRequestError(
        isAdminApiError(error)
          ? error.message
          : 'The CSV import could not be completed. Please try again.',
      );
    }
  };

  const downloadTemplate = async () => {
    if (isBusy) return;
    setRequestError(null);
    setIsDownloading(true);
    try {
      const blob = await downloadAdminImportTemplate(kind);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = copy.fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error: unknown) {
      setRequestError(
        isAdminApiError(error)
          ? error.message
          : 'The CSV template could not be downloaded. Please try again.',
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog
      aria-describedby="admin-csv-import-description"
      fullWidth
      maxWidth="md"
      onClose={closeDialog}
      open={open}
    >
      <DialogTitle>{copy.title}</DialogTitle>
      {(isPreviewing || isCommitting) && <LinearProgress aria-label="CSV import in progress" />}
      <DialogContent dividers>
        <Stack spacing={3}>
          <Typography color="text.secondary" id="admin-csv-import-description">
            Download the template, add your {copy.entityLabel}, then preview every row before
            importing. The file must be UTF-8 CSV and no larger than 5 MB.
          </Typography>

          <Stack
            alignItems={{ xs: 'stretch', sm: 'center' }}
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
          >
            <Button
              component="label"
              disabled={isBusy}
              startIcon={<UploadFileOutlinedIcon />}
              variant="outlined"
            >
              Select CSV file
              <input
                accept=".csv,text/csv"
                aria-label={`Select ${copy.entityLabel} CSV file`}
                hidden
                onChange={(event) => {
                  selectFile(event.target.files?.[0]);
                  event.target.value = '';
                }}
                type="file"
              />
            </Button>
            <Button
              disabled={isBusy}
              onClick={() => void downloadTemplate()}
              startIcon={<DownloadOutlinedIcon />}
            >
              Download template
            </Button>
            <Typography
              aria-live="polite"
              color="text.secondary"
              sx={{ overflowWrap: 'anywhere' }}
              variant="body2"
            >
              {selectedFile?.name ?? 'No file selected'}
            </Typography>
          </Stack>

          {fileError ? <Alert severity="error">{fileError}</Alert> : null}
          {requestError ? <Alert severity="error">{requestError}</Alert> : null}

          {preview ? (
            <Stack aria-live="polite" spacing={2.5}>
              <Grid container spacing={1.5}>
                {[
                  ['Total rows', preview.totalRows],
                  ['Valid rows', preview.validRows],
                  ['Invalid rows', preview.invalidRows],
                  ['Duplicates', preview.duplicateRows],
                ].map(([label, value]) => (
                  <Grid key={String(label)} size={{ xs: 6, sm: 3 }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="text.secondary" variant="body2">
                          {label}
                        </Typography>
                        <Typography component="p" fontWeight={800} variant="h4">
                          {value}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {preview.invalidRows > 0 ? (
                <Alert severity="warning">
                  Correct every invalid row and preview the updated file before importing.
                </Alert>
              ) : preview.canCommit ? (
                <Alert severity="success">Preview passed. This file is ready to import.</Alert>
              ) : (
                <Alert severity="info">The backend has not approved this file for import.</Alert>
              )}

              {errorRows.length > 0 ? (
                <TableContainer sx={{ maxHeight: 320 }}>
                  <Table aria-label="CSV row errors" size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Row</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Field</TableCell>
                        <TableCell>Error</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {errorRows.flatMap((row) =>
                        row.errors.map((error, index) => (
                          <TableRow key={`${row.rowNumber}-${error.field}-${index}`}>
                            <TableCell>{row.rowNumber}</TableCell>
                            <TableCell>{row.status}</TableCell>
                            <TableCell>{error.field}</TableCell>
                            <TableCell sx={{ overflowWrap: 'anywhere' }}>{error.message}</TableCell>
                          </TableRow>
                        )),
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : null}
            </Stack>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1, px: 3, py: 2 }}>
        <Button disabled={isBusy} onClick={closeDialog}>
          Cancel
        </Button>
        <Button disabled={!selectedFile || isBusy} onClick={() => void previewFile()}>
          Preview
        </Button>
        <Button
          disabled={!selectedFile || !preview?.canCommit || preview.invalidRows > 0 || isBusy}
          onClick={() => void commitFile()}
          variant="contained"
        >
          {isCommitting ? 'Importing…' : 'Commit import'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
