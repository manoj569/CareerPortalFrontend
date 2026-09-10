import type { ResumeMatch } from '../components/ResumeMatchPanel';

export const readResumeMatch = (state: unknown, jobId: string): ResumeMatch | undefined => {
  if (!state || typeof state !== 'object' || !('recommendedJobId' in state) || state.recommendedJobId !== jobId || !('resumeMatch' in state)) return undefined;
  const match = state.resumeMatch;
  if (!match || typeof match !== 'object' || !('matchScore' in match) || typeof match.matchScore !== 'number' || !Number.isFinite(match.matchScore) || match.matchScore < 0 || match.matchScore > 100 || !('matchReasons' in match) || !Array.isArray(match.matchReasons) || !match.matchReasons.every((reason) => typeof reason === 'string')) return undefined;
  return { matchScore: match.matchScore, matchReasons: match.matchReasons };
};
