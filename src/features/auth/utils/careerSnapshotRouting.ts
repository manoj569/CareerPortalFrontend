import { ROUTES } from '@/constants/routes';
import { UserRole, type AuthenticatedUser } from '@/types';

export const requiresCareerSnapshot = (user: AuthenticatedUser | null) =>
  user?.role === UserRole.Candidate && user.careerSnapshotRequired === true;

export const careerSnapshotDestination = (user: AuthenticatedUser, destination: string) =>
  requiresCareerSnapshot(user) ? ROUTES.CAREER_SNAPSHOT : destination;
