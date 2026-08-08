import { describe, expect, it } from 'vitest';
import { adminNavigationItems } from './AdminDashboardLayout';

describe('administrator navigation', () => {
  it('keeps Jobs and removes standalone Companies and Categories links', () => {
    const labels = adminNavigationItems.map((item) => item.label);
    expect(labels).toContain('Jobs');
    expect(labels).not.toContain('Companies');
    expect(labels).not.toContain('Categories');
  });
});
