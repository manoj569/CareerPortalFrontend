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
      'q=react&workMode=remote&workMode=hybrid&companyType=startup&employmentType=internship&department=Engineering&location=Pune&minExperience=1&maxExperience=3&freshness=7&featured=true&sort=closing&page=2',
    );
    const state = parseCandidateJobSearchParams(params);

    expect(state).toMatchObject({
      companyTypes: [CompanyType.Startup],
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
