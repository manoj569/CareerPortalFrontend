import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { FullPageLoader } from '@/components/feedback/FullPageLoader';
import { ROUTES } from '@/constants/routes';
import { selectAuthStatus, selectIsAuthenticated } from '@/features/auth/store/authSlice';
import { useAppSelector } from '@/hooks/reduxHooks';

export const ProtectedRoute = () => {
  const location = useLocation();
  const status = useAppSelector(selectAuthStatus);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (status === 'idle' || status === 'initializing') return <FullPageLoader />;

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate replace state={{ from: location }} to={ROUTES.LOGIN} />
  );
};
