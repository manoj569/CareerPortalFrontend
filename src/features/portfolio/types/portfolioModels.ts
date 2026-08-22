import type { EmploymentType } from '@/features/jobs/types/jobModels';
import type { CandidateAvailability } from '@/features/dashboard/types/dashboardModels';

export type CandidatePortfolioStatus = 'Draft' | 'Published';
export type CandidatePortfolioTemplate = 'Professional' | 'Developer';
export type PortfolioSectionType =
  | 'About'
  | 'Skills'
  | 'Experience'
  | 'Education'
  | 'Projects'
  | 'Certifications'
  | 'ProfessionalLinks'
  | 'Resume'
  | 'CustomSections';
export type ProfessionalLinkType =
  | 'LinkedIn'
  | 'GitHub'
  | 'Portfolio'
  | 'Website'
  | 'Behance'
  | 'Dribbble'
  | 'Kaggle'
  | 'Other';

export const portfolioSectionTypes: PortfolioSectionType[] = [
  'About', 'Skills', 'Experience', 'Education', 'Projects', 'Certifications',
  'ProfessionalLinks', 'Resume', 'CustomSections',
];

export interface CreatePortfolioRequest {
  requestedSlug: string | null;
  template: CandidatePortfolioTemplate;
}

export interface PortfolioSectionSettingRequest {
  sectionType: PortfolioSectionType;
  isVisible: boolean;
  displayOrder: number;
}

export interface UpdatePortfolioSettingsRequest {
  slug: string;
  template: CandidatePortfolioTemplate;
  sections: PortfolioSectionSettingRequest[];
}

export interface PortfolioSectionSetting extends PortfolioSectionSettingRequest { id: string }

export interface ExperienceRequest {
  jobTitle: string; companyName: string; location: string | null;
  employmentType: EmploymentType | null; startDate: string; endDate: string | null;
  isCurrent: boolean; description: string | null; displayOrder: number;
  annualSalary?: number | null; skillsUsed?: string[] | null; noticePeriod?: CandidateAvailability | null;
}
export interface PortfolioExperience extends ExperienceRequest { id: string }

export interface EducationRequest {
  qualification: string; institution: string; fieldOfStudy: string | null;
  startYear: number | null; endYear: number | null; grade: string | null;
  description: string | null; displayOrder: number;
  courseType?: 'FullTime' | 'PartTime' | 'CorrespondenceOrDistance' | null;
  isCurrentlyStudying?: boolean; gradingSystem?: string | null;
}
export interface PortfolioEducation extends EducationRequest { id: string }

export interface ProjectRequest {
  name: string; role: string | null; description: string; technologies: string[];
  sourceUrl: string | null; liveUrl: string | null; startDate: string | null;
  endDate: string | null; displayOrder: number;
}
export interface PortfolioProject extends ProjectRequest { id: string }

export interface CertificationRequest {
  name: string; issuer: string | null; issuedDate: string | null; expiryDate: string | null;
  doesNotExpire: boolean; credentialId: string | null; credentialUrl: string | null;
  displayOrder: number;
}
export interface PortfolioCertification extends CertificationRequest { id: string }

export interface ProfessionalLinkRequest {
  type: ProfessionalLinkType; label: string | null; url: string; displayOrder: number;
}
export interface PortfolioProfessionalLink extends ProfessionalLinkRequest { id: string }

export interface CustomSectionRequest { title: string; displayOrder: number }
export interface CustomItemRequest {
  title: string; description: string | null; date: string | null; url: string | null;
  displayOrder: number;
}
export interface PortfolioCustomItem extends CustomItemRequest { id: string }
export interface PortfolioCustomSection extends CustomSectionRequest {
  id: string; items: PortfolioCustomItem[];
}

export interface PortfolioEditorResponse {
  isCreated: boolean; id: string | null; slug: string | null;
  status: CandidatePortfolioStatus | null; template: CandidatePortfolioTemplate | null;
  publishedAtUtc: string | null; displayName: string; resumeHeadline: string | null;
  profileSummary: string | null; skills: string[]; resumeAvailable: boolean;
  sectionSettings: PortfolioSectionSetting[]; experiences: PortfolioExperience[];
  education: PortfolioEducation[]; projects: PortfolioProject[];
  certifications: PortfolioCertification[]; professionalLinks: PortfolioProfessionalLink[];
  customSections: PortfolioCustomSection[];
}

export interface PortfolioPublishResponse {
  published: boolean;
  missingRequirements: string[];
  portfolio: PortfolioEditorResponse;
}

export interface PublicPortfolioCandidate {
  displayName: string; resumeHeadline?: string | null; profileSummary?: string | null;
}
export interface PublicPortfolioSections {
  skills?: string[] | null; experience?: PortfolioExperience[] | null;
  education?: PortfolioEducation[] | null; projects?: PortfolioProject[] | null;
  certifications?: PortfolioCertification[] | null;
  professionalLinks?: PortfolioProfessionalLink[] | null;
  customSections?: PortfolioCustomSection[] | null; resumeAvailable?: boolean | null;
}
export interface PublicPortfolioResponse {
  slug: string; template: CandidatePortfolioTemplate; publishedAtUtc: string | null;
  candidate: PublicPortfolioCandidate; sectionOrder: PortfolioSectionType[];
  sections: PublicPortfolioSections;
}

export type PortfolioCollectionName =
  | 'experiences' | 'education' | 'projects' | 'certifications' | 'links' | 'custom-sections';
