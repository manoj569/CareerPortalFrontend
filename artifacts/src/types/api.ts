export interface ApiResponse<T> {
  data: T;
  message?: string | null;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
  retryAfterSeconds?: number;
  redirectToMembership?: boolean; // Add this
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
