import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { sessionExpired, sessionRefreshed } from '@/features/auth/store/authSlice';
import { CandidateRoute } from '@/routes/CandidateRoute';
import { UserRole } from '@/types';
import { PublicLayout } from './PublicLayout';

const guest = { user: null, status: 'unauthenticated' as const, isSubmitting: false, error: null, accessTokenExpiresAtUtc: null };
const session = { user: { id: 'candidate', email: 'candidate@example.com', firstName: 'Avery', lastName: 'Patel', role: UserRole.Candidate }, accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z' };
const setup = () => {
  const router = createMemoryRouter([
    { element: <PublicLayout />, children: [{ path: '/', element: <p>Existing hero</p> }] },
    { path: '/login', element: <p>Login destination</p> },
    { path: '/register', element: <p>Register destination</p> },
    { path: '/jobs', element: <p>Jobs destination</p> },
    { element: <CandidateRoute />, children: [
      { path: '/dashboard/jobs', element: <p>Referrals destination</p> },
      { path: '/dashboard/interview-insights', element: <p>Insights destination</p> },
      { path: '/dashboard/portfolio', element: <p>Portfolio destination</p> },
    ] },
  ], { initialEntries: ['/'] });
  return { router, ...renderWithProviders(<RouterProvider router={router} />, { auth: guest }) };
};
const open = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Open main navigation' }));
  return within(screen.getByLabelText('Main navigation drawer'));
};

describe('Public homepage mobile navigation', () => {
  it('provides header account routes before the drawer opens', () => {
    setup();
    const header = within(screen.getByRole('banner'));
    expect(header.getAllByRole('link', { name: 'Log in' })).toHaveLength(2);
    for (const link of header.getAllByRole('link', { name: 'Register' })) expect(link).toHaveAttribute('href', '/register');
    expect(header.getByRole('button', { name: 'Open main navigation' })).toHaveAttribute('aria-expanded', 'false');
  });
  it('renders ordered feature links, active Home, and separate account buttons', async () => {
    setup();
    const drawer = await open();
    expect(within(drawer.getByRole('navigation')).getAllByRole('link').map(link => link.textContent)).toEqual(['Home', 'Browse Jobs', 'Employee Referrals', 'Interview Insights', 'Create Portfolio']);
    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getByLabelText('Main navigation drawer')).toContainElement(document.activeElement as HTMLElement);
    expect(drawer.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(drawer.getByRole('link', { name: 'Home' })).toHaveClass('active');
    expect(drawer.getByRole('link', { name: 'Log in' })).toHaveClass('MuiButton-outlined');
    expect(drawer.getByRole('link', { name: 'Register for free' })).toHaveClass('MuiButton-contained');
  });
  it.each([
    ['Browse Jobs', '/jobs', ''], ['Log in', '/login', ''], ['Register for free', '/register', ''],
    ['Employee Referrals', '/dashboard/jobs', '?mode=referral'],
    ['Interview Insights', '/dashboard/interview-insights', ''], ['Create Portfolio', '/dashboard/portfolio', ''],
  ])('uses the existing %s flow and preserves protected destinations', async (label, path, search) => {
    const { router } = setup();
    const drawer = await open();
    await userEvent.click(drawer.getByRole('link', { name: label }));
    if (path.startsWith('/dashboard')) {
      await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
      expect(router.state.location.state).toMatchObject({ from: { pathname: path, search } });
    } else expect(router.state.location.pathname).toBe(path);
  });
  it.each(['Close', 'Escape', 'backdrop'])('closes with %s and restores hamburger focus', async method => {
    setup();
    const drawer = await open();
    if (method === 'Close') await userEvent.click(drawer.getByRole('button', { name: 'Close' }));
    else if (method === 'Escape') await userEvent.keyboard('{Escape}');
    else await userEvent.click(document.querySelector('.MuiBackdrop-root')!);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Open main navigation' })).toHaveAttribute('aria-expanded', 'false'));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Open main navigation' })).toHaveFocus());
  });
  it('updates account actions after session restoration and logout', async () => {
    const { store } = setup();
    act(() => { store.dispatch(sessionRefreshed(session)); });
    const drawer = await open();
    expect(drawer.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
    expect(drawer.queryByRole('link', { name: 'Log in' })).not.toBeInTheDocument();
    expect(drawer.queryByRole('link', { name: 'Register for free' })).not.toBeInTheDocument();
    act(() => { store.dispatch(sessionExpired()); });
    expect(drawer.getByRole('link', { name: 'Register for free' })).toBeVisible();
    expect(drawer.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
  });
});
