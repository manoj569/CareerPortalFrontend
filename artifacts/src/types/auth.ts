export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAtUtc: string;
  refreshTokenExpiresAtUtc: string;
}

export enum UserRole {
  Candidate = 'Candidate',
  Administrator = 'Administrator',
  Employer = 'Employer',
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface AuthenticationResponse extends AuthTokens {
  user: AuthenticatedUser;
}

export interface AuthenticatedSession {
  accessTokenExpiresAtUtc: string;
  user: AuthenticatedUser;
}
