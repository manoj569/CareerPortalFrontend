import axios from 'axios';
import { describe, expect, it, vi } from 'vitest';

import { applyApiValidationErrors } from './formErrors';
import { transformApiError } from './apiError';

describe('shared API error integration', () => {
  it('preserves backend validation fields while replacing unsafe server messages', () => {
    const error = new axios.AxiosError('Request failed', undefined, undefined, undefined, {
      config: { headers: new axios.AxiosHeaders() },
      data: {
        code: 'validation_error',
        errors: { FirstName: ['First name is required.'] },
        message: 'Validation failed.',
      },
      headers: {},
      status: 400,
      statusText: 'Bad Request',
    });

    expect(transformApiError(error)).toMatchObject({
      code: 'validation_error',
      errors: { FirstName: ['First name is required.'] },
      message: 'Validation failed.',
      status: 400,
    });
  });

  it('maps backend field names case-insensitively to form fields', () => {
    const setError = vi.fn();
    const applied = applyApiValidationErrors<{ firstName: string }>(
      {
        errors: { FirstName: ['First name is required.'] },
        status: 400,
      },
      ['firstName'],
      setError,
    );

    expect(applied).toBe(true);
    expect(setError).toHaveBeenCalledWith('firstName', {
      message: 'First name is required.',
      type: 'server',
    });
  });

  it('returns safe guidance for network and server failures', () => {
    const networkError = transformApiError(new axios.AxiosError('Network Error'));
    expect(networkError).toMatchObject({
      code: 'network_error',
    });
    expect(networkError.message).toContain('could not be reached');

    const serverError = new axios.AxiosError(
      'SQL connection details',
      undefined,
      undefined,
      undefined,
      {
        config: { headers: new axios.AxiosHeaders() },
        data: { message: 'Sensitive upstream details' },
        headers: {},
        status: 500,
        statusText: 'Internal Server Error',
      },
    );
    expect(transformApiError(serverError).message).toBe(
      'The service is temporarily unavailable. Please try again later.',
    );
  });
});
