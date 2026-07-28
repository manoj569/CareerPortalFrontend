export type FrontendErrorBoundary = 'application' | 'route';

export interface FrontendErrorContext {
  boundary: FrontendErrorBoundary;
  routeStatus?: number;
}

export type FrontendErrorReporter = (
  error: unknown,
  context: Readonly<FrontendErrorContext>,
) => void;

let configuredReporter: FrontendErrorReporter | null = null;

export const configureFrontendErrorReporter = (reporter: FrontendErrorReporter | null): void => {
  configuredReporter = reporter;
};

export const reportFrontendError = (error: unknown, context: FrontendErrorContext): void => {
  if (import.meta.env.DEV) {
    console.error('Captured frontend error', error, context);
  }

  try {
    configuredReporter?.(error, Object.freeze({ ...context }));
  } catch {
    // Monitoring must never replace the application's own error fallback.
  }
};
