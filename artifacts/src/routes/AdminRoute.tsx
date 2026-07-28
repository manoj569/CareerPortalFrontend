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

export const AdminRoute = () => {
  const location = useLocation();
  const status = useAppSelector(selectAuthStatus);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  if (status === 'idle' || status === 'initializing') return <FullPageLoader />;
  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to={ROUTES.LOGIN} />;
  }

  return user?.role === UserRole.Administrator ? (
    <Outlet />
  ) : (
    <Navigate replace to={ROUTES.UNAUTHORIZED} />
  );
};
