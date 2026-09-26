import { AxiosError, type AxiosAdapter } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from './apiClient';
import { axiosBaseQuery } from './axiosBaseQuery';

const originalAdapter = apiClient.defaults.adapter;
afterEach(() => { apiClient.defaults.adapter = originalAdapter; });

describe('Axios base query HTTP status policy', () => {
  it.each([undefined, (status: number) => status === 402, null])('preserves default or explicit validation: %s', async validateStatus => {
    const adapter = vi.fn<AxiosAdapter>(config => {
      const response = { config, data: { message: 'Membership required' }, headers: {}, status: 402, statusText: 'Payment Required' };
      if (config.validateStatus && !config.validateStatus(response.status)) {
        return Promise.reject(new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, undefined, response));
      }
      return Promise.resolve(response);
    });
    apiClient.defaults.adapter = adapter;
    const result = await axiosBaseQuery()({ url: '/test-status', validateStatus }, { signal: new AbortController().signal, dispatch: vi.fn() });
    if (validateStatus === undefined) expect(result.error).toMatchObject({ status: 402 });
    else expect(result.data).toEqual({ message: 'Membership required' });
    expect(adapter).toHaveBeenCalledTimes(1);
  });
});
