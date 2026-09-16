import { describe, expect, it } from 'vitest';
import { countries, educationLevels, gradingSystems, indianCities } from './profileReferenceData';

describe('shared profile reference data', () => {
  it('provides searchable canonical country and Indian-city values', () => {
    expect(countries.length).toBeGreaterThan(200);
    expect(countries.find((country) => country.value === 'India')?.label).toBe('India');
    for (const city of ['Pune', 'Mumbai', 'Navi Mumbai', 'Thane', 'Bengaluru', 'Hyderabad', 'Delhi', 'Chennai', 'Kolkata', 'Ahmedabad', 'Surat', 'Jaipur', 'Nashik', 'Nagpur', 'Aurangabad', 'Chhatrapati Sambhajinagar']) {
      expect(indianCities.some((option) => option.value === city)).toBe(true);
    }
  });

  it('keeps education and grading wire values separate from friendly labels', () => {
    expect(educationLevels.some((option) => option.value === 'BTech')).toBe(true);
    expect(gradingSystems.find((option) => option.value === 'Cgpa10')?.label).toBe('CGPA out of 10');
  });
});
