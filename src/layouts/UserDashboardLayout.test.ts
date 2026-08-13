import { describe, expect, it } from 'vitest';

import { candidateNavigationItems } from './candidateNavigation';

describe('candidate navigation', () => {
  it('uses the required Portfolio-focused order', () => {
    expect(candidateNavigationItems.map((item) => item.label)).toEqual([
      'Dashboard',
      'Browse jobs',
      'Portfolio',
      'Saved jobs',
      'Applied jobs',
      'Membership',
      'Payments',
      'Settings',
    ]);
    expect(candidateNavigationItems.map((item) => item.label)).not.toContain('Notifications');
    expect(candidateNavigationItems.map((item) => item.label)).not.toEqual(
      expect.arrayContaining(['Profile', 'Career preferences']),
    );
  });
});
