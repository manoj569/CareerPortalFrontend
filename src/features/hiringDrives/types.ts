export interface HiringDriveCompanyDto {
  id: string;
  name: string;
  logoUrl: string | null;
}
export type HiringDriveBadgeType = 'hiring' | 'walkIn' | 'openings' | 'featured';
export type HiringDriveDestinationType = 'internalJob' | 'external';
export type HiringDriveDestinationDto =
  | { type: 'internalJob'; jobId: string; url?: never }
  | { type: 'external'; url: string; jobId?: never };
export interface HiringDrive {
  id: string;
  title: string;
  subtitle: string | null;
  badgeText: string | null;
  badgeType: HiringDriveBadgeType | null;
  company: HiringDriveCompanyDto | null;
  imageUrl: string | null;
  locationText: string | null;
  experienceText: string | null;
  isSponsored: boolean;
  description?: string | null;
  startAtUtc?: string | null;
  endAtUtc?: string | null;
  destination: HiringDriveDestinationDto;
}
export type HiringDestination =
  | { destinationType: 'internalJob'; jobId: string; jobSlug: string; url?: never }
  | { destinationType: 'external'; url: string; jobId?: never };
export interface HiringDriveAdminCampaign {
  title: string;
  startAtUtc: string;
  companyId?: string | null;
  subtitle?: string | null;
  description?: string | null;
  badgeText?: string | null;
  badgeType?: HiringDriveBadgeType | null;
  imageUrl?: string | null;
  locationText?: string | null;
  experienceText?: string | null;
  jobId?: string | null;
  applyUrl?: string | null;
  endAtUtc?: string | null;
  displayOrder?: number;
  isActive?: boolean;
  isSponsored?: boolean;
  showOnHome: boolean;
}
export interface AdminHiringDrive {
  id: string;
  campaign: HiringDriveAdminCampaign;
  impressionCount: number;
  clickCount: number;
  ctr: number;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  createdByUserId: string | null;
  updatedByUserId: string | null;
}
export type HiringDriveInput = HiringDriveAdminCampaign;
export interface HiringDrivePage<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
