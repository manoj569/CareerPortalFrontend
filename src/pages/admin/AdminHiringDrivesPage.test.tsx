import userEvent from '@testing-library/user-event';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as AdminApiModule from '@/features/admin/api/adminApi';
import {
  useGetAdminCompanyOptionsQuery,
  useGetAdminJobsQuery,
} from '@/features/admin/api/adminApi';
import type * as HiringDrivesApiModule from '@/features/hiringDrives/api';
import {
  useDeleteAdminHiringDriveMutation,
  useGetAdminHiringDrivesQuery,
  useSaveAdminHiringDriveMutation,
} from '@/features/hiringDrives/api';
import type { AdminHiringDrive, HiringDriveInput } from '@/features/hiringDrives/types';
import { renderWithProviders } from '@/test/renderWithProviders';
import { UserRole } from '@/types';
import { AdminHiringDrivesPage } from './AdminHiringDrivesPage';

vi.mock('@/features/admin/api/adminApi', async (importOriginal) => {
  const actual = await importOriginal<typeof AdminApiModule>();
  return {
    ...actual,
    useGetAdminCompanyOptionsQuery: vi.fn(),
    useGetAdminJobsQuery: vi.fn(),
  };
});

vi.mock('@/features/hiringDrives/api', async (importOriginal) => {
  const actual = await importOriginal<typeof HiringDrivesApiModule>();
  return {
    ...actual,
    useDeleteAdminHiringDriveMutation: vi.fn(),
    useGetAdminHiringDrivesQuery: vi.fn(),
    useSaveAdminHiringDriveMutation: vi.fn(),
  };
});

const auth = {
  status: 'authenticated' as const,
  user: {
    id: 'admin-1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.test',
    role: UserRole.Administrator,
  },
  isSubmitting: false,
  accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
  error: null,
};

const existing: AdminHiringDrive = {
  id: 'drive-1',
  campaign: {
    title: 'Existing campaign',
    companyId: 'company-1',
    jobId: null,
    applyUrl: 'https://careers.example.test/apply',
    startAtUtc: '2026-01-01T00:00:00Z',
    endAtUtc: null,
    isActive: true,
    isSponsored: true,
    showOnHome: false,
    displayOrder: 0,
  },
  impressionCount: 2,
  clickCount: 1,
  ctr: 50,
  createdAtUtc: '2026-01-01T00:00:00Z',
  updatedAtUtc: null,
  createdByUserId: null,
  updatedByUserId: null,
};

const save = vi.fn<
  (payload: { id?: string; data: HiringDriveInput }) => { unwrap: () => Promise<AdminHiringDrive> }
>(() => ({ unwrap: () => Promise.resolve(existing) }));
const remove = vi.fn(() => ({ unwrap: () => Promise.resolve() }));

const renderPage = () =>
  renderWithProviders(
    <MemoryRouter>
      <AdminHiringDrivesPage />
    </MemoryRouter>,
    { auth },
  );

beforeEach(() => {
  save.mockClear();
  remove.mockClear();
  vi.mocked(useGetAdminHiringDrivesQuery).mockReturnValue({
    data: { items: [existing], pageNumber: 1, pageSize: 20, totalCount: 1, totalPages: 1 },
    isLoading: false,
    isError: false,
  } as never);
  vi.mocked(useGetAdminCompanyOptionsQuery).mockReturnValue({
    data: [{ id: 'company-1', name: 'Example Company' }],
    isError: false,
  } as never);
  vi.mocked(useGetAdminJobsQuery).mockReturnValue({ data: { items: [] }, isError: false } as never);
  vi.mocked(useSaveAdminHiringDriveMutation).mockReturnValue([save, { isLoading: false }] as never);
  vi.mocked(useDeleteAdminHiringDriveMutation).mockReturnValue([
    remove,
    { isLoading: false },
  ] as never);
});

describe('Admin Hiring Drives showOnHome', () => {
  it.each([
    { showOnHome: true, isSponsored: false },
    { showOnHome: false, isSponsored: true },
  ])('sends independent create flags: %o', async ({ showOnHome, isSponsored }) => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Create campaign' }));

    const homeToggle = screen.getByRole('checkbox', { name: /Show on Home/ });
    const sponsoredToggle = screen.getByRole('checkbox', { name: 'Sponsored' });
    expect(homeToggle).not.toBeChecked();
    if (showOnHome) await user.click(homeToggle);
    if (isSponsored) await user.click(sponsoredToggle);

    await user.click(screen.getByRole('combobox', { name: 'Company' }));
    await user.click(screen.getByRole('option', { name: 'Example Company' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
      target: { value: 'New campaign' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'External apply URL (HTTPS)' }), {
      target: { value: 'https://careers.example.test/new' },
    });
    fireEvent.change(screen.getByLabelText(/Start date \(local time\)/), {
      target: { value: '2026-10-24T10:00' },
    });
    await user.click(screen.getByRole('button', { name: 'Save campaign' }));

    await waitFor(() => expect(save).toHaveBeenCalledOnce());
    const createInput = save.mock.calls[0]?.[0].data;
    expect(createInput?.showOnHome).toBe(showOnHome);
    expect(createInput?.isSponsored).toBe(isSponsored);
    expect(homeToggle).toHaveProperty('checked', showOnHome);
    expect(sponsoredToggle).toHaveProperty('checked', isSponsored);
  }, 20000);

  it('loads the saved value when editing and includes it in the update body', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Edit' }));

    expect(screen.getByRole('checkbox', { name: /Show on Home/ })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Sponsored' })).toBeChecked();
    await user.click(screen.getByRole('checkbox', { name: /Show on Home/ }));
    await user.click(screen.getByRole('button', { name: 'Save campaign' }));

    await waitFor(() => expect(save).toHaveBeenCalledOnce());
    const update = save.mock.calls[0]?.[0];
    expect(update?.id).toBe(existing.id);
    expect(update?.data.showOnHome).toBe(true);
    expect(update?.data.isSponsored).toBe(true);
  });
});

describe('Admin Hiring Drives Quick Fill', () => {
  it('fills the form without saving, then allows review and editing before save', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Create campaign' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Paste campaign data' }), { target: { value: JSON.stringify({
      company: ' example   company ', title: 'Systems Engineer', subtitle: 'Campus 2027',
      description: 'Graduate opportunity', batch: '2027', experience: 'Freshers', location: 'India',
      externalApplyUrl: 'https://careers.example.test/apply', startAt: '2027-01-01T10:00:00Z',
      displayOrder: 2, sponsored: false, showOnHome: true,
    }) } });
    await user.click(screen.getByRole('button', { name: 'Auto Fill' }));

    expect(save).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Systems Engineer');
    expect(screen.getByRole('textbox', { name: 'Subtitle' })).toHaveValue('Campus 2027');
    expect(screen.getByRole('checkbox', { name: /Show on Home/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Sponsored' })).not.toBeChecked();
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
      target: { value: 'Reviewed Engineer' },
    });
    await user.click(screen.getByRole('button', { name: 'Save campaign' }));
    await waitFor(() => expect(save).toHaveBeenCalledOnce());
    expect(save.mock.calls[0]?.[0].data.title).toBe('Reviewed Engineer');
    expect(save.mock.calls[0]?.[0].data.companyId).toBe('company-1');
    expect(save.mock.calls[0]?.[0].data.showOnHome).toBe(true);
    expect(save.mock.calls[0]?.[0].data.isSponsored).toBe(false);
  });

  it('shows invalid JSON and HTTPS URL feedback and blocks saving until corrected', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Create campaign' }));
    const paste = screen.getByRole('textbox', { name: 'Paste campaign data' });
    fireEvent.change(paste, { target: { value: '{bad' } });
    await user.click(screen.getByRole('button', { name: 'Auto Fill' }));
    expect(screen.getByText('Enter valid campaign JSON.')).toBeVisible();
    await user.clear(paste);
    fireEvent.change(paste, { target: { value: JSON.stringify({ title: 'Engineer', applyUrl: 'http://unsafe.test', startAt: '2027-01-01' }) } });
    await user.click(screen.getByRole('button', { name: 'Auto Fill' }));
    expect(screen.getByRole('textbox', { name: 'External apply URL (HTTPS)' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    await user.click(screen.getByRole('button', { name: 'Save campaign' }));
    expect(save).not.toHaveBeenCalled();
  });

  it('does not silently select a company when no normalized exact match exists', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Create campaign' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Paste campaign data' }), { target: { value: 'Company: Example Global\nTitle: Engineer' } });
    await user.click(screen.getByRole('button', { name: 'Auto Fill' }));
    expect(screen.getByText('Company "Example Global" was not found. Please select a company manually.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Save campaign' }));
    expect(save).not.toHaveBeenCalled();
  });
});

describe('Admin Hiring Drives Quick Fill', () => {
  it('fills JSON into editable form fields without saving automatically', async () => {
    const user = userEvent.setup();
    vi.mocked(useGetAdminCompanyOptionsQuery).mockReturnValue({
      data: [{ id: 'company-1', name: 'Infosys' }],
      isError: false,
    } as never);
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Create campaign' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Paste campaign data' }), {
      target: {
        value: '{"company":"  infosys ","title":"Systems Engineer","applyUrl":"https://careers.example.test/apply","startAt":"2026-10-23T18:00:00Z","displayOrder":2,"showOnHome":true,"isSponsored":false}',
      },
    });
    await user.click(screen.getByRole('button', { name: 'Auto Fill' }));

    expect(screen.getByRole('combobox', { name: 'Company' })).toHaveTextContent('Infosys');
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Systems Engineer');
    expect(screen.getByRole('checkbox', { name: /Show on Home/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Sponsored' })).not.toBeChecked();
    expect(save).not.toHaveBeenCalled();

    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'Edited title' } });
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Edited title');
  }, 20000);

  it('fills key/value text, reports an unmatched company, and still uses normal Save validation', async () => {
    const user = userEvent.setup();
    vi.mocked(useGetAdminCompanyOptionsQuery).mockReturnValue({
      data: [{ id: 'company-1', name: 'Infosys' }],
      isError: false,
    } as never);
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Create campaign' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Paste campaign data' }), {
      target: { value: 'Company: Unknown Co\nTitle: Engineer\nShow on Home: Yes\nSponsored: No' },
    });
    await user.click(screen.getByRole('button', { name: 'Auto Fill' }));

    expect(screen.getByText('Company "Unknown Co" was not found. Please select a company manually.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Engineer');
    expect(screen.getByRole('checkbox', { name: /Show on Home/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Sponsored' })).not.toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Save campaign' }));
    expect(save).not.toHaveBeenCalled();
    expect(screen.getByText('Select a CareerHarbor job or provide an apply URL.')).toBeInTheDocument();
  });
});
