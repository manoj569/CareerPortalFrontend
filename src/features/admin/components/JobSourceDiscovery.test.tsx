import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { ApiRequestError } from '@/api/apiError';
import { renderWithProviders } from '@/test/renderWithProviders';
import { JobSourceFormDialog } from './JobSourceFormDialog';
import { AtsType, type JobSource, type JobSourceConnectionResult } from '../types/jobSourceModels';

const { request } = vi.hoisted(() => ({
  request:
    vi.fn<
      (config: { url: string; method: string; data?: unknown }) => Promise<{ data: unknown }>
    >(),
}));
vi.mock('@/api/apiClient', () => ({ apiClient: { request } }));
const employerUrl = 'https://www.ltm.com/india-careers';
const resolvedUrl = 'https://example.ripplehire.com/candidate/?lang=en&token=public-token';
const verified: JobSourceConnectionResult = {
  provider: AtsType.RippleHire,
  configurationValid: true,
  providerReachable: true,
  listingReachable: true,
  reasonCode: 'RIPPLEHIRE_SOURCE_VERIFIED',
  message: 'Public source verified; save to persist it.',
  discovery: {
    status: 'Resolved',
    resolvedCareerPageUrl: resolvedUrl,
    manualConfigurationRequired: false,
    reasonCode: 'RIPPLEHIRE_SOURCE_VERIFIED',
    validationErrors: [],
    succeeded: true,
  },
};
const source = {
  id: 'ripple',
  companyId: 'company',
  companyName: 'LTM',
  careerPageUrl: employerUrl,
  atsType: AtsType.RippleHire,
  atsIdentifier: null,
  isActive: true,
  autoPublishEnabled: false,
  scanIntervalMinutes: 720,
} as JobSource;
const onSave = vi.fn().mockResolvedValue(undefined);
const open = async (existing: JobSource | undefined = source) => {
  const rendered = renderWithProviders(
    <JobSourceFormDialog
      source={existing}
      isSaving={false}
      error={null}
      onClose={vi.fn()}
      onSave={onSave}
    />,
  );
  await waitFor(() => expect(screen.getByRole('combobox', { name: /Company/ })).toBeEnabled());
  return rendered;
};
beforeEach(() => {
  onSave.mockClear();
  request.mockReset();
  request.mockImplementation(({ url }: { url: string }) =>
    Promise.resolve({
      data: {
        data: url.endsWith('/test') ? verified : [{ id: 'company', name: 'LTM', slug: 'ltm' }],
      },
    }),
  );
});

it('previews unsaved employer configuration with only the actual DTO fields and applies a verified URL', async () => {
  await open();
  expect(screen.getByRole('textbox', { name: /Career Page URL/ })).toHaveAccessibleDescription(
    /Enter the employer career page or RippleHire tenant URL/,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Detect & Test Connection' }));
  expect(await screen.findByText(/Discovery status: Resolved/)).toBeVisible();
  expect(screen.getByRole('alert')).toHaveClass('MuiAlert-standardSuccess');
  expect(request).toHaveBeenCalledWith(
    expect.objectContaining({
      method: 'POST',
      url: '/admin/job-sources/test',
      data: { atsType: 8, careerPageUrl: employerUrl, atsIdentifier: null },
      timeout: 60000,
    }),
  );
  expect(screen.getByRole('textbox', { name: 'Resolved public RippleHire URL' })).toHaveValue(
    resolvedUrl,
  );
  expect(onSave).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Use Resolved Configuration' }));
  expect(screen.getByRole('textbox', { name: /Career Page URL/ })).toHaveValue(resolvedUrl);
  fireEvent.click(screen.getByRole('button', { name: 'Save Job Source' }));
  await waitFor(() =>
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        careerPageUrl: resolvedUrl,
        atsType: 8,
        atsIdentifier: null,
        autoPublishEnabled: false,
        scanIntervalMinutes: 720,
      }),
    ),
  );
});

it('saves the current verified discovery URL without stale employer input and keeps Auto Publish off', async () => {
  await open();
  fireEvent.click(screen.getByRole('button', { name: 'Detect & Test Connection' }));
  await screen.findByText('Discovery status: Resolved');
  expect(screen.getByRole('switch', { name: 'Auto Publish' })).not.toBeChecked();
  fireEvent.click(screen.getByRole('button', { name: 'Save Job Source' }));
  await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ careerPageUrl: resolvedUrl,
    atsIdentifier: null, autoPublishEnabled: false, scanIntervalMinutes: 720 })));
});

it('prevents duplicate save submissions while preserving values until the save resolves', async () => {
  let resolve!: () => void;
  onSave.mockImplementationOnce(() => new Promise<void>((done) => { resolve = done; }));
  await open();
  const save = screen.getByRole('button', { name: 'Save Job Source' });
  fireEvent.click(save);
  fireEvent.click(save);
  await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
  expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  expect(screen.getByRole('textbox', { name: /Career Page URL/ })).toHaveValue(employerUrl);
  resolve();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save Job Source' })).toBeEnabled());
});

it('maps backend field errors to inputs, retains values and offers copying the trace ID', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  const descriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  try {
    renderWithProviders(<JobSourceFormDialog source={source} isSaving={false} onClose={vi.fn()} onSave={onSave}
      error={{ status: 400, message: 'One or more job-source fields are invalid.', code: 'validation_error', traceId: 'trace-job-123',
        errors: { CareerPageUrl: ['Use a supported public URL.'], AtsIdentifier: ['Leave the identifier blank.'], Request: ['Check the configuration.'] },
        reasonCodes: { CareerPageUrl: ['RIPPLEHIRE_UNSUPPORTED'] } }} />);
    expect(await screen.findByText('Use a supported public URL.')).toBeVisible();
    expect(screen.getByRole('textbox', { name: /Career Page URL/ })).toHaveAccessibleDescription('Use a supported public URL.');
    expect(screen.getByRole('textbox', { name: /ATS Identifier/ })).toHaveAccessibleDescription('Leave the identifier blank.');
    expect(screen.getByRole('textbox', { name: /Career Page URL/ })).toHaveValue(employerUrl);
    expect(screen.getByText('Check the configuration.')).toBeVisible();
    expect(screen.getByText('Trace ID: trace-job-123')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Copy trace ID' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('trace-job-123'));
    expect(await screen.findByText('Trace ID copied')).toBeVisible();
  } finally {
    if (descriptor) Object.defineProperty(navigator, 'clipboard', descriptor);
    else Reflect.deleteProperty(navigator, 'clipboard');
  }
});

it.each(['NotFound', 'Ambiguous', 'VerificationFailed'] as const)(
  'shows actual %s errors and manual fallback without claiming verification',
  async (status) => {
    request.mockImplementation(({ url }: { url: string }) =>
      Promise.resolve({
        data: {
          data: url.endsWith('/test')
            ? {
                ...verified,
                configurationValid: false,
                listingReachable: false,
                message: 'Manual configuration required.',
                discovery: {
                  ...verified.discovery,
                  status,
                  succeeded: false,
                  resolvedCareerPageUrl: null,
                  manualConfigurationRequired: true,
                  reasonCode: `RIPPLEHIRE_${status}`,
                  validationErrors: ['Choose the exact public employer source.'],
                },
              }
            : [],
        },
      }),
    );
    await open();
    fireEvent.click(screen.getByRole('button', { name: 'Detect & Test Connection' }));
    expect(await screen.findByText(`Discovery status: ${status}`)).toBeVisible();
    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-standardError');
    expect(screen.getByText('Choose the exact public employer source.')).toBeVisible();
    expect(
      screen.getByText(/Paste the employer's complete public RippleHire candidate URL/),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Use Resolved Configuration' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Career Page URL/ })).toHaveValue(employerUrl);
  },
);

it.each([
  null,
  { ...verified, discovery: null },
  { ...verified, discovery: { ...verified.discovery!, status: 'Ambiguous' as const } },
])(
  'does not claim success for empty, missing or contradictory discovery results',
  async (result) => {
    request.mockImplementation(({ url }: { url: string }) =>
      Promise.resolve({ data: { data: url.endsWith('/test') ? result : [] } }),
    );
    await open();
    fireEvent.click(screen.getByRole('button', { name: 'Detect & Test Connection' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveClass('MuiAlert-standardError'));
    expect(
      screen.queryByRole('button', { name: 'Use Resolved Configuration' }),
    ).not.toBeInTheDocument();
  },
);

it('permits manual complete-token fallback after discovery fails and invalidates stale results on changes', async () => {
  let attempt = 0;
  request.mockImplementation(({ url }: { url: string }) =>
    Promise.resolve({
      data: {
        data: url.endsWith('/test')
          ? ++attempt === 1
            ? {
                ...verified,
                listingReachable: false,
                discovery: {
                  ...verified.discovery!,
                  status: 'NotFound',
                  succeeded: false,
                  resolvedCareerPageUrl: null,
                  manualConfigurationRequired: true,
                },
              }
            : { ...verified, discovery: { ...verified.discovery!, status: 'ManualUrlVerified' } }
          : [],
      },
    }),
  );
  await open();
  fireEvent.click(screen.getByRole('button', { name: 'Detect & Test Connection' }));
  await screen.findByText('Discovery status: NotFound');
  fireEvent.change(screen.getByRole('textbox', { name: /Career Page URL/ }), {
    target: { value: resolvedUrl },
  });
  expect(screen.queryByText('Discovery status: NotFound')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Detect & Test Connection' }));
  expect(await screen.findByText('Discovery status: ManualUrlVerified')).toBeVisible();
  fireEvent.change(screen.getByRole('textbox', { name: /ATS Identifier/ }), {
    target: { value: 'different' },
  });
  expect(screen.queryByText('Discovery status: ManualUrlVerified')).not.toBeInTheDocument();
});

it('locks fields and saving during detection and prevents duplicate tests', async () => {
  let resolve!: (value: { data: unknown }) => void;
  request.mockImplementation(({ url }: { url: string }) =>
    url.endsWith('/test')
      ? new Promise((done) => {
          resolve = done;
        })
      : Promise.resolve({ data: { data: [] } }),
  );
  await open();
  const button = screen.getByRole('button', { name: 'Detect & Test Connection' });
  fireEvent.click(button);
  fireEvent.click(button);
  await waitFor(() => expect(resolve).toBeDefined());
  expect(screen.getByRole('textbox', { name: /Career Page URL/ })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Detecting…' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  resolve({ data: { data: verified } });
  await screen.findByText('Discovery status: Resolved');
  expect(request.mock.calls.filter(([config]) => config.url.endsWith('/test'))).toHaveLength(1);
});

it('preserves actionable API validation errors and form input after a failed detection', async () => {
  request.mockImplementation(({ url }: { url: string }) =>
    url.endsWith('/test')
      ? Promise.reject(
          new ApiRequestError({
            status: 400,
            message: 'Invalid configuration.',
            errors: { CareerPageUrl: ['Use a public career page.'] },
          }),
        )
      : Promise.resolve({ data: { data: [] } }),
  );
  await open();
  fireEvent.click(screen.getByRole('button', { name: 'Detect & Test Connection' }));
  expect(await screen.findByText('Invalid configuration.')).toBeVisible();
  expect(screen.getByRole('textbox', { name: /Career Page URL/ })).toHaveAccessibleDescription('Use a public career page.');
  expect(screen.getByRole('textbox', { name: /Career Page URL/ })).toHaveValue(employerUrl);
});

it('creates the LTM employer-page example with no identifier, interval 720 and Auto Publish off', async () => {
  // New form: company selection is not required for connection preview, but is required to save.
  renderWithProviders(
    <JobSourceFormDialog isSaving={false} error={null} onClose={vi.fn()} onSave={onSave} />,
  );
  await waitFor(() => expect(screen.getByRole('combobox', { name: /Company/ })).toBeEnabled());
  fireEvent.change(screen.getByRole('combobox', { name: /Company/ }), { target: { value: 'LTM' } });
  fireEvent.click(await screen.findByRole('option', { name: 'LTM' }));
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'ATS Type' }));
  fireEvent.click(screen.getByRole('option', { name: 'RippleHire' }));
  fireEvent.change(screen.getByRole('textbox', { name: /Career Page URL/ }), {
    target: { value: employerUrl },
  });
  fireEvent.click(screen.getByRole('switch', { name: 'Auto Publish' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save Job Source' }));
  await waitFor(() =>
    expect(onSave).toHaveBeenCalledWith({
      companyId: 'company',
      careerPageUrl: employerUrl,
      atsType: 8,
      atsIdentifier: null,
      isActive: true,
      scanIntervalMinutes: 720,
      autoPublishEnabled: false,
    }),
  );
  expect(request.mock.calls.some(([config]) => config.url.endsWith('/test'))).toBe(false);
});
