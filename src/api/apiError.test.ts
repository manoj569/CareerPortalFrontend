import axios from 'axios';
import { describe, expect, it, vi } from 'vitest';

import { applyApiValidationErrors } from './formErrors';
import { extractApiError, transformApiError } from './apiError';

describe('shared API error integration', () => {
  it('retains trace and reason codes, normalizes field errors and redacts credentials', () => {
    const error = new axios.AxiosError(
      'Request failed with status code 400',
      undefined,
      undefined,
      undefined,
      {
        config: { headers: new axios.AxiosHeaders() },
        headers: {},
        status: 400,
        statusText: 'Bad Request',
        data: {
          message: 'Invalid public link ?token=private-value',
          code: 'validation_error',
          traceId: 'trace-123',
          errors: {
            '$.CareerPageUrl': ['Use a public page.'],
            Request: 'Try another URL.',
            Invalid: [{ unsafe: true }],
          },
          reasonCodes: { CareerPageUrl: ['RIPPLEHIRE_UNSAFE_URL'] },
        },
      },
    );
    expect(transformApiError(error)).toMatchObject({
      status: 400,
      code: 'validation_error',
      traceId: 'trace-123',
      message: 'Invalid public link ?token=[redacted]',
      errors: { '$.CareerPageUrl': ['Use a public page.'], Request: ['Try another URL.'] },
      reasonCodes: { CareerPageUrl: ['RIPPLEHIRE_UNSAFE_URL'] },
    });
  });
  it.each([
    null,
    undefined,
    'unexpected',
    [],
    { message: {}, errors: { CareerPageUrl: [null, 1, {}] }, traceId: {} },
  ])('handles malformed error payloads safely: %s', (error) => {
    expect(extractApiError(error).message).toBe('The request could not be completed.');
    expect(extractApiError(error).errors).toBeUndefined();
  });
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
