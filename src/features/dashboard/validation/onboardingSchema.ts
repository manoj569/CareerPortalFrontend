import * as yup from 'yup';

import {
  CareerStage,
  DesiredOpportunity,
  WorkPreference,
} from '@/features/dashboard/types/dashboardModels';
import { splitList } from './dashboardSchemas';

export interface OnboardingFormValues {
  careerStage: CareerStage | null;
  desiredOpportunities: DesiredOpportunity[];
  city: string;
  skills: string;
  workPreferences: WorkPreference[];
  college: string;
  degree: string;
  graduationYear: string;
  yearsOfExperience: string;
}

const careerStages = [CareerStage.Student, CareerStage.Fresher, CareerStage.Experienced];
const desiredOpportunities = [
  DesiredOpportunity.Internship,
  DesiredOpportunity.FresherJob,
  DesiredOpportunity.ExperiencedJob,
];
const workPreferences = [WorkPreference.Remote, WorkPreference.Hybrid, WorkPreference.OnSite];
const hasNoControlCharacters = (value?: string): boolean =>
  !value ||
  Array.from(value).every((character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint > 31 && (codePoint < 127 || codePoint > 159);
  });
const currentYear = new Date().getUTCFullYear();

export const onboardingSchema: yup.ObjectSchema<OnboardingFormValues> = yup.object({
  careerStage: yup
    .mixed<CareerStage>()
    .nullable()
    .oneOf(careerStages, 'Choose your current career stage.')
    .required('Choose your current career stage.'),
  desiredOpportunities: yup
    .array()
    .of(yup.mixed<DesiredOpportunity>().oneOf(desiredOpportunities).required())
    .defined()
    .min(1, 'Choose at least one opportunity type.')
    .max(3, 'Choose no more than three opportunity types.'),
  city: yup
    .string()
    .defined()
    .trim()
    .required('City is required.')
    .max(150, 'City must be no more than 150 characters.')
    .test('safe-city', 'City contains invalid characters.', hasNoControlCharacters),
  skills: yup
    .string()
    .defined()
    .test('skill-count', 'Add between 1 and 20 skills.', (value) => {
      const skills = splitList(value);
      return skills.length >= 1 && skills.length <= 20;
    })
    .test('skill-length', 'Each skill must be no more than 100 characters.', (value) =>
      splitList(value).every((skill) => skill.length <= 100 && hasNoControlCharacters(skill)),
    )
    .test('unique-skills', 'Skills must be unique.', (value) => {
      const skills = splitList(value).map((skill) => skill.toLowerCase());
      return new Set(skills).size === skills.length;
    }),
  workPreferences: yup
    .array()
    .of(yup.mixed<WorkPreference>().oneOf(workPreferences).required())
    .defined()
    .max(3, 'Choose no more than three work settings.'),
  college: yup
    .string()
    .defined()
    .trim()
    .max(200, 'College must be no more than 200 characters.')
    .test('safe-college', 'College contains invalid characters.', hasNoControlCharacters),
  degree: yup
    .string()
    .defined()
    .trim()
    .max(200, 'Degree or course must be no more than 200 characters.')
    .test('safe-degree', 'Degree or course contains invalid characters.', hasNoControlCharacters),
  graduationYear: yup
    .string()
    .defined()
    .test(
      'graduation-year',
      `Graduation year must be between ${currentYear - 80} and ${currentYear + 10}.`,
      (value) => {
        if (!value.trim()) return true;
        const year = Number(value);
        return Number.isInteger(year) && year >= currentYear - 80 && year <= currentYear + 10;
      },
    ),
  yearsOfExperience: yup
    .string()
    .defined()
    .test(
      'experience-required',
      'Years of experience is required for experienced professionals.',
      function (value) {
        const formValues = this.parent as OnboardingFormValues;
        return formValues.careerStage !== CareerStage.Experienced || value.trim().length > 0;
      },
    )
    .test('experience-range', 'Years of experience must be between 0 and 50.', (value) => {
      if (!value.trim()) return true;
      const years = Number(value);
      return Number.isFinite(years) && years >= 0 && years <= 50;
    }),
});

export const emptyOnboardingForm: OnboardingFormValues = {
  careerStage: null,
  city: '',
  college: '',
  degree: '',
  desiredOpportunities: [],
  graduationYear: '',
  skills: '',
  workPreferences: [],
  yearsOfExperience: '',
};
