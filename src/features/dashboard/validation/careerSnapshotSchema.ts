import * as yup from 'yup';
import {
  CareerStage,
  WorkPreference,
  type UpdateCareerSnapshotRequest,
} from '../types/dashboardModels';

export interface CareerSnapshotFormValues {
  careerStage: CareerStage | null;
  primaryRole: string;
  skills: string[];
  yearsOfExperience: string;
  city: string;
  workPreferences: WorkPreference[];
}

const safeText = (value: string) =>
  !Array.from(value).some((char) => {
    const code = char.charCodeAt(0);
    return code < 32 || (code >= 127 && code <= 159);
  });

export const careerSnapshotSchema: yup.ObjectSchema<CareerSnapshotFormValues> = yup.object({
  careerStage: yup
    .mixed<CareerStage>()
    .nullable()
    .oneOf([CareerStage.Student, CareerStage.Fresher, CareerStage.Experienced])
    .required('Choose your career stage.'),
  primaryRole: yup
    .string()
    .defined()
    .required('Enter your primary role.')
    .max(100)
    .test(
      'specific-role',
      'Enter a specific role, including a custom role when choosing Other.',
      (value) =>
        Boolean(value.trim()) &&
        value.trim().toLowerCase() !== 'other' &&
        !value.includes(',') &&
        safeText(value),
    ),
  skills: yup
    .array()
    .of(
      yup
        .string()
        .defined()
        .required()
        .max(100)
        .test(
          'safe-skill',
          'Enter a skill without control characters.',
          (value) => Boolean(value.trim()) && safeText(value),
        ),
    )
    .defined()
    .min(1, 'Add at least one skill.')
    .max(20, 'Choose up to 20 skills.'),
  city: yup
    .string()
    .defined()
    .max(150)
    .test('safe-city', 'Enter a city without control characters.', safeText),
  workPreferences: yup
    .array()
    .of(
      yup
        .mixed<WorkPreference>()
        .oneOf([WorkPreference.Remote, WorkPreference.Hybrid, WorkPreference.OnSite])
        .required(),
    )
    .defined()
    .max(3),
  yearsOfExperience: yup
    .string()
    .defined()
    .test(
      'experience',
      'Enter total experience from 0 to 50 years, with up to one decimal place.',
      function (value) {
        if ((this.parent as CareerSnapshotFormValues).careerStage !== CareerStage.Experienced)
          return true;
        return /^\d+(?:\.\d)?$/.test(value) && Number(value) >= 0 && Number(value) <= 50;
      },
    ),
});

export const snapshotRequest = (values: CareerSnapshotFormValues): UpdateCareerSnapshotRequest => ({
  careerStage: values.careerStage!,
  primaryRole: values.primaryRole.trim().replace(/\s+/g, ' '),
  skills: [
    ...new Map(values.skills.map((skill) => [skill.trim().toLowerCase(), skill.trim()])).values(),
  ],
  yearsOfExperience:
    values.careerStage === CareerStage.Experienced ? Number(values.yearsOfExperience) : null,
  city: values.city.trim() || null,
  workPreferences: values.workPreferences,
});
