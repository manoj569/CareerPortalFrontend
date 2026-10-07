import { describe, expect, it } from 'vitest';
import { jobSourceSchema } from './jobSourceSchema';
import { formatScanInterval, formatSourceDate } from '../utils/jobSourceFormatting';
const valid = {
  companyId: 'company',
  careerPageUrl: 'https://example.com',
  atsType: 1,
  atsIdentifier: 'board',
  isActive: true,
  scanIntervalMinutes: 720,
};
describe('source validation and formatting', () => {
  it('supports the exact ATS mapping and requires a SuccessFactors identifier', async () => {
    expect(await jobSourceSchema.isValid({ ...valid, atsType: 4, atsIdentifier: '718244' })).toBe(true);
    expect(await jobSourceSchema.isValid({ ...valid, atsType: 4, atsIdentifier: '' })).toBe(false);
    expect(await jobSourceSchema.isValid({ ...valid, atsType: 5 })).toBe(false);
  });
  it.each(['javascript:alert(1)', 'https://user:password@example.com', '/careers'])(
    'rejects unsupported URL %s',
    async (careerPageUrl) => {
      expect(await jobSourceSchema.isValid({ ...valid, careerPageUrl })).toBe(false);
    },
  );
  it.each([0, 10081, 1.5])('rejects invalid interval %s', async (scanIntervalMinutes) => {
    expect(await jobSourceSchema.isValid({ ...valid, scanIntervalMinutes })).toBe(false);
  });
  it('requires identifiers for providers but permits optional Custom identifiers', async () => {
    expect(await jobSourceSchema.isValid({ ...valid, atsIdentifier: '' })).toBe(false);
    expect(await jobSourceSchema.isValid({ ...valid, atsType: 0, atsIdentifier: null })).toBe(true);
  });
  it('formats generic intervals and null UTC timestamps', () => {
    expect(formatScanInterval(60)).toBe('Every 1 hour');
    expect(formatScanInterval(1440)).toBe('Every 24 hours');
    expect(formatScanInterval(90)).toBe('Every 90 minutes');
    expect(formatSourceDate(null)).toBe('Never');
    expect(formatSourceDate('2026-09-20T12:00:00')).toBe(formatSourceDate('2026-09-20T12:00:00Z'));
  });
});
