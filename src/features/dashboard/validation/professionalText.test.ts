import { describe, expect, it } from 'vitest';
import { isSafeProfessionalText, isWholeInrAmount } from './professionalText';

describe('professional profile input', () => {
  it('accepts technology punctuation and real company names', () => {
    for (const value of ['.NET Developer', 'C#', 'C++', 'B.Tech', 'K. K. Wagh', "O'Connor", 'TCS iON', 'AT&T', 'UI/UX Designer', 'AI/ML Product Manager', '3M']) {
      expect(isSafeProfessionalText(value)).toBe(true);
    }
  });

  it('rejects markup, control characters and punctuation-only labels', () => {
    for (const value of ['', '!!!', '<script>alert(1)</script>', 'abc\u0000def', 'javascript:alert(1)']) {
      expect(isSafeProfessionalText(value)).toBe(false);
    }
  });

  it('accepts only supported whole-number INR amounts', () => {
    for (const value of ['0', '1300000', '1000000000']) expect(isWholeInrAmount(value)).toBe(true);
    for (const value of ['-1', '1.5', '1e3', '001', '1000000001', 'abc']) expect(isWholeInrAmount(value)).toBe(false);
  });
});
