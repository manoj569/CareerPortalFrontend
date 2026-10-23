import { describe, expect, it } from 'vitest';
import { parseHiringDriveQuickFill } from './quickFill';

const companies = [
  { id: 'company-infosys-guid', name: 'Infosys' },
  { id: 'company-other-guid', name: 'Other Company' },
];

describe('parseHiringDriveQuickFill', () => {
  it('parses JSON and aliases into API form fields, resolving a company ID', () => {
    const result = parseHiringDriveQuickFill(
      JSON.stringify({
        company: 'Infosys',
        title: 'Systems Engineer',
        imageUrl: 'https://example.test/campaign.png',
        applyUrl: 'https://example.test/apply',
        batch: '2027 Batch',
        startAt: '2026-10-23T18:00:00Z',
        displayOrder: 1,
        isSponsored: false,
        showOnHome: true,
      }),
      companies,
    );

    expect(result).toMatchObject({
      values: {
        companyId: 'company-infosys-guid',
        title: 'Systems Engineer',
        imageUrl: 'https://example.test/campaign.png',
        applyUrl: 'https://example.test/apply',
        badgeText: '2027 Batch',
        displayOrder: 1,
        isSponsored: false,
        showOnHome: true,
      },
      errors: {},
    });
    expect(result.values.startAtUtc).toBe('2026-10-23T18:00:00.000Z');
  });

  it.each(['Infosys', 'infosys', '  Infosys  ', '  INFOsys   '])(
    'matches company names case-insensitively and after whitespace normalization: %s',
    (company) => {
      const result = parseHiringDriveQuickFill(`Company: ${company}\nTitle: Engineer`, companies);
      expect(result.values.companyId).toBe('company-infosys-guid');
      expect(result.unresolvedCompany).toBeUndefined();
    },
  );

  it('populates other valid fields and reports an unmatched company without inventing an ID', () => {
    const result = parseHiringDriveQuickFill(
      'Company: XYZ\nTitle: Engineer\nApply URL: https://example.test/apply',
      companies,
    );
    expect(result.values).toMatchObject({ title: 'Engineer', applyUrl: 'https://example.test/apply' });
    expect(result.values.companyId).toBeUndefined();
    expect(result.unresolvedCompany).toBe('XYZ');
  });

  it('parses key/value aliases, Yes/No booleans, numeric order, and independent placement flags', () => {
    const result = parseHiringDriveQuickFill(
      [
        'Company: Infosys',
        'Title: Systems Engineer',
        'Campaign Image URL: https://example.test/campaign.png',
        'Apply URL: https://example.test/apply',
        'Start Date: 2026-10-23T18:00:00Z',
        'Display Order: 12',
        'Show on Home: Yes',
        'Sponsored: No',
      ].join('\n'),
      companies,
    );
    expect(result.errors).toEqual({});
    expect(result.values).toMatchObject({
      companyId: 'company-infosys-guid',
      displayOrder: 12,
      showOnHome: true,
      isSponsored: false,
    });
  });

  it('accepts true/false JSON booleans and keeps Show on Home independent from Sponsored', () => {
    const result = parseHiringDriveQuickFill(
      '{"showOnHome":false,"isSponsored":true,"isActive":false}',
      companies,
    );
    expect(result.values).toMatchObject({ showOnHome: false, isSponsored: true, isActive: false });
    expect(result.errors).toEqual({});
  });

  it('reports invalid JSON and malformed field values without coercing them', () => {
    expect(parseHiringDriveQuickFill('{not json', companies).errors.input).toBe(
      'Enter valid campaign JSON.',
    );
    const result = parseHiringDriveQuickFill(
      'Display Order: 1.5\nShow on Home: maybe\nApply URL: javascript:alert(1)\nStart Date: nope',
      companies,
    );
    expect(result.errors).toMatchObject({
      displayOrder: 'Use a non-negative whole number.',
      showOnHome: 'Enter true/false or yes/no.',
      applyUrl: 'Enter a valid HTTPS URL.',
      startAtUtc: 'Enter a valid date and time.',
    });
    expect(result.values).toEqual({});
  });
});
