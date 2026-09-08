/* eslint-disable @typescript-eslint/consistent-type-imports, @typescript-eslint/no-unsafe-return */
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/renderWithProviders';
import {
  ExternalJobSiteSessionStatus,
  ExternalSessionCaptureStatus,
} from '@/features/aiApply/types/aiApplyModels';
import { AIApplyExternalConnectionsPage } from './AIApplyExternalConnectionsPage';

const api = vi.hoisted(() => ({
  cancel: vi.fn(),
  complete: vi.fn(),
  query: vi.fn(),
  refetch: vi.fn(),
  revoke: vi.fn(),
  start: vi.fn(),
}));

vi.mock('@/features/aiApply/api/aiApplyApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/aiApply/api/aiApplyApi')>();
  return {
    ...actual,
    useCancelExternalSessionCaptureMutation: () => [api.cancel, { isLoading: false }],
    useCompleteExternalSessionCaptureMutation: () => [api.complete, { isLoading: false }],
    useGetExternalSessionQuery: (site: number) => api.query(site),
    useRevokeExternalSessionMutation: () => [api.revoke, { isLoading: false, isError: false }],
    useStartExternalSessionCaptureMutation: () => [api.start, { isLoading: false }],
  };
});

const missing = () => ({
  data: undefined,
  error: { status: 404 },
  isError: true,
  isLoading: false,
  refetch: api.refetch,
});

const renderPage = () =>
  renderWithProviders(
    <MemoryRouter>
      <AIApplyExternalConnectionsPage />
    </MemoryRouter>,
  );

describe('Screen 17 external site connections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.query.mockImplementation(missing);
    api.refetch.mockResolvedValue({ data: undefined });
  });

  it('renders registered connection cards without credential or browser controls', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'External Site Connections' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'LinkedIn' })).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/password|otp|mfa|cookie|storage state/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /complete/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/cdp|websocket|storageState/i)).not.toBeInTheDocument();
  });

  it('starts a normal connection with reconnect false and shows unavailable truthfully', async () => {
    api.start.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          captureId: 'capture-id',
          status: ExternalSessionCaptureStatus.AwaitingCandidate,
          interactionAvailable: false,
          message: 'Secure sign-in connection for this site is not available yet.',
        }),
    });
    renderPage();
    const linkedin = screen.getByRole('heading', { name: 'LinkedIn' }).closest('article')!;
    fireEvent.click(within(linkedin).getByRole('button', { name: 'Connect' }));
    await waitFor(() => expect(api.start).toHaveBeenCalledWith({ site: 6, reconnect: false }));
    expect(await within(linkedin).findByText(/not available yet/i)).toBeInTheDocument();
    expect(within(linkedin).queryByRole('button', { name: /complete/i })).not.toBeInTheDocument();
  });

  it.each([
    ExternalJobSiteSessionStatus.RequiresReauthentication,
    ExternalJobSiteSessionStatus.Expired,
    ExternalJobSiteSessionStatus.Invalid,
  ])('offers an authorized reconnect state for status %s', async (status) => {
    api.query.mockImplementation((site: number) =>
      site === 6
        ? {
            data: { id: 'session-id', site, status, canRevoke: false },
            isError: false,
            isLoading: false,
            refetch: api.refetch,
          }
        : missing(),
    );
    api.start.mockReturnValue({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error('Unavailable'), {
            code: 'external_session_capture_unavailable',
          }),
        ),
    });
    renderPage();
    const linkedin = screen.getByRole('heading', { name: 'LinkedIn' }).closest('article')!;
    fireEvent.click(within(linkedin).getByRole('button', { name: 'Reconnect' }));
    await waitFor(() => expect(api.start).toHaveBeenCalledWith({ site: 6, reconnect: true }));
  });

  it('shows active metadata and revokes only after confirmation', async () => {
    api.query.mockImplementation((site: number) =>
      site === 6
        ? {
            data: {
              id: 'session-id',
              site,
              status: ExternalJobSiteSessionStatus.Active,
              expiresAtUtc: '2026-09-30T12:00:00Z',
              lastValidatedAtUtc: '2026-09-04T12:00:00Z',
              canRevoke: true,
            },
            isError: false,
            isLoading: false,
            refetch: api.refetch,
          }
        : missing(),
    );
    api.revoke.mockReturnValue({ unwrap: () => Promise.resolve() });
    renderPage();
    const linkedin = screen.getByRole('heading', { name: 'LinkedIn' }).closest('article')!;
    expect(within(linkedin).getByText('Connected')).toBeInTheDocument();
    fireEvent.click(within(linkedin).getByRole('button', { name: 'Disconnect' }));
    fireEvent.click(screen.getByRole('button', { name: 'Disconnect' }));
    await waitFor(() =>
      expect(api.revoke).toHaveBeenCalledWith({ sessionId: 'session-id', site: 6 }),
    );
    expect(api.refetch).toHaveBeenCalled();
  });

  it('never represents a revoked session as active', () => {
    api.query.mockImplementation((site: number) =>
      site === 6
        ? {
            data: { id: 'session-id', site, status: ExternalJobSiteSessionStatus.Revoked },
            isError: false,
            isLoading: false,
            refetch: api.refetch,
          }
        : missing(),
    );
    renderPage();
    const linkedin = screen.getByRole('heading', { name: 'LinkedIn' }).closest('article')!;
    expect(within(linkedin).getByText('Not connected')).toBeInTheDocument();
    expect(within(linkedin).queryByText('Connected')).not.toBeInTheDocument();
  });

  it('shows subscription failures safely instead of treating them as disconnected', () => {
    api.query.mockReturnValue({
      data: undefined,
      error: { status: 403, message: 'Forbidden' },
      isError: true,
      isLoading: false,
      refetch: api.refetch,
    });
    renderPage();
    expect(
      screen.getAllByText('Your current AI Apply subscription does not allow this action.'),
    ).toHaveLength(6);
    expect(screen.queryByRole('button', { name: 'Connect' })).not.toBeInTheDocument();
  });
});
