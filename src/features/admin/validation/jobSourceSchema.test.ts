import { describe, expect, it } from 'vitest';
import { jobSourceSchema } from './jobSourceSchema';
import { parseWorkdaySiteRoot } from './jobSourceConfiguration';
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
  it.each([null, '', 'public-token'])('accepts RippleHire with optional matching identifier %s', async (atsIdentifier) => {
    expect(await jobSourceSchema.isValid({ ...valid, atsType: 8, atsIdentifier,
      careerPageUrl: 'https://example.ripplehire.com/candidate/?token=public-token&source=PUBLIC&lang=en' })).toBe(true);
  });
  it.each([
    'http://example.ripplehire.com/candidate/?token=public-token',
    'https://example.ripplehire.com/ripplehire/candidate/?token=public-token',
    'https://example.ripplehire.com/candidate/?token=public-token#detail/job/1',
    'https://example.ripplehire.com/candidate/?token=public-token&lang=fr',
    'https://example.ripplehire.com/candidate/?token=public-token&extra=value',
    'https://example.ripplehire.com/candidate/?token=public-token&token=other',
    'https://example.ripplehire.com/candidate/?token=public%2Dtoken',
    'https://example.ripplehire.com/candidate/?token=',
    'https://example.ripplehire.com:444/candidate/?token=public-token',
    'https://127.0.0.1/careers',
    'https://internal.local/careers',
    'https://user:password@example.com/careers',
  ])('rejects unsupported RippleHire URL %s', async (careerPageUrl) => {
    expect(await jobSourceSchema.isValid({ ...valid, atsType: 8, atsIdentifier: null, careerPageUrl })).toBe(false);
  });
  it('rejects RippleHire identifier conflicts', async () => {
    expect(await jobSourceSchema.isValid({ ...valid, atsType: 8, atsIdentifier: 'other',
      careerPageUrl: 'https://example.ripplehire.com/candidate/?token=public-token' })).toBe(false);
  });
  it.each([null, '', 'public-token'])('reports unsupported RippleHire ref on the URL with identifier %s', async (atsIdentifier) => {
    await expect(jobSourceSchema.validate({ ...valid, atsType: 8, atsIdentifier,
      careerPageUrl: 'https://example.ripplehire.com/candidate/?token=public-token&ref=careers' }))
      .rejects.toMatchObject({ path: 'careerPageUrl', message: 'Provide one public career token, with optional source and lang=en only. Never use a private candidate link.' });
  });
  it('reports a RippleHire token conflict on the identifier', async () => {
    await expect(jobSourceSchema.validate({ ...valid, atsType: 8, atsIdentifier: 'PUBLIC-token',
      careerPageUrl: 'https://example.ripplehire.com/candidate/?token=public-token' }))
      .rejects.toMatchObject({ path: 'atsIdentifier', message: 'The ATS Identifier must match the public career token in the URL, or be left blank.' });
  });
  it.each(['https://www.ltm.com/india-careers', 'https://example.ripplehire.com/',
    'https://example.ripplehire.com/candidate/', 'https://employer.example/careers?region=India',
    'https://example.ripplehire.com/candidate/?token=public-token#list/geo=India'])('permits RippleHire discovery input %s with no identifier', async (careerPageUrl) => {
    expect(await jobSourceSchema.isValid({ ...valid, atsType: 8, atsIdentifier: null, careerPageUrl })).toBe(true);
  });
  it.each(['https://www.ltm.com/india-careers', 'https://example.ripplehire.com/'])('requires a complete token URL for an explicit identifier: %s', async (careerPageUrl) => {
    expect(await jobSourceSchema.isValid({ ...valid, atsType: 8, atsIdentifier: 'public-token', careerPageUrl })).toBe(false);
  });
  it('accepts SmartRecruiters numeric type 7 with a company identifier and normal URL validation', async () => {
    expect(await jobSourceSchema.validate({ ...valid, atsType: 7, atsIdentifier: 'ExampleCompany', careerPageUrl: 'https://careers.smartrecruiters.com/ExampleCompany' })).toMatchObject({ atsType: 7, atsIdentifier: 'ExampleCompany' });
    expect(await jobSourceSchema.isValid({ ...valid, atsType: 7, careerPageUrl: 'invalid' })).toBe(false);
  });

  it.each([null, '', 'https://example.com', 'company/jobs', 'company\\jobs', 'company?query', 'company#fragment', 'company\u0000', 'company\n', 'company\u007f'])('rejects malformed SmartRecruiters identifier %s', async (atsIdentifier) => {
    expect(await jobSourceSchema.isValid({ ...valid, atsType: 7, atsIdentifier })).toBe(false);
  });
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
  it.each([
    'https://company.wd1.myworkdayjobs.com/External',
    'https://company.wd3.myworkdayjobs.com/en-US/External',
    'https://spgi.wd5.myworkdayjobs.com/SPGI_Careers',
    'https://spgi.wd5.myworkdayjobs.com/en-US/SPGI_Careers',
    'https://company.wd12.myworkdayjobs.com/External_Rockwell_Automation/',
    'https://company.wd504.myworkdayjobs.com/External-Rockwell-Automation-Early-Careers',
    'https://company.wd98765.myworkdayjobs.com/Site123',
    'https://browserstack.wd3.myworkdayjobs.com/External',
  ])('accepts structural Workday site root %s and a URL identifier', async (url) => {
    expect(
      await jobSourceSchema.isValid({ ...valid, atsType: 5, careerPageUrl: url, atsIdentifier: url }),
    ).toBe(true);
    expect(parseWorkdaySiteRoot(url)).not.toBeNull();
  });
  it.each([
    'http://company.wd5.myworkdayjobs.com/External',
    'https://company.wd5.myworkdayjobs.com.evil.com/External',
    'https://evilmyworkdayjobs.com/External',
    'https://localhost/External',
    'https://127.0.0.1/External',
    'https://10.0.0.1/External',
    'https://user:password@company.wd5.myworkdayjobs.com/External',
    'https://company.wd5.myworkdayjobs.com:8443/External',
    'https://company.wd5.myworkdayjobs.com/External?redirect=https://evil.test',
    'https://company.wd5.myworkdayjobs.com/External?',
    'https://company.wd5.myworkdayjobs.com/External#fragment',
    'https://company.wd5.myworkdayjobs.com/External#',
    'https://company.wd5.myworkdayjobs.com/External/job/Some-Job/123',
    'https://company.wd5.myworkdayjobs.com/search',
    'https://company.wd5.myworkdayjobs.com/',
    'https://company.wd5.myworkdayjobs.com/External/../Other',
    'https://company.wd5.myworkdayjobs.com/%2e%2e/External',
    'https://company.wd5.myworkdayjobs.com/External%2fjob',
    'https://company.wd0.myworkdayjobs.com/External',
  ])('rejects unsafe Workday URL %s', async (careerPageUrl) => {
    expect(parseWorkdaySiteRoot(careerPageUrl)).toBeNull();
    expect(
      await jobSourceSchema.isValid({ ...valid, atsType: 5, careerPageUrl, atsIdentifier: null }),
    ).toBe(false);
  });
  it('uses Workday validation immediately after switching from Greenhouse', async () => {
    const workdayUrl = 'https://spgi.wd5.myworkdayjobs.com/SPGI_Careers';
    const input = { ...valid, careerPageUrl: workdayUrl, atsIdentifier: workdayUrl };
    expect(await jobSourceSchema.isValid({ ...input, atsType: 1 })).toBe(false);
    expect(await jobSourceSchema.isValid({ ...input, atsType: 5 })).toBe(true);
  });
  it('derives the exact S&P Global and BrowserStack CXS endpoints', () => {
    expect(parseWorkdaySiteRoot('https://spgi.wd5.myworkdayjobs.com/en-US/SPGI_Careers')).toMatchObject({
      tenant: 'spgi', shard: 'wd5', locale: 'en-US', site: 'SPGI_Careers',
      cxsJobsUrl: 'https://spgi.wd5.myworkdayjobs.com/wday/cxs/spgi/SPGI_Careers/jobs',
    });
    expect(parseWorkdaySiteRoot('https://browserstack.wd3.myworkdayjobs.com/External')).toMatchObject({
      tenant: 'browserstack', shard: 'wd3', locale: null, site: 'External',
      cxsJobsUrl: 'https://browserstack.wd3.myworkdayjobs.com/wday/cxs/browserstack/External/jobs',
    });
  });
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
