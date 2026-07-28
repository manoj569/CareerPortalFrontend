import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  configureFrontendErrorReporter,
  reportFrontendError,
  type FrontendErrorReporter,
} from './errorReporter';

describe('frontend error reporter boundary', () => {
  afterEach(() => {
    configureFrontendErrorReporter(null);
    vi.restoreAllMocks();
  });

  it('forwards an error with a frozen, allowlisted context', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const reporter = vi.fn<FrontendErrorReporter>();
    const error = new Error('render failed');
    configureFrontendErrorReporter(reporter);

    reportFrontendError(error, { boundary: 'route', routeStatus: 500 });

    expect(reporter).toHaveBeenCalledWith(error, {
      boundary: 'route',
      routeStatus: 500,
    });
    expect(Object.isFrozen(reporter.mock.calls[0]?.[1])).toBe(true);
  });

  it('does not let a monitoring provider replace the application fallback', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    configureFrontendErrorReporter(() => {
      throw new Error('provider failed');
    });

    expect(() =>
      reportFrontendError(new Error('application failed'), { boundary: 'application' }),
    ).not.toThrow();
  });
});
