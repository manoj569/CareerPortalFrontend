import { describe, expect, it } from 'vitest';

import { EmploymentType, ExperienceLevel, WorkplaceType } from '@/features/jobs/types/jobModels';
import { buildComposeJobRequest, type ComposeJobFormValues } from './AdminComposeJobForm';

const values: ComposeJobFormValues = {
  title: '  Platform Engineer  ',
  description: '',
  applicationUrl: '',
  employmentType: EmploymentType.FullTime,
  workMode: WorkplaceType.Hybrid,
  experienceLevel: ExperienceLevel.Senior,
  location: '',
  minimumSalary: null,
  maximumSalary: null,
  currency: '',
  closingDateUtc: '',
  responsibilities: '',
  requirements: '',
  benefits: '',
  companyName: ' New Co ',
  companyWebsiteUrl: '',
  companyIndustry: '',
  companyLocation: '',
  companyDescription: '',
  companyLogoUrl: '',
  companyEmployeeCount: null,
  companyIsVerified: false,
  categoryName: ' New Category ',
  categoryDescription: '',
  categoryDisplayOrder: 0,
  recruiterName: '',
  recruiterRole: '',
  recruiterEmail: '',
  recruiterPhoneNumber: '',
  recruiterSharingApproved: false,
};

describe('buildComposeJobRequest', () => {
  it('always uses inline relationships and normalizes optional values', () => {
    expect(buildComposeJobRequest(values)).toEqual({
      job: {
        title: 'Platform Engineer',
        description: null,
        applicationUrl: null,
        employmentType: EmploymentType.FullTime,
        workMode: WorkplaceType.Hybrid,
        experienceLevel: ExperienceLevel.Senior,
        location: null,
        minimumSalary: null,
        maximumSalary: null,
        currency: null,
        closingDateUtc: null,
        responsibilities: null,
        requirements: null,
        benefits: null,
      },
      company: {
        existingId: null,
        new: {
          name: 'New Co',
          slug: null,
          description: null,
          websiteUrl: null,
          logoUrl: null,
          industry: null,
          location: null,
          employeeCount: null,
          isVerified: false,
        },
      },
      category: {
        existingId: null,
        new: {
          name: 'New Category',
          slug: null,
          description: null,
          displayOrder: 0,
          parentCategoryId: null,
        },
      },
      recruiterContact: null,
    });
  });

  it('includes an approved recruiter contact when provided', () => {
    expect(
      buildComposeJobRequest({
        ...values,
        recruiterName: '  Priya Sharma ',
        recruiterRole: ' Talent Partner ',
        recruiterEmail: ' recruiter@example.com ',
        recruiterPhoneNumber: ' +91 99999 00000 ',
        recruiterSharingApproved: true,
      }).recruiterContact,
    ).toEqual({
      name: 'Priya Sharma',
      role: 'Talent Partner',
      email: 'recruiter@example.com',
      phoneNumber: '+91 99999 00000',
      sharingApproved: true,
    });
  });
});
