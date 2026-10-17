import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { candidateNavigationItems } from '@/layouts/candidateNavigation';
import { vi } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { NavigationList } from './NavigationList';

describe('navigation feature visibility', () => {
  it.each([false, true])(
    'hides Resume Maker and Resume Checker in compact=%s navigation',
    (compact) => {
      renderWithProviders(
        <MemoryRouter>
          <NavigationList
            compact={compact}
            items={[
              { label: 'Resume Checker', path: '/resume-checker' },
              { label: 'Resume maker', path: '/dashboard/resume-maker' },
              { label: 'Career Guidance', path: '/career-guidance' },
            ]}
          />
        </MemoryRouter>,
      );
      expect(screen.queryByRole('link', { name: 'Resume Checker' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Resume maker' })).not.toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Career Guidance' })).toBeVisible();
    },
  );
});

it('opens Coming soon information from Career Guidance without navigating', async () => {
  const onAction = vi.fn();
  renderWithProviders(
    <MemoryRouter initialEntries={['/dashboard/interview-insights']}>
      <NavigationList items={candidateNavigationItems} onAction={onAction} />
      <LocationProbe />
    </MemoryRouter>,
  );
  const guidance = screen.getByRole('button', { name: 'Career Guidance, Coming soon' });
  expect(guidance).toBeVisible();
  await userEvent.click(guidance);
  expect(onAction).toHaveBeenCalledWith('career-guidance-coming-soon');
  expect(screen.getByLabelText('location')).toHaveTextContent('/dashboard/interview-insights');
});

const LocationProbe = () => {
  const location = useLocation();
  return (
    <output aria-label="location">
      {location.pathname}
      {location.search}
    </output>
  );
};
const referralItems = candidateNavigationItems.find(
  (item) => item.label === 'Referrals',
)!.children!;
describe('Referrals group navigation', () => {
  it.each([false, true])(
    'toggles with keyboard without navigating or closing the drawer, compact=%s',
    async (compact) => {
      const onNavigate = vi.fn();
      renderWithProviders(
        <MemoryRouter initialEntries={['/dashboard']}>
          <NavigationList
            items={candidateNavigationItems}
            compact={compact}
            onNavigate={onNavigate}
          />
          <LocationProbe />
        </MemoryRouter>,
      );
      const group = screen.getByRole('button', { name: 'Referrals' });
      expect(group).toHaveAttribute('aria-expanded', 'false');
      group.focus();
      await userEvent.keyboard('{Enter}');
      expect(group).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('link', { name: 'Find Referral Jobs' })).toHaveAttribute(
        'href',
        '/dashboard/jobs?mode=referral',
      );
      expect(screen.getByLabelText('location')).toHaveTextContent('/dashboard');
      expect(onNavigate).not.toHaveBeenCalled();
      await userEvent.keyboard(' ');
      expect(group).toHaveAttribute('aria-expanded', 'false');
      await waitFor(() =>
        expect(screen.queryByRole('link', { name: 'My Requests' })).not.toBeInTheDocument(),
      );
    },
  );
  it.each(referralItems.map((item) => [item.label, item.path]))(
    'auto-expands and highlights %s at %s',
    (label, path) => {
      renderWithProviders(
        <MemoryRouter initialEntries={[path ?? '/dashboard']}>
          <NavigationList items={candidateNavigationItems} />
        </MemoryRouter>,
      );
      expect(screen.getByRole('button', { name: 'Referrals' })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
      expect(screen.getByRole('link', { name: label })).toHaveClass('active');
      expect(screen.getByRole('link', { name: label })).toHaveAttribute('aria-current', 'page');
      if (path?.includes('mode=referral'))
        expect(screen.getByRole('link', { name: 'Browse jobs' })).not.toHaveClass('active');
    },
  );
  it.each(referralItems.map((item) => [item.label, item.path]))(
    'navigates %s to %s and calls the drawer close callback',
    async (label, path) => {
      const onNavigate = vi.fn();
      renderWithProviders(
        <MemoryRouter initialEntries={['/dashboard']}>
          <NavigationList items={candidateNavigationItems} onNavigate={onNavigate} />
          <LocationProbe />
        </MemoryRouter>,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Referrals' }));
      await userEvent.click(screen.getByRole('link', { name: label }));
      expect(screen.getByLabelText('location').textContent).toBe(path);
      expect(onNavigate).toHaveBeenCalledOnce();
    },
  );
  it('preserves job-specific request context and differentiates ordinary jobs', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/dashboard/referrals/job-1/requests']}>
        <NavigationList items={candidateNavigationItems} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Requests Received' })).toHaveClass('active');
    expect(screen.getByRole('link', { name: "Jobs I've Shared" })).not.toHaveClass('active');
  });
});
