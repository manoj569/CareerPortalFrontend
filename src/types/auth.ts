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
  /** The server supplies this flag; absent legacy session data never requires setup. */
  careerSnapshotRequired?: boolean;
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
