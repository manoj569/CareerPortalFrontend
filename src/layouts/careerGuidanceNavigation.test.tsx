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
      'Refer a job',
      'Portfolio',
      'Saved jobs',
      'Applied jobs',
      'Interview insights',
      'Career Guidance',
      'Membership',
      'Payments',
      'Settings',
    ]);

    expect(
      candidateNavigationItems.find(
        (item) => item.label === 'Career Guidance',
      )?.path,
    ).toBe(ROUTES.CAREER_GUIDANCE);
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

  it('keeps candidate Career Guidance active for nested routes', () => {
    render(
      <MemoryRouter
        initialEntries={['/career-guidance/bookings/booking-1']}
      >
        <NavigationList items={candidateNavigationItems} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', { name: 'Career Guidance' }),
    ).toHaveClass('active');
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