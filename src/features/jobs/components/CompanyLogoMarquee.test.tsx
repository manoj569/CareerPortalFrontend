import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { CandidateCompanyLogo } from '../types/jobModels';
import { CompanyLogoMarquee } from './CompanyLogoMarquee';
import { readFileSync } from 'node:fs';
const marqueeStyles = readFileSync('src/features/jobs/components/CompanyLogoMarquee.css', 'utf8');

const company = (overrides: Partial<CandidateCompanyLogo> = {}): CandidateCompanyLogo => ({
  companyId: 'supplied-id',
  name: 'Supplied Employer',
  logoUrl: '/supplied.svg',
  ...overrides,
});

describe('CompanyLogoMarquee', () => {
  it.each([75, 300, 501])(
    'renders every one of %i supplied companies with a hidden visual duplicate',
    (count) => {
      const companies = Array.from({ length: count }, (_, index) =>
        company({ companyId: `${index}`, name: `Employer ${index}` }),
      );
      const { container } = render(<CompanyLogoMarquee companies={companies} />);
      const list = screen.getByRole('list', { name: 'Companies with active jobs' });
      expect(within(list).getAllByRole('img')).toHaveLength(count);
      expect(within(list).getByRole('img', { name: `Employer ${count - 1} logo` })).toHaveAttribute(
        'src',
        '/supplied.svg',
      );
      expect(screen.getAllByRole('list')).toHaveLength(1);
      expect(screen.getAllByRole('img')).toHaveLength(count);
      const duplicate = container.querySelector('.company-logo-marquee__duplicate')!;
      expect(duplicate).toHaveAttribute('aria-hidden', 'true');
      expect(duplicate.querySelectorAll('img')).toHaveLength(count);
      expect(duplicate.querySelector('img')).toHaveAttribute('alt', '');
      expect(container.querySelector('.company-logo-marquee__track')).toHaveStyle({
        animationDuration: `${count * 3}s`,
      });
    },
  );

  it('deduplicates by companyId while preserving distinct companies with the same name and logo', () => {
    render(
      <CompanyLogoMarquee companies={[company(), company(), company({ companyId: 'other' })]} />,
    );
    expect(screen.getAllByRole('img', { name: 'Supplied Employer logo' })).toHaveLength(2);
  });

  it('omits an empty section', () => {
    const { container } = render(<CompanyLogoMarquee companies={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('removes failed artwork from both tracks, hides the last failed section and retries only changed URLs', () => {
    const { rerender } = render(<CompanyLogoMarquee companies={[company()]} />);
    fireEvent.error(screen.getByRole('img', { name: 'Supplied Employer logo' }));
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    rerender(<CompanyLogoMarquee companies={[company()]} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    rerender(<CompanyLogoMarquee companies={[company({ logoUrl: '/updated.svg' })]} />);
    expect(within(screen.getByRole('list')).getByRole('img')).toHaveAttribute(
      'src',
      '/updated.svg',
    );
  });

  it('keeps reduced-motion CSS static and scrollable, with a keyboard-accessible original row', () => {
    render(<CompanyLogoMarquee companies={[company()]} />);
    expect(screen.getByRole('group', { name: 'Company logos' })).toHaveAttribute('tabindex', '0');
    const reduced = marqueeStyles.slice(
      marqueeStyles.indexOf('@media (prefers-reduced-motion: reduce)'),
    );
    expect(reduced).toMatch(/\.company-logo-marquee\s*\{\s*overflow-x: auto;/);
    expect(reduced).toMatch(/\.company-logo-marquee__track\s*\{\s*animation: none;/);
    expect(reduced).toMatch(/\.company-logo-marquee__duplicate\s*\{\s*display: none;/);
    expect(reduced).not.toMatch(/\.company-logo-marquee__group\s*\{\s*display: none;/);
    expect(screen.getByRole('img', { name: 'Supplied Employer logo' })).toBeVisible();
  });
});
