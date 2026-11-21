import { ROUTES } from '@/constants/routes';

import type { MarketPathCard } from './types/marketIntelligence';

export function marketPathJobsUrl(path: Pick<MarketPathCard, 'name' | 'jobFilter'>) {
  const params = new URLSearchParams({ mode: 'all' });
  let filters: URLSearchParams | undefined;
  if (path.jobFilter?.trim()) {
    try {
      filters = new URL(path.jobFilter, window.location.origin).searchParams;
    } catch {
      // Fall back to searching by the path name for an invalid filter URL.
    }
  }
  const marketRoleId = filters?.get('marketRoleId');
  const marketSkillId = filters?.get('marketSkillId');

  if (marketRoleId) params.set('marketRoleId', marketRoleId);
  else if (marketSkillId) params.set('marketSkillId', marketSkillId);
  else params.set('q', path.name.trim());

  return `${ROUTES.DASHBOARD_JOBS}?${params}`;
}
