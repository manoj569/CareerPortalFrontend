import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { CareerHarborSocialLinks } from './CareerHarborSocialLinks';

describe('CareerHarbor social links', () => {
  it('renders configured primary platforms with safe external link behavior', () => {
    render(<CareerHarborSocialLinks />);
    for (const label of ['LinkedIn', 'Instagram', 'YouTube']) {
      const link = screen.getByRole('link', { name: `CareerHarbor on ${label}` });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link.getAttribute('href')).toMatch(/^https:\/\//);
    }
    expect(
      screen.queryByRole('link', { name: 'CareerHarbor on WhatsApp' }),
    ).not.toBeInTheDocument();
  });

  it('opens More with additional configured channels and renders the mobile label', async () => {
    const user = userEvent.setup();
    render(<CareerHarborSocialLinks mobile />);
    expect(screen.getByText('Follow CareerHarbor')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'More CareerHarbor social channels' }));
    const menu = screen.getByRole('menu');
    const facebook = screen.getByRole('menuitem', { name: 'CareerHarbor on Facebook' });
    expect(facebook).toHaveAttribute('target', '_blank');
    expect(facebook).toHaveAttribute('rel', 'noopener noreferrer');
    expect(menu).toBeVisible();
  });
});
