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
import { interviewInsightsApi } from '@/features/interviewInsights/api/interviewInsightsApi';
import { aiApplyApi } from '@/features/aiApply/api/aiApplyApi';
import { adminAIApplyApi } from '@/features/admin/aiApply/api/adminAIApplyApi';
import { referralsApi } from '@/features/referrals/api/referralsApi';
import { UserRole } from '@/types';

const rootReducer = combineReducers({
  auth: authReducer,
  [jobsApi.reducerPath]: jobsApi.reducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
  [paymentsApi.reducerPath]: paymentsApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
  [interviewInsightsApi.reducerPath]: interviewInsightsApi.reducer,
  [aiApplyApi.reducerPath]: aiApplyApi.reducer,
  [adminAIApplyApi.reducerPath]: adminAIApplyApi.reducer,
  [referralsApi.reducerPath]: referralsApi.reducer,
});

const privateCacheListener = createListenerMiddleware();
privateCacheListener.startListening({
  matcher: isAnyOf(logout.fulfilled, logout.rejected, sessionExpired, sessionRefreshed),
  effect: (action, listenerApi) => {
    if (sessionRefreshed.match(action)) {
      if (!action.payload?.user?.id) {
        listenerApi.dispatch(dashboardApi.util.resetApiState());
        listenerApi.dispatch(paymentsApi.util.resetApiState());
        listenerApi.dispatch(adminApi.util.resetApiState());
        listenerApi.dispatch(interviewInsightsApi.util.resetApiState());
        listenerApi.dispatch(aiApplyApi.util.resetApiState());
        listenerApi.dispatch(adminAIApplyApi.util.resetApiState());
        return;
      }
      const originalState = listenerApi.getOriginalState() as {
        auth: { user: { id: string; role: UserRole } | null };
      };
      const previousUser = originalState.auth.user;
      const isSameAccount = previousUser?.id === action.payload.user.id;

      if (isSameAccount) {
        if (action.payload.user.role !== UserRole.Administrator) {
          listenerApi.dispatch(adminApi.util.resetApiState());
          listenerApi.dispatch(adminAIApplyApi.util.resetApiState());
        }
        return;
      }
    }

    listenerApi.dispatch(dashboardApi.util.resetApiState());
    listenerApi.dispatch(paymentsApi.util.resetApiState());
    listenerApi.dispatch(adminApi.util.resetApiState());
    listenerApi.dispatch(interviewInsightsApi.util.resetApiState());
    listenerApi.dispatch(aiApplyApi.util.resetApiState());
    listenerApi.dispatch(adminAIApplyApi.util.resetApiState());
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
          interviewInsightsApi.middleware,
          aiApplyApi.middleware,
          adminAIApplyApi.middleware,
          referralsApi.middleware,
        ),
  });

export const store = createAppStore();
export type AppStore = typeof store;
export type AppDispatch = AppStore['dispatch'];
