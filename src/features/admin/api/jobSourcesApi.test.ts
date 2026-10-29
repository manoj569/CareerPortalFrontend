import { describe, expect, it, vi } from 'vitest';
import { createAppStore } from '@/store/store';
import { jobSourcesApi } from './jobSourcesApi';
import { AtsType } from '../types/jobSourceModels';
const { request } = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@/api/apiClient', () => ({ apiClient: { request } }));

describe('source collection pagination', () => {
  it.each([
    AtsType.Greenhouse,
    AtsType.Lever,
    AtsType.Ashby,
    AtsType.Workday,
    AtsType.SuccessFactors,
    AtsType.SmartRecruiters,
    AtsType.RippleHire,
  ])('sends the exact create/update DTO for provider %s', async (atsType) => {
    request.mockReset();
    const dto = {
      companyId: 'company',
      careerPageUrl: 'https://example.test/careers',
      atsType,
      atsIdentifier: null,
      isActive: false,
      autoPublishEnabled: false,
      scanIntervalMinutes: 31,
    };
    request.mockResolvedValue({ data: { data: { ...dto, id: 'source' } } });
    const store = createAppStore();
    await store.dispatch(jobSourcesApi.endpoints.createJobSource.initiate(dto)).unwrap();
    await store
      .dispatch(jobSourcesApi.endpoints.updateJobSource.initiate({ id: 'source', request: dto }))
      .unwrap();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/admin/job-sources', method: 'POST', data: dto }),
    );
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/admin/job-sources/source', method: 'PUT', data: dto }),
    );
    store.dispatch(jobSourcesApi.util.resetApiState());
  });
  it('loads all pages before exposing collection metrics', async () => {
    request.mockImplementation(({ params }: { params: { pageNumber: number } }) =>
      Promise.resolve({
        data: {
          data: {
            items: [{ id: `source-${params.pageNumber}` }],
            totalPages: 2,
            totalCount: 2,
            pageSize: 100,
            pageNumber: params.pageNumber,
          },
        },
      }),
    );
    const store = createAppStore();
    const subscription = store.dispatch(jobSourcesApi.endpoints.getJobSources.initiate());
    expect(await subscription.unwrap()).toHaveLength(2);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ params: { pageNumber: 2, pageSize: 100 } }),
    );
    subscription.unsubscribe();
    store.dispatch(jobSourcesApi.util.resetApiState());
  });
  it('does not return misleading partial totals if a later page fails', async () => {
    request
      .mockResolvedValueOnce({ data: { data: { items: [{ id: 'one' }], totalPages: 2 } } })
      .mockRejectedValueOnce(new Error('Page unavailable'));
    const store = createAppStore();
    const subscription = store.dispatch(jobSourcesApi.endpoints.getJobSources.initiate());
    await expect(subscription.unwrap()).rejects.toMatchObject({ message: 'Page unavailable' });
    subscription.unsubscribe();
    store.dispatch(jobSourcesApi.util.resetApiState());
  });
});
