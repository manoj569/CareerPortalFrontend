import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { selectCurrentUser } from '@/features/auth/store/authSlice';
import { jobSourcesApi } from '../api/jobSourcesApi';
import { isActiveJobSourceRun, type DurableJobSourceRun } from '../types/jobSourceModels';

interface Reference {
  sourceId: string;
  runId: string;
  company: string;
}
export interface TrackedSourceRun extends Reference {
  run?: DurableJobSourceRun;
  error?: string;
}
interface Task {
  cancelled: boolean;
  timer?: ReturnType<typeof setTimeout>;
  abort?: () => void;
}
const valid = (run: DurableJobSourceRun, ref: Reference) =>
  run?.runId === ref.runId &&
  run.jobSourceId === ref.sourceId &&
  ['Queued', 'Running', 'Interrupted', 'Succeeded', 'Failed'].includes(run.status) &&
  typeof run.retryPending === 'boolean';

export const useJobSourceRuns = (onTerminal: (entry: TrackedSourceRun) => void) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const key = user?.id ? `careerharbor:job-source-runs:${user.id}` : null;
  const [entries, setEntries] = useState<Record<string, TrackedSourceRun>>({});
  const references = useRef<Record<string, Reference>>({});
  const tasks = useRef(new Map<string, Task>());
  const callback = useRef(onTerminal);
  useEffect(() => {
    callback.current = onTerminal;
  }, [onTerminal]);
  const persist = useCallback(() => {
    if (!key) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(Object.values(references.current)));
    } catch {
      /* Storage unavailable: monitoring still works until refresh. */
    }
  }, [key]);
  const watch = useCallback(
    (reference: Reference, initial?: DurableJobSourceRun) => {
      const previous = tasks.current.get(reference.sourceId);
      if (previous) {
        previous.cancelled = true;
        clearTimeout(previous.timer);
        previous.abort?.();
      }
      const task: Task = { cancelled: false };
      tasks.current.set(reference.sourceId, task);
      references.current[reference.sourceId] = reference;
      persist();
      setEntries((current) => ({
        ...current,
        [reference.sourceId]: { ...reference, run: initial },
      }));
      let errors = 0;
      const poll = async () => {
        const query = dispatch(
          jobSourcesApi.endpoints.getJobSourceRun.initiate(
            { sourceId: reference.sourceId, runId: reference.runId },
            { subscribe: false, forceRefetch: true },
          ),
        );
        task.abort = () => query.abort();
        try {
          const run = await query.unwrap();
          if (task.cancelled) return;
          if (!valid(run, reference)) throw new Error('Invalid run status response.');
          errors = 0;
          const entry = { ...reference, run };
          setEntries((current) => ({ ...current, [reference.sourceId]: entry }));
          if (!isActiveJobSourceRun(run)) {
            task.cancelled = true;
            tasks.current.delete(reference.sourceId);
            delete references.current[reference.sourceId];
            persist();
            dispatch(jobSourcesApi.util.invalidateTags(['JobSources', 'AdminJobs', 'Statistics']));
            callback.current(entry);
            return;
          }
          task.timer = setTimeout(() => void poll(), 2000);
        } catch (error) {
          if (task.cancelled) return;
          const failure = error as { status?: number; message?: string };
          errors++;
          const stop =
            failure.status === 401 ||
            failure.status === 403 ||
            failure.status === 404 ||
            errors >= 5;
          setEntries((current) => ({
            ...current,
            [reference.sourceId]: {
              ...current[reference.sourceId]!,
              error: `${failure.message ?? 'Unable to retrieve run status.'} ${stop ? 'Monitoring paused. Retry status checking after resolving the error.' : 'Retrying status checking.'} The run outcome is not confirmed.`,
            },
          }));
          if (!stop)
            task.timer = setTimeout(() => void poll(), Math.min(30000, 2000 * 2 ** errors));
        }
      };
      void poll();
    },
    [dispatch, persist],
  );
  useEffect(() => {
    setEntries({});
    references.current = {};
    if (key) {
      try {
        const stored: unknown = JSON.parse(sessionStorage.getItem(key) ?? '[]');
        if (Array.isArray(stored))
          for (const value of stored) {
            const ref = value as Partial<Reference>;
            if (
              typeof ref.sourceId === 'string' &&
              typeof ref.runId === 'string' &&
              typeof ref.company === 'string'
            )
              watch(ref as Reference);
          }
      } catch {
        /* Corrupt saved references are not trusted. */
      }
    }
    const activeTasks = tasks.current;
    return () => {
      for (const task of activeTasks.values()) {
        task.cancelled = true;
        clearTimeout(task.timer);
        task.abort?.();
      }
      activeTasks.clear();
    };
  }, [key, watch]);
  const track = (company: string, run: DurableJobSourceRun) => {
    const reference = { company, sourceId: run.jobSourceId, runId: run.runId };
    if (!run.runId || !valid(run, reference))
      throw new Error('The server did not return a valid durable run. The outcome is unknown.');
    // Even a terminal POST snapshot must be verified through persisted GET status.
    watch(reference, isActiveJobSourceRun(run) ? run : undefined);
  };
  const retry = (sourceId: string) => {
    const ref = references.current[sourceId];
    if (ref) watch(ref, entries[sourceId]?.run);
  };
  const active = (sourceId: string) => Boolean(references.current[sourceId]);
  return { entries, track, retry, active, accountKey: key };
};
