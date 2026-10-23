export interface ActiveJobPromotion {
  jobId: string;
  jobSlug: string;
  title: string;
  companyName: string;
  companyLogoUrl: string | null;
  bannerImageUrl: string | null;
  jobCategory: string | null;
  location: string | null;
  workplaceType: string | null;
  employmentType: string | null;
  minimumExperienceYears: number | null;
  maximumExperienceYears: number | null;
  educationRequirement: string | null;
  minimumSalary: number | null;
  maximumSalary: number | null;
  currencyCode: string | null;
  skills: string[];
  postedAtUtc: string | null;
  detailsUrl: string;
}

export interface JobPromotionConfiguration {
  jobId: string;
  jobSlug: string;
  jobTitle: string;
  isEnabled: boolean;
  isEligible: boolean;
  bannerImageUrl: string | null;
  startsAtUtc: string | null;
  endsAtUtc: string | null;
  displayPriority: number;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  createdByUserId: string | null;
  updatedByUserId: string | null;
}

export interface SaveJobPromotionRequest {
  isEnabled: boolean;
  startsAtUtc: string | null;
  endsAtUtc: string | null;
  displayPriority: number;
}

export interface JobPromotionPage {
  items: JobPromotionConfiguration[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
