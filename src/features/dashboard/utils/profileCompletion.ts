import type { CandidateProfileCompletion, ProfileCompletionStep } from '../types/dashboardModels';

export const profileSteps: { label: string; value: ProfileCompletionStep }[] = [
  { label: 'Basic details', value: 'BasicDetails' },
  { label: 'Profile summary', value: 'ProfileSummary' },
  { label: 'Skills', value: 'Skills' },
  { label: 'Career preferences', value: 'CareerPreferences' },
  { label: 'Education', value: 'Education' },
  { label: 'Employment', value: 'Employment' },
  { label: 'Resume', value: 'Resume' },
];

const normalize = (value: string) => value.replace(/[^a-z0-9]/gi, '').toLowerCase();
export const matchesSection = (value: string, section: ProfileCompletionStep) => normalize(value) === normalize(section);
export const isSectionCompleted = (completion: CandidateProfileCompletion, section: ProfileCompletionStep) =>
  completion.sections.some((status) => matchesSection(status.section, section) && status.isCompleted) ||
  completion.completedSections.some((value) => matchesSection(value, section));
export const isSectionMissing = (completion: CandidateProfileCompletion, section: ProfileCompletionStep) =>
  completion.missingSections.some((value) => matchesSection(value, section));
export const recommendedStep = (completion: CandidateProfileCompletion) =>
  profileSteps.find((step) => completion.nextRecommendedIncompleteStep && matchesSection(completion.nextRecommendedIncompleteStep, step.value));
