import { screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { ROUTES } from '@/constants/routes';
import { PublicLayout } from '@/layouts/PublicLayout';
import { renderWithProviders } from '@/test/renderWithProviders';

describe('public footer', () => {
  it('links every public business, pricing, and policy destination', () => {
    const router = createMemoryRouter(
      [
        {
          element: <PublicLayout />,
          children: [{ path: '/', element: <h1>Home</h1> }],
        },
      ],
      { initialEntries: ['/'] },
    );
    renderWithProviders(<RouterProvider router={router} />);

    const footer = within(screen.getByRole('contentinfo'));
    const expectedLinks = [
      ['Terms of Use', ROUTES.TERMS_OF_USE],
      ['Privacy Policy', ROUTES.PRIVACY_POLICY],
      ['Refund and Cancellation Policy', ROUTES.REFUND_POLICY],
      ['Contact Us', ROUTES.CONTACT_US],
      ['Grievance Redressal Policy', ROUTES.GRIEVANCE_POLICY],
      ['Pricing / Membership', ROUTES.PRICING],
      ['About Us', ROUTES.ABOUT_US],
    ] as const;

    expectedLinks.forEach(([label, href]) => {
      expect(footer.getByRole('link', { name: label })).toHaveAttribute('href', href);
    });
  });
});
