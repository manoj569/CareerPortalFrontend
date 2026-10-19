import { EmploymentType, WorkplaceType, ExperienceLevel } from '@/features/jobs/types/jobModels';
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
  it.each(['/company.svg', null, undefined])(
    'passes referral logo %s without a company lookup',
    async (companyLogoUrl) => {
      request.mockResolvedValue({
        data: {
          data: {
            items: [
              { jobId: 'job-1', jobTitle: 'Engineer', companyName: 'Deloitte', companyLogoUrl },
            ],
            pageNumber: 3,
            pageSize: 5,
            totalCount: 10000,
            totalPages: 2000,
          },
        },
      });
      const store = createAppStore();
      const subscription = store.dispatch(
        referralsApi.endpoints.getPublicReferralJobs.initiate({
          pageNumber: 3,
          pageSize: 5,
        }),
      );
      const result = await subscription.unwrap();
      expect(result.items[0]?.companyLogoUrl).toBe(companyLogoUrl);
      expect(result.items[0]?.companyName).toBe('Deloitte');
      expect(result.totalCount).toBe(10000);
      expect(request).toHaveBeenCalledTimes(1);
      expect(request.mock.calls[0]?.[0]).toMatchObject({
        url: '/referrals/public',
        params: { pageNumber: 3, pageSize: 5 },
      });
      subscription.unsubscribe();
      store.dispatch(referralsApi.util.resetApiState());
    },
  );
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

describe('referral submission JSON contract', () => {
  it.each([
    [EmploymentType.FullTime, 1],
    [EmploymentType.PartTime, 2],
    [EmploymentType.Contract, 3],
    [EmploymentType.Internship, 4],
    [EmploymentType.Freelance, 5],
    [EmploymentType.Temporary, 6],
  ])('posts enum %s as backend JSON number %s', async (employmentType, expected) => {
    request.mockReset();
    request.mockResolvedValue({ data: { data: { id: 'submitted-referral' } } });
    const store = createAppStore();
    const body = {
      jobDetails: {
        job: {
          title: 'Engineer',
          employmentType,
          workplaceType: WorkplaceType.Hybrid,
          experienceLevel: ExperienceLevel.Entry,
          minimumExperienceYears: 0,
          maximumExperienceYears: 3,
          skills: ['.NET', 'SQL Server'],
          location: 'Pune',
        },
        company: { new: { name: 'Example' } },
        category: { existingId: '12345678-1234-1234-1234-123456789abc' },
      },
      sourceUrl: null,
      showLinkedIn: true,
      showEmail: false,
      showPhone: false,
      referralSlots: 5,
      linkedInUrl: 'https://www.linkedin.com/in/owner',
      contactEmail: null,
      contactPhone: null,
    };
    await store.dispatch(referralsApi.endpoints.submitJobReferral.initiate(body)).unwrap();
    const config = request.mock.calls[0]?.[0] as { data: unknown };
    expect(config).toMatchObject({ method: 'post', url: '/referrals' });
    expect(JSON.parse(JSON.stringify(config.data))).toEqual({
      ...body,
      jobDetails: {
        ...body.jobDetails,
        job: {
          ...body.jobDetails.job,
          employmentType: expected,
          workplaceType: 3,
          experienceLevel: 1,
        },
      },
    });
    store.dispatch(referralsApi.util.resetApiState());
  });
});

describe('owner contact preferences JSON contract', () => {
  it('updates an existing referral using PUT and restores the owner response', async () => {
    request.mockReset();
    const body = {
      showLinkedIn: true,
      showEmail: true,
      showPhone: true,
      linkedInUrl: 'https://www.linkedin.com/in/owner',
      contactEmail: 'owner@example.com',
      contactPhone: '+91 9876543210',
    };
    request.mockResolvedValue({ data: { data: { id: 'existing-id', ...body } } });
    const store = createAppStore();
    const result = await store
      .dispatch(referralsApi.endpoints.updateReferralContact.initiate({ id: 'existing-id', body }))
      .unwrap();
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0]?.[0]).toMatchObject({
      method: 'put',
      url: '/referrals/existing-id/contact-preferences',
      data: body,
    });
    expect(result).toEqual({ id: 'existing-id', ...body });
    store.dispatch(referralsApi.util.resetApiState());
  });

  it('drops contact values from the public response mapping', async () => {
    request.mockReset();
    request.mockResolvedValue({
      data: {
        data: {
          items: [
            {
              jobId: 'job',
              jobTitle: 'Engineer',
              linkedInUrl: 'private-link',
              contactEmail: 'private-email',
              contactPhone: 'private-phone',
            },
          ],
          totalCount: 1,
        },
      },
    });
    const store = createAppStore();
    const subscription = store.dispatch(
      referralsApi.endpoints.getPublicReferralJobs.initiate({ pageNumber: 1, pageSize: 10 }),
    );
    const result = await subscription.unwrap();
    expect(JSON.stringify(result)).not.toContain('private-');
    subscription.unsubscribe();
    store.dispatch(referralsApi.util.resetApiState());
  });
});
