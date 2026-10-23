import { fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/apiClient';
import type { AuthState } from '@/features/auth/store/authSlice';
import { renderWithProviders } from '@/test/renderWithProviders';
import { UserRole } from '@/types';
import { HiringDriveDetailsPage } from './HiringDriveDetailsPage';

const drive = {
  id: 'drive-1', title: 'Graduate Engineer', subtitle: 'Early careers', badgeText: 'Hiring Now',
  badgeType: 'hiring', company: { id: 'co-1', name: 'Example Co', logoUrl: null }, imageUrl: null,
  locationText: 'Pune', experienceText: '0-1 year', isSponsored: false,
  description: 'First paragraph.\n\nSecond paragraph.', startAtUtc: '2026-01-01T00:00:00Z',
  endAtUtc: null, destination: { type: 'external', url: 'https://stale.example/apply' },
};
const authState = (authenticated: boolean): AuthState => ({
  status: authenticated ? 'authenticated' : 'unauthenticated',
  user: authenticated ? { id: 'candidate', firstName: 'Test', lastName: 'Candidate', email: 'test@example.test', role: UserRole.Candidate } : null,
  isSubmitting: false, accessTokenExpiresAtUtc: authenticated ? '2099-01-01T00:00:00Z' : null, error: null,
});
const renderPage = (path: string, authenticated = true) => renderWithProviders(
  <MemoryRouter initialEntries={[path]}><Routes>
    <Route path="/hiring-drives/:id" element={<HiringDriveDetailsPage />} />
    <Route path="/dashboard/hiring-drives/:id" element={<HiringDriveDetailsPage />} />
    <Route path="/login" element={<p>Login screen</p>} />
    <Route path="/dashboard/jobs/:slug" element={<p>Job slug: {window.location.pathname.split('/').at(-1)}</p>} />
  </Routes></MemoryRouter>, { auth: authState(authenticated) });

afterEach(() => vi.restoreAllMocks());

describe('HiringDriveDetailsPage', () => {
  it.each(['/hiring-drives/drive-1', '/dashboard/hiring-drives/drive-1'])('loads %s directly with the item API, not the collection', async (path) => {
    const request = vi.spyOn(apiClient, 'request').mockResolvedValue({ data: { data: drive } });
    renderPage(path);
    expect(await screen.findByRole('heading', { name: drive.title })).toBeInTheDocument();
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ url: '/public/hiring-drives/drive-1', method: 'GET' }));
    expect(request.mock.calls.some(([config]) => config.url === '/public/hiring-drives')).toBe(false);
    expect(screen.getByText('First paragraph.')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph.')).toBeInTheDocument();
    expect(screen.queryByText(/salary|work mode|requirements|employment type/i)).not.toBeInTheDocument();
  });

  it('shows a loading state and a distinct detail-load failure', async () => {
    let reject!: (error: Error) => void;
    vi.spyOn(apiClient, 'request').mockImplementation(() => new Promise((_resolve, rejectRequest) => { reject = rejectRequest; }));
    renderPage('/hiring-drives/drive-1');
    expect(screen.getByLabelText('Loading hiring opportunity')).toBeInTheDocument();
    reject(new Error('failed'));
    expect(await screen.findByText('Unable to load this hiring opportunity.')).toBeInTheDocument();
  });

  it('does not click before anonymous login and preserves the candidate detail return path', async () => {
    const request = vi.spyOn(apiClient, 'request').mockResolvedValue({ data: { data: drive } });
    renderPage('/hiring-drives/drive-1', false);
    fireEvent.click(await screen.findByRole('button', { name: 'Apply Now' }));
    expect(await screen.findByText('Login screen')).toBeInTheDocument();
    expect(request.mock.calls.some(([config]) => config.url?.includes('/click'))).toBe(false);
  });

  it('uses the authoritative click URL for authenticated public Apply', async () => {
    const request = vi.spyOn(apiClient, 'request').mockImplementation((config) => Promise.resolve({
      data: { data: config.url?.endsWith('/click') ? { destinationType: 'external', url: 'https://employer.example/apply' } : drive },
    }));
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    renderPage('/hiring-drives/drive-1', true);
    fireEvent.click(await screen.findByRole('button', { name: 'Apply Now' }));
    await waitFor(() => expect(open).toHaveBeenCalledWith('https://employer.example/apply', '_blank', 'noopener,noreferrer'));
    expect(request.mock.calls.filter(([config]) => config.url === '/public/hiring-drives/drive-1/click')).toHaveLength(1);
    expect(screen.queryByText('Login screen')).not.toBeInTheDocument();
  });

  it('shows Apply errors only after failure and permits a clean retry', async () => {
    let attempts = 0;
    const request = vi.spyOn(apiClient, 'request').mockImplementation((config) => {
      if (config.url?.endsWith('/click')) {
        attempts += 1;
        return attempts === 1 ? Promise.reject(new Error('failed')) : Promise.resolve({ data: { data: { destinationType: 'external', url: 'javascript:bad' } } });
      }
      return Promise.resolve({ data: { data: drive } });
    });
    renderPage('/dashboard/hiring-drives/drive-1');
    const apply = await screen.findByRole('button', { name: 'Apply Now' });
    expect(screen.queryByText('Unable to open this opportunity. Please try again.')).not.toBeInTheDocument();
    fireEvent.click(apply);
    expect(await screen.findByText('Unable to open this opportunity. Please try again.')).toBeInTheDocument();
    fireEvent.click(apply);
    await waitFor(() => expect(request.mock.calls.filter(([config]) => config.url?.endsWith('/click'))).toHaveLength(2));
    expect(screen.getByText('Unable to open this opportunity. Please try again.')).toBeInTheDocument();
  });
});
