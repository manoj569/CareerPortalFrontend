import type { PaymentStatus } from '@/features/payments/types/paymentModels';
export interface ResumeAnalysis {
  overallMatchScore: number;
  matchedSkills: string[];
  partialMatches: string[];
  missingSkills: string[];
  jobRequirements: string[];
  strengths: string[];
  areasToImprove: string[];
  suggestions: string[];
}
export interface ResumeContent {
  contact: { name: string; email: string; phone: string; location: string; links: string[] };
  professionalSummary: string;
  skills: string[];
  experience: {
    employer: string;
    role: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }[];
  projects: { name: string; technologies: string[]; bullets: string[] }[];
  education: { institution: string; qualification: string; startDate: string; endDate: string }[];
  certifications: { name: string; issuer: string; date: string }[];
  additionalInfo: string[];
  evidence: { path: string; text: string; sourceEvidenceIds: string[] }[];
}
export interface ResumeSession {
  id: string;
  sourceResumeId: string;
  jobId: string | null;
  sourceType: string;
  jobTitle: string;
  companyName: string;
  status: number;
  analysis: ResumeAnalysis | null;
  tailoredResumeId: string | null;
  documentCapabilities: ResumeDocumentCapabilities | null;
}
export interface TailoredResume {
  id: string;
  sessionId: string;
  version: number;
  editRevision: number;
  templateCode: string;
  generatedAtUtc: string;
  updatedAtUtc: string | null;
  content: ResumeContent;
  tailoring: ResumeTailoringReview | null;
  documentCapabilities: ResumeDocumentCapabilities | null;
}
export interface ResumeDocumentCapabilities {
  preservationMode: string;
  originalFileType: string;
  layoutPreserved: boolean;
  defaultDownloadFormat: DownloadFormat;
  downloadFormats: DownloadFormat[];
  limitation: string | null;
}
export interface ResumeTextReplacement {
  targetId: string;
  originalText: string;
  replacementText: string;
  sourceEvidenceIds: string[];
  matchedJdTerms: string[];
  reason: string;
}
export interface ResumeReplacementDecision {
  proposal: ResumeTextReplacement;
  status: 'accepted' | 'rejected' | 'original' | 'edited';
  rejectionCategory: string | null;
  rejectionReason: string | null;
  editedText: string | null;
}
export interface ResumeTailoringReview {
  replacements: ResumeReplacementDecision[];
  emphasizedSkillEvidenceIds: string[];
}
export type ReplacementReviewAction = 'accept' | 'original' | 'edit' | 'reset';
export type ReplacementReviewActionRequest =
  | { action: 'edit'; replacementText: string }
  | { action: Exclude<ReplacementReviewAction, 'edit'>; replacementText?: never };
export type ReplacementReviewRequest = {
  expectedRevision: number;
} & ReplacementReviewActionRequest;
export interface ResumeCredits {
  balance: number;
  reserved: number;
  lifetimePurchased: number;
  lifetimeConsumed: number;
}
export interface ResumePackage {
  code: string;
  name: string;
  price: number;
  credits: number;
  isPopular: boolean;
  currencyCode: string;
  pricePerResume: number;
}
export interface ResumePurchase {
  paymentId: string;
  merchantOrderId: string;
  redirectUrl: string | null;
  amount: number;
  currencyCode: string;
  credits: number;
  packageCode: string;
  status: PaymentStatus;
  returnTo: string | null;
}
export interface CreateResumeSession {
  sourceResumeId: string;
  jobId?: string;
  externalJobDescription?: string;
  jobTitle?: string;
  companyName?: string;
}
export type DownloadFormat = 'pdf' | 'docx' | 'txt';
