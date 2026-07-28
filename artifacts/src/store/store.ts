import {
  combineReducers,
  configureStore,
  createListenerMiddleware,
  isAnyOf,
} from '@reduxjs/toolkit';

import {
  authReducer,
  logout,
  sessionExpired,
  sessionRefreshed,
} from '@/features/auth/store/authSlice';
import { adminApi } from '@/features/admin/api/adminApi';
import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import { jobsApi } from '@/features/jobs/api/jobsApi';
import { paymentsApi } from '@/features/payments/api/paymentsApi';
import { UserRole } from '@/types';

const rootReducer = combineReducers({
  auth: authReducer,
  [jobsApi.reducerPath]: jobsApi.reducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
  [paymentsApi.reducerPath]: paymentsApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
});

const privateCacheListener = createListenerMiddleware();
privateCacheListener.startListening({
  matcher: isAnyOf(logout.fulfilled, logout.rejected, sessionExpired, sessionRefreshed),
  effect: (action, listenerApi) => {
    if (sessionRefreshed.match(action)) {
      const originalState = listenerApi.getOriginalState() as {
        auth: { user: { id: string; role: UserRole } | null };
      };
      const previousUser = originalState.auth.user;
      const isSameAccount = previousUser?.id === action.payload.user.id;

      if (isSameAccount) {
        if (action.payload.user.role !== UserRole.Administrator) {
          listenerApi.dispatch(adminApi.util.resetApiState());
        }
        return;
      }
    }

    listenerApi.dispatch(dashboardApi.util.resetApiState());
    listenerApi.dispatch(paymentsApi.util.resetApiState());
    listenerApi.dispatch(adminApi.util.resetApiState());
  },
});

export type RootState = ReturnType<typeof rootReducer>;

export const createAppStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as RootState | undefined,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(privateCacheListener.middleware)
        .concat(
          jobsApi.middleware,
          dashboardApi.middleware,
          paymentsApi.middleware,
          adminApi.middleware,
        ),
  });

export const store = createAppStore();
export type AppStore = typeof store;
export type AppDispatch = AppStore['dispatch'];
