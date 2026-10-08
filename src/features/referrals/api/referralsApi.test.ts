import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAppStore } from '@/store/store';
import { referralsApi } from './referralsApi';

const { request } = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@/api/apiClient', () => ({ apiClient: { request } }));

describe('authoritative referral contact access', () => {
  beforeEach(() => {
    request.mockReset();
    localStorage.clear();
    sessionStorage.clear();
  });
  it.each([
    [1, 'Granted'],
    [2, 'LoginRequired'],
    [3, 'MembershipRequired'],
    [4, 'RequestRequired'],
    [99, 'RequestRequired'],
  ])('maps backend status %s and keeps denied contact private', async (status, expected) => {
    request.mockResolvedValue({
      data: {
        data: { status, message: 'Backend decision', contact: { email: 'referrer@example.test' } },
      },
    });
    const store = createAppStore();
    const subscription = store.dispatch(
      referralsApi.endpoints.unlockReferralContact.initiate('job-123'),
    );
    const result = await subscription.unwrap();
    expect(result.status).toBe(expected);
    expect(result.contact).toEqual(status === 1 ? { email: 'referrer@example.test' } : null);
    expect(JSON.stringify(localStorage)).not.toContain('referrer@example.test');
    expect(JSON.stringify(sessionStorage)).not.toContain('referrer@example.test');
    subscription.unsubscribe();
    store.dispatch(referralsApi.util.resetApiState());
  });
  it('rechecks the backend when contact access is requested again after purchase', async () => {
    request
      .mockResolvedValueOnce({ data: { data: { status: 3, contact: null } } })
      .mockResolvedValueOnce({
        data: { data: { status: 1, contact: { email: 'referrer@example.test' } } },
      });
    const store = createAppStore();
    const first = store.dispatch(referralsApi.endpoints.unlockReferralContact.initiate('job-123'));
    expect((await first.unwrap()).status).toBe('MembershipRequired');
    const second = store.dispatch(
      referralsApi.endpoints.unlockReferralContact.initiate('job-123', { forceRefetch: true }),
    );
    expect((await second.unwrap()).status).toBe('Granted');
    expect(request).toHaveBeenCalledTimes(2);
    first.unsubscribe();
    second.unsubscribe();
    store.dispatch(referralsApi.util.resetApiState());
  });
});
