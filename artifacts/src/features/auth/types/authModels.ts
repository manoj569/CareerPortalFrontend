export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  // lastName: string;
  phoneNumber: string;
  hasAcceptedTermsAndPrivacy: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface LogoutRequest {
  refreshToken: string;
}
