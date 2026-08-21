import { apiClient } from '@/api';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { authTokenStore } from '@/services/authTokenStore';
import type { ApiResponse, AuthenticationResponse } from '@/types';
import type {
  CompletePasswordResetRequest,
  LoginRequest,
  GoogleAuthenticationRequest,
  GoogleAuthorizationCodeRequest,
  LoginWithOtpRequest,
  LogoutRequest,
  MessageResponse,
  RefreshTokenRequest,
  RegisterRequest,
  RegistrationResponse,
  RequestLoginOtpRequest,
  RequestPasswordResetRequest,
  ResendRegistrationOtpRequest,
  VerifyRegistrationOtpRequest,
  VerifyEmailRequest,
} from '../types/authModels';

const storeAuthentication = (response: AuthenticationResponse): AuthenticationResponse => {
  authTokenStore.set(response);
  return response;
};

const isAuthenticationResponse = (value: unknown): value is AuthenticationResponse => {
  if (!value || typeof value !== 'object') return false;
  const session = value as Partial<AuthenticationResponse>;
  const user = session.user;
  return (
    typeof session.accessToken === 'string' &&
    typeof session.accessTokenExpiresAtUtc === 'string' &&
    typeof session.refreshToken === 'string' &&
    typeof session.refreshTokenExpiresAtUtc === 'string' &&
    user !== undefined &&
    typeof user.id === 'string' &&
    typeof user.role === 'string'
  );
};

const unwrapGoogleAuthenticationResponse = (
  value: ApiResponse<AuthenticationResponse>,
): AuthenticationResponse => {
  if (!isAuthenticationResponse(value.data))
    throw new Error('Google sign-in returned an invalid session. Please try again.');
  return value.data;
};

const refreshSession = async (signal?: AbortSignal): Promise<AuthenticationResponse> => {
  const refreshToken = authTokenStore.getRefreshToken();
  if (!refreshToken) throw new Error('No restorable session is available.');

  const request: RefreshTokenRequest = { refreshToken };
  const response = await apiClient.post<AuthenticationResponse>(
    API_ENDPOINTS.AUTH.REFRESH_TOKEN,
    request,
    { signal },
  );
  return storeAuthentication(response.data);
};

export const authService = {
  async register(request: RegisterRequest, signal?: AbortSignal): Promise<RegistrationResponse> {
    const response = await apiClient.post<RegistrationResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      request,
      { signal },
    );
    return response.data;
  },

  async verifyEmail(request: VerifyEmailRequest, signal?: AbortSignal): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      API_ENDPOINTS.AUTH.VERIFY_EMAIL,
      { token: request.token },
      { signal },
    );
    return response.data;
  },

  async verifyRegistrationOtp(
    request: VerifyRegistrationOtpRequest,
    signal?: AbortSignal,
  ): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      API_ENDPOINTS.AUTH.VERIFY_REGISTRATION_OTP,
      request,
      { signal },
    );
    return response.data;
  },

  async resendRegistrationOtp(
    request: ResendRegistrationOtpRequest,
    signal?: AbortSignal,
  ): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      API_ENDPOINTS.AUTH.RESEND_REGISTRATION_OTP,
      request,
      { signal },
    );
    return response.data;
  },

  async login(request: LoginRequest, signal?: AbortSignal): Promise<AuthenticationResponse> {
    const response = await apiClient.post<AuthenticationResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      request,
      { signal },
    );
    return storeAuthentication(response.data);
  },

  async googleAuthenticate(
    request: GoogleAuthenticationRequest,
    signal?: AbortSignal,
  ): Promise<AuthenticationResponse> {
    const response = await apiClient.post<AuthenticationResponse>(
      API_ENDPOINTS.AUTH.GOOGLE,
      request,
      {
        signal,
      },
    );
    return storeAuthentication(response.data);
  },

  async googleAuthenticateWithCode(
    request: GoogleAuthorizationCodeRequest,
    signal?: AbortSignal,
  ): Promise<AuthenticationResponse> {
    const response = await apiClient.post<ApiResponse<AuthenticationResponse>>(
      API_ENDPOINTS.AUTH.GOOGLE_CODE,
      request,
      { headers: { 'X-CareerHarbor-Google-Code-Flow': '1' }, signal },
    );
    return storeAuthentication(unwrapGoogleAuthenticationResponse(response.data));
  },

  async requestLoginOtp(
    request: RequestLoginOtpRequest,
    signal?: AbortSignal,
  ): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      API_ENDPOINTS.AUTH.REQUEST_LOGIN_OTP,
      request,
      { signal },
    );
    return response.data;
  },

  async loginWithOtp(
    request: LoginWithOtpRequest,
    signal?: AbortSignal,
  ): Promise<AuthenticationResponse> {
    const response = await apiClient.post<AuthenticationResponse>(
      API_ENDPOINTS.AUTH.LOGIN_WITH_OTP,
      request,
      { signal },
    );
    return storeAuthentication(response.data);
  },

  async requestPasswordReset(
    request: RequestPasswordResetRequest,
    signal?: AbortSignal,
  ): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      API_ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET,
      request,
      { signal },
    );
    return response.data;
  },

  async completePasswordReset(
    request: CompletePasswordResetRequest,
    signal?: AbortSignal,
  ): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      API_ENDPOINTS.AUTH.COMPLETE_PASSWORD_RESET,
      { newPassword: request.newPassword, token: request.token },
      { signal },
    );
    return response.data;
  },

  async refresh(signal?: AbortSignal): Promise<AuthenticationResponse> {
    return refreshSession(signal);
  },

  async logout(signal?: AbortSignal): Promise<void> {
    try {
      if (authTokenStore.getRefreshToken() && !authTokenStore.hasUsableAccessToken()) {
        await refreshSession(signal);
      }

      const refreshToken = authTokenStore.getRefreshToken();
      if (refreshToken) {
        const request: LogoutRequest = { refreshToken };
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, request, { signal });
      }
    } finally {
      authTokenStore.clear();
    }
  },
};
