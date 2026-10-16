import { describe, expect, it } from 'vitest';
import type { CandidateCompanyLogo } from '../types/jobModels';
import { selectCompanyLogos } from './companyLogoSelection';

const company: CandidateCompanyLogo = { companyId: 'id', name: 'Employer', logoUrl: '/logo.svg' };

describe('company logo selection', () => {
  it.each([0, 75, 300, 501])(
    'preserves all %i unique API companies in deterministic order',
    (count) => {
      const companies = Array.from({ length: count }, (_, index) => ({
        ...company,
        companyId: `${index}`,
        name: `Employer ${index}`,
      }));
      const selected = selectCompanyLogos(companies);
      expect(selected).toHaveLength(count);
      expect(selected.map((entry) => entry.key)).toEqual(companies.map((entry) => entry.companyId));
      expect(selectCompanyLogos(companies)).toEqual(selected);
    },
  );

  it('uses normalized IDs, not company names or artwork, for deduplication', () => {
    expect(
      selectCompanyLogos([
        company,
        { ...company, companyId: ' ID ' },
        { ...company, companyId: 'different' },
      ]),
    ).toHaveLength(2);
  });

  it('handles malformed identity and logo fields defensively without requiring popular-company counts', () => {
    const invalid = [
      null,
      {},
      { name: 5, logoUrl: 42 },
      { ...company, companyId: '' },
      { ...company, name: ' ' },
      { ...company, logoUrl: null },
      { ...company, logoUrl: 'javascript:alert(1)' },
      { ...company, logoUrl: 'https://user:pass@example.test/logo' },
    ];
    expect(selectCompanyLogos(invalid as CandidateCompanyLogo[])).toEqual([]);
    expect(selectCompanyLogos([company])).toEqual([
      { key: 'id', name: 'Employer', logoUrl: '/logo.svg' },
    ]);
  });
});
