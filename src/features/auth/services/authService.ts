import { apiClient } from '@/api';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { authTokenStore } from '@/services/authTokenStore';
import type { AuthenticationResponse } from '@/types';
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LogoutRequest,
  RefreshTokenRequest,
  RegisterRequest,
  RegistrationResponse,
  ResendVerificationRequest,
  ResetPasswordRequest,
  VerificationResponse,
  VerifyEmailRequest,
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
  async register(request: RegisterRequest, signal?: AbortSignal): Promise<RegistrationResponse> {
    const response = await apiClient.post<RegistrationResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      request,
      { signal },
    );
    return response.data;
  },

  async login(request: LoginRequest, signal?: AbortSignal): Promise<AuthenticationResponse> {
    const response = await apiClient.post<AuthenticationResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      request,
      {
        signal,
      },
    );
    return storeAuthentication(response.data);
  },

  async verifyEmail(
    request: VerifyEmailRequest,
    signal?: AbortSignal,
  ): Promise<VerificationResponse> {
    const response = await apiClient.post<VerificationResponse>(
      API_ENDPOINTS.AUTH.VERIFY_EMAIL,
      request,
      { signal },
    );
    return response.data;
  },

  async resendVerification(
    request: ResendVerificationRequest,
    signal?: AbortSignal,
  ): Promise<VerificationResponse> {
    const response = await apiClient.post<VerificationResponse>(
      API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
      request,
      { signal },
    );
    return response.data;
  },

  async refresh(signal?: AbortSignal): Promise<AuthenticationResponse> {
    return refreshSession(signal);
  },

  async forgotPassword(request: ForgotPasswordRequest, signal?: AbortSignal): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, request, { signal });
  },

  async resetPassword(request: ResetPasswordRequest, signal?: AbortSignal): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, request, { signal });
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
