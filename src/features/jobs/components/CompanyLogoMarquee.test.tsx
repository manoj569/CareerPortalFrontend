import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { PopularCompany } from '../types/jobModels';
import { CompanyLogoMarquee } from './CompanyLogoMarquee';
import { selectCompanyLogos } from '../utils/companyLogoSelection';

const company = (overrides: Partial<PopularCompany> = {}): PopularCompany => ({
  id: 'supplied-id',
  name: 'Supplied Employer',
  slug: 'supplied',
  logoUrl: '/supplied.svg',
  activeJobCount: 2,
  industry: null,
  location: null,
  isVerified: false,
  ...overrides,
});

describe('CompanyLogoMarquee', () => {
  it('renders supplied API artwork with one accessible company list and a hidden visual duplicate', () => {
    const { container } = render(
      <CompanyLogoMarquee
        companies={[
          company(),
          company({ id: 'other', name: 'Other Employer', logoUrl: '/other.png' }),
        ]}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Jobs from top companies' })).toBeVisible();
    expect(screen.getByRole('img', { name: 'Supplied Employer logo' })).toHaveAttribute(
      'src',
      '/supplied.svg',
    );
    expect(screen.getAllByRole('list')).toHaveLength(1);
    expect(screen.getAllByRole('img')).toHaveLength(2);
    const duplicate = container.querySelector('.company-logo-marquee__duplicate')!;
    expect(duplicate).toHaveAttribute('aria-hidden', 'true');
    expect(duplicate.querySelectorAll('img')).toHaveLength(2);
    expect(duplicate.querySelector('img')).toHaveAttribute('alt', '');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('deduplicates stable IDs and normalized names, including missing IDs', () => {
    expect(
      selectCompanyLogos([
        company(),
        company({ name: 'Renamed Employer' }),
        company({ id: 'different', name: ' SUPPLIED   EMPLOYER ' }),
        company({ id: '', name: ' SUPPLIED EMPLOYER ' }),
      ]),
    ).toHaveLength(1);
  });

  it('excludes missing, unsafe, malformed, and inactive company data without crashing', () => {
    const malformed = [
      null,
      {},
      { name: 5, logoUrl: 42 },
      company({ logoUrl: null }),
      company({ logoUrl: 'javascript:alert(1)' }),
      company({ logoUrl: 'https://user:pass@example.test/a' }),
      company({ name: ' ' }),
      company({ activeJobCount: 0 }),
      company({ activeJobCount: NaN }),
    ];
    const { container } = render(<CompanyLogoMarquee companies={malformed as PopularCompany[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('omits an empty section', () => {
    const { container } = render(<CompanyLogoMarquee companies={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('selects at most 24 unique logos deterministically in API order', () => {
    const companies = Array.from({ length: 40 }, (_, index) =>
      company({ id: `${index}`, name: `Employer ${index}` }),
    );
    const selected = selectCompanyLogos(companies);
    expect(selected).toHaveLength(24);
    expect(selected[23]?.name).toBe('Employer 23');
    expect(selectCompanyLogos(companies)).toEqual(selected);
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
});
