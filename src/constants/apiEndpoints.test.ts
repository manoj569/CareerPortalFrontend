import axios from 'axios';
import { describe, expect, it } from 'vitest';

import { API_ENDPOINTS } from './apiEndpoints';

describe('API endpoint paths', () => {
  it('keeps the API version segment exclusively in Axios baseURL', () => {
    expect(API_ENDPOINTS.AUTH.LOGIN).toBe('/auth/login');
    expect(API_ENDPOINTS.AUTH.GOOGLE).toBe('/auth/google');
    expect(API_ENDPOINTS.ADMIN.JOBS_COMPOSE).toBe('/admin/jobs/compose');
    expect(API_ENDPOINTS.CANDIDATE.APPLY('job-id')).toBe('/candidate/jobs/job-id/apply');

    expect(
      axios.getUri({
        baseURL: 'http://localhost:5259/api',
        url: API_ENDPOINTS.AUTH.LOGIN,
      }),
    ).toBe('http://localhost:5259/api/auth/login');
    expect(
      axios.getUri({
        baseURL: 'http://localhost:5259/api',
        url: API_ENDPOINTS.ADMIN.JOBS_COMPOSE,
      }),
    ).toBe('http://localhost:5259/api/admin/jobs/compose');
  });

  it('does not expose a duplicated API segment in endpoint constants', () => {
    const representativePaths = [
      API_ENDPOINTS.AUTH.REGISTER,
      API_ENDPOINTS.JOBS.SEARCH,
      API_ENDPOINTS.ADMIN.JOBS,
      API_ENDPOINTS.ADMIN.COMPANIES,
      API_ENDPOINTS.CANDIDATE.PROFILE,
      API_ENDPOINTS.CANDIDATE.PROFILE_ABOUT,
      API_ENDPOINTS.CANDIDATE.PROFILE_SKILLS,
      API_ENDPOINTS.CANDIDATE.PROFILE_SKILL('skill-id'),
      API_ENDPOINTS.CANDIDATE.PROFILE_COMPLETION,
      API_ENDPOINTS.PAYMENTS.STATUS,
      API_ENDPOINTS.ADMIN.JOB('job-id'),
      API_ENDPOINTS.CANDIDATE.APPLICATION('application-id'),
    ];

    for (const path of representativePaths) {
      expect(path).not.toMatch(/^\/api(?:\/|$)/);
      expect(path).not.toContain('/api/api/');
    }
  });
});
