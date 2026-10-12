import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as AdminApiModule from '@/features/admin/api/adminApi';
import type * as SnackbarModule from 'notistack';
import { enqueueSnackbar } from 'notistack';
import {
  useDeleteAdminCompanyMutation,
  useGetAdminCompaniesQuery,
  useGetAdminCompanyQuery,
  useResolveAdminCompanyLogoMutation,
  useUpdateAdminCompanyMutation,
} from '@/features/admin/api/adminApi';
import type { AdminCompany } from '@/features/admin/types/adminModels';
import { CompanyLogoManagementDialog } from '@/features/admin/components/CompanyLogoManagementDialog';
import { adminNavigationItems } from '@/layouts/adminNavigation';
import { renderWithProviders } from '@/test/renderWithProviders';
import { AdminCompaniesPage } from './AdminCompaniesPage';

vi.mock('@/features/admin/api/adminApi', async (importOriginal) => ({
  ...(await importOriginal<typeof AdminApiModule>()),
  useGetAdminCompaniesQuery: vi.fn(),
  useGetAdminCompanyQuery: vi.fn(),
  useDeleteAdminCompanyMutation: vi.fn(),
  useResolveAdminCompanyLogoMutation: vi.fn(),
  useUpdateAdminCompanyMutation: vi.fn(),
}));
vi.mock('notistack', async (importOriginal) => ({
  ...(await importOriginal<typeof SnackbarModule>()),
  enqueueSnackbar: vi.fn(),
}));

const company: AdminCompany = {
  id: 'ca95a5ec-7e5a-4d5f-acf6-534dd2225276',
  name: 'LSEG',
  slug: 'lseg',
  description: 'Financial products.',
  websiteUrl: 'https://www.lseg.com',
  logoUrl: 'https://assets.example.test/lseg.png',
  industry: 'Finance',
  location: 'London',
  employeeCount: 1000,
  isVerified: true,
  companyType: 2,
  isDeleted: false,
  createdAtUtc: '2026-10-13T00:00:00Z',
  updatedAtUtc: null,
};
const latestCompany = { ...company, description: 'Updated by another admin.', employeeCount: 2000 };
const listRefetch = vi.fn();
const detailUnwrap = vi.fn();
const detailRefetch = vi.fn(() => ({ unwrap: detailUnwrap }));
const resolveUnwrap = vi.fn();
const resolve = vi.fn(() => ({ unwrap: resolveUnwrap }));
const saveUnwrap = vi.fn();
const save = vi.fn<(args: unknown) => { unwrap: typeof saveUnwrap }>(() => ({
  unwrap: saveUnwrap,
}));
const onClose = vi.fn();
const onSaved = vi.fn();
const renderDialog = () =>
  renderWithProviders(
    <MemoryRouter>
      <CompanyLogoManagementDialog companyId={company.id} onClose={onClose} onSaved={onSaved} />
    </MemoryRouter>,
  );
const query = (data: unknown) => ({
  data,
  isLoading: false,
  isError: false,
  refetch: detailRefetch,
});

beforeEach(() => {
  vi.clearAllMocks();
  detailUnwrap.mockResolvedValue(latestCompany);
  resolveUnwrap.mockResolvedValue({
    companyId: company.id,
    companyName: company.name,
    websiteUrl: company.websiteUrl,
    logoUrl: 'https://assets.example.test/resolved.png',
    source: 'Website',
    resolved: true,
  });
  saveUnwrap.mockResolvedValue({
    ...latestCompany,
    logoUrl: 'https://assets.example.test/resolved.png',
  });
  vi.mocked(useGetAdminCompanyQuery).mockReturnValue(
    query(company) as unknown as ReturnType<typeof useGetAdminCompanyQuery>,
  );
  vi.mocked(useGetAdminCompaniesQuery).mockReturnValue({
    ...query({ items: [company], totalPages: 1 }),
    refetch: listRefetch,
  } as ReturnType<typeof useGetAdminCompaniesQuery>);
  vi.mocked(useDeleteAdminCompanyMutation).mockReturnValue([
    vi.fn(),
    { isLoading: false },
  ] as unknown as ReturnType<typeof useDeleteAdminCompanyMutation>);
  vi.mocked(useResolveAdminCompanyLogoMutation).mockReturnValue([
    resolve,
    { isLoading: false },
  ] as unknown as ReturnType<typeof useResolveAdminCompanyLogoMutation>);
  vi.mocked(useUpdateAdminCompanyMutation).mockReturnValue([
    save,
    { isLoading: false },
  ] as unknown as ReturnType<typeof useUpdateAdminCompanyMutation>);
});

describe('Admin company logo management', () => {
  it('loads the existing company, website, logo and actions in desktop table and mobile cards', () => {
    const previousWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 360 });
    try {
      const { container } = renderWithProviders(
        <MemoryRouter>
          <AdminCompaniesPage />
        </MemoryRouter>,
      );
      const table = screen.getByRole('table', { name: 'Administrator companies', hidden: true });
      expect(within(table).getByText('Website')).toBeInTheDocument();
      expect(within(table).getByText('Logo')).toBeInTheDocument();
      expect(screen.getByRole('article')).toHaveTextContent('LSEG');
      expect(screen.getByRole('article')).toHaveTextContent('https://www.lseg.com');
      expect(screen.getAllByRole('img', { name: 'LSEG logo', hidden: true })).toHaveLength(2);
      expect(
        within(screen.getByRole('article')).getByRole('button', { name: 'Manage Logo' }),
      ).toBeVisible();
      expect(container.querySelector('article .MuiCardActions-root')).toBeInTheDocument();
      expect(adminNavigationItems.find((item) => item.label === 'Companies')?.path).toBe(
        '/admin/companies',
      );
    } finally {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: previousWidth });
    }
  });

  it('shows the null-logo initials in company records', () => {
    vi.mocked(useGetAdminCompaniesQuery).mockReturnValue(
      query({ items: [{ ...company, logoUrl: null }], totalPages: 1 }) as unknown as ReturnType<
        typeof useGetAdminCompaniesQuery
      >,
    );
    renderWithProviders(
      <MemoryRouter>
        <AdminCompaniesPage />
      </MemoryRouter>,
    );
    expect(screen.getAllByRole('img', { name: 'LSEG initials', hidden: true })).toHaveLength(2);
    expect(screen.queryByRole('img', { name: 'LSEG logo' })).toBeNull();
  });

  it('opens Manage Logo from Companies and refreshes the list only after save succeeds', async () => {
    renderWithProviders(
      <MemoryRouter>
        <AdminCompaniesPage />
      </MemoryRouter>,
    );
    await userEvent.click(
      within(screen.getByRole('article')).getByRole('button', { name: 'Manage Logo' }),
    );
    expect(screen.getByRole('dialog', { name: 'Manage Logo' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(listRefetch).toHaveBeenCalledOnce());
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('automatically resolves a preview without saving or changing the current logo', async () => {
    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: 'Find Logo Automatically' }));
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Logo URL' })).toHaveValue(
        'https://assets.example.test/resolved.png',
      ),
    );
    expect(resolve).toHaveBeenCalledWith({
      companyId: company.id,
      request: {
        websiteUrl: company.websiteUrl,
        careerPageUrl: null,
        replaceExisting: true,
      },
    });
    expect(save).not.toHaveBeenCalled();
    screen.getAllByRole('img', { name: 'LSEG logo' }).forEach((image) => {
      fireEvent.load(image);
      expect(image.parentElement).toHaveStyle({ 'background-color': 'rgba(0, 0, 0, 0)', 'border-radius': '0' });
    });
    expect(onSaved).not.toHaveBeenCalled();
    expect(
      screen.getAllByRole('img', { name: 'LSEG logo' }).map((image) => image.getAttribute('src')),
    ).toEqual([company.logoUrl, 'https://assets.example.test/resolved.png']);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(save).not.toHaveBeenCalled();
  });

  it('previews manual HTTPS input and saves both URLs while preserving fresh unrelated fields', async () => {
    renderDialog();
    fireEvent.change(screen.getByRole('textbox', { name: 'Website URL' }), {
      target: { value: 'https://www.lseg.com/new' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Logo URL' }), {
      target: { value: ' https://assets.example.test/manual.png ' },
    });
    expect(screen.getAllByRole('img', { name: 'LSEG logo' })[1]).toHaveAttribute(
      'src',
      'https://assets.example.test/manual.png',
    );
    expect(save).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(save).toHaveBeenCalledWith({
        companyId: company.id,
        request: {
          name: company.name,
          slug: company.slug,
          description: latestCompany.description,
          employeeCount: latestCompany.employeeCount,
          industry: company.industry,
          location: company.location,
          companyType: company.companyType,
          isVerified: company.isVerified,
          websiteUrl: 'https://www.lseg.com/new',
          logoUrl: 'https://assets.example.test/manual.png',
        },
      }),
    );
    expect(detailRefetch).toHaveBeenCalledOnce();
    expect(enqueueSnackbar).toHaveBeenCalledWith('Company logo saved.', { variant: 'success' });
    expect(onSaved).toHaveBeenCalledOnce();
  });

  it.each([
    'javascript:alert(1)',
    'data:image/png;base64,test',
    'blob:https://example.test/id',
    'file:///logo.png',
    'http://example.test/logo.png',
    'https://',
      'https:example.test/logo.png',
    '/logo.png',
    'https://user:secret@example.test/logo.png',
  ])('rejects unsafe manual logo %s without rendering it', (url) => {
    renderDialog();
    fireEvent.change(screen.getByRole('textbox', { name: 'Logo URL' }), { target: { value: url } });
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByText('Enter a direct HTTPS logo URL.')).toBeVisible();
    expect(screen.getByRole('img', { name: 'LSEG initials' })).toBeVisible();
    expect(save).not.toHaveBeenCalled();
  });

  it('clears a logo only after explicit Clear Logo and Save actions', async () => {
    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: 'Clear Logo' }));
    expect(screen.getByRole('textbox', { name: 'Logo URL' })).toHaveValue('');
    expect(save).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(save).toHaveBeenCalledOnce());
    expect(save.mock.calls[0]?.[0]).toMatchObject({
      companyId: company.id,
      request: { logoUrl: null, websiteUrl: company.websiteUrl, companyType: company.companyType },
    });
    expect(enqueueSnackbar).toHaveBeenCalledWith('Company logo cleared.', { variant: 'success' });
  });

  it('prevents accidental removal by blanking the input', async () => {
    renderDialog();
    fireEvent.change(screen.getByRole('textbox', { name: 'Logo URL' }), { target: { value: '' } });
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByText('Use Clear Logo to remove the current logo, then Save.')).toBeVisible();
    expect(save).not.toHaveBeenCalled();
  });

  it('removes a broken image and preserves the initial fallback without reload loops', () => {
    renderDialog();
    screen.getAllByRole('img', { name: 'LSEG logo' }).forEach((image) => fireEvent.error(image));
    expect(screen.queryByRole('img', { name: 'LSEG logo' })).toBeNull();
    expect(screen.getAllByRole('img', { name: 'LSEG initials' })).toHaveLength(2);
  });

  it('retains the draft and reports a failed save without success feedback', async () => {
    saveUnwrap.mockRejectedValue({
      status: 400,
      message: 'Logo could not be saved.',
      errors: { logoUrl: ['The URL is unavailable.'] },
    });
    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(screen.getByText('Logo could not be saved. The URL is unavailable.')).toBeVisible(),
    );
    expect(onSaved).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(enqueueSnackbar).not.toHaveBeenCalled();
  });

  it('waits for backend confirmation before success feedback', async () => {
    let confirm!: (value: AdminCompany) => void;
    saveUnwrap.mockReturnValue(
      new Promise<AdminCompany>((resolvePromise) => {
        confirm = resolvePromise;
      }),
    );
    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(save).toHaveBeenCalledOnce());
    expect(enqueueSnackbar).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    confirm(company);
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });

  it('reports no resolver match while retaining the draft', async () => {
    resolveUnwrap.mockResolvedValue({ companyId: company.id, resolved: false, logoUrl: null });
    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: 'Find Logo Automatically' }));
    expect(
      await screen.findByText('No logo was found. You can paste a direct HTTPS logo URL.'),
    ).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Logo URL' })).toHaveValue(company.logoUrl);
    expect(save).not.toHaveBeenCalled();
  });
});
