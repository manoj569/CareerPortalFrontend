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
    try {
      return await authService.refresh();
    } catch (error: unknown) {
      authTokenStore.clear();
      return rejectWithValue(getAuthenticationErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => getState().auth.status === 'idle',
  },
);

export const login = createAsyncThunk<AuthenticationResponse, LoginRequest, AuthThunkConfig>(
  'auth/login',
  async (request, { rejectWithValue }) => {
    try {
      return await authService.login(request);
    } catch (error: unknown) {
      return rejectWithValue(getAuthenticationErrorMessage(error));
    }
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
  state.user = response.user;
  state.status = 'authenticated';
  state.accessTokenExpiresAtUtc = response.accessTokenExpiresAtUtc;
  state.error = null;
};

const clearAuthentication = (state: AuthState): void => {
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.status = 'initializing';
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        applyAuthentication(state, action.payload);
      })
      .addCase(initializeAuth.rejected, (state) => {
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
        state.error = action.payload ?? 'Unable to log in.';
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
      .addCase(register.fulfilled, (state) => {
        state.isSubmitting = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload ?? 'Unable to create the account.';
      })
      .addCase(logout.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isSubmitting = false;
        clearAuthentication(state);
      })
      .addCase(logout.rejected, (state, action) => {
        state.isSubmitting = false;
        clearAuthentication(state);
        state.error = action.payload ?? null;
      });
  },
});

export const { clearAuthError, profileUpdated, sessionExpired, sessionRefreshed } =
  authSlice.actions;
export const authReducer = authSlice.reducer;

export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.status === 'authenticated' && state.auth.user !== null;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
