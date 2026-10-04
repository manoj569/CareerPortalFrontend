import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AxiosRequestConfig } from 'axios';
import { renderWithProviders } from '@/test/renderWithProviders';
import { UserRole } from '@/types';
import { ApiRequestError } from '@/api/apiError';
import { AdminRoute } from '@/routes/AdminRoute';
import { appRoutes } from '@/routes/routeConfig';
import { adminNavigationItems } from '@/layouts/adminNavigation';
import { AdminSupportTicketsPage } from './AdminSupportTicketsPage';
import { AdminSupportTicketDetailsPage } from './AdminSupportTicketDetailsPage';
import { adminSupportPath, adminSupportRoutes, type AdminSupportTicket } from './adminSupportApi';

const { request } = vi.hoisted(() => ({
  request: vi.fn<(config: AxiosRequestConfig) => Promise<unknown>>(),
}));
vi.mock('@/api/apiClient', () => ({ apiClient: { request } }));
const auth = {
  status: 'authenticated' as const,
  user: {
    id: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.test',
    role: UserRole.Administrator,
  },
  isSubmitting: false,
  error: null,
  accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
};
const id = '10cc4e38-ed2f-41f2-a84a-246717bf1ed6';
const secondId = '20cc4e38-ed2f-41f2-a84a-246717bf1ed6';
let ticket: AdminSupportTicket;
const revoke = vi.fn();
function param(config: AxiosRequestConfig, key: string): unknown {
  const value: unknown = config.params;
  return value && typeof value === 'object' && key in value
    ? (Reflect.get(value, key) as unknown)
    : undefined;
}
function field(config: AxiosRequestConfig, key: string): unknown {
  const value: unknown = config.data;
  return value && typeof value === 'object' && key in value
    ? (Reflect.get(value, key) as unknown)
    : undefined;
}
beforeEach(() => {
  ticket = {
    id,
    userId: null,
    ticketNumber: 'CH-36384E38ED2F41F2A84A246717BF1ED6',
    name: 'Guest User',
    email: 'guest@example.test',
    category: 'Registration',
    subject: 'Unable to register',
    description: 'Please help me register.',
    status: 'Open',
    adminNotes: null,
    hasScreenshot: true,
    createdAtUtc: '2026-10-04T07:00:00Z',
    updatedAtUtc: null,
    resolvedAtUtc: null,
  };
  revoke.mockClear();
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: vi.fn(() => 'blob:private-admin'),
  });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revoke });
  request.mockReset().mockImplementation((config) => {
    if (config.responseType === 'blob')
      return Promise.resolve({ data: new Blob(['image'], { type: 'image/png' }) });
    if (config.url?.endsWith('/status')) {
      const status = field(config, 'status');
      if (
        status !== 'Open' &&
        status !== 'InProgress' &&
        status !== 'Resolved' &&
        status !== 'Closed'
      )
        throw new Error('Unexpected status');
      ticket = {
        ...ticket,
        status,
        resolvedAtUtc: status === 'Resolved' ? '2026-10-04T10:30:00Z' : null,
        updatedAtUtc: '2026-10-04T10:30:00Z',
      };
    }
    if (config.url?.endsWith('/notes')) {
      const notes = field(config, 'adminNotes');
      if (typeof notes !== 'string' && notes !== null) throw new Error('Unexpected notes');
      ticket = { ...ticket, adminNotes: notes };
    }
    if (config.url === '/admin/support/tickets')
      return Promise.resolve({
        data: {
          data: {
            items:
              param(config, 'PageNumber') === 2
                ? [{ ...ticket, id: secondId, ticketNumber: 'CH-PAGE-TWO' }]
                : [
                    ticket,
                    {
                      ...ticket,
                      id: secondId,
                      userId: 'user-2',
                      name: 'Registered Person',
                      email: 'registered@example.test',
                      ticketNumber: 'CH-REGISTERED',
                    },
                  ],
            pageNumber: param(config, 'PageNumber'),
            pageSize: 20,
            totalCount: 21,
            totalPages: 2,
          },
        },
      });
    return Promise.resolve({
      data: { data: { ...ticket, screenshotPath: '/private/secret.png' } },
    });
  });
});
afterEach(async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
});
function page(path: string = adminSupportRoutes.list, role = UserRole.Administrator) {
  return renderWithProviders(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AdminRoute />}>
          <Route path={adminSupportRoutes.list} element={<AdminSupportTicketsPage />} />
          <Route path={adminSupportRoutes.detail} element={<AdminSupportTicketDetailsPage />} />
        </Route>
        <Route path="/unauthorized" element={<p>Unauthorized</p>} />
        <Route path="/login" element={<p>Sign in required</p>} />
      </Routes>
    </MemoryRouter>,
    { auth: { ...auth, user: { ...auth.user, role } } },
  );
}
function select(label: string, option: string) {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: label }));
  fireEvent.click(screen.getByRole('option', { name: option }));
}
async function detail() {
  const view = page(adminSupportPath(id));
  await screen.findByText(ticket.description);
  return view;
}
describe('admin support integration', () => {
  it('real Administrator route and sidebar expose support between Payments and Audit logs', async () => {
    renderWithProviders(
      <RouterProvider
        router={createMemoryRouter(appRoutes, { initialEntries: [adminSupportRoutes.list] })}
      />,
      { auth },
    );
    expect(await screen.findByRole('heading', { name: 'Support Tickets' }, { timeout: 10000 })).toBeVisible();
    const position = adminNavigationItems.findIndex(
      (item) => item.path === adminSupportRoutes.list,
    );
    expect(adminNavigationItems.at(position - 1)?.label).toBe('Payments');
    expect(adminNavigationItems.at(position + 1)?.label).toBe('Audit logs');
    expect(
      screen
        .getAllByRole('link', { name: 'Support Tickets' })
        .some((link) => link.getAttribute('aria-current') === 'page'),
    ).toBe(true);
  });
  it('lists guest and registered owners and uses UUID when opening details', async () => {
    page();
    const table = await screen.findByRole('table', { name: 'Support tickets' });
    expect(within(table).getAllByText('Guest User')).toHaveLength(2);
    expect(within(table).getByText('Registered User')).toBeVisible();
    expect(within(table).getByText('registered@example.test')).toBeVisible();
    fireEvent.click(within(table).getByRole('link', { name: `View ${ticket.ticketNumber}` }));
    await screen.findByText(ticket.description);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ url: `/admin/support/tickets/${id}`, method: 'GET' }),
    );
    expect(screen.queryByText('/private/secret.png')).not.toBeInTheDocument();
    expect(screen.queryByText(id)).not.toBeInTheDocument();
  });
  it.each([
    ['Open', 'Open'],
    ['In Progress', 'InProgress'],
    ['Resolved', 'Resolved'],
    ['Closed', 'Closed'],
  ] as const)('status %s is serialized through server filters', async (label, value) => {
    page();
    await screen.findByRole('table');
    fireEvent.click(screen.getByRole('button', { name: label }));
    await waitFor(() =>
      expect(
        request.mock.calls.some(
          ([config]) =>
            config.url === '/admin/support/tickets' &&
            param(config, 'Status') === value &&
            param(config, 'PageNumber') === 1 &&
            param(config, 'PageSize') === 20,
        ),
      ).toBe(true),
    );
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    await waitFor(() => expect(screen.getByRole('table')).toBeVisible());
    const last = request.mock.calls.at(-1);
    if (!last) throw new Error('Expected list request');
    expect(param(last[0], 'Status')).toBeUndefined();
  });
  it('category, exact email/ticket, and local date range become backend parameters; clearing resets paging', async () => {
    page();
    await screen.findByRole('table');
    select('Category', 'Membership');
    fireEvent.change(screen.getByLabelText('Email (exact match)'), {
      target: { value: 'user@example.test' },
    });
    fireEvent.change(screen.getByLabelText('Ticket Number (exact match)'), {
      target: { value: ticket.ticketNumber },
    });
    fireEvent.change(screen.getByLabelText('Created from'), {
      target: { value: '2026-10-03T10:00' },
    });
    fireEvent.change(screen.getByLabelText('Created before'), {
      target: { value: '2026-10-04T10:00' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }));
    await waitFor(() =>
      expect(
        request.mock.calls.some(
          ([config]) =>
            param(config, 'Category') === 'Membership' &&
            param(config, 'Email') === 'user@example.test' &&
            param(config, 'TicketNumber') === ticket.ticketNumber &&
            param(config, 'FromUtc') === new Date('2026-10-03T10:00').toISOString() &&
            param(config, 'ToUtc') === new Date('2026-10-04T10:00').toISOString(),
        ),
      ).toBe(true),
    );
    fireEvent.click(await screen.findByRole('button', { name: /page 2/i }));
    await screen.findByText('CH-PAGE-TWO');
    expect(
      request.mock.calls.some(
        ([config]) =>
          param(config, 'PageNumber') === 2 && param(config, 'Category') === 'Membership',
      ),
    ).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Clear Filters' }));
    await screen.findByText('CH-REGISTERED');
    expect(screen.getByLabelText('Email (exact match)')).toHaveValue('');
  });
  it('rejects inverted dates before sending a filtered request', async () => {
    page();
    await screen.findByRole('table');
    const before = request.mock.calls.length;
    fireEvent.change(screen.getByLabelText('Created from'), {
      target: { value: '2026-10-04T10:00' },
    });
    fireEvent.change(screen.getByLabelText('Created before'), {
      target: { value: '2026-10-03T10:00' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Created before must be later');
    expect(request.mock.calls).toHaveLength(before);
  });
  it('Open → In Progress → Resolved displays server timestamps and clears them when reopened', async () => {
    await detail();
    select('Status', 'In Progress');
    fireEvent.click(screen.getByRole('button', { name: 'Update Status' }));
    await screen.findByText('Current status: In Progress');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `/admin/support/tickets/${id}/status`,
        method: 'PATCH',
        data: { status: 'InProgress' },
      }),
    );
    select('Status', 'Resolved');
    fireEvent.click(screen.getByRole('button', { name: 'Update Status' }));
    await screen.findByText('Current status: Resolved');
    expect(screen.getByText(/^Resolved:/)).toBeVisible();
    expect(ticket.resolvedAtUtc).toBe('2026-10-04T10:30:00Z');
    select('Status', 'Open');
    fireEvent.click(screen.getByRole('button', { name: 'Update Status' }));
    await screen.findByText('Current status: Open');
    expect(screen.queryByText(/^Resolved:/)).not.toBeInTheDocument();
  });
  it('rejected status update retains saved status and avoids exception disclosure', async () => {
    await detail();
    request.mockRejectedValueOnce(
      new ApiRequestError({ status: 409, message: 'SECRET DATABASE STACK' }),
    );
    select('Status', 'Resolved');
    fireEvent.click(screen.getByRole('button', { name: 'Update Status' }));
    expect(await screen.findByText(/changed while you were saving/)).toBeVisible();
    expect(screen.getByText('Current status: Open')).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent('Open');
    expect(screen.queryByText(/SECRET/)).not.toBeInTheDocument();
  });
  it('notes save prevents duplicate PATCH requests, uses the server response, and supports clearing', async () => {
    await detail();
    let resolve: ((value: unknown) => void) | undefined;
    request.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    fireEvent.change(screen.getByLabelText('Internal Admin Notes'), {
      target: { value: 'Investigated the account.' },
    });
    const save = screen.getByRole('button', { name: 'Save Notes' });
    fireEvent.click(save);
    fireEvent.click(save);
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    expect(request.mock.calls.filter(([config]) => config.method === 'PATCH')).toHaveLength(1);
    const call = request.mock.calls.at(-1);
    if (!call) throw new Error('Expected notes PATCH');
    expect(call[0]).toEqual(
      expect.objectContaining({
        url: `/admin/support/tickets/${id}/notes`,
        data: { adminNotes: 'Investigated the account.' },
      }),
    );
    act(() => {
      if (!resolve) throw new Error('Expected pending notes save');
      resolve({ data: { data: { ...ticket, adminNotes: 'Investigated the account.' } } });
    });
    await screen.findByText('Internal notes saved.');
    expect(screen.getByRole('button', { name: 'Save Notes' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Internal Admin Notes'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Notes' }));
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(expect.objectContaining({ data: { adminNotes: null } })),
    );
  });
  it('notes errors retain unsaved text and length validation prevents invalid requests', async () => {
    await detail();
    const input = screen.getByLabelText('Internal Admin Notes');
    expect(input).toHaveAttribute('maxlength', '5000');
    fireEvent.change(input, { target: { value: 'x'.repeat(5001) } });
    expect(screen.getByRole('button', { name: 'Save Notes' })).toBeDisabled();
    fireEvent.change(input, { target: { value: 'My private draft' } });
    request.mockRejectedValueOnce(new ApiRequestError({ status: 500, message: 'SECRET' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save Notes' }));
    expect(
      await screen.findByText('We could not complete this request. Please try again.'),
    ).toBeVisible();
    expect(input).toHaveValue('My private draft');
    expect(screen.queryByText('SECRET')).not.toBeInTheDocument();
  });
  it('private screenshot uses the Administrator UUID endpoint and revokes its object URL', async () => {
    const view = await detail();
    fireEvent.click(screen.getByRole('button', { name: 'View Screenshot' }));
    expect(await screen.findByAltText('Support ticket screenshot')).toHaveAttribute(
      'src',
      'blob:private-admin',
    );
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `/admin/support/tickets/${id}/screenshot`,
        responseType: 'blob',
      }),
    );
    expect(screen.queryByText('/private/secret.png')).not.toBeInTheDocument();
    view.unmount();
    expect(revoke).toHaveBeenCalledWith('blob:private-admin');
  });
  it.each([adminSupportRoutes.list, adminSupportPath(id)])(
    'Candidate cannot enter %s or trigger an admin request',
    async (path) => {
      page(path, UserRole.Candidate);
      expect(await screen.findByText('Unauthorized')).toBeVisible();
      expect(request).not.toHaveBeenCalled();
    },
  );
  it('403 follows existing admin session handling and never displays returned data', async () => {
    request.mockRejectedValue(new ApiRequestError({ status: 403, message: 'PRIVATE STACK' }));
    page();
    expect(await screen.findByText('Sign in required')).toBeVisible();
    expect(screen.queryByText(/PRIVATE/)).not.toBeInTheDocument();
  });
  it.each([false, true])('empty state is clear: filtered=%s', async (filtered) => {
    request.mockResolvedValue({
      data: { data: { items: [], pageNumber: 1, pageSize: 20, totalCount: 0, totalPages: 0 } },
    });
    page(filtered ? '/admin/support?status=Open' : adminSupportRoutes.list);
    expect(
      await screen.findByText(
        filtered ? 'No support requests match these filters.' : 'No support requests found.',
      ),
    ).toBeVisible();
  });
  it('loading and safe error states support Retry', async () => {
    let reject: ((error: unknown) => void) | undefined;
    request.mockImplementationOnce(
      () =>
        new Promise((_, failure) => {
          reject = failure;
        }),
    );
    page();
    expect(screen.getByRole('status', { name: 'Loading support tickets' })).toBeVisible();
    act(() => {
      if (!reject) throw new Error('Expected pending list');
      reject(new ApiRequestError({ status: 500, message: 'SECRET STACK' }));
    });
    expect(await screen.findByRole('alert')).not.toHaveTextContent('SECRET');
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('table')).toBeVisible();
  });
});
