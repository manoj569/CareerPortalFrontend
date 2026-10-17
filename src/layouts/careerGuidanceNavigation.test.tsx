import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { NavigationList } from '@/components/navigation/NavigationList';
import { ROUTES } from '@/constants/routes';
import { GuidancePage } from '@/features/careerGuidance/components/GuidanceUI';
import { adminNavigationItems } from './adminNavigation';
import { candidateNavigationItems } from './candidateNavigation';

describe('Career Guidance dashboard navigation', () => {
  it('places the candidate entry after Interview insights and before Membership', () => {
    const labels = candidateNavigationItems.map((item) => item.label);

    expect(labels).toEqual([
      'Dashboard',
      'Browse jobs',
      'Saved jobs',
      'Applied jobs',
      'Referrals',
      'Interview insights',
      'Career Guidance',
      'Portfolio',
      'Membership',
      'Resume maker',
      'Settings',
    ]);

    const guidance = candidateNavigationItems.find((item) => item.label === 'Career Guidance');
    expect(guidance).toMatchObject({ action: 'career-guidance-coming-soon', secondaryLabel: 'Coming soon' });
    expect(guidance?.path).toBeUndefined();
  });

  it('places the admin entry after Users and before Applications', () => {
    const labels = adminNavigationItems.map((item) => item.label);

    const usersIndex = labels.indexOf('Users');
    const careerGuidanceIndex = labels.indexOf('Career Guidance');
    const applicationsIndex = labels.indexOf('Applications');

    expect(careerGuidanceIndex).toBe(usersIndex + 1);
    expect(careerGuidanceIndex).toBeLessThan(applicationsIndex);

    expect(
      adminNavigationItems.find(
        (item) => item.label === 'Career Guidance',
      )?.path,
    ).toBe(ROUTES.ADMIN_CAREER_GUIDANCE);
  });

  it('shows Career Guidance as a Coming soon action without linking to a workflow', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <NavigationList items={candidateNavigationItems} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('button', { name: 'Career Guidance, Coming soon' }),
    ).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Career Guidance' })).not.toBeInTheDocument();
  });

  it('keeps admin Career Guidance active for nested routes', () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/admin/career-guidance/consultants/consultant-1',
        ]}
      >
        <NavigationList items={adminNavigationItems} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', { name: 'Career Guidance' }),
    ).toHaveClass('active');
  });

  it('uses Career Guidance title metadata for public and admin pages', () => {
    const originalPath = window.location.pathname;

    window.history.pushState({}, '', '/career-guidance');

    const publicView = render(
      <MemoryRouter>
        <GuidancePage title="Find a consultant">
          <span>content</span>
        </GuidancePage>
      </MemoryRouter>,
    );

    expect(document.title).toBe(
      'Find a consultant | Career Guidance | Career Harbor',
    );

    publicView.unmount();

    window.history.pushState(
      {},
      '',
      '/admin/career-guidance/consultants',
    );

    const adminView = render(
      <MemoryRouter>
        <GuidancePage title="Consultants">
          <span>content</span>
        </GuidancePage>
      </MemoryRouter>,
    );

    expect(document.title).toBe(
      'Consultants | Career Guidance Admin | Career Harbor',
    );

    adminView.unmount();

    window.history.pushState({}, '', originalPath);
  });
});
