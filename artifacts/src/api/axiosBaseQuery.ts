import type { AxiosRequestConfig, Method, RawAxiosRequestHeaders, ResponseType } from 'axios';
import type { BaseQueryApi } from '@reduxjs/toolkit/query';

import { apiClient } from './apiClient';
import { toApiRequestError } from './apiError';

export interface AxiosBaseQueryError {
  status?: number;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
  retryAfterSeconds?: number;
  redirectToMembership?: boolean; // Add this
}

interface AxiosBaseQueryArgs {
  url: string;
  method?: Method;
  data?: unknown;
  headers?: RawAxiosRequestHeaders;
  params?: object;
  responseType?: ResponseType;
  validateStatus?: AxiosRequestConfig['validateStatus'];
}

export const axiosBaseQuery =
  () =>
  async (
    {
      data,
      headers,
      method = 'GET',
      params,
      responseType,
      url,
      validateStatus,
    }: AxiosBaseQueryArgs,
    { signal }: Pick<BaseQueryApi, 'dispatch' | 'signal'>,
  ) => {
    try {
      const response = await apiClient.request({
        data,
        headers,
        method,
        params,
        responseType,
        signal,
        url,
        validateStatus,
      });
      return { data: response.data as unknown };
    } catch (error: unknown) {
      const apiError = toApiRequestError(error);
      return {
        error: {
          code: apiError.code,
          errors: apiError.errors,
          message: apiError.message,
          retryAfterSeconds: apiError.retryAfterSeconds,
          status: apiError.status,
          redirectToMembership: apiError.redirectToMembership, // Add this
        } satisfies AxiosBaseQueryError,
      };
    }
  };