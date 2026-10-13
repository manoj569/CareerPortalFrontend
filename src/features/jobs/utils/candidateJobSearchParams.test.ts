import { describe, expect, it } from 'vitest';

import { PublicJobSort, WorkplaceType } from '../types/jobModels';
import {
  countCandidateJobFilters,
  parseCandidateJobSearchParams,
  serializeCandidateJobSearchState,
  toCandidatePublicJobQuery,
} from './candidateJobSearchParams';

describe('Candidate job search URL state', () => {
  it('round-trips canonical repeated facets from shared URLs', () => {
    const params = new URLSearchParams(
      'roleCategories=Software&roleCategories=Product&locations=Pune&locations=Mumbai&departments=Engineering&educationRequirements=Any+Graduate&page=4',
    );
    const state = parseCandidateJobSearchParams(params);
    expect(toCandidatePublicJobQuery(state)).toMatchObject({
      roleCategories: ['Software', 'Product'],
      locations: ['Pune', 'Mumbai'],
      departments: ['Engineering'],
      educationRequirements: ['Any Graduate'],
      pageNumber: 4,
    });
    expect(parseCandidateJobSearchParams(serializeCandidateJobSearchState(state))).toEqual(state);
    expect(countCandidateJobFilters(state)).toBe(6);
  });
  it('round-trips the nine retained filter groups and pagination', () => {
    const params = new URLSearchParams(
      'q=react&categoryName=Artificial%20Intelligence&workMode=remote&workMode=hybrid&companyType=startup&department=Engineering&education=B.Tech&location=Pune&minExperience=1&maxExperience=3&minAmount=500000&maxAmount=2500000&freshness=7&sort=closing&page=2',
    );
    const state = parseCandidateJobSearchParams(params);

    expect(state).toMatchObject({
      categoryName: 'Artificial Intelligence',
      companyTypes: [],
      departments: ['Engineering'],
      educationRequirements: ['B.Tech'],
      freshnessDays: 7,
      keyword: 'react',
      locations: ['Pune'],
      maxAmount: 2_500_000,
      maxExperienceYears: 3,
      minAmount: 500_000,
      minExperienceYears: 1,
      page: 2,
      sort: 'closing',
      workModes: [WorkplaceType.Remote, WorkplaceType.Hybrid],
    });
    const serialized = serializeCandidateJobSearchState(state);
    expect(serialized.getAll('workMode')).toEqual(['remote', 'hybrid']);
    expect(serialized.get('categoryName')).toBe('Artificial Intelligence');
    expect(serialized.get('maxAmount')).toBe('2500000');
  });

  it('removes stale URL values for filters deleted from Candidate Browse Jobs', () => {
    const state = parseCandidateJobSearchParams(
      new URLSearchParams(
        'companyName=HARMAN&employmentType=internship&featured=true&duration=3&flexibleDuration=true&roleCategory=Software&postedBy=company&industry=Technology&categoryName=AI',
      ),
    );
    const serialized = serializeCandidateJobSearchState(state);
    const query = toCandidatePublicJobQuery(state);

    expect(serialized.get('categoryName')).toBe('AI');
    [
      'companyName',
      'featured',
      'duration',
      'flexibleDuration',
      'roleCategory',
      'postedBy',
      'industry',
    ].forEach((name) => expect(serialized.has(name)).toBe(false));
    expect(query).not.toHaveProperty('companyName');
    expect(query).not.toHaveProperty('featuredOnly');
    expect(query.roleCategories).toBeUndefined();
  });

  it('maps retained URL state to the backend query and de-duplicates text facets', () => {
    const query = toCandidatePublicJobQuery(
      parseCandidateJobSearchParams(
        new URLSearchParams(
          'q=react&workMode=remote&department=Engineering&department=%20engineering%20&location=Pune&location=%20pune%20&sort=recommended',
        ),
      ),
    );

    expect(query).toMatchObject({
      departments: ['Engineering'],
      keyword: 'react',
      locations: ['Pune'],
      pageNumber: 1,
      pageSize: 10,
      sortBy: PublicJobSort.Recommended,
      sortDirection: 'desc',
      workModes: [WorkplaceType.Remote],
    });
  });

  it('drops unsupported values and invalid ranges instead of sending them to the backend', () => {
    const state = parseCandidateJobSearchParams(
      new URLSearchParams('workMode=spaceship&freshness=2&minExperience=10&maxExperience=2'),
    );

    expect(state.workModes).toEqual([]);
    expect(state.freshnessDays).toBeUndefined();
    expect(state.minExperienceYears).toBe(10);
    expect(state.maxExperienceYears).toBeUndefined();
  });

  it('normalizes the UI upper endpoints to unbounded backend maxima', () => {
    const state = parseCandidateJobSearchParams(
      new URLSearchParams('minExperience=2&maxExperience=45&minAmount=100000&maxAmount=5000000'),
    );
    const query = toCandidatePublicJobQuery(state);

    expect(query.minExperienceYears).toBe(2);
    expect(query.maxExperienceYears).toBeUndefined();
    expect(query.minAmount).toBe(100_000);
    expect(query.maxAmount).toBeUndefined();
    expect(serializeCandidateJobSearchState(state).has('maxExperience')).toBe(false);
    expect(serializeCandidateJobSearchState(state).has('maxAmount')).toBe(false);
  });

  it('counts only retained visible filters', () => {
    const state = parseCandidateJobSearchParams(
      new URLSearchParams(
        'categoryName=AI&workMode=remote&companyType=startup&department=Engineering&education=B.Tech&location=Pune&minExperience=1&maxExperience=3&minAmount=500000&freshness=7',
      ),
    );

    expect(countCandidateJobFilters(state)).toBe(8);
  });
});
