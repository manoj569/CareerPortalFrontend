import { afterEach, describe, expect, it, vi } from 'vitest';

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('@/api', () => ({ apiClient: { post } }));

import { authService } from './authService';

describe('authService Google authentication', () => {
  afterEach(() => { post.mockReset(); sessionStorage.clear(); });
  it('posts the opaque credential only to the relative Google endpoint', async () => {
    post.mockResolvedValue({ data: {
      accessToken: 'career-harbor-access', accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
      refreshToken: 'career-harbor-refresh', refreshTokenExpiresAtUtc: '2099-02-01T00:00:00Z',
      user: { id: 'candidate', firstName: 'Avery', lastName: 'Patel', email: 'candidate@example.com', role: 'Candidate' },
    } });
    await authService.googleAuthenticate({ credential: 'opaque-google-id-token', intent: 'Login', acceptTerms: false });
    expect(post).toHaveBeenCalledWith('/auth/google', {
      credential: 'opaque-google-id-token', intent: 'Login', acceptTerms: false,
    }, { signal: undefined });
    expect(sessionStorage.getItem('careerPortal.refreshToken')).toBe('career-harbor-refresh');
    expect(sessionStorage.getItem('opaque-google-id-token')).toBeNull();
  });
});
