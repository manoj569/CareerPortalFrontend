import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AxiosRequestConfig } from 'axios';
import { renderWithProviders } from '@/test/renderWithProviders';
import { UserRole } from '@/types';
import { ApiRequestError } from '@/api/apiError';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { PublicLayout } from '@/layouts/PublicLayout';
import { SupportButton } from './SupportButton';
import { MySupportTicketsPage } from './MySupportTicketsPage';
import { screenshotError, supportApi, supportRoutes } from './supportApi';

const { request } = vi.hoisted(() => ({
  request: vi.fn<(config: AxiosRequestConfig) => Promise<unknown>>(),
}));
vi.mock('@/api/apiClient', () => ({ apiClient: { request } }));
vi.mock('@/features/auth/components/GoogleAuthorizationCodeButton', () => ({
  GoogleAuthorizationCodeButton: () => null,
}));
const auth = {
  status: 'authenticated' as const,
  user: {
    id: 'owner',
    firstName: 'Test',
    lastName: 'User',
    email: 'owner@example.test',
    role: UserRole.Candidate,
  },
  isSubmitting: false,
  error: null,
  accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
};
const guest = { ...auth, status: 'unauthenticated' as const, user: null };
const ticket = {
  ticketNumber: 'CH-BACKEND',
  category: 'Payment',
  subject: 'Payment issue',
  description: 'My payment needs checking.',
  status: 'InProgress',
  hasScreenshot: true,
  createdAtUtc: '2026-10-04T07:00:00Z',
  updatedAtUtc: null,
  resolvedAtUtc: null,
  adminNotes: 'INTERNAL NEVER SHOW',
  storageKey: '/private/secret.png',
};
const revoke = vi.fn();
beforeEach(() => {
  request.mockReset().mockResolvedValue({ data: { data: { ticketNumber: 'CH-BACKEND' } } });
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: vi.fn(() => 'blob:support-private'),
  });
  revoke.mockClear();
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revoke });
});
function open(authenticated = false) {
  const view = renderWithProviders(
    <MemoryRouter>
      <SupportButton initialCategory="Login" />
    </MemoryRouter>,
    { auth: authenticated ? auth : guest },
  );
  fireEvent.click(screen.getByRole('button', { name: 'Contact Support' }));
  return view;
}
function fill(authenticated = false) {
  const dialog = screen.getByRole('dialog');
  if (!authenticated) {
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'Guest User' } });
    fireEvent.change(within(dialog).getByLabelText(/Email/), {
      target: { value: 'guest@example.test' },
    });
  }
  fireEvent.change(within(dialog).getByLabelText(/Subject/), {
    target: { value: 'Unable to log in' },
  });
  fireEvent.change(within(dialog).getByLabelText(/Description/), {
    target: { value: 'I need help with sign in.' },
  });
}
describe('support creation', () => {
  it('public footer opens guest support without forcing a category', () => {
    renderWithProviders(
      <MemoryRouter>
        <PublicLayout />
      </MemoryRouter>,
      { auth: guest },
    );
    fireEvent.click(
      within(screen.getByRole('contentinfo')).getByRole('button', { name: 'Help & Support' }),
    );
    expect(
      within(screen.getByRole('dialog')).getByRole('combobox', { name: /Problem Type/ }),
    ).not.toHaveTextContent('Login');
    expect(screen.getByLabelText(/Name/)).toBeEnabled();
  });
  it('submitting support on Registration does not submit the enclosing registration form', async () => {
    renderWithProviders(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
      { auth: guest },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Contact Support' }));
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'Submit Request' }));
    await screen.findByText('CH-BACKEND');
    expect(
      screen.queryByText('Please correct the highlighted fields before creating your account.'),
    ).not.toBeInTheDocument();
  });
  it.each([
    [LoginPage, 'Login'],
    [RegisterPage, 'Registration'],
  ] as const)('auth page opens the correct category: %s', (Page, category) => {
    renderWithProviders(
      <MemoryRouter>
        <Page />
      </MemoryRouter>,
      { auth: guest },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Contact Support' }));
    expect(
      within(screen.getByRole('dialog')).getByRole('combobox', { name: /Problem Type/ }),
    ).toHaveTextContent(category);
  });
  it('guest validation keeps required name/email editable and prevents a request', () => {
    open();
    fireEvent.click(screen.getByRole('button', { name: 'Submit Request' }));
    expect(screen.getByText('Enter a valid email address.')).toBeVisible();
    expect(screen.getByText('Enter your name (up to 201 characters).')).toBeVisible();
    expect(request).not.toHaveBeenCalled();
  });
  it.each([
    ['photo.jpg', 'image/jpeg'],
    ['photo.jpeg', 'image/jpeg'],
    ['photo.png', 'image/png'],
    ['photo.webp', 'image/webp'],
  ])('accepts supported screenshot %s', (name, type) => {
    expect(screenshotError(new File(['image'], name, { type }))).toBeNull();
  });
  it.each([
    [
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' }),
      'Screenshot must be smaller than 5 MB.',
    ],
    [
      new File(['pdf'], 'file.pdf', { type: 'application/pdf' }),
      'Screenshot must be JPG, PNG or WebP.',
    ],
  ])('rejects invalid attachment in form', (file, message) => {
    open();
    fireEvent.change(screen.getByLabelText('Attach Screenshot'), { target: { files: [file] } });
    expect(screen.getByText(message)).toBeVisible();
    expect(request).not.toHaveBeenCalled();
  });
  it('submits one multipart request, shows backend number, and prevents duplicate submission', async () => {
    let resolve: ((value: unknown) => void) | undefined;
    request.mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    open();
    fill();
    const file = new File(['image'], 'photo.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText('Attach Screenshot'), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Request' }));
    fireEvent.submit(
      screen.getByRole('dialog').querySelector('form') ??
        (() => {
          throw new Error('Expected support form');
        })(),
    );
    expect(request).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Submitting...' })).toBeDisabled();
    const call = request.mock.calls.at(0);
    if (!call || !(call[0].data instanceof FormData)) throw new Error('Expected multipart request');
    expect(call[0].url).toBe('/support/tickets');
    expect(call[0].method).toBe('POST');
    expect(call[0].headers).toBeUndefined();
    expect(call[0].data.get('Category')).toBe('Login');
    expect(call[0].data.get('Name')).toBe('Guest User');
    expect(call[0].data.get('Screenshot')).toBe(file);
    expect(call[0].data.has('UserId')).toBe(false);
    act(() => {
      if (!resolve) throw new Error('Expected pending request');
      resolve({ data: { data: { ticketNumber: 'CH-REAL-NUMBER' } } });
    });
    expect(await screen.findByText('CH-REAL-NUMBER')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Submit Request' })).not.toBeInTheDocument();
  });
  it.each([429, 400, 500])('friendly backend error with safe retry, status %s', async (status) => {
    request.mockRejectedValue(
      new ApiRequestError({
        status,
        message: 'SECRET STACK TRACE',
        errors: status === 400 ? { Subject: ['SECRET'] } : undefined,
      }),
    );
    open();
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'Submit Request' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Submit Request' })).toBeEnabled(),
    );
    expect(screen.queryByText(/SECRET/)).not.toBeInTheDocument();
    expect(
      await screen.findByText(
        status === 429
          ? /Too many support requests/
          : status === 400
            ? 'Please check the highlighted fields.'
            : /couldn't complete/,
      ),
    ).toBeVisible();
    request.mockResolvedValue({ data: { data: { ticketNumber: 'CH-RETRY' } } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Request' }));
    expect(await screen.findByText('CH-RETRY')).toBeVisible();
  });
  it('authenticated account is prefilled read-only and identity is not submitted', async () => {
    open(true);
    fill(true);
    expect(screen.getByLabelText('Name')).toHaveValue('Test User');
    expect(screen.getByLabelText('Email')).toHaveAttribute('readonly');
    fireEvent.click(screen.getByRole('button', { name: 'Submit Request' }));
    await screen.findByText('CH-BACKEND');
    const call = request.mock.calls.at(0);
    if (!call || !(call[0].data instanceof FormData)) throw new Error('Expected FormData');
    for (const key of ['Name', 'Email', 'UserId', 'AdminNotes'])
      expect(call[0].data.has(key)).toBe(false);
    expect(screen.getByRole('link', { name: 'View My Tickets' })).toHaveAttribute(
      'href',
      supportRoutes.tickets,
    );
  });
  it('dialog uses fluid small-screen width and allows cancellation', async () => {
    open();
    const paper = screen.getByRole('dialog');
    expect(paper).toHaveStyle({ minWidth: '0' });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
describe('owner support requests', () => {
  it('refreshes My Tickets after creating a request from that same page', async () => {
    let created = false;
    request.mockImplementation(config => {
      if (config.method === 'POST') { created = true; return Promise.resolve({ data: { data: { ticketNumber: ticket.ticketNumber } } }); }
      return Promise.resolve({ data: { data: { items: created ? [ticket] : [], pageNumber: 1, pageSize: 20, totalCount: created ? 1 : 0, totalPages: created ? 1 : 0 } } });
    });
    renderWithProviders(<MemoryRouter initialEntries={[supportRoutes.tickets]}><Routes><Route path={supportRoutes.tickets} element={<MySupportTicketsPage />} /></Routes></MemoryRouter>, { auth });
    await screen.findByText('You have no support requests yet.');
    fireEvent.click(screen.getByRole('button', { name: 'Contact Support' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: /Problem Type/ }));
    fireEvent.click(screen.getByRole('option', { name: 'Payment' }));
    fill(true); fireEvent.click(screen.getByRole('button', { name: 'Submit Request' }));
    fireEvent.click(await screen.findByRole('link', { name: 'View My Tickets' }));
    expect(await screen.findByRole('link', { name: 'CH-BACKEND' })).toBeVisible();
  });
  it('loads paginated owner list and navigates to owner-safe details', async () => {
    request.mockImplementation((config) =>
      Promise.resolve({
        data: {
          data: config.url?.endsWith('/my')
            ? { items: [ticket], pageNumber: 1, pageSize: 20, totalCount: 21, totalPages: 2 }
            : ticket,
        },
      }),
    );
    renderWithProviders(
      <MemoryRouter initialEntries={[supportRoutes.tickets]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path={supportRoutes.tickets} element={<MySupportTicketsPage />} />
            <Route path={supportRoutes.detail} element={<MySupportTicketsPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
      { auth },
    );
    await screen.findByText('CH-BACKEND');
    fireEvent.click(screen.getByRole('button', { name: /page 2/i }));
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/support/tickets/my',
          params: { PageNumber: 2, PageSize: 20 },
        }),
      ),
    );
    fireEvent.click(await screen.findByRole('link', { name: 'CH-BACKEND' }));
    await screen.findByText('My payment needs checking.');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/support/tickets/my/CH-BACKEND' }),
    );
    expect(screen.queryByText('INTERNAL NEVER SHOW')).not.toBeInTheDocument();
    expect(screen.queryByText('/private/secret.png')).not.toBeInTheDocument();
  });
  it('private screenshot is fetched through authorized client and object URL is revoked', async () => {
    request.mockImplementation((config) =>
      Promise.resolve({
        data:
          config.responseType === 'blob'
            ? new Blob(['image'], { type: 'image/png' })
            : { data: ticket },
      }),
    );
    const view = renderWithProviders(
      <MemoryRouter initialEntries={['/support/my-tickets/CH-BACKEND']}>
        <Routes>
          <Route path={supportRoutes.detail} element={<MySupportTicketsPage />} />
        </Routes>
      </MemoryRouter>,
      { auth },
    );
    fireEvent.click(await screen.findByRole('button', { name: 'View Screenshot' }));
    expect(await screen.findByAltText('Support request screenshot')).toHaveAttribute(
      'src',
      'blob:support-private',
    );
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/support/tickets/my/CH-BACKEND/screenshot',
        responseType: 'blob',
      }),
    );
    view.unmount();
    expect(revoke).toHaveBeenCalledWith('blob:support-private');
  });
  it('guests cannot load owner details', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/support/my-tickets/CH-BACKEND']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path={supportRoutes.detail} element={<MySupportTicketsPage />} />
          </Route>
          <Route path="/login" element={<p>Login required</p>} />
        </Routes>
      </MemoryRouter>,
      { auth: guest },
    );
    expect(await screen.findByText('Login required')).toBeVisible();
    expect(request).not.toHaveBeenCalled();
  });
  it('API encodes ticket numbers rather than constructing a public screenshot URL', async () => {
    await supportApi.screenshot('CH/a?', new AbortController().signal);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/support/tickets/my/CH%2Fa%3F/screenshot',
        responseType: 'blob',
      }),
    );
  });
});
