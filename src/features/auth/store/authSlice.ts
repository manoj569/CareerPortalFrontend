import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { authTokenStore } from '@/services/authTokenStore';
import type { AuthenticatedSession, AuthenticatedUser, AuthenticationResponse } from '@/types';
import { getAuthenticationErrorMessage } from '../services/authErrorMapper';
import { authService } from '../services/authService';
import type {
  LoginRequest,
  LoginWithOtpRequest,
  RegisterRequest,
  RegistrationResponse,
} from '../types/authModels';

export type AuthenticationStatus = 'idle' | 'initializing' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  user: AuthenticatedUser | null;
  status: AuthenticationStatus;
  isSubmitting: boolean;
  accessTokenExpiresAtUtc: string | null;
  error: string | null;
  pendingLogoutRequestId?: string;
  pendingLogoutSessionVersion?: number;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  isSubmitting: false,
  accessTokenExpiresAtUtc: null,
  error: null,
};

interface AuthThunkConfig {
  rejectValue: string;
  state: { auth: AuthState };
}

export const initializeAuth = createAsyncThunk<AuthenticationResponse, void, AuthThunkConfig>(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    const version = authTokenStore.getSessionVersion();
    try {
      return await authService.refresh();
    } catch (error: unknown) {
      if (version === authTokenStore.getSessionVersion()) authTokenStore.clear();
      return rejectWithValue(getAuthenticationErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => getState().auth.status === 'idle',
  },
);

export const login = createAsyncThunk<AuthenticationResponse, LoginRequest, AuthThunkConfig>(
  'auth/login',
  async (request, { rejectWithValue, signal }) => {
    try {
      return await authService.login(request, signal);
    } catch (error: unknown) {
      return rejectWithValue(getAuthenticationErrorMessage(error));
    }
  },
  {
    // Keep login single-flight even when callers bypass the form's local lock.
    condition: (_, { getState }) => !getState().auth.isSubmitting,
  },
);

export const loginWithOtp = createAsyncThunk<
  AuthenticationResponse,
  LoginWithOtpRequest,
  AuthThunkConfig
>('auth/loginWithOtp', async (request, { rejectWithValue }) => {
  try {
    return await authService.loginWithOtp(request);
  } catch (error: unknown) {
    return rejectWithValue(getAuthenticationErrorMessage(error));
  }
});

export const register = createAsyncThunk<RegistrationResponse, RegisterRequest, AuthThunkConfig>(
  'auth/register',
  async (request, { rejectWithValue }) => {
    try {
      return await authService.register(request);
    } catch (error: unknown) {
      return rejectWithValue(getAuthenticationErrorMessage(error));
    }
  },
);

export const logout = createAsyncThunk<void, void, AuthThunkConfig>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error: unknown) {
      return rejectWithValue(getAuthenticationErrorMessage(error));
    }
  },
);

const applyAuthentication = (state: AuthState, response: AuthenticatedSession): void => {
  if (state.user?.id !== response.user.id || state.pendingLogoutSessionVersion !== authTokenStore.getSessionVersion()) {
    state.pendingLogoutRequestId = undefined;
    state.pendingLogoutSessionVersion = undefined;
  }
  state.user = response.user;
  state.status = 'authenticated';
  state.accessTokenExpiresAtUtc = response.accessTokenExpiresAtUtc;
  state.error = null;
};

const clearAuthentication = (state: AuthState): void => {
  state.pendingLogoutRequestId = undefined;
  state.pendingLogoutSessionVersion = undefined;
  state.isSubmitting = false;
  state.user = null;
  state.status = 'unauthenticated';
  state.accessTokenExpiresAtUtc = null;
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionRefreshed: (state, action: PayloadAction<AuthenticatedSession>) => {
      applyAuthentication(state, action.payload);
    },
    sessionExpired: (state) => {
      authTokenStore.clear();
      clearAuthentication(state);
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    profileUpdated: (state, action: PayloadAction<{ firstName: string; lastName: string }>) => {
      if (!state.user) return;
      state.user.firstName = action.payload.firstName;
      state.user.lastName = action.payload.lastName;
    },
    careerSnapshotConfirmed: (state, action: PayloadAction<{ userId: string; careerSnapshotRequired: boolean }>) => {
      if (state.user?.id === action.payload.userId)
        state.user.careerSnapshotRequired = action.payload.careerSnapshotRequired;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.status = 'initializing';
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (state.status !== 'initializing') return;
        applyAuthentication(state, action.payload);
      })
      .addCase(initializeAuth.rejected, (state) => {
        if (state.status !== 'initializing') return;
        clearAuthentication(state);
      })
      .addCase(login.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isSubmitting = false;
        applyAuthentication(state, action.payload);
      })
      .addCase(login.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.meta.aborted
          ? 'Sign-in was cancelled. You can try again.'
          : action.payload ?? 'Unable to log in.';
      })
      .addCase(loginWithOtp.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(loginWithOtp.fulfilled, (state, action) => {
        state.isSubmitting = false;
        applyAuthentication(state, action.payload);
      })
      .addCase(loginWithOtp.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload ?? 'Unable to log in.';
      })
      .addCase(register.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.error = null;
        if (action.payload.authentication) applyAuthentication(state, action.payload.authentication);
      })
      .addCase(register.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload ?? 'Unable to create the account.';
      })
      .addCase(logout.pending, (state, action) => {
        state.pendingLogoutRequestId = action.meta.requestId;
        state.pendingLogoutSessionVersion = authTokenStore.getSessionVersion();
        state.isSubmitting = true;
      })
      .addCase(logout.fulfilled, (state, action) => {
        if (state.pendingLogoutRequestId !== action.meta.requestId) return;
        state.pendingLogoutRequestId = undefined;
        state.isSubmitting = false;
        clearAuthentication(state);
      })
      .addCase(logout.rejected, (state, action) => {
        if (state.pendingLogoutRequestId !== action.meta.requestId) return;
        state.pendingLogoutRequestId = undefined;
        state.isSubmitting = false;
        clearAuthentication(state);
        state.error = action.payload ?? null;
      });
  },
});

export const { clearAuthError, profileUpdated, sessionExpired, sessionRefreshed, careerSnapshotConfirmed } =
  authSlice.actions;
export const authReducer = authSlice.reducer;

export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.status === 'authenticated' && state.auth.user !== null;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
