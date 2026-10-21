import { Navigate, Outlet } from 'react-router-dom';

import { FullPageLoader } from '@/components/feedback/FullPageLoader';
import { ROUTES } from '@/constants/routes';
import {
  selectAuthStatus,
  selectCurrentUser,
  selectIsAuthenticated,
} from '@/features/auth/store/authSlice';
import { useAppSelector } from '@/hooks/reduxHooks';
import { UserRole } from '@/types';
import { careerSnapshotDestination } from '@/features/auth/utils/careerSnapshotRouting';

export const GuestRoute = () => {
  const status = useAppSelector(selectAuthStatus);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  if (status === 'idle' || status === 'initializing') return <FullPageLoader />;

  return isAuthenticated ? (
    <Navigate
      replace
      to={user ? careerSnapshotDestination(user, user.role === UserRole.Administrator ? ROUTES.ADMIN : ROUTES.DASHBOARD) : ROUTES.LOGIN}
    />
  ) : (
    <Outlet />
  );
};
