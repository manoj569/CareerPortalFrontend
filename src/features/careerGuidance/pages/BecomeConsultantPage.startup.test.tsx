import { StrictMode } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { appTheme } from '@/theme/theme';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiRequestError } from '@/api/apiError';
import { renderWithProviders } from '@/test/renderWithProviders';
import BecomeConsultantPage from './BecomeConsultantPage';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { UserRole } from '@/types';

const { request } = vi.hoisted(() => ({ request: vi.fn<(config: { method?: string; url?: string }) => Promise<unknown>>() }));
vi.mock('@/api/apiClient', () => ({ apiClient: { request } }));
const draft = { data: { data: { id: 'draft', revision: 'r1', displayName: 'Test Consultant', accountEmail: 'test@example.test', status: 5 } } };
const failure = (status?: number) => new ApiRequestError({ status, message: 'Request failed' });
const posts = () => request.mock.calls.filter(([config]) => config.method === 'POST');
const page = <StrictMode><MemoryRouter><BecomeConsultantPage /></MemoryRouter></StrictMode>;

beforeEach(() => { request.mockReset(); });

describe('consultant draft startup', () => {
  it('uses GET 200 without creating a draft', async () => {
    request.mockResolvedValue(draft);
    renderWithProviders(page);
    expect(await screen.findByDisplayValue('Test Consultant')).toBeVisible();
    expect(posts()).toHaveLength(0);
  });

  it('creates once on 404 across StrictMode and re-renders, then refetches the form', async () => {
    let created = false;
    let complete: () => void = () => { throw new Error('POST not started'); };
    request.mockImplementation(({ method }: { method?: string }) => {
      if (method === 'POST') return new Promise((resolve) => { complete = () => { created = true; resolve(draft); }; });
      return created ? Promise.resolve(draft) : Promise.reject(failure(404));
    });
    const view = renderWithProviders(page);
    expect(await screen.findByText('Setting up your consultant profile…')).toBeVisible();
    view.rerender(<Provider store={view.store}><ThemeProvider theme={appTheme}><SnackbarProvider>{page}</SnackbarProvider></ThemeProvider></Provider>);
    expect(posts()).toHaveLength(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await act(async () => { complete(); await Promise.resolve(); });
    expect(await screen.findByDisplayValue('Test Consultant')).toBeVisible();
    expect(posts()).toHaveLength(1);
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ method: 'GET', url: '/career-guidance/me/onboarding' }));
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ method: 'POST', url: '/career-guidance/me/onboarding' }));
  });

  it.each([401, 403, 500, undefined])('does not create on GET error %s', async (status) => {
    request.mockRejectedValue(failure(status));
    if (status === 401) {
      // Match the real route: session expiry unmounts the protected query.
      renderWithProviders(<MemoryRouter initialEntries={['/start']}><Routes><Route element={<ProtectedRoute />}><Route path="/start" element={<BecomeConsultantPage />} /></Route><Route path="/login" element={<p>Sign in again</p>} /></Routes></MemoryRouter>, { auth: { status: 'authenticated', user: { id: 'owner', firstName: 'Test', lastName: 'Owner', email: 'test@example.test', role: UserRole.Candidate }, isSubmitting: false, error: null, accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z' } });
      expect(await screen.findByText('Sign in again')).toBeVisible();
    } else {
      renderWithProviders(page);
      expect(await screen.findByRole('alert')).toBeVisible();
    }
    expect(posts()).toHaveLength(0);
  });

  it('shows POST failure and permits a new attempt only after explicit Retry and another GET 404', async () => {
    let created = false;
    let attempts = 0;
    request.mockImplementation(({ method }: { method?: string }) => {
      if (method === 'POST') {
        attempts += 1;
        if (attempts === 1) return Promise.reject(failure(500));
        created = true;
        return Promise.resolve(draft);
      }
      return created ? Promise.resolve(draft) : Promise.reject(failure(404));
    });
    renderWithProviders(page);
    expect(await screen.findByRole('alert')).toBeVisible();
    expect(posts()).toHaveLength(1);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Retry' })).toBeEnabled());
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByDisplayValue('Test Consultant')).toBeVisible();
    expect(posts()).toHaveLength(2);
  });

  it('does not loop when the GET after successful creation still returns 404', async () => {
    request.mockImplementation(({ method }: { method?: string }) => method === 'POST' ? Promise.resolve(draft) : Promise.reject(failure(404)));
    const view = renderWithProviders(page);
    expect(await screen.findByRole('alert')).toBeVisible();
    view.rerender(<Provider store={view.store}><ThemeProvider theme={appTheme}><SnackbarProvider>{page}</SnackbarProvider></ThemeProvider></Provider>);
    expect(posts()).toHaveLength(1);
  });

  it('rechecks GET on Retry instead of duplicating a possibly successful timed-out POST', async () => {
    let exists = false;
    request.mockImplementation(({ method }: { method?: string }) => method === 'POST' ? Promise.reject(failure()) : exists ? Promise.resolve(draft) : Promise.reject(failure(404)));
    renderWithProviders(page);
    expect(await screen.findByRole('alert')).toBeVisible();
    exists = true;
    await waitFor(() => expect(screen.getByRole('button', { name: 'Retry' })).toBeEnabled());
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByDisplayValue('Test Consultant')).toBeVisible();
    expect(posts()).toHaveLength(1);
  });
});
