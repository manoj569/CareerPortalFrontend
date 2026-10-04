import { apiClient } from '@/api/apiClient';
import { adminApi } from '@/features/admin/api/adminApi';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type { SupportCategory, SupportStatus, SupportTicket } from '../supportApi';

export const adminSupportRoutes = { list: '/admin/support', detail: '/admin/support/:id' } as const;
export const adminSupportPath = (id: string) =>
  `${adminSupportRoutes.list}/${encodeURIComponent(id)}`;
export interface AdminSupportTicket extends SupportTicket {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  adminNotes: string | null;
}
export interface AdminSupportQuery {
  PageNumber: number;
  PageSize: number;
  Status?: SupportStatus;
  Category?: SupportCategory;
  Email?: string;
  TicketNumber?: string;
  FromUtc?: string;
  ToUtc?: string;
}
const root = '/admin/support/tickets';
// Extends the existing authenticated admin API, including its session-reset behavior.
export const adminSupportApi = adminApi
  .enhanceEndpoints({ addTagTypes: ['SupportTickets'] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getAdminSupportTickets: builder.query<
        PaginatedResponse<AdminSupportTicket>,
        AdminSupportQuery
      >({
        query: (params) => ({ url: root, params }),
        transformResponse: (response: ApiResponse<PaginatedResponse<AdminSupportTicket>>) =>
          response.data,
        providesTags: [{ type: 'SupportTickets', id: 'LIST' }],
        keepUnusedDataFor: 0,
      }),
      getAdminSupportTicket: builder.query<AdminSupportTicket, string>({
        query: (id) => ({ url: `${root}/${encodeURIComponent(id)}` }),
        transformResponse: (response: ApiResponse<AdminSupportTicket>) => response.data,
        keepUnusedDataFor: 0,
      }),
      updateAdminSupportStatus: builder.mutation<
        AdminSupportTicket,
        { id: string; status: SupportStatus }
      >({
        query: ({ id, status }) => ({
          url: `${root}/${encodeURIComponent(id)}/status`,
          method: 'PATCH',
          data: { status },
        }),
        transformResponse: (response: ApiResponse<AdminSupportTicket>) => response.data,
        async onQueryStarted({ id }, { dispatch, queryFulfilled }): Promise<void> {
          try {
            const { data } = await queryFulfilled;
            dispatch(adminSupportApi.util.updateQueryData('getAdminSupportTicket', id, () => data));
          } catch {
            /* Failed updates leave the saved ticket intact. */
          }
        },
        invalidatesTags: (result) => (result ? [{ type: 'SupportTickets', id: 'LIST' }] : []),
      }),
      updateAdminSupportNotes: builder.mutation<
        AdminSupportTicket,
        { id: string; adminNotes: string | null }
      >({
        query: ({ id, adminNotes }) => ({
          url: `${root}/${encodeURIComponent(id)}/notes`,
          method: 'PATCH',
          data: { adminNotes },
        }),
        transformResponse: (response: ApiResponse<AdminSupportTicket>) => response.data,
        async onQueryStarted({ id }, { dispatch, queryFulfilled }): Promise<void> {
          try {
            const { data } = await queryFulfilled;
            dispatch(adminSupportApi.util.updateQueryData('getAdminSupportTicket', id, () => data));
          } catch {
            /* Failed updates leave the saved ticket intact. */
          }
        },
        invalidatesTags: (result) => (result ? [{ type: 'SupportTickets', id: 'LIST' }] : []),
      }),
    }),
  });
export const {
  useGetAdminSupportTicketsQuery,
  useGetAdminSupportTicketQuery,
  useUpdateAdminSupportStatusMutation,
  useUpdateAdminSupportNotesMutation,
} = adminSupportApi;

// Blobs stay out of the Redux cache; only an authorized, temporary object URL is displayed.
export async function getAdminSupportScreenshot(id: string, signal: AbortSignal): Promise<Blob> {
  const response = await apiClient.request<Blob>({
    url: `${root}/${encodeURIComponent(id)}/screenshot`,
    responseType: 'blob',
    signal,
  });
  return response.data;
}
export function adminSupportError(error: unknown): string {
  const status = error && typeof error === 'object' && 'status' in error ? error.status : undefined;
  if (status === 409)
    return 'This request changed while you were saving. Reload the latest ticket, review your changes, and try again.';
  if (status === 400 || status === 422) return 'Please check your inputs and try again.';
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'Administrator access is required.';
  if (status === 404) return 'This support request could not be found.';
  if (status === 429) return 'Too many requests. Please wait a few minutes and try again.';
  return 'We could not complete this request. Please try again.';
}
