import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { ApiRequestError } from '@/api/apiError';
import { renderWithProviders } from '@/test/renderWithProviders';
import { JobSourceFormDialog } from './JobSourceFormDialog';

const { request } = vi.hoisted(() => ({
  request:
    vi.fn<
      (config: { method: string; url: string; data?: unknown }) => Promise<{ data: unknown }>
    >(),
}));
vi.mock('@/api/apiClient', () => ({ apiClient: { request } }));
const company = { id: 'new-company', name: 'Razorpay', slug: 'razorpay' };
const onSave = vi.fn().mockResolvedValue(undefined);
beforeEach(() => {
  onSave.mockClear();
  request.mockReset();
  request.mockImplementation(({ method }: { method: string }) =>
    Promise.resolve({
      data: {
        data:
          method === 'POST' ? company : [{ id: 'existing', name: 'Deloitte', slug: 'deloitte' }],
      },
    }),
  );
});
const open = async () => {
  renderWithProviders(
    <JobSourceFormDialog isSaving={false} error={null} onClose={vi.fn()} onSave={onSave} />,
  );
  await waitFor(() => expect(screen.getByRole('combobox', { name: /Company/ })).toBeEnabled());
};
const search = (name: string) => {
  const input = screen.getByRole('combobox', { name: /Company/ });
  input.focus();
  fireEvent.change(input, { target: { value: name } });
};
const fill = () => {
  fireEvent.change(screen.getByRole('textbox', { name: /Career Page URL/ }), {
    target: { value: 'https://example.com/careers' },
  });
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'ATS Type' }));
  fireEvent.click(screen.getByRole('option', { name: 'Lever' }));
  fireEvent.change(screen.getByRole('textbox', { name: /ATS Identifier/ }), {
    target: { value: 'razorpay-board' },
  });
  fireEvent.change(screen.getByRole('spinbutton', { name: /Scan Interval/ }), {
    target: { value: '360' },
  });
  fireEvent.click(screen.getByRole('switch', { name: 'Active' }));
};

it.each([
  [1, 'Greenhouse', 'https://job-boards.greenhouse.io/ExactCase'],
  [2, 'Lever', 'https://jobs.lever.co/ExactCase'],
  [3, 'Ashby', 'https://jobs.ashbyhq.com/ExactCase'],
  [4, 'SuccessFactors', 'https://careers.example.com/go/Board/123'],
  [5, 'Workday', 'https://tenant.wd504.myworkdayjobs.com/ExactCase'],
] as const)(
  'submits URL-derived identity for provider %s without inventing metadata',
  async (atsType, name, careerPageUrl) => {
    await open();
    search('Deloitte');
    fireEvent.click(await screen.findByRole('option', { name: 'Deloitte' }));
    fireEvent.change(screen.getByRole('textbox', { name: /Career Page URL/ }), {
      target: { value: careerPageUrl },
    });
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'ATS Type' }));
    fireEvent.click(screen.getByRole('option', { name }));
    fireEvent.click(screen.getByRole('button', { name: 'Save Job Source' }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        companyId: 'existing',
        careerPageUrl,
        atsType,
        atsIdentifier: null,
        isActive: true,
        autoPublishEnabled: true,
        scanIntervalMinutes: 720,
      }),
    );
  },
);

it('searches and selects existing companies without offering case-insensitive duplicates', async () => {
  await open();
  search('del');
  expect(await screen.findByRole('option', { name: 'Deloitte' })).toBeVisible();
  search('dELOITTE');
  expect(screen.queryByRole('option', { name: /Create/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('option', { name: 'Deloitte' }));
  fill();
  fireEvent.click(screen.getByRole('button', { name: 'Save Job Source' }));
  await waitFor(() =>
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ companyId: 'existing' })),
  );
  expect(request.mock.calls.some(([config]) => config.method === 'POST')).toBe(false);
});

it('creates without a logo, selects the returned company and preserves every source field when saving', async () => {
  await open();
  fill();
  search(' Razorpay ');
  fireEvent.click(await screen.findByRole('option', { name: '+ Create "Razorpay"' }));
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: /Company/ })).toHaveValue('Razorpay'),
  );
  expect(screen.getByRole('dialog')).toBeVisible();
  expect(request).toHaveBeenCalledWith(
    expect.objectContaining({
      method: 'POST',
      url: '/admin/companies',
      data: expect.objectContaining({
        name: 'Razorpay',
        logoUrl: null,
        isVerified: false,
      }) as unknown,
    }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save Job Source' }));
  await waitFor(() =>
    expect(onSave).toHaveBeenCalledWith({
      companyId: 'new-company',
      careerPageUrl: 'https://example.com/careers',
      atsType: 2,
      atsIdentifier: 'razorpay-board',
      scanIntervalMinutes: 360,
      isActive: false,
      autoPublishEnabled: true,
    }),
  );
});

it('locks creation while pending and displays backend validation errors without closing or clearing the form', async () => {
  await open();
  fill();
  let reject!: (error: unknown) => void;
  request.mockImplementationOnce(
    () =>
      new Promise((_, fail) => {
        reject = fail;
      }),
  );
  search('Razorpay');
  fireEvent.click(await screen.findByRole('option', { name: '+ Create "Razorpay"' }));
  expect(await screen.findByLabelText('Creating company')).toBeVisible();
  expect(screen.getByRole('combobox', { name: /Company/ })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Creating company…' })).toBeDisabled();
  reject(
    new ApiRequestError({
      message: 'Validation failed',
      status: 400,
      errors: { Name: ['Company already exists.'] },
    }),
  );
  expect(await screen.findByText(/Company already exists/)).toBeVisible();
  expect(screen.getByRole('dialog')).toBeVisible();
  expect(screen.getByRole('textbox', { name: /Career Page URL/ })).toHaveValue(
    'https://example.com/careers',
  );
  expect(screen.getByRole('textbox', { name: /ATS Identifier/ })).toHaveValue('razorpay-board');
  expect(request.mock.calls.filter(([config]) => config.method === 'POST')).toHaveLength(1);
});
