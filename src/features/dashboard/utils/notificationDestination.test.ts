import { UserRole } from '@/types';
import { describe, expect, it } from 'vitest';
import { NotificationType, type DashboardNotification } from '../types/dashboardModels';
import { getNotificationDestination } from './notificationDestination';
import { getNotificationTypeLabel, getSafeNotificationPath } from './dashboardFormatting';
const event = (type: NotificationType, actionUrl: string | null): DashboardNotification => ({
  id: 'n-1',
  type,
  actionUrl,
  title: 'Backend title',
  message: 'Backend message',
  isRead: false,
  readAtUtc: null,
  createdAtUtc: '2026-10-10T10:00:00Z',
});
describe('notification contract and destinations', () => {
  it('matches backend numeric types without changing payment or membership data', () => {
    expect(NotificationType.Application).toBe(0);
    expect(NotificationType.Payment).toBe(2);
    expect(NotificationType.Membership).toBe(3);
    expect([
      NotificationType.Application,
      NotificationType.Profile,
      NotificationType.Payment,
      NotificationType.Membership,
      NotificationType.Security,
      NotificationType.System,
      NotificationType.ReferralApproved,
      NotificationType.ReferralJobSubmitted,
      NotificationType.ReferralRejected,
      NotificationType.ReferralRequested,
      NotificationType.ReferralAccepted,
      NotificationType.ReferralRequestRejected,
      NotificationType.ReferralSubmitted,
      NotificationType.ReferralConfirmed,
      NotificationType.ReferralNotReceived,
      NotificationType.ReferralExpired,
      NotificationType.ReferralRequestReminder,
    ]).toEqual(Array.from({ length: 17 }, (_, index) => index));
    expect(NotificationType.ReferralApproved).toBe(6);
    expect(NotificationType.ReferralRequestReminder).toBe(16);
    expect(getNotificationTypeLabel(NotificationType.Payment)).toBe('Payment');
    expect(getNotificationTypeLabel(NotificationType.ReferralApproved)).toBe('Referral');
  });
  it.each([
    [NotificationType.ReferralApproved, '/dashboard/referrals'],
    [NotificationType.ReferralRejected, '/dashboard/referrals'],
    [NotificationType.ReferralRequested, '/dashboard/referral-requests'],
    [NotificationType.ReferralAccepted, '/dashboard/my-referral-requests'],
    [NotificationType.ReferralRequestRejected, '/dashboard/my-referral-requests'],
    [NotificationType.ReferralSubmitted, '/dashboard/my-referral-requests'],
    [NotificationType.ReferralConfirmed, '/dashboard/referral-requests'],
    [NotificationType.ReferralExpired, '/dashboard/my-referral-requests'],
  ])('uses the supplied recipient-safe destination for %s', (type, path) =>
    expect(getNotificationDestination(event(type, path))).toBe(path),
  );
  it('keeps authorized detail paths and does not guess recipient-dependent destinations', () => {
    expect(
      getNotificationDestination(
        event(NotificationType.ReferralAccepted, '/dashboard/my-referral-requests/req-1'),
      ),
    ).toBe('/dashboard/my-referral-requests/req-1');
    expect(getNotificationDestination(event(NotificationType.ReferralConfirmed, null))).toBeNull();
    expect(getNotificationDestination(event(NotificationType.ReferralExpired, null))).toBeNull();
    expect(getNotificationDestination(event(NotificationType.ReferralApproved, null))).toBe(
      '/dashboard/referrals',
    );
    expect(
      getNotificationDestination(
        event(NotificationType.Application, '/dashboard/applications/a-1'),
      ),
    ).toBe('/dashboard/applications/a-1');
  });
  it.each([
    'https://evil.test',
    '//evil.test',
    '/\\evil.test',
    '/%5cevil.test',
    '/dashboard/../admin/users',
    '/dashboard/%2e%2e/admin',
    '/dashboard/my-referral-requests%0a',
    '/%',
  ])('rejects unsafe URL %s', (path) => expect(getSafeNotificationPath(path)).toBeNull());
  it.each([
    '/admin/users',
    '/dashboard/admin/users',
    '/%61dmin/users',
    '/dashboard/payments',
    '/dashboard/my-referral-requests?redirect=https://evil.test',
  ])('does not turn a referral notification into an unrelated target %s', (path) =>
    expect(getNotificationDestination(event(NotificationType.ReferralAccepted, path))).toBeNull(),
  );
});

it('uses verified role-specific admin fallback without permitting candidate access', () => {
  const notification = event(NotificationType.ReferralJobSubmitted, '/admin/jobs');
  expect(getNotificationDestination(notification, UserRole.Administrator)).toBe('/admin/jobs');
  expect(getNotificationDestination(notification, UserRole.Candidate)).toBeNull();
  expect(getNotificationDestination(notification, UserRole.Employer)).toBeNull();
  for (const path of [null, '/admin/referrals', 'https://evil.test']) {
    expect(
      getNotificationDestination(
        event(NotificationType.ReferralJobSubmitted, path),
        UserRole.Administrator,
      ),
    ).toBe('/admin/jobs');
  }
  expect(
    getNotificationDestination(
      event(NotificationType.ReferralAccepted, null),
      UserRole.Administrator,
    ),
  ).toBeNull();
  expect(getNotificationDestination(event(NotificationType.System, '/ADMIN/jobs'))).toBeNull();
});
