import type { AuthTokens } from '@/types';

const REFRESH_TOKEN_KEY = 'careerPortal.refreshToken';
const REFRESH_EXPIRY_KEY = 'careerPortal.refreshTokenExpiresAtUtc';

let accessToken: string | null = null;
let accessTokenExpiresAtUtc: string | null = null;

const clearTokens = (): void => {
  accessToken = null;
  accessTokenExpiresAtUtc = null;
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_EXPIRY_KEY);
};

const hasRefreshTokenExpired = (expiresAtUtc: string | null): boolean => {
  if (!expiresAtUtc) return true;
  const expiryTime = Date.parse(expiresAtUtc);
  return !Number.isFinite(expiryTime) || expiryTime <= Date.now();
};

export const authTokenStore = {
  getAccessToken(): string | null {
    return accessToken;
  },
  getAccessTokenExpiresAtUtc(): string | null {
    return accessTokenExpiresAtUtc;
  },
  hasUsableAccessToken(): boolean {
    if (!accessToken || !accessTokenExpiresAtUtc) return false;
    const expiryTime = Date.parse(accessTokenExpiresAtUtc);
    return Number.isFinite(expiryTime) && expiryTime > Date.now() + 5_000;
  },
  getRefreshToken(): string | null {
    const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    const expiresAtUtc = sessionStorage.getItem(REFRESH_EXPIRY_KEY);

    if (!refreshToken || hasRefreshTokenExpired(expiresAtUtc)) {
      clearTokens();
      return null;
    }

    return refreshToken;
  },
  set(tokens: AuthTokens): void {
    accessToken = tokens.accessToken;
    accessTokenExpiresAtUtc = tokens.accessTokenExpiresAtUtc;
    sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    sessionStorage.setItem(REFRESH_EXPIRY_KEY, tokens.refreshTokenExpiresAtUtc);
  },
  clear(): void {
    clearTokens();
  },
};
