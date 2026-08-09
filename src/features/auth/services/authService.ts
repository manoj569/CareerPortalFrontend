import { apiClient } from '@/api';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { authTokenStore } from '@/services/authTokenStore';
import type { AuthenticationResponse } from '@/types';
import type {
  CompletePasswordResetRequest,
  LoginRequest,
  LoginWithOtpRequest,
  LogoutRequest,
  MessageResponse,
  RefreshTokenRequest,
  RegisterRequest,
  RegistrationChallengeResponse,
  RequestLoginOtpRequest,
  RequestPasswordResetRequest,
  ResendRegistrationOtpRequest,
  VerifyRegistrationOtpRequest,
} from '../types/authModels';

const storeAuthentication = (response: AuthenticationResponse): AuthenticationResponse => {
  authTokenStore.set(response);
  return response;
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
  async register(
    request: RegisterRequest,
    signal?: AbortSignal,
  ): Promise<RegistrationChallengeResponse> {
    const response = await apiClient.post<RegistrationChallengeResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      request,
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
