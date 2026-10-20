import { act, cleanup, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAppStore } from '@/store/store';
import { UserRole } from '@/types';
import { ApiRequestError } from '@/api/apiError';
import { useJobSourceRuns, type TrackedSourceRun } from './useJobSourceRuns';
import { jobSourcesApi } from '../api/jobSourcesApi';
import type { DurableJobSourceRun } from '../types/jobSourceModels';
const { request } = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@/api/apiClient', () => ({ apiClient: { request } }));
const queued: DurableJobSourceRun = {
  runId: 'run-1',
  jobSourceId: 'source-1',
  status: 'Queued',
  statusUrl: 'https://untrusted.invalid/status',
  retryPending: false,
  attemptCount: 0,
  completedAtUtc: null,
  succeeded: false,
  error: null,
  totalReceived: 0,
  created: 0,
  matched: 0,
  skipped: 0,
  failed: 0,
};
const key = 'careerharbor:job-source-runs:admin-1';
const setup = (id = 'admin-1') => {
  const store = createAppStore({
    auth: {
      accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
      error: null,
      isSubmitting: false,
      status: 'authenticated',
      user: {
        id,
        email: 'admin@example.test',
        firstName: 'Test',
        lastName: 'Admin',
        role: UserRole.Administrator,
      },
    },
  });
  const terminal = vi.fn<(entry: TrackedSourceRun) => void>();
  const hook = renderHook(() => useJobSourceRuns(terminal), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
  return { ...hook, terminal, store };
};
beforeEach(() => {
  vi.useFakeTimers();
  request.mockReset();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const tick = async (ms = 0) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};
const wrapped = (run: DurableJobSourceRun) => ({ data: { data: run } });

describe('durable job-source monitoring', () => {
  it('does not claim success from a terminal POST snapshot before GET confirms it', async () => {
    request.mockImplementation(() => new Promise(() => {}));
    const h = setup();
    act(() =>
      h.result.current.track('Company', { ...queued, status: 'Succeeded', succeeded: true }),
    );
    await tick();
    expect(h.result.current.entries['source-1']?.run).toBeUndefined();
    expect(h.result.current.active('source-1')).toBe(true);
    expect(h.terminal).not.toHaveBeenCalled();
    h.unmount();
    h.store.dispatch(jobSourcesApi.util.resetApiState());
  });
  it('polls Queued then Running, uses the authenticated canonical URL, and stops after Succeeded', async () => {
    request
      .mockResolvedValueOnce(wrapped(queued))
      .mockResolvedValueOnce(wrapped({ ...queued, status: 'Running' }))
      .mockResolvedValueOnce(wrapped({ ...queued, status: 'Succeeded', succeeded: true }));
    const h = setup();
    act(() => h.result.current.track('Test company', queued));
    await tick();
    expect(h.result.current.active('source-1')).toBe(true);
    expect(h.terminal).not.toHaveBeenCalled();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/admin/job-sources/source-1/runs/run-1' }),
    );
    await tick(2000);
    expect(h.result.current.entries['source-1']?.run?.status).toBe('Running');
    await tick(2000);
    expect(h.result.current.active('source-1')).toBe(false);
    expect(h.terminal).toHaveBeenCalledTimes(1);
    await tick(60000);
    expect(request).toHaveBeenCalledTimes(3);
    expect(JSON.parse(sessionStorage.getItem(key)!)).toEqual([]);
    h.unmount();
    h.store.dispatch(jobSourcesApi.util.resetApiState());
  });
  it.each(['Failed', 'Interrupted', 'Unsafe', 'Cancelled'] as const)(
    'stops for terminal %s without reporting success',
    async (status) => {
      request.mockResolvedValue(wrapped({ ...queued, status, retryPending: false }));
      const h = setup();
      act(() => h.result.current.track('Company', queued));
      await tick();
      expect(h.result.current.entries['source-1']?.run?.status).toBe(status);
      expect(h.result.current.active('source-1')).toBe(false);
      expect(h.terminal.mock.calls[0]?.[0].run?.succeeded).toBe(false);
      await tick(60000);
      expect(request).toHaveBeenCalledTimes(1);
      h.unmount();
      h.store.dispatch(jobSourcesApi.util.resetApiState());
    },
  );
  it('keeps Paused active until a Workday continuation completes', async () => {
    request
      .mockResolvedValueOnce(wrapped({ ...queued, status: 'Paused', retryPending: true }))
      .mockResolvedValueOnce(wrapped({ ...queued, status: 'Succeeded', succeeded: true }));
    const h = setup();
    act(() => h.result.current.track('Company', queued));
    await tick();
    expect(h.result.current.active('source-1')).toBe(true);
    expect(h.terminal).not.toHaveBeenCalled();
    expect(h.result.current.entries['source-1']?.run?.status).toBe('Paused');
    await tick(2000);
    expect(h.result.current.active('source-1')).toBe(false);
    expect(h.terminal).toHaveBeenCalledTimes(1);
    h.unmount();
    h.store.dispatch(jobSourcesApi.util.resetApiState());
  });
  it('stops Interrupted retryPending polling, clears persistence and permits manual retry', async () => {
    request
      .mockResolvedValueOnce(wrapped({ ...queued, status: 'Interrupted', retryPending: true }))
      .mockResolvedValue(wrapped({ ...queued, status: 'Running' }));
    const h = setup();
    act(() => h.result.current.track('Company', queued));
    await tick();
    expect(h.result.current.active('source-1')).toBe(false);
    expect(h.terminal).toHaveBeenCalledTimes(1);
    expect(JSON.parse(sessionStorage.getItem(key)!)).toEqual([]);
    await tick(120000);
    expect(request).toHaveBeenCalledTimes(1);
    act(() => h.result.current.track('Company', queued));
    await tick();
    expect(h.result.current.entries['source-1']?.run?.status).toBe('Running');
    h.unmount();
    h.store.dispatch(jobSourcesApi.util.resetApiState());
  });
  it('restores the old AMD reference, stops on Interrupted and never locks another source', async () => {
    const sourceId = '87d11d70-fa95-4095-bf63-120ad1881273';
    const runId = '580e53bb-0a40-4cac-bb2d-188d39869a3c';
    sessionStorage.setItem(key, JSON.stringify([{ sourceId, runId, company: 'AMD' }]));
    request.mockResolvedValue(wrapped({ ...queued, jobSourceId: sourceId, runId,
      status: 'Interrupted', retryPending: true }));
    const h = setup();
    expect(h.result.current.active('autodesk')).toBe(false);
    await tick();
    expect(request).toHaveBeenCalledWith(expect.objectContaining({
      url: `/admin/job-sources/${sourceId}/runs/${runId}`,
    }));
    expect(h.result.current.active(sourceId)).toBe(false);
    expect(h.result.current.active('autodesk')).toBe(false);
    await tick(180000);
    expect(request).toHaveBeenCalledTimes(1);
    expect(JSON.parse(sessionStorage.getItem(key)!)).toEqual([]);
    h.unmount();
    h.store.dispatch(jobSourcesApi.util.resetApiState());
  });
  it('ignores an old run response after a replacement run for the same source', async () => {
    let resolveOld!: (value: unknown) => void;
    request.mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve; }))
      .mockResolvedValue(wrapped({ ...queued, runId: 'run-2', status: 'Running' }));
    const h = setup();
    act(() => h.result.current.track('Company', queued));
    await tick();
    act(() => h.result.current.track('Company', { ...queued, runId: 'run-2' }));
    await tick();
    resolveOld(wrapped({ ...queued, status: 'Succeeded' }));
    await tick();
    expect(h.result.current.entries['source-1']?.run?.runId).toBe('run-2');
    expect(h.result.current.active('source-1')).toBe(true);
    expect(h.terminal).not.toHaveBeenCalled();
    h.unmount();
    h.store.dispatch(jobSourcesApi.util.resetApiState());
  });
  it.each([401, 403])(
    'uses existing session-expiry handling for %i and stops polling',
    async (status) => {
      request.mockRejectedValue(new ApiRequestError({ status, message: 'Access denied' }));
      const h = setup();
      act(() => h.result.current.track('Company', queued));
      await tick();
      expect(h.store.getState().auth.user).toBeNull();
      expect(h.result.current.entries).toEqual({});
      await tick(60000);
      expect(request).toHaveBeenCalledTimes(1);
      expect(h.terminal).not.toHaveBeenCalled();
      expect(sessionStorage.getItem(key)).toContain('run-1');
      h.unmount();
      h.store.dispatch(jobSourcesApi.util.resetApiState());
    },
  );
  it.each([404])(
    'pauses on %i and keeps the unknown outcome locked until status retry',
    async (status) => {
      request
        .mockRejectedValueOnce(new ApiRequestError({ status, message: 'Access denied' }))
        .mockResolvedValue(wrapped({ ...queued, status: 'Failed' }));
      const h = setup();
      act(() => h.result.current.track('Company', queued));
      await tick();
      expect(h.result.current.entries['source-1']?.error).toContain('Monitoring paused');
      expect(h.result.current.active('source-1')).toBe(true);
      await tick(60000);
      expect(request).toHaveBeenCalledTimes(1);
      act(() => h.result.current.retry('source-1'));
      await tick();
      expect(h.result.current.active('source-1')).toBe(false);
      h.unmount();
      h.store.dispatch(jobSourcesApi.util.resetApiState());
    },
  );
  it('backs off 4/8/16/30 seconds then pauses after five polling failures', async () => {
    request.mockRejectedValue(new ApiRequestError({ status: 503, message: 'Unavailable' }));
    const h = setup();
    act(() => h.result.current.track('Company', queued));
    await tick();
    for (const delay of [4000, 8000, 16000, 30000]) await tick(delay);
    expect(request).toHaveBeenCalledTimes(5);
    expect(h.result.current.entries['source-1']?.error).toContain('Monitoring paused');
    await tick(60000);
    expect(request).toHaveBeenCalledTimes(5);
    expect(h.terminal).not.toHaveBeenCalled();
    h.unmount();
    h.store.dispatch(jobSourcesApi.util.resetApiState());
  });
  it('restores known run IDs after refresh and isolates administrator accounts', async () => {
    sessionStorage.setItem(
      key,
      JSON.stringify([{ sourceId: 'source-1', runId: 'run-1', company: 'Company' }]),
    );
    request.mockResolvedValue(wrapped({ ...queued, status: 'Running' }));
    const h = setup();
    await tick();
    expect(h.result.current.active('source-1')).toBe(true);
    h.unmount();
    h.store.dispatch(jobSourcesApi.util.resetApiState());
    const other = setup('admin-2');
    await tick();
    expect(other.result.current.active('source-1')).toBe(false);
    expect(request).toHaveBeenCalledTimes(1);
    other.unmount();
    other.store.dispatch(jobSourcesApi.util.resetApiState());
  });
  it('aborts in-flight status requests on unmount and ignores late completion', async () => {
    let resolve!: (value: unknown) => void;
    request.mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const h = setup();
    act(() => h.result.current.track('Company', queued));
    await tick();
    const signal = (request.mock.calls[0]?.[0] as { signal: AbortSignal }).signal;
    h.unmount();
    expect(signal.aborted).toBe(true);
    resolve(wrapped({ ...queued, status: 'Succeeded' }));
    await tick(60000);
    expect(h.terminal).not.toHaveBeenCalled();
    expect(request).toHaveBeenCalledTimes(1);
    h.store.dispatch(jobSourcesApi.util.resetApiState());
  });
});
