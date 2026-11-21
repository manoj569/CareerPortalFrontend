import { describe, expect, it } from 'vitest';

import { marketPathJobsUrl } from './marketPathJobs';

describe('market path jobs links', () => {
  it.each(['marketRoleId', 'marketSkillId'])('preserves the %s filter', (filter) => {
    expect(
      marketPathJobsUrl({ name: 'Data Engineer', jobFilter: `/api/jobs?${filter}=market-id` }),
    ).toBe(`/dashboard/jobs?mode=all&${filter}=market-id`);
  });

  it('uses the path name when a market filter is unavailable', () => {
    expect(marketPathJobsUrl({ name: 'Data Engineer', jobFilter: '/api/jobs' })).toBe(
      '/dashboard/jobs?mode=all&q=Data+Engineer',
    );
  });
});
