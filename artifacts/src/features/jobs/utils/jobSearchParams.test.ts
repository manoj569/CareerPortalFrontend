import { describe, expect, it } from 'vitest';

import { EmploymentType, ExperienceLevel, WorkplaceType } from '../types/jobModels';
import { parseJobSearchParams, serializeJobSearchState, toPublicJobQuery } from './jobSearchParams';

describe('job search query parameters', () => {
  it('parses and sanitizes supported filters', () => {
    const state = parseJobSearchParams(
      new URLSearchParams(
        'q=engineer&location=Pune&employmentType=full-time&workplaceType=remote&experienceLevel=senior&page=2&pageSize=20&sort=title-asc',
      ),
    );

    expect(state).toMatchObject({
      employmentType: EmploymentType.FullTime,
      experienceLevel: ExperienceLevel.Senior,
      location: 'Pune',
      page: 2,
      pageSize: 20,
      search: 'engineer',
      sort: 'title-asc',
      workplaceType: WorkplaceType.Remote,
    });
    expect(toPublicJobQuery(state)).toMatchObject({
      pageNumber: 2,
      sortBy: 'title',
      sortDirection: 'asc',
    });
  });

  it('rejects unsupported enum, sort, page, and page-size values', () => {
    const state = parseJobSearchParams(
      new URLSearchParams(
        'employmentType=executive-only&sort=unknown&page=-5&pageSize=1000&minimumSalary=-1',
      ),
    );

    expect(state.employmentType).toBeUndefined();
    expect(state.minimumSalary).toBeUndefined();
    expect(state.page).toBe(1);
    expect(state.pageSize).toBe(12);
    expect(state.sort).toBe('published-desc');
  });

  it('does not send a salary range the backend would reject', () => {
    const state = parseJobSearchParams(
      new URLSearchParams('minimumSalary=200000&maximumSalary=100000'),
    );

    expect(state.minimumSalary).toBe(200000);
    expect(state.maximumSalary).toBeUndefined();
    expect(toPublicJobQuery(state).maximumSalary).toBeUndefined();
  });

  it('round-trips shareable filter state', () => {
    const initial = parseJobSearchParams(
      new URLSearchParams('q=react&workplaceType=hybrid&maximumSalary=250000&page=3'),
    );
    const serialized = serializeJobSearchState(initial);

    expect(parseJobSearchParams(serialized)).toEqual(initial);
  });
});
