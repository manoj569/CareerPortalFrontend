import { ApiRequestError } from '@/api/apiError';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAppStore } from '@/store/store';
import { marketplaceApi } from './marketplaceApi';
import { referralsApi } from './referralsApi';
import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import { requestRecord, opportunity } from './marketplaceFixtures';
const { request } = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@/api/apiClient', () => ({ apiClient: { request } }));
const wrap = (data: unknown) => ({ data: { data } });
const page = (items: unknown[], totalCount = items.length) => ({
  items,
  totalCount,
  pageNumber: 1,
  pageSize: 100,
  totalPages: Math.ceil(totalCount / 100),
});
beforeEach(() => {
  request.mockReset();
});
describe('Phase-1 contract integration', () => {
  it('refreshes subscribed notifications and request status after a successful receipt acknowledgement', async () => {
    let acknowledged = false;
    request.mockImplementation(({ url }: { url: string }) => {
      if (url.endsWith('/confirm')) acknowledged = true;
      return Promise.resolve(
        wrap(
          url.includes('notifications')
            ? { page: page([]), unreadCount: 0 }
            : { ...requestRecord.request, status: acknowledged ? 6 : 5 },
        ),
      );
    });
    const store = createAppStore();
    const notifications = store.dispatch(
      dashboardApi.endpoints.getNotifications.initiate({ pageNumber: 1, pageSize: 1 }),
    );
    const detail = store.dispatch(marketplaceApi.endpoints.getCandidateRequest.initiate('req-1'));
    await Promise.all([notifications.unwrap(), detail.unwrap()]);
    await store
      .dispatch(marketplaceApi.endpoints.confirmReferralReceipt.initiate('req-1'))
      .unwrap();
    await vi.waitFor(() => {
      expect(
        request.mock.calls.filter(([arg]) =>
          (arg as { url: string }).url.includes('notifications'),
        ),
      ).toHaveLength(2);
      expect(
        marketplaceApi.endpoints.getCandidateRequest.select('req-1')(store.getState()).data?.status,
      ).toBe(6);
    });
    expect(
      request.mock.calls.filter(
        ([arg]) => (arg as { url: string }).url === '/referral-requests/req-1',
      ),
    ).toHaveLength(2);
    notifications.unsubscribe();
    detail.unsubscribe();
    store.dispatch(referralsApi.util.resetApiState());
    store.dispatch(dashboardApi.util.resetApiState());
  });
  it.each([100, 500, 1000])(
    'loads all %i jobs without truncation and reuses category reads on refresh',
    async (count) => {
      request.mockImplementation(
        ({ url, params }: { url: string; params?: { pageNumber: number } }) => {
          if (url === '/referrals/public') {
            const start = ((params?.pageNumber ?? 1) - 1) * 100;
            return Promise.resolve(
              wrap(
                page(
                  Array.from({ length: Math.min(100, count - start) }, (_, i) => ({
                    referralId: `op-${start + i}`,
                    jobId: `job-${start + i}`,
                    jobSlug: `job-${start + i}`,
                  })),
                  count,
                ),
              ),
            );
          }
          return Promise.resolve(
            wrap({ id: url.slice('/jobs/'.length), categoryName: 'Software' }),
          );
        },
      );
      const store = createAppStore();
      const sub = store.dispatch(marketplaceApi.endpoints.getReferralCatalogue.initiate());
      const data = await sub.unwrap();
      expect(data).toHaveLength(count);
      expect(data.every((job) => job.categoryName === 'Software')).toBe(true);
      expect(request).toHaveBeenCalledTimes(count + count / 100);
      await sub.refetch().unwrap();
      expect(request).toHaveBeenCalledTimes(count + (2 * count) / 100);
      sub.unsubscribe();
      store.dispatch(referralsApi.util.resetApiState());
    },
  );
  it('deduplicates repeated slugs and never assigns metadata to a mismatched job ID', async () => {
    request.mockImplementation(({ url }: { url: string }) =>
      Promise.resolve(
        wrap(
          url === '/referrals/public'
            ? page([
                { referralId: 'a', jobId: 'job-1', jobSlug: 'engineer' },
                { referralId: 'b', jobId: 'job-1', jobSlug: 'engineer' },
                { referralId: 'c', jobId: 'other', jobSlug: 'engineer' },
              ])
            : { id: 'job-1', categoryName: 'Software' },
        ),
      ),
    );
    const store = createAppStore();
    const sub = store.dispatch(marketplaceApi.endpoints.getReferralCatalogue.initiate());
    const data = await sub.unwrap();
    expect(data.map((job) => job.categoryName)).toEqual(['Software', 'Software', undefined]);
    expect(request).toHaveBeenCalledTimes(2);
    sub.unsubscribe();
    store.dispatch(referralsApi.util.resetApiState());
  });
  it('loads all candidate activity pages with the authoritative quota', async () => {
    const quota = {
      limit: 10,
      remainingConnections: 8,
      acceptedConnections: 2,
      hasActiveAccess: true,
    };
    request
      .mockResolvedValueOnce(wrap({ requests: page([requestRecord.request], 2), quota }))
      .mockResolvedValueOnce(
        wrap({ requests: page([{ ...requestRecord.request, id: 'req-2' }], 2), quota }),
      );
    const store = createAppStore();
    const query = store.dispatch(marketplaceApi.endpoints.getCandidateActivity.initiate());
    const data = await query.unwrap();
    expect(data.items).toHaveLength(2);
    expect(data.quota).toEqual(quota);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/referral-requests/mine',
        params: { pageNumber: 2, pageSize: 100 },
      }),
    );
    query.unsubscribe();
    store.dispatch(referralsApi.util.resetApiState());
  });
  it('does not expose partial activity after a pagination failure', async () => {
    request
      .mockResolvedValueOnce(wrap({ requests: page([requestRecord.request], 2), quota: {} }))
      .mockRejectedValueOnce(new ApiRequestError({ status: 500, message: 'Unavailable' }));
    const store = createAppStore();
    const query = store.dispatch(marketplaceApi.endpoints.getCandidateActivity.initiate());
    await expect(query.unwrap()).rejects.toBeDefined();
    expect(
      marketplaceApi.endpoints.getCandidateActivity.select()(store.getState()).data,
    ).toBeUndefined();
    query.unsubscribe();
    store.dispatch(referralsApi.util.resetApiState());
  });
  it('preserves backend newest order and uses existing details for categories', async () => {
    request
      .mockResolvedValueOnce(
        wrap(page([{ jobId: 'job-1', jobSlug: 'engineer', referralId: 'op-1' }], 2)),
      )
      .mockResolvedValueOnce(wrap(page([{ jobId: 'job-2', referralId: 'op-2' }], 2)))
      .mockResolvedValueOnce(wrap({ id: 'job-1', categoryName: 'Software' }));
    const store = createAppStore();
    const query = store.dispatch(marketplaceApi.endpoints.getReferralCatalogue.initiate());
    expect(await query.unwrap()).toEqual([
      { jobId: 'job-1', jobSlug: 'engineer', referralId: 'op-1', categoryName: 'Software' },
      { jobId: 'job-2', referralId: 'op-2' },
    ]);
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ url: '/jobs/engineer' }));
    query.unsubscribe();
    store.dispatch(referralsApi.util.resetApiState());
  });
  it('loads saved jobs from every page rather than assuming first-page absence', async () => {
    request
      .mockResolvedValueOnce(wrap(page([{ jobId: 'job-1' }], 2)))
      .mockResolvedValueOnce(wrap(page([{ jobId: 'job-2' }], 2)));
    const store = createAppStore();
    const query = store.dispatch(marketplaceApi.endpoints.getReferralSavedJobs.initiate());
    expect(await query.unwrap()).toHaveLength(2);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/candidate/saved-jobs',
        params: { pageNumber: 2, pageSize: 100 },
      }),
    );
    query.unsubscribe();
    store.dispatch(referralsApi.util.resetApiState());
  });
  it.each([
    ['acceptReferralRequest', 'accept'],
    ['rejectReferralRequest', 'reject'],
    ['markReferralSubmitted', 'mark-referred'],
  ] as const)('%s uses the real backend endpoint', async (endpoint, action) => {
    request.mockResolvedValue(wrap(requestRecord));
    const store = createAppStore();
    const result = store.dispatch(marketplaceApi.endpoints[endpoint].initiate('req-1'));
    await result.unwrap();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `/referrer/referral-requests/req-1/${action}`,
        method: 'post',
      }),
    );
    store.dispatch(referralsApi.util.resetApiState());
  });
  it('loads all inbox pages before returning scoped data', async () => {
    request
      .mockResolvedValueOnce(wrap(page([requestRecord], 2)))
      .mockResolvedValueOnce(
        wrap(page([{ ...requestRecord, request: { ...requestRecord.request, id: 'req-2' } }], 2)),
      );
    const store = createAppStore();
    const result = store.dispatch(marketplaceApi.endpoints.getReferrerInbox.initiate());
    expect(await result.unwrap()).toHaveLength(2);
    expect(
      (request.mock.calls[1]?.[0] as { params: { pageNumber: number } }).params.pageNumber,
    ).toBe(2);
    result.unsubscribe();
    store.dispatch(referralsApi.util.resetApiState());
  });
  it('does not return incomplete counts after a page failure', async () => {
    request
      .mockResolvedValueOnce(wrap(page([requestRecord], 2)))
      .mockRejectedValueOnce({ status: 500, message: 'Inbox unavailable' });
    const store = createAppStore();
    const result = store.dispatch(marketplaceApi.endpoints.getReferrerInbox.initiate());
    await expect(result.unwrap()).rejects.toBeDefined();
    result.unsubscribe();
    store.dispatch(referralsApi.util.resetApiState());
  });
  it('refreshes requests, owner capacity, metrics and public cards after mutations', async () => {
    request.mockImplementation(({ url }: { url: string }) =>
      Promise.resolve(
        wrap(
          url === '/referrals/mine'
            ? page([opportunity])
            : url === '/referrals/public'
              ? page([])
              : url === '/referrer/metrics'
                ? { jobsPosted: 1 }
                : url === '/referrer/referral-requests'
                  ? page([requestRecord])
                  : requestRecord,
        ),
      ),
    );
    const store = createAppStore();
    const subs = [
      store.dispatch(marketplaceApi.endpoints.getReferrerInbox.initiate()),
      store.dispatch(marketplaceApi.endpoints.getOwnedOpportunities.initiate()),
      store.dispatch(marketplaceApi.endpoints.getReferralMetrics.initiate()),
      store.dispatch(
        referralsApi.endpoints.getPublicReferralJobs.initiate({ pageNumber: 1, pageSize: 12 }),
      ),
      store.dispatch(marketplaceApi.endpoints.getReferrerRequest.initiate('req-1')),
    ];
    await Promise.all(subs.map((s) => s.unwrap()));
    await store.dispatch(marketplaceApi.endpoints.acceptReferralRequest.initiate('req-1')).unwrap();
    await vi.waitFor(() =>
      expect(
        request.mock.calls.filter(([arg]) => (arg as { url: string }).url === '/referrer/metrics'),
      ).toHaveLength(2),
    );
    for (const url of [
      '/referrals/mine',
      '/referrals/public',
      '/referrer/referral-requests',
      '/referrer/referral-requests/req-1',
    ])
      expect(
        request.mock.calls.filter(([arg]) => (arg as { url: string }).url === url),
      ).toHaveLength(2);
    subs.forEach((s) => s.unsubscribe());
    store.dispatch(referralsApi.util.resetApiState());
  });
  it('preserves capacity conflict errors and invalidates stale state', async () => {
    request.mockRejectedValue(
      new ApiRequestError({
        status: 409,
        code: 'REFERRAL_SLOTS_FULL',
        message: 'No referral slots remain.',
      }),
    );
    const store = createAppStore();
    await expect(
      store.dispatch(marketplaceApi.endpoints.acceptReferralRequest.initiate('req-1')).unwrap(),
    ).rejects.toMatchObject({ status: 409, code: 'REFERRAL_SLOTS_FULL' });
    store.dispatch(referralsApi.util.resetApiState());
  });
  it('creates requests with candidateMessage only', async () => {
    request.mockResolvedValue(wrap(requestRecord.request));
    const store = createAppStore();
    await store
      .dispatch(
        marketplaceApi.endpoints.createReferralRequest.initiate({
          referralId: 'op-1',
          candidateMessage: ' Hello ',
        }),
      )
      .unwrap();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/referrals/op-1/requests',
        data: { candidateMessage: 'Hello' },
      }),
    );
    store.dispatch(referralsApi.util.resetApiState());
  });
  it('queries protected contact by request ownership, not job ID or payment', async () => {
    request.mockResolvedValue(
      wrap({ referrerLabel: 'Employee Referrer', email: 'private@example.test' }),
    );
    const store = createAppStore();
    const sub = store.dispatch(marketplaceApi.endpoints.getAcceptedContact.initiate('req-1'));
    await sub.unwrap();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/referral-requests/req-1/contact' }),
    );
    expect(localStorage.length).toBe(0);
    sub.unsubscribe();
    store.dispatch(referralsApi.util.resetApiState());
  });
  it.each([
    ['confirmReferralReceipt', 'confirm'],
    ['reportReferralNotReceived', 'not-received'],
  ] as const)('%s uses supported candidate action', async (endpoint, action) => {
    request.mockResolvedValue(wrap(requestRecord.request));
    const store = createAppStore();
    await store.dispatch(marketplaceApi.endpoints[endpoint].initiate('req-1')).unwrap();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ url: `/referral-requests/req-1/${action}`, method: 'post' }),
    );
    store.dispatch(referralsApi.util.resetApiState());
  });
});
