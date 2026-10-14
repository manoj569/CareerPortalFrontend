import { describe, expect, it } from 'vitest';
import { jobSourceSchema } from './jobSourceSchema';
import { formatScanInterval, formatSourceDate } from '../utils/jobSourceFormatting';
const valid = {
  companyId: 'company',
  careerPageUrl: 'https://example.com',
  atsType: 1,
  atsIdentifier: 'board',
  isActive: true,
  autoPublishEnabled: true,
  scanIntervalMinutes: 720,
};
describe('source validation and formatting', () => {
  it('validates the SuccessFactors board URL and derives its numeric identifier', async () => {
    const board = {
      ...valid,
      atsType: 4,
      careerPageUrl: 'https://careers.example.com/go/Example/718244',
    };
    expect(await jobSourceSchema.isValid({ ...board, atsIdentifier: '718244' })).toBe(true);
    expect(await jobSourceSchema.isValid({ ...board, atsIdentifier: '' })).toBe(true);
    expect(await jobSourceSchema.isValid({ ...board, atsIdentifier: 'other' })).toBe(false);
    expect(await jobSourceSchema.isValid({ ...valid, atsType: 5 })).toBe(false);
  });
  it.each([
    [1, 'https://job-boards.greenhouse.io/ExactCase'],
    [2, 'https://jobs.eu.lever.co/ExactCase'],
    [3, 'https://jobs.ashbyhq.com/ExactCase'],
    [4, 'https://careers.example.com/go/Example/123'],
    [5, 'https://tenant.wd504.myworkdayjobs.com/en-US/ExactCase'],
  ])('permits URL-derived metadata for provider %s', async (atsType, careerPageUrl) => {
    expect(
      await jobSourceSchema.isValid({ ...valid, atsType, careerPageUrl, atsIdentifier: null }),
    ).toBe(true);
    expect(
      await jobSourceSchema.isValid({
        ...valid,
        atsType,
        careerPageUrl,
        atsIdentifier: 'conflict',
      }),
    ).toBe(false);
  });
  it.each(['tenant/ExactCase', 'tenant', 'ExactCase'])(
    'accepts matching Workday input %s',
    async (atsIdentifier) => {
      expect(
        await jobSourceSchema.isValid({
          ...valid,
          atsType: 5,
          careerPageUrl: 'https://tenant.wd12.myworkdayjobs.com/ExactCase',
          atsIdentifier,
        }),
      ).toBe(true);
    },
  );
  it.each([1, 2, 3])('rejects identifier URLs and job paths for provider %s', async (atsType) => {
    expect(
      await jobSourceSchema.isValid({
        ...valid,
        atsType,
        atsIdentifier: 'https://evil.test/board',
      }),
    ).toBe(false);
    expect(await jobSourceSchema.isValid({ ...valid, atsType, atsIdentifier: 'board/job' })).toBe(
      false,
    );
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
