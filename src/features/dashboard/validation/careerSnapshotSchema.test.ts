import { describe, expect, it } from 'vitest';
import { CareerStage, WorkPreference } from '../types/dashboardModels';
import {
  careerSnapshotSchema,
  snapshotRequest,
  type CareerSnapshotFormValues,
} from './careerSnapshotSchema';

const valid: CareerSnapshotFormValues = {
  careerStage: CareerStage.Experienced,
  primaryRole: '.NET Developer',
  skills: ['C#', 'SQL Server'],
  yearsOfExperience: '4.2',
  city: 'Pune',
  workPreferences: [WorkPreference.Remote, WorkPreference.Hybrid],
};
describe('verified backend career snapshot contract', () => {
  it('uses the existing numeric enums and the six request keys only', () => {
    expect(snapshotRequest(valid)).toEqual({
      careerStage: 3,
      primaryRole: '.NET Developer',
      skills: ['C#', 'SQL Server'],
      yearsOfExperience: 4.2,
      city: 'Pune',
      workPreferences: [1, 2],
    });
  });
  it.each([CareerStage.Student, CareerStage.Fresher])(
    'does not send stale experience for career stage %s',
    async (careerStage) => {
      const form = { ...valid, careerStage, yearsOfExperience: 'invalid stale value', city: '' };
      expect(await careerSnapshotSchema.isValid(form)).toBe(true);
      expect(snapshotRequest(form)).toMatchObject({
        careerStage,
        yearsOfExperience: null,
        city: null,
      });
    },
  );
  it.each(['', '-1', '51', '4.25', 'not a number'])(
    'rejects experienced years %s',
    async (yearsOfExperience) => {
      expect(await careerSnapshotSchema.isValid({ ...valid, yearsOfExperience })).toBe(false);
    },
  );
  it.each(['', 'Other', 'other', 'Developer, Analyst', 'Developer\n'])(
    'requires a specific primary role: %s',
    async (primaryRole) => {
      expect(await careerSnapshotSchema.isValid({ ...valid, primaryRole })).toBe(false);
    },
  );
  it('accepts custom roles and deduplicates structured skill names', async () => {
    const form = {
      ...valid,
      primaryRole: ' Robotics Engineer ',
      skills: [' C# ', 'c#', 'SQL Server'],
    };
    expect(await careerSnapshotSchema.isValid(form)).toBe(true);
    expect(snapshotRequest(form)).toMatchObject({
      primaryRole: 'Robotics Engineer',
      skills: ['c#', 'SQL Server'],
    });
  });
  it('requires between one and twenty skills', async () => {
    expect(await careerSnapshotSchema.isValid({ ...valid, skills: [] })).toBe(false);
    expect(
      await careerSnapshotSchema.isValid({
        ...valid,
        skills: Array.from({ length: 21 }, (_, index) => `Skill ${index}`),
      }),
    ).toBe(false);
  });
  it('rejects invalid stage, mode and control characters without truncation', async () => {
    expect(await careerSnapshotSchema.isValid({ ...valid, careerStage: 0 })).toBe(false);
    expect(await careerSnapshotSchema.isValid({ ...valid, workPreferences: [99] })).toBe(false);
    expect(await careerSnapshotSchema.isValid({ ...valid, city: 'Pune\u0000' })).toBe(false);
    expect(await careerSnapshotSchema.isValid({ ...valid, skills: ['C#\n'] })).toBe(false);
  });
});
