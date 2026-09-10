import { describe, expect, it } from 'vitest';
import { readResumeMatch } from './resumeMatch';

describe('resume match navigation context', () => {
  const match = { matchScore: 92, matchReasons: ['Matches your skills'] };
  it('preserves supplied match metadata for the selected job', () => {
    expect(readResumeMatch({ recommendedJobId: 'job-1', resumeMatch: match }, 'job-1')).toEqual(match);
  });
  it('never shows another job’s match or invents one for a direct link', () => {
    expect(readResumeMatch({ recommendedJobId: 'job-2', resumeMatch: match }, 'job-1')).toBeUndefined();
    expect(readResumeMatch(null, 'job-1')).toBeUndefined();
  });
  it.each([NaN, Infinity, -1, 101, '92'])('rejects invalid scores: %s', (matchScore) => {
    expect(readResumeMatch({ recommendedJobId: 'job-1', resumeMatch: { ...match, matchScore } }, 'job-1')).toBeUndefined();
  });
  it('rejects malformed reasons', () => {
    expect(readResumeMatch({ recommendedJobId: 'job-1', resumeMatch: { ...match, matchReasons: [{}] } }, 'job-1')).toBeUndefined();
  });
});
