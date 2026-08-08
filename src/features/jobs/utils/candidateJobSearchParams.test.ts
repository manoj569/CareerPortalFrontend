import { describe, expect, it } from 'vitest';

import { CompanyType, EmploymentType, PublicJobSort, WorkplaceType } from '../types/jobModels';
import {
  parseCandidateJobSearchParams,
  serializeCandidateJobSearchState,
  toCandidatePublicJobQuery,
} from './candidateJobSearchParams';

describe('Candidate job search URL state', () => {
  it('round-trips supported multi-select filters and pagination', () => {
    const params = new URLSearchParams(
      'q=react&companyName=HARMAN&categoryName=Artificial%20Intelligence&workMode=remote&workMode=hybrid&companyType=startup&employmentType=internship&department=Engineering&location=Pune&minExperience=1&maxExperience=3&freshness=7&featured=true&sort=closing&page=2',
    );
    const state = parseCandidateJobSearchParams(params);

    expect(state).toMatchObject({
      companyTypes: [CompanyType.Startup],
      companyName: 'HARMAN',
      categoryName: 'Artificial Intelligence',
      departments: ['Engineering'],
      employmentTypes: [EmploymentType.Internship],
      featuredOnly: true,
      freshnessDays: 7,
      keyword: 'react',
      locations: ['Pune'],
      maxExperienceYears: 3,
      minExperienceYears: 1,
      page: 2,
      sort: 'closing',
      workModes: [WorkplaceType.Remote, WorkplaceType.Hybrid],
    });
    expect(serializeCandidateJobSearchState(state).toString()).toContain('workMode=remote');
    expect(serializeCandidateJobSearchState(state).getAll('workMode')).toEqual([
      'remote',
      'hybrid',
    ]);
    expect(serializeCandidateJobSearchState(state).get('companyName')).toBe('HARMAN');
    expect(serializeCandidateJobSearchState(state).get('categoryName')).toBe(
      'Artificial Intelligence',
    );
  });

  it('sends trimmed name filters together and omits legacy IDs', () => {
    const state = parseCandidateJobSearchParams(
      new URLSearchParams('companyName=%20HARMAN%20&categoryName=%20AI%20&company=legacy-id'),
    );
    const query = toCandidatePublicJobQuery(state);
    expect(query).toMatchObject({ companyName: 'HARMAN', categoryName: 'AI', pageNumber: 1 });
    expect(query).not.toHaveProperty('companyIds');
    expect(serializeCandidateJobSearchState(state).has('company')).toBe(false);
  });

  it('maps URL state to the completed backend search contract', () => {
    const query = toCandidatePublicJobQuery(
      parseCandidateJobSearchParams(
        new URLSearchParams('q=react&workMode=remote&department=Engineering&sort=recommended'),
      ),
    );

    expect(query).toMatchObject({
      departments: ['Engineering'],
      keyword: 'react',
      pageNumber: 1,
      pageSize: 10,
      sortBy: PublicJobSort.Recommended,
      sortDirection: 'desc',
      workModes: [WorkplaceType.Remote],
    });
  });

  it('drops unsupported values and invalid ranges instead of sending them to the backend', () => {
    const state = parseCandidateJobSearchParams(
      new URLSearchParams(
        'workMode=spaceship&duration=4&freshness=2&minExperience=10&maxExperience=2',
      ),
    );

    expect(state.workModes).toEqual([]);
    expect(state.internshipDurationMonths).toEqual([]);
    expect(state.freshnessDays).toBeUndefined();
    expect(state.minExperienceYears).toBe(10);
    expect(state.maxExperienceYears).toBeUndefined();
  });
});
