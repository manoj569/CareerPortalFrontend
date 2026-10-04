import { apiClient } from '@/api/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/types';

export const supportCategories = {
  Login: 'Login',
  Registration: 'Registration',
  Account: 'Account',
  Payment: 'Payment',
  Membership: 'Membership',
  JobApplication: 'Job Application',
  Referral: 'Referral',
  InterviewInsights: 'Interview Insights',
  TechnicalIssue: 'Technical Issue',
  Other: 'Other',
} as const;
export type SupportCategory = keyof typeof supportCategories;
export type SupportStatus = 'Open' | 'InProgress' | 'Resolved' | 'Closed';
export const supportStatusLabels: Record<SupportStatus, string> = {
  Open: 'Open',
  InProgress: 'In Progress',
  Resolved: 'Resolved',
  Closed: 'Closed',
};
export interface SupportTicket {
  ticketNumber: string;
  category: SupportCategory;
  subject: string;
  description: string;
  status: SupportStatus;
  hasScreenshot: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  resolvedAtUtc: string | null;
}
export const supportRoutes = {
  tickets: '/support/my-tickets',
  detail: '/support/my-tickets/:ticketNumber',
} as const;
export const ticketPath = (number: string) =>
  `${supportRoutes.tickets}/${encodeURIComponent(number)}`;
const root = '/support/tickets';
export const supportApi = {
  async create(data: FormData) {
    const response = await apiClient.request<ApiResponse<{ ticketNumber: string }>>({
      url: root,
      method: 'POST',
      data,
    });
    return response.data.data;
  },
  async list(pageNumber: number, signal: AbortSignal) {
    const response = await apiClient.request<ApiResponse<PaginatedResponse<SupportTicket>>>({
      url: `${root}/my`,
      params: { PageNumber: pageNumber, PageSize: 20 },
      signal,
    });
    return response.data.data;
  },
  async detail(number: string, signal: AbortSignal) {
    const response = await apiClient.request<ApiResponse<SupportTicket>>({
      url: `${root}/my/${encodeURIComponent(number)}`,
      signal,
    });
    return response.data.data;
  },
  async screenshot(number: string, signal: AbortSignal) {
    const response = await apiClient.request<Blob>({
      url: `${root}/my/${encodeURIComponent(number)}/screenshot`,
      responseType: 'blob',
      signal,
    });
    return response.data;
  },
};

export function screenshotError(file: File): string | null {
  if (
    !/\.(jpe?g|png|webp)$/i.test(file.name) ||
    !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
  )
    return 'Screenshot must be JPG, PNG or WebP.';
  if (file.size > 5 * 1024 * 1024) return 'Screenshot must be smaller than 5 MB.';
  if (!file.size) return 'Please select a non-empty screenshot.';
  return null;
}
export function supportError(error: unknown): string {
  const value = error && typeof error === 'object' ? error : {};
  const status = 'status' in value ? value.status : undefined;
  if (status === 429) return 'Too many support requests. Please wait a few minutes and try again.';
  if (status === 413) return 'Screenshot must be smaller than 5 MB.';
  if ('code' in value && value.code === 'invalid_screenshot')
    return 'Please upload a JPG, PNG or WebP image no larger than 5 MB.';
  if (status === 400 || status === 422) return 'Please check the highlighted fields.';
  if (status === 401) return 'Your session is no longer valid. Please sign in again.';
  if (status === 403) return 'You do not have permission to view this request.';
  if (status === 404) return 'This support request could not be found.';
  return "We couldn't complete your request right now. Please try again.";
}
