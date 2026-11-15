export interface ApiResponse<T> {
  data: T;
  success?: boolean;
  message?: string | null;
  errors?: unknown;
}

export interface MarketDemand {
  activeJobCount: number;
  distinctCompanyCount: number;
  newJobs7Days: number;
  newJobs30Days: number;
  trendPercent: number | null;
  calculatedAtUtc: string;
}

export interface MarketSkillAssociation {
  id: string;
  name: string;
  jobCount: number;
  percentage: number;
}

export interface MarketCompanyDemand {
  id: string;
  name: string;
  activeJobCount: number;
}

export interface MarketPathCard {
  id: string;
  name: string;
  category: string;
  description: string;
  demand: MarketDemand;
  learningPathStatus: string;
  jobFilter: string;
  topAssociations: MarketSkillAssociation[];
}

export interface MarketPathDetail {
  path: MarketPathCard;
  associations: MarketSkillAssociation[];
  related: MarketSkillAssociation[];
  companies: MarketCompanyDemand[];
  aliases: string[];
}

export interface MarketSearchResult {
  careerPaths: MarketPathCard[];
  skillPaths: MarketPathCard[];
}

export interface MarketRecommendation {
  path: MarketPathCard;
  score: number;
  reason: string;
}

export interface MarketRoleGap {
  marketSkillId: string;
  skillName: string;
  requiredJobCount: number;
  percentageOfRoleJobs: number;
  publishedRoleExpectedProficiency: number | null;
  verifiedCandidateProficiency: number;
  gap: number | null;
}

export interface MarketPathQuery {
  search?: string;
  category?: string;
  location?: string;
  experience?: number;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export interface MarketSkillPathQuery extends MarketPathQuery {
  roleId?: string;
}

export type AcceleratorPathType = 'career' | 'skill';

export type AcceleratorLoadingState =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error';