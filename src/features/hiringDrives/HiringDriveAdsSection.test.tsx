import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/apiClient';
import type { AuthState } from '@/features/auth/store/authSlice';
import { renderWithProviders } from '@/test/renderWithProviders';
import { UserRole } from '@/types';
import { HiringDriveAdsSection } from './HiringDriveAdsSection';

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
    expect(screen.getByTestId('current-path')).toHaveTextContent('/');
    },
  );

  it('resolves anonymous direct Apply Now through the public click endpoint', async () => {
    const request = vi.spyOn(apiClient, 'request').mockImplementation((config) =>
      Promise.resolve({
        data: {
          data:
            config.url === '/public/hiring-drives/home'
              ? [drive]
              : { destinationType: 'external', url: 'https://careers.example.test/apply' },
        },
      }),
    );
    const externalOpen = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        expect(this.href).toBe('https://careers.example.test/apply');
        expect(this.rel).toBe('noopener noreferrer');
      });

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

    await waitFor(() => expect(externalOpen).toHaveBeenCalledOnce());
    expect(
      request.mock.calls.filter(([config]) => config.url === '/public/hiring-drives/home'),
    ).toHaveLength(1);
    expect(
      request.mock.calls.filter(([config]) => config.url === '/public/hiring-drives/home-ad-1/click'),
    ).toHaveLength(1);
    expect(screen.getByTestId('current-path')).toHaveTextContent('/');
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });

  it('resolves authenticated dashboard Apply Now through the same public click endpoint', async () => {
    const request = vi.spyOn(apiClient, 'request').mockImplementation((config) =>
      Promise.resolve({
        data: {
          data:
            config.url === '/public/hiring-drives/home'
              ? [drive]
              : { destinationType: 'external', url: 'https://careers.example.test/apply' },
        },
      }),
    );
    const externalOpen = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    mountAds('dashboard', candidateAuth);
    fireEvent.click(await screen.findByRole('button', { name: `Apply now for ${drive.title}` }));

    await waitFor(() => expect(externalOpen).toHaveBeenCalledOnce());
    expect(
      request.mock.calls.filter(([config]) => config.url === '/public/hiring-drives/home-ad-1/click'),
    ).toHaveLength(1);
    expect(screen.getByTestId('current-path')).toHaveTextContent('/');
  });

  it('stays on CareerHarbor and does not open the raw URL when click resolution fails', async () => {
    const request = vi.spyOn(apiClient, 'request').mockImplementation((config) =>
      config.url === '/public/hiring-drives/home'
        ? Promise.resolve({ data: { data: [drive] } })
        : Promise.reject(new Error('Unavailable')),
    );
    const externalOpen = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    mountAds();

    fireEvent.click(await screen.findByRole('button', { name: `Apply now for ${drive.title}` }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to open this opportunity');
    expect(externalOpen).not.toHaveBeenCalled();
    expect(request.mock.calls.filter(([config]) => config.url === '/public/hiring-drives/home-ad-1/click')).toHaveLength(1);
    expect(screen.getByTestId('current-path')).toHaveTextContent('/');
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
    vi.spyOn(apiClient, 'request').mockResolvedValue({ data: { data: [sparseDrive] } });
    mountAds();
    fireEvent.click(await screen.findByRole('button', { name: 'View Details' }));

    const dialog = await screen.findByRole('dialog', { name: drive.title });
    expect(within(dialog).getByText(drive.title)).toBeVisible();
    expect(within(dialog).queryByText('Example Company')).not.toBeInTheDocument();
    expect(within(dialog).queryByText(/Experience:|Location:/)).not.toBeInTheDocument();
  });

  it('renders public campaign description and dates in View Details without counting an apply', async () => {
    const detailedDrive = {
      ...drive,
      description: 'Verified campaign description.',
      startAtUtc: '2026-10-22T00:00:00.000Z',
      endAtUtc: '2026-11-01T00:00:00.000Z',
    };
    const request = vi.spyOn(apiClient, 'request').mockResolvedValue({ data: { data: [detailedDrive] } });
    mountAds();
    await screen.findByText(drive.title);
    fireEvent.click(screen.getByRole('button', { name: 'View Details' }));
    const dialog = await screen.findByRole('dialog', { name: drive.title });
    expect(within(dialog).getByText('Verified campaign description.')).toBeVisible();
    expect(within(dialog).getByText(/Campaign starts:/)).toBeVisible();
    expect(within(dialog).getByText(/Application deadline:/)).toBeVisible();
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

  it('opens details without click analytics and applies from details through the same resolver', async () => {
    const request = vi.spyOn(apiClient, 'request').mockImplementation((config) =>
      Promise.resolve({
        data: {
          data:
            config.url === '/public/hiring-drives/home'
              ? [drive]
              : { destinationType: 'external', url: 'https://careers.example.test/apply' },
        },
      }),
    );
    const externalOpen = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    mountAds();
    fireEvent.click(await screen.findByRole('button', { name: 'View Details' }));

    const dialog = await screen.findByRole('dialog', { name: drive.title });
    expect(within(dialog).getByText('Example Company')).toBeVisible();
    expect(within(dialog).getByText(drive.subtitle)).toBeVisible();
    expect(within(dialog).getByText('Experience: 0-1 year')).toBeVisible();
    expect(within(dialog).getByText('Location: Remote')).toBeVisible();
    expect(request.mock.calls.some(([config]) => config.url?.endsWith('/click'))).toBe(false);
    expect(screen.getByTestId('current-path')).toHaveTextContent('/');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close hiring drive details' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByTestId('current-path')).toHaveTextContent('/');

    fireEvent.click(screen.getByRole('button', { name: 'View Details' }));
    const reopened = await screen.findByRole('dialog', { name: drive.title });
    fireEvent.click(within(reopened).getByRole('button', { name: 'Apply Now' }));

    await waitFor(() => expect(externalOpen).toHaveBeenCalledOnce());
    expect(
      request.mock.calls.filter(([config]) => config.url === '/public/hiring-drives/home-ad-1/click'),
    ).toHaveLength(1);
    expect(screen.getByTestId('current-path')).toHaveTextContent('/');
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
