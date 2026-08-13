import { afterEach, describe, expect, it, vi } from 'vitest';

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('@/api', () => ({ apiClient: { post } }));

import { authService } from './authService';

describe('authService Google authentication', () => {
  afterEach(() => { post.mockReset(); sessionStorage.clear(); });
  it('posts the single-use code only to the relative code endpoint with the rollout header', async () => {
    post.mockResolvedValue({ data: {
      accessToken: 'career-harbor-access', accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
      refreshToken: 'career-harbor-refresh', refreshTokenExpiresAtUtc: '2099-02-01T00:00:00Z',
      user: { id: 'candidate', firstName: 'Avery', lastName: 'Patel', email: 'candidate@example.com', role: 'Candidate' },
    } });
    await authService.googleAuthenticateWithCode({ code: 'single-use-code', intent: 'Login', acceptTerms: false });
    expect(post).toHaveBeenCalledWith('/auth/google/code', {
      code: 'single-use-code', intent: 'Login', acceptTerms: false,
    }, { headers: { 'X-CareerHarbor-Google-Code-Flow': '1' }, signal: undefined });
    expect(sessionStorage.getItem('careerPortal.refreshToken')).toBe('career-harbor-refresh');
    expect(sessionStorage.getItem('single-use-code')).toBeNull();
  });
});
