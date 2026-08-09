import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminJobDiscoveryPage } from './AdminJobDiscoveryPage';
import { AdminJobDiscoveryRunPage } from './AdminJobDiscoveryRunPage';

const mocks = vi.hoisted(() => ({
  commit: vi.fn(),
  detailsResult: {},
  preview: vi.fn(),
  run: vi.fn(),
  runState: {},
  runsResult: {},
}));

vi.mock('@/features/admin/api/adminApi', () => ({
  isAdminApiError: (error: unknown) => Boolean(error && typeof error === 'object' && 'message' in error),
  useCommitAdminJobDiscoveryMutation: () => [mocks.commit, { isLoading: false }],
  useGetAdminJobDiscoveryRunQuery: () => mocks.detailsResult,
  useGetAdminJobDiscoveryRunsQuery: () => mocks.runsResult,
  usePreviewAdminJobDiscoveryMutation: () => [mocks.preview, { isLoading: false }],
  useRunAdminJobDiscoveryMutation: () => [mocks.run, mocks.runState],
}));

const run = {
  candidateCount: 2, completedAtUtc: '2026-08-10T10:01:00Z', duplicateCount: 1,
  errorSummary: null, id: 'a4f14bb7-d7af-447a-863c-17fb036ad9ac', importedCount: 0,
  startedAtUtc: '2026-08-10T10:00:00Z', status: 'Completed', trigger: 'Manual',
};
const candidate = {
  applicationUrl: 'https://jobs.example/one', categoryName: 'Engineering', companyName: 'HARMAN',
  createdAtUtc: '2026-08-10T10:00:30Z', description: null, duplicateReason: null, employmentType: null, existingJobId: null,
  id: '11111111-1111-4111-8111-111111111111', importedJobId: null, location: 'Pune',
  provider: 'ApprovedProvider', publishedAtUtc: null, sourceJobId: 'source-1',
  status: 'Candidate', title: 'Frontend Engineer',
};
const duplicate = { ...candidate, duplicateReason: 'Application URL already exists', id: '22222222-2222-4222-8222-222222222222', status: 'Duplicate', title: 'Duplicate role' };
const preview = { canCommit: true, duplicateRows: 0, importedRows: 0, invalidRows: 0, rows: [{ categoryResolution: 'Reuse Engineering', companyResolution: 'Reuse HARMAN', errors: [], rowNumber: 2, status: 'Valid' }], skippedRows: 0, totalRows: 1, validRows: 1 };

describe('admin job discovery pages', () => {
  beforeEach(() => {
    mocks.run.mockReset(); mocks.preview.mockReset(); mocks.commit.mockReset();
    mocks.runState = { error: undefined, isLoading: false };
    mocks.runsResult = { data: [], isError: false, isLoading: false, refetch: vi.fn() };
    mocks.detailsResult = { data: { ...run, items: [candidate, duplicate] }, error: undefined, isError: false, isLoading: false, refetch: vi.fn() };
  });

  it('navigates to review after a successful run and renders backend provider failures', async () => {
    mocks.run.mockReturnValue({ unwrap: () => Promise.resolve(run) });
    const { unmount } = render(<MemoryRouter initialEntries={['/admin/jobs/discovery']}><Routes><Route path="/admin/jobs/discovery" element={<AdminJobDiscoveryPage />} /><Route path="/admin/jobs/discovery/:runId" element={<div>Run review destination</div>} /></Routes></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Run discovery now' }));
    expect(await screen.findByText('Run review destination')).toBeInTheDocument();
    unmount();

    mocks.runState = { error: { message: 'No discovery provider is configured.' }, isLoading: false };
    render(<MemoryRouter><AdminJobDiscoveryPage /></MemoryRouter>);
    expect(screen.getByText(/administrator must configure the discovery provider on the server/i)).toBeInTheDocument();
  });

  it('selects only valid jobs, previews before commit, and imports selected IDs as Draft', async () => {
    mocks.preview.mockReturnValue({ unwrap: () => Promise.resolve(preview) });
    mocks.commit.mockReturnValue({ unwrap: () => Promise.resolve({ import: { ...preview, importedRows: 1 }, selected: 1 }) });
    render(<MemoryRouter initialEntries={[`/admin/jobs/discovery/${run.id}`]}><Routes><Route path="/admin/jobs/discovery/:runId" element={<AdminJobDiscoveryRunPage />} /></Routes></MemoryRouter>);

    expect(screen.getByRole('checkbox', { name: 'Select Duplicate role' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Import selected as drafts' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Frontend Engineer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Preview selected import' }));
    await screen.findByText('Import preview');
    expect(mocks.preview).toHaveBeenCalledWith({ request: { itemIds: [candidate.id] }, runId: run.id });
    fireEvent.click(screen.getByRole('button', { name: 'Import selected as drafts' }));
    fireEvent.click(screen.getByRole('button', { name: 'Import selected as drafts' }));
    await waitFor(() => expect(mocks.commit).toHaveBeenCalledWith({ request: { itemIds: [candidate.id] }, runId: run.id }));
    expect(await screen.findByText(/1 jobs imported as Draft/)).toBeInTheDocument();
    expect(screen.queryByText(/Published/)).not.toBeInTheDocument();
  });

  it('renders the current flat DTO safely when items and optional values are absent', () => {
    mocks.detailsResult = {
      data: { ...run, completedAtUtc: null, errorSummary: null, items: undefined },
      error: undefined, isError: false, isLoading: false, refetch: vi.fn(),
    };
    render(<MemoryRouter initialEntries={[`/admin/jobs/discovery/${run.id}`]}><Routes><Route path="/admin/jobs/discovery/:runId" element={<AdminJobDiscoveryRunPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: `Review run ${run.id.slice(0, 8)}` })).toBeInTheDocument();
    expect(screen.getByText('No discovery items were returned for this run.')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows a retryable API error state', () => {
    mocks.detailsResult = {
      data: undefined, error: { message: 'Discovery run was not found.' },
      isError: true, isLoading: false, refetch: vi.fn(),
    };
    render(<MemoryRouter initialEntries={[`/admin/jobs/discovery/${run.id}`]}><Routes><Route path="/admin/jobs/discovery/:runId" element={<AdminJobDiscoveryRunPage />} /></Routes></MemoryRouter>);
    expect(screen.getByText('Discovery run was not found.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
