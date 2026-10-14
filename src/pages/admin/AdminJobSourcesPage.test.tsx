import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiRequestError } from '@/api/apiError';
import { renderWithProviders } from '@/test/renderWithProviders';
import {
  AtsType,
  type JobSource,
  type DurableJobSourceRun,
} from '@/features/admin/types/jobSourceModels';
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
  autoPublishEnabled: true,
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
const runResult: DurableJobSourceRun = {
  runId: 'run-1',
  status: 'Succeeded',
  statusUrl: '/api/admin/job-sources/source-1/runs/run-1',
  retryPending: false,
  attemptCount: 1,
  completedAtUtc: '2026-10-09T00:00:00Z',
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
        if (url.endsWith('/run') || url.includes('/runs/'))
          return Promise.resolve({ data: { data: runResponse } });
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

  it('displays and filters SuccessFactors while retaining existing provider mappings', async () => {
    expect([
      AtsType.Custom,
      AtsType.Greenhouse,
      AtsType.Lever,
      AtsType.Ashby,
      AtsType.SuccessFactors,
    ]).toEqual([0, 1, 2, 3, 4]);
    items = [{ ...source, atsType: AtsType.SuccessFactors, atsIdentifier: '718244' }];
    renderPage();
    const table = await screen.findByRole('table', { name: 'Job sources' });
    expect(within(table).getByText('SuccessFactors')).toBeVisible();
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'ATS' }));
    fireEvent.click(screen.getByRole('option', { name: 'SuccessFactors' }));
    expect(within(table).getByText('718244')).toBeVisible();
  });

  it('loads SuccessFactors in edit and sends its numeric type and unchanged identifier', async () => {
    items = [{ ...source, atsType: AtsType.SuccessFactors, atsIdentifier: '718244' }];
    request.mockImplementation(({ url, method, data }) => {
      if (url.endsWith('/options'))
        return Promise.resolve({
          data: { data: [{ id: source.companyId, name: source.companyName, slug: 'together-ai' }] },
        });
      if (method === 'PUT')
        return Promise.resolve({ data: { data: { ...source, ...(data as object) } } });
      if (url.endsWith('/source-1'))
        return Promise.resolve({
          data: { data: { ...source, atsType: 4, atsIdentifier: '718244' } },
        });
      return Promise.resolve({
        data: { data: { items, pageNumber: 1, pageSize: 100, totalCount: 1, totalPages: 1 } },
      });
    });
    renderPage();
    await screen.findByRole('table');
    fireEvent.click(firstButton('Edit'));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('combobox', { name: 'ATS Type' })).toHaveTextContent(
      'SuccessFactors',
    );
    expect(within(dialog).getByLabelText(/ATS Identifier/)).toHaveValue('718244');
    expect(within(dialog).getByText('Board / career-site identifier')).toBeVisible();
    await waitFor(() => expect(within(dialog).getByRole('button', { name: /Save/ })).toBeEnabled());
    fireEvent.click(within(dialog).getByRole('button', { name: /Save/ }));
    await waitFor(() =>
      expect(
        request.mock.calls.find(([config]) => config.method === 'PUT')?.[0].data,
      ).toMatchObject({ atsType: 4, atsIdentifier: '718244' }),
    );
  });

  it('selects SuccessFactors in Add and creates a source with identifier 718244', async () => {
    renderPage();
    await screen.findByRole('table');
    fireEvent.click(firstButton('+ Add Job Source'));
    const dialog = within(await screen.findByRole('dialog'));
    await waitFor(() =>
      expect(dialog.getByRole('button', { name: 'Save Job Source' })).toBeEnabled(),
    );
    fireEvent.change(dialog.getByRole('combobox', { name: /Company/ }), {
      target: { value: 'Together' },
    });
    fireEvent.click(await screen.findByRole('option', { name: 'Together AI' }));
    fireEvent.change(dialog.getByRole('textbox', { name: /Career Page URL/ }), {
      target: { value: 'https://southasiacareers.deloitte.com/go/Deloitte-India/718244' },
    });
    fireEvent.mouseDown(dialog.getByRole('combobox', { name: 'ATS Type' }));
    for (const name of ['Greenhouse', 'Lever', 'Ashby', 'Custom', 'SuccessFactors'])
      expect(screen.getByRole('option', { name })).toBeVisible();
    fireEvent.click(screen.getByRole('option', { name: 'SuccessFactors' }));
    fireEvent.change(dialog.getByRole('textbox', { name: /ATS Identifier/ }), {
      target: { value: '718244' },
    });
    fireEvent.click(dialog.getByRole('button', { name: 'Save Job Source' }));
    await waitFor(() =>
      expect(
        request.mock.calls.find(([config]) => config.method === 'POST')?.[0].data,
      ).toMatchObject({ atsType: 4, atsIdentifier: '718244' }),
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
            autoPublishEnabled: true,
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

  it('treats HTTP 202 as Queued, blocks duplicate clicks and waits for authenticated GET status', async () => {
    const fallback = request.getMockImplementation()!;
    let resolveStatus!: (response: { data: unknown }) => void;
    request.mockImplementation((config) => {
      if (config.url.endsWith('/run'))
        return Promise.resolve({
          status: 202,
          data: { data: { ...runResult, status: 'Queued', succeeded: false } },
        });
      if (config.url.includes('/runs/'))
        return new Promise((resolve) => {
          resolveStatus = resolve;
        });
      return fallback(config);
    });
    const view = renderPage();
    await screen.findByRole('table');
    await confirm('Run Now', 'Run Now');
    expect(await screen.findByText('Aggregation Queued')).toBeInTheDocument();
    expect(screen.queryByText('Aggregation Complete')).not.toBeInTheDocument();
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Aggregation Queued' })).getByRole('button', {
        name: 'Close',
      }),
    );
    await waitFor(() => expect(firstButton('Queued')).toBeDisabled());
    fireEvent.click(firstButton('Queued'));
    expect(request.mock.calls.filter(([config]) => config.method === 'POST')).toHaveLength(1);
    resolveStatus({ data: { data: { ...runResult, status: 'Running', succeeded: false } } });
    await waitFor(() => expect(firstButton('Running')).toBeDisabled());
    expect(firstButton('Running')).toBeDisabled();
    view.unmount();
  });

  it('renders a failed run response even when HTTP succeeds', async () => {
    runResponse = { ...runResult, status: 'Failed', succeeded: false, failed: 1 };
    renderPage();
    await screen.findByRole('table');
    await confirm('Run Now', 'Run Now');
    expect(await screen.findByText('Aggregation Failed')).toBeInTheDocument();
    expect(screen.getByText('Status: Failed')).toBeInTheDocument();
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
            autoPublishEnabled: true,
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
  it.each([
    [AtsType.Greenhouse, true],
    [AtsType.Greenhouse, false],
    [AtsType.Lever, true],
    [AtsType.Ashby, true],
    [AtsType.Workday, true],
    [AtsType.SuccessFactors, true],
    [AtsType.Custom, true],
  ] as const)(
    'creates ATS %s with explicit Auto Publish %s independently from Active',
    async (atsType, autoPublishEnabled) => {
      renderPage();
      await screen.findByRole('table');
      fireEvent.click(firstButton('+ Add Job Source'));
      const dialog = within(await screen.findByRole('dialog'));
      await waitFor(() =>
        expect(dialog.getByRole('button', { name: 'Save Job Source' })).toBeEnabled(),
      );
      const autoPublish = dialog.getByRole('switch', { name: 'Auto Publish' });
      expect(autoPublish).toBeChecked();
      expect(autoPublish).toHaveAccessibleDescription(
        'Automatically publish eligible jobs imported from this source.',
      );
      if (!autoPublishEnabled) fireEvent.click(autoPublish);
      expect(dialog.getByRole('switch', { name: 'Active' })).toBeChecked();
      fireEvent.change(dialog.getByRole('combobox', { name: /Company/ }), {
        target: { value: 'Together' },
      });
      fireEvent.click(await screen.findByRole('option', { name: 'Together AI' }));
      fireEvent.change(dialog.getByRole('textbox', { name: /Career Page URL/ }), {
        target: { value: 'https://example.com/careers' },
      });
      fireEvent.mouseDown(dialog.getByRole('combobox', { name: 'ATS Type' }));
      fireEvent.click(screen.getByRole('option', { name: AtsType[atsType] }));
      fireEvent.change(dialog.getByRole('textbox', { name: /ATS Identifier/ }), {
        target: { value: 'tenant/site' },
      });
      fireEvent.click(dialog.getByRole('button', { name: 'Save Job Source' }));
      await waitFor(() =>
        expect(request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            url: '/admin/job-sources',
            data: expect.objectContaining({
              atsType,
              autoPublishEnabled,
              isActive: true,
            }) as unknown,
          }),
        ),
      );
    },
  );

  const returnSourceSetting = (autoPublishEnabled: boolean) => {
    const handler = request.getMockImplementation()!;
    request.mockImplementation((config) =>
      config.method === 'GET' && config.url.endsWith('/source-1')
        ? Promise.resolve({ data: { data: { ...source, autoPublishEnabled } } })
        : handler(config),
    );
  };

  it.each([true, false])(
    'hydrates persisted Auto Publish %s and preserves it when Active/interval change',
    async (autoPublishEnabled) => {
      items = [{ ...source, autoPublishEnabled }];
      returnSourceSetting(autoPublishEnabled);
      renderPage();
      await screen.findByRole('table');
      expect(
        screen.getAllByText(autoPublishEnabled ? 'Auto Publish: On' : 'Auto Publish: Off').length,
      ).toBeGreaterThan(0);
      fireEvent.click(firstButton('Edit'));
      const dialog = within(await screen.findByRole('dialog'));
      await waitFor(() =>
        expect(dialog.getByRole('button', { name: 'Save Job Source' })).toBeEnabled(),
      );
      const autoPublish = dialog.getByRole('switch', { name: 'Auto Publish' });
      expect(autoPublish).toHaveProperty('checked', autoPublishEnabled);
      fireEvent.click(dialog.getByRole('switch', { name: 'Active' }));
      expect(autoPublish).toHaveProperty('checked', autoPublishEnabled);
      fireEvent.change(dialog.getByRole('spinbutton', { name: /Scan Interval/ }), {
        target: { value: '360' },
      });
      expect(autoPublish).toHaveProperty('checked', autoPublishEnabled);
      fireEvent.click(dialog.getByRole('button', { name: 'Save Job Source' }));
      await waitFor(() =>
        expect(request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'PUT',
            url: '/admin/job-sources/source-1',
            data: expect.objectContaining({
              autoPublishEnabled,
              isActive: false,
              scanIntervalMinutes: 360,
            }) as unknown,
          }),
        ),
      );
    },
  );

  it.each([true, false])(
    'updates Auto Publish %s without changing Active',
    async (autoPublishEnabled) => {
      returnSourceSetting(!autoPublishEnabled);
      renderPage();
      await screen.findByRole('table');
      fireEvent.click(firstButton('Edit'));
      const dialog = within(await screen.findByRole('dialog'));
      await waitFor(() =>
        expect(dialog.getByRole('button', { name: 'Save Job Source' })).toBeEnabled(),
      );
      fireEvent.click(dialog.getByRole('switch', { name: 'Auto Publish' }));
      expect(dialog.getByRole('switch', { name: 'Active' })).toBeChecked();
      fireEvent.click(dialog.getByRole('button', { name: 'Save Job Source' }));
      await waitFor(() =>
        expect(request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'PUT',
            data: expect.objectContaining({ autoPublishEnabled, isActive: true }) as unknown,
          }),
        ),
      );
    },
  );

  it('preserves current Auto Publish OFF when deactivating a stale ON row', async () => {
    returnSourceSetting(false);
    renderPage();
    await screen.findByRole('table');
    await confirm('Deactivate', 'Deactivate Job Source');
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          data: expect.objectContaining({ autoPublishEnabled: false, isActive: false }) as unknown,
        }),
      ),
    );
  });
});
