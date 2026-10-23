import { afterEach, describe, expect, it, vi } from 'vitest';

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('@/api', () => ({ apiClient: { post } }));

import { authService } from './authService';

describe('authService Google authentication', () => {
  afterEach(() => {
    post.mockReset();
    sessionStorage.clear();
  });

  it('does not persist credentials when a login response arrives after cancellation', async () => {
    let resolveResponse!: (response: unknown) => void;
    post.mockReturnValue(new Promise((resolve) => { resolveResponse = resolve; }));
    const controller = new AbortController();
    const pendingLogin = authService.login({ identifier: 'candidate@example.com', password: 'secret' }, controller.signal);
    controller.abort();
    resolveResponse({ data: {
      accessToken: 'late-access',
      accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
      refreshToken: 'late-refresh',
      refreshTokenExpiresAtUtc: '2099-02-01T00:00:00Z',
      user: { id: 'candidate', firstName: 'Avery', lastName: 'Patel', email: 'candidate@example.com', role: 'Candidate' },
    } });
    await expect(pendingLogin).rejects.toMatchObject({ name: 'AbortError' });
    expect(post).toHaveBeenCalledWith('/auth/login', { identifier: 'candidate@example.com', password: 'secret' }, { signal: controller.signal });
    expect(sessionStorage.getItem('careerPortal.refreshToken')).toBeNull();
  });
  it('posts the single-use code only to the relative code endpoint with the rollout header', async () => {
    post.mockResolvedValue({
      data: {
        data: {
          accessToken: 'career-harbor-access',
          accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
          refreshToken: 'career-harbor-refresh',
          refreshTokenExpiresAtUtc: '2099-02-01T00:00:00Z',
          user: {
            id: 'candidate',
            firstName: 'Avery',
            lastName: 'Patel',
            email: 'candidate@example.com',
            role: 'Candidate',
          },
        },
        message: null,
      },
    });
    const session = await authService.googleAuthenticateWithCode({
      code: 'single-use-code',
      intent: 'Login',
      acceptTerms: false,
    });
    expect(post).toHaveBeenCalledWith(
      '/auth/google/code',
      {
        code: 'single-use-code',
        intent: 'Login',
        acceptTerms: false,
      },
      { headers: { 'X-CareerHarbor-Google-Code-Flow': '1' }, signal: undefined },
    );
    expect(sessionStorage.getItem('careerPortal.refreshToken')).toBe('career-harbor-refresh');
    expect(sessionStorage.getItem('single-use-code')).toBeNull();
    expect(session.user.id).toBe('candidate');
  });

  it('rejects a malformed Google envelope without persisting a session', async () => {
    post.mockResolvedValue({ data: { data: { accessToken: 'missing-user' }, message: null } });
    await expect(
      authService.googleAuthenticateWithCode({
        code: 'single-use-code',
        intent: 'Register',
        acceptTerms: true,
      }),
    ).rejects.toThrow(/invalid session/i);
    expect(sessionStorage.getItem('careerPortal.refreshToken')).toBeNull();
  });

  it('posts an email-verification token only to the deployed relative endpoint', async () => {
    post.mockResolvedValue({ data: { message: 'Email verified.' } });

    await expect(
      authService.verifyEmail({ token: 'single-use-verification-token' }),
    ).resolves.toEqual({ message: 'Email verified.' });

    expect(post).toHaveBeenCalledWith(
      '/auth/verify-email',
      { token: 'single-use-verification-token' },
      { signal: undefined },
    );
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });
});
