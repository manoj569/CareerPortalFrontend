import { useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';

export function journeyError(error: unknown) {
  const response = isAxiosError<{ code?: string }>(error) ? error.response : undefined;
  switch (response?.data?.code) {
    case 'accelerator_questions_unavailable':
      return 'Assessment questions are currently unavailable.';
    case 'accelerator_question_unavailable':
      return 'This assessment question is no longer available.';
    case 'accelerator_path_unavailable':
      return 'This learning path is currently unavailable.';
    case 'accelerator_dispatch_pending':
      return 'The tutor request is still processing. Refresh messages shortly.';
    case 'accelerator_dispatch_failed':
      return 'The tutor request failed. Edit your message before trying again.';
  }
  const status = response?.status;
  switch (status) {
    case 400:
      return 'Check your entries and try again.';
    case 401:
      return 'Your session expired. Sign in to continue.';
    case 403:
      return 'This action requires verified Accelerator access.';
    case 404:
      return 'This Accelerator resource is unavailable or has not been configured.';
    case 409:
      return 'The server state changed. Review the latest available progress and try again.';
    case 429:
      return 'Too many requests. Please try again shortly.';
    default:
      return status
        ? 'Accelerator is temporarily unavailable.'
        : 'Could not complete the request. Please try again.';
  }
}

export function useJourneyRead<T>(load: () => Promise<T>, key: string) {
  const [state, setState] = useState<{ key: string; value?: T; error?: string }>();
  const [revision, setRevision] = useState(0);
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  }, [load]);
  useEffect(() => {
    let current = true;
    void Promise.resolve()
      .then(() => loadRef.current())
      .then(
        (value) => {
          if (current) setState({ key, value });
        },
        (error: unknown) => {
          if (current) setState({ key, error: journeyError(error) });
        },
      );
    return () => {
      current = false;
    };
  }, [key, revision]);

  return {
    value: state?.key === key ? state.value : undefined,
    error: state?.key === key ? state.error : undefined,
    reload: () => {
      setState(undefined);
      setRevision((value) => value + 1);
    },
  };
}

export function useJourneyMutation() {
  const active = useRef(false);
  const keys = useRef(new Map<string, string>());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function run<T>(
    operation: string,
    execute: (key: string) => Promise<T>,
    onSuccess: (value: T) => void,
    onConflict?: () => void,
  ) {
    if (active.current) return;
    active.current = true;
    setPending(true);
    setError(undefined);
    try {
      const key = keys.current.get(operation) ?? crypto.randomUUID();
      keys.current.set(operation, key);
      const value = await execute(key);
      keys.current.delete(operation);
      onSuccess(value);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) onConflict?.();
      setError(journeyError(error));
    } finally {
      active.current = false;
      setPending(false);
    }
  }

  return { pending, error, run };
}
