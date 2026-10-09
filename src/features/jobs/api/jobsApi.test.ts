import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createAppStore } from '@/store/store';
import {
  CompanyType,
  EmploymentType,
  PostedByType,
  PublicJobSort,
  WorkplaceType,
} from '../types/jobModels';
import { jobsApi } from './jobsApi';

const { mockRequest } = vi.hoisted(() => ({ mockRequest: vi.fn() }));

vi.mock('@/api/apiClient', () => ({
  apiClient: { request: mockRequest },
}));

interface CapturedRequest {
  params?: URLSearchParams;
  url?: string;
}

describe('public jobs advanced search API', () => {
  beforeEach(() => mockRequest.mockReset());

  it('keeps a 10,000-job catalogue server-paged and passes logos without company lookups', async () => {
    const store = createAppStore();
    const items = [
      { id: 'deloitte', companyName: 'Deloitte', companyLogoUrl: '/deloitte.svg' },
      { id: 'future', companyName: 'Future Provider' },
    ];
    mockRequest.mockResolvedValue({
      data: { data: { items, pageNumber: 2, pageSize: 20, totalCount: 10000, totalPages: 500 } },
    });
    const subscription = store.dispatch(jobsApi.endpoints.searchJobs.initiate({
      pageNumber: 2, pageSize: 20, sortBy: PublicJobSort.LatestPublished, sortDirection: 'desc',
    }));
    const response = await subscription.unwrap();
    expect(response.items).toEqual(items);
    expect(response.totalCount).toBe(10000);
    expect(response.totalPages).toBe(500);
    expect(mockRequest).toHaveBeenCalledTimes(1);
    const request = mockRequest.mock.calls[0]?.[0] as CapturedRequest;
    expect(request.url).toBe('/jobs');
    expect(request.params?.get('pageNumber')).toBe('2');
    expect(request.params?.get('pageSize')).toBe('20');
    subscription.unsubscribe();
    store.dispatch(jobsApi.util.resetApiState());
  });

  it('sends supported multi-select filters as repeated backend query parameters', async () => {
    const store = createAppStore();
    mockRequest.mockResolvedValue({
      data: {
        data: { items: [], pageNumber: 2, pageSize: 10, totalCount: 0, totalPages: 0 },
      },
    });

    await store
      .dispatch(
        jobsApi.endpoints.searchJobs.initiate({
          companyName: 'HARMAN',
          categoryName: 'Artificial Intelligence',
          companyTypes: [CompanyType.Startup, CompanyType.Corporate],
          departments: ['Engineering', 'Design'],
          educationRequirements: ['B.Tech'],
          employmentTypes: [EmploymentType.FullTime, EmploymentType.Internship],
          featuredOnly: true,
          flexibleDuration: true,
          freshnessDays: 7,
          industries: ['Technology'],
          internshipDurationMonths: [3, 6],
          keyword: 'react',
          locations: ['Pune', 'Bengaluru'],
          maxAmount: 2_500_000,
          maxExperienceYears: 5,
          minAmount: 500_000,
          minExperienceYears: 1,
          pageNumber: 2,
          pageSize: 10,
          postedByTypes: [PostedByType.Company],
          roleCategories: ['Software Development'],
          sortBy: PublicJobSort.Recommended,
          sortDirection: 'desc',
          workModes: [WorkplaceType.Remote, WorkplaceType.Hybrid],
        }),
      )
      .unwrap();

    const request = mockRequest.mock.calls[0]?.[0] as CapturedRequest | undefined;
    expect(request?.url).toBe('/jobs');
    expect(request?.params).toBeInstanceOf(URLSearchParams);
    expect(request?.params?.getAll('workModes')).toEqual(['2', '3']);
    expect(request?.params?.getAll('departments')).toEqual(['Engineering', 'Design']);
    expect(request?.params?.getAll('locations')).toEqual(['Pune', 'Bengaluru']);
    expect(request?.params?.get('keyword')).toBe('react');
    expect(request?.params?.get('companyName')).toBe('HARMAN');
    expect(request?.params?.get('categoryName')).toBe('Artificial Intelligence');
    expect(request?.params?.has('companyId')).toBe(false);
    expect(request?.params?.has('companyIds')).toBe(false);
    expect(request?.params?.has('categoryId')).toBe(false);
    expect(request?.params?.get('freshnessDays')).toBe('7');
    expect(request?.params?.get('featuredOnly')).toBe('true');
    expect(request?.params?.get('pageNumber')).toBe('2');
  });

  it('uses the canonical facets endpoint with all contextual repeated filters', async () => {
    const store = createAppStore();
    mockRequest.mockResolvedValue({
      data: {
        data: {
          companies: [],
          companyTypes: [],
          departments: [],
          educationRequirements: [],
          employmentTypes: [],
          experienceRange: { count: 0, maximum: null, minimum: null },
          industries: [],
          internshipDurations: [],
          locations: [],
          postedByTypes: [],
          roleCategories: [],
          salaryRange: { count: 0, maximum: null, minimum: null },
          workModes: [],
        },
      },
    });

    await store
      .dispatch(
        jobsApi.endpoints.getJobFilterOptions.initiate({
          keyword: 'design',
          roleCategories: ['Software Development', 'Product Management - Technology'],
          locations: ['Pune', 'Mumbai'],
          departments: ['Engineering - Software & QA'],
          educationRequirements: ['B.Tech / B.E.', 'Any Graduate'],
          pageNumber: 1,
          pageSize: 1,
          sortBy: PublicJobSort.Recommended,
          sortDirection: 'desc',
          workModes: [WorkplaceType.Remote],
        }),
      )
      .unwrap();

    const request = mockRequest.mock.calls[0]?.[0] as CapturedRequest | undefined;
    expect(request?.url).toBe('/jobs/facets');
    expect(request?.params?.getAll('roleCategories')).toEqual(['Software Development', 'Product Management - Technology']);
    expect(request?.params?.getAll('locations')).toEqual(['Pune', 'Mumbai']);
    expect(request?.params?.getAll('departments')).toEqual(['Engineering - Software & QA']);
    expect(request?.params?.getAll('educationRequirements')).toEqual(['B.Tech / B.E.', 'Any Graduate']);
    expect(request?.params?.getAll('workModes')).toEqual(['2']);
    expect(request?.params?.get('keyword')).toBe('design');
  });

  it('derives exact freshness and featured counts through paginated search totals', async () => {
    const store = createAppStore();
    [1, 3, 7, 15, 30, 6].forEach((totalCount) => {
      mockRequest.mockResolvedValueOnce({
        data: {
          data: { items: [], pageNumber: 1, pageSize: 1, totalCount, totalPages: totalCount },
        },
      });
    });

    const counts = await store
      .dispatch(
        jobsApi.endpoints.getSupplementalJobFilterCounts.initiate({
          departments: ['Engineering'],
          pageNumber: 4,
          pageSize: 10,
          sortBy: PublicJobSort.Recommended,
          sortDirection: 'desc',
        }),
      )
      .unwrap();

    expect(counts).toEqual({
      featured: 6,
      freshness: { 1: 1, 3: 3, 7: 7, 15: 15, 30: 30 },
    });
    expect(mockRequest).toHaveBeenCalledTimes(6);
    const requests = mockRequest.mock.calls.map(([request]) => request as CapturedRequest);
    expect(requests.every((request) => request.params?.get('pageSize') === '1')).toBe(true);
    expect(requests.slice(0, 5).map((request) => request.params?.get('freshnessDays'))).toEqual([
      '1',
      '3',
      '7',
      '15',
      '30',
    ]);
    expect(requests.at(-1)?.params?.get('featuredOnly')).toBe('true');
  });
});
