import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiRequestError } from '@/api/apiError';
import { renderWithProviders } from '@/test/renderWithProviders';
import { AtsType, type JobSource } from '@/features/admin/types/jobSourceModels';
import { AdminJobSourcesPage } from './AdminJobSourcesPage';

const { request } = vi.hoisted(() => ({
  request:
    vi.fn<
      (config: { url: string; method: string; data?: unknown }) => Promise<{ data: unknown }>
    >(),
}));
vi.mock('@/api/apiClient', () => ({ apiClient: { request } }));
const source: JobSource = {
  id: 'source-1',
  companyId: 'company-1',
  companyName: 'Together AI',
  careerPageUrl: 'https://example.com/careers',
  atsType: AtsType.Greenhouse,
  atsIdentifier: 'togetherai',
  isActive: true,
  scanIntervalMinutes: 720,
  lastRunAtUtc: null,
  lastSuccessfulRunAtUtc: null,
  lastError: null,
  consecutiveFailures: 0,
  categoryId: null,
  categoryName: null,
  createdAtUtc: '2026-09-20T00:00:00Z',
  updatedAtUtc: null,
};
const runResult = {
  jobSourceId: source.id,
  totalReceived: 78,
  created: 0,
  matched: 78,
  skipped: 0,
  failed: 0,
  succeeded: true,
  error: null,
};
let items: JobSource[];
let runResponse: typeof runResult;
const renderPage = () =>
  renderWithProviders(
    <MemoryRouter>
      <AdminJobSourcesPage />
    </MemoryRouter>,
  );
const firstButton = (name: string) => screen.getAllByRole('button', { name })[0]!;
const confirm = async (rowAction: string, confirmAction: string) => {
  fireEvent.click(firstButton(rowAction));
  const dialog = await screen.findByRole('dialog');
  fireEvent.click(within(dialog).getByRole('button', { name: confirmAction }));
};

describe('job sources administrator workflow', () => {
  beforeEach(() => {
    items = [{ ...source }];
    runResponse = { ...runResult };
    request.mockReset();
    request.mockImplementation(
      ({ url, method, data }: { url: string; method: string; data?: unknown }) => {
        if (url.endsWith('/options'))
          return Promise.resolve({
            data: {
              data: [{ id: source.companyId, name: source.companyName, slug: 'together-ai' }],
            },
          });
        if (url.endsWith('/run')) return Promise.resolve({ data: { data: runResponse } });
        if (method === 'POST' || method === 'PUT')
          return Promise.resolve({ data: { data: { ...source, ...(data as object) } } });
        if (method === 'DELETE') {
          items = [];
          return Promise.resolve({ data: undefined });
        }
        if (url.endsWith('/source-1')) return Promise.resolve({ data: { data: source } });
        return Promise.resolve({
          data: {
            data: { items, pageNumber: 1, pageSize: 100, totalCount: items.length, totalPages: 1 },
          },
        });
      },
    );
  });

  it('renders sources, null dates, intervals, summary and draft-review link', async () => {
    renderPage();
    expect(await screen.findByRole('table', { name: 'Job sources' })).toBeInTheDocument();
    expect(screen.getAllByText('Never').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Every 12 hours').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Not configured').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Review draft jobs' })).toHaveAttribute(
      'href',
      '/admin/jobs?status=1',
    );
  });

  it('shows loading and an empty state', async () => {
    items = [];
    renderPage();
    expect(screen.getByText('Loading job sources')).toBeInTheDocument();
    expect(await screen.findByText('No job sources configured yet.')).toBeInTheDocument();
  });

  it('recovers from API failure with Retry', async () => {
    request.mockRejectedValueOnce(new ApiRequestError({ message: 'Unavailable', status: 500 }));
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('table')).toBeInTheDocument();
  });

  it('searches by company and identifier and applies status and ATS filters', async () => {
    renderPage();
    await screen.findByRole('table');
    fireEvent.change(screen.getByLabelText('Search sources'), { target: { value: 'no match' } });
    expect(screen.getByText('No matching job sources')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Search sources'), { target: { value: 'togetherai' } });
    expect(screen.getByRole('table')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Status' }));
    fireEvent.click(screen.getByRole('option', { name: 'Inactive' }));
    expect(screen.getByText('No matching job sources')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Status' }));
    fireEvent.click(screen.getByRole('option', { name: 'All Status' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'ATS' }));
    fireEvent.click(screen.getByRole('option', { name: 'Lever' }));
    expect(screen.getByText('No matching job sources')).toBeInTheDocument();
  });

  it('shows full server-provided source error in a dialog', async () => {
    items = [{ ...source, lastError: 'External job source run failed.', consecutiveFailures: 2 }];
    renderPage();
    await screen.findByRole('table');
    fireEvent.click(firstButton('Error'));
    expect(
      within(screen.getByRole('dialog')).getByText('External job source run failed.'),
    ).toBeInTheDocument();
  });

  it('confirms deletion and refreshes the list', async () => {
    renderPage();
    await screen.findByRole('table');
    fireEvent.click(firstButton('Delete'));
    expect(request.mock.calls.some(([config]) => config.method === 'DELETE')).toBe(false);
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete Job Source' }),
    );
    expect(await screen.findByText('No job sources configured yet.')).toBeInTheDocument();
  });

  it('preserves editable values when deactivating', async () => {
    renderPage();
    await screen.findByRole('table');
    await confirm('Deactivate', 'Deactivate Job Source');
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          data: {
            companyId: source.companyId,
            careerPageUrl: source.careerPageUrl,
            atsType: 1,
            atsIdentifier: 'togetherai',
            scanIntervalMinutes: 720,
            isActive: false,
          },
        }),
      ),
    );
  });

  it('activates inactive sources and disables running them before activation', async () => {
    items = [{ ...source, isActive: false }];
    renderPage();
    await screen.findByRole('table');
    expect(firstButton('Run Now')).toBeDisabled();
    await confirm('Activate', 'Activate Job Source');
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          data: expect.objectContaining({ isActive: true }) as unknown,
        }),
      ),
    );
  });

  it('accepts a successful deduplication run with zero created and refreshes bookkeeping', async () => {
    renderPage();
    await screen.findByRole('table');
    await confirm('Run Now', 'Run Now');
    expect(await screen.findByText('Aggregation Complete')).toBeInTheDocument();
    expect(screen.getByText('Created: 0')).toBeInTheDocument();
    expect(screen.getByText('Matched: 78')).toBeInTheDocument();
    await waitFor(() =>
      expect(
        request.mock.calls.filter(([config]) => config.url === '/admin/job-sources').length,
      ).toBeGreaterThan(1),
    );
  });

  it('renders a failed run response even when HTTP succeeds', async () => {
    runResponse = { ...runResult, succeeded: false, failed: 1 };
    renderPage();
    await screen.findByRole('table');
    await confirm('Run Now', 'Run Now');
    expect(await screen.findByText('Aggregation Failed')).toBeInTheDocument();
    expect(screen.getByText('Succeeded: No')).toBeInTheDocument();
  });

  it('preserves the actual 409 explanation and prevents repeat clicks while running', async () => {
    renderPage();
    await screen.findByRole('table');
    let rejectRun: (error: Error) => void = () => {};
    request.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectRun = reject;
        }),
    );
    await confirm('Run Now', 'Run Now');
    expect(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Working…' }),
    ).toBeDisabled();
    rejectRun(
      new ApiRequestError({
        status: 409,
        message: 'Job source is already running or being updated.',
      }),
    );
    expect(
      await within(screen.getByRole('dialog')).findByText(
        'Job source is already running or being updated.',
      ),
    ).toBeInTheDocument();
  });

  it('validates add and saves a selected company using the exact contract', async () => {
    renderPage();
    await screen.findByRole('table');
    fireEvent.click(firstButton('+ Add Job Source'));
    const dialog = within(screen.getByRole('dialog'));
    await waitFor(() =>
      expect(dialog.getByRole('button', { name: 'Save Job Source' })).toBeEnabled(),
    );
    fireEvent.click(dialog.getByRole('button', { name: 'Save Job Source' }));
    expect(await dialog.findByText('Select a company.')).toBeInTheDocument();
    fireEvent.change(dialog.getByRole('combobox', { name: /Company/ }), {
      target: { value: 'Together' },
    });
    fireEvent.click(await screen.findByRole('option', { name: 'Together AI' }));
    fireEvent.change(dialog.getByRole('textbox', { name: /Career Page URL/ }), {
      target: { value: 'https://example.com/careers' },
    });
    fireEvent.change(dialog.getByRole('textbox', { name: /ATS Identifier/ }), {
      target: { value: 'togetherai' },
    });
    fireEvent.click(dialog.getByRole('button', { name: 'Save Job Source' }));
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/admin/job-sources',
          data: {
            companyId: 'company-1',
            careerPageUrl: 'https://example.com/careers',
            atsType: 1,
            atsIdentifier: 'togetherai',
            isActive: true,
            scanIntervalMinutes: 720,
          },
        }),
      ),
    );
  });

  it('loads detail values before editing and saves a changed interval', async () => {
    renderPage();
    await screen.findByRole('table');
    fireEvent.click(firstButton('Edit'));
    const dialog = within(await screen.findByRole('dialog'));
    expect(dialog.getByRole('textbox', { name: /ATS Identifier/ })).toHaveValue('togetherai');
    fireEvent.change(dialog.getByRole('spinbutton', { name: /Scan Interval/ }), {
      target: { value: '90' },
    });
    await waitFor(() =>
      expect(dialog.getByRole('button', { name: 'Save Job Source' })).toBeEnabled(),
    );
    fireEvent.click(dialog.getByRole('button', { name: 'Save Job Source' }));
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          data: expect.objectContaining({ scanIntervalMinutes: 90 }) as unknown,
        }),
      ),
    );
  });
});
