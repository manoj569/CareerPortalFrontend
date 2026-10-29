import type { AuthTokens } from '@/types';

const REFRESH_TOKEN_KEY = 'careerPortal.refreshToken';
const REFRESH_EXPIRY_KEY = 'careerPortal.refreshTokenExpiresAtUtc';

let accessToken: string | null = null;
let accessTokenExpiresAtUtc: string | null = null;
let sessionVersion = 0;

const clearTokens = (): void => {
  sessionVersion++;
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

const persistTokens = (tokens: AuthTokens): void => {
  accessToken = tokens.accessToken;
  accessTokenExpiresAtUtc = tokens.accessTokenExpiresAtUtc;
  sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  sessionStorage.setItem(REFRESH_EXPIRY_KEY, tokens.refreshTokenExpiresAtUtc);
};

export const authTokenStore = {
  getSessionVersion(): number {
    return sessionVersion;
  },
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
      return null;
    }

    return refreshToken;
  },
  set(tokens: AuthTokens): void {
    // Installing a login/account is a new session, even if token text is reused.
    sessionVersion++;
    persistTokens(tokens);
  },
  rotate(tokens: AuthTokens, expectedVersion: number): boolean {
    // Rotation belongs to the existing session; a late refresh cannot create one.
    if (expectedVersion !== sessionVersion) return false;
    persistTokens(tokens);
    return true;
  },
  clear(): void {
    clearTokens();
  },
};
