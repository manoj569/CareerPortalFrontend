import { useEffect } from 'react';

import { useAppDispatch } from '@/hooks/reduxHooks';
import type { AuthenticatedSession } from '@/types';
import { initializeAuth, sessionExpired, sessionRefreshed } from '../store/authSlice';

export const AuthInitializer = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(initializeAuth());

    const handleSessionExpired = () => {
      dispatch(sessionExpired());
    };
    const handleSessionRefreshed = (event: Event) => {
      if (event instanceof CustomEvent) {
        const refreshedEvent = event as CustomEvent<AuthenticatedSession>;
        dispatch(sessionRefreshed(refreshedEvent.detail));
      }
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    window.addEventListener('auth:session-refreshed', handleSessionRefreshed);

    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
      window.removeEventListener('auth:session-refreshed', handleSessionRefreshed);
    };
  }, [dispatch]);

  return null;
};
