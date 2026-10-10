import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, Link } from 'react-router-dom';
import { expect, it } from 'vitest';
import { ReferralUnsavedChanges } from './ReferralUnsavedChanges';
it('keeps editing or explicitly leaves an unsaved wizard', async () => {
  const router = createMemoryRouter([
    {
      path: '/',
      element: (
        <>
          <ReferralUnsavedChanges dirty allowLeave={{ current: false }} busy={false} />
          <Link to="/other">Other page</Link>
        </>
      ),
    },
    { path: '/other', element: <p>Destination</p> },
  ]);
  render(<RouterProvider router={router} />);
  await userEvent.click(await screen.findByRole('link', { name: 'Other page' }));
  expect(screen.getByRole('dialog', { name: 'Leave this shared job?' })).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(router.state.location.pathname).toBe('/');
  await userEvent.click(await screen.findByRole('link', { name: 'Other page' }));
  await userEvent.click(screen.getByRole('button', { name: 'Leave page' }));
  expect(await screen.findByText('Destination')).toBeVisible();
});
it('allows backend-confirmed success navigation without an abandonment dialog', async () => {
  const router = createMemoryRouter([
    {
      path: '/',
      element: (
        <>
          <ReferralUnsavedChanges dirty allowLeave={{ current: true }} busy={false} />
          <Link to="/other">Success</Link>
        </>
      ),
    },
    { path: '/other', element: <p>Destination</p> },
  ]);
  render(<RouterProvider router={router} />);
  await userEvent.click(screen.getByRole('link', { name: 'Success' }));
  expect(await screen.findByText('Destination')).toBeVisible();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
