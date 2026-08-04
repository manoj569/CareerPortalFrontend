import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as AdminApiModule from '@/features/admin/api/adminApi';
import {
  downloadAdminApplicationResume,
  useCreateAdminCategoryMutation,
  useCreateAdminCompanyMutation,
  useDeleteAdminCategoryMutation,
  useDeleteAdminCompanyMutation,
  useGetAdminApplicationQuery,
  useGetAdminAuditLogsQuery,
  useGetAdminCategoriesQuery,
  useGetAdminCategoryOptionsQuery,
  useGetAdminCategoryQuery,
  useGetAdminCompaniesQuery,
  useGetAdminCompanyQuery,
  useUpdateAdminApplicationStatusMutation,
  useUpdateAdminCategoryMutation,
  useUpdateAdminCompanyMutation,
} from '@/features/admin/api/adminApi';
import {
  AdminApplicationStatus,
  AuditAction,
  type AdminApplicationDetail,
  type AdminCategory,
  type AdminCompany,
} from '@/features/admin/types/adminModels';
import { EmploymentType, WorkplaceType } from '@/features/jobs/types/jobModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import { AdminApplicationDetailsPage } from './AdminApplicationDetailsPage';
import { AdminAuditLogsPage } from './AdminAuditLogsPage';
import { AdminCategoriesPage } from './AdminCategoriesPage';
import { AdminCategoryFormPage } from './AdminCategoryFormPage';
import { AdminCompaniesPage } from './AdminCompaniesPage';
import { AdminCompanyFormPage } from './AdminCompanyFormPage';

vi.mock('@/features/admin/api/adminApi', async (importOriginal) => {
  const actual = await importOriginal<typeof AdminApiModule>();
  return {
    ...actual,
    downloadAdminApplicationResume: vi.fn(),
    useCreateAdminCategoryMutation: vi.fn(),
    useCreateAdminCompanyMutation: vi.fn(),
    useDeleteAdminCategoryMutation: vi.fn(),
    useDeleteAdminCompanyMutation: vi.fn(),
    useGetAdminApplicationQuery: vi.fn(),
    useGetAdminAuditLogsQuery: vi.fn(),
    useGetAdminCategoriesQuery: vi.fn(),
    useGetAdminCategoryOptionsQuery: vi.fn(),
    useGetAdminCategoryQuery: vi.fn(),
    useGetAdminCompaniesQuery: vi.fn(),
    useGetAdminCompanyQuery: vi.fn(),
    useUpdateAdminApplicationStatusMutation: vi.fn(),
    useUpdateAdminCategoryMutation: vi.fn(),
    useUpdateAdminCompanyMutation: vi.fn(),
  };
});

const companyId = 'ca95a5ec-7e5a-4d5f-acf6-534dd2225276';
const categoryId = '51741c58-0587-4c68-866e-acfe9b36836c';
const applicationId = '5aeb6d48-035e-4f58-aa6f-c222ffe27e97';
const company: AdminCompany = {
  createdAtUtc: '2026-07-20T00:00:00Z',
  description: 'Accessible software products.',
  employeeCount: 100,
  id: companyId,
  industry: 'Technology',
  isDeleted: false,
  isVerified: true,
  location: 'Pune',
  logoUrl: null,
  name: 'Northstar Labs',
  slug: 'northstar-labs',
  updatedAtUtc: null,
  websiteUrl: 'https://northstar.example',
};
const category: AdminCategory = {
  createdAtUtc: '2026-07-20T00:00:00Z',
  description: 'Engineering roles.',
  displayOrder: 1,
  id: categoryId,
  isDeleted: false,
  name: 'Engineering',
  parentCategoryId: null,
  parentCategoryName: null,
  slug: 'engineering',
  updatedAtUtc: null,
};
const application: AdminApplicationDetail = {
  candidate: {
    bio: 'Frontend engineer.',
    education: [],
    email: 'candidate@example.com',
    experience: [],
    firstName: 'Avery',
    headline: 'Senior Engineer',
    id: 'a785e48e-edeb-433b-a02e-f610d5620e87',
    lastName: 'Patel',
    linkedInUrl: null,
    location: 'Pune',
    portfolioUrl: null,
    preferredJobTypes: [EmploymentType.FullTime],
    skills: ['TypeScript'],
  },
  coverLetter: 'Please consider my application.',
  hasResume: true,
  id: applicationId,
  job: {
    categoryId,
    categoryName: category.name,
    companyId,
    companyName: company.name,
    employmentType: EmploymentType.FullTime,
    id: '7d9dfec1-0cdd-4e50-ae52-dd635a904d20',
    location: 'Pune',
    slug: 'frontend-engineer',
    title: 'Frontend Engineer',
    workplaceType: WorkplaceType.Hybrid,
  },
  resumeFileName: 'resume.pdf',
  status: AdminApplicationStatus.Submitted,
  statusHistory: [],
  submittedAtUtc: '2026-07-29T00:00:00Z',
  withdrawnAtUtc: null,
};

const queryResult = <T,>(data?: T, overrides: Record<string, unknown> = {}) =>
  ({
    data,
    error: undefined,
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
    ...overrides,
  }) as unknown;

const mutationResult = <T,>(value?: T) => {
  const unwrap = vi.fn().mockResolvedValue(value);
  const trigger = vi.fn(() => ({ unwrap }));
  return { trigger, tuple: [trigger, { isLoading: false }] };
};

const mocks = {
  applications: vi.mocked(useGetAdminApplicationQuery),
  audit: vi.mocked(useGetAdminAuditLogsQuery),
  categories: vi.mocked(useGetAdminCategoriesQuery),
  category: vi.mocked(useGetAdminCategoryQuery),
  categoryOptions: vi.mocked(useGetAdminCategoryOptionsQuery),
  companies: vi.mocked(useGetAdminCompaniesQuery),
  company: vi.mocked(useGetAdminCompanyQuery),
  createCategory: vi.mocked(useCreateAdminCategoryMutation),
  createCompany: vi.mocked(useCreateAdminCompanyMutation),
  deleteCategory: vi.mocked(useDeleteAdminCategoryMutation),
  deleteCompany: vi.mocked(useDeleteAdminCompanyMutation),
  downloadResume: vi.mocked(downloadAdminApplicationResume),
  updateApplication: vi.mocked(useUpdateAdminApplicationStatusMutation),
  updateCategory: vi.mocked(useUpdateAdminCategoryMutation),
  updateCompany: vi.mocked(useUpdateAdminCompanyMutation),
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.companies.mockReturnValue(
    queryResult({
      items: [company],
      pageNumber: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
    }) as ReturnType<typeof useGetAdminCompaniesQuery>,
  );
  mocks.company.mockReturnValue(queryResult(company) as ReturnType<typeof useGetAdminCompanyQuery>);
  mocks.categories.mockReturnValue(
    queryResult({
      items: [category],
      pageNumber: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
    }) as ReturnType<typeof useGetAdminCategoriesQuery>,
  );
  mocks.category.mockReturnValue(
    queryResult(category) as ReturnType<typeof useGetAdminCategoryQuery>,
  );
  mocks.categoryOptions.mockReturnValue(
    queryResult([{ id: categoryId, name: category.name, slug: category.slug }]) as ReturnType<
      typeof useGetAdminCategoryOptionsQuery
    >,
  );
  mocks.applications.mockReturnValue(
    queryResult(application) as ReturnType<typeof useGetAdminApplicationQuery>,
  );
  mocks.audit.mockReturnValue(
    queryResult({
      items: [
        {
          action: AuditAction.Update,
          actorId: null,
          actorRole: 'Administrator',
          correlationId: 'correlation-123',
          entityId: companyId,
          entityType: 'Company',
          id: 'audit-id',
          metadata: { status: 'updated' },
          occurredAtUtc: '2026-07-29T00:00:00Z',
        },
      ],
      pageNumber: 1,
      pageSize: 20,
      totalCount: 1,
      totalPages: 1,
    }) as ReturnType<typeof useGetAdminAuditLogsQuery>,
  );
  mocks.createCompany.mockReturnValue(
    mutationResult(company).tuple as unknown as ReturnType<typeof useCreateAdminCompanyMutation>,
  );
  mocks.updateCompany.mockReturnValue(
    mutationResult(company).tuple as unknown as ReturnType<typeof useUpdateAdminCompanyMutation>,
  );
  mocks.deleteCompany.mockReturnValue(
    mutationResult().tuple as unknown as ReturnType<typeof useDeleteAdminCompanyMutation>,
  );
  mocks.createCategory.mockReturnValue(
    mutationResult(category).tuple as unknown as ReturnType<typeof useCreateAdminCategoryMutation>,
  );
  mocks.updateCategory.mockReturnValue(
    mutationResult(category).tuple as unknown as ReturnType<typeof useUpdateAdminCategoryMutation>,
  );
  mocks.deleteCategory.mockReturnValue(
    mutationResult().tuple as unknown as ReturnType<typeof useDeleteAdminCategoryMutation>,
  );
  mocks.updateApplication.mockReturnValue(
    mutationResult(application).tuple as unknown as ReturnType<
      typeof useUpdateAdminApplicationStatusMutation
    >,
  );
  mocks.downloadResume.mockResolvedValue(new Blob());
});

describe('Administrator company and category management', () => {
  it('opens the companies CSV import dialog beside the add action', async () => {
    renderWithProviders(
      <MemoryRouter>
        <AdminCompaniesPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Add company' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Import companies CSV' }));
    expect(screen.getByRole('dialog', { name: 'Import companies CSV' })).toBeVisible();
  });

  it('requires confirmation before deleting a company', async () => {
    const mutation = mutationResult();
    mocks.deleteCompany.mockReturnValue(
      mutation.tuple as unknown as ReturnType<typeof useDeleteAdminCompanyMutation>,
    );
    renderWithProviders(
      <MemoryRouter>
        <AdminCompaniesPage />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]!);
    expect(mutation.trigger).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Delete company' }));
    expect(mutation.trigger).toHaveBeenCalledWith(companyId);
  });

  it('creates a validated company through the backend mutation', async () => {
    mocks.company.mockReturnValue(queryResult(undefined) as never);
    const mutation = mutationResult(company);
    mocks.createCompany.mockReturnValue(
      mutation.tuple as unknown as ReturnType<typeof useCreateAdminCompanyMutation>,
    );
    const router = createMemoryRouter(
      [
        { path: '/admin/companies/create', element: <AdminCompanyFormPage /> },
        { path: '/admin/companies/:companyId', element: <p>Company destination</p> },
      ],
      { initialEntries: ['/admin/companies/create'] },
    );
    renderWithProviders(<RouterProvider router={router} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Company name' }), company.name);
    await userEvent.click(screen.getByRole('button', { name: 'Create company' }));
    expect(await screen.findByText('Company destination')).toBeInTheDocument();
    expect(mutation.trigger).toHaveBeenCalledWith(expect.objectContaining({ name: company.name }));
  });

  it('requires confirmation before deleting a category', async () => {
    const mutation = mutationResult();
    mocks.deleteCategory.mockReturnValue(
      mutation.tuple as unknown as ReturnType<typeof useDeleteAdminCategoryMutation>,
    );
    renderWithProviders(
      <MemoryRouter>
        <AdminCategoriesPage />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]!);
    await userEvent.click(screen.getByRole('button', { name: 'Delete category' }));
    expect(mutation.trigger).toHaveBeenCalledWith(categoryId);
  });

  it('creates an ordered category using backend options', async () => {
    mocks.category.mockReturnValue(queryResult(undefined) as never);
    const mutation = mutationResult(category);
    mocks.createCategory.mockReturnValue(
      mutation.tuple as unknown as ReturnType<typeof useCreateAdminCategoryMutation>,
    );
    const router = createMemoryRouter(
      [
        { path: '/admin/categories/create', element: <AdminCategoryFormPage /> },
        { path: '/admin/categories/:categoryId', element: <p>Category destination</p> },
      ],
      { initialEntries: ['/admin/categories/create'] },
    );
    renderWithProviders(<RouterProvider router={router} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Category name' }), category.name);
    await userEvent.click(screen.getByRole('button', { name: 'Create category' }));
    expect(await screen.findByText('Category destination')).toBeInTheDocument();
    expect(mutation.trigger).toHaveBeenCalledWith(
      expect.objectContaining({ displayOrder: 0, name: category.name }),
    );
  });
});

describe('Administrator application review and audit logs', () => {
  it('submits a private internal note with a supported status transition', async () => {
    const mutation = mutationResult({
      ...application,
      status: AdminApplicationStatus.Shortlisted,
    });
    mocks.updateApplication.mockReturnValue(
      mutation.tuple as unknown as ReturnType<typeof useUpdateAdminApplicationStatusMutation>,
    );
    const router = createMemoryRouter(
      [{ path: '/admin/applications/:applicationId', element: <AdminApplicationDetailsPage /> }],
      { initialEntries: [`/admin/applications/${applicationId}`] },
    );
    renderWithProviders(<RouterProvider router={router} />);
    await userEvent.click(screen.getByRole('button', { name: 'Shortlisted' }));
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Internal note' }),
      'Strong accessibility background.',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Update status' }));
    await waitFor(() =>
      expect(mutation.trigger).toHaveBeenCalledWith({
        applicationId,
        request: {
          internalNote: 'Strong accessibility background.',
          status: AdminApplicationStatus.Shortlisted,
        },
      }),
    );
    expect(screen.getByText(/never shown to Candidates/i)).toBeInTheDocument();
  });

  it('disables status actions for a withdrawn application', () => {
    mocks.applications.mockReturnValue(
      queryResult({
        ...application,
        status: AdminApplicationStatus.Withdrawn,
        withdrawnAtUtc: '2026-07-30T00:00:00Z',
      }) as ReturnType<typeof useGetAdminApplicationQuery>,
    );
    const router = createMemoryRouter(
      [{ path: '/admin/applications/:applicationId', element: <AdminApplicationDetailsPage /> }],
      { initialEntries: [`/admin/applications/${applicationId}`] },
    );
    renderWithProviders(<RouterProvider router={router} />);
    expect(screen.getByRole('button', { name: 'Reviewed' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Update status' })).toBeDisabled();
  });

  it('renders audit logs as read-only and supports correlation search', async () => {
    renderWithProviders(
      <MemoryRouter>
        <AdminAuditLogsPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/strictly read-only/i)).toBeInTheDocument();
    expect(screen.getAllByText('correlation-123').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /edit|delete/i })).not.toBeInTheDocument();
    await userEvent.clear(screen.getByRole('textbox', { name: 'Correlation ID' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Correlation ID' }), 'request-456');
    await waitFor(() =>
      expect(mocks.audit.mock.calls.at(-1)?.[0]).toMatchObject({
        correlationId: 'request-456',
      }),
    );
  });
});
