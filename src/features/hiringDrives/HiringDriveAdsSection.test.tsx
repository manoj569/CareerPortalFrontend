import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/apiClient';
import type { AuthState } from '@/features/auth/store/authSlice';
import { renderWithProviders } from '@/test/renderWithProviders';
import { UserRole } from '@/types';
import { HiringDriveAdsSection } from './HiringDriveAdsSection';
import { HiringDriveDetailsPage } from '@/pages/HiringDriveDetailsPage';

const drive = {
  id: 'home-ad-1',
  title: 'Graduate Software Engineer',
  subtitle: '2027 graduate hiring',
  badgeText: 'Applications open',
  badgeType: 'hiring',
  company: { id: 'company-1', name: 'Example Company', logoUrl: null },
  imageUrl: null,
  locationText: 'Remote',
  experienceText: '0-1 year',
  isSponsored: false,
  destination: { type: 'external', url: 'https://raw.example.test/apply' },
};
const candidateAuth: AuthState = {
  status: 'authenticated',
  user: {
    id: 'candidate-1',
    firstName: 'Test',
    lastName: 'Candidate',
    email: 'candidate@example.test',
    role: UserRole.Candidate,
  },
  isSubmitting: false,
  accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
  error: null,
};

const Location = () => {
  const location = useLocation();
  return <output data-testid="current-path">{location.pathname}</output>;
};

const mountAds = (placement: 'home' | 'dashboard' = 'home', auth?: AuthState) =>
  renderWithProviders(
    <MemoryRouter initialEntries={['/'] }>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Location />
              <HiringDriveAdsSection placement={placement} />
            </>
          }
        />
        <Route path="/login" element={<div>Login page</div>} />
        <Route path="/jobs/:slug" element={<div>Internal job page</div>} />
        <Route path="/dashboard/jobs/:slug" element={<div>Internal dashboard job page</div>} />
        <Route path="/hiring-drives/:id" element={<><Location /><HiringDriveDetailsPage /></>} />
        <Route path="/dashboard/hiring-drives/:id" element={<><Location /><HiringDriveDetailsPage /></>} />
      </Routes>
    </MemoryRouter>,
    auth ? { auth } : undefined,
  );

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Hiring Drive advertisement section', () => {
  it.each(['home', 'dashboard'] as const)(
    'loads the public home ad endpoint for the %s placement without auth state',
    async (placement) => {
      const request = vi
        .spyOn(apiClient, 'request')
        .mockResolvedValue({ data: { data: [drive] } });

      mountAds(placement);

      expect(await screen.findByText(drive.title)).toBeVisible();
      await waitFor(() =>
        expect(
          request.mock.calls.some(([config]) => config.url === '/public/hiring-drives/home'),
        ).toBe(true),
      );
      expect(request.mock.calls.some(([config]) => config.url === '/public/hiring-drives')).toBe(
        false,
      );
      expect(screen.queryByRole('heading', { name: 'CareerHarbor Login' })).not.toBeInTheDocument();
      expect(screen.queryByText('Sponsored')).not.toBeInTheDocument();
    },
  );

  it('hides the complete section when the endpoint returns no campaigns', async () => {
    vi.spyOn(apiClient, 'request').mockResolvedValue({ data: { data: [] } });
    mountAds();
    await waitFor(() =>
      expect(screen.queryByRole('region', { name: 'Hiring opportunities carousel' })).not.toBeInTheDocument(),
    );
    expect(screen.queryByRole('heading', { name: 'Hiring Opportunities' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Explore current hiring drives/)).not.toBeInTheDocument();
  });

  it.each(['home', 'dashboard'] as const)(
    'keeps the %s page usable when the public endpoint fails',
    async (placement) => {
    vi.spyOn(apiClient, 'request').mockRejectedValue(new Error('Unavailable'));
    mountAds(placement);
    expect(await screen.findByText(/Hiring opportunities are temporarily unavailable/)).toBeVisible();
    },
  );

  it('redirects anonymous public Apply to Login without click resolution', async () => {
    const request = vi.spyOn(apiClient, 'request').mockImplementation((config) =>
      Promise.resolve({
        data: {
          data:
            config.url === '/public/hiring-drives/home'
              ? [drive]
              : config.url === '/public/hiring-drives/home-ad-1'
                ? drive
                : { destinationType: 'external', url: 'https://careers.example.test/apply' },
        },
      }),
    );
    mountAds();
    const applyButton = await screen.findByRole('button', { name: `Apply now for ${drive.title}` });
    const carousel = screen.getByRole('region', { name: 'Hiring opportunities carousel' });
    expect(carousel).toHaveClass('hiring-ads-track-single');
    expect(
      screen.queryByRole('group', { name: 'Hiring opportunities pages' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Next hiring opportunities' }),
    ).not.toBeInTheDocument();
    fireEvent.click(applyButton);

    expect(await screen.findByText('Login page')).toBeInTheDocument();
    expect(
      request.mock.calls.filter(([config]) => config.url === '/public/hiring-drives/home'),
    ).toHaveLength(1);
    expect(
      request.mock.calls.filter(([config]) => config.url === '/public/hiring-drives/home-ad-1/click'),
    ).toHaveLength(0);
  });

  it('resolves authenticated dashboard Apply Now through the same public click endpoint', async () => {
    const request = vi.spyOn(apiClient, 'request').mockImplementation((config) =>
      Promise.resolve({
        data: {
          data:
            config.url === '/public/hiring-drives/home'
              ? [drive]
              : config.url === '/public/hiring-drives/home-ad-1'
                ? drive
                : { destinationType: 'external', url: 'https://careers.example.test/apply' },
        },
      }),
    );
    const externalOpen = vi.spyOn(window, 'open').mockReturnValue(null);

    mountAds('dashboard', candidateAuth);
    fireEvent.click(await screen.findByRole('button', { name: `Apply now for ${drive.title}` }));

    fireEvent.click(await screen.findByRole('button', { name: 'Apply Now' }));
    await waitFor(() => expect(externalOpen).toHaveBeenCalledOnce());
    expect(
      request.mock.calls.filter(([config]) => config.url === '/public/hiring-drives/home-ad-1/click'),
    ).toHaveLength(1);
    expect(screen.getByTestId('current-path')).toHaveTextContent('/dashboard/hiring-drives/home-ad-1');
  });

  it('does not click or open the raw URL for anonymous Apply', async () => {
    const request = vi.spyOn(apiClient, 'request').mockImplementation((config) =>
      config.url === '/public/hiring-drives/home'
        ? Promise.resolve({ data: { data: [drive] } })
        : Promise.reject(new Error('Unavailable')),
    );
    const externalOpen = vi.spyOn(window, 'open').mockReturnValue(null);
    mountAds();

    fireEvent.click(await screen.findByRole('button', { name: `Apply now for ${drive.title}` }));

    expect(await screen.findByText('Login page')).toBeInTheDocument();
    expect(externalOpen).not.toHaveBeenCalled();
    expect(request.mock.calls.filter(([config]) => config.url === '/public/hiring-drives/home-ad-1/click')).toHaveLength(0);
  });

  it('handles sparse campaign details without inventing optional information', async () => {
    const sparseDrive = {
      ...drive,
      subtitle: null,
      badgeText: null,
      company: null,
      imageUrl: null,
      locationText: null,
      experienceText: null,
    };
    vi.spyOn(apiClient, 'request').mockImplementation((config) => Promise.resolve({ data: { data: config.url === '/public/hiring-drives/home' ? [sparseDrive] : sparseDrive } }));
    mountAds();
    fireEvent.click(await screen.findByRole('button', { name: 'View Details' }));

    expect(await screen.findByRole('heading', { name: drive.title })).toBeVisible();
    expect(screen.queryByText('Example Company')).not.toBeInTheDocument();
    expect(screen.queryByText(/Experience:|Location:/)).not.toBeInTheDocument();
  });

  it('renders public campaign description and dates in View Details without counting an apply', async () => {
    const detailedDrive = {
      ...drive,
      description: 'Verified campaign description.',
      startAtUtc: '2026-10-22T00:00:00.000Z',
      endAtUtc: '2026-11-01T00:00:00.000Z',
    };
    const request = vi.spyOn(apiClient, 'request').mockImplementation((config) => Promise.resolve({ data: { data: config.url === '/public/hiring-drives/home' ? [detailedDrive] : detailedDrive } }));
    mountAds();
    await screen.findByText(drive.title);
    fireEvent.click(screen.getByRole('button', { name: 'View Details' }));
    expect(await screen.findByText('Verified campaign description.')).toBeVisible();
    expect(screen.getByText(/Starts/)).toBeVisible();
    expect(screen.getByText(/Ends/)).toBeVisible();
    expect(request.mock.calls.some(([config]) => config.url?.endsWith('/click'))).toBe(false);
  });

  it('shows pagination dots for multiple campaigns and scrolls to the selected card', async () => {
    vi.spyOn(apiClient, 'request').mockResolvedValue({
      data: { data: [drive, { ...drive, id: 'home-ad-2' }, { ...drive, id: 'home-ad-3' }] },
    });
    mountAds();
    await screen.findAllByText(drive.title);

    const track = screen.getByRole('region', { name: 'Hiring opportunities carousel' });
    const scrollTo = vi.fn();
    track.scrollTo = scrollTo;
    fireEvent.click(screen.getByRole('button', { name: 'Show hiring opportunity 3' }));

    expect(scrollTo).toHaveBeenCalledWith({ left: 0, behavior: 'smooth' });
  });

  it('navigates View Details without click analytics', async () => {
    const request = vi.spyOn(apiClient, 'request').mockImplementation((config) =>
      Promise.resolve({
        data: {
          data: config.url === '/public/hiring-drives/home'
            ? [drive]
            : config.url === '/public/hiring-drives/home-ad-1'
              ? drive
              : { destinationType: 'external', url: 'https://careers.example.test/apply' },
        },
      }),
    );
    mountAds();
    fireEvent.click(await screen.findByRole('button', { name: 'View Details' }));

    expect(await screen.findByRole('heading', { name: drive.title })).toBeVisible();
    expect(request.mock.calls.some(([config]) => config.url?.endsWith('/click'))).toBe(false);
    expect(screen.getByTestId('current-path')).toHaveTextContent('/hiring-drives/home-ad-1');
    expect(request.mock.calls.filter(([config]) => config.url === '/public/hiring-drives/home-ad-1/click')).toHaveLength(0);
  });

  it('deduplicates visible ad impressions through carousel and details rerenders', async () => {
    let visible!: IntersectionObserverCallback;
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          visible = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    const request = vi.spyOn(apiClient, 'request').mockImplementation((config) =>
      Promise.resolve(
        config.url === '/public/hiring-drives/impressions'
          ? { data: undefined, status: 204 }
          : { data: { data: [drive] } },
      ),
    );
    mountAds();
    await screen.findByText(drive.title);
    const entry = [{ isIntersecting: true, intersectionRatio: 0.8 }] as IntersectionObserverEntry[];

    act(() => visible(entry, {} as IntersectionObserver));
    fireEvent.click(screen.getByRole('button', { name: 'View Details' }));
    act(() => visible(entry, {} as IntersectionObserver));

    await waitFor(() =>
      expect(
        request.mock.calls.filter(
          ([config]) => config.url === '/public/hiring-drives/impressions',
        ),
      ).toHaveLength(1),
    );
  });
});
