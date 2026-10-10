import { UserRole } from '@/types';
import { ApiRequestError } from '@/api/apiError';
import type { AxiosRequestConfig } from 'axios';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { NotificationBell } from './NotificationBell';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { NotificationType, type DashboardNotification } from '../types/dashboardModels';
const { request } = vi.hoisted(() => ({
  request: vi.fn<(config: AxiosRequestConfig) => Promise<unknown>>(),
}));
vi.mock('@/api/apiClient', () => ({ apiClient: { request } }));
const fixture: DashboardNotification = {
  id: 'n-1',
  title: 'Referral request accepted',
  message: 'Acceptance is not employer submission.',
  type: NotificationType.ReferralAccepted,
  actionUrl: '/dashboard/my-referral-requests',
  isRead: false,
  readAtUtc: null,
  createdAtUtc: '2026-10-10T10:00:00Z',
};
let records: DashboardNotification[];
let pending: Promise<void> | undefined;
let fail: boolean;
let failure: Error;
beforeEach(() => {
  records = [fixture];
  pending = undefined;
  fail = false;
  failure = new Error('Read failed');
  request.mockReset();
  request.mockImplementation(async (config) => {
    if (config.method === 'PUT') {
      if (pending) await pending;
      if (fail) throw failure;
      records = records.map((row) => ({ ...row, isRead: true, readAtUtc: '2026-10-10T11:00:00Z' }));
      return { data: '', status: 204 };
    }
    const params = config.params as { isRead?: boolean; pageNumber: number; pageSize: number };
    return {
      data: {
        data: {
          page: {
            items: records.filter(
              (row) => params.isRead === undefined || row.isRead === params.isRead,
            ),
            pageNumber: params.pageNumber,
            pageSize: params.pageSize,
            totalPages: 2,
            totalCount: records.length,
          },
          unreadCount: records.filter((row) => !row.isRead).length,
        },
      },
    };
  });
});
afterEach(() => vi.unstubAllGlobals());
const Location = () => <output aria-label="Destination">{useLocation().pathname}</output>;
const show = (page = false, role = UserRole.Candidate) =>
  renderWithProviders(
    <MemoryRouter initialEntries={['/dashboard/notifications']}>
      {page ? <NotificationsPage /> : <NotificationBell />}
      <Location />
    </MemoryRouter>,
    role === UserRole.Administrator
      ? {
          auth: {
            status: 'authenticated',
            error: null,
            isSubmitting: false,
            accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
            user: {
              id: 'admin-1',
              email: 'admin@example.com',
              firstName: 'Admin',
              lastName: 'User',
              role,
            },
          },
        }
      : undefined,
  );
it('renders backend title, message, timestamp and unread state in the existing bell', async () => {
  show();
  await userEvent.click(await screen.findByRole('button', { name: 'Notifications, 1 unread' }));
  const dialog = screen.getByRole('dialog', { name: 'Recent notifications' });
  expect(within(dialog).getByText(fixture.message)).toBeVisible();
  expect(within(dialog).getByText('Unread')).toBeVisible();
  expect(within(dialog).getByText('Referral')).toBeVisible();
  expect(within(dialog).getByRole('article').querySelector('time')).toHaveAttribute(
    'dateTime',
    fixture.createdAtUtc,
  );
});
it('waits for backend read confirmation, prevents duplicate actions, refreshes unread count and opens the recipient page', async () => {
  let resolve!: () => void;
  pending = new Promise<void>((done) => {
    resolve = done;
  });
  show();
  const bell = await screen.findByRole('button', { name: 'Notifications, 1 unread' });
  await userEvent.click(bell);
  await userEvent.dblClick(screen.getByRole('link', { name: 'Open update' }));
  expect(request.mock.calls.filter(([config]) => config.method === 'PUT')).toHaveLength(1);
  expect(screen.getByLabelText('Destination')).toHaveTextContent('/dashboard/notifications');
  expect(bell).toHaveAttribute('aria-label', 'Notifications, 1 unread');
  resolve();
  await waitFor(() =>
    expect(screen.getByLabelText('Destination')).toHaveTextContent(
      '/dashboard/my-referral-requests',
    ),
  );
  expect(await screen.findByRole('button', { name: 'Notifications' })).toBeInTheDocument();
  expect(
    request.mock.calls.some(([config]) => config.url === '/dashboard/notifications/n-1/read'),
  ).toBe(true);
});
it('retains unread state and route after a failed read action', async () => {
  fail = true;
  show();
  await userEvent.click(await screen.findByRole('button', { name: 'Notifications, 1 unread' }));
  await userEvent.click(screen.getByRole('link', { name: 'Open update' }));
  expect(await screen.findByText(/Unable to mark this notification as read/)).toBeVisible();
  expect(screen.getByLabelText('Destination')).toHaveTextContent('/dashboard/notifications');
  expect(screen.getByText('Unread')).toBeVisible();
});
it('supports mobile navigation and opens already-read updates without another PUT', async () => {
  vi.stubGlobal('innerWidth', 360);
  records = [{ ...fixture, isRead: true }];
  show();
  fireEvent.resize(window);
  await userEvent.click(await screen.findByRole('button', { name: 'Notifications' }));
  expect(await screen.findByText('Read')).toBeVisible();
  await userEvent.click(screen.getByRole('link', { name: 'Open update' }));
  expect(screen.getByLabelText('Destination')).toHaveTextContent('/dashboard/my-referral-requests');
  expect(request.mock.calls.filter(([config]) => config.method === 'PUT')).toHaveLength(0);
});
it('preserves other categories, filter/pagination parameters and mark-all API behavior', async () => {
  records = [
    {
      ...fixture,
      type: NotificationType.Payment,
      title: 'Payment received',
      actionUrl: '/dashboard/payments',
    },
  ];
  show(true);
  expect(await screen.findByText('Payment received')).toBeVisible();
  expect(screen.getByText('Payment')).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Unread' }));
  await waitFor(() =>
    expect(
      request.mock.calls.some(
        ([config]) => (config.params as { isRead?: boolean }).isRead === false,
      ),
    ).toBe(true),
  );
  await userEvent.click(screen.getByRole('button', { name: 'Go to page 2' }));
  await waitFor(() =>
    expect(
      request.mock.calls.some(
        ([config]) => (config.params as { pageNumber?: number }).pageNumber === 2,
      ),
    ).toBe(true),
  );
  await userEvent.click(screen.getByRole('button', { name: 'Mark all read' }));
  await waitFor(() =>
    expect(
      request.mock.calls.some(([config]) => config.url === '/dashboard/notifications/read-all'),
    ).toBe(true),
  );
});

it('opens the verified admin approval page and uses an admin-guarded inbox', async () => {
  records = [{ ...fixture, type: NotificationType.ReferralJobSubmitted, actionUrl: '/admin/jobs' }];
  show(false, UserRole.Administrator);
  await userEvent.click(await screen.findByRole('button', { name: 'Notifications, 1 unread' }));
  expect(screen.getByRole('link', { name: 'View all notifications' })).toHaveAttribute(
    'href',
    '/admin/notifications',
  );
  await userEvent.click(screen.getByRole('link', { name: 'Open update' }));
  await waitFor(() =>
    expect(screen.getByLabelText('Destination')).toHaveTextContent('/admin/jobs'),
  );
});
it('never exposes an admin approval link in the candidate bell', async () => {
  records = [{ ...fixture, type: NotificationType.ReferralJobSubmitted, actionUrl: '/admin/jobs' }];
  show();
  await userEvent.click(await screen.findByRole('button', { name: 'Notifications, 1 unread' }));
  expect(screen.queryByRole('link', { name: 'Open update' })).not.toBeInTheDocument();
});
it('waits for mark-all confirmation, prevents duplicate clicks and refreshes the server count', async () => {
  let resolve!: () => void;
  pending = new Promise<void>((done) => {
    resolve = done;
  });
  show(true);
  await screen.findByText(fixture.title);
  await userEvent.dblClick(screen.getByRole('button', { name: 'Mark all read' }));
  expect(request.mock.calls.filter(([config]) => config.method === 'PUT')).toHaveLength(1);
  expect(screen.getByText('1 unread')).toBeVisible();
  expect(screen.queryByText('All notifications marked as read.')).not.toBeInTheDocument();
  resolve();
  expect(await screen.findByText('All notifications marked as read.')).toBeVisible();
  expect(await screen.findByText('0 unread')).toBeVisible();
  expect(screen.getByText('Read', { selector: '.MuiChip-label' })).toBeVisible();
});
it('preserves notifications and unread count on mark-all network failure and permits retry', async () => {
  fail = true;
  show(true);
  await screen.findByText(fixture.title);
  await userEvent.click(screen.getByRole('button', { name: 'Mark all read' }));
  expect(
    await screen.findByText('Unable to update notifications. Please try again.'),
  ).toBeVisible();
  expect(screen.getByText('1 unread')).toBeVisible();
  expect(screen.getByText(fixture.title)).toBeVisible();
  expect(screen.queryByText('All notifications marked as read.')).not.toBeInTheDocument();
  fail = false;
  await userEvent.click(screen.getByRole('button', { name: 'Mark all read' }));
  expect(await screen.findByText('0 unread')).toBeVisible();
});
it.each([401, 403, 404, 500])('retains the item when the read API returns %s', async (status) => {
  fail = true;
  failure = new ApiRequestError({ status, message: 'Backend rejected the read action.' });
  show();
  await userEvent.click(await screen.findByRole('button', { name: 'Notifications, 1 unread' }));
  await userEvent.click(screen.getByRole('button', { name: 'Mark as read' }));
  expect(await screen.findByText(/Unable to mark this notification as read/)).toBeVisible();
  expect(screen.getByText('Unread')).toBeVisible();
  expect(screen.getByText(fixture.title)).toBeVisible();
});
it('supports keyboard opening, Escape dismissal and focus return at 360px with long titles', async () => {
  vi.stubGlobal('innerWidth', 360);
  records = [{ ...fixture, title: 'Very long job title '.repeat(20) }];
  show();
  const bell = await screen.findByRole('button', { name: 'Notifications, 1 unread' });
  bell.focus();
  await userEvent.keyboard('{Enter}');
  const item = screen.getByRole('article');
  expect(getComputedStyle(item).overflowWrap).toBe('anywhere');
  expect(getComputedStyle(item.closest('.MuiPopover-paper')!).maxWidth).toBe('calc(100vw - 32px)');
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(bell).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  const link = screen.getByRole('link', { name: 'Open update' });
  link.focus();
  await userEvent.keyboard('{Enter}');
  await waitFor(() =>
    expect(screen.getByLabelText('Destination')).toHaveTextContent(
      '/dashboard/my-referral-requests',
    ),
  );
});
