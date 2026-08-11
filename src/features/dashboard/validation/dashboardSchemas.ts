import * as yup from 'yup';

import { passwordSchema } from '@/features/auth/validation/authSchemas';
import { EmploymentType } from '@/features/jobs/types/jobModels';
import type { CandidateSkillProficiency } from '../types/dashboardModels';

export interface ProfileFormValues {
  headline: string;
  bio: string;
  location: string;
  skills: string;
  education: string;
  experience: string;
  linkedInUrl: string;
  portfolioUrl: string;
  preferredJobTypes: EmploymentType[];
}

export type AdditionalProfileFormValues = Omit<ProfileFormValues, 'bio' | 'headline'>;

export interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CandidateAboutFormValues {
  profileSummary: string;
  resumeHeadline: string;
}

export interface CandidateSkillFormValues {
  name: string;
  proficiency: '' | CandidateSkillProficiency;
  yearsOfExperience: string;
}

export const candidateAboutSchema: yup.ObjectSchema<CandidateAboutFormValues> = yup.object({
  profileSummary: yup
    .string()
    .defined()
    .trim()
    .max(2000, 'Profile summary must be no more than 2,000 characters.'),
  resumeHeadline: yup
    .string()
    .defined()
    .trim()
    .max(180, 'Resume headline must be no more than 180 characters.'),
});

const skillProficiencies: CandidateSkillFormValues['proficiency'][] = [
  '',
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
];

export const candidateSkillSchema: yup.ObjectSchema<CandidateSkillFormValues> = yup.object({
  name: yup
    .string()
    .defined()
    .trim()
    .required('Skill name is required.')
    .max(100, 'Skill name must be no more than 100 characters.'),
  proficiency: yup
    .mixed<CandidateSkillFormValues['proficiency']>()
    .oneOf(skillProficiencies)
    .defined(),
  yearsOfExperience: yup
    .string()
    .defined()
    .test('number', 'Enter a valid number.', (value) => !value || Number.isFinite(Number(value)))
    .test('range', 'Years of experience must be between 0 and 50.', (value) => {
      if (!value) return true;
      const years = Number(value);
      return years >= 0 && years <= 50;
    }),
});

const isOptionalHttpUrl = (value?: string): boolean => {
  if (!value?.trim()) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const profileSchema: yup.ObjectSchema<ProfileFormValues> = yup.object({
  headline: yup.string().defined().trim().max(250, 'Headline must be no more than 250 characters.'),
  bio: yup.string().defined().trim().max(4000, 'Bio must be no more than 4,000 characters.'),
  location: yup.string().defined().trim().max(250, 'Location must be no more than 250 characters.'),
  skills: yup
    .string()
    .defined()
    .test('skills', 'Add no more than 50 skills.', (value) => splitList(value).length <= 50)
    .test('skill-length', 'Each skill must be no more than 100 characters.', (value) =>
      splitList(value).every((item) => item.length <= 100),
    ),
  education: yup
    .string()
    .defined()
    .test(
      'education',
      'Add no more than 20 education entries.',
      (value) => splitLines(value).length <= 20,
    )
    .test(
      'education-length',
      'Each education entry must be no more than 1,000 characters.',
      (value) => splitLines(value).every((item) => item.length <= 1000),
    ),
  experience: yup
    .string()
    .defined()
    .test(
      'experience',
      'Add no more than 30 experience entries.',
      (value) => splitLines(value).length <= 30,
    )
    .test(
      'experience-length',
      'Each experience entry must be no more than 2,000 characters.',
      (value) => splitLines(value).every((item) => item.length <= 2000),
    ),
  linkedInUrl: yup
    .string()
    .defined()
    .trim()
    .max(2048, 'LinkedIn URL must be no more than 2,048 characters.')
    .test('http-url', 'Enter an absolute HTTP or HTTPS URL.', isOptionalHttpUrl),
  portfolioUrl: yup
    .string()
    .defined()
    .trim()
    .max(2048, 'Portfolio URL must be no more than 2,048 characters.')
    .test('http-url', 'Enter an absolute HTTP or HTTPS URL.', isOptionalHttpUrl),
  preferredJobTypes: yup
    .array()
    .of(
      yup
        .mixed<EmploymentType>()
        .oneOf(Object.values(EmploymentType).filter(Number.isInteger) as EmploymentType[])
        .required(),
    )
    .defined()
    .max(10, 'Select no more than 10 job types'),
});

export const additionalProfileSchema: yup.ObjectSchema<AdditionalProfileFormValues> =
  profileSchema.omit(['bio', 'headline']);

export const splitLines = (value: string): string[] =>
  value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

export const splitList = (value: string): string[] =>
  value
    .split(/[,\r\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);

export const changePasswordSchema: yup.ObjectSchema<ChangePasswordFormValues> = yup.object({
  currentPassword: yup
    .string()
    .required('Current password is required.')
    .max(128, 'Password must be no more than 128 characters.'),
  newPassword: passwordSchema.notOneOf(
    [yup.ref('currentPassword')],
    'New password must differ from the current password.',
  ),
  confirmPassword: yup
    .string()
    .required('Please confirm your new password.')
    .oneOf([yup.ref('newPassword')], 'Passwords must match.'),
});
