import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { FullPageLoader } from '@/components/feedback/FullPageLoader';
import { ROUTES } from '@/constants/routes';
import {
  selectAuthStatus,
  selectCurrentUser,
  selectIsAuthenticated,
} from '@/features/auth/store/authSlice';
import { useAppSelector } from '@/hooks/reduxHooks';
import { UserRole } from '@/types';

export const CandidateRoute = () => {
  const location = useLocation();
  const status = useAppSelector(selectAuthStatus);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  // 1. Guard clause: Wait for authentication to finish loading
  if (status === 'idle' || status === 'initializing') {
    return <FullPageLoader />;
  }

  // 2. Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to={ROUTES.LOGIN} />;
  }

  // 3. Allow access only for Candidates, redirect others to Unauthorized
  if (user?.role === UserRole.Candidate) {
    return <Outlet />;
  }

  return <Navigate replace to={ROUTES.UNAUTHORIZED} />;
};