import { referralError } from '../types/marketplaceModels';
const fieldLabels: Record<string, string> = {
  title: 'Job title',
  description: 'Job description',
  employmentType: 'Employment type',
  workplaceType: 'Work mode',
  experienceLevel: 'Experience level',
  minimumExperienceYears: 'Minimum experience',
  maximumExperienceYears: 'Maximum experience',
  skills: 'Skills',
  location: 'Location',
  applicationUrl: 'Application URL',
  existingId: 'Selected company or category',
  referralSlots: 'Referral slots',
  sourceUrl: 'Job posting link',
};
export const referralSubmissionError = (error: unknown): string => {
  const errors = (error as { errors?: Record<string, string[]> } | null)?.errors;
  if (!errors || !Object.keys(errors).length) return referralError(error);
  return (
    Object.entries(errors)
      .flatMap(([path, messages]) =>
        messages.map((message) => {
          const field = path.split('.').pop() ?? path;
          const label = fieldLabels[field] ?? path;
          return /JSON value could not be converted/i.test(message)
            ? `${label}: The selected value could not be read by the server. Review this field and try again.`
            : `${label}: ${message}`;
        }),
      )
      .join(' ') || referralError(error)
  );
};
