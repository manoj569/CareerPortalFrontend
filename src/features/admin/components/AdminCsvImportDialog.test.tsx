import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as AdminApiModule from '@/features/admin/api/adminApi';
import type { AdminCsvImportResult } from '@/features/admin/types/adminModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import { AdminCsvImportDialog } from './AdminCsvImportDialog';

const mocks = vi.hoisted(() => ({
  commitJobs: vi.fn(),
  downloadTemplate: vi.fn(),
  previewJobs: vi.fn(),
}));

vi.mock('@/features/admin/api/adminApi', async (importOriginal) => {
  const actual = await importOriginal<typeof AdminApiModule>();
  const mutationState = { isLoading: false };
  return {
    ...actual,
    downloadAdminImportTemplate: mocks.downloadTemplate,
    useCommitAdminJobsImportMutation: () => [mocks.commitJobs, mutationState],
    usePreviewAdminJobsImportMutation: () => [mocks.previewJobs, mutationState],
  };
});

const validPreview: AdminCsvImportResult = {
  canCommit: true,
  duplicateRows: 1,
  importedRows: 0,
  invalidRows: 0,
  rows: [
    { errors: [], rowNumber: 2, status: 'Valid' },
    { errors: [], rowNumber: 3, status: 'Skip duplicate' },
  ],
  skippedRows: 1,
  totalRows: 3,
  validRows: 2,
};

const triggerResult = <T,>(result: T) => ({ unwrap: vi.fn().mockResolvedValue(result) });

describe('Administrator CSV import dialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.previewJobs.mockImplementation(() => triggerResult(validPreview));
    mocks.commitJobs.mockImplementation(() => triggerResult({ ...validPreview, importedRows: 2 }));
    mocks.downloadTemplate.mockResolvedValue(new Blob(['header\nvalue'], { type: 'text/csv' }));
  });

  it('previews and commits the same selected file after backend approval', async () => {
    const onClose = vi.fn();
    const file = new File(['title\nFrontend Engineer'], 'jobs.csv', { type: 'text/csv' });
    renderWithProviders(<AdminCsvImportDialog onClose={onClose} open />);

    await userEvent.upload(screen.getByLabelText('Select Job CSV file'), file);
    expect(screen.getByText('jobs.csv')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Commit import' })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Preview import' }));
    expect(mocks.previewJobs).toHaveBeenCalledWith(file);
    expect(await screen.findByText('Preview passed. This file is ready to import.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Commit import' })).toBeEnabled();

    await userEvent.click(screen.getByRole('button', { name: 'Commit import' }));
    expect(mocks.commitJobs).toHaveBeenCalledWith(file);
    expect(await screen.findByText('CSV import complete: 2 imported, 1 skipped.')).toBeVisible();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('blocks invalid file types and files larger than 5 MB before upload', async () => {
    renderWithProviders(<AdminCsvImportDialog onClose={vi.fn()} open />);
    const input = screen.getByLabelText('Select Job CSV file');

    await userEvent.upload(input, new File(['not csv'], 'companies.txt', { type: 'text/plain' }), {
      applyAccept: false,
    });
    expect(screen.getByText('Select a file with a .csv extension.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Preview import' })).toBeDisabled();

    const oversizedFile = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'companies.csv', {
      type: 'text/csv',
    });
    await userEvent.upload(input, oversizedFile);
    expect(screen.getByText('The CSV file must be 5 MB or smaller.')).toBeVisible();
    expect(mocks.previewJobs).not.toHaveBeenCalled();
  });

  it('clears a previous preview when a new file is selected', async () => {
    renderWithProviders(<AdminCsvImportDialog onClose={vi.fn()} open />);
    const input = screen.getByLabelText('Select Job CSV file');

    await userEvent.upload(input, new File(['name\nOne'], 'one.csv', { type: 'text/csv' }));
    await userEvent.click(screen.getByRole('button', { name: 'Preview import' }));
    expect(await screen.findByText('Preview passed. This file is ready to import.')).toBeVisible();

    await userEvent.upload(input, new File(['name\nTwo'], 'two.csv', { type: 'text/csv' }));
    expect(screen.queryByText('Preview passed. This file is ready to import.')).toBeNull();
    expect(screen.getByRole('button', { name: 'Commit import' })).toBeDisabled();
  });

  it('shows backend row errors safely and never enables commit for invalid rows', async () => {
    const invalidPreview: AdminCsvImportResult = {
      ...validPreview,
      canCommit: false,
      invalidRows: 1,
      rows: [
        {
          errors: [{ field: 'title', message: '<img src=x onerror=alert(1)>' }],
          rowNumber: 4,
          status: 'Invalid',
        },
      ],
      validRows: 0,
    };
    mocks.previewJobs.mockImplementation(() => triggerResult(invalidPreview));
    renderWithProviders(<AdminCsvImportDialog onClose={vi.fn()} open />);

    await userEvent.upload(
      screen.getByLabelText('Select Job CSV file'),
      new File(['title\n'], 'jobs.csv', { type: 'text/csv' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Preview import' }));

    expect(await screen.findByRole('table', { name: 'CSV row errors' })).toBeVisible();
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeVisible();
    expect(document.querySelector('img[src="x"]')).toBeNull();
    expect(screen.getByRole('button', { name: 'Commit import' })).toBeDisabled();
  });

  it('downloads the correct backend template', async () => {
    const createObjectUrl = vi.fn().mockReturnValue('blob:template');
    const revokeObjectUrl = vi.fn();
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectUrl,
      revokeObjectURL: revokeObjectUrl,
    });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    renderWithProviders(<AdminCsvImportDialog onClose={vi.fn()} open />);

    await userEvent.click(screen.getByRole('button', { name: 'Download job CSV template' }));
    await waitFor(() => expect(mocks.downloadTemplate).toHaveBeenCalledWith('jobs'));
    expect(createObjectUrl).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:template');

    click.mockRestore();
    vi.unstubAllGlobals();
  });
});
