import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { selectCurrentUser } from '@/features/auth/store/authSlice';
import { requiresCareerSnapshot } from '@/features/auth/utils/careerSnapshotRouting';
import { useAppSelector } from '@/hooks/reduxHooks';

/** Shared by candidate-only and shared authenticated routes, after session restoration. */
export const CareerSnapshotGuard = () => {
  const location = useLocation();
  const user = useAppSelector(selectCurrentUser);
  return requiresCareerSnapshot(user) && location.pathname !== ROUTES.CAREER_SNAPSHOT ? (
    <Navigate replace to={ROUTES.CAREER_SNAPSHOT} state={{ from: location }} />
  ) : (
    <Outlet />
  );
};
