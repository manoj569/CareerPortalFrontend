import { useRef, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { guidanceError, guidanceErrorMessage } from '../utils/errors';

export const useGuidanceAction = () => {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [retryAt, setRetryAt] = useState(0);
  const execute = async <T,>(operation: () => Promise<T>, success?: string): Promise<T | undefined> => {
    if (lock.current || Date.now() < retryAt) return undefined;
    lock.current = true; setBusy(true); setError(null); setConflict(false);
    try {
      const result = await operation();
      if (success) enqueueSnackbar(success, { variant: 'success' });
      return result;
    } catch (caught) {
      const details = guidanceError(caught);
      setError(guidanceErrorMessage(caught));
      setConflict(details.status === 409);
      if (details.status === 429) setRetryAt(Date.now() + (details.retryAfterSeconds ?? 60) * 1000);
      return undefined;
    } finally { lock.current = false; setBusy(false); }
  };
  return { busy, error, conflict, execute, clearError: () => { setError(null); setConflict(false); } };
};
