import { Navigate, Outlet } from 'react-router-dom';
import { useGetConsultantOnboardingQuery } from '../api/onboardingApi';
import { guidanceError } from '../utils/errors';
import { consultantLifecycle } from '../utils/lifecycle';
import { GuidanceError, GuidanceLoading } from './GuidanceUI';

// Lifecycle navigation only; backend ownership and authorization remain authoritative.
export function ConsultantWorkspaceGate() {
  const query = useGetConsultantOnboardingQuery();
  if (query.isLoading || query.isFetching) return <GuidanceLoading />;
  if (query.error && guidanceError(query.error).status !== 404)
    return <GuidanceError error={query.error} retry={query.refetch} />;
  const lifecycle = consultantLifecycle(query.data?.status);
  return lifecycle.canOpenConsultantWorkspace ? <Outlet /> : <Navigate replace to={lifecycle.destination} />;
}
