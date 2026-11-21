import { NextAction, type AcceleratorJourneyResponse } from './types/journey';

export const journeyMessages: Record<string, string> = {
  MarketSkillNotMapped: 'This market skill is not yet mapped to an Accelerator learning path.',
  CompetencyMappingIncomplete: 'This learning path is still being configured.',
  MarketRoleNotMapped: 'This career path is not yet configured for AI Accelerator learning.',
  LearningPathNotConfigured: 'This career path is not yet configured for AI Accelerator learning.',
  AssessmentNotConfigured: 'Assessment is not configured for this learning path yet.',
  QuestionsUnavailable: 'Assessment questions are currently unavailable.',
};

export function remainingTime(minutes: number | null) {
  if (minutes === null) return 'Not calculated yet';
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return [hours ? `${hours} hr` : '', remainder || !hours ? `${remainder} min` : '', 'remaining']
    .filter(Boolean)
    .join(' ');
}

export function journeyAction(journey: AcceleratorJourneyResponse) {
  switch (journey.nextAction) {
    case NextAction.EnrollLearningPath:
      return { label: 'Enroll in learning path', screen: 'enroll' };
    case NextAction.StartAssessment:
      return { label: 'Start assessment', screen: 'assessment' };
    case NextAction.ResumeAssessment:
      return { label: 'Resume assessment', screen: 'assessment' };
    case NextAction.GenerateRoadmap:
      return { label: 'Generate roadmap', screen: 'roadmap' };
    case NextAction.ContinueLearning:
      return { label: 'Continue learning', screen: 'learning' };
    case NextAction.StartPractice:
      return { label: 'Start practice', screen: 'practice' };
    case NextAction.StartProject:
      return { label: 'Start project', screen: 'project' };
    case NextAction.ContinueProject:
      return { label: 'Continue project', screen: 'project' };
    case NextAction.StartInterview:
      return { label: 'Start interview', screen: 'mock-interview-setup' };
    case NextAction.ContinueInterview:
      return { label: 'Continue interview', screen: 'mock-interview-live' };
    case NextAction.ViewInterviewReport:
      return { label: 'View interview report', screen: 'mock-interview-results' };
    case NextAction.ViewJobs:
      return { label: 'View jobs', screen: 'jobs' };
    case NextAction.ViewApplications:
      return { label: 'View applications', screen: 'applications' };
    default:
      return null;
  }
}
