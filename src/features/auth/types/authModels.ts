export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  hasAcceptedTermsAndPrivacy: boolean;
}

export interface RegistrationChallengeResponse {
  challengeId: string;
  message: string;
  expiresAtUtc: string;
}

export interface VerifyRegistrationOtpRequest {
  challengeId: string;
  otp: string;
}

export interface ResendRegistrationOtpRequest {
  challengeId: string;
}

export interface MessageResponse {
  message: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RequestLoginOtpRequest {
  phoneNumber: string;
}

export interface LoginWithOtpRequest {
  phoneNumber: string;
  otp: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface CompletePasswordResetRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}
