export const resumeSections = [
  'Professional Summary',
  'Skills',
  'Experience',
  'Projects',
  'Education',
  'Certifications',
  'Additional Info',
] as const;
export type ResumeSection = (typeof resumeSections)[number];
