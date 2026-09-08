import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAppStore } from '@/store/store';
import { AdminAIApplyRunStatus, AdminAIApplySite } from '../types/adminAIApplyModels';
import { adminAIApplyApi } from './adminAIApplyApi';

const { mockRequest } = vi.hoisted(() => ({ mockRequest: vi.fn() }));
vi.mock('@/api/apiClient', () => ({ apiClient: { request: mockRequest } }));

describe('admin AI Apply API', () => {
  beforeEach(() => mockRequest.mockReset());

  it('uses exact overview and applications query contracts', async () => {
    mockRequest.mockResolvedValue({ data: { data: {} } });
    const store = createAppStore();
    const period = { from: '2026-09-01', to: '2026-09-04' };
    await store
      .dispatch(adminAIApplyApi.endpoints.getAdminAIApplyOverview.initiate(period))
      .unwrap();
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({ method: 'GET', params: period, url: '/admin/ai-apply/overview' }),
    );
    const query = {
      ...period,
      failureCode: 'site_timeout',
      page: 2,
      pageSize: 25,
      status: AdminAIApplyRunStatus.DeadLettered,
    };
    await store
      .dispatch(adminAIApplyApi.endpoints.getAdminAIApplyApplications.initiate(query))
      .unwrap();
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: 'GET',
        params: query,
        url: '/admin/ai-apply/applications',
      }),
    );
  });

  it('requeues without a frontend-authored request body', async () => {
    mockRequest.mockResolvedValue({ data: { data: { id: 'application-id', status: 1 } } });
    const store = createAppStore();
    await store
      .dispatch(adminAIApplyApi.endpoints.requeueAdminAIApplyApplication.initiate('application/id'))
      .unwrap();
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: '/admin/ai-apply/applications/application%2Fid/requeue',
      }),
    );
    expect(mockRequest.mock.calls.at(-1)?.[0]).toHaveProperty('data', undefined);
  });

  it('uses exact numeric site route values for circuit operations', async () => {
    mockRequest.mockResolvedValue({ data: { data: { site: 1, circuitState: 'Open' } } });
    const store = createAppStore();
    await store
      .dispatch(
        adminAIApplyApi.endpoints.openAdminAIApplySite.initiate(AdminAIApplySite.Greenhouse),
      )
      .unwrap();
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({ method: 'POST', url: '/admin/ai-apply/sites/1/open' }),
    );
    await store
      .dispatch(
        adminAIApplyApi.endpoints.closeAdminAIApplySite.initiate(AdminAIApplySite.Greenhouse),
      )
      .unwrap();
    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({ method: 'POST', url: '/admin/ai-apply/sites/1/close' }),
    );
  });

  it('loads failures, sites, workers, and costs without invented parameters', async () => {
    mockRequest.mockResolvedValue({ data: { data: [] } });
    const store = createAppStore();
    await store.dispatch(adminAIApplyApi.endpoints.getAdminAIApplyFailures.initiate({})).unwrap();
    await store.dispatch(adminAIApplyApi.endpoints.getAdminAIApplySites.initiate()).unwrap();
    await store.dispatch(adminAIApplyApi.endpoints.getAdminAIApplyWorkers.initiate()).unwrap();
    await store.dispatch(adminAIApplyApi.endpoints.getAdminAIApplyCosts.initiate({})).unwrap();
    const urls = mockRequest.mock.calls.map(([request]) => (request as { url: string }).url);
    expect(urls).toEqual([
      '/admin/ai-apply/failures',
      '/admin/ai-apply/sites',
      '/admin/ai-apply/workers',
      '/admin/ai-apply/costs',
    ]);
  });
});
