import { describe, expect, it } from 'vitest';
import type { CandidateProfileCompletion } from '../types/dashboardModels';
import { isSectionCompleted, isSectionMissing, recommendedStep } from './profileCompletion';

const completion: CandidateProfileCompletion = {
  completedSections: ['basicDetails', 'profileSummary'],
  completionPercentage: 47,
  missingSections: ['careerPreferences', 'education'],
  nextRecommendedIncompleteStep: 'CareerPreferences',
  sections: [{ section: 'Skills', isCompleted: true, weight: 10 }],
};

describe('backend profile completion mapping', () => {
  it('matches backend section casing and uses per-section status', () => {
    expect(isSectionCompleted(completion, 'BasicDetails')).toBe(true);
    expect(isSectionCompleted(completion, 'Skills')).toBe(true);
    expect(isSectionMissing(completion, 'Employment')).toBe(false);
  });

  it('lists only reported missing sections and maps the next step', () => {
    expect(isSectionMissing(completion, 'CareerPreferences')).toBe(true);
    expect(recommendedStep(completion)?.value).toBe('CareerPreferences');
    expect(completion.completionPercentage).toBe(47);
  });
});
